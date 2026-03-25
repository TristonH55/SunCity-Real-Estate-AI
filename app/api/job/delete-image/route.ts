export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { id, imageUrl } = await req.json();

    const job = await prisma.pricingConfirmation.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updatedImages = job.images.filter((img) => img !== imageUrl);

    await prisma.pricingConfirmation.update({
      where: { id },
      data: {
        images: updatedImages,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE IMAGE ERROR:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}