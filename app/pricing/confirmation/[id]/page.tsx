// import { prisma } from "lib/prisma";

// export default async function ConfirmationPage({
//   params,
// }: {
//   params: { id: string };
// }) {
//   const confirmation = await prisma.pricingConfirmation.findUnique({
//     where: { id: params.id },
//   });

//   if (!confirmation) {
//     return (
//       <div className="max-w-3xl mx-auto p-8">
//         <h1 className="text-xl font-semibold">Confirmation not found</h1>
//       </div>
//     );
//   }

//   const money = (value: number) =>
//     value.toLocaleString("en-AU", { minimumFractionDigits: 0 });

//   return (
//     <div className="min-h-screen bg-white px-8 py-10 max-w-3xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">
//         Pricing Confirmation
//       </h1>

//       <div className="border rounded-lg p-6 bg-gray-50 space-y-4">
//         <div className="text-sm text-gray-600">
//           Confirmation ID:
//           <span className="ml-2 font-mono">{confirmation.id}</span>
//         </div>

//         <div className="space-y-2 text-sm">
//           <div className="flex justify-between">
//             <span>Base system (ex-GST)</span>
//             <span>${money(Number(confirmation.basePriceExGst))}</span>
//           </div>

//           <div className="flex justify-between">
//             <span>Extras (ex-GST)</span>
//             <span>${money(Number(confirmation.extrasTotalExGst))}</span>
//           </div>

//           <div className="flex justify-between font-medium">
//             <span>Subtotal (ex-GST)</span>
//             <span>${money(Number(confirmation.subtotalExGst))}</span>
//           </div>

//           <div className="flex justify-between text-gray-600">
//             <span>GST (10%)</span>
//             <span>${money(Number(confirmation.gst))}</span>
//           </div>

//           <div className="flex justify-between text-lg font-bold border-t pt-3">
//             <span>Total (inc-GST)</span>
//             <span>${money(Number(confirmation.totalIncGst))}</span>
//           </div>
//         </div>
//       </div>

//       <div className="mt-6">
//         <button
//           disabled
//           className="px-4 py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed"
//         >
//           Download PDF (coming soon)
//         </button>
//       </div>
//     </div>
//   );
// }
/////////////////////USE BELOW///////////////
// import { prisma } from "lib/prisma";
// import { notFound } from "next/navigation";

// type PageProps = {
//   params: Promise<{
//     id: string;
//   }>;
// };

// export default async function ConfirmationPage({ params }: PageProps) {
//   const { id } = await params; // ✅ THIS IS THE FIX

//   const confirmation = await prisma.pricingConfirmation.findUnique({
//     where: { id },
//   });

//   if (!confirmation) {
//     notFound();
//   }

//   const money = (value: number) =>
//     value.toLocaleString("en-AU", { minimumFractionDigits: 0 });

//   return (
//     <div className="min-h-screen bg-white px-8 py-10 max-w-3xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">
//         Price Confirmation
//       </h1>

//       <div className="border rounded-lg p-6 bg-gray-50 space-y-4">
//         <div className="text-sm text-gray-600">
//           Confirmation ID
//           <div className="font-mono break-all">{confirmation.id}</div>
//         </div>

//         <div className="flex justify-between">
//           <span>Base price (ex-GST)</span>
//           <span>${money(Number(confirmation.basePriceExGst))}</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Extras total (ex-GST)</span>
//           <span>${money(Number(confirmation.extrasTotalExGst))}</span>
//         </div>

//         <div className="flex justify-between font-medium">
//           <span>Subtotal (ex-GST)</span>
//           <span>${money(Number(confirmation.subtotalExGst))}</span>
//         </div>

//         <div className="flex justify-between text-gray-600">
//           <span>GST (10%)</span>
//           <span>${money(Number(confirmation.gst))}</span>
//         </div>

//         <div className="flex justify-between text-lg font-bold border-t pt-3">
//           <span>Total (inc-GST)</span>
//           <span>${money(Number(confirmation.totalIncGst))}</span>
//         </div>
//       </div>
//     </div>
//   );
// }



///////////LIVE USE THIS BELOW//////////////////
// import { prisma } from "lib/prisma";
// import { notFound } from "next/navigation";

// type PageProps = {
//   params: Promise<{
//     id: string;
//   }>;
// };

// export default async function ConfirmationPage({ params }: PageProps) {
//   // ✅ UNWRAP params (THIS IS THE FIX)
//   const { id } = await params;

//   if (!id) {
//     notFound();
//   }

//   const confirmation = await prisma.pricingConfirmation.findUnique({
//     where: { id },
//   });

//   if (!confirmation) {
//     notFound();
//   }

//   const money = (value: unknown) =>
//     Number(value).toLocaleString("en-AU");

//   return (
//     <div className="min-h-screen bg-white px-8 py-10 max-w-3xl mx-auto">
//       <h1 className="text-3xl font-bold text-gray-900 mb-2">
//         Price Confirmation
//       </h1>

//       <p className="text-gray-700 mb-6">
//         This price has been locked and recorded. It cannot be modified.
//         SunCity will contact you shortly.
//       </p>

//       <div className="border border-gray-300 rounded-xl p-6 bg-white shadow-sm space-y-4">
//         <div className="text-sm text-gray-700">
//           <span className="font-medium">Confirmation ID</span>
//           <div className="font-mono text-gray-900 break-all mt-1">
//             {confirmation.id}
//           </div>
//         </div>

//         <div className="border-t pt-4 space-y-3 text-gray-900">
//           <div className="flex justify-between">
//             <span>Base price (ex-GST)</span>
//             <span>${money(confirmation.basePriceExGst)}</span>
//           </div>

//           <div className="flex justify-between">
//             <span>Extras total (ex-GST)</span>
//             <span>${money(confirmation.extrasTotalExGst)}</span>
//           </div>

//           <div className="flex justify-between font-medium">
//             <span>Subtotal (ex-GST)</span>
//             <span>${money(confirmation.subtotalExGst)}</span>
//           </div>

//           <div className="flex justify-between text-gray-700">
//             <span>GST (10%)</span>
//             <span>${money(confirmation.gst)}</span>
//           </div>

//           <div className="flex justify-between text-xl font-bold border-t pt-4">
//             <span>Total (inc-GST)</span>
//             <span>${money(confirmation.totalIncGst)}</span>
//           </div>
//         </div>

//         <div className="mt-6 inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
//           <span className="h-2 w-2 bg-green-600 rounded-full"></span>
//           Price locked successfully
//         </div>

//         <a
//           href={`/api/pricing/confirmation/${confirmation.id}/pdf`}
//           className="mt-6 inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-black transition"
//         >
//           Download PDF
//         </a>
//       </div>
//     </div>
//   );
// }


/////TEST ONLY
// import { prisma } from "lib/prisma";
// import { notFound } from "next/navigation";
// import Image from "next/image";

// type PageProps = {
//   params: Promise<{ id: string }>;
// };

// export default async function ConfirmationPage({ params }: PageProps) {
//   const { id } = await params;
//   if (!id) notFound();

//   const confirmation = await prisma.pricingConfirmation.findUnique({
//     where: { id },
//   });
//   if (!confirmation) notFound();

//   const system = await prisma.system.findUnique({
//     where: { id: confirmation.systemId },
//     select: {
//       brand: true,
//       model: true,
//       capacityLitres: true,
//       tankMaterial: true,
//     },
//   });

//   const region = await prisma.region.findUnique({
//     where: { code: confirmation.regionCode },
//     select: { name: true },
//   });

//   //new 
//   const extras = await prisma.extra.findMany({
//     where: {
//       id: {
//         in: confirmation.extraIds ?? [],
//       },
//     },
//     select: {
//       name: true,
//     },
//   });



//   const money = (v: unknown) =>
//     Number(v).toLocaleString("en-AU");

//   const customer = confirmation.customerSnapshot as any;

//   return (
//     <div className="min-h-screen bg-white px-8 py-10 max-w-3xl mx-auto">
//       <h1 className="text-3xl font-bold text-gray-900 mb-2">
//         Price Confirmation
//       </h1>

//       <p className="text-gray-700 mb-6">
//         This price has been locked and recorded. It cannot be modified.
//         SunCity will contact you shortly.
//       </p>

//       <div className="border border-gray-300 rounded-xl p-6 bg-white shadow-sm space-y-6">
//         <Image
//           src="/images/suncity-logo-transparient.jpg.png"
//           alt="SunCity Hot Water Logo"
//           width={220}
//           height={80}
//           priority
//           className="object-contain mb-4"
//         />

//         {system && (
//           <div className="border rounded-lg p-4 bg-gray-50">
//             <h2 className="text-lg font-semibold mb-2 text-black">
//               Selected Hot Water System
//             </h2>
//             <div className="text-sm text-slate-300 space-y-1">
//               <div><strong>Brand:</strong> {system.brand}</div>
//               <div><strong>Model:</strong> {system.model}</div>
//               <div><strong>Capacity:</strong> {system.capacityLitres}L</div>
//               <div>
//                 <strong>Tank:</strong>{" "}
//                 {system.tankMaterial.replace("_", " ")}
//               </div>
//               {region && <div><strong>Region:</strong> {region.name}</div>}
//             </div>
//           </div>
//         )}

//         {extras.length > 0 && (
//         <div className="border rounded-lg p-4 bg-gray-50">
//         <h2 className="text-lg font-semibold mb-2 text-black">
//         Selected Extras
//         </h2>

//       <div className="text-sm text-gray-800 space-y-1">
//       {extras.map((extra) => (
//         <div key={extra.name}>
//           • {extra.name}
//         </div>
//       ))}
//     </div>
//   </div>
// )}
      


//         {customer && (
//           <div className="border rounded-lg p-4 bg-gray-50">
//             <h2 className="text-lg font-semibold mb-2 text-black">
//               Customer Details
//             </h2>
//             <div className="text-sm text-slate-300 space-y-1">
//               <div>
//                 <strong>Name:</strong> {customer.firstName} {customer.lastName}
//               </div>
//               <div>
//                 <strong>Email:</strong> {customer.email}
//               </div>
//               <div>
//                 <strong>Phone:</strong> {customer.phone}
//               </div>
//               <div>
//                 <strong>Suburb:</strong> {customer.suburb}
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="text-sm text-gray-700">
//           <strong>Confirmation ID</strong>
//           <div className="font-mono mt-1">{confirmation.id}</div>
//         </div>

//         <div className="border-t pt-4 space-y-2 text-black">
//           <div className="flex justify-between">
//             <span>Base price (ex-GST)</span>
//             <span>${money(confirmation.basePriceExGst)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span>Extras (ex-GST)</span>
//             <span>${money(confirmation.extrasTotalExGst)}</span>
//           </div>
//           <div className="flex justify-between font-bold">
//             <span>Total (inc-GST)</span>
//             <span>${money(confirmation.totalIncGst)}</span>
//           </div>
//         </div>

//        <div className="mt-6 inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
//         <span className="h-2 w-2 bg-green-600 rounded-full"></span>
//         Price locked successfully
//        </div>
//         <a
//           href={`/api/pricing/confirmation/${confirmation.id}/pdf`}
//           className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold"
//         >
//           Download PDF
//         </a>
//       </div>
//     </div>
//   );
// }

/////test
import { prisma } from "lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConfirmationPage({ params }: PageProps) {
  const { id } = await params;
  if (!id) notFound();

  const confirmation = await prisma.pricingConfirmation.findUnique({
    where: { id },
  });

  if (!confirmation) notFound();

  const system = await prisma.system.findUnique({
    where: { id: confirmation.systemId },
    select: {
      brand: true,
      model: true,
      capacityLitres: true,
      tankMaterial: true,
    },
  });

  const region = await prisma.region.findUnique({
    where: { code: confirmation.regionCode },
    select: { id: true, name: true },
  });

  // Fetch extras WITH prices
  const extras = region
    ? await prisma.extraPrice.findMany({
        where: {
          regionId: region.id,
          extraId: {
            in: confirmation.extraIds ?? [],
          },
        },
        include: {
          extra: true,
        },
      })
    : [];

  const money = (v: unknown) =>
    Number(v).toLocaleString("en-AU");

  const customer = confirmation.customerSnapshot as any;

  return (
    <div className="min-h-screen px-6 md:px-8 py-10 max-w-3xl mx-auto">

      <h1 className="text-3xl heading text-gradient mb-2">
        Price Confirmation
      </h1>

      <p className="text-slate-400 mb-6">
        This price has been locked and recorded. It cannot be modified.
        SunCity will contact you shortly.
      </p>

      <div className="glass-card-strong p-6 space-y-6">

        <Image
          src="/images/suncity-logo-transparient.jpg.png"
          alt="SunCity Hot Water Logo"
          width={220}
          height={80}
          priority
          className="object-contain mb-4"
        />

        {system && (
          <div className="border border-white/10 rounded-xl p-4 bg-white/5">
            <h2 className="text-lg font-semibold mb-2 text-white">
              Selected Hot Water System
            </h2>

            <div className="text-sm text-slate-300 space-y-1">
              <div><strong>Brand:</strong> {system.brand}</div>
              <div><strong>Model:</strong> {system.model}</div>
              <div><strong>Capacity:</strong> {system.capacityLitres}L</div>
              <div>
                <strong>Tank:</strong>{" "}
                {system.tankMaterial.replace("_", " ")}
              </div>

              {region && (
                <div>
                  <strong>Region:</strong> {region.name}
                </div>
              )}
            </div>
          </div>
        )}

        {/* EXTRAS WITH PRICES */}

        {extras.length > 0 && (
          <div className="border border-white/10 rounded-xl p-4 bg-white/5">
            <h2 className="text-lg font-semibold mb-2 text-white">
              Selected Extras
            </h2>

            <div className="text-sm text-slate-300 space-y-1">
              {extras.map((e) => (
                <div
                  key={e.extraId}
                  className="flex justify-between"
                >
                  <span>{e.extra.name}</span>
                  <span>${money(e.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {customer && (
          <div className="border border-white/10 rounded-xl p-4 bg-white/5">
            <h2 className="text-lg font-semibold mb-2 text-white">
              Customer Details
            </h2>

            <div className="text-sm text-slate-300 space-y-1">
              <div>
                <strong>Name:</strong>{" "}
                {customer.firstName} {customer.lastName}
              </div>

              <div>
                <strong>Email:</strong> {customer.email}
              </div>

              <div>
                <strong>Phone:</strong> {customer.phone}
              </div>

              {/* <div>
                <strong>Suburb:</strong> {customer.suburb}
              </div> */}
              <div>
              <strong>Address:</strong>{" "}
              {customer.address || "Not provided"}
              </div>

            <div>
              <strong>Suburb:</strong> {customer.suburb}
            </div>

            <div>
              <strong>Postcode:</strong> {customer.postcode}
            </div>
            </div>
          </div>
        )}

        <div className="text-sm text-slate-400">
          <strong>Confirmation ID</strong>
          <div className="font-mono mt-1 text-slate-300">
            {confirmation.id}
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 space-y-2 text-slate-200">

          <div className="flex justify-between">
            <span>Base price (ex-GST)</span>
            <span>${money(confirmation.basePriceExGst)}</span>
          </div>

          <div className="flex justify-between">
            <span>Extras (ex-GST)</span>
            <span>${money(confirmation.extrasTotalExGst)}</span>
          </div>

          <div className="flex justify-between font-bold text-lg text-white">
            <span>Total (inc-GST)</span>
            <span className="text-gradient">${money(confirmation.totalIncGst)}</span>
          </div>

        </div>

        <div className="mt-6 inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium">
          <span className="h-2 w-2 bg-emerald-400 rounded-full"></span>
          Price locked successfully
        </div>

        <a
          href={`/api/pricing/confirmation/${confirmation.id}/pdf`}
          className="btn-primary"
        >
          Download PDF
        </a>

      </div>
    </div>
  );
}