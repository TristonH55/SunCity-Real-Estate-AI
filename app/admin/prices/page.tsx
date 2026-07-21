import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getGstMode } from "@/lib/gst";
import PriceEditor from "./PriceEditor";
import GstModeToggle from "./GstModeToggle";

export const dynamic = "force-dynamic";

export default async function AdminPricesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/pricing");

  const gstMode = await getGstMode();

  return (
    <div className="flex justify-center py-10 min-h-screen px-4">
      <div className="w-full max-w-[1400px] space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl heading text-gradient">Price Settings</h1>
          <div className="flex items-center gap-4">
            <a
              href="/admin/prices/hidden"
              className="text-slate-300 hover:text-white underline text-sm whitespace-nowrap"
            >
              Hidden products
            </a>
            <a
              href="/admin"
              className="text-sky-300 hover:text-sky-200 underline text-sm whitespace-nowrap"
            >
              ← Back to Admin
            </a>
          </div>
        </div>
        <p className="text-slate-400 text-sm">
          Pick a region and system type, edit the prices, then Save. Prices are{" "}
          {gstMode === "inclusive" ? "GST-inclusive" : "ex-GST"}.
        </p>
        <GstModeToggle initialMode={gstMode} />
        <PriceEditor gstMode={gstMode} />
      </div>
    </div>
  );
}
