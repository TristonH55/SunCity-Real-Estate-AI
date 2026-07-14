"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type GstMode = "inclusive" | "exclusive";

export default function GstModeToggle({ initialMode }: { initialMode: GstMode }) {
  const router = useRouter();
  const [mode, setMode] = useState<GstMode>(initialMode);
  const [pending, setPending] = useState<GstMode | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const apply = async (next: GstMode) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/gst-mode", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: next }),
      });
      const data = await res.json();
      if (res.ok) {
        setMode(next);
        setMessage({ tone: "ok", text: "GST mode updated." });
        router.refresh();
      } else {
        setMessage({ tone: "err", text: data.error || "Update failed." });
      }
    } catch {
      setMessage({ tone: "err", text: "Update failed. Please try again." });
    } finally {
      setSaving(false);
      setPending(null);
    }
  };

  const btn = (m: GstMode, label: string) => (
    <button
      type="button"
      disabled={saving}
      onClick={() => m !== mode && setPending(m)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
        mode === m
          ? "bg-[#db231f] text-white"
          : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="glass-card p-6 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-slate-300">GST handling (site-wide):</span>
        {btn("inclusive", "Prices include GST")}
        {btn("exclusive", "Add GST on top")}
        {message && (
          <span
            className={`text-sm font-semibold ${
              message.tone === "ok" ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400">
        {mode === "inclusive"
          ? "Prices you enter already include GST — the customer total equals the entered price, and GST is shown as the included portion."
          : "Prices you enter are ex-GST — 10% GST is added on top of every quote."}{" "}
        Changing this affects <strong>new quotes only</strong>; already-locked quotes keep their
        stored totals.
      </p>

      {/* Confirmation before switching site-wide */}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="glass-card w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-amber-300">⚠ Switch GST mode site-wide?</h3>
            <p className="text-sm text-slate-200">
              You are about to switch GST handling to{" "}
              <strong>
                {pending === "inclusive" ? "Prices include GST" : "Add GST on top"}
              </strong>{" "}
              for the <strong>whole app</strong>. This changes how{" "}
              <strong>all new quotes</strong> are priced. Are you sure?
            </p>
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setPending(null)}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button onClick={() => apply(pending)} disabled={saving} className="btn-primary">
                {saving ? "Saving…" : "Yes, switch mode"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
