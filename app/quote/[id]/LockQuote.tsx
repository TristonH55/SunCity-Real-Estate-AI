"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Opt = { id: string; brand: string; total: number };

const money = (v: number) =>
  v.toLocaleString("en-AU", { style: "currency", currency: "AUD" });

export default function LockQuote({
  quoteId,
  status,
  selectedOptionId,
  confirmationId,
  options,
  approvedByName,
  approvedAt,
}: {
  quoteId: string;
  status: string;
  selectedOptionId: string | null;
  confirmationId: string | null;
  options: Opt[];
  approvedByName: string | null;
  approvedAt: string | null;
}) {
  const router = useRouter();
  const [choice, setChoice] = useState<string>(
    selectedOptionId || options[0]?.id || ""
  );
  const [locking, setLocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lock = async (optionId: string) => {
    setError(null);
    if (!optionId) {
      setError("Please select an option to lock.");
      return;
    }
    setLocking(true);
    try {
      const res = await fetch(`/api/quote/${quoteId}/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOptionId: optionId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.confirmationId) {
          router.push(`/dashboard/jobs/${data.confirmationId}`);
        } else {
          router.refresh();
        }
      } else {
        setError(data.error || "Failed to lock. Please try again.");
      }
    } catch {
      setError("Failed to lock. Please try again.");
    } finally {
      setLocking(false);
    }
  };

  // Already finalised.
  if (status === "locked") {
    const sel = options.find((o) => o.id === selectedOptionId);
    return (
      <div className="glass-card p-5 mt-6">
        <p className="text-green-300 font-semibold mb-2">
          ✓ Locked{sel ? ` — ${sel.brand}` : ""}
        </p>
        {confirmationId && (
          <a
            href={`/dashboard/jobs/${confirmationId}`}
            className="text-sky-300 hover:text-sky-200 underline text-sm"
          >
            Open job
          </a>
        )}
      </div>
    );
  }

  // Homeowner approved online — agent confirms (one green click).
  if (status === "approved") {
    const sel = options.find((o) => o.id === selectedOptionId);
    return (
      <div className="glass-card p-5 mt-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Confirm the homeowner&apos;s choice
        </h2>
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-green-300 font-semibold">
            Homeowner Has Selected: {sel ? `${sel.brand} — ${money(sel.total)}` : "—"}
          </p>
          {approvedByName && (
            <p className="text-xs text-slate-300 mt-1">
              Approved by {approvedByName}
              {approvedAt
                ? ` on ${new Date(approvedAt).toLocaleDateString("en-AU")}`
                : ""}
            </p>
          )}
        </div>
        <button
          onClick={() => lock(selectedOptionId || choice)}
          disabled={locking}
          className="w-full inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold text-white bg-green-600 hover:bg-green-500 transition disabled:opacity-60"
        >
          {locking
            ? "Confirming…"
            : "Homeowner Has Selected — Confirm order"}
        </button>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm font-semibold text-red-300">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Presented — agent manual fallback.
  return (
    <div className="glass-card p-5 mt-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">
        Confirm the homeowner&apos;s choice
      </h2>
      <div className="space-y-2">
        {options.map((o) => (
          <label
            key={o.id}
            className="flex items-center gap-3 text-sm text-slate-200 cursor-pointer"
          >
            <input
              type="radio"
              name="lockChoice"
              value={o.id}
              checked={choice === o.id}
              onChange={() => setChoice(o.id)}
            />
            <span>
              {o.brand} — {money(o.total)}
            </span>
          </label>
        ))}
      </div>
      <button
        onClick={() => lock(choice)}
        disabled={locking || !choice}
        className="btn-primary w-full"
      >
        {locking ? "Locking…" : "Confirm & lock"}
      </button>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm font-semibold text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
