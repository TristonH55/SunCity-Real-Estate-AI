export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";
import { checkOrigin } from "@/lib/origin-check";
import { allow, limiters } from "@/lib/ratelimit";
import { clientIp } from "@/lib/client-ip";
import { checkVerificationCode } from "@/lib/twilio-verify";
import {
  displayAuMobile,
  isValidEmail,
  normaliseAuMobile,
  splitName,
} from "@/lib/customer";

async function customerOnly() {
  const { session, error } = await requireApiRole("customer");
  if (error) return { error };
  // Admins pass requireApiRole; this route is for customer accounts only.
  if (session!.user.role !== "customer") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { userId: session!.user.id };
}

// GET → the logged-in customer's details (pre-fills the quote form).
export async function GET() {
  const g = await customerOnly();
  if ("error" in g) return g.error;
  const user = await prisma.user.findUnique({
    where: { id: g.userId },
    select: { name: true, email: true, phone: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...splitName(user.name),
    email: user.email,
    phone: displayAuMobile(user.phone),
  });
}

// PATCH { firstName, lastName, email } → update name/email.
// PATCH { phone, code } → move to a new mobile (code texted via send-code "change").
export async function PATCH(req: NextRequest) {
  const originError = checkOrigin(req);
  if (originError) return originError;
  const g = await customerOnly();
  if ("error" in g) return g.error;

  const body = await req.json().catch(() => ({}));

  if (body?.phone !== undefined) {
    const phone = normaliseAuMobile(body.phone);
    const code = String(body?.code ?? "").trim();
    if (!phone || !code) {
      return NextResponse.json({ error: "Please enter the code we texted you." }, { status: 400 });
    }
    if (!(await allow(limiters.codeCheck, `${clientIp(req)}:${phone}`))) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }
    if (!(await checkVerificationCode(phone, code))) {
      return NextResponse.json({ error: "That code isn't right or has expired." }, { status: 400 });
    }
    const taken = await prisma.user.findUnique({ where: { phone }, select: { id: true } });
    if (taken && taken.id !== g.userId) {
      return NextResponse.json({ error: "That mobile already has an account." }, { status: 409 });
    }
    await prisma.user.update({
      where: { id: g.userId },
      data: { phone, phoneVerifiedAt: new Date() },
    });
    return NextResponse.json({ success: true, phone: displayAuMobile(phone) });
  }

  const firstName = String(body?.firstName ?? "").trim();
  const lastName = String(body?.lastName ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!firstName || !lastName) {
    return NextResponse.json({ error: "Please enter your first and last name." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  const other = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (other && other.id !== g.userId) {
    return NextResponse.json({ error: "That email is already used by another account." }, { status: 409 });
  }
  await prisma.user.update({
    where: { id: g.userId },
    data: { name: `${firstName} ${lastName}`.slice(0, 120), email },
  });
  return NextResponse.json({ success: true });
}
