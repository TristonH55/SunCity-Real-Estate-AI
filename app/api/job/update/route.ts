// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { id, notes, imageUrl } = body;

//     const job = await prisma.pricingConfirmation.update({
//       where: { id },
//       data: {
//         notes,
//         images: imageUrl
//           ? { push: imageUrl }
//           : undefined,
//       },
//     });

//     return NextResponse.json(job);
//   } catch (err) {
//     console.error("JOB UPDATE ERROR:", err);
//     return NextResponse.json({ error: "Failed" }, { status: 500 });
//   }
// }

//V2 last
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { id, notes, imageUrl } = body;

//     const existing = await prisma.pricingConfirmation.findUnique({
//       where: { id },
//     });

//     if (!existing) {
//       return NextResponse.json({ error: "Job not found" }, { status: 404 });
//     }

//     const updated = await prisma.pricingConfirmation.update({
//       where: { id },
//       data: {
//         notes: notes ?? existing.notes,
//         images: imageUrl
//           ? [...existing.images, imageUrl]
//           : existing.images,
//       },
//     });

//     return NextResponse.json(updated);
//   } catch (err) {
//     console.error("JOB UPDATE ERROR:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

//test
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnedConfirmation } from "@/lib/confirmation-access";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, imageUrl, notes } = body;

    // Auth + per-agent ownership (route is outside the middleware matcher).
    const { confirmation: job, error } = await getOwnedConfirmation(id);
    if (error) return error;

    const updatedImages = imageUrl
      ? [...(job!.images || []), imageUrl]
      : job!.images;

    const updated = await prisma.pricingConfirmation.update({
      where: { id },
      data: {
        notes: notes ?? job!.notes,
        images: updatedImages,
      },
    });

    return NextResponse.json({ success: true, job: updated });
  } catch (err) {
    console.error("JOB UPDATE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}