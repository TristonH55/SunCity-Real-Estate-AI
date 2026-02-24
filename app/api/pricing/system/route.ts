import { NextResponse } from "next/server";
import { prisma } from "lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const systemId = searchParams.get("systemId");

  if (!systemId) {
    return NextResponse.json({ error: "Missing systemId" }, { status: 400 });
  }

  const system = await prisma.system.findUnique({
    where: { id: systemId },
    select: {
      brand: true,
      model: true,
      capacityLitres: true,
      tankMaterial: true,
    },
  });

  return NextResponse.json(system);
}