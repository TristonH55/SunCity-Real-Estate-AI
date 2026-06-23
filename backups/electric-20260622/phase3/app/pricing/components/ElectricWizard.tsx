"use client";

/**
 * ElectricWizard — Darren's "same-location replacement" branching question flow
 * for ELECTRIC systems only. Rendered by the pricing page in place of the flat
 * ExtrasList when systemType === "electric". Other system types are untouched.
 *
 * Output contract is identical to ExtrasList: it reports a list of selected
 * Extra **ids** via onChange (so the existing quote → lock → PDF → CRM pipeline
 * needs no changes), and reports completeness via onCompletionChange.
 *
 * Phase 2 scope (this file): the full branching UI + answer → Extra-code mapping
 * for every add-on that is a real Extra row (cupboard, safe/catch tray, Mildred
 * valve, support base) plus the always-included items (isolator, tank removal).
 *
 * Phase 3 (later) adds: the lineal-metre relocation PRICE (doesn't fit the Extra
 * model) and carrying the "internal relocation → site visit" flag through to the
 * quote/PDF/CRM. Here the relocation→inside path just shows the site-visit notice
 * and still lets the agent generate a quote (Option A). The relocation→outside
 * distance question is added in Phase 3 alongside its pricing.
 */

import { useEffect, useMemo, useState } from "react";
import ToggleButton from "./ToggleButton";

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
};

// Extra codes this wizard maps answers onto (must match prisma seed / upsert).
const CODE = {
  CUPBOARD: "cupboard_install_electric",
  TRAY: "safe_catch_tray_electric",
  VALVE: "mildred_valve_electric",
  SUPPORT_BASE: "support_base_electric",
  ISOLATOR: "electrical_isolator_rcd",
  REMOVE_TANK: "remove_old_tank",
} as const;

// Always part of an electric quote (Darren: "included needs to stay").
const ALWAYS_INCLUDED = [CODE.ISOLATOR, CODE.REMOVE_TANK];

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
  const [needsBase, setNeedsBase] = useState<"yes" | "no" | null>(null);

  const resetAll = () => {
    setCurrentLocation(null);
    setSamePosition(null);
    resetBranches();
  };
  const resetBranches = () => {
    setOpenOrCupboard(null);
    setHasTray(null);
    setTrayReusable(null);
    setHasBase(null);
    setBaseReusable(null);
    setNewLocation(null);
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

  // Which Extra codes are currently selected, derived from the answers.
  const selectedCodes = useMemo(() => {
    const codes: string[] = [...ALWAYS_INCLUDED];
    if (currentLocation && samePosition) {
      if (samePosition === "yes") {
        if (currentLocation === "inside") {
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
        // newLocation === "inside" → site visit; no menu add-ons here (Phase 3 flag).
      }
    }
    // Only codes that actually exist in the DB response.
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
  ]);

  const requiresSiteVisit = samePosition === "no" && newLocation === "inside";

  const complete = useMemo(() => {
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
    if (newLocation === "outside" && !needsBase) return false;
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
    needsBase,
  ]);

  // Report selected ids + completeness to the parent.
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

  const addOnsTotal = selectedCodes.reduce((sum, c) => sum + (byCode[c]?.priceExGst ?? 0), 0);

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

  const priced = (code: string) => {
    const e = byCode[code];
    return e ? `${e.name} — +${money(e.priceExGst)}` : code;
  };

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
                setNeedsBase(null);
              }}
            />
          </Question>

          {newLocation === "outside" && (
            <Question title="Will a concrete / poly support base be required?">
              <ToggleButton value={needsBase} onChange={setNeedsBase} />
              {needsBase === "yes" && <Note tone="amber">{priced(CODE.SUPPORT_BASE)}</Note>}
            </Question>
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

      {/* Standard (always included) */}
      <div className="mt-6 pt-4 border-t border-white/10">
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

      {/* Running total */}
      <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
        <span className="font-semibold text-emerald-300">
          Add-ons so far: {money(addOnsTotal)}
        </span>
        {requiresSiteVisit && (
          <span className="ml-2 text-xs text-sky-300">(internal relocation priced at site visit)</span>
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
