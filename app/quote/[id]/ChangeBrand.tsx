"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Candidate = {
  systemId: string;
  brand: string;
  model: string;
  capacityLitres: number;
  warrantyPrimaryYears: number;
  warrantySecondaryYears: number | null;
  total: number;
};

const money = (v: number) =>
  v.toLocaleString("en-AU", { style: "currency", currency: "AUD" });

// Admin button + slide-out panel. With optionId it replaces that option's
// system ("Change brand"); without, it adds a new option ("Add another brand").
// Lists systems of the same type, size and region, with the total each gives.
export default function ChangeBrand({
  quoteId,
  optionId,
  currentName,
  approved,
}: {
  quoteId: string;
  optionId?: string;
  currentName?: string;
  approved: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [systems, setSystems] = useState<Candidate[] | null>(null);
  const [picked, setPicked] = useState<Candidate | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adding = !optionId;

  useEffect(() => {
    if (!open) return;
    setSystems(null);
    setPicked(null);
    setError(null);
    fetch(`/api/quote/${quoteId}/change-brand`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setSystems(data.systems ?? []);
      })
      .catch(() => setError("Couldn't load systems. Please try again."));

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, quoteId]);

  const confirmSwap = async () => {
    if (!picked) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/quote/${quoteId}/change-brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemId: picked.systemId, ...(optionId ? { optionId } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed. Please try again.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition"
      >
        {adding ? "+ Add another brand" : "Change brand"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={adding ? "Add another brand" : "Change brand"}
            className="relative h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0d1220] p-6 text-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-[#ff5a2c]">
                  {adding ? "Add another brand" : "Change brand"}
                </h2>
                {currentName && (
                  <p className="text-sm text-slate-400">Replacing {currentName}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            {approved && (
              <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                The homeowner has approved this quote. Saving a change clears their approval so they
                approve the new version.
              </p>
            )}

            {systems === null && !error && <p className="text-slate-400">Loading systems…</p>}
            {systems?.length === 0 && (
              <p className="text-slate-400">
                No other systems match this quote&apos;s type, size and region.
              </p>
            )}

            <ul className="space-y-2">
              {systems?.map((s) => (
                <li key={s.systemId}>
                  <button
                    type="button"
                    onClick={() => setPicked(s)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                      picked?.systemId === s.systemId
                        ? "border-emerald-400 bg-emerald-500/15"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold">{s.brand}</span>
                      <span className="font-semibold">{money(s.total)}</span>
                    </div>
                    <p className="text-sm text-slate-300">{s.model}</p>
                    <p className="text-xs text-slate-400">
                      {s.capacityLitres} L · warranty {s.warrantyPrimaryYears}
                      {s.warrantySecondaryYears ? ` + ${s.warrantySecondaryYears}` : ""} yrs
                    </p>
                  </button>
                </li>
              ))}
            </ul>

            {error && <p className="mt-4 text-sm font-semibold text-red-300">{error}</p>}

            {picked && (
              <div className="sticky bottom-0 mt-4 -mx-6 -mb-6 border-t border-white/10 bg-[#0d1220] p-6">
                <p className="text-sm text-slate-300 mb-3">
                  {picked.brand} {picked.model} — new total{" "}
                  <strong className="text-white">{money(picked.total)}</strong> (inc GST)
                </p>
                <button
                  type="button"
                  onClick={confirmSwap}
                  disabled={saving}
                  className="btn-primary w-full disabled:opacity-60"
                >
                  {saving ? "Saving…" : adding ? "Add to quote" : "Confirm change"}
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
