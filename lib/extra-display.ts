// Customer-facing wording for a selected extra on the quote page and quote PDF.
// "Remove old tank & disposal" names the customer's existing system, e.g.
// "Remove old electric tank & disposal". "Not Sure" / "No Existing System" have
// no type to name, so they keep the standard wording.
const REMOVE_OLD_TANK_CODE = "remove_old_tank";

const EXISTING_TANK_LABELS: Record<string, string> = {
  Electric: "electric",
  Gas: "gas",
  Solar: "solar",
  "Heat Pump": "heat pump",
};

// Fixed text listed on every job, not priced extras. Customer totals include GST
// in both GST modes, so "GST inclusive" holds either way.
export const STANDARD_INCLUDED_HEADING = "Included on all jobs:";

export const STANDARD_INCLUDED_LINES = [
  "Plumbing alterations and pipework fully insulated",
  "Electrical disconnection and reconnection",
  "QBCC form 4 council fees paid",
  "GST inclusive",
] as const;

// Standard on heat pumps, so it's listed without being a priced extra. Some older
// heat pump quotes saved it as an extra; those already list it.
export const ISOLATOR_RCD_NAME = "Electrical isolator & RCD";

export function showsStandardIsolator(systemType: string, extras: { code: string }[]): boolean {
  return systemType === "heat_pump" && !extras.some((e) => e.code === "electrical_isolator_rcd");
}

export function extraDisplayName(
  extra: { code: string; name: string },
  existingSystemType?: string
): string {
  if (extra.code !== REMOVE_OLD_TANK_CODE) return extra.name;
  const label = existingSystemType ? EXISTING_TANK_LABELS[existingSystemType] : undefined;
  return label ? extra.name.replace(/\bold tank\b/i, `old ${label} tank`) : extra.name;
}
