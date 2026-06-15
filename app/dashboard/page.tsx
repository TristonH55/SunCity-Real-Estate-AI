// Agent member zone: lists the logged-in agent's quotes (admins see all).
// Locked quotes link to their PricingConfirmation "job". Previous versions are in git history.
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const money = (v: number) =>
  v.toLocaleString("en-AU", { style: "currency", currency: "AUD" });

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === "admin";

  const quotes = await prisma.quote.findMany({
    where: isAdmin ? {} : { agentId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { options: { select: { totalIncGst: true } } },
  });

  // "New Message" badge for locked quotes comes from the linked
  // PricingConfirmation's notesLog (quotes themselves have no notes).
  const confIds = quotes
    .map((q) => q.confirmationId)
    .filter((x): x is string => Boolean(x));
  const confs = confIds.length
    ? await prisma.pricingConfirmation.findMany({
        where: { id: { in: confIds } },
        include: { notesLog: { orderBy: { createdAt: "desc" }, take: 1 } },
      })
    : [];
  const confMap = new Map(confs.map((c) => [c.id, c]));

  return (
    <div className="flex justify-center py-10 min-h-screen px-4">
      <div className="w-full max-w-[1100px] glass-card p-6">
        <h1 className="text-2xl heading text-gradient mb-6">
          {isAdmin ? "All Quotes" : "Your Quotes"}
        </h1>

        {quotes.length === 0 && (
          <p className="text-slate-400">
            No quotes yet.{" "}
            <a href="/pricing" className="text-sky-300 underline">
              Create one
            </a>
            .
          </p>
        )}

        {quotes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="border-b border-white/10 text-slate-300">
                  <th className="text-left py-2">Customer</th>
                  <th className="text-left py-2">Address</th>
                  <th className="text-left py-2">System</th>
                  <th className="text-left py-2">Options</th>
                  <th className="text-left py-2">From</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Quote</th>
                  <th className="text-left py-2">Job</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => {
                  const cust = (q.customerSnapshot ?? {}) as Record<
                    string,
                    string
                  >;
                  const totals = q.options.map((o) => Number(o.totalIncGst));
                  const from = totals.length ? Math.min(...totals) : 0;

                  const conf = q.confirmationId
                    ? confMap.get(q.confirmationId)
                    : null;
                  const latest = conf?.notesLog?.[0];
                  const lastViewed = (conf as any)?.lastViewedByInsurer;
                  const isUnread =
                    latest &&
                    (!lastViewed ||
                      new Date(latest.createdAt) > new Date(lastViewed));

                  return (
                    <tr
                      key={q.id}
                      className="border-b border-white/10 text-slate-200"
                    >
                      <td className="py-2">
                        {cust.firstName} {cust.lastName}
                      </td>
                      <td className="max-w-[260px] truncate" title={cust.address || ""}>
                        {cust.address || "—"}
                      </td>
                      <td>
                        {q.capacityLitres} L · {q.systemType.replace(/_/g, " ")}
                      </td>
                      <td>{q.options.length}</td>
                      <td>{money(from)}</td>
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
                      <td className="relative">
                        {q.confirmationId ? (
                          <>
                            <a
                              href={`/dashboard/jobs/${q.confirmationId}`}
                              className="text-sky-300 hover:text-sky-200 underline"
                            >
                              Open Job
                            </a>
                            {isUnread && (
                              <span className="ml-3 inline-block bg-[#25D366] text-white text-xs px-3 py-0.5 rounded-full">
                                New Message
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
