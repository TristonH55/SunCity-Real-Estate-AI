// import { prisma } from "lib/prisma";
// import { requireRole } from "@/lib/require-role";

// export default async function InsurerDashboard() {
//   const session = await requireRole("insurer");

//   const confirmations = await prisma.pricingConfirmation.findMany({
//     orderBy: { createdAt: "desc" },
//     take: 20,
//   });

//   return (
//     <div className="max-w-5xl mx-auto p-8 space-y-8">
//       <h1 className="text-3xl font-bold">
//         Welcome, {session.user.companyName}
//       </h1>

//       <section>
//         <h2 className="text-xl font-semibold mb-4">
//           Your Recent Quotes
//         </h2>

//         <div className="border rounded-lg overflow-hidden">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-100 text-left">
//               <tr>
//                 <th className="p-3">Confirmation</th>
//                 <th className="p-3">Total</th>
//                 <th className="p-3">Date</th>
//                 <th className="p-3"></th>
//               </tr>
//             </thead>
//             <tbody>
//               {confirmations.map((c) => (
//                 <tr key={c.id} className="border-t">
//                   <td className="p-3 font-mono text-xs">
//                     {c.id.slice(0, 8)}…
//                   </td>
//                   <td className="p-3">
//                     ${Number(c.totalIncGst).toLocaleString("en-AU")}
//                   </td>
//                   <td className="p-3">
//                     {c.createdAt.toLocaleDateString()}
//                   </td>
//                   <td className="p-3">
//                     <a
//                       href={`/pricing/confirmation/${c.id}`}
//                       className="text-red-600 hover:underline"
//                     >
//                       View
//                     </a>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </section>
//     </div>
//   );
// }

/////V2
// import { prisma } from "lib/prisma";
// import { requireRole } from "lib/require-role";

// export default async function Dashboard() {
//   const session = await requireRole("insurer");

//   const confirmations = await prisma.pricingConfirmation.findMany({
//     orderBy: { createdAt: "desc" },
//     take: 20,
//   });

//   return (
//     <div className="min-h-screen bg-gray-100 p-10 text-black">
//       <h1 className="text-3xl font-bold text-[#db231f] mb-8">
//         {session.user.companyName} Dashboard
//       </h1>

//       <div className="bg-white rounded-xl shadow">
//         <div className="bg-[#db231f] text-white px-6 py-2 rounded-t-xl font-semibold">
//           Recent Quotes
//         </div>

//         <table className="w-full text-sm">
//           <thead className="bg-gray-50 text-gray-700">
//             <tr>
//               <th className="p-3 text-left">Confirmation</th>
//               <th className="p-3 text-left">Total</th>
//               <th className="p-3 text-left">Date</th>
//               <th className="p-3 text-left"></th>
//             </tr>
//           </thead>

//           <tbody>
//             {confirmations.map((c) => (
//               <tr key={c.id} className="border-t">
//                 <td className="p-3 font-mono text-xs">
//                   {c.id.slice(0, 8)}
//                 </td>

//                 <td className="p-3">
//                   ${Number(c.totalIncGst).toLocaleString("en-AU")}
//                 </td>

//                 <td className="p-3">
//                   {new Date(c.createdAt).toLocaleDateString()}
//                 </td>

//                 <td className="p-3">
//                   <a
//                     href={`/pricing/confirmation/${c.id}`}
//                     target="_blank"
//                     className="text-[#db231f] font-semibold"
//                   >
//                     View
//                   </a>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

////////////V3
// import { prisma } from "../../lib/prisma";
// import { getServerSession } from "next-auth";

// export default async function Dashboard() {
//   const confirmations = await prisma.pricingConfirmation.findMany({
//     orderBy: { createdAt: "desc" },
//     take: 20,
//   });

//   return (
//     <div className="flex justify-center py-10 bg-gray-100 min-h-screen">
//       <div className="w-full max-w-[1000px] bg-white shadow rounded-lg p-6">

//         <h1 className="text-2xl font-bold mb-6 text-red-600">
//           Your Confirmations
//         </h1>

//         <table className="w-full text-sm">
//           <thead>
//             <tr className="border-b text-black">
//               <th className="text-left py-2">Confirmation</th>
//               <th className="text-left py-2">Total</th>
//               <th className="text-left py-2">Date</th>
//               <th className="text-left py-2">View</th>
//             </tr>
//           </thead>

//           <tbody>
//             {confirmations.map((c) => (
//               <tr key={c.id} className="border-b text-black">
//                 <td className="py-2">{c.id}</td>

//                 <td>
//                   ${Number(c.totalIncGst).toLocaleString()}
//                 </td>

//                 <td>
//                   {new Date(c.createdAt).toLocaleDateString("en-AU")}
//                 </td>

//                 <td>
//                   <a
//                     href={`/pricing/confirmation/${c.id}`}
//                     target="_blank"
//                     className="text-blue-600 underline"
//                   >
//                     View PDF
//                   </a>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//       </div>
//     </div>
//   );
// }

//V 2.1 
// import { getServerSession } from "next-auth";
// import { prisma } from "../../lib/prisma";

// export default async function Dashboard() {
//   const confirmations = await prisma.pricingConfirmation.findMany({
//     orderBy: { createdAt: "desc" },
//     take: 20,
//     include: {
//       notesLog: {
//         orderBy: { createdAt: "desc" },
//         take: 1,
//       },
//     },
//   });

//   return (
//     <div className="flex justify-center py-10 bg-gray-100 min-h-screen">
//       <div className="w-full max-w-[1000px] bg-white shadow rounded-lg p-6">

//         <h1 className="text-2xl font-bold mb-6 text-red-600">
//           Your Confirmations
//         </h1>

//         <table className="w-full text-sm">
//           <thead>
//             <tr className="border-b text-black">
//               <th className="text-left py-2">Confirmation</th>
//               <th className="text-left py-2">Total</th>
//               <th className="text-left py-2">Date</th>
//               <th className="text-left py-2">View</th>
//               <th className="text-left py-2">Open</th>
//             </tr>
//           </thead>

//           <tbody>
//             {confirmations.map((c) => (
//               <tr key={c.id} className="border-b text-black">
//                 <td className="py-2">{c.id}</td>

//                 <td>
//                   ${Number(c.totalIncGst).toLocaleString()}
//                 </td>

//                 <td>
//                   {new Date(c.createdAt).toLocaleDateString("en-AU")}
//                 </td>

//                 <td>
//                   <a
//                     href={`/pricing/confirmation/${c.id}`}
//                     target="_blank"
//                     className="text-blue-600 underline"
//                   >
//                     View PDF
//                   </a>
//                 </td>

//                 {/* ✅ OPEN JOB + BADGE */}
//                 <td className="relative">
//                   <a
//                     href={`/dashboard/jobs/${c.id}`}
//                     className="text-blue-600 underline"
//                   >
//                     Open Job
//                   </a>

//                   {c.notesLog?.length > 0 && (
//                     <span className="ml-5 inline-block bg-green-700 text-white text-xs px-3 py-0.5 rounded-full">
//                       New Message
//                     </span>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//       </div>
//     </div>
//   );
// }

// v2.2
export const dynamic = "force-dynamic";

import { prisma } from "../../lib/prisma";

export default async function Dashboard() {
  const confirmations = await prisma.pricingConfirmation.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      notesLog: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div className="flex justify-center py-10 min-h-screen px-4">
      <div className="w-full max-w-[1000px] glass-card p-6">

        <h1 className="text-2xl heading text-gradient mb-6">
          Your Confirmations
        </h1>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-300">
              <th className="text-left py-2">Confirmation</th>
              <th className="text-left py-2">Total</th>
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">View</th>
              <th className="text-left py-2">Open</th>
            </tr>
          </thead>

          <tbody>
            {confirmations.map((c) => {
              const latestMessage = c.notesLog?.[0];

              // ✅ SAFE ACCESS (no TS error)
              const lastViewed = (c as any).lastViewedByInsurer;

              const isUnread =
                latestMessage &&
                (!lastViewed ||
                  new Date(latestMessage.createdAt) >
                    new Date(lastViewed));

              return (
                <tr key={c.id} className="border-b border-white/10 text-slate-200">
                  <td className="py-2">{c.id}</td>

                  <td>
                    ${Number(c.totalIncGst).toLocaleString()}
                  </td>

                  <td>
                    {new Date(c.createdAt).toLocaleDateString("en-AU")}
                  </td>

                  <td>
                    <a
                      href={`/pricing/confirmation/${c.id}`}
                      target="_blank"
                      className="text-sky-300 hover:text-sky-200 underline"
                    >
                      View PDF
                    </a>
                  </td>

                  <td className="relative">
                    <a
                      href={`/dashboard/jobs/${c.id}`}
                      className="text-sky-300 hover:text-sky-200 underline"
                    >
                      Open Job
                    </a>

                    {isUnread && (
                      <span className="ml-3 inline-block bg-[#25D366] text-white text-xs px-3 py-0.5 rounded-full">
                        New Message
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

      </div>
    </div>
  );
}