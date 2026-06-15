/**
 * Best-effort trusted client IP. On Vercel, `x-forwarded-for` / `x-vercel-forwarded-for`
 * are set by the platform edge (client-supplied values are overwritten), so the first
 * hop is the real client. Used for rate-limit keys and the e-signature audit record.
 */
export function clientIp(req: Request): string {
  const raw =
    req.headers.get("x-vercel-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for") ||
    "";
  return raw.split(",")[0].trim() || "unknown";
}
