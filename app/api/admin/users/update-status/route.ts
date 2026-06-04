export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";

export async function POST(req: NextRequest) {
  // 🔒 Admin only
  const { error } = await requireApiRole("admin");
  if (error) return error;

  const body = await req.json();

  const { userId, approved } = body;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { approved },
  });

  return NextResponse.json({ success: true });
}