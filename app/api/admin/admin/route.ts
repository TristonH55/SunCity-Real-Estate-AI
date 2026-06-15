export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApprovalToken } from "@/lib/approval-token";
import { resend } from "@/lib/resend";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const userId = verifyApprovalToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { approved: true },
  });

  // Non-blocking: approval already persisted; don't fail if the email errors.
  // Uses Resend (same as the admin approval email) — no SMTP needed.
  try {
    await resend.emails.send({
      from:
        process.env.EMAIL_FROM || "SunCity <no-reply@suncityhotwater.com.au>",
      to: user.email,
      subject: "Your SunCity account has been approved",
      html: `
        <p>Your agent account has been approved.</p>
        <p>You can now log in and start generating quotes.</p>
      `,
    });
  } catch (e) {
    console.error("Approval notification email failed (non-blocking):", e);
  }

  return NextResponse.json({ success: true });
}
