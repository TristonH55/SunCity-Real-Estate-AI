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
import Image from "next/image";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";

import { prisma } from "../../lib/prisma";
import ApproveButton from "./components/ApproveButton";
import DeleteUserButton from "./components/DeleteUserButton";
import DeleteConfirmationButton from "./components/DeleteConfirmationButton";
import AdminIcon, { type AdminIconName } from "./components/AdminIcon";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/pricing");
  }

  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Registered users tabs: Customers (default) / Agents / Admins.
  const sp = await searchParams;
  const usersParam = Array.isArray(sp.users) ? sp.users[0] : sp.users;
  const userTab = USER_TABS.some((t) => t.role === usersParam)
    ? (usersParam as UserTabRole)
    : "customer";
  const users = userTab === "all" ? allUsers : allUsers.filter((u) => u.role === userTab);
  const roleCount = (r: UserTabRole) =>
    r === "all" ? allUsers.length : allUsers.filter((u) => u.role === r).length;

  // Proposal side: all agents' and customers' quotes. Approved quotes (waiting
  // for admin to confirm) are always listed first, oldest approval first.
  const quoteInclude = {
    options: { select: { totalIncGst: true } },
    agent: { select: { email: true, companyName: true, role: true } },
  } as const;
  const [awaitingQuotes, otherQuotes] = await Promise.all([
    prisma.quote.findMany({
      where: { status: "approved" },
      orderBy: { approvedAt: "asc" },
      include: quoteInclude,
    }),
    prisma.quote.findMany({
      where: { status: { not: "approved" } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: quoteInclude,
    }),
  ]);
  const quotes = [...awaitingQuotes, ...otherQuotes];

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

        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Logo | divider | title */}
          <div className="flex items-center gap-5 md:gap-6">
            <Image
              src="/images/SunCity-Hot-Water-Logo-white-300-size.png"
              alt="SunCity Hot Water"
              width={300}
              height={200}
              priority
              className="w-[200px] md:w-[300px] h-auto"
            />
            <span aria-hidden="true" className="h-16 md:h-24 w-px bg-white/20" />
            <div>
              <h1 className="text-2xl md:text-3xl heading text-white leading-tight">
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-400 mt-1">Quote &amp; Customer Management</p>
            </div>
          </div>
          <a href="/admin/prices" className="btn-primary whitespace-nowrap">
            ⚙ Settings — Prices
          </a>
        </div>

        {/* Approved quotes waiting for admin to confirm */}
        {awaitingQuotes.length > 0 && (
          <a
            href="#all-quotes"
            className="flex items-center justify-between gap-4 flex-wrap rounded-xl border border-orange-400/50 bg-orange-500/15 px-5 py-4 hover:bg-orange-500/25 transition"
          >
            <span className="text-orange-100 font-semibold">
              🔔 {awaitingQuotes.length} quote{awaitingQuotes.length === 1 ? "" : "s"} approved — waiting
              for you to confirm
            </span>
            <span className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white">
              View
            </span>
          </a>
        )}

        {/* STATS */}
        {/* Glow stat cards (old plain version backed up; easy to revert) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard color="blue" icon="users" label="Total Users" value={totalUsers} />
          <StatCard color="red" icon="doc" label="Total Quotes" value={totalQuotes} />
          <StatCard color="orange" icon="lock" label="Locked Orders" value={totalOrders} />
          {/* Approved by homeowner/customer, waiting for admin to confirm.
              Green when 0; orange + slow pulse when something needs confirming. */}
          <StatCard
            color={awaitingQuotes.length > 0 ? "orange" : "green"}
            icon="check"
            label="Approved — Waiting to Confirm"
            value={awaitingQuotes.length}
            href="/dashboard?status=approved"
            pulse={awaitingQuotes.length > 0}
          />
        </div>

        {/* USERS */}
        <Section id="registered-users" icon="users" title="Registered Agents">
          {/* Role tabs (Customers default) */}
          <div className="flex gap-1 border-b border-white/10 mb-4">
            {USER_TABS.map((t) => {
              const on = t.role === userTab;
              return (
                <a
                  key={t.role}
                  href={t.role === "customer" ? "/admin#registered-users" : `/admin?users=${t.role}#registered-users`}
                  className={`-mb-px inline-flex items-center gap-2 rounded-t-xl border border-b-0 px-4 py-2 text-sm font-semibold transition ${
                    on
                      ? "bg-[#db231f] border-[#db231f] text-white shadow-[0_0_16px_rgba(219,35,31,0.45)]"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {t.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      on ? "bg-white/25 text-white" : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {roleCount(t.role)}
                  </span>
                </a>
              );
            })}
          </div>

          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr>
                <th className={TH}>Email</th>
                <th className={TH}>{userTab === "customer" ? "Name · Mobile" : "Company"}</th>
                <th className={TH}>Role</th>
                <th className={TH}>Approved</th>
                <th className={TH}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 px-3 text-center text-slate-400">
                    No {USER_TABS.find((t) => t.role === userTab)?.label.toLowerCase()} yet.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className={TR}>
                  <td className={TD}>
                    <span className="flex items-center gap-2.5">
                      <AdminIcon name="mail" className="text-sky-400" />
                      <span className="truncate">{u.email}</span>
                    </span>
                  </td>
                  <td className={TD}>
                    <span className="flex items-center gap-2.5">
                      <AdminIcon name="building" className="text-sky-400" />
                      {u.role === "customer" ? `${u.name ?? ""} · ${u.phone ?? ""}` : u.companyName}
                    </span>
                  </td>
                  <td className={TD}>
                    <RolePill role={u.role} />
                  </td>
                  <td className={TD}>
                    {u.approved ? (
                      <span className={`${PILL} bg-green-600/25 text-green-200 border-green-500/40`}>
                        <AdminIcon name="check" size={13} /> Yes
                      </span>
                    ) : (
                      <span className={`${PILL} bg-amber-500/20 text-amber-200 border-amber-400/40`}>
                        <AdminIcon name="clock" size={13} /> Pending
                      </span>
                    )}
                  </td>
                  <td className={TD}>
                    <span className="flex gap-2">
                      <ApproveButton userId={u.id} approved={u.approved} />
                      <DeleteUserButton id={u.id} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* QUOTES (proposal side) */}
        <Section id="all-quotes" icon="doc" title="All Quotes">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr>
                  <th className={TH}>Agent</th>
                  <th className={TH}>Customer</th>
                  <th className={TH}>System</th>
                  <th className={TH}>Options</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>View</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => {
                  const cust = (q.customerSnapshot ?? {}) as Record<
                    string,
                    string
                  >;
                  return (
                    <tr key={q.id} className={TR}>
                      <td className={TD}>
                        {q.agent?.role === "customer" ? (
                          <span className={`${PILL} bg-violet-500/20 text-violet-200 border-violet-500/40`}>
                            Customer
                          </span>
                        ) : (
                          <span className={`${PILL} bg-white/5 text-slate-200 border-white/10 max-w-[180px]`}>
                            <span className="truncate">{q.agent?.companyName || q.agent?.email || "—"}</span>
                          </span>
                        )}
                      </td>
                      <td className={TD}>
                        <span className="flex items-center gap-2.5">
                          <AdminIcon name="user" className="text-sky-400" />
                          {cust.firstName} {cust.lastName}
                        </span>
                      </td>
                      <td className={TD}>
                        <span className="flex items-center gap-2.5">
                          <SystemIcon type={q.systemType} />
                          {q.capacityLitres} L · {q.systemType.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className={TD}>{q.options.length}</td>
                      <td className={TD}>
                        {q.status === "approved" ? (
                          <a
                            href={`/quote/${q.id}`}
                            className={`${STATUS} bg-orange-500 hover:bg-orange-400 text-white shadow-[0_0_14px_rgba(251,146,60,0.55)] animate-pulse hover:animate-none`}
                          >
                            Confirm order →
                          </a>
                        ) : q.status === "locked" ? (
                          <span className={`${STATUS} bg-green-600 text-white shadow-[0_0_14px_rgba(22,163,74,0.45)]`}>
                            <AdminIcon name="check" size={14} /> Confirmed
                          </span>
                        ) : q.status === "cancelled" ? (
                          <span className={`${STATUS} bg-slate-600/70 text-slate-200`}>
                            <AdminIcon name="ban" size={14} /> Cancelled
                          </span>
                        ) : (
                          <span className={`${STATUS} bg-sky-600 text-white shadow-[0_0_14px_rgba(2,132,199,0.45)]`}>
                            <AdminIcon name="file" size={14} /> Quoted
                          </span>
                        )}
                      </td>
                      <td className={TD}>
                        <a href={`/quote/${q.id}`} className={LINK}>
                          <AdminIcon name="eye" /> View
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </Section>

        {/* CONFIRMATIONS */}
        <Section icon="lock" title="Locked Orders">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr>
                <th className={TH}>Confirmation</th>
                <th className={TH}>Total</th>
                <th className={TH}>Date</th>
                <th className={TH}>View</th>
                <th className={TH}>Open</th>
                <th className={TH}>Delete</th>
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
                    <tr className={TR}>
                      <td className={TD}>
                        <span className="flex items-center gap-2.5">
                          <AdminIcon name="lock" className="text-orange-400" />
                          <span className="font-mono text-xs text-slate-300">{c.id}</span>
                        </span>
                      </td>

                      <td className={`${TD} font-bold text-white`}>
                        ${Number(c.totalIncGst).toLocaleString()}
                      </td>

                      <td className={TD}>
                        {new Date(c.createdAt).toLocaleDateString("en-AU")}
                      </td>

                      <td className={TD}>
                        <a
                          href={`/pricing/confirmation/${c.id}`}
                          target="_blank"
                          className={LINK}
                        >
                          <AdminIcon name="file" /> View PDF
                        </a>
                      </td>

                      <td className={`${TD} relative whitespace-nowrap`}>
                        <a href={`/dashboard/jobs/${c.id}`} className={LINK}>
                          <AdminIcon name="open" /> Open Job
                        </a>

                        {/* ✅ WHATSAPP STYLE BADGE */}
                        {isUnread && (
                          <span className="ml-3 inline-block bg-[#25D366] text-white text-xs px-3 py-0.5 rounded-full">
                            New Message
                          </span>
                        )}
                      </td>

                      <td className={TD}>
                        <DeleteConfirmationButton id={c.id} />
                      </td>
                    </tr>

                    {/* ✅ MESSAGE PREVIEW + IMAGES */}
                    <tr className="bg-white/[0.02]">
                      <td colSpan={6} className="p-3 space-y-3">

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
        </Section>

        {/* Decorative red glow line */}
        <div aria-hidden="true" className="relative h-16 -mx-4 overflow-hidden pointer-events-none">
          <div className="absolute left-1/2 -translate-x-1/2 top-6 w-[140%] h-40 rounded-[50%] border-t-2 border-[#ff3b2f] shadow-[0_-6px_30px_rgba(255,59,47,0.7)]" />
        </div>

      </div>
    </div>
  );
}

// ---- Registered users tabs ----
type UserTabRole = "customer" | "agent" | "admin" | "all";
const USER_TABS: { role: UserTabRole; label: string }[] = [
  { role: "customer", label: "Customers" },
  { role: "agent", label: "Agents" },
  { role: "admin", label: "Admins" },
  { role: "all", label: "All" },
];

// ---- Shared table styling ----
const TH =
  "text-left py-3 px-3 font-semibold text-slate-200 bg-white/[0.05] first:rounded-l-lg last:rounded-r-lg whitespace-nowrap";
const TR = "border-b border-white/5 text-slate-200 transition-colors hover:bg-white/[0.04]";
const TD = "py-3 px-3 align-middle";
const PILL =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap";
const STATUS =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition";
const LINK =
  "inline-flex items-center gap-1.5 text-sky-300 hover:text-sky-200 underline underline-offset-2";

// Section card with a red glowing top edge and a round heading icon.
function Section({
  id,
  icon,
  title,
  children,
}: {
  id?: string;
  icon: AdminIconName;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="glass-card relative overflow-hidden p-6 scroll-mt-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0">
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#ff3b2f] to-transparent" />
        <div className="mx-auto h-10 w-2/3 bg-[#ff3b2f]/20 blur-2xl -mt-5" />
      </div>
      <h2 className="relative flex items-center gap-3 text-xl font-bold text-white mb-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#db231f]/20 border border-[#db231f]/40 text-[#ff5a2c] shadow-[0_0_14px_rgba(219,35,31,0.35)]">
          <AdminIcon name={icon} size={20} />
        </span>
        {title}
      </h2>
      <div className="relative overflow-x-auto">{children}</div>
    </div>
  );
}

function RolePill({ role }: { role: string }) {
  if (role === "customer")
    return (
      <span className={`${PILL} bg-violet-500/20 text-violet-200 border-violet-500/40`}>
        <AdminIcon name="user" size={13} /> Customer
      </span>
    );
  if (role === "admin")
    return (
      <span className={`${PILL} bg-amber-500/20 text-amber-200 border-amber-400/40`}>
        <AdminIcon name="crown" size={13} className="text-amber-300" /> Admin
      </span>
    );
  return (
    <span className={`${PILL} bg-sky-500/20 text-sky-200 border-sky-400/40`}>
      <AdminIcon name="building" size={13} /> Agent
    </span>
  );
}

function SystemIcon({ type }: { type: string }) {
  if (type === "electric") return <AdminIcon name="bolt" className="text-yellow-400" />;
  if (type === "heat_pump") return <AdminIcon name="fan" className="text-sky-300" />;
  if (type === "gas") return <AdminIcon name="flame" className="text-orange-400" />;
  return <AdminIcon name="sun" className="text-amber-300" />; // solar
}

//claude

// ---- Stat card (coloured glow + round icon) ----
type StatColor = "blue" | "red" | "orange" | "green";
type StatIcon = "users" | "doc" | "lock" | "check";

// Static class strings so Tailwind picks them up.
const STAT_STYLES: Record<StatColor, { card: string; circle: string; label: string }> = {
  blue: {
    card: "border-sky-400/50 bg-gradient-to-br from-sky-500/20 via-sky-500/5 to-transparent shadow-[0_0_28px_-6px_rgba(56,189,248,0.55)] hover:shadow-[0_0_38px_-4px_rgba(56,189,248,0.7)]",
    circle: "bg-sky-500 shadow-[0_0_18px_rgba(56,189,248,0.7)]",
    label: "text-sky-100",
  },
  red: {
    card: "border-red-500/50 bg-gradient-to-br from-red-600/25 via-red-600/5 to-transparent shadow-[0_0_28px_-6px_rgba(239,68,68,0.55)] hover:shadow-[0_0_38px_-4px_rgba(239,68,68,0.7)]",
    circle: "bg-[#db231f] shadow-[0_0_18px_rgba(219,35,31,0.75)]",
    label: "text-red-100",
  },
  orange: {
    card: "border-orange-400/55 bg-gradient-to-br from-orange-500/25 via-orange-500/5 to-transparent shadow-[0_0_28px_-6px_rgba(251,146,60,0.55)] hover:shadow-[0_0_38px_-4px_rgba(251,146,60,0.7)]",
    circle: "bg-orange-500 shadow-[0_0_18px_rgba(251,146,60,0.75)]",
    label: "text-orange-100",
  },
  green: {
    card: "border-emerald-400/50 bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent shadow-[0_0_28px_-6px_rgba(52,211,153,0.5)] hover:shadow-[0_0_38px_-4px_rgba(52,211,153,0.65)]",
    circle: "bg-emerald-500 shadow-[0_0_18px_rgba(52,211,153,0.7)]",
    label: "text-emerald-100",
  },
};

function StatIconSvg({ icon }: { icon: StatIcon }) {
  const p = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (icon) {
    case "users":
      return (
        <svg {...p}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "doc":
      return (
        <svg {...p}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8M8 17h5" />
        </svg>
      );
    case "lock":
      return (
        <svg {...p}>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          <circle cx="12" cy="16" r="1" />
        </svg>
      );
    case "check":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </svg>
      );
  }
}

function StatCard({
  color,
  icon,
  label,
  value,
  href,
  pulse,
}: {
  color: StatColor;
  icon: StatIcon;
  label: string;
  value: number;
  href?: string;
  pulse?: boolean;
}) {
  const s = STAT_STYLES[color];
  const inner = (
    <>
      <span
        className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white ${s.circle}`}
      >
        {pulse && (
          <span className="absolute inset-0 rounded-full bg-orange-400/60 animate-ping [animation-duration:2s]" />
        )}
        <span className="relative">
          <StatIconSvg icon={icon} />
        </span>
      </span>
      <span className="min-w-0">
        <span className={`block text-sm font-semibold leading-snug ${s.label}`}>{label}</span>
        <span className="block text-3xl font-bold text-white mt-0.5">{value}</span>
      </span>
    </>
  );
  const cls = `relative flex items-center gap-4 rounded-2xl border p-5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 ${s.card}`;
  return href ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
