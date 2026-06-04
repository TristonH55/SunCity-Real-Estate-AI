import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

type Role = "admin" | "insurer";

/**
 * Auth guard for API routes (returns JSON, never redirects).
 *
 * Usage:
 *   const { error } = await requireApiRole("admin");
 *   if (error) return error;
 *
 * - Not logged in        -> 401 Unauthorized
 * - Logged in, wrong role -> 403 Forbidden
 * - Admins are allowed through to any role-gated route.
 */
export async function requireApiRole(role: Role) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // Admins can access everything
  if (session.user.role === "admin") {
    return { session, error: null };
  }

  if (session.user.role !== role) {
    return {
      session,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session, error: null };
}
