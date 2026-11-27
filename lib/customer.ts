// Public customers: shared rules for mobile numbers, SMS codes, login timeout
// and the weekly quote cap.

export const OFFICE_PHONE = "1300 728 122";

// Customers are logged out after this long without using the site.
export const CUSTOMER_IDLE_MS = 4 * 60 * 60 * 1000;

// Quote cap: per mobile and per address, over a rolling 7 days.
export const CUSTOMER_QUOTES_PER_WEEK = 2;
export const QUOTE_CAP_MESSAGE = `You've reached your quote limit for this week. Please call us on ${OFFICE_PHONE} and we'll help.`;

// Resends allowed on the code screen (on top of the first code).
export const MAX_CODE_RESENDS = 2;

/**
 * Australian mobile → E.164 (+614XXXXXXXX), or null if it isn't one.
 * Accepts 0412 345 678, 04-1234-5678, +61 412 345 678, 61412345678.
 */
export function normaliseAuMobile(input: unknown): string | null {
  const digits = String(input ?? "").replace(/[^\d+]/g, "");
  let rest: string;
  if (digits.startsWith("+61")) rest = digits.slice(3);
  else if (digits.startsWith("61") && digits.length === 11) rest = digits.slice(2);
  else if (digits.startsWith("0")) rest = digits.slice(1);
  else rest = digits;
  return /^4\d{8}$/.test(rest) ? `+61${rest}` : null;
}

/** +61412345678 → 0412 345 678 (for display). */
export function displayAuMobile(e164: string | null | undefined): string {
  const m = /^\+614(\d{2})(\d{3})(\d{3})$/.exec(e164 ?? "");
  return m ? `04${m[1]} ${m[2]} ${m[3]}` : e164 ?? "";
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Address key for the quote cap: lowercase, spaces/punctuation collapsed. */
export function addressKey(address: unknown): string {
  return String(address ?? "")
    .toLowerCase()
    .replace(/,?\s*australia$/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** "Jane Mary Smith" → { firstName: "Jane", lastName: "Mary Smith" } */
export function splitName(name: string | null | undefined) {
  const parts = String(name ?? "").trim().split(/\s+/);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}
