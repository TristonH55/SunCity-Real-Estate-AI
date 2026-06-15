export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";

// Lets the owning agent (or admin) correct the homeowner's email on a quote —
// a fallback if the customer's email changed. Updates customerSnapshot.email so
// the corrected address flows through to the lock-time confirmation/CRM.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Agents only (admins pass). This route is outside the middleware matcher.
  const { session, error } = await requireApiRole("agent");
  if (error) return error;

  const { id } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
      select: { agentId: true, customerSnapshot: true },
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

    const snapshot = (quote.customerSnapshot ?? {}) as Record<string, any>;

    await prisma.quote.update({
      where: { id },
      data: { customerSnapshot: { ...snapshot, email } },
    });

    return NextResponse.json({ success: true, email });
  } catch (err: any) {
    console.error("update-contact failed:", err?.message || err);
    return NextResponse.json(
      { error: "Internal server error – check logs" },
      { status: 500 }
    );
  }
}
