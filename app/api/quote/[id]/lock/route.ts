export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";
import {
  createPricingConfirmation,
  pushConfirmationToCMS,
  sendOrderNotificationEmail,
} from "@/lib/create-confirmation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔒 Agents only (admins pass). This route is OUTSIDE the middleware matcher.
  const { session, error } = await requireApiRole("agent");
  if (error) return error;

  const { id } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const selectedOptionId = body?.selectedOptionId;
    if (!selectedOptionId) {
      return NextResponse.json(
        { error: "Missing selectedOptionId" },
        { status: 400 }
      );
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { options: true },
    });
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Per-agent ownership.
    const isOwner = quote.agentId === session!.user.id;
    const isAdmin = session!.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const option = quote.options.find((o) => o.id === selectedOptionId);
    if (!option) {
      return NextResponse.json(
        { error: "selectedOptionId does not belong to this quote" },
        { status: 400 }
      );
    }

    // Idempotency: already locked → no-op, return the existing confirmation.
    if (quote.status === "locked") {
      return NextResponse.json({
        success: true,
        alreadyLocked: true,
        confirmationId: quote.confirmationId,
      });
    }

    // DB-only transaction: conditional flip + create confirmation + link.
    // No external calls inside — cannot time out or duplicate on a CRM blip.
    const txResult = await prisma.$transaction(async (tx) => {
      const flip = await tx.quote.updateMany({
        where: { id, status: { in: ["presented", "approved"] } },
        data: {
          status: "locked",
          selectedOptionId,
          lockedAt: new Date(),
        },
      });
      if (flip.count === 0) {
        // Lost the race — another request locked it first.
        return { flipped: false as const };
      }

      const confirmation = await createPricingConfirmation(tx, {
        regionCode: quote.regionCode,
        systemId: option.systemId,
        agentId: quote.agentId,
        extraIds: quote.extraIds,
        basePriceExGst: Number(option.basePriceExGst),
        extrasTotalExGst: Number(option.extrasTotalExGst),
        subtotalExGst: Number(option.subtotalExGst),
        gst: Number(option.gst),
        totalIncGst: Number(option.totalIncGst),
        customerSnapshot: quote.customerSnapshot as any,
      });

      await tx.quote.update({
        where: { id },
        data: { confirmationId: confirmation.id },
      });

      return { flipped: true as const, confirmationId: confirmation.id };
    });

    if (!txResult.flipped) {
      const fresh = await prisma.quote.findUnique({
        where: { id },
        select: { confirmationId: true },
      });
      return NextResponse.json({
        success: true,
        alreadyLocked: true,
        confirmationId: fresh?.confirmationId ?? null,
      });
    }

    // Post-commit (outside the transaction): push CRM + staff email.
    // A CRM failure leaves crmLeadSentAt null for retry; the order is NOT rolled back.
    const userIp = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const crm = await pushConfirmationToCMS(txResult.confirmationId, { userIp });
    await sendOrderNotificationEmail(txResult.confirmationId);

    return NextResponse.json({
      success: true,
      confirmationId: txResult.confirmationId,
      crmSent: crm.ok,
    });
  } catch (err: any) {
    console.error("Lock route failed:", err?.message || err);
    return NextResponse.json(
      { error: "Internal server error – check logs" },
      { status: 500 }
    );
  }
}
