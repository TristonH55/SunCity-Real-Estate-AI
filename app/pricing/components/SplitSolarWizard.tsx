"use client";

/**
 * SplitSolarWizard — Step 3 for SPLIT SOLAR (tank on the ground, panels on roof).
 * Replaces the flat ExtrasList for solar_split only.
 *
 *   Q1 Home:  Single/Lowset ($0) · Double/Highset (+$450)
 *   Q2 Pitch: Flat · Moderate ($0) · Steep (+$150) · Crazy Steep (+$500)  — image cards
 *             Flat → tilt frame needed: on a tilt frame? Yes → reusable? Yes=$0/No=new (+$675) ; No = new (+$675)
 *   Q3 Access: Yes / No / Unsure (informational)
 *   Same as electric (ground tank):
 *     - Electrical isolator & RCD → Yes/No (+$350)
 *     - Safe / Catch tray → No = tray (+$165) + Mildred valve (+$225) ; Yes → reusable? No = tray (+$165) / Yes = $0
 *   Included: Remove old tank & disposal ($0)
 *
 * No Inside/Outside or Concrete base (tank is on the ground). Costs HIDDEN here.
 * Output → extraIds.
 */

import { useEffect, useMemo, useState } from "react";
import ToggleButton from "./ToggleButton";

type Extra = { extraId: string; code: string; name: string; priceExGst: number; included: boolean };

type Props = {
  region: string;
  systemType: string;
  selectedExtras: string[];
  onChange: (extras: string[]) => void;
  onCompletionChange?: (complete: boolean) => void;
  onLocationChange?: (loc: "inside" | "outside" | null) => void;
};

const CODE = {
  DOUBLE_STOREY: "double_storey_split",
  PITCH_STEEP: "pitch_steep_split",
  PITCH_CRAZY: "pitch_crazy_steep_split",
  TILT_FRAME: "tilt_frame_split",
  ISOLATOR: "electrical_isolator_rcd", // shared `all` row
  TRAY: "safe_catch_tray_split",
  VALVE: "mildred_valve_split",
  REMOVE_TANK: "remove_old_tank",
} as const;

type Pitch = "flat" | "moderate" | "steep" | "crazy_steep";

function RoofIcon({ rise, active }: { rise: number; active: boolean }) {
  const color = active ? "#6ee7b7" : "#94a3b8";
  return (
    <svg viewBox="0 0 80 56" className="w-16 h-11">
      <rect x="16" y="38" width="48" height="14" rx="1" fill="none" stroke={color} strokeWidth="2" />
      <polyline points={`8,38 72,${38 - rise}`} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

function PitchCard({ rise, label, active, onClick }: { rise: number; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-28 flex-col items-center gap-1 rounded-xl border px-3 py-3 transition ${
        active
          ? "border-emerald-400 bg-emerald-500/15 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.35)]"
          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
      }`}
    >
      <RoofIcon rise={rise} active={active} />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

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

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="font-semibold text-white">{title}</p>
      {children}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-lg px-4 py-3 text-sm border bg-sky-500/10 border-sky-500/30 text-sky-200">
      {children}
    </div>
  );
}

export default function SplitSolarWizard({
  region,
  systemType,
  onChange,
  onCompletionChange,
  onLocationChange,
}: Props) {
  const [byCode, setByCode] = useState<Record<string, Extra>>({});
  const [loading, setLoading] = useState(true);

  const [home, setHome] = useState<"single" | "double" | null>(null);
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [onTiltFrame, setOnTiltFrame] = useState<"yes" | "no" | null>(null);
  const [tiltReusable, setTiltReusable] = useState<"yes" | "no" | null>(null);
  const [access, setAccess] = useState<"yes" | "no" | "unsure" | null>(null);
  const [isolator, setIsolator] = useState<"yes" | "no" | null>(null);
  const [hasTray, setHasTray] = useState<"yes" | "no" | null>(null);
  const [trayReusable, setTrayReusable] = useState<"yes" | "no" | null>(null);

  const resetAll = () => {
    setHome(null);
    setPitch(null);
    setOnTiltFrame(null);
    setTiltReusable(null);
    setAccess(null);
    setIsolator(null);
    setHasTray(null);
    setTrayReusable(null);
  };

  useEffect(() => {
    if (!region || systemType !== "solar_split") return;
    setLoading(true);
    fetch(`/api/pricing/extras?region=${region}&type=solar_split`)
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

  const needsNewTiltFrame =
    pitch === "flat" && (onTiltFrame === "no" || (onTiltFrame === "yes" && tiltReusable === "no"));

  const selectedCodes = useMemo(() => {
    const codes: string[] = [CODE.REMOVE_TANK];
    if (home === "double") codes.push(CODE.DOUBLE_STOREY);
    if (pitch === "steep") codes.push(CODE.PITCH_STEEP);
    if (pitch === "crazy_steep") codes.push(CODE.PITCH_CRAZY);
    if (needsNewTiltFrame) codes.push(CODE.TILT_FRAME);
    if (isolator === "yes") codes.push(CODE.ISOLATOR);
    if (hasTray === "no") codes.push(CODE.TRAY, CODE.VALVE);
    else if (hasTray === "yes" && trayReusable === "no") codes.push(CODE.TRAY);
    return codes.filter((c) => byCode[c]);
  }, [byCode, home, pitch, needsNewTiltFrame, isolator, hasTray, trayReusable]);

  const complete = useMemo(() => {
    if (!home || !pitch || !access || !isolator || !hasTray) return false;
    if (pitch === "flat") {
      if (!onTiltFrame) return false;
      if (onTiltFrame === "yes" && !tiltReusable) return false;
    }
    if (hasTray === "yes" && !trayReusable) return false;
    return true;
  }, [home, pitch, access, isolator, hasTray, onTiltFrame, tiltReusable, trayReusable]);

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
  // Split-solar tank sits on the ground → treat as "outside" for the CRM location.
  useEffect(() => {
    onLocationChange?.("outside");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p className="text-slate-400">Loading questions…</p>;

  return (
    <div>
      <p className="text-sm text-slate-400 mb-5">Answer each question — more will appear as you go.</p>

      <Question title="What is your home?">
        <OptionPills
          options={[
            { value: "single", label: "Single Storey / Lowset" },
            { value: "double", label: "Double Storey / Highset Roof" },
          ]}
          value={home}
          onChange={setHome}
        />
      </Question>

      {home && (
        <Question title="What is the pitch of your roof?">
          <div className="flex flex-wrap gap-3 mt-2">
            <PitchCard rise={2} label="Flat" active={pitch === "flat"} onClick={() => { setPitch("flat"); setOnTiltFrame(null); setTiltReusable(null); }} />
            <PitchCard rise={12} label="Moderate" active={pitch === "moderate"} onClick={() => { setPitch("moderate"); setOnTiltFrame(null); setTiltReusable(null); }} />
            <PitchCard rise={22} label="Steep" active={pitch === "steep"} onClick={() => { setPitch("steep"); setOnTiltFrame(null); setTiltReusable(null); }} />
            <PitchCard rise={32} label="Crazy Steep" active={pitch === "crazy_steep"} onClick={() => { setPitch("crazy_steep"); setOnTiltFrame(null); setTiltReusable(null); }} />
          </div>

          {pitch === "flat" && (
            <>
              <div className="mt-4">
                <p className="font-semibold text-white">Is it already on a tilt frame?</p>
                <ToggleButton value={onTiltFrame} onChange={(v) => { setOnTiltFrame(v); setTiltReusable(null); }} />
              </div>
              {onTiltFrame === "no" && (
                <Note>
                  Solar hot water needs a pitch of at least 10° to work efficiently, so a new
                  tilt/pitch frame will be required.
                </Note>
              )}
              {onTiltFrame === "yes" && (
                <div className="mt-4">
                  <p className="font-semibold text-white">Is it in good condition and reusable?</p>
                  <ToggleButton value={tiltReusable} onChange={setTiltReusable} />
                  {tiltReusable === "no" && <Note>A new tilt/pitch frame will be required.</Note>}
                  {tiltReusable === "yes" && <Note>Existing tilt frame is fine — no extra cost.</Note>}
                </div>
              )}
            </>
          )}
        </Question>
      )}

      {home && pitch && (
        <Question title="Is there easy access to your roof?">
          <OptionPills
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
              { value: "unsure", label: "Unsure" },
            ]}
            value={access}
            onChange={setAccess}
          />
          {(access === "no" || access === "unsure") && <Note>Roof access will be reviewed on site.</Note>}
        </Question>
      )}

      {/* Ground-tank electrical items — same as electric */}
      {home && pitch && access && (
        <>
          <Question title="Is an electrical isolator & RCD required?">
            <ToggleButton value={isolator} onChange={setIsolator} />
          </Question>

          <Question title="Is there a Safe / Catch Tray?">
            <ToggleButton value={hasTray} onChange={(v) => { setHasTray(v); setTrayReusable(null); }} />
            {hasTray === "no" && (
              <Note>May be required to meet regulations: Safe / Catch Tray and Mildred anti-flood valve.</Note>
            )}
            {hasTray === "yes" && (
              <div className="mt-4">
                <p className="font-semibold text-white">Is it in good condition and reusable?</p>
                <ToggleButton value={trayReusable} onChange={setTrayReusable} />
              </div>
            )}
          </Question>
        </>
      )}

      {/* Included */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Standard (included)</p>
        {byCode[CODE.REMOVE_TANK] && (
          <div className="flex justify-between text-sm py-0.5">
            <span className="text-slate-200">{byCode[CODE.REMOVE_TANK].name}</span>
            <span className="text-slate-400">Included</span>
          </div>
        )}
      </div>

      {!complete && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm font-semibold text-red-300">
          ⚠️ Please answer all questions before continuing.
        </div>
      )}
    </div>
  );
}
