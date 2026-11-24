export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";
import { allow, limiters } from "@/lib/ratelimit";
import { checkOrigin } from "@/lib/origin-check";
import { clientIp } from "@/lib/client-ip";

// GET ?region=<code> → the region's flat service fee (added to every quote there).
export async function GET(req: NextRequest) {
  const { error } = await requireApiRole("admin");
  if (error) return error;

  const regionCode = new URL(req.url).searchParams.get("region");
  if (!regionCode) {
    return NextResponse.json({ error: "Missing region" }, { status: 400 });
  }

  const region = await prisma.region.findUnique({ where: { code: regionCode } });
  if (!region) {
    return NextResponse.json({ error: "Invalid region" }, { status: 404 });
  }

  return NextResponse.json({ region: region.name, serviceFee: Number(region.serviceFee) });
}

// PATCH { regionCode, serviceFee } → set the region's service fee (0 = no fee).
export async function PATCH(req: NextRequest) {
  const { error } = await requireApiRole("admin");
  if (error) return error;

  const originError = checkOrigin(req);
  if (originError) return originError;

  if (!(await allow(limiters.adminPrices, clientIp(req)))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const { regionCode } = body ?? {};
  const serviceFee = Number(body?.serviceFee);

  if (!regionCode || body?.serviceFee === "" || !Number.isFinite(serviceFee) || serviceFee < 0) {
    return NextResponse.json({ error: "Fee must be a number of 0 or more." }, { status: 400 });
  }

  const region = await prisma.region.findUnique({ where: { code: regionCode } });
  if (!region) {
    return NextResponse.json({ error: "Invalid region" }, { status: 400 });
  }

  await prisma.region.update({ where: { id: region.id }, data: { serviceFee } });
  return NextResponse.json({ success: true, serviceFee });
}
