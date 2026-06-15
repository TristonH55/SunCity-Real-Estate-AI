export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnedConfirmation } from "@/lib/confirmation-access";

export async function POST(req: NextRequest) {
  try {
    const { jobId, message } = await req.json();

    // Auth + per-agent ownership (route is outside the middleware matcher).
    const { session, error } = await getOwnedConfirmation(jobId);
    if (error) return error;

    const note = await prisma.jobNote.create({
      data: {
        jobId,
        message,
        userId: session!.user.id,
      },
    });

    return NextResponse.json(note);
  } catch (err) {
    console.error("MESSAGE ERROR:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
