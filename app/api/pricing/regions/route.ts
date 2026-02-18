export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "lib/prisma";

export async function GET() {
    const regions = await prisma.region.findMany({
        orderBy: { name: "asc" },
        select: {
            id: true,
            code: true,
            name: true,
        },
    });

    return NextResponse.json(regions);
}
