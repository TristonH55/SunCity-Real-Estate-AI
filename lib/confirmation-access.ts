import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Auth + per-agent ownership guard for job (PricingConfirmation) routes, which
 * live OUTSIDE the middleware matcher. Returns the loaded confirmation when the
 * caller is the owning agent (its `insurerId`) or an admin; otherwise an error
 * NextResponse (401 / 400 / 404 / 403).
 */
export async function getOwnedConfirmation(id: string | undefined | null) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!id) {
    return {
      error: NextResponse.json({ error: "Missing job id" }, { status: 400 }),
    };
  }

  const confirmation = await prisma.pricingConfirmation.findUnique({
    where: { id },
  });
  if (!confirmation) {
    return {
      error: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }

  const isOwner = confirmation.insurerId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session, confirmation };
}
