"use client";

import { useEffect, useState } from "react";

type Hidden = {
  systemId: string;
  brand: string;
  model: string;
  systemType: string;
  capacityLitres: number;
  usedInQuotes: number;
};

export default function HiddenProducts() {
  const [rows, setRows] = useState<Hidden[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<Hidden | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/prices?hidden=1")
      .then((r) => r.json())
      .then((d) => setRows(d.systems ?? []))
      .catch(() => setMessage({ tone: "err", text: "Failed to load hidden products." }))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const restore = async (id: string) => {
    setBusy(id);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/prices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: [{ systemId: id, archived: false }] }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ tone: "ok", text: "Product restored." });
        load();
      } else {
        setMessage({ tone: "err", text: data.error || "Restore failed." });
      }
    } catch {
      setMessage({ tone: "err", text: "Restore failed." });
    } finally {
      setBusy(null);
    }
  };

  const del = async (id: string) => {
    setBusy(id);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/prices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemId: id }),
      });
      const data = await res.json();
      setConfirmDel(null);
      if (res.ok) {
        setMessage({ tone: "ok", text: "Product deleted." });
        load();
      } else {
        setMessage({ tone: "err", text: data.error || "Delete failed." });
      }
    } catch {
      setConfirmDel(null);
      setMessage({ tone: "err", text: "Delete failed." });
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="glass-card p-6">
      {rows.length === 0 ? (
        <p className="text-slate-400">No hidden products.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10 text-slate-300">
                <th className="text-left py-2">Brand</th>
                <th className="text-left py-2">Model</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Size</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.systemId} className="border-b border-white/10 text-slate-200">
                  <td className="py-2 pr-3">{r.brand}</td>
                  <td className="pr-3">{r.model}</td>
                  <td className="pr-3">{r.systemType.replace(/_/g, " ")}</td>
                  <td className="pr-3">{r.capacityLitres} L</td>
                  <td className="py-1">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        disabled={busy === r.systemId}
                        onClick={() => restore(r.systemId)}
                        className="text-xs text-emerald-300 hover:text-emerald-200 underline"
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        disabled={busy === r.systemId}
                        onClick={() => setConfirmDel(r)}
                        className="text-xs text-red-300 hover:text-red-200 underline"
                      >
                        Delete
                      </button>
                      {r.usedInQuotes > 0 && (
                        <span className="text-[11px] text-slate-500">
                          used in {r.usedInQuotes} quote{r.usedInQuotes === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {message && (
        <p
          className={`mt-4 text-sm font-semibold ${
            message.tone === "ok" ? "text-emerald-300" : "text-red-300"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Delete confirmation */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="glass-card w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-red-300">⚠ Delete permanently?</h3>
            <p className="text-sm text-slate-200">
              Permanently delete <strong>{confirmDel.brand} {confirmDel.model}</strong>? This can&apos;t
              be undone.
            </p>
            {confirmDel.usedInQuotes > 0 && (
              <p className="text-xs text-amber-300">
                This product is used in {confirmDel.usedInQuotes} past quote
                {confirmDel.usedInQuotes === 1 ? "" : "s"} — deletion will be blocked to preserve
                quote history. Keep it hidden instead.
              </p>
            )}
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setConfirmDel(null)}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => del(confirmDel.systemId)}
                disabled={busy === confirmDel.systemId}
                className="btn-primary"
              >
                {busy === confirmDel.systemId ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
