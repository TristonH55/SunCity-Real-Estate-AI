export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";
import { allow, limiters } from "@/lib/ratelimit";
import { checkOrigin } from "@/lib/origin-check";
import { clientIp } from "@/lib/client-ip";
import { withLogEntry } from "@/lib/quote-adjust";
import { resend } from "@/lib/resend";
import { isValidEmail, OFFICE_PHONE } from "@/lib/customer";

// POST → admin cancels a quote (homeowner not going ahead). A cancelled quote
// can't be approved, edited or confirmed. Confirmed (locked) quotes can't be
// cancelled here. No email, no CRM.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireApiRole("admin");
  if (error) return error;
  const originError = checkOrigin(req);
  if (originError) return originError;
  if (!(await allow(limiters.adminPrices, clientIp(req)))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const notify = body?.notify === true;
  const quote = await prisma.quote.findUnique({
    where: { id },
    select: { status: true, customerSnapshot: true, agent: { select: { role: true } } },
  });
  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }
  if (quote.status === "locked") {
    return NextResponse.json(
      { error: "This order is already confirmed and can't be cancelled here." },
      { status: 409 }
    );
  }
  if (quote.status === "cancelled") {
    return NextResponse.json({ success: true });
  }

  const snapshot = (quote.customerSnapshot ?? {}) as Record<string, any>;
  await prisma.quote.update({
    where: { id },
    data: {
      status: "cancelled",
      customerSnapshot: {
        ...snapshot,
        changeLog: withLogEntry(
          snapshot,
          session!.user.email,
          (quote.status === "approved" ? "Cancelled quote (homeowner had approved)" : "Cancelled quote") +
            (notify ? " · homeowner emailed" : "")
        ),
      },
    },
  });

  // Optional "your quote was cancelled" email (tick box in the pop-up).
  // Non-blocking: the cancel stands even if the email fails.
  let emailed = false;
  if (notify) {
    const to = String(snapshot.email ?? "").trim();
    if (isValidEmail(to)) {
      try {
        await sendCancelEmail({
          to,
          firstName: snapshot.firstName,
          address: snapshot.address,
          forCustomer: quote.agent.role === "customer",
        });
        emailed = true;
      } catch (e) {
        console.error("Cancel email failed (non-blocking):", e);
      }
    }
  }

  return NextResponse.json({ success: true, emailed });
}

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function sendCancelEmail({
  to,
  firstName,
  address,
  forCustomer,
}: {
  to: string;
  firstName?: string;
  address?: string;
  forCustomer: boolean;
}) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  // Public customers can get a new quote themselves; agents' homeowners go via their agent.
  const next = forCustomer
    ? `If you'd like to go ahead after all, call us on ${OFFICE_PHONE}, or
       <a href="${base}/pricing">submit another quote</a>.`
    : `If you'd like to go ahead after all, call us on ${OFFICE_PHONE}, or ask your agent
       for a new quote.`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "SunCity <no-reply@suncityhotwater.com.au>",
    to,
    subject: "Your SunCity hot water quote has been cancelled",
    html: `
      <p>Hi ${esc(firstName || "there")},</p>
      <p>Your SunCity hot water quote${address ? ` for <strong>${esc(address)}</strong>` : ""} has been cancelled.</p>
      <p>${next}</p>
      <p>Thanks,<br/>SunCity Hot Water</p>
    `,
  });
}
