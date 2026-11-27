// Twilio Verify over its REST API (no SDK needed). Twilio stores the code,
// handles expiry (10 min) and Fraud Guard; we just start and check.

const VERIFY_BASE = "https://verify.twilio.com/v2/Services";

function config() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const service = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!sid || !token || !service) {
    throw new Error("Twilio is not configured (TWILIO_* env vars missing)");
  }
  return {
    service,
    auth: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
  };
}

async function post(path: string, body: Record<string, string>) {
  const { service, auth } = config();
  const res = await fetch(`${VERIFY_BASE}/${service}/${path}`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

/** Texts a code to an E.164 mobile. Returns false if Twilio refused. */
export async function sendVerificationCode(phone: string): Promise<boolean> {
  const r = await post("Verifications", { To: phone, Channel: "sms" });
  if (!r.ok) console.error("[twilio] send failed:", r.status, r.data?.code, r.data?.message);
  return r.ok;
}

/** True only when the code is correct and still valid for that mobile. */
export async function checkVerificationCode(phone: string, code: string): Promise<boolean> {
  if (!/^\d{4,10}$/.test(code)) return false;
  const r = await post("VerificationCheck", { To: phone, Code: code });
  // 404 = no pending code (expired, used or never sent).
  if (!r.ok && r.status !== 404) {
    console.error("[twilio] check failed:", r.status, r.data?.code, r.data?.message);
  }
  return r.ok && r.data?.status === "approved";
}
