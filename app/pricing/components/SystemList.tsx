// "use client";

// import { useEffect, useState } from "react";

// type System = {
//   systemId: string;
//   brand: string;
//   model: string;
//   capacityLitres: number;
//   tankMaterial: string;
//   priceExGst: number;
// };

// export default function SystemList({
//   region,
//   systemType,
//   selectedSystemId,
//   onSelect,
// }: {
//   region: string;
//   systemType: string;
//   selectedSystemId: string | null;
//   onSelect: (id: string) => void;
// }) {
//   const [systems, setSystems] = useState<System[]>([]);

//   useEffect(() => {
//     fetch(`/api/pricing/systems?region=${region}&type=${systemType}`)
//       .then((res) => res.json())
//       .then(setSystems);
//   }, [region, systemType]);

//   if (!systems.length) {
//     return <p>No systems found.</p>;
//   }

//   return (
//     <div>
//       <h2 className="text-xl font-semibold mt-6 mb-4">
//         Available Hot Water Systems (ex-GST)
//       </h2>

//       <div className="flex flex-col gap-4">
//         {systems.map((s) => {
//           const isSelected = selectedSystemId === s.systemId;

//           return (
//             <div
//               key={s.systemId}
//               onClick={() => onSelect(s.systemId)}
//               className={`relative p-4 rounded-lg cursor-pointer transition border
//                 ${
//                   isSelected
//                     ? "border-2 border-[#db231f] bg-red-50"
//                     : "border-gray-300 bg-white hover:border-gray-400"
//                 }
//               `}
//             >
//               {/* ✅ Selected badge */}
//               {isSelected && (
//                 <div className="absolute top-3 right-3 flex items-center gap-2 text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
//                   <span className="h-2 w-2 bg-green-600 rounded-full"></span>
//                   Selected
//                 </div>
//               )}

//               <div className="font-semibold text-lg">{s.brand}</div>

//               <div className="mt-1 text-gray-700">{s.model}</div>

//               <div className="text-sm text-gray-600 mt-1">
//                 {s.capacityLitres}L • {s.tankMaterial.replace("_", " ")}
//               </div>

//               <div className="mt-2 font-semibold text-gray-900">
//                 ${s.priceExGst.toLocaleString()} ex-GST
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
// // ///////////////////test 1 below /////////////
// "use client";

// import { useEffect, useState } from "react";

// type System = {
//   systemId: string;
//   brand: string;
//   model: string;
//   capacityLitres: number;
//   tankMaterial: string;
//   priceExGst: number;
// };

// export default function SystemList({
//   region,
//   systemType,
//   selectedSystemId,
//   onSelect,
// }: {
//   region: string;
//   systemType: string;
//   selectedSystemId: string | null;
//   onSelect: (id: string) => void;
// }) {
//   const [systems, setSystems] = useState<System[]>([]);

//   useEffect(() => {
//     fetch(`/api/pricing/systems?region=${region}&type=${systemType}`)
//       .then((res) => res.json())
//       .then(setSystems);
//   }, [region, systemType]);

//   if (!systems.length) {
//     return <p>No systems found.</p>;
//   }

//   // ✅ SOLAR SPLITTING — NO systemType FIELD REQUIRED
//   const thermosiphonSystems = systems.filter((s) =>
//     /(TS |THX |Hi-Line|Prestige|L Series|J Series|MK11)/i.test(s.model)
//   );

//   const splitSolarSystems = systems.filter((s) =>
//     /(AS |Lo-Line|Ecosmart)/i.test(s.model)
//   );

//   const renderCard = (s: System) => {
//     const isSelected = selectedSystemId === s.systemId;

//     return (
//       <div
//         key={s.systemId}
//         onClick={() => onSelect(s.systemId)}
//         className={`relative p-4 rounded-lg cursor-pointer transition border
//           ${
//             isSelected
//               ? "border-2 border-[#db231f] bg-red-50"
//               : "border-gray-300 bg-white hover:border-gray-400"
//           }
//         `}
//       >
//         {isSelected && (
//           <div className="absolute top-3 right-3 flex items-center gap-2 text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
//             <span className="h-2 w-2 bg-green-600 rounded-full"></span>
//             Selected
//           </div>
//         )}

//         <div className="font-semibold text-lg">{s.brand}</div>
//         <div className="mt-1 text-gray-700">{s.model}</div>

//         <div className="text-sm text-gray-600 mt-1">
//           {s.capacityLitres}L • {s.tankMaterial.replace("_", " ")}
//         </div>

//         <div className="mt-2 font-semibold text-gray-900">
//           ${s.priceExGst.toLocaleString()} ex-GST
//         </div>
//       </div>
//     );
//   };

//   // 🌞 SOLAR — GROUPED VISUALLY
//   if (systemType === "solar") {
//     return (
//       <div>
//         <h2 className="text-xl font-semibold mt-6 mb-4">
//           Available Hot Water Systems (ex-GST)
//         </h2>

//         {thermosiphonSystems.length > 0 && (
//           <section className="mb-10">
//             <h3 className="text-lg font-bold mb-3 border-b pb-2">
//               Thermosiphon Solar Systems
//             </h3>
//             <div className="flex flex-col gap-4">
//               {thermosiphonSystems.map(renderCard)}
//             </div>
//           </section>
//         )}

//         {splitSolarSystems.length > 0 && (
//           <section>
//             <h3 className="text-lg font-bold mb-3 border-b pb-2">
//               Split Solar Systems
//             </h3>
//             <div className="flex flex-col gap-4">
//               {splitSolarSystems.map(renderCard)}
//             </div>
//           </section>
//         )}
//       </div>
//     );
//   }

//   // ⚡ ELECTRIC / 🔥 HEAT PUMP — UNCHANGED
//   return (
//     <div>
//       <h2 className="text-xl font-semibold mt-6 mb-4">
//         Available Hot Water Systems (ex-GST)
//       </h2>

//       <div className="flex flex-col gap-4">
//         {systems.map(renderCard)}
//       </div>
//     </div>
//   );
// }

//////////////////USE THIS IS OK/////
////////// Test 3 WORKS AND LOOKS GOOD!/////////////////
// "use client";

// import { useEffect, useState } from "react";

// type System = {
//   systemId: string;
//   brand: string;
//   model: string;
//   capacityLitres: number;
//   tankMaterial: string;
//   priceExGst: number;
// };

// export default function SystemList({
//   region,
//   systemType,
//   selectedSystemId,
//   onSelect,
// }: {
//   region: string;
//   systemType: string;
//   selectedSystemId: string | null;
//   onSelect: (id: string) => void;
// }) {
//   const [systems, setSystems] = useState<System[]>([]);

//   useEffect(() => {
//     fetch(`/api/pricing/systems?region=${region}&type=${systemType}`)
//       .then((res) => res.json())
//       .then(setSystems);
//   }, [region, systemType]);

//   if (!systems.length) {
//     return <p>No systems found.</p>;
//   }

//   // 🌞 SOLAR SPLITTING (MODEL-BASED, SAFE)
//   const thermosiphonSystems = systems.filter((s) =>
//     /(TS |THX |Hi-Line|Prestige|L Series|J Series|MK11)/i.test(s.model)
//   );

//   const splitSolarSystems = systems.filter((s) =>
//     /(AS |Lo-Line|Ecosmart)/i.test(s.model)
//   );

//   const renderCard = (s: System) => {
//     const isSelected = selectedSystemId === s.systemId;

//     return (
//       <div
//         key={s.systemId}
//         onClick={() => onSelect(s.systemId)}
//         className={`relative p-4 rounded-lg cursor-pointer transition border
//           ${
//             isSelected
//               ? "border-2 border-[#db231f] bg-red-50"
//               : "border-gray-300 bg-white hover:border-gray-400"
//           }
//         `}
//       >
//         {isSelected && (
//           <div className="absolute top-3 right-3 flex items-center gap-2 text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
//             <span className="h-2 w-2 bg-green-600 rounded-full"></span>
//             Selected
//           </div>
//         )}

//         <div className="font-semibold text-lg">{s.brand}</div>
//         <div className="mt-1 text-gray-700">{s.model}</div>

//         <div className="text-sm text-gray-600 mt-1">
//           {s.capacityLitres}L • {s.tankMaterial.replace("_", " ")}
//         </div>

//         <div className="mt-2 font-semibold text-gray-900">
//           ${s.priceExGst.toLocaleString()} ex-GST
//         </div>
//       </div>
//     );
//   };

//   // 🌞 SOLAR — STYLED GROUPING
//   if (systemType === "solar") {
//     return (
//       <div>
//         <h2 className="text-xl font-semibold mt-6 mb-6">
//           Available Hot Water Systems (ex-GST)
//         </h2>

//         {/* 🌞 THERMOSIPHON */}
//         {thermosiphonSystems.length > 0 && (
//           <section className="mb-12">
//             <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
//               <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
//                 ☀️ Thermosiphon Solar Systems
//               </h3>
//               <p className="text-sm text-amber-800 mt-1">
//                 Roof-mounted tank with natural heat circulation. Simple, reliable,
//                 and cost-effective.
//               </p>
//             </div>

//             <div className="flex flex-col gap-4">
//               {thermosiphonSystems.map(renderCard)}
//             </div>
//           </section>
//         )}

//         {/* 🔄 SPLIT SOLAR */}
//         {splitSolarSystems.length > 0 && (
//           <section>
//             <div className="mb-5 rounded-xl bg-sky-50 border border-sky-200 px-5 py-4">
//               <h3 className="text-lg font-bold text-sky-900 flex items-center gap-2">
//                 🔄 Split Solar Systems
//               </h3>
//               <p className="text-sm text-sky-800 mt-1">
//                 Ground-mounted tank with roof collectors. Greater flexibility for
//                 modern homes.
//               </p>
//             </div>

//             <div className="flex flex-col gap-4">
//               {splitSolarSystems.map(renderCard)}
//             </div>
//           </section>
//         )}
//       </div>
//     );
//   }

//   // ⚡ ELECTRIC / 🔥 HEAT PUMP (UNCHANGED)
//   return (
//     <div>
//       <h2 className="text-xl font-semibold mt-6 mb-4">
//         Available Hot Water Systems (ex-GST)
//       </h2>

//       <div className="flex flex-col gap-4">
//         {systems.map(renderCard)}
//       </div>
//     </div>
//   );
// }
//////////TEST 5 ?ok good///////////
// "use client";

// import { useEffect, useState } from "react";

// type System = {
//   systemId: string;
//   brand: string;
//   model: string;
//   capacityLitres: number;
//   tankMaterial: string;
//   priceExGst: number;
// };

// export default function SystemList({
//   region,
//   systemType,
//   selectedSystemId,
//   onSelect,
// }: {
//   region: string;
//   systemType: string;
//   selectedSystemId: string | null;
//   onSelect: (id: string) => void;
// }) {
//   const [systems, setSystems] = useState<System[]>([]);

//   useEffect(() => {
//     fetch(`/api/pricing/systems?region=${region}&type=${systemType}`)
//       .then((res) => res.json())
//       .then((data: System[]) => {
//         // ✅ SORT: Brand → Price (low→high) → Capacity (small→large)
//         const sorted = [...data].sort((a, b) => {
//           // 1️⃣ Brand
//           const brandCompare = a.brand.localeCompare(b.brand);
//           if (brandCompare !== 0) return brandCompare;

//           // 2️⃣ Price
//           if (a.priceExGst !== b.priceExGst) {
//             return a.priceExGst - b.priceExGst;
//           }

//           // 3️⃣ Tank size
//           return a.capacityLitres - b.capacityLitres;
//         });

//         setSystems(sorted);
//       });
//   }, [region, systemType]);

//   if (!systems.length) {
//     return <p>No systems found.</p>;
//   }

//   // 🌞 SOLAR SPLITTING (MODEL-BASED, SAFE)
//   const thermosiphonSystems = systems.filter((s) =>
//     /(TS |THX |Hi-Line|Prestige|L Series|J Series|MK11)/i.test(s.model)
//   );

//   const splitSolarSystems = systems.filter((s) =>
//     /(AS |Lo-Line|Ecosmart)/i.test(s.model)
//   );

//   const renderCard = (s: System) => {
//     const isSelected = selectedSystemId === s.systemId;

//     return (
//       <div
//         key={s.systemId}
//         onClick={() => onSelect(s.systemId)}
//         className={`relative p-4 rounded-lg cursor-pointer transition border
//           ${
//             isSelected
//               ? "border-2 border-[#db231f] bg-red-50"
//               : "border-gray-300 bg-white hover:border-gray-400"
//           }
//         `}
//       >
//         {isSelected && (
//           <div className="absolute top-3 right-3 flex items-center gap-2 text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
//             <span className="h-2 w-2 bg-green-600 rounded-full"></span>
//             Selected
//           </div>
//         )}

//         <div className="font-semibold text-lg">{s.brand}</div>
//         <div className="mt-1 text-gray-700">{s.model}</div>

//         <div className="text-sm text-gray-600 mt-1">
//           {s.capacityLitres}L • {s.tankMaterial.replace("_", " ")}
//         </div>

//         <div className="mt-2 font-semibold text-gray-900">
//           ${s.priceExGst.toLocaleString()} ex-GST
//         </div>
//       </div>
//     );
//   };

//   // 🌞 SOLAR — STYLED GROUPING (UNCHANGED UI)
//   if (systemType === "solar") {
//     return (
//       <div>
//         <h2 className="text-xl font-semibold mt-6 mb-6">
//           Available Hot Water Systems (ex-GST)
//         </h2>

//         {/* ☀️ THERMOSIPHON */}
//         {thermosiphonSystems.length > 0 && (
//           <section className="mb-12">
//             <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
//               <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
//                 ☀️ Thermosiphon Solar Systems
//               </h3>
//               <p className="text-sm text-amber-800 mt-1">
//                 Roof-mounted tank with natural heat circulation. Simple,
//                 reliable, and cost-effective.
//               </p>
//             </div>

//             <div className="flex flex-col gap-4">
//               {thermosiphonSystems.map(renderCard)}
//             </div>
//           </section>
//         )}

//         {/* 🔄 SPLIT SOLAR */}
//         {splitSolarSystems.length > 0 && (
//           <section>
//             <div className="mb-5 rounded-xl bg-sky-50 border border-sky-200 px-5 py-4">
//               <h3 className="text-lg font-bold text-sky-900 flex items-center gap-2">
//                 🔄 Split Solar Systems
//               </h3>
//               <p className="text-sm text-sky-800 mt-1">
//                 Ground-mounted tank with roof collectors. Greater flexibility
//                 for modern homes.
//               </p>
//             </div>

//             <div className="flex flex-col gap-4">
//               {splitSolarSystems.map(renderCard)}
//             </div>
//           </section>
//         )}
//       </div>
//     );
//   }

//   // ⚡ ELECTRIC / 🔥 HEAT PUMP — SAME UI, BETTER ORDER
//   return (
//     <div>
//       <h2 className="text-xl font-semibold mt-6 mb-4">
//         Available Hot Water Systems (ex-GST)
//       </h2>

//       <div className="flex flex-col gap-4">
//         {systems.map(renderCard)}
//       </div>
//     </div>
//   );
// }
//////////////// TEST 6 COLOR CODED USE THIS IT WORKS GOOD!//////////
"use client";

import { useEffect, useState } from "react";

type System = {
  systemId: string;
  brand: string;
  model: string;
  capacityLitres: number;
  tankMaterial: string;
  priceExGst: number;
};

// 🎨 Brand styling map
const BRAND_STYLES: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  Rheem: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-900",
  },
  Dux: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-900",
  },
  "AquaMAX / Vulcan": {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
  },
  Solahart: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-900",
  },
  Envirosun: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-900",
  },
  Rinnai: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-900",
  },
};

export default function SystemList({
  region,
  systemType,
  selectedSystemId,
  onSelect,
}: {
  region: string;
  systemType: string;
  selectedSystemId: string | null;
  onSelect: (id: string) => void;
}) {
  const [systems, setSystems] = useState<System[]>([]);

  useEffect(() => {
    fetch(`/api/pricing/systems?region=${region}&type=${systemType}`)
      .then((res) => res.json())
      .then((data: System[]) => {
        // ✅ Sort: Brand → Price → Capacity
        const sorted = [...data].sort((a, b) => {
          const brandCompare = a.brand.localeCompare(b.brand);
          if (brandCompare !== 0) return brandCompare;

          if (a.priceExGst !== b.priceExGst) {
            return a.priceExGst - b.priceExGst;
          }

          return a.capacityLitres - b.capacityLitres;
        });

        setSystems(sorted);
      });
  }, [region, systemType]);

  if (!systems.length) {
    return <p>No systems found.</p>;
  }

  // 🌞 Solar split (model-based)
  const thermosiphonSystems = systems.filter((s) =>
    /(TS |THX |Hi-Line|Prestige|L Series|J Series|MK11)/i.test(s.model)
  );

  const splitSolarSystems = systems.filter((s) =>
    /(AS |Lo-Line|Ecosmart)/i.test(s.model)
  );

  // 🔁 Group by brand (for visual sections)
  const groupByBrand = (items: System[]) =>
    items.reduce<Record<string, System[]>>((acc, system) => {
      acc[system.brand] = acc[system.brand] || [];
      acc[system.brand].push(system);
      return acc;
    }, {});

  const renderCard = (s: System) => {
    const isSelected = selectedSystemId === s.systemId;

    return (
      <div
        key={s.systemId}
        onClick={() => onSelect(s.systemId)}
        className={`relative p-4 rounded-lg cursor-pointer transition border
          ${
            isSelected
              ? "border-2 border-[#db231f] bg-red-50"
              : "border-gray-300 bg-white hover:border-gray-400"
          }
        `}
      >
        {isSelected && (
          <div className="absolute top-3 right-3 flex items-center gap-2 text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
            <span className="h-2 w-2 bg-green-600 rounded-full"></span>
            Selected
          </div>
        )}

        <div className="font-semibold text-lg">{s.brand}</div>
        <div className="mt-1 text-gray-700">{s.model}</div>

        <div className="text-sm text-gray-600 mt-1">
          {s.capacityLitres}L • {s.tankMaterial.replace("_", " ")}
        </div>

        <div className="mt-2 font-semibold text-gray-900">
          ${s.priceExGst.toLocaleString()} ex-GST
        </div>
      </div>
    );
  };

  const renderBrandSections = (items: System[]) => {
    const grouped = groupByBrand(items);

    return Object.entries(grouped).map(([brand, brandSystems]) => {
      const style = BRAND_STYLES[brand] ?? {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-900",
      };

      return (
        <section
          key={brand}
          className={`mb-10 rounded-xl border ${style.border} ${style.bg} p-5`}
        >
          <h4 className={`text-lg font-bold mb-4 ${style.text}`}>
            {brand}
          </h4>

          <div className="flex flex-col gap-4">
            {brandSystems.map(renderCard)}
          </div>
        </section>
      );
    });
  };

  // 🌞 SOLAR VIEW
  if (systemType === "solar") {
    return (
      <div>
        <h2 className="text-xl font-semibold mt-6 mb-6">
          Available Hot Water Systems (ex-GST)
        </h2>

        {thermosiphonSystems.length > 0 && (
          <section className="mb-14">
            <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
              <h3 className="text-lg font-bold text-amber-900">
                ☀️ Thermosiphon Solar Systems
              </h3>
              <p className="text-sm text-amber-800 mt-1">
                Roof-mounted tank with natural heat circulation.
              </p>
            </div>

            {renderBrandSections(thermosiphonSystems)}
          </section>
        )}

        {splitSolarSystems.length > 0 && (
          <section>
            <div className="mb-5 rounded-xl bg-sky-50 border border-sky-200 px-5 py-4">
              <h3 className="text-lg font-bold text-sky-900">
                🔄 Split Solar Systems
              </h3>
              <p className="text-sm text-sky-800 mt-1">
                Ground-mounted tank with roof collectors.
              </p>
            </div>

            {renderBrandSections(splitSolarSystems)}
          </section>
        )}
      </div>
    );
  }

  // ⚡ ELECTRIC / 🔥 HEAT PUMP
  return (
    <div>
      <h2 className="text-xl font-semibold mt-6 mb-6">
        Available Hot Water Systems (ex-GST)
      </h2>

      {renderBrandSections(systems)}
    </div>
  );
}

/////////////////// TEST 7 //////////
// "use client";

// import { useEffect, useState } from "react";

// type System = {
//   systemId: string;
//   brand: string;
//   model: string;
//   capacityLitres: number;
//   tankMaterial: string;
//   priceExGst: number;
// };

// export default function SystemList({
//   region,
//   systemType,
//   selectedSystemId,
//   onSelect,
// }: {
//   region: string;
//   systemType: string;
//   selectedSystemId: string | null;
//   onSelect: (id: string) => void;
// }) {
//   const [systems, setSystems] = useState<System[]>([]);

//   useEffect(() => {
//     fetch(`/api/pricing/systems?region=${region}&type=${systemType}`)
//       .then((res) => res.json())
//       .then((data: System[]) => setSystems(data));
//   }, [region, systemType]);

//   if (!systems.length) {
//     return <p>No systems found.</p>;
//   }

//   return (
//     <div>
//       <h2 className="text-xl font-semibold mt-6 mb-4">
//         Available Hot Water Systems (ex-GST)
//       </h2>

//       <div className="flex flex-col gap-4">
//         {systems.map((s) => {
//           const isSelected = selectedSystemId === s.systemId;

//           return (
//             <div
//               key={s.systemId}
//               onClick={() => onSelect(s.systemId)}
//               className={`p-4 rounded-lg cursor-pointer border transition
//                 ${
//                   isSelected
//                     ? "border-2 border-[#db231f] bg-red-50"
//                     : "border-gray-300 bg-white hover:border-gray-400"
//                 }`}
//             >
//               <div className="font-semibold text-lg">{s.brand}</div>
//               <div className="text-gray-700">{s.model}</div>
//               <div className="text-sm text-gray-600">
//                 {s.capacityLitres}L • {s.tankMaterial.replace("_", " ")}
//               </div>
//               <div className="mt-2 font-semibold">
//                 ${s.priceExGst.toLocaleString()} ex-GST
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }