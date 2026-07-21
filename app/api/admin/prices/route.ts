export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TankMaterial } from "@prisma/client";
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

const VALID_TANK = ["mild_steel", "stainless_steel", "copper"] as const;

// GET ?region=<code>&type=<systemType> → every system of that type (active or
// not, so a globally-disabled one can be re-enabled) with its price + both
// availability flags for the region.
export async function GET(req: NextRequest) {
  const { error } = await requireApiRole("admin");
  if (error) return error;

  const { searchParams } = new URL(req.url);

  // Hidden (archived) products — all types, no region needed. Used by the
  // "Hidden products" page for restore/delete.
  if (searchParams.get("hidden") === "1") {
    const archived = await prisma.system.findMany({
      where: { archived: true },
      orderBy: [{ systemType: "asc" }, { brand: "asc" }, { capacityLitres: "asc" }],
      include: { _count: { select: { quoteOptions: true } } },
    });
    return NextResponse.json({
      systems: archived.map((s) => ({
        systemId: s.id,
        brand: s.brand,
        model: s.model,
        systemType: s.systemType,
        capacityLitres: s.capacityLitres,
        usedInQuotes: s._count.quoteOptions,
      })),
    });
  }

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
    where: { systemType: systemType as any, archived: false },
    include: {
      systemPrices: { where: { regionId: region.id }, select: { price: true, active: true } },
    },
    orderBy: [{ brand: "asc" }, { capacityLitres: "asc" }],
  });

  const result = systems.map((s) => ({
    systemId: s.id,
    brand: s.brand,
    model: s.model,
    capacityLitres: s.capacityLitres,
    tankMaterial: s.tankMaterial,
    warrantyPrimaryYears: s.warrantyPrimaryYears,
    warrantySecondaryYears: s.warrantySecondaryYears,
    price: s.systemPrices[0] ? Number(s.systemPrices[0].price) : null,
    // per-region availability (only meaningful once priced); global availability
    regionActive: s.systemPrices[0] ? s.systemPrices[0].active : true,
    globalActive: s.active,
    brochureUrl: s.brochureUrl,
  }));

  return NextResponse.json({ region: region.name, systems: result });
}

// POST { regionCode, systemType, product:{ brand, model, capacityLitres,
// tankMaterial, warrantyPrimaryYears, warrantySecondaryYears?, price } }
// → creates a new global System + its price for this region.
export async function POST(req: NextRequest) {
  const { error } = await requireApiRole("admin");
  if (error) return error;

  const originError = checkOrigin(req);
  if (originError) return originError;

  if (!(await allow(limiters.adminPrices, clientIp(req)))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const { regionCode, systemType, product } = body ?? {};

  if (!regionCode || !systemType || !product) {
    return NextResponse.json({ error: "Missing regionCode, systemType or product" }, { status: 400 });
  }
  if (!VALID_TYPES.includes(systemType as (typeof VALID_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const region = await prisma.region.findUnique({ where: { code: regionCode } });
  if (!region) {
    return NextResponse.json({ error: "Invalid region" }, { status: 400 });
  }

  const brand = String(product.brand ?? "").trim();
  const model = String(product.model ?? "").trim();
  const capacityLitres = Number(product.capacityLitres);
  const tankMaterial = String(product.tankMaterial ?? "");
  const warrantyPrimaryYears = Number(product.warrantyPrimaryYears);
  const warrantySecondaryYears =
    product.warrantySecondaryYears === "" || product.warrantySecondaryYears == null
      ? null
      : Number(product.warrantySecondaryYears);
  const price = Number(product.price);

  if (!brand || !model) {
    return NextResponse.json({ error: "Brand and model are required" }, { status: 400 });
  }
  if (!Number.isInteger(capacityLitres) || capacityLitres <= 0) {
    return NextResponse.json({ error: "Size (litres) must be a whole number > 0" }, { status: 400 });
  }
  if (!VALID_TANK.includes(tankMaterial as (typeof VALID_TANK)[number])) {
    return NextResponse.json({ error: "Invalid tank material" }, { status: 400 });
  }
  if (!Number.isInteger(warrantyPrimaryYears) || warrantyPrimaryYears < 0) {
    return NextResponse.json({ error: "Warranty (years) must be a whole number ≥ 0" }, { status: 400 });
  }
  if (warrantySecondaryYears !== null && (!Number.isInteger(warrantySecondaryYears) || warrantySecondaryYears < 0)) {
    return NextResponse.json({ error: "Secondary warranty must be a whole number ≥ 0" }, { status: 400 });
  }
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Price must be a number ≥ 0" }, { status: 400 });
  }

  const brochureUrl =
    product.brochureUrl && String(product.brochureUrl).trim() !== ""
      ? String(product.brochureUrl).trim()
      : null;

  const system = await prisma.system.create({
    data: {
      brand,
      model,
      systemType: systemType as any,
      tankMaterial: tankMaterial as TankMaterial,
      capacityLitres,
      warrantyPrimaryYears,
      warrantySecondaryYears,
      brochureUrl,
      active: true,
      systemPrices: { create: { regionId: region.id, price, active: true } },
    },
  });

  return NextResponse.json({ success: true, systemId: system.id });
}

// PATCH { regionCode, updates:[{ systemId, price?, regionActive?, globalActive? }] }
// → per row: set the region price and/or flip per-region / global availability.
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

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "Missing updates" }, { status: 400 });
  }

  // Region only needed when a price / per-region availability changes; product-
  // level flags (archived/global/brochure) don't need it (e.g. restore from the
  // Hidden page, which has no region context).
  const needsRegion = updates.some(
    (u: any) => u?.price !== undefined || u?.regionActive !== undefined
  );
  let region: { id: string } | null = null;
  if (needsRegion) {
    if (!regionCode) {
      return NextResponse.json({ error: "Missing regionCode" }, { status: 400 });
    }
    region = await prisma.region.findUnique({ where: { code: regionCode } });
    if (!region) {
      return NextResponse.json({ error: "Invalid region" }, { status: 400 });
    }
  }

  // Validate every row first (all-or-nothing).
  for (const u of updates) {
    if (!u?.systemId) {
      return NextResponse.json({ error: "Missing systemId in an update" }, { status: 400 });
    }
    if (u.price !== undefined) {
      const price = Number(u.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: `Invalid price for system ${u.systemId}` }, { status: 400 });
      }
    }
  }

  let updated = 0;
  for (const u of updates) {
    // Global availability toggle, product brochure and/or archive (hide) flag.
    if (u.globalActive !== undefined || u.brochureUrl !== undefined || u.archived !== undefined) {
      await prisma.system.update({
        where: { id: u.systemId },
        data: {
          ...(u.globalActive !== undefined ? { active: !!u.globalActive } : {}),
          ...(u.brochureUrl !== undefined
            ? { brochureUrl: u.brochureUrl === "" ? null : String(u.brochureUrl) }
            : {}),
          ...(u.archived !== undefined ? { archived: !!u.archived } : {}),
        },
      });
    }

    // Price and/or per-region availability (needs a SystemPrice row + region).
    if ((u.price !== undefined || u.regionActive !== undefined) && region) {
      const existing = await prisma.systemPrice.findFirst({
        where: { systemId: u.systemId, regionId: region.id },
      });
      if (existing) {
        await prisma.systemPrice.update({
          where: { id: existing.id },
          data: {
            ...(u.price !== undefined ? { price: Number(u.price) } : {}),
            ...(u.regionActive !== undefined ? { active: !!u.regionActive } : {}),
          },
        });
      } else if (u.price !== undefined) {
        await prisma.systemPrice.create({
          data: {
            systemId: u.systemId,
            regionId: region.id,
            price: Number(u.price),
            active: u.regionActive !== undefined ? !!u.regionActive : true,
          },
        });
      }
      // (regionActive with no price and no existing row → nothing to store; ignored.)
    }
    updated++;
  }

  return NextResponse.json({ success: true, updated });
}

// PUT { systemId, product:{ brand, model, capacityLitres, tankMaterial,
// warrantyPrimaryYears, warrantySecondaryYears?, brochureUrl? } } → edit a
// product's global fields (not its per-region price / availability).
export async function PUT(req: NextRequest) {
  const { error } = await requireApiRole("admin");
  if (error) return error;

  const originError = checkOrigin(req);
  if (originError) return originError;

  if (!(await allow(limiters.adminPrices, clientIp(req)))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const { systemId, product } = body ?? {};
  if (!systemId || !product) {
    return NextResponse.json({ error: "Missing systemId or product" }, { status: 400 });
  }

  const brand = String(product.brand ?? "").trim();
  const model = String(product.model ?? "").trim();
  const capacityLitres = Number(product.capacityLitres);
  const tankMaterial = String(product.tankMaterial ?? "");
  const warrantyPrimaryYears = Number(product.warrantyPrimaryYears);
  const warrantySecondaryYears =
    product.warrantySecondaryYears === "" || product.warrantySecondaryYears == null
      ? null
      : Number(product.warrantySecondaryYears);

  if (!brand || !model) {
    return NextResponse.json({ error: "Brand and model are required" }, { status: 400 });
  }
  if (!Number.isInteger(capacityLitres) || capacityLitres <= 0) {
    return NextResponse.json({ error: "Size (litres) must be a whole number > 0" }, { status: 400 });
  }
  if (!VALID_TANK.includes(tankMaterial as (typeof VALID_TANK)[number])) {
    return NextResponse.json({ error: "Invalid tank material" }, { status: 400 });
  }
  if (!Number.isInteger(warrantyPrimaryYears) || warrantyPrimaryYears < 0) {
    return NextResponse.json({ error: "Warranty (years) must be a whole number ≥ 0" }, { status: 400 });
  }
  if (warrantySecondaryYears !== null && (!Number.isInteger(warrantySecondaryYears) || warrantySecondaryYears < 0)) {
    return NextResponse.json({ error: "Secondary warranty must be a whole number ≥ 0" }, { status: 400 });
  }

  const brochureUrl =
    product.brochureUrl === undefined
      ? undefined
      : String(product.brochureUrl).trim() === ""
      ? null
      : String(product.brochureUrl).trim();

  await prisma.system.update({
    where: { id: systemId },
    data: {
      brand,
      model,
      capacityLitres,
      tankMaterial: tankMaterial as TankMaterial,
      warrantyPrimaryYears,
      warrantySecondaryYears,
      ...(brochureUrl !== undefined ? { brochureUrl } : {}),
    },
  });

  return NextResponse.json({ success: true });
}

// DELETE { systemId } → permanently delete a product. Blocked if it's referenced
// by any past quote (keep it hidden instead, to preserve quote history).
export async function DELETE(req: NextRequest) {
  const { error } = await requireApiRole("admin");
  if (error) return error;

  const originError = checkOrigin(req);
  if (originError) return originError;

  if (!(await allow(limiters.adminPrices, clientIp(req)))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const { systemId } = body ?? {};
  if (!systemId) {
    return NextResponse.json({ error: "Missing systemId" }, { status: 400 });
  }

  const used = await prisma.quoteOption.count({ where: { systemId } });
  if (used > 0) {
    return NextResponse.json(
      { error: `Can't delete — used in ${used} past quote(s). Keep it hidden instead.` },
      { status: 409 }
    );
  }

  await prisma.systemPrice.deleteMany({ where: { systemId } });
  await prisma.system.delete({ where: { id: systemId } });
  return NextResponse.json({ success: true });
}
