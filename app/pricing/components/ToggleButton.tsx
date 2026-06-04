"use client";

type Props = {
  value: "yes" | "no" | null;
  onChange: (v: "yes" | "no") => void;
};

export default function ToggleButton({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 mt-2">
      <button
        type="button"
        onClick={() => onChange("yes")}
        className={`px-4 py-2 rounded-lg font-semibold border transition ${
          value === "yes"
            ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.4)]"
            : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
        }`}
      >
        YES
      </button>

      <button
        type="button"
        onClick={() => onChange("no")}
        className={`px-4 py-2 rounded-lg font-semibold border transition ${
          value === "no"
            ? "bg-[#db231f] text-white border-[#ff5a2c] shadow-[0_0_18px_rgba(219,35,31,0.4)]"
            : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
        }`}
      >
        NO
      </button>
    </div>
  );
}