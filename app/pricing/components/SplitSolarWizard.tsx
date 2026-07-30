"use client";

/**
 * SplitSolarWizard — Step 3 for SPLIT SOLAR (tank on the ground, panels on roof).
 *
 *   Q1 Home:  Single/Lowset ($0) · Double/Highset (+$450)
 *   Q2 Pitch: Flat · Moderate ($0) · Steep (+$150) · Crazy Steep (+$500) — image cards
 *             Flat → tilt frame: on a tilt frame? Yes → reusable? Yes=$0/No=new (+$675) ; No = new (+$675)
 *   Q3 Access: Yes / No / Unsure (informational)
 *   Ground tank — same position / relocation model (mirrors electric):
 *     - Where is the current system? Inside / Outside
 *     - Same position? YES → inside = Safe/Catch tray · outside = support base
 *                      NO  → new inside = site-visit note only ; new outside = lineal metres + support base
 *     - Electrical isolator & RCD → mandatory, always included (+$350; not asked)
 *   Included: Remove old tank & disposal ($0). Costs HIDDEN here. Output → extraIds.
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
  DOUBLE_STOREY: "double_storey_split",
  PITCH_STEEP: "pitch_steep_split",
  PITCH_CRAZY: "pitch_crazy_steep_split",
  TILT_FRAME: "tilt_frame_split",
  ISOLATOR: "electrical_isolator_rcd", // shared `all` row
  TRAY: "safe_catch_tray_split",
  VALVE: "mildred_valve_split",
  SUPPORT_BASE: "support_base_split", // outside ground tank
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
  onMetaChange,
  onLocationChange,
}: Props) {
  const [byCode, setByCode] = useState<Record<string, Extra>>({});
  const [loading, setLoading] = useState(true);

  const [home, setHome] = useState<"single" | "double" | null>(null);
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [onTiltFrame, setOnTiltFrame] = useState<"yes" | "no" | null>(null);
  const [tiltReusable, setTiltReusable] = useState<"yes" | "no" | null>(null);
  const [access, setAccess] = useState<"yes" | "no" | "unsure" | null>(null);

  // Ground-tank position / relocation (mirrors electric)
  const [currentLocation, setCurrentLocation] = useState<"inside" | "outside" | null>(null);
  const [samePosition, setSamePosition] = useState<"yes" | "no" | null>(null);
  const [newLocation, setNewLocation] = useState<"inside" | "outside" | null>(null);
  const [metres, setMetres] = useState("");
  const [hasTray, setHasTray] = useState<"yes" | "no" | null>(null);
  const [trayReusable, setTrayReusable] = useState<"yes" | "no" | null>(null);
  const [needsBase, setNeedsBase] = useState<"yes" | "no" | null>(null);

  const resetGround = () => {
    setNewLocation(null);
    setMetres("");
    setHasTray(null);
    setTrayReusable(null);
    setNeedsBase(null);
  };
  const resetAll = () => {
    setHome(null);
    setPitch(null);
    setOnTiltFrame(null);
    setTiltReusable(null);
    setAccess(null);
    setCurrentLocation(null);
    setSamePosition(null);
    resetGround();
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

  const metresNum = parseInt(metres, 10);
  const metresValid = isValidRelocationMetres(metresNum);

  // Relocation metadata (lineal-metre pricing / site-visit flag), same as electric.
  const relocationMeta: RelocationMeta = useMemo(() => {
    if (samePosition !== "no" || !newLocation) return null;
    if (newLocation === "inside") return { newLocation: "inside", requiresSiteVisit: true };
    if (!metresValid) return null;
    return { newLocation: "outside", metres: metresNum, requiresSiteVisit: false };
  }, [samePosition, newLocation, metresValid, metresNum]);

  const selectedCodes = useMemo(() => {
    const codes: string[] = [CODE.REMOVE_TANK];
    if (home === "double") codes.push(CODE.DOUBLE_STOREY);
    if (pitch === "steep") codes.push(CODE.PITCH_STEEP);
    if (pitch === "crazy_steep") codes.push(CODE.PITCH_CRAZY);
    if (needsNewTiltFrame) codes.push(CODE.TILT_FRAME);
    codes.push(CODE.ISOLATOR); // mandatory for split solar (ground tank)

    if (currentLocation && samePosition) {
      if (samePosition === "yes") {
        if (currentLocation === "inside") {
          if (hasTray === "no") codes.push(CODE.TRAY, CODE.VALVE);
          else if (hasTray === "yes" && trayReusable === "no") codes.push(CODE.TRAY);
        } else {
          if (needsBase === "yes") codes.push(CODE.SUPPORT_BASE);
        }
      } else {
        // relocation: outside = support base (+ lineal metres via relocationMeta);
        // inside = site-visit note only, no priced items here.
        if (newLocation === "outside" && needsBase === "yes") codes.push(CODE.SUPPORT_BASE);
      }
    }
    return codes.filter((c) => byCode[c]);
  }, [byCode, home, pitch, needsNewTiltFrame, currentLocation, samePosition, newLocation, hasTray, trayReusable, needsBase]);

  const complete = useMemo(() => {
    if (!home || !pitch || !access) return false;
    if (pitch === "flat") {
      if (!onTiltFrame) return false;
      if (onTiltFrame === "yes" && !tiltReusable) return false;
    }
    if (!currentLocation || !samePosition) return false;
    if (samePosition === "yes") {
      if (currentLocation === "inside") {
        if (!hasTray) return false;
        if (hasTray === "yes" && !trayReusable) return false;
      } else {
        if (!needsBase) return false;
      }
      return true;
    }
    // relocation
    if (!newLocation) return false;
    if (newLocation === "outside") {
      if (!metresValid) return false;
      if (!needsBase) return false;
    }
    return true; // inside → site visit is a valid terminal state
  }, [home, pitch, access, onTiltFrame, tiltReusable, currentLocation, samePosition, newLocation, metresValid, hasTray, trayReusable, needsBase]);

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
  // CRM system-location: relocation → where the new tank goes; else the existing location.
  const effectiveLocation = samePosition === "no" ? newLocation : currentLocation;
  useEffect(() => {
    onLocationChange?.(effectiveLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveLocation]);

  if (loading) return <p className="text-slate-400">Loading questions…</p>;

  // Safe / Catch tray question — reused by the same-position-inside branch.
  const trayQuestion = (
    <Question title="Is there a Safe / Catch Tray?">
      <div className="flex items-center gap-4 flex-wrap">
        <ToggleButton value={hasTray} onChange={(v) => { setHasTray(v); setTrayReusable(null); }} />
        <ExtraInfo extra={byCode[CODE.TRAY]} />
      </div>
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
  );

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

      {/* Ground tank — position / relocation (mirrors electric). Isolator mandatory (below). */}
      {home && pitch && access && (
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
                resetGround();
              }}
            />
          </Question>

          {currentLocation && (
            <Question title="Same position as the existing system?">
              <ToggleButton
                value={samePosition}
                onChange={(v) => {
                  setSamePosition(v);
                  resetGround();
                }}
              />
            </Question>
          )}

          {/* SAME POSITION */}
          {samePosition === "yes" && currentLocation === "inside" && trayQuestion}

          {samePosition === "yes" && currentLocation === "outside" && (
            <Question title="Will a concrete / poly support base be required?">
              <div className="flex items-center gap-4 flex-wrap">
                <ToggleButton value={needsBase} onChange={setNeedsBase} />
                <ExtraInfo extra={byCode[CODE.SUPPORT_BASE]} />
              </div>
            </Question>
          )}

          {/* RELOCATION */}
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
                    setHasTray(null);
                    setTrayReusable(null);
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
                  </Question>
                </>
              )}

              {newLocation === "inside" && (
                <Note>
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

      {/* Included */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Standard (included)</p>
        {byCode[CODE.ISOLATOR] && (
          <div className="flex justify-between text-sm py-0.5">
            <span className="text-slate-200">{byCode[CODE.ISOLATOR].name}</span>
            <span className="text-slate-400">Required</span>
          </div>
        )}
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
