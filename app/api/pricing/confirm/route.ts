///TESTING 
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";
import { sendLeadToCMS } from "@/lib/unity-crm";
import {
  CMS_ENQUIRY_TYPES,
  CMS_PROPERTY_TYPES,
  CMS_EXISTING_SYSTEM_TYPES,
  CMS_SYSTEM_LOCATIONS,
} from "@/lib/cms-mapping";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { regionCode, systemId, extraIds = [], customer } = body;

    // ✅ NEW — NORMALISE ADDRESS (Google Places safe)
    const fullAddress =
      customer.address ||
      customer.fullAddress ||
      `${customer.street || ""} ${customer.suburb || ""} ${customer.postcode || ""}`.trim();

    console.log("🔥 CUSTOMER TYPE:", typeof customer);
    console.log("🔥 CUSTOMER VALUE:", customer);
    console.log("🔥 FULL ADDRESS:", fullAddress);

    if (!regionCode || !systemId || !customer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "postcode",
      "propertyType",
      "existingSystemType",
      "systemLocation",
    ];

    for (const field of requiredFields) {
      if (!customer[field]?.trim()) {
        return NextResponse.json(
          { error: `Missing customer field: ${field}` },
          { status: 400 }
        );
      }
    }

    const region = await prisma.region.findUnique({
      where: { code: regionCode },
    });
    if (!region) return NextResponse.json({ error: "Invalid region" }, { status: 400 });

    const system = await prisma.system.findUnique({
      where: { id: systemId },
    });
    if (!system) return NextResponse.json({ error: "System not found" }, { status: 404 });

    const systemPrice = await prisma.systemPrice.findFirst({
      where: { systemId, regionId: region.id },
    });
    if (!systemPrice)
      return NextResponse.json({ error: "System price not found" }, { status: 404 });

    const extras = await prisma.extraPrice.findMany({
      where: { regionId: region.id, extraId: { in: extraIds } },
    });

    const basePrice = Number(systemPrice.price);
    const extrasTotal = extras.reduce((sum, e) => sum + Number(e.price), 0);
    const subtotalExGst = basePrice + extrasTotal;
    const gst = subtotalExGst * 0.1;
    const totalIncGst = subtotalExGst + gst;

    // ✅ SAVE CONFIRMATION (FIXED SNAPSHOT)
    const confirmation = await prisma.pricingConfirmation.create({
      data: {
        regionCode,
        systemId,
        extraIds,
        basePriceExGst: basePrice,
        extrasTotalExGst: extrasTotal,
        subtotalExGst,
        gst,
        totalIncGst,

        // ✅ FIX — STORE FULL ADDRESS
        customerSnapshot: {
          ...customer,
          address: fullAddress,
        },

        insurerId: session?.user?.id || null,
      },
    });

    // ✅ NOTIFY STAFF OF NEW ORDER / LEAD (non-blocking — order is already saved)
    try {
      const confirmationUrl = `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/pricing/confirmation/${confirmation.id}`;

      const fmt = (n: number) =>
        n.toLocaleString("en-AU", { style: "currency", currency: "AUD" });

      await resend.emails.send({
        from: "SunCity <no-reply@suncityhotwater.com.au>",
        to: process.env.ORDER_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL!,
        subject: `New Order / Lead – ${customer.firstName} ${customer.lastName} (${fmt(
          totalIncGst
        )})`,
        html: `
          <h2>New Order / Lead Confirmed</h2>

          <h3>Customer</h3>
          <p>
            <strong>Name:</strong> ${customer.firstName} ${customer.lastName}<br/>
            <strong>Email:</strong> ${customer.email}<br/>
            <strong>Phone:</strong> ${customer.phone}<br/>
            <strong>Address:</strong> ${fullAddress}<br/>
            <strong>Postcode:</strong> ${customer.postcode}<br/>
            <strong>Property type:</strong> ${customer.propertyType}<br/>
            <strong>Existing system:</strong> ${customer.existingSystemType}<br/>
            <strong>System location:</strong> ${customer.systemLocation}
          </p>

          <h3>System</h3>
          <p>
            <strong>Region:</strong> ${region.name} (${region.code})<br/>
            <strong>System:</strong> ${system.brand} ${system.model} – ${system.capacityLitres}L
          </p>

          <h3>Price breakdown</h3>
          <p>
            <strong>Base (ex GST):</strong> ${fmt(basePrice)}<br/>
            <strong>Extras (ex GST):</strong> ${fmt(extrasTotal)}<br/>
            <strong>Subtotal (ex GST):</strong> ${fmt(subtotalExGst)}<br/>
            <strong>GST:</strong> ${fmt(gst)}<br/>
            <strong>Total (inc GST):</strong> ${fmt(totalIncGst)}
          </p>

          <p><a href="${confirmationUrl}">View confirmation #${confirmation.id}</a></p>
        `,
      });

      console.log("✅ Order notification email sent");
    } catch (emailErr) {
      console.error("❌ Order notification email failed:", emailErr);
      // non-blocking — order is already saved, continue
    }

    // ✅ SEND FULL ADDRESS TO CMS
    await sendLeadToCMS({
      lead_data: {
        status: "d651",
        source: "2d2e",
        source_domain: process.env.NEXT_PUBLIC_BASE_URL || "localhost",
        source_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/pricing`,
        user_ip: req.headers.get("x-forwarded-for") ?? "127.0.0.1",
        utm_source: "App",
        utm_medium: "Insurer App",
        enquiry_type: CMS_ENQUIRY_TYPES.new_system,
        property_type:
          CMS_PROPERTY_TYPES[customer.propertyType as keyof typeof CMS_PROPERTY_TYPES],
        system_type:
          CMS_EXISTING_SYSTEM_TYPES[
            customer.existingSystemType as keyof typeof CMS_EXISTING_SYSTEM_TYPES
          ],
        system_location:
          CMS_SYSTEM_LOCATIONS[
            customer.systemLocation as keyof typeof CMS_SYSTEM_LOCATIONS
          ],

        enquiry: `Insurer price confirmation #${confirmation.id}`,

        // ✅ FIXED LOCATION
        location: {
          address: fullAddress,
          suburb: customer.suburb || "",
          postcode: customer.postcode,
        },
      },
      contact_data: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
    });

    return NextResponse.json({
      success: true,
      confirmationId: confirmation.id,
    });
  } catch (err: any) {
    console.error("Confirm route failed:", err.message || err);
    return NextResponse.json(
      { error: "Internal server error – check logs" },
      { status: 500 }
    );
  }
}