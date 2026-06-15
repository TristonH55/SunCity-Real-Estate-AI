import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendLeadToCMS } from "@/lib/unity-crm";
import { resend } from "@/lib/resend";
import { escapeHtml } from "@/lib/escape-html";
import {
  CMS_ENQUIRY_TYPES,
  CMS_PROPERTY_TYPES,
  CMS_EXISTING_SYSTEM_TYPES,
  CMS_SYSTEM_LOCATIONS,
} from "@/lib/cms-mapping";

export type ConfirmationInput = {
  regionCode: string;
  systemId: string;
  agentId: string; // stored in the kept `insurerId` column
  extraIds: string[];
  basePriceExGst: number;
  extrasTotalExGst: number;
  subtotalExGst: number;
  gst: number;
  totalIncGst: number;
  customerSnapshot: Prisma.InputJsonValue;
  images?: string[];
};

/**
 * DB-only creation of the locked-order PricingConfirmation.
 * Runs inside the caller's Prisma transaction so the status-flip + create +
 * confirmationId link are atomic. Does NOT touch the CRM (external call).
 */
export function createPricingConfirmation(
  tx: Prisma.TransactionClient,
  input: ConfirmationInput
) {
  return tx.pricingConfirmation.create({
    data: {
      regionCode: input.regionCode,
      systemId: input.systemId,
      insurerId: input.agentId,
      extraIds: input.extraIds,
      basePriceExGst: input.basePriceExGst,
      extrasTotalExGst: input.extrasTotalExGst,
      subtotalExGst: input.subtotalExGst,
      gst: input.gst,
      totalIncGst: input.totalIncGst,
      customerSnapshot: input.customerSnapshot,
      images: input.images ?? [],
    },
  });
}

/**
 * Post-commit CRM push. Loads the confirmation by id, sends the lead, and on
 * success stamps `crmLeadSentAt`. On failure it leaves `crmLeadSentAt` null
 * (flagged for retry) and logs — it NEVER throws, so a CRM blip cannot roll
 * back or fail a real locked order. Reusable for a future retry trigger.
 */
export async function pushConfirmationToCMS(
  confirmationId: string,
  opts?: { userIp?: string }
): Promise<{ ok: boolean; reason?: string }> {
  try {
    const confirmation = await prisma.pricingConfirmation.findUnique({
      where: { id: confirmationId },
    });
    if (!confirmation) return { ok: false, reason: "not_found" };

    const customer = (confirmation.customerSnapshot ?? {}) as Record<
      string,
      any
    >;
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    await sendLeadToCMS({
      lead_data: {
        status: "d651",
        source: "2d2e",
        source_domain: process.env.NEXT_PUBLIC_BASE_URL || "localhost",
        source_url: `${base}/pricing`,
        user_ip: opts?.userIp ?? "127.0.0.1",
        utm_source: "App",
        utm_medium: "Agent App",
        enquiry_type: CMS_ENQUIRY_TYPES.new_system,
        property_type:
          CMS_PROPERTY_TYPES[
            customer.propertyType as keyof typeof CMS_PROPERTY_TYPES
          ],
        system_type:
          CMS_EXISTING_SYSTEM_TYPES[
            customer.existingSystemType as keyof typeof CMS_EXISTING_SYSTEM_TYPES
          ],
        system_location:
          CMS_SYSTEM_LOCATIONS[
            customer.systemLocation as keyof typeof CMS_SYSTEM_LOCATIONS
          ],
        enquiry: `Agent locked quote — confirmation #${confirmation.id}`,
        location: {
          address: customer.address || "",
          suburb: customer.suburb || "",
          postcode: customer.postcode || "",
        },
      },
      contact_data: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
    });

    await prisma.pricingConfirmation.update({
      where: { id: confirmationId },
      data: { crmLeadSentAt: new Date() },
    });
    return { ok: true };
  } catch (err) {
    console.error("[CRM] push failed for confirmation", confirmationId, err);
    return { ok: false, reason: "error" };
  }
}

/**
 * Post-commit staff "new order" notification email. Non-blocking; never throws.
 */
export async function sendOrderNotificationEmail(
  confirmationId: string
): Promise<void> {
  try {
    const confirmation = await prisma.pricingConfirmation.findUnique({
      where: { id: confirmationId },
    });
    if (!confirmation) return;

    const region = await prisma.region.findUnique({
      where: { code: confirmation.regionCode },
    });
    const system = await prisma.system.findUnique({
      where: { id: confirmation.systemId },
      select: { brand: true, model: true, capacityLitres: true },
    });
    const customer = (confirmation.customerSnapshot ?? {}) as Record<
      string,
      any
    >;
    const fmt = (n: number) =>
      n.toLocaleString("en-AU", { style: "currency", currency: "AUD" });
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "SunCity <no-reply@suncityhotwater.com.au>",
      to: process.env.ORDER_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL!,
      subject: `New Order / Lead – ${escapeHtml(customer.firstName)} ${escapeHtml(
        customer.lastName
      )} (${fmt(Number(confirmation.totalIncGst))})`.replace(/[\r\n]+/g, " "),
      html: `
        <h2>New Order / Lead Confirmed (locked quote)</h2>
        <h3>Customer</h3>
        <p>
          <strong>Name:</strong> ${escapeHtml(customer.firstName)} ${escapeHtml(customer.lastName)}<br/>
          <strong>Email:</strong> ${escapeHtml(customer.email)}<br/>
          <strong>Phone:</strong> ${escapeHtml(customer.phone)}<br/>
          <strong>Address:</strong> ${escapeHtml(customer.address || "")}<br/>
          <strong>Postcode:</strong> ${escapeHtml(customer.postcode || "")}<br/>
          <strong>Property type:</strong> ${escapeHtml(customer.propertyType || "")}<br/>
          <strong>Existing system:</strong> ${escapeHtml(customer.existingSystemType || "")}<br/>
          <strong>System location:</strong> ${escapeHtml(customer.systemLocation || "")}
        </p>
        <h3>System</h3>
        <p>
          <strong>Region:</strong> ${escapeHtml(region?.name ?? confirmation.regionCode)}<br/>
          <strong>System:</strong> ${escapeHtml(system?.brand ?? "")} ${escapeHtml(system?.model ?? "")} – ${escapeHtml(String(system?.capacityLitres ?? ""))}L
        </p>
        <h3>Price</h3>
        <p>
          <strong>Subtotal (ex GST):</strong> ${fmt(Number(confirmation.subtotalExGst))}<br/>
          <strong>GST:</strong> ${fmt(Number(confirmation.gst))}<br/>
          <strong>Total (inc GST):</strong> ${fmt(Number(confirmation.totalIncGst))}
        </p>
        <p><a href="${base}/dashboard/jobs/${confirmation.id}">Open job #${confirmation.id}</a></p>
      `,
    });
  } catch (err) {
    console.error("Order notification email failed:", err);
  }
}
