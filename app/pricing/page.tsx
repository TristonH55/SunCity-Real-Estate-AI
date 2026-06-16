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
import ExtrasList from "./components/ExtrasList";
import GenerateQuote from "./components/GenerateQuote";

export default function PricingPage() {
  const { status } = useSession();

  const [region, setRegion] = useState<string | null>(null);
  const [systemType, setSystemType] = useState<string | null>(null);
  const [capacityLitres, setCapacityLitres] = useState<number | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [extrasComplete, setExtrasComplete] = useState(false);

  const resetBelowType = () => {
    setCapacityLitres(null);
    setSelectedExtras([]);
    setExtrasComplete(false);
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
              setSystemType(null);
              resetBelowType();
            }}
          />
          <SystemTypeSelect
            value={systemType}
            onChange={(val) => {
              setSystemType(val);
              resetBelowType();
            }}
          />
        </div>
      </div>

      {/* Step 2 — Size */}
      {region && systemType && (
        <div className="glass-card p-6 mb-6">
          <h2 className="step-gold text-lg font-semibold mb-4">
            <span className="text-xl">Step 2</span> — Tank Size
          </h2>
          <SizeSelect
            region={region}
            systemType={systemType}
            value={capacityLitres}
            onChange={(val) => {
              setCapacityLitres(val);
              setSelectedExtras([]);
              setExtrasComplete(false);
            }}
          />
        </div>
      )}

      {/* Step 3 — Extras */}
      {region && systemType && capacityLitres && (
        <div className="glass-card p-6 mb-6">
          <h2 className="step-gold text-lg font-semibold mb-4">
            <span className="text-xl">Step 3</span> — Extras
          </h2>
          <ExtrasList
            region={region}
            systemType={systemType}
            selectedExtras={selectedExtras}
            onChange={setSelectedExtras}
            onCompletionChange={setExtrasComplete}
          />
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
          />
        </div>
      )}
    </div>
  );
}
