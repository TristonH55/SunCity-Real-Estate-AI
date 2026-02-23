// "use client";

// import { useEffect, useState } from "react";

// type Region = {
//   code: string;
//   name: string;
// };

// export default function RegionSelect({
//   value,
//   onChange,
// }: {
//   value: string | null;
//   onChange: (val: string) => void;
// }) {
//   const [regions, setRegions] = useState<Region[]>([]);

//   useEffect(() => {
//     fetch("/api/pricing/regions")
//       .then((res) => res.json())
//       .then(setRegions);
//   }, []);

//   return (
//     <div style={{ marginBottom: "1rem" }}>
//       <label>Region</label>
//       <br />
//       <select
//         value={value ?? ""}
//         onChange={(e) => onChange(e.target.value)}
//       >
//         <option value="">Select region</option>
//         {regions.map((r) => (
//           <option key={r.code} value={r.code}>
//             {r.name}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }

/////TEST 2 NICER DESIGN //////
"use client";

type Props = {
  value: string | null;
  onChange: (value: string) => void;
};

export default function RegionSelect({ value, onChange }: Props) {
  return (
    <div className="mb-6 max-w-xs"> {/* 👈 limits width */}
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Region
      </label>

      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/20 transition"
        >
          <option value="" disabled>
            Select your region
          </option>

          <option value="sunshine_coast">Sunshine Coast</option>
          <option value="brisbane_northside">Brisbane Northside</option>
          <option value="brisbane_southside">Brisbane Southside</option>
          <option value="gympie">Gympie</option>
          <option value="gold_coast">Gold Coast</option>
          <option value="wide_bay">Wide Bay</option>
        </select>

        {/* ▼ Arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
          ▼
        </div>
      </div>
    </div>
  );
}


///test
