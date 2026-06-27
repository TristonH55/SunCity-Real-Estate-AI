"use client";

/**
 * HeatPumpWizard — Step 3 for HEAT PUMP. A heat pump always installs OUTSIDE
 * (it expels air like an aircon), so the tree is simpler than electric:
 *
 *   Where is the current system?  Inside / Outside
 *     • Inside  → must move outside ⇒ relocation: lineal-metres + support base
 *     • Outside → Same position?
 *         - Yes → support base only
 *         - No  → relocation: lineal-metres + support base
 *   Electrical isolator & RCD → STANDARD, included in the unit price (shown, not charged)
 *   Remove old tank & disposal → included ($0)
 *
 * No Open/Cupboard, Safe-tray or Mildred valve (inside-only items), and no
 * internal/site-visit branch (the new unit is never inside).
 *
 * Output contract matches ElectricWizard so the pricing page can swap them:
 * onChange(extraIds), onCompletionChange, onMetaChange(relocation), onLocationChange.
 */

import { useEffect, useMemo, useState } from "react";
import ToggleButton from "./ToggleButton";
import type { RelocationMeta } from "./ElectricWizard";
import {
  RELOCATION_BASE,
  computeRelocationCost,
  isValidRelocationMetres,
  relocationPerMetreRate,
} from "@/lib/relocation-pricing";

type Extra = {
  extraId: string;
  code: string;
  name: string;
  priceExGst: number;
  included: boolean;
};

type Props = {
  region: string;
  systemType: string;
  selectedExtras: string[];
  onChange: (extras: string[]) => void;
  onCompletionChange?: (complete: boolean) => void;
  onMetaChange?: (relocation: RelocationMeta) => void;
  onLocationChange?: (loc: "inside" | "outside" | null) => void;
};

const CODE = {
  SUPPORT_BASE: "support_base_heat_pump",
  ISOLATOR: "electrical_isolator_rcd", // shown as "included", NOT added to extraIds
  REMOVE_TANK: "remove_old_tank",
} as const;

// Always added to the quote (both $0 / included for heat pump). The isolator is
// included in the unit price, so it is shown but NOT added to extraIds.
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

export default function HeatPumpWizard({
  region,
  systemType,
  onChange,
  onCompletionChange,
  onMetaChange,
  onLocationChange,
}: Props) {
  const [byCode, setByCode] = useState<Record<string, Extra>>({});
  const [loading, setLoading] = useState(true);

  const [currentLocation, setCurrentLocation] = useState<"inside" | "outside" | null>(null);
  const [samePosition, setSamePosition] = useState<"yes" | "no" | null>(null);
  const [metres, setMetres] = useState("");
  const [needsBase, setNeedsBase] = useState<"yes" | "no" | null>(null);

  const resetAll = () => {
    setCurrentLocation(null);
    resetBelowLocation();
  };
  const resetBelowLocation = () => {
    setSamePosition(null);
    setMetres("");
    setNeedsBase(null);
  };

  useEffect(() => {
    if (!region || systemType !== "heat_pump") return;
    setLoading(true);
    fetch(`/api/pricing/extras?region=${region}&type=heat_pump`)
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

  // A heat pump moves (relocation) when: current is inside (must go outside), or
  // current is outside but not the same position.
  const isMoving =
    currentLocation === "inside" ||
    (currentLocation === "outside" && samePosition === "no");

  const metresNum = parseInt(metres, 10);
  const metresValid = isValidRelocationMetres(metresNum);

  // Relocation is always to OUTSIDE for a heat pump (never a site visit).
  const relocationMeta: RelocationMeta = useMemo(() => {
    if (!isMoving || !metresValid) return null;
    return { newLocation: "outside", metres: metresNum, requiresSiteVisit: false };
  }, [isMoving, metresValid, metresNum]);

  const relocationCost = relocationMeta ? computeRelocationCost(relocationMeta.metres) : 0;

  const selectedCodes = useMemo(() => {
    const codes: string[] = [...ALWAYS_INCLUDED];
    if (needsBase === "yes") codes.push(CODE.SUPPORT_BASE);
    return codes.filter((c) => byCode[c]);
  }, [byCode, needsBase]);

  const complete = useMemo(() => {
    if (!currentLocation) return false;
    if (currentLocation === "inside") {
      return metresValid && !!needsBase; // forced relocation outside
    }
    // outside
    if (!samePosition) return false;
    if (samePosition === "yes") return !!needsBase;
    return metresValid && !!needsBase; // outside + moving
  }, [currentLocation, samePosition, metresValid, needsBase]);

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
  useEffect(() => {
    onLocationChange?.(currentLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation]);

  const addOnsTotal =
    selectedCodes.reduce((sum, c) => sum + (byCode[c]?.priceExGst ?? 0), 0) + relocationCost;

  if (loading) return <p className="text-slate-400">Loading questions…</p>;

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

  const supportBaseLabel = byCode[CODE.SUPPORT_BASE]
    ? `${byCode[CODE.SUPPORT_BASE].name} — +${money(byCode[CODE.SUPPORT_BASE].priceExGst)}`
    : "Concrete / Poly support base";

  // The lineal-metres + support-base questions (shown whenever the unit is moving,
  // or staying put outside where only the base applies).
  const relocationQuestions = (
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
        {metresValid && (
          <p className="mt-2 text-sm font-semibold text-emerald-300">
            {money(RELOCATION_BASE)} base + {metresNum}m @ {money(relocationPerMetreRate(metresNum))}/m ={" "}
            {money(computeRelocationCost(metresNum))}
          </p>
        )}
      </Question>

      <Question title="Will a concrete / poly support base be required?">
        <ToggleButton value={needsBase} onChange={setNeedsBase} />
        {needsBase === "yes" && <Note tone="amber">{supportBaseLabel}</Note>}
      </Question>
    </>
  );

  return (
    <div>
      <p className="text-sm text-slate-400 mb-5">
        Answer each question — more will appear as you go.
      </p>

      <Question title="Where is the current system?">
        <OptionPills
          options={[
            { value: "inside", label: "Inside" },
            { value: "outside", label: "Outside" },
          ]}
          value={currentLocation}
          onChange={(v) => {
            setCurrentLocation(v);
            resetBelowLocation();
          }}
        />
        {currentLocation === "inside" && (
          <Note tone="info">
            A heat pump installs <strong>outside</strong> (it expels air like an aircon), so it will
            be relocated from the current inside position.
          </Note>
        )}
      </Question>

      {/* Current INSIDE → forced relocation outside */}
      {currentLocation === "inside" && relocationQuestions}

      {/* Current OUTSIDE → same position? */}
      {currentLocation === "outside" && (
        <Question title="Same position as the existing system?">
          <ToggleButton
            value={samePosition}
            onChange={(v) => {
              setSamePosition(v);
              setMetres("");
              setNeedsBase(null);
            }}
          />
        </Question>
      )}

      {/* Outside + same position → support base only */}
      {currentLocation === "outside" && samePosition === "yes" && (
        <Question title="Will a concrete / poly support base be required?">
          <ToggleButton value={needsBase} onChange={setNeedsBase} />
          {needsBase === "yes" && <Note tone="amber">{supportBaseLabel}</Note>}
        </Question>
      )}

      {/* Outside + moving → relocation questions */}
      {currentLocation === "outside" && samePosition === "no" && relocationQuestions}

      {/* Standard (included) */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Standard (included)</p>
        <div className="flex justify-between text-sm py-0.5">
          <span className="text-slate-200">Electrical isolator &amp; RCD</span>
          <span className="text-slate-400">Included</span>
        </div>
        {byCode[CODE.REMOVE_TANK] && (
          <div className="flex justify-between text-sm py-0.5">
            <span className="text-slate-200">{byCode[CODE.REMOVE_TANK].name}</span>
            <span className="text-slate-400">Included ($0)</span>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
        <span className="font-semibold text-emerald-300">
          Add-ons so far: {money(addOnsTotal)}
        </span>
      </div>

      {!complete && (
        <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm font-semibold text-red-300">
          ⚠️ Please answer all questions before continuing.
        </div>
      )}
    </div>
  );
}
