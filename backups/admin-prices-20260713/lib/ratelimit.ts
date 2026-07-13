import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Duration = `${number} ${"ms" | "s" | "m" | "h" | "d"}`;

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Shared with the insurance app's Upstash DB; the `scre:` prefix keeps counters
// isolated. When creds are absent (e.g. local dev without Upstash), limiters are
// null and every check fail-opens.
const redis = url && token ? new Redis({ url, token }) : null;

function make(limit: number, window: Duration, name: string): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: `scre:${name}`,
    analytics: false,
  });
}

export const limiters = {
  login: make(5, "5 m", "login"),
  register: make(3, "1 h", "register"),
  approve: make(10, "1 h", "approve"),
  sendEmail: make(5, "1 h", "send-email"),
  lock: make(30, "1 m", "lock"),
  updateContact: make(30, "1 m", "update-contact"),
  google: make(60, "1 m", "google"),
};

/**
 * Returns true if allowed. Fail-open: if Upstash isn't configured or errors,
 * the request is allowed (so an Upstash outage can't lock out the business).
 */
export async function allow(
  limiter: Ratelimit | null,
  identifier: string
): Promise<boolean> {
  if (!limiter) return true;
  try {
    const res = await limiter.limit(identifier);
    return res.success;
  } catch (e) {
    console.error("[ratelimit] error (fail-open):", e);
    return true;
  }
}
