"use client";

/**
 * ElectricWizard — Darren's "same-location replacement" branching question flow
 * for ELECTRIC systems only. Rendered by the pricing page in place of the flat
 * ExtrasList when systemType === "electric". Other system types are untouched.
 *
 * Output contract:
 *  - onChange(extraIds)            — selected Extra ids (existing pipeline).
 *  - onCompletionChange(complete)  — whether the tree is fully answered.
 *  - onMetaChange(relocation)      — relocation metadata (Phase 3): an outside
 *      move carries its lineal-metres (priced server-side); an internal move
 *      carries requiresSiteVisit. null when not a relocation. The quote route
 *      turns this into a priced line item / site-visit flag on the order.
 */

import { useEffect, useMemo, useState } from "react";
import ToggleButton from "./ToggleButton";
import { isValidRelocationMetres } from "@/lib/relocation-pricing";

type Extra = {
  extraId: string;
  code: string;
  name: string;
  priceExGst: number;
  included: boolean;
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

// Always part of an electric quote. The isolator/RCD is an optional Yes/No extra
// (Darren 2026-06-23), so only tank removal ($0) is auto-included.
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

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="font-semibold text-white">{title}</p>
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
}: Props) {
  const [byCode, setByCode] = useState<Record<string, Extra>>({});
  const [loading, setLoading] = useState(true);

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
  const [isolator, setIsolator] = useState<"yes" | "no" | null>(null); // optional extra (any electric job)

  const resetAll = () => {
    setCurrentLocation(null);
    setSamePosition(null);
    setIsolator(null);
    resetBranches();
  };
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

  // Load electric extras (now includes `code`), keyed by code.
  useEffect(() => {
    if (!region || systemType !== "electric") return;
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

  const metresNum = parseInt(metres, 10);
  const metresValid = isValidRelocationMetres(metresNum);

  // Relocation metadata reported to the parent (drives server-side pricing/flag).
  const relocationMeta: RelocationMeta = useMemo(() => {
    if (samePosition !== "no" || !newLocation) return null;
    if (newLocation === "inside")
      return { newLocation: "inside", requiresSiteVisit: true };
    if (!metresValid) return null; // outside move not complete until a valid distance
    return { newLocation: "outside", metres: metresNum, requiresSiteVisit: false };
  }, [samePosition, newLocation, metresValid, metresNum]);

  // Which Extra codes are currently selected, derived from the answers.
  const selectedCodes = useMemo(() => {
    const codes: string[] = [...ALWAYS_INCLUDED];
    if (isolator === "yes") codes.push(CODE.ISOLATOR);
    if (currentLocation && samePosition) {
      if (samePosition === "yes") {
        if (currentLocation === "inside") {
          // New unit stays inside → internal-install charge (+$125). No site
          // visit (straight swap); the cupboard/tray items below are additive.
          codes.push(CODE.INTERNAL_RELOCATION);
          if (openOrCupboard === "cupboard") codes.push(CODE.CUPBOARD);
          if (hasTray === "no") codes.push(CODE.TRAY, CODE.VALVE);
          else if (hasTray === "yes" && trayReusable === "no") codes.push(CODE.TRAY);
        } else {
          if (hasBase === "no") codes.push(CODE.SUPPORT_BASE);
          else if (hasBase === "yes" && baseReusable === "no") codes.push(CODE.SUPPORT_BASE);
        }
      } else {
        // relocation
        if (newLocation === "outside" && needsBase === "yes") codes.push(CODE.SUPPORT_BASE);
        // newLocation === "inside" → base internal-relocation charge (per region,
        // default $125), plus the site-visit flag/disclaimer for any extra on-site work.
        if (newLocation === "inside") codes.push(CODE.INTERNAL_RELOCATION);
      }
    }
    return codes.filter((c) => byCode[c]);
  }, [
    byCode,
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
    if (!isolator) return false; // isolator/RCD Yes/No required on every electric quote
    if (!currentLocation || !samePosition) return false;
    if (samePosition === "yes") {
      if (currentLocation === "inside") {
        if (!openOrCupboard || !hasTray) return false;
        if (hasTray === "yes" && !trayReusable) return false;
        return true;
      }
      if (!hasBase) return false;
      if (hasBase === "yes" && !baseReusable) return false;
      return true;
    }
    // relocation
    if (!newLocation) return false;
    if (newLocation === "outside") {
      if (!metresValid) return false;
      if (!needsBase) return false;
    }
    return true; // inside → site visit is a valid terminal state
  }, [
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
  // Report the existing-system location (Inside/Outside) up for the CRM code.
  useEffect(() => {
    onLocationChange?.(currentLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation]);

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

  return (
    <div>
      <p className="text-sm text-slate-400 mb-5">
        Answer each question — more will appear as you go.
      </p>

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
              resetBranches();
            }}
          />
        </Question>
      )}

      {/* INSIDE + SAME POSITION */}
      {currentLocation === "inside" && samePosition === "yes" && (
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
            <ToggleButton
              value={hasTray}
              onChange={(v) => {
                setHasTray(v);
                setTrayReusable(null);
              }}
            />
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
              {trayReusable === "no" && (
                <Note tone="amber">Replacement {priced(CODE.TRAY)}</Note>
              )}
              {trayReusable === "yes" && <Note tone="info">No extra cost.</Note>}
            </Question>
          )}
        </>
      )}

      {/* OUTSIDE + SAME POSITION */}
      {currentLocation === "outside" && samePosition === "yes" && (
        <>
          <Question title="Is it sitting on a concrete / support base?">
            <ToggleButton
              value={hasBase}
              onChange={(v) => {
                setHasBase(v);
                setBaseReusable(null);
              }}
            />
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
                <ToggleButton value={needsBase} onChange={setNeedsBase} />
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

      {/* Electrical isolator & RCD — optional extra on any electric job */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <Question title="Is an electrical isolator & RCD required?">
          <ToggleButton value={isolator} onChange={setIsolator} />
          {isolator === "yes" && <Note tone="amber">{priced(CODE.ISOLATOR)}</Note>}
        </Question>
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
