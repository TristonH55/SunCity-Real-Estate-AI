// "use client";

// const OPTIONS = [
//   { value: "electric", label: "Electric" },
//   { value: "heat_pump", label: "Heat Pump" },
//   { value: "solar", label: "Solar" },
// ];

// export default function SystemTypeSelect({
//   value,
//   onChange,
// }: {
//   value: string | null;
//   onChange: (val: string) => void;
// }) {
//   return (
//     <div style={{ marginBottom: "1rem" }}>
//       <label>System Type</label>
//       <br />
//       <select
//         value={value ?? ""}
//         onChange={(e) => onChange(e.target.value)}
//       >
//         <option value="">Select system type</option>
//         {OPTIONS.map((opt) => (
//           <option key={opt.value} value={opt.value}>
//             {opt.label}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }
//////////////WORKING CORRECT TO USE /////////
// "use client";

// export default function SystemTypeSelect({
//   value,
//   onChange,
// }: {
//   value: string | null;
//   onChange: (val: string) => void;
// }) {
//   const types = [
//     { value: "electric", label: "Electric" },
//     { value: "heat_pump", label: "Heat Pump" },
//     { value: "solar_thermosiphon", label: "Thermosiphon Solar" },
//     { value: "solar_split", label: "Split Solar" },
//   ];

//   return (
//     <div className="mb-6">
//       <label className="block font-medium mb-2">System Type</label>

//       <select
//         value={value ?? ""}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full border rounded px-3 py-2"
//       >
//         <option value="">Select system type</option>
//         {types.map((t) => (
//           <option key={t.value} value={t.value}>
//             {t.label}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }

///////TEST
"use client";

export default function SystemTypeSelect({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (val: string) => void;
}) {
  const types = [
    { value: "electric", label: "Electric" },
    { value: "heat_pump", label: "Heat Pump" },
    { value: "solar_thermosiphon", label: "Thermosiphon Solar" },
    { value: "solar_split", label: "Split Solar" },
  ];

  return (
    <div className="mb-6 max-w-xs"> {/* 👈 SAME WIDTH AS REGION */}
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        System Type
      </label>

      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/20 transition"
        >
          <option value="" disabled>
            Select system type
          </option>

          {types.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* ▼ Arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
          ▼
        </div>
      </div>
    </div>
  );
}