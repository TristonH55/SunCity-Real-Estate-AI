import crypto from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET!;
const PURPOSE = "quote";

/**
 * Signed, purpose-scoped token for the public homeowner approval link.
 * Payload `quote:<quoteId>:<ts>` is HMAC-signed so it can't be forged and an
 * admin-approval token (from lib/approval-token.ts) can't be replayed here.
 */
export function createQuoteApprovalToken(quoteId: string): string {
  const payload = `${PURPOSE}:${quoteId}:${Date.now()}`;
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

/** Returns the quoteId if the token is valid and not expired, else null. */
export function verifyQuoteApprovalToken(
  token: string,
  maxAgeMs = 1000 * 60 * 60 * 24 * 30 // 30 days
): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [purpose, quoteId, timestamp, signature] = decoded.split(":");

    if (purpose !== PURPOSE || !quoteId || !timestamp || !signature) {
      return null;
    }

    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(`${purpose}:${quoteId}:${timestamp}`)
      .digest("hex");

    if (expected !== signature) return null;
    if (Date.now() - Number(timestamp) > maxAgeMs) return null;

    return quoteId;
  } catch {
    return null;
  }
}
