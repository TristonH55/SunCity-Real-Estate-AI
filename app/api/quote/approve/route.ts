export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyQuoteApprovalToken } from "@/lib/quote-approval-token";
import { allow, limiters } from "@/lib/ratelimit";
import { checkOrigin } from "@/lib/origin-check";
import { clientIp } from "@/lib/client-ip";

// PUBLIC, token-authenticated (NO session). The homeowner records their choice
// + typed-name e-signature. Record-only: does NOT lock or push to CRM — the
// agent finalises via the lock route.
export async function POST(req: NextRequest) {
  try {
    const originError = checkOrigin(req);
    if (originError) return originError;
    if (!(await allow(limiters.approve, clientIp(req)))) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { token, selectedOptionId, name } = body ?? {};

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }
    const quoteId = verifyQuoteApprovalToken(String(token));
    if (!quoteId) {
      return NextResponse.json(
        { error: "This approval link is invalid or has expired." },
        { status: 400 }
      );
    }

    const fullName = String(name ?? "").trim();
    if (!fullName) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 }
      );
    }
    if (!selectedOptionId) {
      return NextResponse.json(
        { error: "Please select a system." },
        { status: 400 }
      );
    }

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { options: { select: { id: true } } },
    });
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }
    if (quote.status === "locked") {
      return NextResponse.json(
        { error: "This quote has already been confirmed." },
        { status: 409 }
      );
    }
    if (!quote.options.some((o) => o.id === selectedOptionId)) {
      return NextResponse.json(
        { error: "That option is not part of this quote." },
        { status: 400 }
      );
    }

    const ip = clientIp(req);

    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: "approved",
        selectedOptionId,
        approvedByName: fullName,
        approvedAt: new Date(),
        approvalIp: ip,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("quote approve failed:", err?.message || err);
    return NextResponse.json(
      { error: "Something went wrong – please try again." },
      { status: 500 }
    );
  }
}
