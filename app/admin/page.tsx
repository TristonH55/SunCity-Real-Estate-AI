// //v5
// import { getServerSession } from "next-auth";
// import { redirect } from "next/navigation";
// import { authOptions } from "../../lib/auth";

// import { prisma } from "../../lib/prisma";
// import ApproveButton from "./components/ApproveButton";
// import DeleteUserButton from "./components/DeleteUserButton";
// import DeleteConfirmationButton from "./components/DeleteConfirmationButton";


// // export default async function AdminPage() {

// export default async function AdminPage() {

//   const session = await getServerSession(authOptions);

//   if (!session || session.user.role !== "admin") {
//     redirect("/login");
//   }

//   const users = await prisma.user.findMany({
//     orderBy: { createdAt: "desc" },
//   });

//   const confirmations = await prisma.pricingConfirmation.findMany({
//     orderBy: { createdAt: "desc" },
//     take: 20,
//   });

//   const totalUsers = await prisma.user.count();
//   const totalQuotes = await prisma.pricingConfirmation.count();

//   return (
//     <div className="flex justify-center py-10 bg-gray-100 min-h-screen">

//       <div className="w-full max-w-[1200px] space-y-10">

//         {/* PAGE TITLE */}
//         <h1 className="text-3xl font-bold text-red-600">
//           Admin Dashboard
//         </h1>

//         {/* STATS */}
//         <div className="grid grid-cols-3 gap-6">

//           <div className="bg-white shadow rounded-lg p-6">
//             <h2 className="text-sm text-gray-500">Total Users</h2>
//             <p className="text-3xl font-bold text-black">{totalUsers}</p>
//           </div>

//           <div className="bg-white shadow rounded-lg p-6">
//             <h2 className="text-sm text-gray-500">Total Quotes</h2>
//             <p className="text-3xl font-bold text-black">{totalQuotes}</p>
//           </div>

//           <div className="bg-white shadow rounded-lg p-6">
//             <h2 className="text-sm text-gray-500">Recent Confirmations</h2>
//             <p className="text-3xl font-bold text-black">{confirmations.length}</p>
//           </div>

//         </div>

//         {/* USERS TABLE */}
//         <div className="bg-white rounded-lg shadow p-6">

//           <h2 className="text-xl font-bold mb-4 text-red-600">
//             Registered Insurers
//           </h2>

//           <table className="w-full text-sm">

//             <thead>
//               <tr className="border-b text-black">
//                 <th className="text-left py-2">Email</th>
//                 <th className="text-left py-2">Company</th>
//                 <th className="text-left py-2">Role</th>
//                 <th className="text-left py-2">Approved</th>
//                 <th className="text-left py-2">Actions</th>
//               </tr>
//             </thead>

//             <tbody>

//               {users.map((u) => (

//                 <tr key={u.id} className="border-b text-black">

//                   <td className="py-2">{u.email}</td>

//                   <td>{u.companyName}</td>

//                   <td>{u.role}</td>

//                   <td>{u.approved ? "Yes" : "No"}</td>

//                   <td className="flex gap-2 py-2">

//                     <ApproveButton
//                       userId={u.id}
//                       approved={u.approved}
//                     />

//                     <DeleteUserButton id={u.id} />

//                   </td>

//                 </tr>

//               ))}

//             </tbody>

//           </table>

//         </div>

//         {/* CONFIRMATIONS */}
//         <div className="bg-white rounded-lg shadow p-6">

//           <h2 className="text-xl font-bold mb-4 text-red-600">
//             Recent Price Confirmations
//           </h2>

//           <table className="w-full text-sm">

//             <thead>
//               <tr className="border-b text-black">
//                 <th className="text-left py-2">Confirmation</th>
//                 <th className="text-left py-2">Total</th>
//                 <th className="text-left py-2">Date</th>
//                 <th className="text-left py-2">View</th>
//                 <th className="text-left py-2">Delete</th>
//               </tr>
//             </thead>

//             <tbody>

//               {confirmations.map((c) => (

//                 <tr key={c.id} className="border-b text-black">

//                   <td className="py-2">{c.id}</td>

//                   <td>${Number(c.totalIncGst).toLocaleString()}</td>

//                   <td>
//                     {new Date(c.createdAt).toLocaleDateString("en-AU")}
//                   </td>

//                   <td>
//                 <a
//                 href={`/pricing/confirmation/${c.id}`}
//                 target="_blank"
//                 className="text-blue-600 underline"
//                 >
//                 View
//                 </a>
//             </td>

//             <td>
//             <DeleteConfirmationButton id={c.id} />
//             </td>

//             </tr>

//             ))}

//             </tbody>

//           </table>

//         </div>

//       </div>

//     </div>
//   );
// }

//v2
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";

import { prisma } from "../../lib/prisma";
import ApproveButton from "./components/ApproveButton";
import DeleteUserButton from "./components/DeleteUserButton";
import DeleteConfirmationButton from "./components/DeleteConfirmationButton";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // ✅ NOT logged in → go login
  if (!session) {
    redirect("/login");
  }

  // ✅ logged in BUT not admin → go pricing (NOT login)
  if (session.user.role !== "admin") {
    redirect("/pricing");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const confirmations = await prisma.pricingConfirmation.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const totalUsers = await prisma.user.count();
  const totalQuotes = await prisma.pricingConfirmation.count();

  return (
    <div className="flex justify-center py-10 bg-gray-100 min-h-screen">
      <div className="w-full max-w-[1200px] space-y-10">

        {/* PAGE TITLE */}
        <h1 className="text-3xl font-bold text-red-600">
          Admin Dashboard
        </h1>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-sm text-gray-500">Total Users</h2>
            <p className="text-3xl font-bold text-black">{totalUsers}</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-sm text-gray-500">Total Quotes</h2>
            <p className="text-3xl font-bold text-black">{totalQuotes}</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-sm text-gray-500">Recent Confirmations</h2>
            <p className="text-3xl font-bold text-black">{confirmations.length}</p>
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-red-600">
            Registered Insurers
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-black">
                <th className="text-left py-2">Email</th>
                <th className="text-left py-2">Company</th>
                <th className="text-left py-2">Role</th>
                <th className="text-left py-2">Approved</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b text-black">
                  <td className="py-2">{u.email}</td>
                  <td>{u.companyName}</td>
                  <td>{u.role}</td>
                  <td>{u.approved ? "Yes" : "No"}</td>
                  <td className="flex gap-2 py-2">
                    <ApproveButton userId={u.id} approved={u.approved} />
                    <DeleteUserButton id={u.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CONFIRMATIONS */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-red-600">
            Recent Price Confirmations
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-black">
                <th className="text-left py-2">Confirmation</th>
                <th className="text-left py-2">Total</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">View</th>
                <th className="text-left py-2">Delete</th>
              </tr>
            </thead>

            <tbody>
              {confirmations.map((c) => (
                <tr key={c.id} className="border-b text-black">
                  <td className="py-2">{c.id}</td>

                  <td>${Number(c.totalIncGst).toLocaleString()}</td>

                  <td>
                    {new Date(c.createdAt).toLocaleDateString("en-AU")}
                  </td>

                  <td>
                    <a
                      href={`/pricing/confirmation/${c.id}`}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  </td>

                  <td>
                    <DeleteConfirmationButton id={c.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}