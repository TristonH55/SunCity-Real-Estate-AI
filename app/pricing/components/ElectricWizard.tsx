"use client";

/**
 * ElectricWizard — Step-3 branching flow for ELECTRIC (and, as a placeholder,
 * GAS) systems. Rendered by the pricing page in place of the flat ExtrasList.
 *
 * Three flow modes:
 *  - Same position (existing ground/wall tank stays put) → priced menu items.
 *  - Relocation (existing tank moves) → new-location + relocation pricing.
 *  - FRESH INSTALL (existing = roof Thermosiphon Solar, or "I don't have one")
 *    → the old unit isn't a ground/wall tank, so we skip "where is the current
 *    system / same position" and just ask where the NEW system goes.
 *
 * Regulation (Darren): whenever the location changes (relocation or fresh
 * install) the electrical isolator & RCD is REQUIRED — not an optional Yes/No.
 *
 * Output contract: onChange(extraIds), onCompletionChange, onMetaChange, onLocationChange.
 */

import { useEffect, useMemo, useState } from "react";
import ToggleButton from "./ToggleButton";
import ExtraInfo from "./ExtraInfo";
import { isValidRelocationMetres } from "@/lib/relocation-pricing";

type Extra = {
  extraId: string;
  code: string;
  name: string;
  priceExGst: number;
  included: boolean;
  infoText?: string | null;
  brochureUrl?: string | null;
};

export type RelocationMeta =
  | { newLocation: "outside"; metres: number; requiresSiteVisit: false }
  | { newLocation: "inside"; requiresSiteVisit: true }
  | null;

type Props = {
  region: string;
  systemType: string;
  selectedExtras: string[];
  onChange: (extras: string[]) => void;
  onCompletionChange?: (complete: boolean) => void;
  onMetaChange?: (relocation: RelocationMeta) => void;
  onLocationChange?: (loc: "inside" | "outside" | null) => void;
  existingType?: string | null; // Step-1 "what do you have?" — drives the fresh-install path
};

// Extra codes this wizard maps answers onto (must match prisma seed / upsert).
const CODE = {
  CUPBOARD: "cupboard_install_electric",
  TRAY: "safe_catch_tray_electric",
  VALVE: "mildred_valve_electric",
  SUPPORT_BASE: "support_base_electric",
  ISOLATOR: "electrical_isolator_rcd",
  REMOVE_TANK: "remove_old_tank",
  INTERNAL_RELOCATION: "internal_relocation_electric",
} as const;

// Remove old tank & disposal ($0) is always included. The isolator is required
// on a location change and optional otherwise (handled below).
const ALWAYS_INCLUDED = [CODE.REMOVE_TANK];

const money = (n: number) =>
  n.toLocaleString("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0 });

function OptionPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; hint?: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-4 py-2 rounded-lg font-semibold border transition ${
            value === o.value
              ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.4)]"
              : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
          }`}
        >
          {o.label}
          {o.hint && <span className="ml-2 text-xs opacity-80">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

function Question({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-white">{title}</p>
        {right}
      </div>
      {children}
    </div>
  );
}

export default function ElectricWizard({
  region,
  systemType,
  onChange,
  onCompletionChange,
  onMetaChange,
  onLocationChange,
  existingType,
}: Props) {
  const [byCode, setByCode] = useState<Record<string, Extra>>({});
  const [loading, setLoading] = useState(true);

  // A roof-mounted (Thermosiphon Solar) existing system, or no existing system,
  // means the new electric tank is a brand-new install (never "same position").
  const isFreshInstall = existingType === "solar_thermosiphon" || existingType === "none";

  // Branching answers
  const [currentLocation, setCurrentLocation] = useState<"inside" | "outside" | null>(null);
  const [samePosition, setSamePosition] = useState<"yes" | "no" | null>(null);
  const [openOrCupboard, setOpenOrCupboard] = useState<"open" | "cupboard" | null>(null);
  const [hasTray, setHasTray] = useState<"yes" | "no" | null>(null);
  const [trayReusable, setTrayReusable] = useState<"yes" | "no" | null>(null);
  const [hasBase, setHasBase] = useState<"yes" | "no" | null>(null);
  const [baseReusable, setBaseReusable] = useState<"yes" | "no" | null>(null);
  const [newLocation, setNewLocation] = useState<"inside" | "outside" | null>(null);
  const [metres, setMetres] = useState(""); // relocation distance (outside move)
  const [needsBase, setNeedsBase] = useState<"yes" | "no" | null>(null);
  const [isolator, setIsolator] = useState<"yes" | "no" | null>(null);

  const resetBranches = () => {
    setOpenOrCupboard(null);
    setHasTray(null);
    setTrayReusable(null);
    setHasBase(null);
    setBaseReusable(null);
    setNewLocation(null);
    setMetres("");
    setNeedsBase(null);
  };
  const resetAll = () => {
    setCurrentLocation(null);
    setSamePosition(null);
    setIsolator(null);
    resetBranches();
  };

  // Load electric extras, keyed by code. Gas temporarily reuses the electric
  // add-ons (type=electric) until Darren specs a dedicated gas flow.
  useEffect(() => {
    if (!region || (systemType !== "electric" && systemType !== "gas")) return;
    setLoading(true);
    fetch(`/api/pricing/extras?region=${region}&type=electric`)
      .then((res) => res.json())
      .then((data: Extra[]) => {
        const map: Record<string, Extra> = {};
        for (const e of data) map[e.code] = e;
        setByCode(map);
        resetAll();
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, systemType]);

  // Reset the flow if the existing-system answer (Step 1) changes.
  useEffect(() => {
    resetAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingType]);

  const metresNum = parseInt(metres, 10);
  const metresValid = isValidRelocationMetres(metresNum);

  // A location change = relocation of an existing tank, or a fresh install.
  const changingLocation = isFreshInstall || samePosition === "no";

  // Relocation metadata (lineal-metre pricing / site-visit flag). Fresh installs
  // carry neither (nothing is being moved).
  const relocationMeta: RelocationMeta = useMemo(() => {
    if (isFreshInstall) return null;
    if (samePosition !== "no" || !newLocation) return null;
    if (newLocation === "inside") return { newLocation: "inside", requiresSiteVisit: true };
    if (!metresValid) return null;
    return { newLocation: "outside", metres: metresNum, requiresSiteVisit: false };
  }, [isFreshInstall, samePosition, newLocation, metresValid, metresNum]);

  // Which Extra codes are selected, derived from the answers.
  const selectedCodes = useMemo(() => {
    const codes: string[] = [...ALWAYS_INCLUDED];

    // Isolator/RCD — required by regulation on a location change; else optional.
    if (changingLocation) codes.push(CODE.ISOLATOR);
    else if (isolator === "yes") codes.push(CODE.ISOLATOR);

    if (isFreshInstall) {
      if (newLocation === "inside") {
        codes.push(CODE.INTERNAL_RELOCATION); // inside install → +$125
        if (openOrCupboard === "cupboard") codes.push(CODE.CUPBOARD);
        if (hasTray === "no") codes.push(CODE.TRAY, CODE.VALVE);
        else if (hasTray === "yes" && trayReusable === "no") codes.push(CODE.TRAY);
      } else if (newLocation === "outside") {
        if (needsBase === "yes") codes.push(CODE.SUPPORT_BASE);
      }
    } else if (currentLocation && samePosition) {
      if (samePosition === "yes") {
        if (currentLocation === "inside") {
          codes.push(CODE.INTERNAL_RELOCATION); // inside install → +$125
          if (openOrCupboard === "cupboard") codes.push(CODE.CUPBOARD);
          if (hasTray === "no") codes.push(CODE.TRAY, CODE.VALVE);
          else if (hasTray === "yes" && trayReusable === "no") codes.push(CODE.TRAY);
        } else {
          if (hasBase === "no") codes.push(CODE.SUPPORT_BASE);
          else if (hasBase === "yes" && baseReusable === "no") codes.push(CODE.SUPPORT_BASE);
        }
      } else {
        // relocation of an existing tank
        if (newLocation === "outside" && needsBase === "yes") codes.push(CODE.SUPPORT_BASE);
        if (newLocation === "inside") codes.push(CODE.INTERNAL_RELOCATION);
      }
    }
    return codes.filter((c) => byCode[c]);
  }, [
    byCode,
    isFreshInstall,
    changingLocation,
    currentLocation,
    samePosition,
    openOrCupboard,
    hasTray,
    trayReusable,
    hasBase,
    baseReusable,
    newLocation,
    needsBase,
    isolator,
  ]);

  const complete = useMemo(() => {
    if (isFreshInstall) {
      if (!newLocation) return false;
      if (newLocation === "inside") {
        if (!openOrCupboard || !hasTray) return false;
        if (hasTray === "yes" && !trayReusable) return false;
      } else if (newLocation === "outside") {
        if (!needsBase) return false;
      }
      return true; // isolator is forced-on, no answer needed
    }
    if (!currentLocation || !samePosition) return false;
    if (samePosition === "yes") {
      if (!isolator) return false; // optional here, but must be answered
      if (currentLocation === "inside") {
        if (!openOrCupboard || !hasTray) return false;
        if (hasTray === "yes" && !trayReusable) return false;
        return true;
      }
      if (!hasBase) return false;
      if (hasBase === "yes" && !baseReusable) return false;
      return true;
    }
    // relocation — isolator forced-on
    if (!newLocation) return false;
    if (newLocation === "outside") {
      if (!metresValid) return false;
      if (!needsBase) return false;
    }
    return true;
  }, [
    isFreshInstall,
    currentLocation,
    samePosition,
    openOrCupboard,
    hasTray,
    trayReusable,
    hasBase,
    baseReusable,
    newLocation,
    metresValid,
    needsBase,
    isolator,
  ]);

  // Report selected ids + completeness + relocation meta to the parent.
  const selectedIds = useMemo(
    () => selectedCodes.map((c) => byCode[c].extraId),
    [selectedCodes, byCode]
  );
  const idsKey = selectedIds.join(",");
  useEffect(() => {
    onChange(selectedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);
  useEffect(() => {
    onCompletionChange?.(complete);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete]);
  const metaKey = JSON.stringify(relocationMeta);
  useEffect(() => {
    onMetaChange?.(relocationMeta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaKey]);
  // Report the system location for the CRM: fresh install → where the new unit
  // goes; otherwise the existing system's location.
  const reportedLocation = isFreshInstall ? newLocation : currentLocation;
  useEffect(() => {
    onLocationChange?.(reportedLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportedLocation]);

  if (loading) {
    return <p className="text-slate-400">Loading questions…</p>;
  }

  const Note = ({ tone, children }: { tone: "amber" | "info"; children: React.ReactNode }) => (
    <div
      className={`mt-3 rounded-lg px-4 py-3 text-sm border ${
        tone === "amber"
          ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
          : "bg-sky-500/10 border-sky-500/30 text-sky-200"
      }`}
    >
      {children}
    </div>
  );

  // Costs are hidden during the questions — show the item name only.
  const priced = (code: string) => byCode[code]?.name ?? code;

  // Inside-install sub-questions (open/cupboard + safe tray) reused by the
  // same-position-inside branch and the fresh-install-inside branch.
  const insideItems = (
    <>
      <Question title="Open area or in a cupboard?">
        <OptionPills
          options={[
            { value: "open", label: "Open area", hint: "+$0" },
            { value: "cupboard", label: "Cupboard", hint: "+$50" },
          ]}
          value={openOrCupboard}
          onChange={setOpenOrCupboard}
        />
      </Question>

      <Question title="Is there a Safe / Catch Tray?">
        <div className="flex items-center gap-4 flex-wrap">
          <ToggleButton
            value={hasTray}
            onChange={(v) => {
              setHasTray(v);
              setTrayReusable(null);
            }}
          />
          <ExtraInfo extra={byCode[CODE.TRAY]} />
        </div>
        {hasTray === "no" && (
          <Note tone="amber">
            ⚠ May be required to meet regulations:
            <div className="mt-1">• {priced(CODE.TRAY)}</div>
            <div>• {priced(CODE.VALVE)}</div>
          </Note>
        )}
      </Question>

      {hasTray === "yes" && (
        <Question title="Is it in good condition and reusable?">
          <ToggleButton value={trayReusable} onChange={setTrayReusable} />
          {trayReusable === "no" && <Note tone="amber">Replacement {priced(CODE.TRAY)}</Note>}
          {trayReusable === "yes" && <Note tone="info">No extra cost.</Note>}
        </Question>
      )}
    </>
  );

  return (
    <div>
      <p className="text-sm text-slate-400 mb-5">
        Answer each question — more will appear as you go.
      </p>

      {isFreshInstall ? (
        /* FRESH INSTALL — old unit is on the roof (or none), so it's a brand-new
           placement: ask only where the NEW system goes. */
        <>
          <Question title="Where will the new electric system be installed?">
            <OptionPills
              options={[
                { value: "inside", label: "Inside" },
                { value: "outside", label: "Outside" },
              ]}
              value={newLocation}
              onChange={(v) => {
                setNewLocation(v);
                setOpenOrCupboard(null);
                setHasTray(null);
                setTrayReusable(null);
                setNeedsBase(null);
              }}
            />
          </Question>

          {newLocation === "inside" && insideItems}

          {newLocation === "outside" && (
            <Question title="Will a concrete / poly support base be required?">
              <div className="flex items-center gap-4 flex-wrap">
                <ToggleButton value={needsBase} onChange={setNeedsBase} />
                <ExtraInfo extra={byCode[CODE.SUPPORT_BASE]} />
              </div>
              {needsBase === "yes" && <Note tone="amber">{priced(CODE.SUPPORT_BASE)}</Note>}
            </Question>
          )}
        </>
      ) : (
        <>
          {/* Q1 — current location */}
          <Question title="Where is the current system?">
            <OptionPills
              options={[
                { value: "inside", label: "Inside" },
                { value: "outside", label: "Outside" },
              ]}
              value={currentLocation}
              onChange={(v) => {
                setCurrentLocation(v);
                setSamePosition(null);
                setIsolator(null);
                resetBranches();
              }}
            />
          </Question>

          {/* Q2 — same position */}
          {currentLocation && (
            <Question title="Same position as the existing system?">
              <ToggleButton
                value={samePosition}
                onChange={(v) => {
                  setSamePosition(v);
                  setIsolator(null);
                  resetBranches();
                }}
              />
            </Question>
          )}

          {/* INSIDE + SAME POSITION */}
          {currentLocation === "inside" && samePosition === "yes" && insideItems}

          {/* OUTSIDE + SAME POSITION */}
          {currentLocation === "outside" && samePosition === "yes" && (
            <>
              <Question title="Is it sitting on a concrete / support base?">
                <div className="flex items-center gap-4 flex-wrap">
                  <ToggleButton
                    value={hasBase}
                    onChange={(v) => {
                      setHasBase(v);
                      setBaseReusable(null);
                    }}
                  />
                  <ExtraInfo extra={byCode[CODE.SUPPORT_BASE]} />
                </div>
                {hasBase === "no" && <Note tone="amber">{priced(CODE.SUPPORT_BASE)}</Note>}
              </Question>

              {hasBase === "yes" && (
                <Question title="Is it in good condition and reusable?">
                  <ToggleButton value={baseReusable} onChange={setBaseReusable} />
                  {baseReusable === "no" && <Note tone="amber">{priced(CODE.SUPPORT_BASE)}</Note>}
                  {baseReusable === "yes" && <Note tone="info">No extra cost.</Note>}
                </Question>
              )}
            </>
          )}

          {/* RELOCATION (different position) */}
          {samePosition === "no" && (
            <>
              <Question title="Will the new system be installed inside or outside?">
                <OptionPills
                  options={[
                    { value: "inside", label: "Inside" },
                    { value: "outside", label: "Outside" },
                  ]}
                  value={newLocation}
                  onChange={(v) => {
                    setNewLocation(v);
                    setMetres("");
                    setNeedsBase(null);
                  }}
                />
              </Question>

              {newLocation === "outside" && (
                <>
                  <Question title="How far will the new system move? (lineal metres)">
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="number"
                        min={2}
                        max={30}
                        value={metres}
                        onChange={(e) => setMetres(e.target.value)}
                        placeholder="e.g. 8"
                        className="w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition"
                      />
                      <span className="text-sm text-slate-400">metres (2–30)</span>
                    </div>
                  </Question>

                  <Question title="Will a concrete / poly support base be required?">
                    <div className="flex items-center gap-4 flex-wrap">
                      <ToggleButton value={needsBase} onChange={setNeedsBase} />
                      <ExtraInfo extra={byCode[CODE.SUPPORT_BASE]} />
                    </div>
                    {needsBase === "yes" && <Note tone="amber">{priced(CODE.SUPPORT_BASE)}</Note>}
                  </Question>
                </>
              )}

              {newLocation === "inside" && (
                <Note tone="info">
                  Internal relocation — final price subject to a <strong>site visit</strong>. New pipes
                  and electrical may need to run through walls (assessed on site; in some cases may not
                  be possible). A SunCity site visit will be arranged. The quote below covers the system
                  and standard items only.
                </Note>
              )}
            </>
          )}
        </>
      )}

      {/* Electrical isolator & RCD — required on a location change, else optional. */}
      <div className="mt-6 pt-4 border-t border-white/10">
        {changingLocation ? (
          <Note tone="amber">
            <strong>{priced(CODE.ISOLATOR)}</strong> — required by regulation for a relocation / new
            install (included).
          </Note>
        ) : (
          <Question title="Is an electrical isolator & RCD required?">
            <ToggleButton value={isolator} onChange={setIsolator} />
            {isolator === "yes" && <Note tone="amber">{priced(CODE.ISOLATOR)}</Note>}
          </Question>
        )}
      </div>

      {/* Standard (always included) */}
      <div className="mt-2 pt-4 border-t border-white/10">
        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Standard (included)</p>
        {ALWAYS_INCLUDED.map((c) =>
          byCode[c] ? (
            <div key={c} className="flex justify-between text-sm py-0.5">
              <span className="text-slate-200">{byCode[c].name}</span>
              <span className={byCode[c].priceExGst === 0 ? "text-slate-400" : "text-amber-300"}>
                {byCode[c].priceExGst === 0 ? "Included ($0)" : `+${money(byCode[c].priceExGst)}`}
              </span>
            </div>
          ) : null
        )}
      </div>

      {!complete && (
        <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm font-semibold text-red-300">
          ⚠️ Please answer all questions before continuing.
        </div>
      )}
    </div>
  );
}
