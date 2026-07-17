export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";
import { allow, limiters } from "@/lib/ratelimit";
import { checkOrigin } from "@/lib/origin-check";
import { clientIp } from "@/lib/client-ip";

const VALID_TYPES = [
  "gas",
  "electric",
  "heat_pump",
  "solar_thermosiphon",
  "solar_split",
] as const;

// Mirrors app/api/pricing/extras/route.ts: which add-ons apply to a given
// system type + region. Kept in sync so the admin editor lists exactly the
// add-ons an agent sees in Step 3.
function extraApplies(code: string, systemType: string, regionCode: string): boolean {
  // Cyclone frames: solar subtype + region specific.
  if (code === "cyclone_frame_thermo") {
    return systemType === "solar_thermosiphon" && regionCode === "wide_bay";
  }
  if (code === "cyclone_frame_split") {
    return systemType === "solar_split" && regionCode === "wide_bay";
  }
  // Flat roof frames: solar subtype specific.
  if (code === "flat_roof_frame_thermo") {
    return systemType === "solar_thermosiphon";
  }
  if (code === "flat_roof_frame_split") {
    return systemType === "solar_split";
  }
  // Safe tray hidden for heat pumps only.
  if (code === "safe_tray_mildred_valve" && systemType === "heat_pump") {
    return false;
  }
  // Both solar subtypes map to "solar", so keep subtype-only add-ons apart.
  if (code.endsWith("_thermosiphon")) {
    return systemType === "solar_thermosiphon";
  }
  if (code.endsWith("_split")) {
    return systemType === "solar_split";
  }
  return true;
}

// GET ?region=<code>&type=<systemType> → every applicable add-on (Extra) with
// its current price for the region (price is null if none set yet). Queries
// Extra (not ExtraPrice) so unpriced add-ons still show and can be set.
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

  // Both solar subtypes are stored as "solar" on the Extra rows.
  const effectiveSystemType =
    systemType === "solar_thermosiphon" || systemType === "solar_split"
      ? "solar"
      : systemType;

  const extras = await prisma.extra.findMany({
    where: {
      active: true,
      OR: [{ systemType: effectiveSystemType as any }, { systemType: "all" }],
    },
    include: {
      prices: { where: { regionId: region.id }, select: { price: true } },
    },
    orderBy: { name: "asc" },
  });

  const result = extras
    .filter((e) => extraApplies(e.code, systemType, regionCode))
    .map((e) => ({
      extraId: e.id,
      code: e.code,
      name: e.name,
      price: e.prices[0] ? Number(e.prices[0].price) : null,
      shared: e.systemType === "all",
    }));

  return NextResponse.json({ region: region.name, extras: result });
}

// PATCH { regionCode, updates: [{ extraId, price }] } → set each add-on's price
// for the region (update existing ExtraPrice, or create if missing).
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
    if (!u?.extraId || !Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: `Invalid price for add-on ${u?.extraId ?? "?"}` },
        { status: 400 }
      );
    }
  }

  let updated = 0;
  for (const u of updates) {
    const price = Number(u.price);
    const existing = await prisma.extraPrice.findFirst({
      where: { extraId: u.extraId, regionId: region.id },
    });
    if (existing) {
      await prisma.extraPrice.update({ where: { id: existing.id }, data: { price } });
    } else {
      await prisma.extraPrice.create({
        data: { extraId: u.extraId, regionId: region.id, price },
      });
    }
    updated++;
  }

  return NextResponse.json({ success: true, updated });
}
