import { Resend } from "resend";

// Use a placeholder when RESEND_API_KEY is absent so the constructor doesn't
// throw at module-import time (which breaks the Vercel build's "collect page
// data" step). Real sends require RESEND_API_KEY to be set at runtime; without
// it, email sends fail gracefully (callers handle send errors non-blockingly).
export const resend = new Resend(
  process.env.RESEND_API_KEY || "re_missing_api_key"
);