// Agent member zone: lists the logged-in agent's quotes (admins see all).
// Locked quotes link to their PricingConfirmation "job". Previous versions are in git history.
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

const money = (v: number) =>
  v.toLocaleString("en-AU", { style: "currency", currency: "AUD" });

const PAGE_SIZE = 30;

const STATUS_FILTERS = [
  { key: "", label: "All" },
  { key: "approved", label: "Waiting to confirm" },
  { key: "presented", label: "Quoted" },
  { key: "locked", label: "Confirmed" },
  { key: "cancelled", label: "Cancelled" },
] as const;
type StatusKey = "presented" | "approved" | "locked" | "cancelled";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

// Admin list: search (name / address / email / mobile) + status filter, 30 per page.
async function adminQuotes(sp: Record<string, string | string[] | undefined>) {
  const q = one(sp.q).trim().slice(0, 100);
  const statusRaw = one(sp.status);
  const status = STATUS_FILTERS.some((f) => f.key && f.key === statusRaw)
    ? (statusRaw as StatusKey)
    : "";
  const requestedPage = Math.max(1, parseInt(one(sp.page), 10) || 1);
  const include = { options: { select: { totalIncGst: true } } } as const;

  let ids: string[] | null = null;
  if (q) {
    // Customer details live in the customerSnapshot JSON, so search it with SQL.
    const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    let digits = q.replace(/\D/g, "");
    if (digits.startsWith("61") && digits.length >= 11) digits = "0" + digits.slice(2);
    const phoneMatch =
      digits.length >= 4
        ? Prisma.sql`OR regexp_replace(coalesce("customerSnapshot"->>'phone', ''), '\\D', '', 'g') LIKE ${`%${digits}%`}`
        : Prisma.empty;
    const statusMatch = status ? Prisma.sql`AND "status"::text = ${status}` : Prisma.empty;
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "Quote"
      WHERE (
        coalesce("customerSnapshot"->>'address', '') ILIKE ${like}
        OR (coalesce("customerSnapshot"->>'firstName', '') || ' ' || coalesce("customerSnapshot"->>'lastName', '')) ILIKE ${like}
        OR coalesce("customerSnapshot"->>'email', '') ILIKE ${like}
        OR coalesce("customerSnapshot"->>'phone', '') ILIKE ${like}
        ${phoneMatch}
      )
      ${statusMatch}
      ORDER BY "createdAt" DESC`;
    ids = rows.map((r) => r.id);
  }

  const where = {
    ...(ids ? { id: { in: ids } } : {}),
    ...(status ? { status } : {}),
  };
  const total = ids ? ids.length : await prisma.quote.count({ where });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, pages);
  const quotes = await prisma.quote.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include,
  });

  return { quotes, q, status, page, pages, total };
}

// Builds a /dashboard link keeping the current search/filter.
function dashHref(params: { q?: string; status?: string; page?: number }) {
  const u = new URLSearchParams();
  if (params.q) u.set("q", params.q);
  if (params.status) u.set("status", params.status);
  if (params.page && params.page > 1) u.set("page", String(params.page));
  const s = u.toString();
  return s ? `/dashboard?${s}` : "/dashboard";
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === "admin";

  // Admins: full list, 30 per page, with search + status filter.
  // Agents: unchanged (their newest 50).
  const sp = await searchParams;
  const admin = isAdmin ? await adminQuotes(sp) : null;
  const quotes = admin
    ? admin.quotes
    : await prisma.quote.findMany({
        where: { agentId: session.user.id },
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

        {admin && (
          <div className="space-y-4 mb-6">
            {/* Search: name, address, email or mobile (all quotes, not just this page) */}
            <form method="get" action="/dashboard" className="flex gap-2 flex-wrap">
              {admin.status && <input type="hidden" name="status" value={admin.status} />}
              <input
                type="search"
                name="q"
                defaultValue={admin.q}
                placeholder="Search by name, address, email or mobile…"
                className="flex-1 min-w-[220px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:border-[#ff5a2c] focus:ring-2 focus:ring-[#ff5a2c]/30"
              />
              <button className="btn-primary px-5 py-2 text-sm">Search</button>
              {admin.q && (
                <a
                  href={dashHref({ status: admin.status })}
                  className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                >
                  ✕ Clear
                </a>
              )}
            </form>

            {/* Status filter */}
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((f) => {
                const on = admin.status === f.key;
                return (
                  <a
                    key={f.key || "all"}
                    href={dashHref({ q: admin.q, status: f.key })}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition ${
                      on
                        ? "bg-[#ff5a2c] border-[#ff5a2c] text-white"
                        : "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {f.label}
                  </a>
                );
              })}
            </div>

            <p className="text-xs text-slate-400">
              {admin.total === 0
                ? "No quotes found."
                : `Showing ${(admin.page - 1) * PAGE_SIZE + 1}–${Math.min(
                    admin.page * PAGE_SIZE,
                    admin.total
                  )} of ${admin.total} quote${admin.total === 1 ? "" : "s"}`}
              {admin.q ? ` matching “${admin.q}”` : ""}
            </p>
          </div>
        )}

        {quotes.length === 0 && !admin && (
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
                              : q.status === "cancelled"
                              ? "text-slate-400"
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

        {/* Pagination (admin) */}
        {admin && admin.pages > 1 && (
          <div className="flex items-center justify-between gap-3 mt-6 text-sm">
            {admin.page > 1 ? (
              <a
                href={dashHref({ q: admin.q, status: admin.status, page: admin.page - 1 })}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-slate-200 hover:bg-white/10"
              >
                ← Previous
              </a>
            ) : (
              <span className="rounded-lg border border-white/5 px-4 py-2 text-slate-600">← Previous</span>
            )}
            <span className="text-slate-300">
              Page {admin.page} of {admin.pages}
            </span>
            {admin.page < admin.pages ? (
              <a
                href={dashHref({ q: admin.q, status: admin.status, page: admin.page + 1 })}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-slate-200 hover:bg-white/10"
              >
                Next →
              </a>
            ) : (
              <span className="rounded-lg border border-white/5 px-4 py-2 text-slate-600">Next →</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
