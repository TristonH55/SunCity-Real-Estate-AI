// "use client";

// import { useEffect, useState } from "react";

// type Extra = {
//   extraId: string;
//   name: string;
//   priceExGst: number;
//   included: boolean;
// };

// export default function ExtrasList({
//   region,
//   systemType,
//   selectedExtras,
//   onChange,
// }: {
//   region: string;
//   systemType: string;
//   selectedExtras: string[];
//   onChange: (extras: string[]) => void;
// }) {
//   const [extras, setExtras] = useState<Extra[]>([]);

//   useEffect(() => {
//     fetch(`/api/pricing/extras?region=${region}&type=${systemType}`)
//       .then(res => res.json())
//       .then(setExtras);
//   }, [region, systemType]);

//   function toggleExtra(id: string) {
//     if (selectedExtras.includes(id)) {
//       onChange(selectedExtras.filter(e => e !== id));
//     } else {
//       onChange([...selectedExtras, id]);
//     }
//   }

//   if (!extras.length) return null;

//   return (
//     <div className="mt-8">
//       <h2 className="text-xl font-semibold mb-4">Extras</h2>

//       <div className="space-y-3">
//         {extras.map(extra => {
//           const checked =
//             extra.included || selectedExtras.includes(extra.extraId);

//           return (
//             <label
//               key={extra.extraId}
//               className="flex items-center justify-between p-3 border rounded-lg bg-white cursor-pointer"
//             >
//               <div className="flex items-center gap-3">
//                 <input
//                   type="checkbox"
//                   checked={checked}
//                   disabled={extra.included}
//                   onChange={() => toggleExtra(extra.extraId)}
//                 />
//                 <span>{extra.name}</span>
//               </div>

//               <span className="font-medium">
//                 {extra.included
//                   ? "Included"
//                   : `$${extra.priceExGst.toLocaleString()} ex-GST`}
//               </span>
//             </label>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

////////// VERSION 2 ////////
"use client";

import { useEffect, useState } from "react";

type Extra = {
  extraId: string;
  name: string;
  priceExGst: number;
  included: boolean;
};

export default function ExtrasList({
  region,
  systemType,
  selectedExtras,
  onChange,
}: {
  region: string;
  systemType: string;
  selectedExtras: string[];
  onChange: (extras: string[]) => void;
}) {
  const [extras, setExtras] = useState<Extra[]>([]);

  useEffect(() => {
    if (!region || !systemType) return;

    fetch(
      `/api/pricing/extras?region=${region}&type=${systemType}`
    )
      .then((res) => res.json())
      .then(setExtras);
  }, [region, systemType]);

  if (!extras.length) return null;

  const includedExtras = extras.filter((e) => e.included);
  const optionalExtras = extras.filter((e) => !e.included);

  const toggleExtra = (id: string) => {
    if (selectedExtras.includes(id)) {
      onChange(selectedExtras.filter((x) => x !== id));
    } else {
      onChange([...selectedExtras, id]);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Extras</h2>

      {/* INCLUDED */}
      {includedExtras.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-green-700 mb-2">
            Included (no charge)
          </h3>

          <div className="space-y-2">
            {includedExtras.map((e) => (
              <div
                key={e.extraId}
                className="flex items-center justify-between p-3 rounded border bg-green-50 text-green-800"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="accent-green-600"
                  />
                  <span>{e.name}</span>
                </div>

                <span className="text-sm font-medium">Included</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OPTIONAL */}
      {optionalExtras.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-800 mb-2">
            Optional extras
          </h3>

          <div className="space-y-2">
            {optionalExtras.map((e) => (
              <label
                key={e.extraId}
                className="flex items-center justify-between p-3 rounded border cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedExtras.includes(e.extraId)}
                    onChange={() => toggleExtra(e.extraId)}
                    className="accent-[#db231f]"
                  />
                  <span>{e.name}</span>
                </div>

                <span className="text-sm font-medium">
                  ${e.priceExGst.toLocaleString()} ex-GST
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


////////VERSION 3 TEST //////////

