"use client";

/**
 * HeatPumpWizard — Step 3 for HEAT PUMP.
 *
 * Two layers:
 *  1) CONVERSION — "What do you currently have?" (Electric / Heat Pump /
 *     Thermosiphon Solar / Split Solar) drives conversion-specific add-ons +
 *     disclaimers, and sets the CRM existing-system type.
 *  2) INSTALL — the always-outside heat-pump questions (inside/outside, same
 *     position, relocation lineal-metres, support base). SKIPPED for Thermosiphon
 *     (roof→ground can't be auto-priced → disclaimer + site visit only).
 *
 * Costs are HIDDEN here (no running total, no per-item "+$X"); they appear only
 * on the generated quote. Reports: onChange(extraIds), onCompletionChange,
 * onMetaChange(relocation), onLocationChange, onConversionChange(existingType,
 * disclaimers, requiresSiteVisit).
 */

import { useEffect, useMemo, useState } from "react";
import ToggleButton from "./ToggleButton";
import ExtraInfo from "./ExtraInfo";
import type { RelocationMeta } from "./ElectricWizard";
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

export type ConversionMeta = {
  existingType: string | null; // CMS existing-system label (Electric / Heat Pump / Solar)
  disclaimers: string[];
  requiresSiteVisit: boolean;
};

type Props = {
  region: string;
  systemType: string;
  selectedExtras: string[];
  onChange: (extras: string[]) => void;
  onCompletionChange?: (complete: boolean) => void;
  onMetaChange?: (relocation: RelocationMeta) => void;
  onLocationChange?: (loc: "inside" | "outside" | null) => void;
  onConversionChange?: (conv: ConversionMeta) => void;
  existingType?: string | null; // Step-1 "what do you have?" → pre-fills the conversion question
};

const CODE = {
  SUPPORT_BASE: "support_base_heat_pump",
  OFF_PEAK_REMOVAL: "off_peak_removal_heat_pump",
  SPLIT_SOLAR_CONVERSION: "split_solar_conversion_heat_pump",
  SOLAR_PANEL_REMOVAL: "solar_panel_removal_heat_pump",
  REMOVE_TANK: "remove_old_tank", // included $0
} as const;

type Have = "electric" | "heat_pump" | "thermosiphon" | "split_solar";

const EXISTING_LABEL: Record<Have, string> = {
  electric: "Electric",
  heat_pump: "Heat Pump",
  thermosiphon: "Solar",
  split_solar: "Solar",
};

// Map a Step-1 "what do you have?" value (SystemType) → this wizard's conversion
// options, so it can be pre-filled. Gas / none have no conversion path here.
const HAVE_FROM_EXISTING: Record<string, Have> = {
  electric: "electric",
  heat_pump: "heat_pump",
  solar_thermosiphon: "thermosiphon",
  solar_split: "split_solar",
};

const THERMOSIPHON_DISCLAIMER =
  "Converting a roof-mounted solar system to a ground heat pump: roughly $750–$1,250 for plumbing/electrical to relocate services to ground and supply a support base. A site visit is required to confirm — we'll be in direct contact.";
const OFF_PEAK_UNSURE_DISCLAIMER =
  "If you have an off-peak isolator and need it removed to utilise solar power, that's about +$220 — confirmed on site.";

function OptionPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
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

function Note({ tone, children }: { tone: "amber" | "info"; children: React.ReactNode }) {
  return (
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
}

export default function HeatPumpWizard({
  region,
  systemType,
  onChange,
  onCompletionChange,
  onMetaChange,
  onLocationChange,
  onConversionChange,
  existingType,
}: Props) {
  const defaultHave: Have | null =
    existingType && existingType in HAVE_FROM_EXISTING ? HAVE_FROM_EXISTING[existingType] : null;
  const [byCode, setByCode] = useState<Record<string, Extra>>({});
  const [loading, setLoading] = useState(true);

  // Conversion layer
  const [have, setHave] = useState<Have | null>(null);
  const [offPeak, setOffPeak] = useState<"yes" | "no" | "unsure" | null>(null);
  const [offPeakRemove, setOffPeakRemove] = useState<"yes" | "no" | null>(null);
  const [panelRemoval, setPanelRemoval] = useState<"yes" | "no" | null>(null);

  // Install layer (skipped for thermosiphon)
  const [currentLocation, setCurrentLocation] = useState<"inside" | "outside" | null>(null);
  const [samePosition, setSamePosition] = useState<"yes" | "no" | null>(null);
  const [metres, setMetres] = useState("");
  const [needsBase, setNeedsBase] = useState<"yes" | "no" | null>(null);

  const resetConversion = () => {
    setOffPeak(null);
    setOffPeakRemove(null);
    setPanelRemoval(null);
  };
  const resetInstall = () => {
    setCurrentLocation(null);
    setSamePosition(null);
    setMetres("");
    setNeedsBase(null);
  };
  const resetAll = () => {
    setHave(defaultHave); // pre-fill from Step-1 "what do you have?" when it maps
    resetConversion();
    resetInstall();
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

  const isThermosiphon = have === "thermosiphon";

  // Install-layer relocation (only for non-thermosiphon). Heat pump always outside.
  const metresNum = parseInt(metres, 10);
  const metresValid = isValidRelocationMetres(metresNum);
  const isMoving =
    !isThermosiphon &&
    (currentLocation === "inside" || (currentLocation === "outside" && samePosition === "no"));

  const relocationMeta: RelocationMeta = useMemo(() => {
    if (!isMoving || !metresValid) return null;
    return { newLocation: "outside", metres: metresNum, requiresSiteVisit: false };
  }, [isMoving, metresValid, metresNum]);

  // Selected extra codes (costs hidden in UI; still drive the priced quote).
  const selectedCodes = useMemo(() => {
    const codes: string[] = [CODE.REMOVE_TANK];
    if (have === "split_solar") {
      codes.push(CODE.SPLIT_SOLAR_CONVERSION);
      if (panelRemoval === "yes") codes.push(CODE.SOLAR_PANEL_REMOVAL);
    }
    if (have === "electric" && offPeak === "yes" && offPeakRemove === "yes") {
      codes.push(CODE.OFF_PEAK_REMOVAL);
    }
    if (!isThermosiphon && needsBase === "yes") codes.push(CODE.SUPPORT_BASE);
    return codes.filter((c) => byCode[c]);
  }, [byCode, have, panelRemoval, offPeak, offPeakRemove, isThermosiphon, needsBase]);

  // Disclaimers + site-visit + existing type for the CRM/quote.
  const conversion: ConversionMeta = useMemo(() => {
    const disclaimers: string[] = [];
    let requiresSiteVisit = false;
    if (isThermosiphon) {
      disclaimers.push(THERMOSIPHON_DISCLAIMER);
      requiresSiteVisit = true;
    }
    if (have === "electric" && offPeak === "unsure") disclaimers.push(OFF_PEAK_UNSURE_DISCLAIMER);
    return { existingType: have ? EXISTING_LABEL[have] : null, disclaimers, requiresSiteVisit };
  }, [isThermosiphon, have, offPeak]);

  const installComplete = useMemo(() => {
    if (!currentLocation) return false;
    if (currentLocation === "inside") return metresValid && !!needsBase;
    if (!samePosition) return false;
    if (samePosition === "yes") return !!needsBase;
    return metresValid && !!needsBase;
  }, [currentLocation, samePosition, metresValid, needsBase]);

  const conversionComplete = useMemo(() => {
    if (!have) return false;
    if (have === "electric") return offPeak !== null && (offPeak !== "yes" || offPeakRemove !== null);
    if (have === "split_solar") return panelRemoval !== null;
    return true; // heat_pump, thermosiphon
  }, [have, offPeak, offPeakRemove, panelRemoval]);

  const complete = conversionComplete && (isThermosiphon || installComplete);

  // Report up.
  const selectedIds = useMemo(() => selectedCodes.map((c) => byCode[c].extraId), [selectedCodes, byCode]);
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
  // Existing-system location for CRM. Thermosiphon (roof) → treat as outside.
  const effectiveLocation = isThermosiphon ? "outside" : currentLocation;
  useEffect(() => {
    onLocationChange?.(effectiveLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveLocation]);
  const convKey = JSON.stringify(conversion);
  useEffect(() => {
    onConversionChange?.(conversion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convKey]);

  if (loading) return <p className="text-slate-400">Loading questions…</p>;

  // Install questions block (metres + support base) shown when the unit is moving.
  const movingQuestions = (
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
      </Question>
    </>
  );

  return (
    <div>
      <p className="text-sm text-slate-400 mb-5">Answer each question — more will appear as you go.</p>

      {/* CONVERSION — pre-filled from Step 1, so we don't re-ask it. It's only
          asked here if Step 1's answer has no heat-pump conversion path
          (e.g. gas / "I don't have one"). */}
      {!defaultHave && (
        <Question title="What type of hot water system do you currently have?">
          <OptionPills
            options={[
              { value: "electric", label: "Electric" },
              { value: "heat_pump", label: "Heat Pump" },
              { value: "thermosiphon", label: "Thermosiphon Solar" },
              { value: "split_solar", label: "Split Solar" },
            ]}
            value={have}
            onChange={(v) => {
              setHave(v);
              resetConversion();
              resetInstall();
            }}
          />
        </Question>
      )}

      {/* ELECTRIC → off-peak */}
      {have === "electric" && (
        <Question title="Is your electric water heater on an off-peak tariff?">
          <OptionPills
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
              { value: "unsure", label: "Unsure" },
            ]}
            value={offPeak}
            onChange={(v) => {
              setOffPeak(v);
              setOffPeakRemove(null);
            }}
          />
          {offPeak === "yes" && (
            <div className="mt-4">
              <p className="font-semibold text-white">Do you want it removed to utilise solar power?</p>
              <ToggleButton value={offPeakRemove} onChange={setOffPeakRemove} />
            </div>
          )}
          {offPeak === "unsure" && (
            <Note tone="info">A note about off-peak removal will be added to the quote.</Note>
          )}
        </Question>
      )}

      {/* SPLIT SOLAR → panel removal */}
      {have === "split_solar" && (
        <Question title="Do you want the solar hot water panels removed from your roof?">
          <p className="text-sm text-slate-400 mt-1">
            We can disconnect and leave them (to avoid disturbing roof penetrations), or remove and
            patch the holes.
          </p>
          <ToggleButton value={panelRemoval} onChange={setPanelRemoval} />
        </Question>
      )}

      {/* THERMOSIPHON → disclaimer + site visit, skip install */}
      {isThermosiphon && (
        <Note tone="amber">
          This conversion (roof solar → ground heat pump) needs a <strong>site visit</strong> — roof
          type, location and plumbing/electrical all vary. A ballpark and the site-visit note will
          appear on the quote; we'll be in direct contact.
        </Note>
      )}

      {/* INSTALL questions (all conversions except thermosiphon) */}
      {have && !isThermosiphon && (
        <>
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
                setMetres("");
                setNeedsBase(null);
              }}
            />
            {currentLocation === "inside" && (
              <Note tone="info">
                A heat pump installs <strong>outside</strong> (it expels air like an aircon), so it
                will be relocated from the current inside position.
              </Note>
            )}
          </Question>

          {currentLocation === "inside" && movingQuestions}

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

          {currentLocation === "outside" && samePosition === "yes" && (
            <Question title="Will a concrete / poly support base be required?">
              <div className="flex items-center gap-4 flex-wrap">
                <ToggleButton value={needsBase} onChange={setNeedsBase} />
                <ExtraInfo extra={byCode[CODE.SUPPORT_BASE]} />
              </div>
            </Question>
          )}

          {currentLocation === "outside" && samePosition === "no" && movingQuestions}
        </>
      )}

      {/* Standard (included) — no prices */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Standard (included)</p>
        <div className="flex justify-between text-sm py-0.5">
          <span className="text-slate-200">Electrical isolator &amp; RCD</span>
          <span className="text-slate-400">Included</span>
        </div>
        <div className="flex justify-between text-sm py-0.5">
          <span className="text-slate-200">Remove old tank &amp; disposal</span>
          <span className="text-slate-400">Included</span>
        </div>
      </div>

      {!complete && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm font-semibold text-red-300">
          ⚠️ Please answer all questions before continuing.
        </div>
      )}
    </div>
  );
}
