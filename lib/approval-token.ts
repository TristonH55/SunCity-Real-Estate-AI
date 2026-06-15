import crypto from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET!;

export function createApprovalToken(userId: string) {
  const payload = `${userId}:${Date.now()}`;
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");

  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export function verifyApprovalToken(
  token: string,
  maxAgeMs = 1000 * 60 * 60 * 24
) {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [userId, timestamp, signature] = decoded.split(":");
    if (!userId || !timestamp || !signature) return null;

    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(`${userId}:${timestamp}`)
      .digest("hex");

    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    if (Date.now() - Number(timestamp) > maxAgeMs) return null;

    return userId;
  } catch {
    return null;
  }
}
