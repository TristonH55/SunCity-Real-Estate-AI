/**
 * Lineal-metre relocation pricing for ELECTRIC "different position" jobs where
 * the new system goes OUTSIDE (an internal move is a site visit, not menu-priced).
 *
 * Darren's spec: $220 base + a per-metre rate set by the band the total distance
 * falls into (a flat rate applied to ALL metres, NOT progressive):
 *   2–5m  → $125/m
 *   6–10m → $110/m
 *   11–20m→ $95/m
 *   21–30m→ $80/m
 * e.g. 8m → $220 + 8 × $110 = $1,100 ;  2m → $220 + 2 × $125 = $470.
 *
 * This is the one add-on that doesn't fit the Extra/ExtraPrice model (quantity ×
 * tiered rate), so it's computed here and carried as a customerSnapshot line item.
 */

export const RELOCATION_BASE = 220;
export const RELOCATION_MIN_METRES = 2;
export const RELOCATION_MAX_METRES = 30;

/** Flat $/m rate for the band the total distance falls into. */
export function relocationPerMetreRate(metres: number): number {
  if (metres <= 5) return 125;
  if (metres <= 10) return 110;
  if (metres <= 20) return 95;
  return 80;
}

/** True if the metres value is a valid lineal-metre input (2–30, integer). */
export function isValidRelocationMetres(metres: unknown): metres is number {
  const m = Number(metres);
  return (
    Number.isFinite(m) &&
    Number.isInteger(m) &&
    m >= RELOCATION_MIN_METRES &&
    m <= RELOCATION_MAX_METRES
  );
}

/**
 * Total relocation cost (ex GST) for an outside relocation of `metres`.
 * Returns 0 for out-of-range/invalid input (caller should validate first).
 */
export function computeRelocationCost(metres: number): number {
  if (!isValidRelocationMetres(metres)) return 0;
  return RELOCATION_BASE + metres * relocationPerMetreRate(metres);
}
