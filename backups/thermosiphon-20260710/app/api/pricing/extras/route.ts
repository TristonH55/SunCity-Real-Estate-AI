// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// import { NextResponse } from "next/server";
// import { prisma } from "lib/prisma";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);

//   const regionCode = searchParams.get("region");
//   const systemType = searchParams.get("type");

//   if (!regionCode || !systemType) {
//     return NextResponse.json(
//       { error: "Missing region or system type" },
//       { status: 400 }
//     );
//   }

//   const region = await prisma.region.findUnique({
//     where: { code: regionCode },
//   });

//   if (!region) {
//     return NextResponse.json(
//       { error: "Invalid region" },
//       { status: 404 }
//     );
//   }

//   const extras = await prisma.extraPrice.findMany({
//     where: {
//       regionId: region.id,
//       extra: {
//         active: true,
//         OR: [
//           { systemType: systemType as any },
//           { systemType: "all" },
//         ],
//       },
//     },
//     include: {
//       extra: {
//         select: {
//           id: true,
//           name: true,
//           systemType: true,
//         },
//       },
//     },
//     orderBy: {
//       extra: { name: "asc" },
//     },
//   });

//   const result = extras.map(ep => ({
//     extraId: ep.extra.id,
//     name: ep.extra.name,
//     priceExGst: ep.price.toNumber(),
//     included: ep.price.toNumber() === 0,
//   }));

//   return NextResponse.json(result);
// }

////////Test 2  //////
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const regionCode = searchParams.get("region");
  const systemType = searchParams.get("type");

  if (!regionCode || !systemType) {
    return NextResponse.json([], { status: 200 });
  }

  const region = await prisma.region.findUnique({
    where: { code: regionCode },
  });

  if (!region) {
    return NextResponse.json([], { status: 200 });
  }

  // 🔑 NORMALISE SYSTEM TYPE FOR DB QUERY
  const effectiveSystemType =
    systemType === "solar_thermosiphon" || systemType === "solar_split"
      ? "solar"
      : systemType;

  const extras = await prisma.extraPrice.findMany({
    where: {
      regionId: region.id,
      extra: {
        active: true,
        OR: [
          { systemType: effectiveSystemType as any },
          { systemType: "all" },
        ],
      },
    },
    include: {
      extra: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
    orderBy: {
      extra: { name: "asc" },
    },
  });

  const result = extras
    .filter((ep) => {
      const code = ep.extra.code;

      // 🌪 Cyclone frames: solar subtype specific
      if (code === "cyclone_frame_thermo") {
        return systemType === "solar_thermosiphon" && regionCode === "wide_bay";
      }

      if (code === "cyclone_frame_split") {
        return systemType === "solar_split" && regionCode === "wide_bay";
      }

      // 🧱 Flat roof frames: solar subtype specific
      if (code === "flat_roof_frame_thermo") {
        return systemType === "solar_thermosiphon";
      }

      if (code === "flat_roof_frame_split") {
        return systemType === "solar_split";
      }

      // ❌ Hide safe tray for heat pumps ONLY
      if (
        code === "safe_tray_mildred_valve" &&
        systemType === "heat_pump"
      ) {
        return false;
      }

      return true;
    })
    .map((ep) => ({
      extraId: ep.extra.id,
      code: ep.extra.code,
      name: ep.extra.name,
      priceExGst: ep.price.toNumber(),
      included: ep.price.toNumber() === 0,
    }));

  return NextResponse.json(result, { status: 200 });
}