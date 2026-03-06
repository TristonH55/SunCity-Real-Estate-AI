// import { prisma } from "@/lib/prisma";
// import { requireRole } from "@/lib/require-role";

// export default async function AdminDashboard() {
//   await requireRole("admin");

//   const users = await prisma.user.findMany({
//     orderBy: { createdAt: "desc" },
//   });

//   const confirmations = await prisma.pricingConfirmation.findMany({
//     orderBy: { createdAt: "desc" },
//     take: 20,
//   });

//   return (
//     <div className="max-w-6xl mx-auto p-8 space-y-10">
//       <h1 className="text-3xl font-bold">Admin Dashboard</h1>

//       {/* USERS */}
//       <section>
//         <h2 className="text-xl font-semibold mb-4">Users</h2>

//         <div className="border rounded-lg overflow-hidden">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-100 text-left">
//               <tr>
//                 <th className="p-3">Email</th>
//                 <th className="p-3">Company</th>
//                 <th className="p-3">Role</th>
//                 <th className="p-3">Approved</th>
//                 <th className="p-3">Created</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.map((u) => (
//                 <tr key={u.id} className="border-t">
//                   <td className="p-3">{u.email}</td>
//                   <td className="p-3">{u.companyName}</td>
//                   <td className="p-3">{u.role}</td>
//                   <td className="p-3">
//                     {u.approved ? "✅ Yes" : "❌ No"}
//                   </td>
//                   <td className="p-3">
//                     {u.createdAt.toLocaleDateString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </section>

//       {/* CONFIRMATIONS */}
//       <section>
//         <h2 className="text-xl font-semibold mb-4">
//           Recent Price Confirmations
//         </h2>

//         <div className="border rounded-lg overflow-hidden">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-100 text-left">
//               <tr>
//                 <th className="p-3">ID</th>
//                 <th className="p-3">Region</th>
//                 <th className="p-3">Total</th>
//                 <th className="p-3">Created</th>
//               </tr>
//             </thead>
//             <tbody>
//               {confirmations.map((c) => (
//                 <tr key={c.id} className="border-t">
//                   <td className="p-3 font-mono text-xs">
//                     {c.id.slice(0, 8)}…
//                   </td>
//                   <td className="p-3">{c.regionCode}</td>
//                   <td className="p-3">
//                     ${Number(c.totalIncGst).toLocaleString("en-AU")}
//                   </td>
//                   <td className="p-3">
//                     {c.createdAt.toLocaleDateString()}
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
////V2
import { prisma } from "lib/prisma";
import { requireRole } from "lib/require-role";
import ApproveButton from "./components/ApproveButton";

export default async function AdminDashboard() {
  await requireRole("admin");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const confirmations = await prisma.pricingConfirmation.findMany({
    where: {
      createdAt: { gte: monthAgo },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-100 p-10 text-black">

      <h1 className="text-3xl font-bold text-[#db231f] mb-10">
        Admin Dashboard
      </h1>

      {/* USERS TABLE */}

      <div className="bg-white rounded-xl shadow mb-12">

        <div className="bg-[#db231f] text-white px-6 py-4 rounded-t-xl font-semibold">
          Registered Users
        </div>

        <table className="w-full text-sm text-black">

          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>

            {users.map((u) => (
              <tr key={u.id} className="border-t">

                <td className="p-3 text-black">{u.email}</td>

                <td className="p-3 text-black">{u.companyName}</td>

                <td className="p-3 text-black capitalize">{u.role}</td>

                <td className="p-3">

                  {u.approved ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                      Approved
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      Pending
                    </span>
                  )}

                </td>

                <td className="p-3">

                  <ApproveButton
                    userId={u.id}
                    approved={u.approved}
                  />

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* CONFIRMATIONS */}

      <div className="bg-white rounded-xl shadow">

        <div className="bg-[#db231f] text-white px-6 py-4 rounded-t-xl font-semibold">
          Confirmations (Last 30 Days)
        </div>

        <table className="w-full text-sm text-black">

          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="p-3 text-left">Confirmation</th>
              <th className="p-3 text-left">Region</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>

          <tbody>

            {confirmations.map((c) => (
              <tr key={c.id} className="border-t">

                <td className="p-3 font-mono text-xs text-black">
                  {c.id.slice(0, 8)}
                </td>

                <td className="p-3 text-black">{c.regionCode}</td>

                <td className="p-3 text-black">
                  ${Number(c.totalIncGst).toLocaleString("en-AU")}
                </td>

                <td className="p-3 text-black">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}