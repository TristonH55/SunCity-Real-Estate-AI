"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CustomItem } from "@/lib/quote-adjust";

const money = (v: number) =>
  v.toLocaleString("en-AU", { style: "currency", currency: "AUD" });

// "Additional items" on the quote page. Everyone sees the items; admins on an
// unlocked quote also get a remove button per item and an add form underneath
// that clears after each add, so any number of items can go on.
export default function CustomItems({
  quoteId,
  items,
  canEdit,
  approved,
  gstLabel,
}: {
  quoteId: string;
  items: CustomItem[];
  canEdit: boolean;
  approved: boolean;
  gstLabel: string;
}) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState<string | null>(null); // "add" or an item id
  const [error, setError] = useState<string | null>(null);

  if (!canEdit && items.length === 0) return null;

  const send = async (method: "POST" | "DELETE", body: object, key: string) => {
    if (approved && !confirm("The homeowner has approved this quote. Changing it clears their approval so they approve the new total. Continue?")) {
      return false;
    }
    setBusy(key);
    setError(null);
    try {
      const res = await fetch(`/api/quote/${quoteId}/custom-items`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed. Please try again.");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Save failed. Please try again.");
      return false;
    } finally {
      setBusy(null);
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await send("POST", { label, amount }, "add")) {
      setLabel("");
      setAmount("");
    }
  };

  return (
    <>
      <p className="text-slate-400 text-sm mt-4 mb-2">Additional items</p>
      {items.length > 0 && (
        <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              {item.label} — {money(Number(item.amount))}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => send("DELETE", { itemId: item.id }, item.id)}
                  disabled={busy !== null}
                  className="ml-3 text-xs text-red-300 hover:text-red-200 underline disabled:opacity-50"
                >
                  {busy === item.id ? "Removing…" : "Remove"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <form onSubmit={add} className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Description, e.g. 5 foot wall removal charge"
            maxLength={200}
            aria-label="Item description"
            className="flex-1 min-w-[220px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          />
          <input
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`$ Price (${gstLabel})`}
            aria-label={`Item price (${gstLabel})`}
            className="w-40 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          />
          <button
            type="submit"
            disabled={busy !== null || !label.trim() || amount === ""}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy === "add" ? "Adding…" : "Add"}
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-sm font-semibold text-red-300">{error}</p>}
    </>
  );
}
