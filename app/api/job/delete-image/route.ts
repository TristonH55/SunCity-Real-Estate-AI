export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnedConfirmation } from "@/lib/confirmation-access";

export async function POST(req: NextRequest) {
  try {
    const { id, imageUrl } = await req.json();

    // Auth + per-agent ownership (route is outside the middleware matcher).
    const { confirmation: job, error } = await getOwnedConfirmation(id);
    if (error) return error;

    const updatedImages = job!.images.filter((img) => img !== imageUrl);

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