"use client";

import { useState } from "react";
import { brandBrochures } from "@/lib/brand-brochures";

type Opt = {
  id: string;
  brand: string;
  model: string;
  capacityLitres: number;
  warrantyPrimaryYears: number;
  warrantySecondaryYears: number | null;
  brochureUrl: string | null;
  total: number;
};

const money = (v: number) =>
  v.toLocaleString("en-AU", { style: "currency", currency: "AUD" });

export default function ApproveForm({
  token,
  options,
  selectedOptionId,
  alreadyApproved,
  approvedByName,
  address,
}: {
  token: string;
  options: Opt[];
  selectedOptionId: string | null;
  alreadyApproved: boolean;
  approvedByName: string | null;
  address: string;
}) {
  const [choice, setChoice] = useState<string>(
    selectedOptionId || options[0]?.id || ""
  );
  const [name, setName] = useState<string>(approvedByName || "");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = options.find((o) => o.id === choice);

  const submit = async () => {
    setError(null);
    if (!choice) return setError("Please select a system.");
    if (!name.trim()) return setError("Please enter your full name.");
    if (!agree) return setError("Please tick the approval box to continue.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/quote/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, selectedOptionId: choice, name }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDone(true);
      } else {
        setError(data.error || "Something went wrong — please try again.");
      }
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-green-300 mb-2">
          Thank you, {name.trim()} ✓
        </h2>
        <p className="text-slate-300">
          Your choice has been recorded and your agent has been notified. They'll
          be in touch to finalise your order.
        </p>
        {selected && (
          <p className="text-slate-400 text-sm mt-3">
            You selected: <strong>{selected.brand}</strong> — {money(selected.total)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {alreadyApproved && (
        <div className="glass-card p-4 text-sm text-sky-200">
          You've already approved this quote — you can change your choice below
          and re-submit until your agent finalises it.
        </div>
      )}

      <div className="space-y-3">
        {options.map((o) => {
          const active = choice === o.id;
          return (
            <label
              key={o.id}
              className={`block glass-card p-4 cursor-pointer transition ${
                active ? "ring-2 ring-[#db231f]" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="opt"
                  className="mt-1"
                  checked={active}
                  onChange={() => setChoice(o.id)}
                />
                <div className="flex-1">
                  <div className="flex justify-between gap-3 flex-wrap">
                    <span className="font-semibold text-[#ff5a2c]">
                      {o.brand}
                    </span>
                    <span className="font-bold text-gradient">
                      {money(o.total)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{o.model}</p>
                  <p className="text-xs text-slate-400">
                    {o.capacityLitres} L · warranty {o.warrantyPrimaryYears}
                    {o.warrantySecondaryYears
                      ? ` + ${o.warrantySecondaryYears}`
                      : ""}{" "}
                    yrs · price inc GST
                  </p>

                  {(brandBrochures(o.brand).length > 0 || o.brochureUrl) && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      {brandBrochures(o.brand).map((b) => (
                        <a
                          key={b.href}
                          href={b.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-sky-300 hover:text-sky-200 underline"
                        >
                          📄 {b.label}
                        </a>
                      ))}
                      {o.brochureUrl && (
                        <a
                          href={o.brochureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-sky-300 hover:text-sky-200 underline"
                        >
                          📄 Brochure
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="glass-card p-5 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Your full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jane Smith"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition"
          />
        </div>

        <label className="flex items-start gap-3 text-sm text-slate-200 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span>
            I approve{" "}
            <strong>
              {selected ? `${selected.brand} ${selected.model}` : "the selected system"}
            </strong>{" "}
            at <strong>{selected ? money(selected.total) : "—"}</strong> (inc GST),
            at the Install Address of: <strong>{address || "—"}</strong>. I
            understand this records my selection as my electronic signature.
          </span>
        </label>

        <button
          onClick={submit}
          disabled={submitting}
          className="btn-primary w-full"
        >
          {submitting ? "Submitting…" : "Approve & notify my agent"}
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm font-semibold text-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
