export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";
import { allow, limiters } from "@/lib/ratelimit";
import { checkOrigin } from "@/lib/origin-check";
import { clientIp } from "@/lib/client-ip";

const VALID_TYPES = [
  "electric",
  "heat_pump",
  "solar_thermosiphon",
  "solar_split",
] as const;

// GET ?region=<code>&type=<systemType> → every active system of that type with
// its current price for the region (price is null if none set yet).
export async function GET(req: NextRequest) {
  const { error } = await requireApiRole("admin");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const regionCode = searchParams.get("region");
  const systemType = searchParams.get("type");

  if (!regionCode || !systemType) {
    return NextResponse.json({ error: "Missing region or type" }, { status: 400 });
  }
  if (!VALID_TYPES.includes(systemType as (typeof VALID_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const region = await prisma.region.findUnique({ where: { code: regionCode } });
  if (!region) {
    return NextResponse.json({ error: "Invalid region" }, { status: 404 });
  }

  const systems = await prisma.system.findMany({
    where: { systemType: systemType as any, active: true },
    include: {
      systemPrices: { where: { regionId: region.id }, select: { price: true } },
    },
    orderBy: [{ brand: "asc" }, { capacityLitres: "asc" }],
  });

  const result = systems.map((s) => ({
    systemId: s.id,
    brand: s.brand,
    model: s.model,
    capacityLitres: s.capacityLitres,
    tankMaterial: s.tankMaterial,
    price: s.systemPrices[0] ? Number(s.systemPrices[0].price) : null,
  }));

  return NextResponse.json({ region: region.name, systems: result });
}

// PATCH { regionCode, updates: [{ systemId, price }] } → set each system's price
// for the region (update existing SystemPrice, or create if missing).
export async function PATCH(req: NextRequest) {
  const { error } = await requireApiRole("admin");
  if (error) return error;

  const originError = checkOrigin(req);
  if (originError) return originError;

  if (!(await allow(limiters.adminPrices, clientIp(req)))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const { regionCode, updates } = body ?? {};

  if (!regionCode || !Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "Missing regionCode or updates" }, { status: 400 });
  }

  const region = await prisma.region.findUnique({ where: { code: regionCode } });
  if (!region) {
    return NextResponse.json({ error: "Invalid region" }, { status: 400 });
  }

  // Validate every row first (all-or-nothing).
  for (const u of updates) {
    const price = Number(u?.price);
    if (!u?.systemId || !Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: `Invalid price for system ${u?.systemId ?? "?"}` },
        { status: 400 }
      );
    }
  }

  let updated = 0;
  for (const u of updates) {
    const price = Number(u.price);
    const existing = await prisma.systemPrice.findFirst({
      where: { systemId: u.systemId, regionId: region.id },
    });
    if (existing) {
      await prisma.systemPrice.update({ where: { id: existing.id }, data: { price } });
    } else {
      await prisma.systemPrice.create({
        data: { systemId: u.systemId, regionId: region.id, price },
      });
    }
    updated++;
  }

  return NextResponse.json({ success: true, updated });
}
