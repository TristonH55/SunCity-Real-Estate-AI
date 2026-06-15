"use client";

import { useEffect, useState } from "react";

export default function SizeSelect({
  region,
  systemType,
  value,
  onChange,
}: {
  region: string;
  systemType: string;
  value: number | null;
  onChange: (val: number) => void;
}) {
  const [sizes, setSizes] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!region || !systemType) return;
    setLoading(true);
    fetch(
      `/api/pricing/sizes?region=${encodeURIComponent(
        region
      )}&type=${encodeURIComponent(systemType)}`
    )
      .then((res) => res.json())
      .then((data) => setSizes(Array.isArray(data.sizes) ? data.sizes : []))
      .finally(() => setLoading(false));
  }, [region, systemType]);

  if (loading) {
    return <p className="text-slate-400 text-sm">Loading sizes…</p>;
  }

  if (sizes.length === 0) {
    return (
      <p className="text-slate-400 text-sm">
        No sizes available for this region &amp; system type.
      </p>
    );
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-3">
        Tank size
      </label>
      <div className="flex flex-wrap gap-3">
        {sizes.map((s) => {
          const active = value === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                active
                  ? "border-[#db231f] bg-[#db231f]/20 text-white shadow-[0_0_0_2px_rgba(219,35,31,0.3)]"
                  : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30"
              }`}
            >
              {s} L
            </button>
          );
        })}
      </div>
    </div>
  );
}
