import { prisma } from "@/lib/prisma";

/** Australian GST rate (10%). Single source of truth. */
export const GST_RATE = 0.1;

/**
 * Site-wide GST handling mode, persisted in AppSetting (key `gst_mode`).
 * - `inclusive` (default): the prices Darren enters already INCLUDE GST. The
 *   customer total equals the entered price; GST is the included portion.
 * - `exclusive` (legacy revert): entered prices are ex-GST and 10% is added on
 *   top — the app's original behaviour.
 */
export type GstMode = "inclusive" | "exclusive";

export const GST_MODE_KEY = "gst_mode";
export const DEFAULT_GST_MODE: GstMode = "inclusive";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Reads the current site-wide GST mode; defaults to inclusive if unset. */
export async function getGstMode(): Promise<GstMode> {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: GST_MODE_KEY } });
    return row?.value === "exclusive" ? "exclusive" : "inclusive";
  } catch {
    return DEFAULT_GST_MODE;
  }
}

export type OptionPricing = {
  basePriceExGst: number;
  extrasTotalExGst: number;
  subtotalExGst: number;
  gst: number;
  totalIncGst: number;
};

/**
 * Computes a quote option's 5 price fields from a base + extras total, honouring
 * the GST mode. The returned fields keep their literal meaning in BOTH modes
 * (basePriceExGst is always ex-GST, gst is the tax portion, totalIncGst is the
 * customer-facing inclusive total) so every downstream display stays correct.
 */
export function computeOptionPricing(
  base: number,
  extrasTotal: number,
  mode: GstMode
): OptionPricing {
  if (mode === "inclusive") {
    // Entered prices already include GST → back the tax out.
    const totalIncGst = round2(base + extrasTotal);
    const subtotalExGst = round2(totalIncGst / (1 + GST_RATE));
    const gst = round2(totalIncGst - subtotalExGst);
    const basePriceExGst = round2(base / (1 + GST_RATE));
    // Derive extras from subtotal so base + extras === subtotal exactly (no cent drift).
    const extrasTotalExGst = round2(subtotalExGst - basePriceExGst);
    return { basePriceExGst, extrasTotalExGst, subtotalExGst, gst, totalIncGst };
  }

  // Legacy: entered prices are ex-GST, add 10% on top.
  const subtotalExGst = round2(base + extrasTotal);
  const gst = round2(subtotalExGst * GST_RATE);
  return {
    basePriceExGst: round2(base),
    extrasTotalExGst: round2(extrasTotal),
    subtotalExGst,
    gst,
    totalIncGst: round2(subtotalExGst + gst),
  };
}
