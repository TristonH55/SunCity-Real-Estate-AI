export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";
import { sendQuoteEmail } from "@/lib/send-quote-email";
import { allow, limiters } from "@/lib/ratelimit";
import { checkOrigin } from "@/lib/origin-check";
import { clientIp } from "@/lib/client-ip";

// Emails the homeowner the 3-option quote PDF (attached). Recipient is the
// homeowner email currently on the quote (editable via the pencil). Homeowner only.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Agents only (admins pass). Route is outside the middleware matcher.
  const { session, error } = await requireApiRole("agent");
  if (error) return error;

  const originError = checkOrigin(req);
  if (originError) return originError;

  const { id } = await params;

  try {
    if (!(await allow(limiters.sendEmail, `${id}:${clientIp(req)}`))) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
      select: { agentId: true, status: true, customerSnapshot: true, agent: { select: { role: true } } },
    });
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (quote.status === "cancelled") {
      return NextResponse.json(
        { error: "This quote has been cancelled, so it can't be emailed." },
        { status: 409 }
      );
    }

    // Per-agent ownership.
    const isOwner = quote.agentId === session!.user.id;
    const isAdmin = session!.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const customer = (quote.customerSnapshot ?? {}) as Record<string, any>;
    const email = String(customer.email ?? "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "No valid homeowner email on this quote" },
        { status: 400 }
      );
    }

    const sent = await sendQuoteEmail({
      quoteId: id,
      to: email,
      firstName: customer.firstName,
      // Public customer quotes point them at the office, not an agent.
      forCustomer: quote.agent.role === "customer",
    });
    if (!sent) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, sentTo: email });
  } catch (err: any) {
    console.error("send-email failed:", err?.message || err);
    return NextResponse.json(
      { error: "Failed to send email – check email configuration." },
      { status: 500 }
    );
  }
}
