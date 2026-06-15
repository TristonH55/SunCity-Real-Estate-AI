export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Distinct capacity sizes (litres) that actually have at least one active,
// regionally-priced system for the given systemType — so the size picker only
// offers sizes that will produce options.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const regionCode = searchParams.get("region");
  const systemType = searchParams.get("type");

  if (!regionCode || !systemType) {
    return NextResponse.json(
      { error: "Missing region or system type" },
      { status: 400 }
    );
  }

  const region = await prisma.region.findUnique({
    where: { code: regionCode },
  });
  if (!region) {
    return NextResponse.json({ error: "Invalid region" }, { status: 404 });
  }

  const prices = await prisma.systemPrice.findMany({
    where: {
      regionId: region.id,
      system: { systemType: systemType as any, active: true },
    },
    select: { system: { select: { capacityLitres: true } } },
  });

  const sizes = [...new Set(prices.map((p) => p.system.capacityLitres))].sort(
    (a, b) => a - b
  );

  return NextResponse.json({ sizes });
}
