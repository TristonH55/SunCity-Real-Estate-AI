/**
 * Heat-pump size bands. Heat-pump capacities vary slightly per brand, so the
 * agent picks a band (not an exact litre value) and the quote engine returns the
 * cheapest system per brand whose capacity falls within the band.
 *
 * Single source of truth, shared by the Step-2 picker (SizeBandSelect) and the
 * quote route (which range-queries by min/max). The 50 L / 80 L heat pumps fall
 * outside every band and are therefore not selectable (by design).
 */

export type HeatPumpBand = {
  id: string;
  label: string;
  min: number; // inclusive litres
  max: number; // inclusive litres
};

export const HEAT_PUMP_BANDS: HeatPumpBand[] = [
  { id: "180-200", label: "180–200 L", min: 180, max: 200 },
  { id: "250-340", label: "250–340 L", min: 250, max: 340 },
  { id: "400-420", label: "400–420 L", min: 400, max: 420 },
];

export function findHeatPumpBand(id: string | null | undefined): HeatPumpBand | null {
  if (!id) return null;
  return HEAT_PUMP_BANDS.find((b) => b.id === id) ?? null;
}
