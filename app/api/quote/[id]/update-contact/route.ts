export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";
import { allow, limiters } from "@/lib/ratelimit";
import { checkOrigin } from "@/lib/origin-check";
import { clientIp } from "@/lib/client-ip";

// Lets the owning agent (or admin) correct the homeowner's email and/or phone on
// a quote — a fallback if the customer's contact details changed. Updates
// customerSnapshot so the corrected details flow through to the lock-time
// confirmation/CRM.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Agents only (admins pass). This route is outside the middleware matcher.
  const { session, error } = await requireApiRole("agent");
  if (error) return error;

  const originError = checkOrigin(req);
  if (originError) return originError;

  const { id } = await params;

  try {
    if (!(await allow(limiters.updateContact, clientIp(req)))) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const emailProvided = typeof body?.email === "string";
    const phoneProvided = typeof body?.phone === "string";
    const email = emailProvided ? String(body.email).trim() : undefined;
    const phone = phoneProvided ? String(body.phone).trim() : undefined;

    if (email === undefined && phone === undefined) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }
    if (
      email !== undefined &&
      (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (phone !== undefined && !phone) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
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
    const next = { ...snapshot };
    if (email !== undefined) next.email = email;
    if (phone !== undefined) next.phone = phone;

    await prisma.quote.update({
      where: { id },
      data: { customerSnapshot: next },
    });

    return NextResponse.json({
      success: true,
      email: next.email,
      phone: next.phone,
    });
  } catch (err: any) {
    console.error("update-contact failed:", err?.message || err);
    return NextResponse.json(
      { error: "Internal server error – check logs" },
      { status: 500 }
    );
  }
}
