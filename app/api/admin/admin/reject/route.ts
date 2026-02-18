import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApprovalToken } from "@/lib/approval-token";

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

  await prisma.user.delete({
    where: { id: userId },
  });

  return NextResponse.json({ success: true });
}
