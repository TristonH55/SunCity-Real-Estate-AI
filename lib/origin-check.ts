import { NextResponse } from "next/server";

/**
 * CSRF defence-in-depth for state-changing routes. If the request carries an
 * Origin header (browsers send it on fetch/POST), it must match our own site.
 * Requests with no Origin are allowed (non-browser/server-to-server); cookie
 * routes are still protected by SameSite=Lax. Returns a 403 NextResponse to
 * short-circuit on mismatch, or null to continue.
 */
export function checkOrigin(req: Request): NextResponse | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;

  const allowed = [process.env.NEXTAUTH_URL, process.env.NEXT_PUBLIC_BASE_URL]
    .filter(Boolean)
    .map((v) => {
      try {
        return new URL(v as string).origin;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as string[];

  // In local dev, allow localhost too (the env URLs usually point at the deployed
  // site). Never applied in production, so prod stays locked to the real URL.
  if (process.env.NODE_ENV !== "production") {
    allowed.push("http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000");
  }

  if (allowed.length === 0) return null; // not configured → don't lock out

  let reqOrigin: string;
  try {
    reqOrigin = new URL(origin).origin;
  } catch {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  if (!allowed.includes(reqOrigin)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  return null;
}
