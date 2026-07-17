export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";
import {
  CMS_PROPERTY_TYPES,
  CMS_EXISTING_SYSTEM_TYPES,
  SYSTEM_TYPE_TO_EXISTING,
} from "@/lib/cms-mapping";
import {
  computeRelocationCost,
  isValidRelocationMetres,
} from "@/lib/relocation-pricing";
import { findHeatPumpBand } from "@/lib/heat-pump-bands";
import { computeOptionPricing, getGstMode } from "@/lib/gst";

const VALID_SYSTEM_TYPES = [
  "gas",
  "electric",
  "heat_pump",
  "solar_thermosiphon",
  "solar_split",
] as const;

// Required homeowner/property fields. The three CMS-mapped fields must use the
// exact key strings from lib/cms-mapping.ts so the lock-time CRM push maps cleanly.
// existingSystemType is now derived from systemType (Step 1) and systemLocation
// comes from the Step-3 Inside/Outside answer — neither is collected in Step 4.
const REQUIRED_CUSTOMER_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "postcode",
  "propertyType",
] as const;

export async function POST(req: NextRequest) {
  // 🔒 Agents only (admins pass through).
  const { session, error } = await requireApiRole("agent");
  if (error) return error;

  try {
    const body = await req.json();
    const {
      regionCode,
      systemType,
      capacityLitres,
      extraIds = [],
      customer,
      relocation, // optional (electric "different position"): { newLocation, metres?, requiresSiteVisit? }
      systemLocation, // Step-3 Inside/Outside ("inside" | "outside") — replaces old Step-4 dropdown
      sizeBandId, // heat pump only: a HEAT_PUMP_BANDS id (size range) instead of an exact size
      conversion, // heat pump only: { existingType, disclaimers[], requiresSiteVisit }
    } = body ?? {};

    // ---- Validate selection ----
    if (!regionCode || !systemType || capacityLitres == null || !customer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!VALID_SYSTEM_TYPES.includes(systemType)) {
      return NextResponse.json(
        { error: "Invalid systemType" },
        { status: 400 }
      );
    }

    const capacity = Number(capacityLitres);
    if (!Number.isInteger(capacity) || capacity <= 0) {
      return NextResponse.json(
        { error: "Invalid capacityLitres" },
        { status: 400 }
      );
    }

    // Heat pump selects a size BAND (a capacity range); other types use the exact
    // capacity. The band is resolved from the server whitelist (HEAT_PUMP_BANDS).
    let capacityFilter: any = { capacityLitres: capacity };
    let sizeBandLabel: string | null = null;
    if (systemType === "heat_pump" && sizeBandId) {
      const band = findHeatPumpBand(sizeBandId);
      if (!band) {
        return NextResponse.json({ error: "Invalid sizeBandId" }, { status: 400 });
      }
      capacityFilter = { capacityLitres: { gte: band.min, lte: band.max } };
      sizeBandLabel = band.label;
    }

    if (!Array.isArray(extraIds)) {
      return NextResponse.json(
        { error: "extraIds must be an array" },
        { status: 400 }
      );
    }

    // ---- Validate customer + CMS-mapped values ----
    for (const field of REQUIRED_CUSTOMER_FIELDS) {
      if (!customer[field]?.toString().trim()) {
        return NextResponse.json(
          { error: `Missing customer field: ${field}` },
          { status: 400 }
        );
      }
    }
    if (!(customer.propertyType in CMS_PROPERTY_TYPES)) {
      return NextResponse.json(
        { error: "Invalid propertyType" },
        { status: 400 }
      );
    }
    // systemLocation comes from the Step-3 Inside/Outside answer.
    if (systemLocation !== "inside" && systemLocation !== "outside") {
      return NextResponse.json(
        { error: "Missing or invalid systemLocation (inside/outside)" },
        { status: 400 }
      );
    }

    // Normalise address (Google Places safe) — mirrors the old confirm route.
    const fullAddress =
      customer.address ||
      customer.fullAddress ||
      `${customer.street || ""} ${customer.suburb || ""} ${
        customer.postcode || ""
      }`.trim();

    const region = await prisma.region.findUnique({
      where: { code: regionCode },
    });
    if (!region) {
      return NextResponse.json({ error: "Invalid region" }, { status: 400 });
    }

    // ---- Find candidate systems (same type + same size + available in region) ----
    // active: true here = the per-region availability toggle; system.active = global.
    const systemPrices = await prisma.systemPrice.findMany({
      where: {
        regionId: region.id,
        active: true,
        system: {
          systemType,
          active: true,
          ...capacityFilter,
        },
      },
      include: {
        system: {
          select: {
            id: true,
            brand: true,
            model: true,
            capacityLitres: true,
            warrantyPrimaryYears: true,
            warrantySecondaryYears: true,
          },
        },
      },
    });

    if (systemPrices.length === 0) {
      return NextResponse.json(
        { error: "No systems available for this selection" },
        { status: 400 }
      );
    }

    // ---- One cheapest system per distinct brand, cheapest-first, take up to 3 ----
    const cheapestByBrand = new Map<string, (typeof systemPrices)[number]>();
    for (const sp of systemPrices) {
      const brand = sp.system.brand;
      const existing = cheapestByBrand.get(brand);
      if (!existing || Number(sp.price) < Number(existing.price)) {
        cheapestByBrand.set(brand, sp);
      }
    }

    const chosen = [...cheapestByBrand.values()]
      .sort((a, b) => Number(a.price) - Number(b.price))
      .slice(0, 3);

    // ---- Extras total (same for every option in this quote) ----
    const extras = extraIds.length
      ? await prisma.extraPrice.findMany({
          where: { regionId: region.id, extraId: { in: extraIds } },
        })
      : [];
    let extrasTotal = extras.reduce((sum, e) => sum + Number(e.price), 0);

    // ---- Relocation (electric "different position"): the one add-on that isn't
    // an Extra row. Outside move = lineal-metre price (folded into extras total).
    // Internal move = site visit (no menu price; flagged on the order). Carried
    // as a customerSnapshot line item so it shows on the quote/PDF/CRM note. ----
    const lineItems: { code: string; label: string; amount: number }[] = [];
    let requiresSiteVisit = false;

    if (relocation && typeof relocation === "object") {
      if (relocation.newLocation === "inside" || relocation.requiresSiteVisit) {
        requiresSiteVisit = true;
        lineItems.push({
          code: "relocation_internal",
          label: "Internal relocation (final price subject to site visit)",
          amount: 0,
        });
      } else if (relocation.newLocation === "outside") {
        if (!isValidRelocationMetres(relocation.metres)) {
          return NextResponse.json(
            { error: "Invalid relocation distance (must be 2–30 lineal metres)" },
            { status: 400 }
          );
        }
        const metres = Number(relocation.metres);
        const cost = computeRelocationCost(metres);
        extrasTotal += cost;
        lineItems.push({
          code: "relocation_outside",
          label: `System relocation — ${metres} lineal m`,
          amount: cost,
        });
      }
    }

    // ---- Heat-pump conversion metadata (existing type override + disclaimers + site visit) ----
    const disclaimers: string[] = Array.isArray(conversion?.disclaimers)
      ? conversion.disclaimers.filter((d: any) => typeof d === "string")
      : [];
    if (conversion?.requiresSiteVisit) requiresSiteVisit = true;
    const existingSystemType =
      conversion?.existingType && conversion.existingType in CMS_EXISTING_SYSTEM_TYPES
        ? conversion.existingType
        : SYSTEM_TYPE_TO_EXISTING[systemType as keyof typeof SYSTEM_TYPE_TO_EXISTING];

    // ---- Build the option rows (GST handled per the site-wide mode) ----
    const gstMode = await getGstMode();
    const optionData = chosen.map((sp) => {
      const base = Number(sp.price);
      const pricing = computeOptionPricing(base, extrasTotal, gstMode);
      return { systemId: sp.system.id, ...pricing };
    });

    // ---- Create the presented quote + its options atomically ----
    const quote = await prisma.quote.create({
      data: {
        agentId: session!.user.id,
        regionCode,
        systemType,
        capacityLitres: capacity,
        extraIds,
        customerSnapshot: {
          ...customer,
          address: fullAddress,
          // Derived for the CRM (no longer asked in Step 4):
          existingSystemType,
          systemLocation: systemLocation === "inside" ? "Inside" : "Outside",
          ...(sizeBandLabel ? { sizeBand: sizeBandLabel } : {}),
          ...(disclaimers.length ? { disclaimers } : {}),
          ...(lineItems.length ? { lineItems } : {}),
          ...(requiresSiteVisit ? { requiresSiteVisit: true } : {}),
        },
        status: "presented",
        options: { create: optionData },
      },
      select: { id: true },
    });

    return NextResponse.json({
      success: true,
      quoteId: quote.id,
      optionCount: optionData.length,
    });
  } catch (err: any) {
    console.error("Generate-quote route failed:", err?.message || err);
    return NextResponse.json(
      { error: "Internal server error – check logs" },
      { status: 500 }
    );
  }
}
