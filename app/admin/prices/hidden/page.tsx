import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import HiddenProducts from "./HiddenProducts";

export const dynamic = "force-dynamic";

export default async function HiddenProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/pricing");

  return (
    <div className="flex justify-center py-10 min-h-screen px-4">
      <div className="w-full max-w-[1100px] space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl heading text-gradient">Hidden Products</h1>
          <a
            href="/admin/prices"
            className="text-sky-300 hover:text-sky-200 underline text-sm whitespace-nowrap"
          >
            ← Back to Price Settings
          </a>
        </div>
        <p className="text-slate-400 text-sm">
          Hidden products don&apos;t appear in quotes or the main price list. <strong>Restore</strong>{" "}
          brings one back; <strong>Delete</strong> removes it permanently (blocked if it was used in a
          past quote — keep it hidden instead).
        </p>
        <HiddenProducts />
      </div>
    </div>
  );
}
