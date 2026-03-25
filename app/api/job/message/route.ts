export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, message } = await req.json();

    const note = await prisma.jobNote.create({
      data: {
        jobId,
        message,
        userId: session.user.id,
      },
    });

    return NextResponse.json(note);
  } catch (err) {
    console.error("MESSAGE ERROR:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}