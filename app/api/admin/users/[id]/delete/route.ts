export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { prisma } from "../../../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.user.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}