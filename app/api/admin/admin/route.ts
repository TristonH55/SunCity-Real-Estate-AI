import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApprovalToken } from "@/lib/approval-token";
import { sendMail } from "@/lib/mailer";

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

  await sendMail({
    to: user.email,
    subject: "Your SunCity account has been approved",
    html: `
      <p>Your insurer account has been approved.</p>
      <p>You can now log in and access pricing.</p>
    `,
  });

  return NextResponse.json({ success: true });
}
