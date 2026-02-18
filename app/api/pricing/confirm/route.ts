export const dynamic = "force-dynamic";
export const runtime = "nodejs";


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      regionCode,
      systemId,
      extraIds = [],
    }: {
      regionCode: string;
      systemId: string;
      extraIds: string[];
    } = body;

    if (!regionCode || !systemId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Resolve region
    const region = await prisma.region.findUnique({
      where: { code: regionCode },
    });

    if (!region) {
      return NextResponse.json(
        { error: "Invalid region" },
        { status: 400 }
      );
    }

    // Get system price
    const systemPrice = await prisma.systemPrice.findFirst({
      where: {
        systemId,
        regionId: region.id,
      },
    });

    if (!systemPrice) {
      return NextResponse.json(
        { error: "System price not found" },
        { status: 404 }
      );
    }

    // Get extras pricing
    const extras = await prisma.extraPrice.findMany({
      where: {
        regionId: region.id,
        extraId: { in: extraIds },
      },
      include: {
        extra: true,
      },
    });

    const basePrice = Number(systemPrice.price);
    const extrasTotal = extras.reduce(
      (sum, e) => sum + Number(e.price),
      0
    );

    const subtotalExGst = basePrice + extrasTotal;
    const gst = subtotalExGst * 0.1;
    const totalIncGst = subtotalExGst + gst;

    // 🔒 Snapshot record
    const confirmation = await prisma.pricingConfirmation.create({
      data: {
        regionCode,
        systemId,
        extraIds,
        basePriceExGst: basePrice,
        extrasTotalExGst: extrasTotal,
        subtotalExGst,
        gst,
        totalIncGst,
      },
    });

    return NextResponse.json({
      success: true,
      confirmationId: confirmation.id,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
