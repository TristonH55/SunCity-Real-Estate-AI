export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderQuotePdf } from "@/lib/quote-pdf";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // This route is outside the middleware matcher — enforce auth + ownership here.
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Light ownership check before doing the (heavier) PDF render.
  const owner = await prisma.quote.findUnique({
    where: { id },
    select: { agentId: true },
  });
  if (!owner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const isOwner = owner.agentId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rendered = await renderQuotePdf(id);
  if (!rendered) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(rendered.buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${rendered.filename}`,
    },
  });
}
