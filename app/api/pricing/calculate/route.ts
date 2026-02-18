// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "lib/prisma";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     const {
//       systemId,
//       regionCode,
//       extraIds = [],
//     }: {
//       systemId: string;
//       regionCode: string;
//       extraIds?: string[];
//     } = body;

//     if (!systemId || !regionCode) {
//       return NextResponse.json(
//         { error: "systemId and regionCode are required" },
//         { status: 400 }
//       );
//     }

//     // 1️⃣ Resolve region
//     const region = await prisma.region.findUnique({
//       where: { code: regionCode },
//     });

//     if (!region) {
//       return NextResponse.json(
//         { error: "Invalid region" },
//         { status: 400 }
//       );
//     }

//     // 2️⃣ Get system base price
//     const systemPrice = await prisma.systemPrice.findFirst({
//       where: {
//         systemId,
//         regionId: region.id,
//       },
//     });

//     if (!systemPrice) {
//       return NextResponse.json(
//         { error: "System price not found for region" },
//         { status: 404 }
//       );
//     }

//     // 3️⃣ Get extras pricing
//     const extras = await prisma.extraPrice.findMany({
//       where: {
//         regionId: region.id,
//         extraId: { in: extraIds },
//       },
//       include: {
//         extra: true,
//       },
//     });

//     // 4️⃣ Build pricing breakdown
//     const basePrice = Number(systemPrice.price);

//     const extrasBreakdown = extras.map(ep => ({
//       extraId: ep.extraId,
//       name: ep.extra.name,
//       priceExGst: Number(ep.price),
//       included: Number(ep.price) === 0,
//     }));

//     const extrasTotal = extrasBreakdown.reduce(
//       (sum, e) => sum + e.priceExGst,
//       0
//     );

//     const totalExGst = basePrice + extrasTotal;

//     return NextResponse.json({
//       systemId,
//       region: region.code,
//       basePriceExGst: basePrice,
//       extras: extrasBreakdown,
//       extrasTotalExGst: extrasTotal,
//       totalExGst,
//     });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      systemId,
      regionCode,
      extraIds = [],
    }: {
      systemId: string;
      regionCode: string;
      extraIds?: string[];
    } = body;

    if (!systemId || !regionCode) {
      return NextResponse.json(
        { error: "systemId and regionCode are required" },
        { status: 400 }
      );
    }

    // 1️⃣ Resolve region
    const region = await prisma.region.findUnique({
      where: { code: regionCode },
    });

    if (!region) {
      return NextResponse.json(
        { error: "Invalid region" },
        { status: 400 }
      );
    }

    // 2️⃣ Get system base price
    const systemPrice = await prisma.systemPrice.findFirst({
      where: {
        systemId,
        regionId: region.id,
      },
    });

    if (!systemPrice) {
      return NextResponse.json(
        { error: "System price not found for region" },
        { status: 404 }
      );
    }

    // 3️⃣ Get extras pricing
    const extras = await prisma.extraPrice.findMany({
      where: {
        regionId: region.id,
        extraId: { in: extraIds },
      },
      include: {
        extra: true,
      },
    });

    // 4️⃣ Pricing math (ALL numbers)
    const systemPriceExGst = Number(systemPrice.price);

    const extrasTotalExGst = extras.reduce(
      (sum, e) => sum + Number(e.price),
      0
    );

    const subtotalExGst = systemPriceExGst + extrasTotalExGst;
    const gst = subtotalExGst * 0.1;
    const totalIncGst = subtotalExGst + gst;

    // 5️⃣ Return EXACT shape expected by UI
    return NextResponse.json({
      systemPriceExGst,
      extrasTotalExGst,
      subtotalExGst,
      gst,
      totalIncGst,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
