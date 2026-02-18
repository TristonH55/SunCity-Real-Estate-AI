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

//   const systems = await prisma.systemPrice.findMany({
//     where: {
//       regionId: region.id,
//       system: {
//         systemType: systemType as any,
//         active: true,
//       },
//     },
//     include: {
//       system: {
//         select: {
//           id: true,
//           brand: true,
//           model: true,
//           capacityLitres: true,
//           tankMaterial: true,
//         },
//       },
//     },
//     orderBy: {
//       system: { capacityLitres: "asc" },
//     },
//   });

//   const result = systems.map(sp => ({
//     systemId: sp.system.id,
//     brand: sp.system.brand,
//     model: sp.system.model,
//     capacityLitres: sp.system.capacityLitres,
//     tankMaterial: sp.system.tankMaterial,
//     priceExGst: sp.price,
//   }));

//   return NextResponse.json(result);
// }
/////////////

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

  // 🔥 Map UI type → actual DB enum values
  let systemTypeFilter: any;

  if (systemType === "solar") {
    systemTypeFilter = {
      in: ["solar_thermosiphon", "solar_split"],
    };
  } else {
    systemTypeFilter = systemType;
  }

  const systems = await prisma.systemPrice.findMany({
    where: {
      regionId: region.id,
      system: {
        systemType: systemTypeFilter,
        active: true,
      },
    },
    include: {
      system: {
        select: {
          id: true,
          brand: true,
          model: true,
          capacityLitres: true,
          tankMaterial: true,
        },
      },
    },
    orderBy: {
      system: { capacityLitres: "asc" },
    },
  });

  const result = systems.map((sp) => ({
    systemId: sp.system.id,
    brand: sp.system.brand,
    model: sp.system.model,
    capacityLitres: sp.system.capacityLitres,
    tankMaterial: sp.system.tankMaterial,
    priceExGst: sp.price,
  }));

  return NextResponse.json(result);
}
