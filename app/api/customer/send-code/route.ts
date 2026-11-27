export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { allow, limiters } from "@/lib/ratelimit";
import { checkOrigin } from "@/lib/origin-check";
import { clientIp } from "@/lib/client-ip";
import { sendVerificationCode } from "@/lib/twilio-verify";
import { isValidEmail, normaliseAuMobile } from "@/lib/customer";

const TOO_MANY = "Too many codes requested. Please try again in an hour.";

// POST { mode, phone, email? } → texts a 6-digit code to the mobile.
//   signup: the mobile and email must not already have an account
//   login:  the mobile must belong to a customer account
//   change: a logged-in customer moving to a new mobile
export async function POST(req: NextRequest) {
  const originError = checkOrigin(req);
  if (originError) return originError;

  const body = await req.json().catch(() => ({}));
  const mode = body?.mode;
  if (mode !== "signup" && mode !== "login" && mode !== "change") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const phone = normaliseAuMobile(body?.phone);
  if (!phone) {
    return NextResponse.json(
      { error: "Please enter a valid Australian mobile number (04xx xxx xxx)." },
      { status: 400 }
    );
  }

  if (mode === "signup") {
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    const [byPhone, byEmail] = await Promise.all([
      prisma.user.findUnique({ where: { phone }, select: { id: true } }),
      prisma.user.findUnique({ where: { email }, select: { id: true } }),
    ]);
    if (byPhone || byEmail) {
      return NextResponse.json(
        {
          error: `That ${byPhone ? "mobile" : "email"} already has an account. Please log in instead.`,
          code: "exists",
        },
        { status: 409 }
      );
    }
  } else if (mode === "login") {
    const user = await prisma.user.findUnique({ where: { phone }, select: { role: true } });
    if (!user || user.role !== "customer") {
      return NextResponse.json(
        { error: "We couldn't find an account with that mobile. Please sign up first.", code: "missing" },
        { status: 404 }
      );
    }
  } else {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const taken = await prisma.user.findUnique({ where: { phone }, select: { id: true } });
    if (taken) {
      const same = taken.id === session.user.id;
      return NextResponse.json(
        { error: same ? "That's already your mobile number." : "That mobile already has an account." },
        { status: 409 }
      );
    }
  }

  // Hidden limits (protect the SMS bill): per mobile and per device/IP.
  if (
    !(await allow(limiters.smsPhone, phone)) ||
    !(await allow(limiters.smsIp, clientIp(req)))
  ) {
    return NextResponse.json({ error: TOO_MANY, code: "limit" }, { status: 429 });
  }

  try {
    const sent = await sendVerificationCode(phone);
    if (!sent) {
      return NextResponse.json(
        { error: "We couldn't send a code to that mobile. Please check the number and try again." },
        { status: 400 }
      );
    }
  } catch (e) {
    console.error("send-code failed:", e);
    return NextResponse.json({ error: "We couldn't send a code right now. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
