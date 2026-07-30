// Real-estate agent quoting flow: region → system type → size → extras →
// homeowner details → "Generate quote" (3 brand options).
// Previous single-system insurance versions are in git history.
"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import RegionSelect from "./components/RegionSelect";
import SystemTypeSelect from "./components/SystemTypeSelect";
import SizeSelect from "./components/SizeSelect";
import SizeBandSelect from "./components/SizeBandSelect";
import ExtrasList from "./components/ExtrasList";
import ElectricWizard, { type RelocationMeta } from "./components/ElectricWizard";
import HeatPumpWizard, { type ConversionMeta } from "./components/HeatPumpWizard";
import ThermosiphonWizard from "./components/ThermosiphonWizard";
import SplitSolarWizard from "./components/SplitSolarWizard";
import GenerateQuote from "./components/GenerateQuote";
import { findHeatPumpBand } from "@/lib/heat-pump-bands";

export default function PricingPage() {
  const { status } = useSession();

  const [region, setRegion] = useState<string | null>(null);
  const [existingType, setExistingType] = useState<string | null>(null); // "what do you have?" — CRM only, optional
  const [systemType, setSystemType] = useState<string | null>(null);
  const [capacityLitres, setCapacityLitres] = useState<number | null>(null);
  const [sizeBandId, setSizeBandId] = useState<string | null>(null); // heat pump only
  const [existingSize, setExistingSize] = useState<number | null>(null); // existing system size (informational)
  const [existingSizeBandId, setExistingSizeBandId] = useState<string | null>(null); // existing heat pump band
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [extrasComplete, setExtrasComplete] = useState(false);
  const [relocation, setRelocation] = useState<RelocationMeta>(null);
  const [systemLocation, setSystemLocation] = useState<"inside" | "outside" | null>(null);
  const [conversion, setConversion] = useState<ConversionMeta | null>(null); // heat pump only

  const resetBelowType = () => {
    setCapacityLitres(null);
    setSizeBandId(null);
    setSelectedExtras([]);
    setExtrasComplete(false);
    setRelocation(null);
    setSystemLocation(null);
    setConversion(null);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-6 md:px-8 py-10 max-w-5xl mx-auto">
      <div className="mb-8 flex justify-center">
        <Image
          src="/images/suncity-logo-transparient.jpg.png"
          alt="SunCity Hot Water"
          width={350}
          height={80}
          priority
        />
      </div>

      {/* Hero banner */}
      <div className="mb-8">
        <Image
          src="/images/SunCity-Real-Estate-App.png"
          alt="SunCity Hot Water — real estate agents app"
          width={1376}
          height={768}
          priority
          className="w-full h-auto rounded-2xl"
        />
      </div>

      {/* Step 1 — Region & system type */}
      <div className="glass-card p-6 mb-6">
        <h2 className="step-gold text-lg font-semibold mb-4">
          <span className="text-xl">Step 1</span> — Region &amp; System Type
        </h2>
        <div className="space-y-4">
          <RegionSelect
            value={region}
            onChange={(val) => {
              setRegion(val);
              setExistingType(null);
              setExistingSize(null);
              setExistingSizeBandId(null);
              setSystemType(null);
              resetBelowType();
            }}
          />
          {/* What do you HAVE? — informational (CRM existing-system type + size).
              Does not affect sizes/wizards/pricing (those follow the WANT type below). */}
          <SystemTypeSelect
            value={existingType}
            onChange={(val) => {
              setExistingType(val);
              setExistingSize(null);
              setExistingSizeBandId(null);
            }}
            label="What type of hot water system do you have?"
            includeNone
            glow={!!existingType && existingType !== "none"}
          />
          <SystemTypeSelect
            value={systemType}
            onChange={(val) => {
              setSystemType(val);
              resetBelowType();
            }}
            label="What type of hot water system do you want?"
          />
        </div>
      </div>

      {/* Step 2 — Size (gated on the required "have" answer too) */}
      {region && existingType && systemType && (
        <div className="glass-card p-6 mb-6">
          <h2 className="step-gold text-lg font-semibold mb-4">
            <span className="text-xl">Step 2</span> — Tank Size
          </h2>

          {/* Existing system size — informational (optional). Card-within-a-card,
              tinted so it's clearly a separate question from the size they want. */}
          {existingType !== "none" && (
            <div className="mb-6 rounded-xl border border-sky-400/30 bg-sky-500/10 p-5">
              <p className="text-sm font-semibold text-sky-200 mb-3">
                Your current system{" "}
                <span className="font-normal opacity-70">(optional)</span>
              </p>
              {existingType === "heat_pump" ? (
                <SizeBandSelect
                  value={existingSizeBandId}
                  onChange={setExistingSizeBandId}
                  label="What size is your existing hot water system?"
                />
              ) : (
                <SizeSelect
                  region={region}
                  systemType={existingType}
                  value={existingSize}
                  onChange={setExistingSize}
                  label="What size is your existing hot water system?"
                />
              )}
            </div>
          )}

          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-5">
            {systemType === "heat_pump" ? (
              <SizeBandSelect
                value={sizeBandId}
                label="What size of hot water system are you after?"
                onChange={(bandId) => {
                  setSizeBandId(bandId);
                  const band = findHeatPumpBand(bandId);
                  setCapacityLitres(band ? band.min : null);
                  setSelectedExtras([]);
                  setExtrasComplete(false);
                }}
              />
            ) : (
              <SizeSelect
                region={region}
                systemType={systemType}
                value={capacityLitres}
                label="What size of hot water system are you after?"
                onChange={(val) => {
                  setCapacityLitres(val);
                  setSelectedExtras([]);
                  setExtrasComplete(false);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Step 3 — Installation questions (electric) / Extras (other types) */}
      {region && systemType && capacityLitres && (
        <div className="glass-card p-6 mb-6">
          <h2 className="step-gold text-lg font-semibold mb-4">
            <span className="text-xl">Step 3</span> —{" "}
            {systemType === "gas" ||
            systemType === "electric" ||
            systemType === "heat_pump" ||
            systemType === "solar_thermosiphon" ||
            systemType === "solar_split"
              ? "Installation Questions"
              : "Extras"}
          </h2>
          {systemType === "electric" || systemType === "gas" ? (
            <ElectricWizard
              region={region}
              systemType={systemType}
              selectedExtras={selectedExtras}
              onChange={setSelectedExtras}
              onCompletionChange={setExtrasComplete}
              onMetaChange={setRelocation}
              onLocationChange={setSystemLocation}
              existingType={existingType}
            />
          ) : systemType === "heat_pump" ? (
            <HeatPumpWizard
              region={region}
              systemType={systemType}
              selectedExtras={selectedExtras}
              onChange={setSelectedExtras}
              onCompletionChange={setExtrasComplete}
              onMetaChange={setRelocation}
              onLocationChange={setSystemLocation}
              onConversionChange={setConversion}
              existingType={existingType}
            />
          ) : systemType === "solar_thermosiphon" ? (
            <ThermosiphonWizard
              region={region}
              systemType={systemType}
              selectedExtras={selectedExtras}
              onChange={setSelectedExtras}
              onCompletionChange={setExtrasComplete}
              onLocationChange={setSystemLocation}
            />
          ) : systemType === "solar_split" ? (
            <SplitSolarWizard
              region={region}
              systemType={systemType}
              selectedExtras={selectedExtras}
              onChange={setSelectedExtras}
              onCompletionChange={setExtrasComplete}
              onMetaChange={setRelocation}
              onLocationChange={setSystemLocation}
            />
          ) : (
            <ExtrasList
              region={region}
              systemType={systemType}
              selectedExtras={selectedExtras}
              onChange={setSelectedExtras}
              onCompletionChange={setExtrasComplete}
              onLocationChange={setSystemLocation}
            />
          )}
        </div>
      )}

      {/* Step 4 — Homeowner details + generate */}
      {region && systemType && capacityLitres && (
        <div className="glass-card p-6 mb-6">
          <h2 className="step-gold text-lg font-semibold mb-4">
            <span className="text-xl">Step 4</span> — Homeowner &amp; Property Details
          </h2>
          <GenerateQuote
            region={region}
            systemType={systemType}
            capacityLitres={capacityLitres}
            extraIds={selectedExtras}
            extrasComplete={extrasComplete}
            relocation={relocation}
            systemLocation={systemLocation}
            sizeBandId={sizeBandId}
            conversion={conversion}
            existingType={existingType}
            existingSizeLabel={
              !existingType || existingType === "none"
                ? null
                : existingType === "heat_pump"
                ? existingSizeBandId
                  ? findHeatPumpBand(existingSizeBandId)?.label ?? null
                  : null
                : existingSize != null
                ? `${existingSize} L`
                : null
            }
          />
        </div>
      )}
    </div>
  );
}
