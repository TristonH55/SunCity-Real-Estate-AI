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
  warrantyPrimaryYears: number;
  warrantySecondaryYears: number | null;
  price: number | null;
  regionActive: boolean;
  globalActive: boolean;
  brochureUrl: string | null;
};

type ExtraRow = {
  extraId: string;
  code: string;
  name: string;
  price: number | null;
  shared: boolean;
  infoText: string | null;
  brochureUrl: string | null;
};

// Media (brochure/info) editor target.
type MediaTarget =
  | { kind: "system"; id: string; name: string; brochureUrl: string; infoText: string }
  | { kind: "extra"; id: string; name: string; brochureUrl: string; infoText: string };

type Tab = "systems" | "extras";
type Avail = { regionActive: boolean; globalActive: boolean };

const emptyProduct = {
  brand: "",
  model: "",
  size: "",
  tankMaterial: "mild_steel",
  warrantyPrimary: "",
  warrantySecondary: "",
  price: "",
  brochureUrl: "",
};

const isImage = (url: string) => /\.(png|jpe?g|webp|gif)$/i.test(url.split("?")[0]);

function ToggleChip({
  on,
  onClick,
  disabled,
}: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
        disabled
          ? "opacity-40 cursor-not-allowed border-white/10 bg-white/5 text-slate-400"
          : on
          ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
      }`}
    >
      {on ? "On" : "Off"}
    </button>
  );
}

export default function PriceEditor({ gstMode }: { gstMode?: "inclusive" | "exclusive" }) {
  const gstLabel = gstMode === "exclusive" ? "ex-GST" : "inc GST";

  const [region, setRegion] = useState<string | null>(null);
  const [systemType, setSystemType] = useState<string | null>(null);
  const [regionName, setRegionName] = useState("");
  const [tab, setTab] = useState<Tab>("systems");

  // System (unit) prices + availability
  const [rows, setRows] = useState<Row[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [avail, setAvail] = useState<Record<string, Avail>>({});
  const [sizeFilter, setSizeFilter] = useState<string>("all");

  // Add-on (Extra) prices
  const [extraRows, setExtraRows] = useState<ExtraRow[]>([]);
  const [extraEdits, setExtraEdits] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  // Add/Edit product form
  const [addOpen, setAddOpen] = useState(false);
  const [np, setNp] = useState({ ...emptyProduct });
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null = add mode

  // Brochure / info editor (shared for products + add-ons)
  const [media, setMedia] = useState<MediaTarget | null>(null);
  const [mediaSaving, setMediaSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload a file to R2, return its URL (or null on failure).
  const uploadFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) return data.url as string;
      setMessage({ tone: "err", text: data.error || "Upload failed." });
      return null;
    } catch {
      setMessage({ tone: "err", text: "Upload failed." });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveMedia = async () => {
    if (!media) return;
    setMediaSaving(true);
    setMessage(null);
    try {
      const res =
        media.kind === "system"
          ? await fetch("/api/admin/prices", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                regionCode: region,
                updates: [{ systemId: media.id, brochureUrl: media.brochureUrl }],
              }),
            })
          : await fetch("/api/admin/extra-info", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                extraId: media.id,
                infoText: media.infoText,
                brochureUrl: media.brochureUrl,
              }),
            });
      const data = await res.json();
      if (res.ok) {
        setMessage({ tone: "ok", text: "Saved." });
        setMedia(null);
        if (region && systemType) loadTab(region, systemType, tab);
      } else {
        setMessage({ tone: "err", text: data.error || "Save failed." });
      }
    } catch {
      setMessage({ tone: "err", text: "Save failed." });
    } finally {
      setMediaSaving(false);
    }
  };

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
        const initE: Record<string, string> = {};
        const initA: Record<string, Avail> = {};
        for (const s of systems) {
          initE[s.systemId] = s.price != null ? String(s.price) : "";
          initA[s.systemId] = { regionActive: s.regionActive, globalActive: s.globalActive };
        }
        setEdits(initE);
        setAvail(initA);
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
    sizeFilter === "all" ? rows : rows.filter((r) => String(r.capacityLitres) === sizeFilter);

  const availOf = (id: string): Avail => avail[id] ?? { regionActive: true, globalActive: true };

  const priceChanged = (r: Row) => {
    const original = r.price != null ? String(r.price) : "";
    return (edits[r.systemId] ?? "") !== original && (edits[r.systemId] ?? "") !== "";
  };
  const availChanged = (r: Row) => {
    const a = availOf(r.systemId);
    return a.regionActive !== r.regionActive || a.globalActive !== r.globalActive;
  };

  const changed = rows.filter((r) => priceChanged(r) || availChanged(r));

  const changedExtras = extraRows.filter((e) => {
    const original = e.price != null ? String(e.price) : "";
    return (extraEdits[e.extraId] ?? "") !== original && (extraEdits[e.extraId] ?? "") !== "";
  });

  const changedCount = tab === "systems" ? changed.length : changedExtras.length;

  const save = async () => {
    setMessage(null);
    if (tab === "systems") {
      if (changed.length === 0) {
        setMessage({ tone: "err", text: "No changes to save." });
        return;
      }
      const updates = changed.map((r) => {
        const u: any = { systemId: r.systemId };
        if (priceChanged(r)) u.price = Number(edits[r.systemId]);
        const a = availOf(r.systemId);
        if (a.regionActive !== r.regionActive) u.regionActive = a.regionActive;
        if (a.globalActive !== r.globalActive) u.globalActive = a.globalActive;
        return u;
      });
      for (const u of updates) {
        if (u.price !== undefined && (!Number.isFinite(u.price) || u.price < 0)) {
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
          setMessage({ tone: "ok", text: `Saved ${data.updated} change${data.updated === 1 ? "" : "s"}.` });
          setRows((prev) =>
            prev.map((r) => {
              const a = availOf(r.systemId);
              return {
                ...r,
                price: priceChanged(r) ? Number(edits[r.systemId]) : r.price,
                regionActive: a.regionActive,
                globalActive: a.globalActive,
              };
            })
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

  const openAdd = () => {
    setEditingId(null);
    setNp({ ...emptyProduct });
    setAddOpen(true);
  };

  const openEdit = (r: Row) => {
    setEditingId(r.systemId);
    setNp({
      brand: r.brand,
      model: r.model,
      size: String(r.capacityLitres),
      tankMaterial: r.tankMaterial,
      warrantyPrimary: String(r.warrantyPrimaryYears),
      warrantySecondary: r.warrantySecondaryYears != null ? String(r.warrantySecondaryYears) : "",
      price: "",
      brochureUrl: r.brochureUrl ?? "",
    });
    setAddOpen(true);
  };

  const submitProduct = async () => {
    setMessage(null);
    if (!np.brand.trim() || !np.model.trim()) {
      setMessage({ tone: "err", text: "Brand and model are required." });
      return;
    }
    if (!Number.isInteger(Number(np.size)) || Number(np.size) <= 0) {
      setMessage({ tone: "err", text: "Size must be a whole number of litres." });
      return;
    }
    // Price is only entered when adding (editing changes product fields, not the region price).
    if (!editingId && (np.price === "" || !Number.isFinite(Number(np.price)) || Number(np.price) < 0)) {
      setMessage({ tone: "err", text: "Enter a valid price." });
      return;
    }
    const productFields = {
      brand: np.brand.trim(),
      model: np.model.trim(),
      capacityLitres: Number(np.size),
      tankMaterial: np.tankMaterial,
      warrantyPrimaryYears: Number(np.warrantyPrimary || 0),
      warrantySecondaryYears: np.warrantySecondary === "" ? null : Number(np.warrantySecondary),
      brochureUrl: np.brochureUrl,
    };
    setAdding(true);
    try {
      const res = editingId
        ? await fetch("/api/admin/prices", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ systemId: editingId, product: productFields }),
          })
        : await fetch("/api/admin/prices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              regionCode: region,
              systemType,
              product: { ...productFields, price: Number(np.price) },
            }),
          });
      const data = await res.json();
      if (res.ok) {
        setAddOpen(false);
        setNp({ ...emptyProduct });
        setMessage({ tone: "ok", text: editingId ? "Product updated." : "Product added." });
        setEditingId(null);
        if (region && systemType) loadSystems(region, systemType);
      } else {
        setMessage({ tone: "err", text: data.error || "Could not save product." });
      }
    } catch {
      setMessage({ tone: "err", text: "Could not save product. Please try again." });
    } finally {
      setAdding(false);
    }
  };

  const hideProduct = async (id: string) => {
    setMessage(null);
    try {
      const res = await fetch("/api/admin/prices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: [{ systemId: id, archived: true }] }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ tone: "ok", text: "Product hidden — see Hidden products." });
        if (region && systemType) loadSystems(region, systemType);
      } else {
        setMessage({ tone: "err", text: data.error || "Could not hide product." });
      }
    } catch {
      setMessage({ tone: "err", text: "Could not hide product." });
    }
  };

  const inputClass =
    "w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition";
  const formInput =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition";

  const tabClass = (which: Tab) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition ${
      tab === which
        ? "bg-[#db231f] text-white"
        : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
    }`;

  const setAvailFor = (id: string, patch: Partial<Avail>) =>
    setAvail((prev) => ({ ...prev, [id]: { ...availOf(id), ...patch } }));

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <div className="glass-card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <RegionSelect value={region} onChange={onSelectRegion} />
          <SystemTypeSelect value={systemType} onChange={onSelectType} />
        </div>

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
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <h2 className="text-lg font-semibold text-[#ff5a2c]">
              {regionName} · {systemType.replace(/_/g, " ")} — {visibleRows.length} product
              {visibleRows.length === 1 ? "" : "s"}
            </h2>
            <button
              type="button"
              onClick={openAdd}
              className="px-3 py-2 rounded-lg text-sm font-semibold border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition"
            >
              + Add new product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1040px]">
              <thead>
                <tr className="border-b border-white/10 text-slate-300">
                  <th className="text-left py-2">Brand</th>
                  <th className="text-left py-2">Model</th>
                  <th className="text-left py-2">Size</th>
                  <th className="text-left py-2">Price ({gstLabel})</th>
                  <th className="text-left py-2">This region</th>
                  <th className="text-left py-2">Global</th>
                  <th className="text-left py-2">Manage</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((r) => {
                  const a = availOf(r.systemId);
                  const hasPrice = (edits[r.systemId] ?? "") !== "" || r.price != null;
                  return (
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
                      <td className="pr-3">
                        {!hasPrice ? (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border border-white/10 bg-white/5 text-slate-400">
                            Not priced
                          </span>
                        ) : (
                          <ToggleChip
                            on={a.regionActive && a.globalActive}
                            disabled={!a.globalActive}
                            onClick={() => setAvailFor(r.systemId, { regionActive: !a.regionActive })}
                          />
                        )}
                      </td>
                      <td className="pr-3">
                        <ToggleChip
                          on={a.globalActive}
                          onClick={() => setAvailFor(r.systemId, { globalActive: !a.globalActive })}
                        />
                      </td>
                      <td className="pr-3">
                        <div className="flex items-center gap-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="text-xs text-sky-300 hover:text-sky-200 underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setMedia({
                                kind: "system",
                                id: r.systemId,
                                name: `${r.brand} ${r.model}`,
                                brochureUrl: r.brochureUrl ?? "",
                                infoText: "",
                              })
                            }
                            className="text-xs text-sky-300 hover:text-sky-200 underline"
                          >
                            {r.brochureUrl ? "📄 Brochure" : "＋ Brochure"}
                          </button>
                          <button
                            type="button"
                            onClick={() => hideProduct(r.systemId)}
                            className="text-xs text-amber-300 hover:text-amber-200 underline"
                          >
                            Hide
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-4 text-slate-400">
                      No products for this selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            <strong>This region</strong> = available in {regionName || "this region"} only.{" "}
            <strong>Global</strong> = the product everywhere; turning Global off hides it in every region.
          </p>

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
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr className="border-b border-white/10 text-slate-300">
                  <th className="text-left py-2">Add-on</th>
                  <th className="text-left py-2">Price ({gstLabel})</th>
                  <th className="text-left py-2">Info / Brochure</th>
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
                    <td className="pr-3">
                      <button
                        type="button"
                        onClick={() =>
                          setMedia({
                            kind: "extra",
                            id: e.extraId,
                            name: e.name,
                            brochureUrl: e.brochureUrl ?? "",
                            infoText: e.infoText ?? "",
                          })
                        }
                        className="text-xs text-sky-300 hover:text-sky-200 underline whitespace-nowrap"
                      >
                        {e.brochureUrl || e.infoText ? "📄 Edit" : "＋ Add"}
                      </button>
                    </td>
                  </tr>
                ))}
                {extraRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-slate-400">
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

      {/* Add new product modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="glass-card w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#ff5a2c]">
              {editingId ? "Edit product" : "Add product"} — {regionName} ·{" "}
              {systemType?.replace(/_/g, " ")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Brand</label>
                <input className={formInput} value={np.brand} onChange={(e) => setNp({ ...np, brand: e.target.value })} placeholder="e.g. Rheem Stellar" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Model</label>
                <input className={formInput} value={np.model} onChange={(e) => setNp({ ...np, model: e.target.value })} placeholder="e.g. Heat Pump 200L Stainless" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Size (litres)</label>
                <input type="number" min={1} className={formInput} value={np.size} onChange={(e) => setNp({ ...np, size: e.target.value })} placeholder="e.g. 200" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tank material</label>
                <select
                  className={`${formInput} appearance-none [&_option]:bg-[#0d1220]`}
                  value={np.tankMaterial}
                  onChange={(e) => setNp({ ...np, tankMaterial: e.target.value })}
                >
                  <option value="mild_steel">Mild Steel</option>
                  <option value="stainless_steel">Stainless Steel</option>
                  <option value="copper">Copper</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Warranty (years)</label>
                <input type="number" min={0} className={formInput} value={np.warrantyPrimary} onChange={(e) => setNp({ ...np, warrantyPrimary: e.target.value })} placeholder="e.g. 7" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">+ extra warranty (optional)</label>
                <input type="number" min={0} className={formInput} value={np.warrantySecondary} onChange={(e) => setNp({ ...np, warrantySecondary: e.target.value })} placeholder="e.g. 5" />
              </div>
              {!editingId && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Price ({gstLabel})</label>
                  <input type="number" min={0} className={formInput} value={np.price} onChange={(e) => setNp({ ...np, price: e.target.value })} placeholder="e.g. 3200" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Brochure (optional)</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const url = await uploadFile(f);
                      if (url) setNp((p) => ({ ...p, brochureUrl: url }));
                    }
                  }}
                  className="text-xs text-slate-300"
                />
                {uploading && <span className="text-xs text-slate-400">Uploading…</span>}
                {np.brochureUrl && <span className="text-xs text-emerald-300">Attached ✓</span>}
              </div>
            </div>
            {!editingId && (
              <p className="text-xs text-slate-400">
                Adds the product to <strong>{regionName}</strong> at this price. It also appears
                (unpriced) in other regions so you can price it there.
              </p>
            )}
            {editingId && (
              <p className="text-xs text-slate-400">
                Editing the product details (brand, model, size, warranty, brochure). Prices are edited
                per region in the table.
              </p>
            )}
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => {
                  setAddOpen(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button onClick={submitProduct} disabled={adding} className="btn-primary">
                {adding ? "Saving…" : editingId ? "Save changes" : "Add product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brochure / info editor (products + add-ons) */}
      {media && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="glass-card w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#ff5a2c]">
              {media.kind === "system" ? "Product brochure" : "Add-on info & brochure"} — {media.name}
            </h3>

            {media.kind === "extra" && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Info (what this add-on is)</label>
                <textarea
                  className={`${formInput} min-h-[80px]`}
                  value={media.infoText}
                  onChange={(e) => setMedia({ ...media, infoText: e.target.value })}
                  placeholder="Short description shown to the customer…"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-400 mb-1">Brochure / image</label>
              {media.brochureUrl && (
                <div className="flex items-center gap-3 mb-2">
                  {isImage(media.brochureUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={media.brochureUrl}
                      alt=""
                      className="max-h-24 rounded border border-white/20 bg-white"
                    />
                  ) : (
                    <a
                      href={media.brochureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-300 underline"
                    >
                      Current file
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setMedia({ ...media, brochureUrl: "" })}
                    className="text-xs text-red-300 underline"
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const url = await uploadFile(f);
                      if (url) setMedia({ ...media, brochureUrl: url });
                    }
                  }}
                  className="text-xs text-slate-300"
                />
                {uploading && <span className="text-xs text-slate-400">Uploading…</span>}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setMedia(null)}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button onClick={saveMedia} disabled={mediaSaving || uploading} className="btn-primary">
                {mediaSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live-price safety confirmation */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="glass-card w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-amber-300">⚠ Update live app?</h3>
            <p className="text-sm text-slate-200">
              You are about to update the{" "}
              {tab === "systems" ? "products/prices" : "add-on prices"} on the{" "}
              <strong>live app</strong>. These changes take effect{" "}
              <strong>immediately</strong> for real customer quotes. Are you sure?
            </p>
            <p className="text-xs text-slate-400">
              {changedCount} change{changedCount === 1 ? "" : "s"} will be applied
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
                Yes, update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
