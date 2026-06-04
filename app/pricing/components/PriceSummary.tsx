//////////CHAT GPT test only below
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

// type CustomerDetails = {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   suburb: string;
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

//   const [customer, setCustomer] = useState<CustomerDetails>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     suburb: "",
//   });

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
//       .then(setPrice)
//       .finally(() => setLoading(false));
//   }, [region, systemId, extraIds]);

//   const handleConfirm = async () => {
//     for (const value of Object.values(customer)) {
//       if (!value) {
//         alert("Please complete customer details");
//         return;
//       }
//     }

//     setConfirming(true);

//     const res = await fetch("/api/pricing/confirm", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         regionCode: region,
//         systemId,
//         extraIds,
//         customer,
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

//   const money = (v: number) =>
//     v.toLocaleString("en-AU", { minimumFractionDigits: 0 });

//   return (
//     <div className="mt-8 border rounded-lg p-6 bg-gray-50 space-y-6">
//       <div className="border rounded-lg p-4 bg-white">
//         <h2 className="text-lg font-semibold mb-3 text-gray-900">
//           Customer Details
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           {[
//             ["firstName", "First name"],
//             ["lastName", "Last name"],
//             ["email", "Email"],
//             ["phone", "Phone"],
//             ["suburb", "Suburb"],
//           ].map(([key, label]) => (
//             <input
//               key={key}
//               placeholder={label}
//               className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
//               value={(customer as any)[key]}
//               onChange={(e) =>
//                 setCustomer({ ...customer, [key]: e.target.value })
//               }
//             />
//           ))}
//         </div>
//       </div>

//       <div>
//         <h2 className="text-xl font-semibold mb-4">Price Summary</h2>

//         <div className="space-y-2 text-sm text-gray-900">
//           <div className="flex justify-between">
//             <span>System price (ex-GST)</span>
//             <span>${money(price.systemPriceExGst)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span>Extras total (ex-GST)</span>
//             <span>${money(price.extrasTotalExGst)}</span>
//           </div>
//           <div className="flex justify-between font-medium">
//             <span>Subtotal (ex-GST)</span>
//             <span>${money(price.subtotalExGst)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span>GST (10%)</span>
//             <span>${money(price.gst)}</span>
//           </div>
//           <div className="flex justify-between text-lg font-bold border-t pt-3">
//             <span>Total (inc-GST)</span>
//             <span>${money(price.totalIncGst)}</span>
//           </div>
//         </div>
//       </div>

//       <button
//         onClick={handleConfirm}
//         disabled={confirming}
//         className="w-full bg-[#db231f] text-white py-3 rounded-lg font-semibold hover:bg-[#b91c1c] transition disabled:opacity-50"
//       >
//         {confirming ? "Locking price…" : "Confirm & Lock Price"}
//       </button>
//     </div>
//   );
// }


/// GROK TEST /////////////
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

// type CustomerDetails = {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   suburb: string;
//   postcode: string;
//   propertyType: string;           // e.g. "House", "Unit", etc.
//   existingSystemType: string;     // e.g. "Electric", "Solar", etc.
//   systemLocation: string;         // e.g. "Inside", "Roof", etc.
// };

// // export default function PriceSummary({
// //   region,
// //   systemId,
// //   extraIds,
// // }: {
// //   region: string;
// //   systemId: string;
// //   extraIds: string[];
// // }) {

// export default function PriceSummary({
//   region,
//   systemId,
//   extraIds,
//   extrasComplete
// }: {
//   region: string;
//   systemId: string;
//   extraIds: string[];
//   extrasComplete: boolean;
// }) {
//   const router = useRouter();

//   const [price, setPrice] = useState<PriceResponse | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [confirming, setConfirming] = useState(false);

//   const [customer, setCustomer] = useState<CustomerDetails>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     suburb: "",
//     postcode: "",
//     propertyType: "",
//     existingSystemType: "",
//     systemLocation: "",
//   });

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
//       .then(setPrice)
//       .finally(() => setLoading(false));
//   }, [region, systemId, extraIds]);

//   const handleConfirm = async () => {
//     // Simple validation – check all fields
//     for (const [key, value] of Object.entries(customer)) {
//       if (!value?.trim()) {
//         alert(`Please fill in "${key.replace(/([A-Z])/g, " $1")}"`);
//         return;
//       }
//     }

//     setConfirming(true);

//     const res = await fetch("/api/pricing/confirm", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         regionCode: region,
//         systemId,
//         extraIds,
//         customer,
//       }),
//     });

//     const data = await res.json();

//     if (data.confirmationId) {
//       router.push(`/pricing/confirmation/${data.confirmationId}`);
//     } else {
//       alert("Failed to confirm. Please try again.");
//     }

//     setConfirming(false);
//   };

//   if (!systemId) return null;
//   if (loading) return <p className="mt-6 text-gray-500">Calculating price…</p>;
//   if (!price) return null;

//   const money = (v: number) =>

//     v.toLocaleString("en-AU", { minimumFractionDigits: 0 });

//   const customerComplete =
//   customer.firstName &&
//   customer.lastName &&
//   customer.email &&
//   customer.phone &&
//   customer.suburb &&
//   customer.postcode &&
//   customer.propertyType &&
//   customer.existingSystemType &&
//   customer.systemLocation;

//   return (
//     <div className="mt-8 border rounded-lg p-6 bg-gray-50 space-y-8">
//       {/* Customer Details Section */}
//       <div className="border rounded-lg p-5 bg-white shadow-sm">
//         <h2 className="text-xl font-semibold mb-5 text-gray-900">
//           Customer & Property Details
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* Text inputs */}
//           <input
//             placeholder="First name"
//             value={customer.firstName}
//             onChange={(e) => setCustomer((s) => ({ ...s, firstName: e.target.value }))}
//             className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
//           />
//           <input
//             placeholder="Last name"
//             value={customer.lastName}
//             onChange={(e) => setCustomer((s) => ({ ...s, lastName: e.target.value }))}
//             className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
//           />
//           <input
//             placeholder="Email"
//             type="email"
//             value={customer.email}
//             onChange={(e) => setCustomer((s) => ({ ...s, email: e.target.value }))}
//             className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
//           />
//           <input
//             placeholder="Mobile"
//             type="tel"
//             value={customer.phone}
//             onChange={(e) => setCustomer((s) => ({ ...s, phone: e.target.value }))}
//             className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
//           />
//           <input
//             placeholder="Address + Suburb"
//             value={customer.suburb}
//             onChange={(e) => setCustomer((s) => ({ ...s, suburb: e.target.value }))}
//             className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
//           />
//           <input
//             placeholder="Postcode"
//             value={customer.postcode}
//             onChange={(e) => setCustomer((s) => ({ ...s, postcode: e.target.value }))}
//             className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
//           />

//           {/* Dropdown: Type of Property */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Type of Property
//             </label>
//             <select
//               value={customer.propertyType}
//               onChange={(e) =>
//                 setCustomer((s) => ({ ...s, propertyType: e.target.value }))
//               }
//               className="border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-500"
//             >
//               <option value="">Choose one</option>
//               <option value="House">House</option>
//               <option value="Unit">Unit</option>
//               <option value="Townhouse">Townhouse</option>
//               <option value="Commercial">Commercial</option>
//             </select>
//           </div>

//           {/* Dropdown: Existing System Type */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Existing System Type
//             </label>
//             <select
//               value={customer.existingSystemType}
//               onChange={(e) =>
//                 setCustomer((s) => ({ ...s, existingSystemType: e.target.value }))
//               }
//               className="border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-500"
//             >
//               <option value="">Choose one</option>
//               <option value="Electric">Electric</option>
//               <option value="Gas">Gas</option>
//               <option value="Solar">Solar</option>
//               <option value="Heat Pump">Heat Pump</option>
//               <option value="Not Sure">Not Sure</option>
//               <option value="No Existing System">No Existing System</option>
//             </select>
//           </div>

//           {/* Dropdown: Location of Existing System */}
//           <div className="md:col-span-2">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Location of Existing System
//             </label>
//             <select
//               value={customer.systemLocation}
//               onChange={(e) =>
//                 setCustomer((s) => ({ ...s, systemLocation: e.target.value }))
//               }
//               className="border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-500"
//             >
//               <option value="">Choose one</option>
//               <option value="Inside">Inside</option>
//               <option value="Outside">Outside</option>
//               <option value="Roof">Roof</option>
//               <option value="No Existing System">No Existing System</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Price Summary */}
//       <div>
//         <h2 className="text-xl font-semibold mb-4 text-gray-900">Price Summary</h2>

//         <div className="space-y-2 text-sm text-gray-900">
//           <div className="flex justify-between">
//             <span>System price (ex-GST)</span>
//             <span>${money(price.systemPriceExGst)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span>Extras total (ex-GST)</span>
//             <span>${money(price.extrasTotalExGst)}</span>
//           </div>
//           <div className="flex justify-between font-medium">
//             <span>Subtotal (ex-GST)</span>
//             <span>${money(price.subtotalExGst)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span>GST (10%)</span>
//             <span>${money(price.gst)}</span>
//           </div>
//           <div className="flex justify-between text-lg font-bold border-t pt-3">
//             <span>Total (inc-GST)</span>
//             <span>${money(price.totalIncGst)}</span>
//           </div>
//         </div>
//       </div>

//       {/* Confirm Button */}
//       <button
//         onClick={handleConfirm}
//         disabled={confirming || !extrasComplete || !customerComplete}
//         //disabled={confirming}
//         className={`w-full py-3.5 rounded-lg font-semibold text-white transition ${
//           //confirming
//           confirming || !extrasComplete || !customerComplete
//             ? "bg-gray-500 cursor-not-allowed"
//             : "bg-[#db231f] hover:bg-[#b91c1c]"
//         }`}
//       >
//         {confirming ? "Confirming…" : "Confirm & Lock Price"}
//       </button>
//     </div>
//   );
// }
///////////test with google maps Address mapping LAST
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

// type CustomerDetails = {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   suburb: string;
//   postcode: string;
//   propertyType: string;
//   existingSystemType: string;
//   systemLocation: string;
// };

// export default function PriceSummary({
//   region,
//   systemId,
//   extraIds,
//   extrasComplete
// }: {
//   region: string;
//   systemId: string;
//   extraIds: string[];
//   extrasComplete: boolean;
// }) {
//   const router = useRouter();

//   const [price, setPrice] = useState<PriceResponse | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [confirming, setConfirming] = useState(false);

//   const [suggestions, setSuggestions] = useState<any[]>([]);
//   const [addressInput, setAddressInput] = useState("");

//   const [customer, setCustomer] = useState<CustomerDetails>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     suburb: "",
//     postcode: "",
//     propertyType: "",
//     existingSystemType: "",
//     systemLocation: "",
//   });

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
//       .then(setPrice)
//       .finally(() => setLoading(false));
//   }, [region, systemId, extraIds]);

//   const handleConfirm = async () => {
//     for (const [key, value] of Object.entries(customer)) {
//       if (!value?.trim()) {
//         alert(`Please fill in "${key.replace(/([A-Z])/g, " $1")}"`);
//         return;
//       }
//     }

//     setConfirming(true);

//     const res = await fetch("/api/pricing/confirm", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         regionCode: region,
//         systemId,
//         extraIds,
//         customer,
//       }),
//     });

//     const data = await res.json();

//     if (data.confirmationId) {
//       router.push(`/pricing/confirmation/${data.confirmationId}`);
//     } else {
//       alert("Failed to confirm. Please try again.");
//     }

//     setConfirming(false);
//   };

//   if (!systemId) return null;
//   if (loading) return <p className="mt-6 text-gray-500">Calculating price…</p>;
//   if (!price) return null;

//   const money = (v: number) =>
//     v.toLocaleString("en-AU", { minimumFractionDigits: 0 });

//   const customerComplete =
//     customer.firstName &&
//     customer.lastName &&
//     customer.email &&
//     customer.phone &&
//     customer.suburb &&
//     customer.postcode &&
//     customer.propertyType &&
//     customer.existingSystemType &&
//     customer.systemLocation;

//   return (
//     <div className="mt-8 border rounded-lg p-6 bg-gray-50 space-y-8">

//       {/* Customer Details */}
//       <div className="border rounded-lg p-5 bg-white shadow-sm">
//         <h2 className="text-xl font-semibold mb-5 text-gray-900">
//           Customer & Property Details
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//           <input
//             placeholder="First name"
//             value={customer.firstName}
//             onChange={(e) => setCustomer((s) => ({ ...s, firstName: e.target.value }))}
//             className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
//           />

//           <input
//             placeholder="Last name"
//             value={customer.lastName}
//             onChange={(e) => setCustomer((s) => ({ ...s, lastName: e.target.value }))}
//             className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
//           />

//           <input
//             placeholder="Email"
//             type="email"
//             value={customer.email}
//             onChange={(e) => setCustomer((s) => ({ ...s, email: e.target.value }))}
//             className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
//           />

//           <input
//             placeholder="Mobile"
//             type="tel"
//             value={customer.phone}
//             onChange={(e) => setCustomer((s) => ({ ...s, phone: e.target.value }))}
//             className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
//           />

//           {/* ✅ NEW AUTOCOMPLETE INPUT */}
//           <div className="relative">
//             <input
//               placeholder="Start typing address..."
//               value={addressInput}
//               onChange={async (e) => {
//                 const value = e.target.value;
//                 setAddressInput(value);

//                 if (value.length < 3) {
//                   setSuggestions([]);
//                   return;
//                 }

//                 const res = await fetch(
//                   `/api/google/autocomplete?input=${value}`
//                 );

//                 const data = await res.json();
//                 // setSuggestions(data.predictions || []);
//                 const qldOnly = (data.predictions || []).filter((p: any) =>
//                 p.description.includes("QLD")
//               );

//               setSuggestions(qldOnly);
//               }}
//               className="border rounded-md px-3 py-2 text-sm w-full"
//             />

//             {suggestions.length > 0 && (
//               <div className="absolute z-50 bg-white border w-full mt-1 rounded shadow max-h-60 overflow-y-auto">
//                 {suggestions.map((s) => (
//                   <div
//                     key={s.place_id}
//                     className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
//                     onClick={async () => {
//                       const res = await fetch(
//                         `/api/google/place-details?placeId=${s.place_id}`
//                       );

//                       const data = await res.json();

//                       const components = data.result.address_components || [];

//                       const suburb =
//                         components.find((c: any) =>
//                           c.types.includes("locality")
//                         )?.long_name || "";

//                       const postcode =
//                         components.find((c: any) =>
//                           c.types.includes("postal_code")
//                         )?.long_name || "";

//                       setCustomer((prev) => ({
//                         ...prev,
//                         suburb,
//                         postcode,
//                       }));

//                       setAddressInput(s.description);
//                       setSuggestions([]);
//                     }}
//                   >
//                     {s.description}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <input
//             placeholder="Postcode"
//             value={customer.postcode}
//             onChange={(e) => setCustomer((s) => ({ ...s, postcode: e.target.value }))}
//             className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
//           />

//           <select
//             value={customer.propertyType}
//             onChange={(e) =>
//               setCustomer((s) => ({ ...s, propertyType: e.target.value }))
//             }
//             className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
//           >
//             <option value="">Choose one</option>
//             <option value="House">House</option>
//             <option value="Unit">Unit</option>
//             <option value="Townhouse">Townhouse</option>
//             <option value="Commercial">Commercial</option>
//           </select>

//           <select
//             value={customer.existingSystemType}
//             onChange={(e) =>
//               setCustomer((s) => ({ ...s, existingSystemType: e.target.value }))
//             }
//             className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
//           >
//             <option value="">Choose one</option>
//             <option value="Electric">Electric</option>
//             <option value="Gas">Gas</option>
//             <option value="Solar">Solar</option>
//             <option value="Heat Pump">Heat Pump</option>
//             <option value="Not Sure">Not Sure</option>
//             <option value="No Existing System">No Existing System</option>
//           </select>

//           <select
//             value={customer.systemLocation}
//             onChange={(e) =>
//               setCustomer((s) => ({ ...s, systemLocation: e.target.value }))
//             }
//             className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
//           >
//             <option value="">Choose one</option>
//             <option value="Inside">Inside</option>
//             <option value="Outside">Outside</option>
//             <option value="Roof">Roof</option>
//             <option value="No Existing System">No Existing System</option>
//           </select>

//         </div>
//       </div>

//       {/* Price Summary */}
//       <div>
//         <h2 className="text-xl font-semibold mb-4 text-gray-900">Price Summary</h2>

//         <div className="space-y-2 text-sm text-gray-900">
//           <div className="flex justify-between">
//             <span>System price (ex-GST)</span>
//             <span>${money(price.systemPriceExGst)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span>Extras total (ex-GST)</span>
//             <span>${money(price.extrasTotalExGst)}</span>
//           </div>
//           <div className="flex justify-between font-medium">
//             <span>Subtotal (ex-GST)</span>
//             <span>${money(price.subtotalExGst)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span>GST (10%)</span>
//             <span>${money(price.gst)}</span>
//           </div>
//           <div className="flex justify-between text-lg font-bold border-t pt-3">
//             <span>Total (inc-GST)</span>
//             <span>${money(price.totalIncGst)}</span>
//           </div>
//         </div>
//       </div>

//       <button
//         onClick={handleConfirm}
//         disabled={confirming || !extrasComplete || !customerComplete}
//         className={`w-full py-3.5 rounded-lg font-semibold text-white ${
//           confirming || !extrasComplete || !customerComplete
//             ? "bg-gray-500 cursor-not-allowed"
//             : "bg-[#db231f] hover:bg-[#b91c1c]"
//         }`}
//       >
//         {confirming ? "Confirming…" : "Confirm & Lock Price"}
//       </button>
//     </div>
//   );
// }

/// NEW TEST
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

type CustomerDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  address?: string; // ✅ ADDED

  suburb: string;
  postcode: string;
  propertyType: string;
  existingSystemType: string;
  systemLocation: string;
};

export default function PriceSummary({
  region,
  systemId,
  extraIds,
  extrasComplete
}: {
  region: string;
  systemId: string;
  extraIds: string[];
  extrasComplete: boolean;
}) {
  const router = useRouter();

  const [price, setPrice] = useState<PriceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [addressInput, setAddressInput] = useState("");

  const [customer, setCustomer] = useState<CustomerDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "", // ✅ ADDED
    suburb: "",
    postcode: "",
    propertyType: "",
    existingSystemType: "",
    systemLocation: "",
  });

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
    for (const [key, value] of Object.entries(customer)) {
      if (!value?.toString().trim()) {
        alert(`Please fill in "${key.replace(/([A-Z])/g, " $1")}"`);
        return;
      }
    }

    console.log("🚀 FINAL CUSTOMER:", customer); // ✅ DEBUG

    setConfirming(true);

    const res = await fetch("/api/pricing/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        regionCode: region,
        systemId,
        extraIds,
        customer,
      }),
    });

    const data = await res.json();

    if (data.confirmationId) {
      router.push(`/pricing/confirmation/${data.confirmationId}`);
    } else {
      alert("Failed to confirm. Please try again.");
    }

    setConfirming(false);
  };

  if (!systemId) return null;
  if (loading) return <p className="mt-6 text-slate-400">Calculating price…</p>;
  if (!price) return null;

  const money = (v: number) =>
    v.toLocaleString("en-AU", { minimumFractionDigits: 0 });

  const customerComplete =
    customer.firstName &&
    customer.lastName &&
    customer.email &&
    customer.phone &&
    customer.suburb &&
    customer.postcode &&
    customer.propertyType &&
    customer.existingSystemType &&
    customer.systemLocation &&
    customer.address; // ✅ REQUIRED NOW

  return (
    <div className="mt-8 space-y-8">

      {/* Customer Details */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl font-semibold mb-5 text-white">
          Customer & Property Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            placeholder="First name"
            value={customer.firstName}
            onChange={(e) => setCustomer((s) => ({ ...s, firstName: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
          />

          <input
            placeholder="Last name"
            value={customer.lastName}
            onChange={(e) => setCustomer((s) => ({ ...s, lastName: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
          />

          <input
            placeholder="Email"
            type="email"
            value={customer.email}
            onChange={(e) => setCustomer((s) => ({ ...s, email: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
          />

          <input
            placeholder="Mobile"
            type="tel"
            value={customer.phone}
            onChange={(e) => setCustomer((s) => ({ ...s, phone: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
          />

          {/* GOOGLE ADDRESS */}
          <div className="relative">
            <input
              placeholder="Start typing address..."
              value={addressInput}
              onChange={async (e) => {
                const value = e.target.value;
                setAddressInput(value);

                if (value.length < 3) {
                  setSuggestions([]);
                  return;
                }

                const res = await fetch(
                  `/api/google/autocomplete?input=${value}`
                );

                const data = await res.json();

                const qldOnly = (data.predictions || []).filter((p: any) =>
                  p.description.includes("QLD")
                );

                setSuggestions(qldOnly);
              }}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition"
            />

            {suggestions.length > 0 && (
              <div className="absolute z-50 bg-[#0d1220] border border-white/10 w-full mt-1 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {suggestions.map((s) => (
                  <div
                    key={s.place_id}
                    className="p-2 hover:bg-white/10 cursor-pointer text-sm text-slate-200"
                    onClick={async () => {
                      const res = await fetch(
                        `/api/google/place-details?placeId=${s.place_id}`
                      );

                      const data = await res.json();

                      const components = data.result.address_components || [];

                      const suburb =
                        components.find((c: any) =>
                          c.types.includes("locality")
                        )?.long_name || "";

                      const postcode =
                        components.find((c: any) =>
                          c.types.includes("postal_code")
                        )?.long_name || "";

                      // ✅ FIX — STORE FULL ADDRESS
                      const fullAddress =
                        data.result.formatted_address || s.description;

                      setCustomer((prev) => ({
                        ...prev,
                        suburb,
                        postcode,
                        address: fullAddress, // ✅ THIS FIXES EVERYTHING
                      }));

                      setAddressInput(fullAddress);
                      setSuggestions([]);
                    }}
                  >
                    {s.description}
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            placeholder="Postcode"
            value={customer.postcode}
            onChange={(e) => setCustomer((s) => ({ ...s, postcode: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
          />

          <select
            value={customer.propertyType}
            onChange={(e) =>
              setCustomer((s) => ({ ...s, propertyType: e.target.value }))
            }
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
          >
            <option value="">Choose one</option>
            <option value="House">House</option>
            <option value="Unit">Unit</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Commercial">Commercial</option>
          </select>

          <select
            value={customer.existingSystemType}
            onChange={(e) =>
              setCustomer((s) => ({ ...s, existingSystemType: e.target.value }))
            }
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
          >
            <option value="">Choose one</option>
            <option value="Electric">Electric</option>
            <option value="Gas">Gas</option>
            <option value="Solar">Solar</option>
            <option value="Heat Pump">Heat Pump</option>
            <option value="Not Sure">Not Sure</option>
            <option value="No Existing System">No Existing System</option>
          </select>

          <select
            value={customer.systemLocation}
            onChange={(e) =>
              setCustomer((s) => ({ ...s, systemLocation: e.target.value }))
            }
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#db231f] focus:ring-2 focus:ring-[#db231f]/30 transition [&_option]:bg-[#0d1220] [&_option]:text-white"
          >
            <option value="">Choose one</option>
            <option value="Inside">Inside</option>
            <option value="Outside">Outside</option>
            <option value="Roof">Roof</option>
            <option value="No Existing System">No Existing System</option>
          </select>

        </div>
      </div>

      {/* Price Summary */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">Price Summary</h2>

        <div className="space-y-2 text-sm text-slate-200">
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
          <div className="flex justify-between">
            <span>GST (10%)</span>
            <span>${money(price.gst)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-3 text-white">
            <span>Total (inc-GST)</span>
            <span className="text-gradient">${money(price.totalIncGst)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={confirming || !extrasComplete || !customerComplete}
        className="btn-primary w-full"
      >
        {confirming ? "Confirming…" : "Confirm & Lock Price"}
      </button>
      {!extrasComplete && (
      <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm font-semibold text-red-300 flex items-center gap-2">
        ⚠️ Please answer all extras before confirming the price.
      </div>
    )}
    </div>
    
  );
}






