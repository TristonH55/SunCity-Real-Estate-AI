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
import { prisma } from "lib/prisma";
import { requireRole } from "lib/require-role";

export default async function Dashboard() {
  const session = await requireRole("insurer");

  const confirmations = await prisma.pricingConfirmation.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-gray-100 p-10 text-black">
      <h1 className="text-3xl font-bold text-[#db231f] mb-8">
        {session.user.companyName} Dashboard
      </h1>

      <div className="bg-white rounded-xl shadow">
        <div className="bg-[#db231f] text-white px-6 py-2 rounded-t-xl font-semibold">
          Recent Quotes
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-3 text-left">Confirmation</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left"></th>
            </tr>
          </thead>

          <tbody>
            {confirmations.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-mono text-xs">
                  {c.id.slice(0, 8)}
                </td>

                <td className="p-3">
                  ${Number(c.totalIncGst).toLocaleString("en-AU")}
                </td>

                <td className="p-3">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>

                <td className="p-3">
                  <a
                    href={`/pricing/confirmation/${c.id}`}
                    target="_blank"
                    className="text-[#db231f] font-semibold"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}