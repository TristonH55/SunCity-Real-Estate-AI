// "use client";

// import Link from "next/link";
// import { Home, DollarSign, LayoutDashboard } from "lucide-react";

// export default function Navbar() {
//   return (
//     <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md z-50">
//       <div className="max-w-5xl mx-auto flex justify-around py-3">

//         <Link href="/" className="flex flex-col items-center text-gray-700">
//           <Home size={22} />
//           <span className="text-xs">Home</span>
//         </Link>

//         <Link href="/pricing" className="flex flex-col items-center text-gray-700">
//           <DollarSign size={22} />
//           <span className="text-xs">Prices</span>
//         </Link>

//         <Link href="/dashboard" className="flex flex-col items-center text-gray-700">
//           <LayoutDashboard size={22} />
//           <span className="text-xs">Dashboard</span>
//         </Link>

//       </div>
//     </nav>
//   );
// }

/////Test 2
// "use client";

// import Link from "next/link";
// import { useSession, signOut } from "next-auth/react";
// import { Home, DollarSign, LayoutDashboard, Shield, LogOut, LogIn } from "lucide-react";

// export default function Navbar() {
//   const { data: session } = useSession();

//   return (
//     <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md z-50">
//       <div className="max-w-5xl mx-auto flex justify-around py-3">

//         {/* Home */}
//         <Link href="/" className="flex flex-col items-center text-gray-700 hover:text-black">
//           <Home size={22} />
//           <span className="text-xs">Home</span>
//         </Link>

//         {/* Pricing */}
//         <Link href="/pricing" className="flex flex-col items-center text-gray-700 hover:text-black">
//           <DollarSign size={22} />
//           <span className="text-xs">Prices</span>
//         </Link>

//         {/* If logged in */}
//         {session && (
//           <>
//             <Link href="/dashboard" className="flex flex-col items-center text-gray-700 hover:text-black">
//               <LayoutDashboard size={22} />
//               <span className="text-xs">Dashboard</span>
//             </Link>

//             {session?.user?.role === "admin" && (
//   <Link
//     href="/admin"
//     className="flex flex-col items-center text-gray-700 hover:text-black"
//   >
//     <Shield size={22} />
//     <span className="text-xs">Admin</span>
//   </Link>
// )}

//             <button
//               onClick={() => signOut({ callbackUrl: "/login" })}
//               className="flex flex-col items-center text-gray-700 hover:text-black"
//             >
//               <LogOut size={22} />
//               <span className="text-xs">Logout</span>
//             </button>
//           </>
//         )}

//         {/* If NOT logged in */}
//         {!session && (
//           <Link href="/login" className="flex flex-col items-center text-gray-700 hover:text-black">
//             <LogIn size={22} />
//             <span className="text-xs">Login</span>
//           </Link>
//         )}

//       </div>
//     </nav>
//   );
// }

//v3 test only!!!
// "use client";

// import Link from "next/link";
// import { useSession, signOut } from "next-auth/react";
// import { usePathname } from "next/navigation";
// import {
//   Home,
//   DollarSign,
//   LayoutDashboard,
//   Shield,
//   LogOut,
//   LogIn,
// } from "lucide-react";

// export default function Navbar() {
//   const { data: session } = useSession();
//   const pathname = usePathname();

//   const active = "text-green-600";
//   const inactive = "text-gray-700 hover:text-black";

//   return (
//     <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md z-50">
//       <div className="max-w-5xl mx-auto flex justify-around py-3">

//         {/* HOME */}
//         <Link
//           href="/"
//           className={`flex flex-col items-center ${
//             pathname === "/" ? active : inactive
//           }`}
//         >
//           <Home size={22} />
//           <span className="text-xs">Home</span>
//         </Link>

//         {/* PRICING */}
//         <Link
//           href="/pricing"
//           className={`flex flex-col items-center ${
//             pathname.startsWith("/pricing") ? active : inactive
//           }`}
//         >
//           <DollarSign size={22} />
//           <span className="text-xs">Prices</span>
//         </Link>

//         {/* DASHBOARD */}
//         {session && (
//           <Link
//             href="/dashboard"
//             className={`flex flex-col items-center ${
//               pathname.startsWith("/dashboard") ? active : inactive
//             }`}
//           >
//             <LayoutDashboard size={22} />
//             <span className="text-xs">Dashboard</span>
//           </Link>
//         )}

//         {/* ADMIN (admin only) */}
//         {session?.user?.role === "admin" && (
//           <Link
//             href="/admin"
//             className={`flex flex-col items-center ${
//               pathname.startsWith("/admin") ? active : inactive
//             }`}
//           >
//             <Shield size={22} />
//             <span className="text-xs">Admin</span>
//           </Link>
//         )}

//         {/* LOGIN / LOGOUT */}
//         {!session ? (
//           <Link
//             href="/login"
//             className={`flex flex-col items-center ${
//               pathname === "/login" ? active : inactive
//             }`}
//           >
//             <LogIn size={22} />
//             <span className="text-xs">Login</span>
//           </Link>
//         ) : (
//           <button
//             onClick={() => 
//               signOut({ 
//                 callbackUrl: "/login", 
//               })}
//             className="flex flex-col items-center text-gray-700 hover:text-black"
//           >
//             <LogOut size={22} />
//             <span className="text-xs">Logout</span>
//           </button>
//         )}
//       </div>
//     </nav>
//   );
// }

//v4 test
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Home,
  DollarSign,
  LayoutDashboard,
  Shield,
  LogOut,
  LogIn,
} from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // 🔥 DEBUG LOGS
  console.log("NAV STATUS:", status);
  console.log("NAV SESSION:", session);

  // ⛔ WAIT until session is ready
  if (status === "loading") {
    return null; // or a loader if you want
  }

  const active = "text-green-600";
  const inactive = "text-gray-700 hover:text-black";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md z-50">
      <div className="max-w-5xl mx-auto flex justify-around py-3">

        <Link href="/" className={`flex flex-col items-center ${pathname === "/" ? active : inactive}`}>
          <Home size={22} />
          <span className="text-xs">Home</span>
        </Link>

        <Link href="/pricing" className={`flex flex-col items-center ${pathname.startsWith("/pricing") ? active : inactive}`}>
          <DollarSign size={22} />
          <span className="text-xs">Prices</span>
        </Link>

        {session && (
          <Link href="/dashboard" className={`flex flex-col items-center ${pathname.startsWith("/dashboard") ? active : inactive}`}>
            <LayoutDashboard size={22} />
            <span className="text-xs">Dashboard</span>
          </Link>
        )}

        {session?.user?.role === "admin" && (
          <Link href="/admin" className={`flex flex-col items-center ${pathname.startsWith("/admin") ? active : inactive}`}>
            <Shield size={22} />
            <span className="text-xs">Admin</span>
          </Link>
        )}

        {!session ? (
          <Link href="/login" className={`flex flex-col items-center ${pathname === "/login" ? active : inactive}`}>
            <LogIn size={22} />
            <span className="text-xs">Login</span>
          </Link>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex flex-col items-center text-gray-700 hover:text-black"
          >
            <LogOut size={22} />
            <span className="text-xs">Logout</span>
          </button>
        )}

      </div>
    </nav>
  );
}