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
        className={`px-4 py-2 rounded font-semibold ${
          value === "yes"
            ? "bg-green-600 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        YES
      </button>

      <button
        type="button"
        onClick={() => onChange("no")}
        className={`px-4 py-2 rounded font-semibold ${
          value === "no"
            ? "bg-red-600 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        NO
      </button>
    </div>
  );
}