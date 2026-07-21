"use client";

import { HEAT_PUMP_BANDS } from "@/lib/heat-pump-bands";

/**
 * Step-2 size picker for HEAT PUMP only: choose a size band (capacities vary
 * slightly per brand) instead of an exact litre value. Mirrors SizeSelect's look.
 */
export default function SizeBandSelect({
  value,
  onChange,
  label = "Tank size",
}: {
  value: string | null;
  onChange: (bandId: string) => void;
  label?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-3">{label}</label>
      <div className="flex flex-wrap gap-3">
        {HEAT_PUMP_BANDS.map((b) => {
          const active = value === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onChange(b.id)}
              className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                active
                  ? "border-[#db231f] bg-[#db231f]/20 text-white shadow-[0_0_0_2px_rgba(219,35,31,0.3)]"
                  : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30"
              }`}
            >
              {b.label}
            </button>
          );
        })}
      </div>

      {/* Sizing helper — a link (NOT a selectable size), opens the guide image. */}
      <a
        href="/pdfs/Extras/Tank-Sizes.png"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-300 hover:text-sky-200 underline"
      >
        Unsure what size? View the size guide →
      </a>
    </div>
  );
}
