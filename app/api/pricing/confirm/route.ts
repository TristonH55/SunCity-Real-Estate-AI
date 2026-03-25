// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";


// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "lib/prisma";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     const {
//       regionCode,
//       systemId,
//       extraIds = [],
//     }: {
//       regionCode: string;
//       systemId: string;
//       extraIds: string[];
//     } = body;

//     if (!regionCode || !systemId) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // Resolve region
//     const region = await prisma.region.findUnique({
//       where: { code: regionCode },
//     });

//     if (!region) {
//       return NextResponse.json(
//         { error: "Invalid region" },
//         { status: 400 }
//       );
//     }

//     // Get system price
//     const systemPrice = await prisma.systemPrice.findFirst({
//       where: {
//         systemId,
//         regionId: region.id,
//       },
//     });

//     if (!systemPrice) {
//       return NextResponse.json(
//         { error: "System price not found" },
//         { status: 404 }
//       );
//     }

//     // Get extras pricing
//     const extras = await prisma.extraPrice.findMany({
//       where: {
//         regionId: region.id,
//         extraId: { in: extraIds },
//       },
//       include: {
//         extra: true,
//       },
//     });

//     const basePrice = Number(systemPrice.price);
//     const extrasTotal = extras.reduce(
//       (sum, e) => sum + Number(e.price),
//       0
//     );

//     const subtotalExGst = basePrice + extrasTotal;
//     const gst = subtotalExGst * 0.1;
//     const totalIncGst = subtotalExGst + gst;

//     // 🔒 Snapshot record
//     const confirmation = await prisma.pricingConfirmation.create({
//       data: {
//         regionCode,
//         systemId,
//         extraIds,
//         basePriceExGst: basePrice,
//         extrasTotalExGst: extrasTotal,
//         subtotalExGst,
//         gst,
//         totalIncGst,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       confirmationId: confirmation.id,
//     });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


//////LIVE WORKING 
// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";


// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "lib/prisma";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     const {
//       regionCode,
//       systemId,
//       extraIds = [],
//     }: {
//       regionCode: string;
//       systemId: string;
//       extraIds: string[];
//     } = body;

//     if (!regionCode || !systemId) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // Resolve region
//     const region = await prisma.region.findUnique({
//       where: { code: regionCode },
//     });

//     if (!region) {
//       return NextResponse.json(
//         { error: "Invalid region" },
//         { status: 400 }
//       );
//     }

//     // Get system price
//     const systemPrice = await prisma.systemPrice.findFirst({
//       where: {
//         systemId,
//         regionId: region.id,
//       },
//     });

//     if (!systemPrice) {
//       return NextResponse.json(
//         { error: "System price not found" },
//         { status: 404 }
//       );
//     }

//     // Get extras pricing
//     const extras = await prisma.extraPrice.findMany({
//       where: {
//         regionId: region.id,
//         extraId: { in: extraIds },
//       },
//       include: {
//         extra: true,
//       },
//     });

//     const basePrice = Number(systemPrice.price);
//     const extrasTotal = extras.reduce(
//       (sum, e) => sum + Number(e.price),
//       0
//     );

//     const subtotalExGst = basePrice + extrasTotal;
//     const gst = subtotalExGst * 0.1;
//     const totalIncGst = subtotalExGst + gst;

//     // 🔒 Snapshot record
//     const confirmation = await prisma.pricingConfirmation.create({
//       data: {
//         regionCode,
//         systemId,
//         extraIds,
//         basePriceExGst: basePrice,
//         extrasTotalExGst: extrasTotal,
//         subtotalExGst,
//         gst,
//         totalIncGst,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       confirmationId: confirmation.id,
//     });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


///////////test v2 last
// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "lib/prisma";
// import { sendLeadToCMS } from "@/lib/unity-crm";
// import {
//   CMS_ENQUIRY_TYPES,
//   CMS_PROPERTY_TYPES,
//   CMS_EXISTING_SYSTEM_TYPES,
//   CMS_SYSTEM_LOCATIONS,
// } from "@/lib/cms-mapping";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { regionCode, systemId, extraIds = [], customer } = body;

//     // 🔥 DEBUG LOGS
// console.log("🔥 CUSTOMER TYPE:", typeof customer);
// console.log("🔥 CUSTOMER VALUE:", customer);

//     if (!regionCode || !systemId || !customer) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }
    

//     // Validate required customer fields
//     const requiredFields = ["firstName", "lastName", "email", "phone", "postcode", "propertyType", "existingSystemType", "systemLocation"];
//     for (const field of requiredFields) {
//       if (!customer[field]?.trim()) {
//         return NextResponse.json({ error: `Missing customer field: ${field}` }, { status: 400 });
//       }
//     }

//     const region = await prisma.region.findUnique({ where: { code: regionCode } });
//     if (!region) return NextResponse.json({ error: "Invalid region" }, { status: 400 });

//     const system = await prisma.system.findUnique({ where: { id: systemId } });
//     if (!system) return NextResponse.json({ error: "System not found" }, { status: 404 });

//     const systemPrice = await prisma.systemPrice.findFirst({
//       where: { systemId, regionId: region.id },
//     });
//     if (!systemPrice) return NextResponse.json({ error: "System price not found" }, { status: 404 });

//     const extras = await prisma.extraPrice.findMany({
//       where: { regionId: region.id, extraId: { in: extraIds } },
//     });

//     const basePrice      = Number(systemPrice.price);
//     const extrasTotal    = extras.reduce((sum, e) => sum + Number(e.price), 0);
//     const subtotalExGst  = basePrice + extrasTotal;
//     const gst            = subtotalExGst * 0.1;
//     const totalIncGst    = subtotalExGst + gst;

//     // Save confirmation + full customer snapshot
//     const confirmation = await prisma.pricingConfirmation.create({
//       data: {
//         regionCode,
//         systemId,
//         extraIds,
//         basePriceExGst: basePrice,
//         extrasTotalExGst: extrasTotal,
//         subtotalExGst,
//         gst,
//         totalIncGst,
//         customerSnapshot: customer,
//       },
//     });

//     // Send to CMS – using exact codes
//     await sendLeadToCMS({
//       lead_data: {
//         status:          "d651",
//         source:          "2d2e",
//         source_domain:   process.env.NEXT_PUBLIC_BASE_URL || "localhost",
//         source_url:      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/pricing`,
//         user_ip:         req.headers.get("x-forwarded-for") ?? "127.0.0.1",
//         utm_source: "App",           // ← Add this line
//         utm_medium: "Insurer App",  // optional but recommended – can be "web", "email", etc.
//         enquiry_type:    CMS_ENQUIRY_TYPES.new_system,
//         property_type:   CMS_PROPERTY_TYPES[customer.propertyType as keyof typeof CMS_PROPERTY_TYPES],
//         system_type:     CMS_EXISTING_SYSTEM_TYPES[customer.existingSystemType as keyof typeof CMS_EXISTING_SYSTEM_TYPES],
//         system_location: CMS_SYSTEM_LOCATIONS[customer.systemLocation as keyof typeof CMS_SYSTEM_LOCATIONS],

//         enquiry:         `Insurer price confirmation #${confirmation.id}`,
//         location: {
//           suburb:  customer.suburb || "",
//           postcode: customer.postcode,
//         },
//       },
//       contact_data: {
//         first_name: customer.firstName,
//         last_name:  customer.lastName,
//         email:      customer.email,
//         phone:      customer.phone,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       confirmationId: confirmation.id,
//     });
//   } catch (err: any) {
//     console.error("Confirm route failed:", err.message || err);
//     return NextResponse.json(
//       { error: "Internal server error – check logs" },
//       { status: 500 }
//     );
//   }
// }


////maybe?LAST WORKING .....
// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "lib/prisma";
// import { sendLeadToCMS } from "@/lib/unity-crm";
// import {
//   CMS_ENQUIRY_TYPES,
//   CMS_PROPERTY_TYPES,
//   CMS_EXISTING_SYSTEM_TYPES,
//   CMS_SYSTEM_LOCATIONS,
// } from "@/lib/cms-mapping";

// // ✅ NEW (SAFE)
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { regionCode, systemId, extraIds = [], customer } = body;

//     // New add
    


//     // 🔥 DEBUG LOGS
//     console.log("🔥 CUSTOMER TYPE:", typeof customer);
//     console.log("🔥 CUSTOMER VALUE:", customer);

//     if (!regionCode || !systemId || !customer) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }

//     // ✅ GET SESSION (SAFE — does nothing if not logged in)
//     const session = await getServerSession(authOptions);

//     // Validate required customer fields
//     const requiredFields = [
//       "firstName",
//       "lastName",
//       "email",
//       "phone",
//       "postcode",
//       "propertyType",
//       "existingSystemType",
//       "systemLocation",
//     ];

//     for (const field of requiredFields) {
//       if (!customer[field]?.trim()) {
//         return NextResponse.json(
//           { error: `Missing customer field: ${field}` },
//           { status: 400 }
//         );
//       }
//     }

//     const region = await prisma.region.findUnique({
//       where: { code: regionCode },
//     });
//     if (!region)
//       return NextResponse.json({ error: "Invalid region" }, { status: 400 });

//     const system = await prisma.system.findUnique({
//       where: { id: systemId },
//     });
//     if (!system)
//       return NextResponse.json({ error: "System not found" }, { status: 404 });

//     const systemPrice = await prisma.systemPrice.findFirst({
//       where: { systemId, regionId: region.id },
//     });
//     if (!systemPrice)
//       return NextResponse.json(
//         { error: "System price not found" },
//         { status: 404 }
//       );

//     const extras = await prisma.extraPrice.findMany({
//       where: { regionId: region.id, extraId: { in: extraIds } },
//     });

//     const basePrice = Number(systemPrice.price);
//     const extrasTotal = extras.reduce((sum, e) => sum + Number(e.price), 0);
//     const subtotalExGst = basePrice + extrasTotal;
//     const gst = subtotalExGst * 0.1;
//     const totalIncGst = subtotalExGst + gst;

//     // ✅ SAVE CONFIRMATION (ONLY CHANGE IS insurerId)
//     const confirmation = await prisma.pricingConfirmation.create({
//       data: {
//         regionCode,
//         systemId,
//         extraIds,
//         basePriceExGst: basePrice,
//         extrasTotalExGst: extrasTotal,
//         subtotalExGst,
//         gst,
//         totalIncGst,
//         customerSnapshot: customer,

//         // ✅ NEW FIELD (SAFE)
//         insurerId: session?.user?.id || null,
//       },
//     });

//     // Send to CMS – unchanged
//     await sendLeadToCMS({
//       lead_data: {
//         status: "d651",
//         source: "2d2e",
//         source_domain: process.env.NEXT_PUBLIC_BASE_URL || "localhost",
//         source_url: `${
//           process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
//         }/pricing`,
//         user_ip: req.headers.get("x-forwarded-for") ?? "127.0.0.1",
//         utm_source: "App",
//         utm_medium: "Insurer App",
//         enquiry_type: CMS_ENQUIRY_TYPES.new_system,
//         property_type:
//           CMS_PROPERTY_TYPES[
//             customer.propertyType as keyof typeof CMS_PROPERTY_TYPES
//           ],
//         system_type:
//           CMS_EXISTING_SYSTEM_TYPES[
//             customer.existingSystemType as keyof typeof CMS_EXISTING_SYSTEM_TYPES
//           ],
//         system_location:
//           CMS_SYSTEM_LOCATIONS[
//             customer.systemLocation as keyof typeof CMS_SYSTEM_LOCATIONS
//           ],

//         enquiry: `Insurer price confirmation #${confirmation.id}`,
//         location: {
//           suburb: customer.suburb || "",
//           postcode: customer.postcode,
//         },
//       },
//       contact_data: {
//         first_name: customer.firstName,
//         last_name: customer.lastName,
//         email: customer.email,
//         phone: customer.phone,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       confirmationId: confirmation.id,
//     });
//   } catch (err: any) {
//     console.error("Confirm route failed:", err.message || err);
//     return NextResponse.json(
//       { error: "Internal server error – check logs" },
//       { status: 500 }
//     );
//   }
// }

///TESTING 
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";
import { sendLeadToCMS } from "@/lib/unity-crm";
import {
  CMS_ENQUIRY_TYPES,
  CMS_PROPERTY_TYPES,
  CMS_EXISTING_SYSTEM_TYPES,
  CMS_SYSTEM_LOCATIONS,
} from "@/lib/cms-mapping";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { regionCode, systemId, extraIds = [], customer } = body;

    // ✅ NEW — NORMALISE ADDRESS (Google Places safe)
    const fullAddress =
      customer.address ||
      customer.fullAddress ||
      `${customer.street || ""} ${customer.suburb || ""} ${customer.postcode || ""}`.trim();

    console.log("🔥 CUSTOMER TYPE:", typeof customer);
    console.log("🔥 CUSTOMER VALUE:", customer);
    console.log("🔥 FULL ADDRESS:", fullAddress);

    if (!regionCode || !systemId || !customer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "postcode",
      "propertyType",
      "existingSystemType",
      "systemLocation",
    ];

    for (const field of requiredFields) {
      if (!customer[field]?.trim()) {
        return NextResponse.json(
          { error: `Missing customer field: ${field}` },
          { status: 400 }
        );
      }
    }

    const region = await prisma.region.findUnique({
      where: { code: regionCode },
    });
    if (!region) return NextResponse.json({ error: "Invalid region" }, { status: 400 });

    const system = await prisma.system.findUnique({
      where: { id: systemId },
    });
    if (!system) return NextResponse.json({ error: "System not found" }, { status: 404 });

    const systemPrice = await prisma.systemPrice.findFirst({
      where: { systemId, regionId: region.id },
    });
    if (!systemPrice)
      return NextResponse.json({ error: "System price not found" }, { status: 404 });

    const extras = await prisma.extraPrice.findMany({
      where: { regionId: region.id, extraId: { in: extraIds } },
    });

    const basePrice = Number(systemPrice.price);
    const extrasTotal = extras.reduce((sum, e) => sum + Number(e.price), 0);
    const subtotalExGst = basePrice + extrasTotal;
    const gst = subtotalExGst * 0.1;
    const totalIncGst = subtotalExGst + gst;

    // ✅ SAVE CONFIRMATION (FIXED SNAPSHOT)
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

        // ✅ FIX — STORE FULL ADDRESS
        customerSnapshot: {
          ...customer,
          address: fullAddress,
        },

        insurerId: session?.user?.id || null,
      },
    });

    // ✅ SEND FULL ADDRESS TO CMS
    await sendLeadToCMS({
      lead_data: {
        status: "d651",
        source: "2d2e",
        source_domain: process.env.NEXT_PUBLIC_BASE_URL || "localhost",
        source_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/pricing`,
        user_ip: req.headers.get("x-forwarded-for") ?? "127.0.0.1",
        utm_source: "App",
        utm_medium: "Insurer App",
        enquiry_type: CMS_ENQUIRY_TYPES.new_system,
        property_type:
          CMS_PROPERTY_TYPES[customer.propertyType as keyof typeof CMS_PROPERTY_TYPES],
        system_type:
          CMS_EXISTING_SYSTEM_TYPES[
            customer.existingSystemType as keyof typeof CMS_EXISTING_SYSTEM_TYPES
          ],
        system_location:
          CMS_SYSTEM_LOCATIONS[
            customer.systemLocation as keyof typeof CMS_SYSTEM_LOCATIONS
          ],

        enquiry: `Insurer price confirmation #${confirmation.id}`,

        // ✅ FIXED LOCATION
        location: {
          address: fullAddress,
          suburb: customer.suburb || "",
          postcode: customer.postcode,
        },
      },
      contact_data: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
    });

    return NextResponse.json({
      success: true,
      confirmationId: confirmation.id,
    });
  } catch (err: any) {
    console.error("Confirm route failed:", err.message || err);
    return NextResponse.json(
      { error: "Internal server error – check logs" },
      { status: 500 }
    );
  }
}