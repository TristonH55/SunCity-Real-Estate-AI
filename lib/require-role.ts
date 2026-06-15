// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { redirect } from "next/navigation";

// export async function requireRole(role: "admin" | "agent") {
//   const session = await getServerSession(authOptions);

//   // Not logged in
//   if (!session?.user) {
//     redirect("/login");
//   }

//   // Logged in but wrong role
//   if (session.user.role !== role) {
//     redirect("/login");
//   }

//   return session;
// }

///V2
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";
import { redirect } from "next/navigation";

export async function requireRole(role: "admin" | "agent") {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // admins can access everything
  if (session.user.role === "admin") {
    return session;
  }

  if (session.user.role !== role) {
    redirect("/login");
  }

  return session;
}