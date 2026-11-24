// Admin adjustments to a quote after it's been generated: custom items (e.g. a
// wall that has to come out) and swapping/adding a brand. Both keep the quote's
// existing money (extras, relocation, regional fee) and change only what was
// adjusted. Adjustments are stored in customerSnapshot so they flow through to
// the PDFs, the lock-time confirmation and the CRM note like everything else.
import { GST_RATE, type GstMode, type OptionPricing } from "@/lib/gst";
import { HEAT_PUMP_BANDS } from "@/lib/heat-pump-bands";

export type CustomItem = { id: string; label: string; amount: number };
export type ChangeLogEntry = { at: string; by: string; text: string };

// Most options a quote may hold once brands are added (the PDF lays them out
// side by side, so more than this gets too narrow).
export const MAX_QUOTE_OPTIONS = 4;

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

type MoneyFields = {
  basePriceExGst: unknown;
  extrasTotalExGst: unknown;
  subtotalExGst: unknown;
  gst: unknown;
  totalIncGst: unknown;
};

export function customItemsOf(snapshot: Record<string, any>): CustomItem[] {
  return Array.isArray(snapshot.customItems) ? (snapshot.customItems as CustomItem[]) : [];
}

export function customItemsTotal(items: CustomItem[]): number {
  return round2(items.reduce((sum, i) => sum + Number(i.amount), 0));
}

/**
 * Adds `delta` (entered on the site's GST basis) to an option's extras and
 * recomputes the rest. The system price is left exactly as it was: inclusive
 * moves the customer total and backs GST out of it; exclusive moves the ex-GST
 * extras and adds GST on top.
 */
export function shiftOptionExtras(o: MoneyFields, delta: number, mode: GstMode): OptionPricing {
  const base = Number(o.basePriceExGst);
  if (mode === "inclusive") {
    const totalIncGst = round2(Number(o.totalIncGst) + delta);
    const subtotalExGst = round2(totalIncGst / (1 + GST_RATE));
    return {
      basePriceExGst: base,
      extrasTotalExGst: round2(subtotalExGst - base),
      subtotalExGst,
      gst: round2(totalIncGst - subtotalExGst),
      totalIncGst,
    };
  }
  const extrasTotalExGst = round2(Number(o.extrasTotalExGst) + delta);
  const subtotalExGst = round2(base + extrasTotalExGst);
  const gst = round2(subtotalExGst * GST_RATE);
  return { basePriceExGst: base, extrasTotalExGst, subtotalExGst, gst, totalIncGst: round2(subtotalExGst + gst) };
}

/**
 * The quote's entered extras total (extras + relocation + regional fee + custom
 * items) on the site's GST basis, for pricing a newly swapped-in system. New
 * quotes save it (snapshot.extrasEntered); older ones are worked back from an
 * existing option. Inclusive needs that option's entered system price: pass its
 * current price if it still matches, as GST-backing it out can lose a cent.
 */
export function enteredExtrasTotal(
  snapshot: Record<string, any>,
  anyOption: MoneyFields,
  mode: GstMode,
  currentBasePrice?: number
): number {
  const custom = customItemsTotal(customItemsOf(snapshot));
  if (typeof snapshot.extrasEntered === "number") return round2(snapshot.extrasEntered + custom);
  if (mode === "inclusive") {
    const baseExGst = Number(anyOption.basePriceExGst);
    const enteredBase =
      currentBasePrice !== undefined && round2(currentBasePrice / (1 + GST_RATE)) === baseExGst
        ? currentBasePrice
        : round2(baseExGst * (1 + GST_RATE));
    return round2(Number(anyOption.totalIncGst) - enteredBase);
  }
  return round2(Number(anyOption.extrasTotalExGst));
}

/** Same size filter the quote was generated with (heat pumps use a size band). */
export function capacityFilterFor(
  quote: { systemType: string; capacityLitres: number },
  snapshot: Record<string, any>
) {
  if (quote.systemType === "heat_pump" && snapshot.sizeBand) {
    const band = HEAT_PUMP_BANDS.find((b) => b.label === snapshot.sizeBand);
    if (band) return { capacityLitres: { gte: band.min, lte: band.max } };
  }
  return { capacityLitres: quote.capacityLitres };
}

/** Clears a homeowner approval so they approve the changed quote again. */
export const CLEAR_APPROVAL = {
  status: "presented" as const,
  selectedOptionId: null,
  approvedByName: null,
  approvedAt: null,
  approvalIp: null,
};

export function withLogEntry(
  snapshot: Record<string, any>,
  by: string,
  text: string
): ChangeLogEntry[] {
  const log: ChangeLogEntry[] = Array.isArray(snapshot.changeLog) ? snapshot.changeLog : [];
  return [...log, { at: new Date().toISOString(), by, text }];
}
