

//V3
// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(
//   _req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;

//     if (!id) {
//       return NextResponse.json({ error: "Missing ID" }, { status: 400 });
//     }

//     const confirmation = await prisma.pricingConfirmation.findUnique({
//       where: { id },
//     });

//     if (!confirmation) {
//       return NextResponse.json({ error: "Not found" }, { status: 404 });
//     }

//     // ✅ EXACT SAME LOGIC AS PDF ROUTE
//     const customer = confirmation.customerSnapshot as
//       | {
//           firstName?: string;
//           lastName?: string;
//           email?: string;
//           phone?: string;
//           suburb?: string;
//           postcode?: string;
//           propertyType?: string;
//           existingSystemType?: string;
//           systemLocation?: string;
//         }
//       | undefined;

//     // ✅ GET SYSTEM (same as PDF)
//     const system = await prisma.system.findUnique({
//       where: { id: confirmation.systemId },
//       select: {
//         brand: true,
//         model: true,
//         capacityLitres: true,
//         tankMaterial: true,
//       },
//     });

//     return NextResponse.json({
//       id: confirmation.id,
//       createdAt: confirmation.createdAt,
//       regionCode: confirmation.regionCode,

//       totalIncGst: confirmation.totalIncGst,

//       notes: confirmation.notes || "",
//       images: confirmation.images || [],

//       customer,
//       system,
//     });

//   } catch (err) {
//     console.error("JOB API ERROR:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch job" },
//       { status: 500 }
//     );
//   }
// }

//new test !! SORT LAST TEST
// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(
//   _req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;

//     if (!id) {
//       return NextResponse.json({ error: "Missing ID" }, { status: 400 });
//     }

//     const confirmation = await prisma.pricingConfirmation.findUnique({
//       where: { id },
//     });

//     if (!confirmation) {
//       return NextResponse.json({ error: "Not found" }, { status: 404 });
//     }

//     // ✅ CUSTOMER (same shape as your PDF route)
//     const customer = confirmation.customerSnapshot as
//       | {
//           firstName?: string;
//           lastName?: string;
//           email?: string;
//           phone?: string;
//           suburb?: string;
//           postcode?: string;
//           propertyType?: string;
//           existingSystemType?: string;
//           systemLocation?: string;
//         }
//       | undefined;

//     // ✅ SYSTEM
//     const system = await prisma.system.findUnique({
//       where: { id: confirmation.systemId },
//       select: {
//         brand: true,
//         model: true,
//         capacityLitres: true,
//         tankMaterial: true,
//       },
//     });

//     // ✅ INSURER (NEW)
//     const insurer = confirmation.insurerId
//       ? await prisma.user.findUnique({
//           where: { id: confirmation.insurerId },
//           select: {
//             email: true,
//             companyName: true,
//           },
//         })
//       : null;

    
      

//     return NextResponse.json({
//       id: confirmation.id,
//       createdAt: confirmation.createdAt,
//       regionCode: confirmation.regionCode,
//       totalIncGst: confirmation.totalIncGst,

//       notes: confirmation.notes || "",
//       images: confirmation.images || [],

//       customer,
//       system,
//       insurer, // ✅ IMPORTANT
//     });
//   } catch (err) {
//     console.error("JOB API ERROR:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch job" },
//       { status: 500 }
//     );
//   }
// }


//last LIVE .. TEST LAST
// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(
//   _req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;

//     if (!id) {
//       return NextResponse.json({ error: "Missing ID" }, { status: 400 });
//     }

//     const confirmation = await prisma.pricingConfirmation.findUnique({
//       where: { id },
//     });

//     if (!confirmation) {
//       return NextResponse.json({ error: "Not found" }, { status: 404 });
//     }

//     // ✅ CUSTOMER (same shape as your PDF route)
//     const customer = confirmation.customerSnapshot as
//       | {
//           firstName?: string;
//           lastName?: string;
//           email?: string;
//           phone?: string;
//           suburb?: string;
//           postcode?: string;
//           propertyType?: string;
//           existingSystemType?: string;
//           systemLocation?: string;
//         }
//       | undefined;

//     // ✅ SYSTEM
//     const system = await prisma.system.findUnique({
//       where: { id: confirmation.systemId },
//       select: {
//         brand: true,
//         model: true,
//         capacityLitres: true,
//         tankMaterial: true,
//       },
//     });

//     // ✅ INSURER
//     const insurer = confirmation.insurerId
//       ? await prisma.user.findUnique({
//           where: { id: confirmation.insurerId },
//           select: {
//             email: true,
//             companyName: true,
//           },
//         })
//       : null;

//     // ✅ NOTES LOG (STEP 2)
//     const notesLog = await prisma.jobNote.findMany({
//       where: { jobId: id },
//       include: {
//         user: {
//           select: {
//             email: true,
//             companyName: true,
//             role: true,
//           },
//         },
//       },
//       orderBy: { createdAt: "asc" },
//     });

//     return NextResponse.json({
//       id: confirmation.id,
//       createdAt: confirmation.createdAt,
//       regionCode: confirmation.regionCode,
//       totalIncGst: confirmation.totalIncGst,

//       notes: confirmation.notes || "",
//       images: confirmation.images || [],

//       customer,
//       system,
//       insurer,
//       notesLog, // ✅ STEP 2
//     });
//   } catch (err) {
//     console.error("JOB API ERROR:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch job" },
//       { status: 500 }
//     );
//   }
// }

//NEW TEST ONLY
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const confirmation = await prisma.pricingConfirmation.findUnique({
      where: { id },
    });

    if (!confirmation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // ✅ SAFE UPDATE (won’t break if field missing)
    try {
      await prisma.pricingConfirmation.update({
        where: { id },
        data: {
          lastViewedByInsurer: new Date(),
        } as any, // 👈 IMPORTANT FIX
      });
    } catch (e) {
      console.log("Skipping lastViewed update (not ready yet)");
    }

    const customer = confirmation.customerSnapshot as
      | {
          firstName?: string;
          lastName?: string;
          email?: string;
          phone?: string;
          suburb?: string;
          postcode?: string;
          address?: string;
        }
      | undefined;

      // ✅ ADD THIS RIGHT AFTER
if (customer && !customer.address) {
    customer.address = `${customer.suburb || ""} ${customer.postcode || ""}`.trim();
  }

    const system = await prisma.system.findUnique({
      where: { id: confirmation.systemId },
      select: {
        brand: true,
        model: true,
        capacityLitres: true,
        tankMaterial: true,
      },
    });

    const insurer = confirmation.insurerId
      ? await prisma.user.findUnique({
          where: { id: confirmation.insurerId },
          select: {
            email: true,
            companyName: true,
          },
        })
      : null;

    const notesLog = await prisma.jobNote.findMany({
      where: { jobId: id },
      include: {
        user: {
          select: {
            email: true,
            companyName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      id: confirmation.id,
      createdAt: confirmation.createdAt,
      regionCode: confirmation.regionCode,
      totalIncGst: confirmation.totalIncGst,

      notes: confirmation.notes || "",
      images: confirmation.images || [],

      customer,
      system,
      insurer,
      notesLog,

      // ✅ SAFE RETURN
      lastViewedByInsurer:
        (confirmation as any).lastViewedByInsurer || null,
    });

  } catch (err) {
    console.error("JOB API ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}