"use client";

import { useMemo, useState } from "react";
import RegionSelect from "@/app/pricing/components/RegionSelect";
import SystemTypeSelect from "@/app/pricing/components/SystemTypeSelect";

type Row = {
  systemId: string;
  brand: string;
  model: string;
  capacityLitres: number;
  tankMaterial: string;
  price: number | null;
};

type ExtraRow = {
  extraId: string;
  code: string;
  name: string;
  price: number | null;
  shared: boolean;
};

type Tab = "systems" | "extras";

export default function PriceEditor({ gstMode }: { gstMode?: "inclusive" | "exclusive" }) {
  const gstLabel = gstMode === "exclusive" ? "ex-GST" : "inc GST";

  const [region, setRegion] = useState<string | null>(null);
  const [systemType, setSystemType] = useState<string | null>(null);
  const [regionName, setRegionName] = useState("");
  const [tab, setTab] = useState<Tab>("systems");

  // System (unit) prices
  const [rows, setRows] = useState<Row[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [sizeFilter, setSizeFilter] = useState<string>("all");

  // Add-on (Extra) prices
  const [extraRows, setExtraRows] = useState<ExtraRow[]>([]);
  const [extraEdits, setExtraEdits] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const loadSystems = (regionCode: string, type: string) => {
    setLoading(true);
    setMessage(null);
    fetch(
      `/api/admin/prices?region=${encodeURIComponent(regionCode)}&type=${encodeURIComponent(type)}`
    )
      .then((res) => res.json())
      .then((data) => {
        const systems: Row[] = data.systems ?? [];
        setRows(systems);
        setRegionName(data.region ?? "");
        setSizeFilter("all");
        const init: Record<string, string> = {};
        for (const s of systems) init[s.systemId] = s.price != null ? String(s.price) : "";
        setEdits(init);
      })
      .catch(() => setMessage({ tone: "err", text: "Failed to load systems." }))
      .finally(() => setLoading(false));
  };

  const loadExtras = (regionCode: string, type: string) => {
    setLoading(true);
    setMessage(null);
    fetch(
      `/api/admin/extra-prices?region=${encodeURIComponent(regionCode)}&type=${encodeURIComponent(type)}`
    )
      .then((res) => res.json())
      .then((data) => {
        const extras: ExtraRow[] = data.extras ?? [];
        setExtraRows(extras);
        setRegionName(data.region ?? "");
        const init: Record<string, string> = {};
        for (const e of extras) init[e.extraId] = e.price != null ? String(e.price) : "";
        setExtraEdits(init);
      })
      .catch(() => setMessage({ tone: "err", text: "Failed to load add-ons." }))
      .finally(() => setLoading(false));
  };

  // Load whichever tab is active (called on region/type change and tab switch).
  const loadTab = (regionCode: string, type: string, which: Tab) => {
    if (which === "systems") loadSystems(regionCode, type);
    else loadExtras(regionCode, type);
  };

  const onSelectRegion = (val: string) => {
    setRegion(val);
    if (systemType) loadTab(val, systemType, tab);
  };
  const onSelectType = (val: string) => {
    setSystemType(val);
    if (region) loadTab(region, val, tab);
  };
  const onSelectTab = (which: Tab) => {
    if (which === tab) return;
    setTab(which);
    setMessage(null);
    if (region && systemType) loadTab(region, systemType, which);
  };

  const sizes = useMemo(
    () => [...new Set(rows.map((r) => r.capacityLitres))].sort((a, b) => a - b),
    [rows]
  );

  const visibleRows =
    sizeFilter === "all"
      ? rows
      : rows.filter((r) => String(r.capacityLitres) === sizeFilter);

  const changed = rows.filter((r) => {
    const original = r.price != null ? String(r.price) : "";
    return (edits[r.systemId] ?? "") !== original && (edits[r.systemId] ?? "") !== "";
  });

  const changedExtras = extraRows.filter((e) => {
    const original = e.price != null ? String(e.price) : "";
    return (extraEdits[e.extraId] ?? "") !== original && (extraEdits[e.extraId] ?? "") !== "";
  });

  const changedCount = tab === "systems" ? changed.length : changedExtras.length;

  const save = async () => {
    setMessage(null);
    if (tab === "systems") {
      const updates = changed.map((r) => ({ systemId: r.systemId, price: Number(edits[r.systemId]) }));
      if (updates.length === 0) {
        setMessage({ tone: "err", text: "No changes to save." });
        return;
      }
      for (const u of updates) {
        if (!Number.isFinite(u.price) || u.price < 0) {
          setMessage({ tone: "err", text: "Prices must be numbers of 0 or more." });
          return;
        }
      }
      setSaving(true);
      try {
        const res = await fetch("/api/admin/prices", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ regionCode: region, updates }),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage({ tone: "ok", text: `Saved ${data.updated} price${data.updated === 1 ? "" : "s"}.` });
          setRows((prev) =>
            prev.map((r) =>
              edits[r.systemId] !== undefined && edits[r.systemId] !== ""
                ? { ...r, price: Number(edits[r.systemId]) }
                : r
            )
          );
        } else {
          setMessage({ tone: "err", text: data.error || "Save failed." });
        }
      } catch {
        setMessage({ tone: "err", text: "Save failed. Please try again." });
      } finally {
        setSaving(false);
      }
    } else {
      const updates = changedExtras.map((e) => ({ extraId: e.extraId, price: Number(extraEdits[e.extraId]) }));
      if (updates.length === 0) {
        setMessage({ tone: "err", text: "No changes to save." });
        return;
      }
      for (const u of updates) {
        if (!Number.isFinite(u.price) || u.price < 0) {
          setMessage({ tone: "err", text: "Prices must be numbers of 0 or more." });
          return;
        }
      }
      setSaving(true);
      try {
        const res = await fetch("/api/admin/extra-prices", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ regionCode: region, updates }),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage({ tone: "ok", text: `Saved ${data.updated} price${data.updated === 1 ? "" : "s"}.` });
          setExtraRows((prev) =>
            prev.map((e) =>
              extraEdits[e.extraId] !== undefined && extraEdits[e.extraId] !== ""
                ? { ...e, price: Number(extraEdits[e.extraId]) }
                : e
            )
          );
        } else {
          setMessage({ tone: "err", text: data.error || "Save failed." });
        }
      } catch {
        setMessage({ tone: "err", text: "Save failed. Please try again." });
      } finally {
        setSaving(false);
      }
    }
  };

  const inputClass =
    "w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition";

  const tabClass = (which: Tab) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition ${
      tab === which
        ? "bg-[#db231f] text-white"
        : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
    }`;

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <div className="glass-card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <RegionSelect value={region} onChange={onSelectRegion} />
          <SystemTypeSelect value={systemType} onChange={onSelectType} />
        </div>

        {/* Tab toggle */}
        <div className="flex gap-2">
          <button type="button" className={tabClass("systems")} onClick={() => onSelectTab("systems")}>
            System Prices
          </button>
          <button type="button" className={tabClass("extras")} onClick={() => onSelectTab("extras")}>
            Add-on Prices
          </button>
        </div>

        {tab === "systems" && rows.length > 0 && (
          <div className="max-w-xs">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Filter by size</label>
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white [&_option]:bg-[#0d1220] [&_option]:text-white"
            >
              <option value="all">All sizes</option>
              {sizes.map((s) => (
                <option key={s} value={String(s)}>
                  {s} L
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : !region || !systemType ? (
        <p className="text-slate-400">Choose a region and system type to load prices.</p>
      ) : tab === "systems" ? (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-[#ff5a2c] mb-4">
            {regionName} · {systemType.replace(/_/g, " ")} — {visibleRows.length} system
            {visibleRows.length === 1 ? "" : "s"}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-white/10 text-slate-300">
                  <th className="text-left py-2">Brand</th>
                  <th className="text-left py-2">Model</th>
                  <th className="text-left py-2">Size</th>
                  <th className="text-left py-2">Price ({gstLabel})</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((r) => (
                  <tr key={r.systemId} className="border-b border-white/10 text-slate-200">
                    <td className="py-2 pr-3">{r.brand}</td>
                    <td className="pr-3">{r.model}</td>
                    <td className="pr-3">{r.capacityLitres} L</td>
                    <td className="py-1">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">$</span>
                        <input
                          type="number"
                          min={0}
                          value={edits[r.systemId] ?? ""}
                          placeholder={r.price == null ? "not set" : ""}
                          onChange={(e) =>
                            setEdits((prev) => ({ ...prev, [r.systemId]: e.target.value }))
                          }
                          className={inputClass}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-slate-400">
                      No systems for this selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={saving || changed.length === 0}
              className="btn-primary"
            >
              {saving ? "Saving…" : `Save changes${changed.length ? ` (${changed.length})` : ""}`}
            </button>
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
        </div>
      ) : (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-[#ff5a2c] mb-4">
            {regionName} · {systemType.replace(/_/g, " ")} — {extraRows.length} add-on
            {extraRows.length === 1 ? "" : "s"}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-white/10 text-slate-300">
                  <th className="text-left py-2">Add-on</th>
                  <th className="text-left py-2">Price ({gstLabel})</th>
                </tr>
              </thead>
              <tbody>
                {extraRows.map((e) => (
                  <tr key={e.extraId} className="border-b border-white/10 text-slate-200">
                    <td className="py-2 pr-3">
                      {e.name}
                      {e.shared && (
                        <span className="ml-2 inline-block rounded bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300 align-middle">
                          shared across system types
                        </span>
                      )}
                    </td>
                    <td className="py-1">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">$</span>
                        <input
                          type="number"
                          min={0}
                          value={extraEdits[e.extraId] ?? ""}
                          placeholder={e.price == null ? "not set" : ""}
                          onChange={(ev) =>
                            setExtraEdits((prev) => ({ ...prev, [e.extraId]: ev.target.value }))
                          }
                          className={inputClass}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {extraRows.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-4 text-slate-400">
                      No add-ons for this selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {extraRows.some((e) => e.shared) && (
            <p className="mt-3 text-xs text-amber-300/80">
              ⚠ Add-ons marked <strong>shared across system types</strong> use one price everywhere
              they appear — changing one here changes it for every system type in this region.
            </p>
          )}

          <div className="mt-5 flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={saving || changedExtras.length === 0}
              className="btn-primary"
            >
              {saving ? "Saving…" : `Save changes${changedExtras.length ? ` (${changedExtras.length})` : ""}`}
            </button>
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
        </div>
      )}

      {/* Live-price safety confirmation */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="glass-card w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-amber-300">⚠ Update live prices?</h3>
            <p className="text-sm text-slate-200">
              You are about to update the{" "}
              {tab === "systems" ? "system prices" : "add-on prices"} on the{" "}
              <strong>live app</strong>. These changes take effect{" "}
              <strong>immediately</strong> for real customer quotes. Are you sure?
            </p>
            <p className="text-xs text-slate-400">
              {changedCount} price{changedCount === 1 ? "" : "s"} will change
              {regionName ? ` for ${regionName}` : ""}.
            </p>
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setConfirmOpen(false);
                  await save();
                }}
                className="btn-primary"
              >
                Yes, update prices
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
