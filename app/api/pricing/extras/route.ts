export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "lib/prisma";

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
    return NextResponse.json(
      { error: "Invalid region" },
      { status: 404 }
    );
  }

  const extras = await prisma.extraPrice.findMany({
    where: {
      regionId: region.id,
      extra: {
        active: true,
        OR: [
          { systemType: systemType as any },
          { systemType: "all" },
        ],
      },
    },
    include: {
      extra: {
        select: {
          id: true,
          name: true,
          systemType: true,
        },
      },
    },
    orderBy: {
      extra: { name: "asc" },
    },
  });

  const result = extras.map(ep => ({
    extraId: ep.extra.id,
    name: ep.extra.name,
    priceExGst: ep.price.toNumber(),
    included: ep.price.toNumber() === 0,
  }));

  return NextResponse.json(result);
}
