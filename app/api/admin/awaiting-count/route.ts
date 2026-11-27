export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";

// GET → number of approved quotes waiting for admin to confirm (menu badge).
export async function GET() {
  const { error } = await requireApiRole("admin");
  if (error) return error;
  const count = await prisma.quote.count({ where: { status: "approved" } });
  return NextResponse.json({ count });
}
