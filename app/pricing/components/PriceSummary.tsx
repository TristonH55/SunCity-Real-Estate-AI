// "use client";

// import { useEffect, useState } from "react";



// type PriceResponse = {
//   systemPriceExGst: number;
//   extrasTotalExGst: number;
//   subtotalExGst: number;
//   gst: number;
//   totalIncGst: number;
// };

// export default function PriceSummary({
//   region,
//   systemId,
//   extraIds,
// }: {
//   region: string;
//   systemId: string;
//   extraIds: string[];
// }) {
//   const [price, setPrice] = useState<PriceResponse | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [confirming, setConfirming] = useState(false);
//   const [confirmationId, setConfirmationId] = useState<string | null>(null);

//   useEffect(() => {
//     if (!region || !systemId) return;

//     setLoading(true);
//     setConfirmationId(null); // reset if inputs change

//     fetch("/api/pricing/calculate", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         regionCode: region,
//         systemId,
//         extraIds,
//       }),
//     })
//       .then((res) => res.json())
//       .then((data) => setPrice(data))
//       .finally(() => setLoading(false));
//   }, [region, systemId, extraIds]);

//   const handleConfirm = async () => {
//     if (!region || !systemId) return;

//     setConfirming(true);

//     const res = await fetch("/api/pricing/confirm", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         regionCode: region,
//         systemId,
//         extraIds,
//       }),
//     });

//     const data = await res.json();

//     if (data.confirmationId) {
//       setConfirmationId(data.confirmationId);
//     }

//     setConfirming(false);
//   };

//   if (!systemId) return null;
//   if (loading) return <p className="mt-6 text-gray-500">Calculating price…</p>;
//   if (!price) return null;

//   const money = (value: number) =>
//     value.toLocaleString("en-AU", { minimumFractionDigits: 0 });

//   return (
//     <div className="mt-8 border rounded-lg p-6 bg-gray-50">
//       <h2 className="text-xl font-semibold mb-4">Price Summary</h2>

//       <div className="space-y-2 text-sm">
//         <div className="flex justify-between">
//           <span>System price (ex-GST)</span>
//           <span>${money(price.systemPriceExGst)}</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Extras total (ex-GST)</span>
//           <span>${money(price.extrasTotalExGst)}</span>
//         </div>

//         <div className="flex justify-between font-medium">
//           <span>Subtotal (ex-GST)</span>
//           <span>${money(price.subtotalExGst)}</span>
//         </div>

//         <div className="flex justify-between text-gray-600">
//           <span>GST (10%)</span>
//           <span>${money(price.gst)}</span>
//         </div>

//         <div className="flex justify-between text-lg font-bold border-t pt-3">
//           <span>Total (inc-GST)</span>
//           <span>${money(price.totalIncGst)}</span>
//         </div>
//       </div>

//       {/* CONFIRM ACTION */}
//       {!confirmationId && (
//         <button
//           onClick={handleConfirm}
//           disabled={confirming}
//           className="mt-6 w-full bg-[#db231f] text-white py-3 rounded-lg font-semibold hover:bg-[#b91c1c] transition disabled:opacity-50"
//         >
//           {confirming ? "Locking price…" : "Confirm & Lock Price"}
//         </button>
//       )}

//       {/* CONFIRMED STATE */}
//       {confirmationId && (
//         <div className="mt-6 p-4 rounded-lg bg-green-50 text-green-800 border border-green-200">
//           <p className="font-medium">Price locked successfully</p>
//           <p className="text-sm mt-1">
//             Confirmation ID:{" "}
//             <span className="font-mono">{confirmationId}</span>
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }
////////////UPDATED use 1////

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// type PriceResponse = {
//   systemPriceExGst: number;
//   extrasTotalExGst: number;
//   subtotalExGst: number;
//   gst: number;
//   totalIncGst: number;
// };

// export default function PriceSummary({
//   region,
//   systemId,
//   extraIds,
// }: {
//   region: string;
//   systemId: string;
//   extraIds: string[];
// }) {
//   const router = useRouter();

//   const [price, setPrice] = useState<PriceResponse | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [confirming, setConfirming] = useState(false);

//   useEffect(() => {
//     if (!region || !systemId) return;

//     setLoading(true);

//     fetch("/api/pricing/calculate", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         regionCode: region,
//         systemId,
//         extraIds,
//       }),
//     })
//       .then((res) => res.json())
//       .then((data) => setPrice(data))
//       .finally(() => setLoading(false));
//   }, [region, systemId, extraIds]);

//   const handleConfirm = async () => {
//     if (!region || !systemId) return;

//     setConfirming(true);

//     const res = await fetch("/api/pricing/confirm", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         regionCode: region,
//         systemId,
//         extraIds,
//       }),
//     });

//     const data = await res.json();

//     if (data.confirmationId) {
//       router.push(`/pricing/confirmation/${data.confirmationId}`);
//     }

//     setConfirming(false);
//   };

//   if (!systemId) return null;
//   if (loading) return <p className="mt-6 text-gray-500">Calculating price…</p>;
//   if (!price) return null;

//   const money = (value: number) =>
//     value.toLocaleString("en-AU", { minimumFractionDigits: 0 });

//   return (
//     <div className="mt-8 border rounded-lg p-6 bg-gray-50">
//       <h2 className="text-xl font-semibold mb-4">Price Summary</h2>

//       <div className="space-y-2 text-sm">
//         <div className="flex justify-between">
//           <span>System price (ex-GST)</span>
//           <span>${money(price.systemPriceExGst)}</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Extras total (ex-GST)</span>
//           <span>${money(price.extrasTotalExGst)}</span>
//         </div>

//         <div className="flex justify-between font-medium">
//           <span>Subtotal (ex-GST)</span>
//           <span>${money(price.subtotalExGst)}</span>
//         </div>

//         <div className="flex justify-between text-gray-600">
//           <span>GST (10%)</span>
//           <span>${money(price.gst)}</span>
//         </div>

//         <div className="flex justify-between text-lg font-bold border-t pt-3">
//           <span>Total (inc-GST)</span>
//           <span>${money(price.totalIncGst)}</span>
//         </div>
//       </div>

//       <button
//         onClick={handleConfirm}
//         disabled={confirming}
//         className="mt-6 w-full bg-[#db231f] text-white py-3 rounded-lg font-semibold hover:bg-[#b91c1c] transition disabled:opacity-50"
//       >
//         {confirming ? "Locking price…" : "Confirm & Lock Price"}
//       </button>
//     </div>
//   );
// }

////////////this is a test use 1 above////
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PriceResponse = {
  systemPriceExGst: number;
  extrasTotalExGst: number;
  subtotalExGst: number;
  gst: number;
  totalIncGst: number;
};

type SystemInfo = {
  brand: string;
  model: string;
  capacityLitres: number;
  tankMaterial: string;
};

export default function PriceSummary({
  region,
  systemId,
  extraIds,
}: {
  region: string;
  systemId: string;
  extraIds: string[];
}) {
  const router = useRouter();

  const [price, setPrice] = useState<PriceResponse | null>(null);
  const [system, setSystem] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // 🔹 Fetch system details
  useEffect(() => {
    if (!systemId) return;

    fetch(`/api/pricing/system?systemId=${systemId}`)
      .then((res) => res.json())
      .then(setSystem);
  }, [systemId]);

  // 🔹 Fetch pricing
  useEffect(() => {
    if (!region || !systemId) return;

    setLoading(true);

    fetch("/api/pricing/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        regionCode: region,
        systemId,
        extraIds,
      }),
    })
      .then((res) => res.json())
      .then(setPrice)
      .finally(() => setLoading(false));
  }, [region, systemId, extraIds]);

  const handleConfirm = async () => {
    setConfirming(true);

    const res = await fetch("/api/pricing/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        regionCode: region,
        systemId,
        extraIds,
      }),
    });

    const data = await res.json();

    if (data.confirmationId) {
      router.push(`/pricing/confirmation/${data.confirmationId}`);
    }

    setConfirming(false);
  };

  if (!systemId) return null;
  if (loading) return <p className="mt-6 text-gray-500">Calculating price…</p>;
  if (!price) return null;

  const money = (v: number) =>
    v.toLocaleString("en-AU", { minimumFractionDigits: 0 });

  return (
    <div className="mt-8 border rounded-lg p-6 bg-gray-50 space-y-6">

      {/* ✅ SELECTED SYSTEM */}
      {system && (
        <div className="rounded-lg border bg-white p-4">
          <h3 className="font-semibold text-gray-900 mb-1">
            Selected System
          </h3>
          <div className="text-sm text-gray-700">
            <div className="font-medium">{system.brand}</div>
            <div>{system.model}</div>
            <div className="text-gray-600">
              {system.capacityLitres}L •{" "}
              {system.tankMaterial.replace("_", " ")}
            </div>
          </div>
        </div>
      )}

      {/* 💰 PRICE */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Price Summary</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>System price (ex-GST)</span>
            <span>${money(price.systemPriceExGst)}</span>
          </div>

          <div className="flex justify-between">
            <span>Extras total (ex-GST)</span>
            <span>${money(price.extrasTotalExGst)}</span>
          </div>

          <div className="flex justify-between font-medium">
            <span>Subtotal (ex-GST)</span>
            <span>${money(price.subtotalExGst)}</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>GST (10%)</span>
            <span>${money(price.gst)}</span>
          </div>

          <div className="flex justify-between text-lg font-bold border-t pt-3">
            <span>Total (inc-GST)</span>
            <span>${money(price.totalIncGst)}</span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={confirming}
          className="mt-6 w-full bg-[#db231f] text-white py-3 rounded-lg font-semibold hover:bg-[#b91c1c] transition disabled:opacity-50"
        >
          {confirming ? "Locking price…" : "Confirm & Lock Price"}
        </button>
      </div>
    </div>
  );
}














//////TEST ONLY USE ONE ABOVE
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// type PriceResponse = {
//   systemPriceExGst: number;
//   extrasTotalExGst: number;
//   subtotalExGst: number;
//   gst: number;
//   totalIncGst: number;
// };

// export default function PriceSummary({
//   region,
//   systemId,
//   extraIds,
//   onCalculated,
// }: {
//   region: string;
//   systemId: string;
//   extraIds: string[];
//   onCalculated?: (price: PriceResponse) => void;
// }) {
//   const router = useRouter();

//   const [price, setPrice] = useState<PriceResponse | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [confirming, setConfirming] = useState(false);

//   useEffect(() => {
//     if (!region || !systemId) return;

//     setLoading(true);

//     fetch("/api/pricing/calculate", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         regionCode: region,
//         systemId,
//         extraIds,
//       }),
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         setPrice(data);
//         onCalculated?.(data); // 👈 STEP 1 (HERE)
//       })
//       .finally(() => setLoading(false));
//   }, [region, systemId, extraIds, onCalculated]);

//   const handleConfirm = async () => {
//     if (!region || !systemId) return;

//     setConfirming(true);

//     const res = await fetch("/api/pricing/confirm", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         regionCode: region,
//         systemId,
//         extraIds,
//       }),
//     });

//     const data = await res.json();

//     if (data.confirmationId) {
//       router.push(`/pricing/confirmation/${data.confirmationId}`);
//     }

//     setConfirming(false);
//   };

//   if (!systemId) return null;
//   if (loading) return <p className="mt-6 text-gray-500">Calculating price…</p>;
//   if (!price) return null;

//   const money = (value: number) =>
//     value.toLocaleString("en-AU", { minimumFractionDigits: 0 });

//   return (
//     <div className="mt-8 border rounded-lg p-6 bg-gray-50">
//       <h2 className="text-xl font-semibold mb-4">Price Summary</h2>

//       <div className="space-y-2 text-sm">
//         <div className="flex justify-between">
//           <span>System price (ex-GST)</span>
//           <span>${money(price.systemPriceExGst)}</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Extras total (ex-GST)</span>
//           <span>${money(price.extrasTotalExGst)}</span>
//         </div>

//         <div className="flex justify-between font-medium">
//           <span>Subtotal (ex-GST)</span>
//           <span>${money(price.subtotalExGst)}</span>
//         </div>

//         <div className="flex justify-between text-gray-600">
//           <span>GST (10%)</span>
//           <span>${money(price.gst)}</span>
//         </div>

//         <div className="flex justify-between text-lg font-bold border-t pt-3">
//           <span>Total (inc-GST)</span>
//           <span>${money(price.totalIncGst)}</span>
//         </div>
//       </div>

//       <button
//         onClick={handleConfirm}
//         disabled={confirming}
//         className="mt-6 w-full bg-[#db231f] text-white py-3 rounded-lg font-semibold hover:bg-[#b91c1c] transition disabled:opacity-50"
//       >
//         {confirming ? "Locking price…" : "Confirm & Lock Price"}
//       </button>
//     </div>
//   );
// }
