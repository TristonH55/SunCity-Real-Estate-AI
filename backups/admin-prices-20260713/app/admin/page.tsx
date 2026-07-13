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
//             <p className="text-3xl font-bold text-white">{totalUsers}</p>
//           </div>

//           <div className="bg-white shadow rounded-lg p-6">
//             <h2 className="text-sm text-gray-500">Total Quotes</h2>
//             <p className="text-3xl font-bold text-white">{totalQuotes}</p>
//           </div>

//           <div className="bg-white shadow rounded-lg p-6">
//             <h2 className="text-sm text-gray-500">Recent Confirmations</h2>
//             <p className="text-3xl font-bold text-white">{confirmations.length}</p>
//           </div>

//         </div>

//         {/* USERS TABLE */}
//         <div className="bg-white rounded-lg shadow p-6">

//           <h2 className="text-xl font-bold mb-4 text-red-600">
//             Registered Insurers
//           </h2>

//           <table className="w-full text-sm">

//             <thead>
//               <tr className="border-b border-white/10 text-slate-200">
//                 <th className="text-left py-2">Email</th>
//                 <th className="text-left py-2">Company</th>
//                 <th className="text-left py-2">Role</th>
//                 <th className="text-left py-2">Approved</th>
//                 <th className="text-left py-2">Actions</th>
//               </tr>
//             </thead>

//             <tbody>

//               {users.map((u) => (

//                 <tr key={u.id} className="border-b border-white/10 text-slate-200">

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
//               <tr className="border-b border-white/10 text-slate-200">
//                 <th className="text-left py-2">Confirmation</th>
//                 <th className="text-left py-2">Total</th>
//                 <th className="text-left py-2">Date</th>
//                 <th className="text-left py-2">View</th>
//                 <th className="text-left py-2">Delete</th>
//               </tr>
//             </thead>

//             <tbody>

//               {confirmations.map((c) => (

//                 <tr key={c.id} className="border-b border-white/10 text-slate-200">

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

//v2 WORKING WITH PDF
// import { getServerSession } from "next-auth";
// import { redirect } from "next/navigation";
// import { authOptions } from "../../lib/auth";

// import { prisma } from "../../lib/prisma";
// import ApproveButton from "./components/ApproveButton";
// import DeleteUserButton from "./components/DeleteUserButton";
// import DeleteConfirmationButton from "./components/DeleteConfirmationButton";

// export default async function AdminPage() {
//   const session = await getServerSession(authOptions);

//   // ✅ NOT logged in → go login
//   if (!session) {
//     redirect("/login");
//   }

//   // ✅ logged in BUT not admin → go pricing (NOT login)
//   if (session.user.role !== "admin") {
//     redirect("/pricing");
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
//             <p className="text-3xl font-bold text-white">{totalUsers}</p>
//           </div>

//           <div className="bg-white shadow rounded-lg p-6">
//             <h2 className="text-sm text-gray-500">Total Quotes</h2>
//             <p className="text-3xl font-bold text-white">{totalQuotes}</p>
//           </div>

//           <div className="bg-white shadow rounded-lg p-6">
//             <h2 className="text-sm text-gray-500">Recent Confirmations</h2>
//             <p className="text-3xl font-bold text-white">{confirmations.length}</p>
//           </div>
//         </div>

//         {/* USERS TABLE */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="text-xl font-bold mb-4 text-red-600">
//             Registered Insurers
//           </h2>

//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-white/10 text-slate-200">
//                 <th className="text-left py-2">Email</th>
//                 <th className="text-left py-2">Company</th>
//                 <th className="text-left py-2">Role</th>
//                 <th className="text-left py-2">Approved</th>
//                 <th className="text-left py-2">Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {users.map((u) => (
//                 <tr key={u.id} className="border-b border-white/10 text-slate-200">
//                   <td className="py-2">{u.email}</td>
//                   <td>{u.companyName}</td>
//                   <td>{u.role}</td>
//                   <td>{u.approved ? "Yes" : "No"}</td>
//                   <td className="flex gap-2 py-2">
//                     <ApproveButton userId={u.id} approved={u.approved} />
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
//               <tr className="border-b border-white/10 text-slate-200">
//                 <th className="text-left py-2">Confirmation</th>
//                 <th className="text-left py-2">Total</th>
//                 <th className="text-left py-2">Date</th>
//                 <th className="text-left py-2">View</th>
//                 <th className="text-left py-2">Delete</th>
//               </tr>
//             </thead>

//             <tbody>
//               {confirmations.map((c) => (
//                 <tr key={c.id} className="border-b border-white/10 text-slate-200">
//                   <td className="py-2">{c.id}</td>

//                   <td>${Number(c.totalIncGst).toLocaleString()}</td>

//                   <td>
//                     {new Date(c.createdAt).toLocaleDateString("en-AU")}
//                   </td>

//                   <td>
//                     <a
//                       href={`/pricing/confirmation/${c.id}`}
//                       target="_blank"
//                       className="text-blue-600 underline"
//                     >
//                       View
//                     </a>
//                   </td>

//                   <td>
//                     <DeleteConfirmationButton id={c.id} />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//       </div>
//     </div>
//   );
// }

///test
// import React from "react"; 
// import { getServerSession } from "next-auth";
// import { redirect } from "next/navigation";
// import { authOptions } from "../../lib/auth";

// import { prisma } from "../../lib/prisma";
// import ApproveButton from "./components/ApproveButton";
// import DeleteUserButton from "./components/DeleteUserButton";
// import DeleteConfirmationButton from "./components/DeleteConfirmationButton";

// export default async function AdminPage() {
//   const session = await getServerSession(authOptions);

//   // ✅ NOT logged in → go login
//   if (!session) {
//     redirect("/login");
//   }

//   // ✅ logged in BUT not admin → go pricing
//   if (session.user.role !== "admin") {
//     redirect("/pricing");
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
//             <p className="text-3xl font-bold text-white">{totalUsers}</p>
//           </div>

//           <div className="bg-white shadow rounded-lg p-6">
//             <h2 className="text-sm text-gray-500">Total Quotes</h2>
//             <p className="text-3xl font-bold text-white">{totalQuotes}</p>
//           </div>

//           <div className="bg-white shadow rounded-lg p-6">
//             <h2 className="text-sm text-gray-500">Recent Confirmations</h2>
//             <p className="text-3xl font-bold text-white">{confirmations.length}</p>
//           </div>
//         </div>

//         {/* USERS TABLE */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="text-xl font-bold mb-4 text-red-600">
//             Registered Insurers
//           </h2>

//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-white/10 text-slate-200">
//                 <th className="text-left py-2">Email</th>
//                 <th className="text-left py-2">Company</th>
//                 <th className="text-left py-2">Role</th>
//                 <th className="text-left py-2">Approved</th>
//                 <th className="text-left py-2">Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {users.map((u) => (
//                 <tr key={u.id} className="border-b border-white/10 text-slate-200">
//                   <td className="py-2">{u.email}</td>
//                   <td>{u.companyName}</td>
//                   <td>{u.role}</td>
//                   <td>{u.approved ? "Yes" : "No"}</td>
//                   <td className="flex gap-2 py-2">
//                     <ApproveButton userId={u.id} approved={u.approved} />
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
//               <tr className="border-b border-white/10 text-slate-200">
//                 <th className="text-left py-2">Confirmation</th>
//                 <th className="text-left py-2">Total</th>
//                 <th className="text-left py-2">Date</th>
//                 <th className="text-left py-2">Open</th>
//                 <th className="text-left py-2">Delete</th>
//               </tr>
//             </thead>

//             <tbody>
//               {confirmations.map((c) => (
//                 <React.Fragment key={c.id}>

//                   {/* MAIN ROW (UNCHANGED) */}
//                   <tr className="border-b border-white/10 text-slate-200">
//                     <td className="py-2">{c.id}</td>

//                     <td>${Number(c.totalIncGst).toLocaleString()}</td>

//                     <td>
//                       {new Date(c.createdAt).toLocaleDateString("en-AU")}
//                     </td>

//                     <td>
//                       <a
//                         href={`/dashboard/jobs/${c.id}`} 
//                         className="text-blue-600 underline"
//                       >
//                         Open Job
//                       </a>
//                     </td>

//                     <td>
//                       <DeleteConfirmationButton id={c.id} />
//                     </td>
//                   </tr>

//                   {/* NEW DETAILS ROW will show the Attached IMAGES */}
//                   <tr className="bg-gray-50">
//                     <td colSpan={5} className="p-4">

//                       {/* {c.notes && (
//                         <div className="mb-3">
//                           <strong>Notes:</strong> {c.notes}
//                         </div>
//                       )} */}

//                       {c.images?.length > 0 && (
//                         <div className="flex gap-3 flex-wrap">
//                           {c.images.map((img) => (
//                             <img
//                               key={img}
//                               src={img}
//                               className="w-32 h-32 object-cover rounded border"
//                             />
//                           ))}
//                         </div>
//                       )}

//                     </td>
//                   </tr>

//                 </React.Fragment>
//               ))}
//             </tbody>
//           </table>
//         </div>

//       </div>
//     </div>
//   );
// }

///testv1.1
// import React from "react"; 
// import { getServerSession } from "next-auth";
// import { redirect } from "next/navigation";
// import { authOptions } from "../../lib/auth";

// import { prisma } from "../../lib/prisma";
// import ApproveButton from "./components/ApproveButton";
// import DeleteUserButton from "./components/DeleteUserButton";
// import DeleteConfirmationButton from "./components/DeleteConfirmationButton";

// export default async function AdminPage() {
//   const session = await getServerSession(authOptions);

//   // ✅ NOT logged in → go login
//   if (!session) {
//     redirect("/login");
//   }

//   // ✅ logged in BUT not admin → go pricing
//   if (session.user.role !== "admin") {
//     redirect("/pricing");
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
//             <p className="text-3xl font-bold text-white">{totalUsers}</p>
//           </div>

//           <div className="bg-white shadow rounded-lg p-6">
//             <h2 className="text-sm text-gray-500">Total Quotes</h2>
//             <p className="text-3xl font-bold text-white">{totalQuotes}</p>
//           </div>

//           <div className="bg-white shadow rounded-lg p-6">
//             <h2 className="text-sm text-gray-500">Recent Confirmations</h2>
//             <p className="text-3xl font-bold text-white">{confirmations.length}</p>
//           </div>
//         </div>

//         {/* USERS TABLE */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <h2 className="text-xl font-bold mb-4 text-red-600">
//             Registered Insurers
//           </h2>

//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-white/10 text-slate-200">
//                 <th className="text-left py-2">Email</th>
//                 <th className="text-left py-2">Company</th>
//                 <th className="text-left py-2">Role</th>
//                 <th className="text-left py-2">Approved</th>
//                 <th className="text-left py-2">Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {users.map((u) => (
//                 <tr key={u.id} className="border-b border-white/10 text-slate-200">
//                   <td className="py-2">{u.email}</td>
//                   <td>{u.companyName}</td>
//                   <td>{u.role}</td>
//                   <td>{u.approved ? "Yes" : "No"}</td>
//                   <td className="flex gap-2 py-2">
//                     <ApproveButton userId={u.id} approved={u.approved} />
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
//           <thead>
//             <tr className="border-b border-white/10 text-slate-200">
//             <th className="text-left py-2">Confirmation</th>
//             <th className="text-left py-2">Total</th>
//             <th className="text-left py-2">Date</th>
//             <th className="text-left py-2">View</th>
//             <th className="text-left py-2">Open</th>
//             <th className="text-left py-2">Delete</th>
//           </tr>
//           </thead>

//             <tbody>
//               {confirmations.map((c) => (
//                 <React.Fragment key={c.id}>

//                   <tr className="border-b border-white/10 text-slate-200">
//                     <td className="py-2">{c.id}</td>

//                     <td>${Number(c.totalIncGst).toLocaleString()}</td>

//                     <td>
//                       {new Date(c.createdAt).toLocaleDateString("en-AU")}
//                     </td>

//                     {/* ✅ VIEW LINK */}
//                     <td>
//                       <a
//                         href={`/pricing/confirmation/${c.id}`}
//                         target="_blank"
//                         className="text-blue-600 underline"
//                       >
//                         View PDF
//                       </a>
//                     </td>

//                     {/* EXISTING OPEN JOB */}
//                     <td>
//                       <a
//                         href={`/dashboard/jobs/${c.id}`} 
//                         className="text-blue-600 underline"
//                       >
//                         Open Job
//                       </a>
//                     </td>

//                     <td>
//                       <DeleteConfirmationButton id={c.id} />
//                     </td>
//                   </tr>

//                   {/* DETAILS ROW (UNCHANGED) */}
//                   <tr className="bg-gray-50">
//                     <td colSpan={6} className="p-4">

//                       {c.images?.length > 0 && (
//                         <div className="flex gap-3 flex-wrap">
//                           {c.images.map((img) => (
//                             <img
//                               key={img}
//                               src={img}
//                               className="w-32 h-32 object-cover rounded border"
//                             />
//                           ))}
//                         </div>
//                       )}

//                     </td>
//                   </tr>

//                 </React.Fragment>
//               ))}
//             </tbody>
//           </table>
//         </div>

//       </div>
//     </div>
//   );
// }

/// TEST V 1.2  use last...
import React from "react"; 
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";

import { prisma } from "../../lib/prisma";
import ApproveButton from "./components/ApproveButton";
import DeleteUserButton from "./components/DeleteUserButton";
import DeleteConfirmationButton from "./components/DeleteConfirmationButton";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/pricing");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Proposal side: all agents' quotes.
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      options: { select: { totalIncGst: true } },
      agent: { select: { email: true, companyName: true } },
    },
  });

  // Order side: locked-order confirmations (+ latest message).
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

  const totalUsers = await prisma.user.count();
  const totalQuotes = await prisma.quote.count();
  const totalOrders = await prisma.pricingConfirmation.count();

  return (
    <div className="flex justify-center py-10 min-h-screen px-4">
      <div className="w-full max-w-[1200px] space-y-10">

        <h1 className="text-3xl heading text-gradient">
          Admin Dashboard
        </h1>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-sm text-slate-400">Total Users</h2>
            <p className="text-3xl font-bold text-white">{totalUsers}</p>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-sm text-slate-400">Total Quotes</h2>
            <p className="text-3xl font-bold text-white">{totalQuotes}</p>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-sm text-slate-400">Locked Orders</h2>
            <p className="text-3xl font-bold text-white">{totalOrders}</p>
          </div>
        </div>

        {/* USERS */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4 text-[#ff5a2c]">
            Registered Agents
          </h2>

          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-white/10 text-slate-200">
                <th className="text-left py-2">Email</th>
                <th className="text-left py-2">Company</th>
                <th className="text-left py-2">Role</th>
                <th className="text-left py-2">Approved</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/10 text-slate-200">
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
        </div>

        {/* QUOTES (proposal side) */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4 text-[#ff5a2c]">
            All Quotes
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-white/10 text-slate-200">
                  <th className="text-left py-2">Agent</th>
                  <th className="text-left py-2">Customer</th>
                  <th className="text-left py-2">System</th>
                  <th className="text-left py-2">Options</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">View</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => {
                  const cust = (q.customerSnapshot ?? {}) as Record<
                    string,
                    string
                  >;
                  return (
                    <tr
                      key={q.id}
                      className="border-b border-white/10 text-slate-200"
                    >
                      <td className="py-2">
                        {q.agent?.companyName || q.agent?.email || "—"}
                      </td>
                      <td>
                        {cust.firstName} {cust.lastName}
                      </td>
                      <td>
                        {q.capacityLitres} L · {q.systemType.replace(/_/g, " ")}
                      </td>
                      <td>{q.options.length}</td>
                      <td>
                        <span
                          className={
                            q.status === "locked"
                              ? "text-green-300"
                              : q.status === "approved"
                              ? "text-sky-300"
                              : "text-amber-300"
                          }
                        >
                          {q.status}
                        </span>
                      </td>
                      <td>
                        <a
                          href={`/quote/${q.id}`}
                          className="text-sky-300 hover:text-sky-200 underline"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* CONFIRMATIONS */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4 text-[#ff5a2c]">
            Locked Orders
          </h2>

          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-white/10 text-slate-200">
                <th className="text-left py-2">Confirmation</th>
                <th className="text-left py-2">Total</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">View</th>
                <th className="text-left py-2">Open</th>
                <th className="text-left py-2">Delete</th>
              </tr>
            </thead>

            <tbody>
              {confirmations.map((c) => {
                const latestMessage = c.notesLog?.[0];

                // ✅ SAFE (no TS issues)
                const lastViewed = (c as any).lastViewedByInsurer;

                const isUnread =
                  latestMessage &&
                  (!lastViewed ||
                    new Date(latestMessage.createdAt) >
                      new Date(lastViewed));

                return (
                  <React.Fragment key={c.id}>

                    {/* MAIN ROW */}
                    <tr className="border-b border-white/10 text-slate-200">
                      <td className="py-2">{c.id}</td>

                      <td>${Number(c.totalIncGst).toLocaleString()}</td>

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

                        {/* ✅ WHATSAPP STYLE BADGE */}
                        {isUnread && (
                          <span className="ml-3 inline-block bg-[#25D366] text-white text-xs px-3 py-0.5 rounded-full">
                            New Message
                          </span>
                        )}
                      </td>

                      <td>
                        <DeleteConfirmationButton id={c.id} />
                      </td>
                    </tr>

                    {/* ✅ MESSAGE PREVIEW + IMAGES */}
                    <tr className="bg-white/5">
                      <td colSpan={6} className="p-4 space-y-3">

                        {/* MESSAGE PREVIEW */}
                        {/* {latestMessage && (
                          <div className="bg-white p-3 rounded border text-sm text-black">
                            <div className="text-xs text-gray-500 mb-1">
                              Latest Message:
                            </div>
                            <div>{latestMessage.message}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(latestMessage.createdAt).toLocaleString("en-AU")}
                            </div>
                          </div>
                        )} */}

                        {/* IMAGES */}
                        {c.images?.length > 0 && (
                          <div className="flex gap-3 flex-wrap">
                            {c.images.map((img) => (
                              <img
                                key={img}
                                src={img}
                                className="w-32 h-32 object-cover rounded-lg border border-white/10"
                              />
                            ))}
                          </div>
                        )}

                      </td>
                    </tr>

                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>

      </div>
    </div>
  );
}

//claude
