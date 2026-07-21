export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";
import { allow, limiters } from "@/lib/ratelimit";
import { checkOrigin } from "@/lib/origin-check";
import { clientIp } from "@/lib/client-ip";

// PATCH { extraId, infoText?, brochureUrl? } → set an add-on's info text and/or
// brochure link (global — not region-specific). Empty string clears the field.
export async function PATCH(req: NextRequest) {
  const { error } = await requireApiRole("admin");
  if (error) return error;

  const originError = checkOrigin(req);
  if (originError) return originError;

  if (!(await allow(limiters.adminPrices, clientIp(req)))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const { extraId, infoText, brochureUrl } = body ?? {};

  if (!extraId) {
    return NextResponse.json({ error: "Missing extraId" }, { status: 400 });
  }

  const data: { infoText?: string | null; brochureUrl?: string | null } = {};
  if (infoText !== undefined) data.infoText = infoText === "" ? null : String(infoText);
  if (brochureUrl !== undefined) data.brochureUrl = brochureUrl === "" ? null : String(brochureUrl);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await prisma.extra.update({ where: { id: extraId }, data });
  return NextResponse.json({ success: true });
}
