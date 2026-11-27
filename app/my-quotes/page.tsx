// Public customer dashboard: their quotes + their details.
export const dynamic = "force-dynamic";

import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { displayAuMobile, OFFICE_PHONE, splitName } from "@/lib/customer";
import MyDetails from "./MyDetails";

const money = (v: number) =>
  v.toLocaleString("en-AU", { style: "currency", currency: "AUD" });

const STATUS: Record<string, { label: string; cls: string }> = {
  presented: { label: "Quoted", cls: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  approved: { label: "Approved", cls: "bg-amber-500/15 text-amber-200 border-amber-500/30" },
  locked: { label: "Confirmed", cls: "bg-green-500/15 text-green-300 border-green-500/30" },
  cancelled: { label: "Cancelled", cls: "bg-slate-500/15 text-slate-300 border-slate-500/30" },
};

export default async function MyQuotesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?customer=1");
  if (session.user.role !== "customer") redirect("/dashboard");

  const [user, quotes] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true },
    }),
    prisma.quote.findMany({
      where: { agentId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { options: { select: { totalIncGst: true } } },
    }),
  ]);
  if (!user) redirect("/login?customer=1");

  return (
    <div className="min-h-screen text-white px-6 md:px-8 py-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">My quotes</h1>
          <p className="text-slate-400 text-sm">Hi {splitName(user.name).firstName}, here are your quotes.</p>
        </div>
        <Link href="/pricing" className="btn-primary whitespace-nowrap">
          Get a new quote
        </Link>
      </div>

      <div className="glass-card p-5">
        {quotes.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No quotes yet.{" "}
            <Link href="/pricing" className="text-[#ff5a2c] hover:underline">
              Get your first quote
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-white/10">
            {quotes.map((q) => {
              const snap = (q.customerSnapshot ?? {}) as Record<string, any>;
              const totals = q.options.map((o) => Number(o.totalIncGst));
              const from = totals.length ? Math.min(...totals) : null;
              const st = STATUS[q.status] ?? STATUS.presented;
              return (
                <li
                  key={q.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{snap.address || "—"}</p>
                    <p className="text-xs text-slate-400">
                      {q.createdAt.toLocaleDateString("en-AU")} ·{" "}
                      {snap.sizeBand ?? `${q.capacityLitres} L`} {q.systemType.replace(/_/g, " ")}
                      {from != null ? ` · from ${money(from)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-semibold border rounded-full px-3 py-1 ${st.cls}`}>
                      {st.label}
                    </span>
                    {/* Not yet approved → green "View & Approve" (approve is on the quote page). */}
                    <Link
                      href={`/quote/${q.id}`}
                      className={
                        q.status === "presented"
                          ? "rounded-xl px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-500 transition"
                          : "rounded-xl px-4 py-2 text-sm font-semibold text-white border border-white/20 bg-white/5 hover:bg-white/10 transition"
                      }
                    >
                      {q.status === "presented" ? "View & Approve" : "View"}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <MyDetails
        initial={{
          ...splitName(user.name),
          email: user.email,
          phone: displayAuMobile(user.phone),
        }}
      />

      <p className="text-xs text-white text-center">Need help? Call us on {OFFICE_PHONE}.</p>
    </div>
  );
}
