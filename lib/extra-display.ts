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
  "All new valves required for regulations",
  "Plumbing alterations and pipework fully insulated",
  "Electrical disconnection and reconnection",
  "QBCC form 4 council fees paid",
  "GST inclusive",
] as const;

// The job-specific first line of the list above, saved on the quote when it's
// created. "same" is only said when there's an existing system in that spot: no
// system, or a roof Thermosiphon being replaced by a ground tank, has no position
// to keep. A relocation decides the location over the Step-3 answer because the
// heat pump flow reports where the old unit was, not where the new one goes.
export function supplyInstallLine({
  systemType,
  existingType,
  systemLocation,
  relocation,
  roofToGround,
}: {
  systemType: string;
  existingType?: string | null;
  systemLocation: "inside" | "outside";
  relocation?: { newLocation: "inside" | "outside"; metres?: number } | null;
  roofToGround?: boolean;
}): string {
  if (systemType === "solar_thermosiphon") return "Supply and install new on roof";

  const location = relocation?.newLocation ?? systemLocation;
  const place = location === "inside" ? "internal" : "external";
  const noExistingPosition =
    roofToGround || existingType === "none" || existingType === "solar_thermosiphon";

  if (noExistingPosition) return `Supply and install new in ${place} location`;
  if (!relocation) return `Supply and install new in same ${place} location`;
  return relocation.newLocation === "outside"
    ? `Supply and install new in new ${place} location, ${relocation.metres} metres away`
    : `Supply and install new in new ${place} location`;
}

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
