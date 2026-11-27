// Agent member zone: lists the logged-in agent's quotes (admins see all).
// Locked quotes link to their PricingConfirmation "job". Previous versions are in git history.
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import AdminIcon, { type AdminIconName } from "../admin/components/AdminIcon";

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
    <div className="flex flex-col items-center py-10 min-h-screen px-4">
      {/* Logo | divider | title (same as /admin) */}
      <div className="w-full max-w-[1100px] flex items-center gap-5 md:gap-6 mb-8">
        <Image
          src="/images/SunCity-Hot-Water-Logo-white-300-size.png"
          alt="SunCity Hot Water"
          width={300}
          height={200}
          priority
          className="w-[200px] md:w-[300px] h-auto"
        />
        <span aria-hidden="true" className="h-16 md:h-24 w-px bg-white/20" />
        <h1 className="text-2xl md:text-3xl heading text-white leading-tight">
          {isAdmin ? "All Quotes Dashboard" : "Your Quotes Dashboard"}
        </h1>
      </div>

      <div className="w-full max-w-[1100px] glass-card relative overflow-hidden p-6">
        {/* Red glowing top edge */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#ff3b2f] to-transparent" />
          <div className="mx-auto h-10 w-2/3 bg-[#ff3b2f]/20 blur-2xl -mt-5" />
        </div>

        <h2 className="relative flex items-center gap-3 text-2xl heading text-white mb-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#db231f]/20 border border-[#db231f]/40 text-[#ff5a2c] shadow-[0_0_14px_rgba(219,35,31,0.35)]">
            <AdminIcon name="doc" size={20} />
          </span>
          {isAdmin ? "All Quotes" : "Your Quotes"}
        </h2>

        {admin && (
          <div className="relative space-y-4 mb-6">
            {/* Search: name, address, email or mobile (all quotes, not just this page) */}
            <form method="get" action="/dashboard" className="flex gap-2 flex-wrap">
              {admin.status && <input type="hidden" name="status" value={admin.status} />}
              <div className="relative flex-1 min-w-[220px]">
                <AdminIcon
                  name="search"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="search"
                  name="q"
                  defaultValue={admin.q}
                  placeholder="Search by name, address, email or mobile…"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-[#ff5a2c] focus:ring-2 focus:ring-[#ff5a2c]/30 focus:shadow-[0_0_18px_rgba(255,90,44,0.25)]"
                />
              </div>
              <button className="btn-primary px-5 py-2 text-sm">Search</button>
              {admin.q && (
                <a
                  href={dashHref({ status: admin.status })}
                  className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
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
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold border transition ${
                      on
                        ? "bg-[#ff5a2c] border-[#ff5a2c] text-white shadow-[0_0_16px_rgba(255,90,44,0.5)]"
                        : "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <AdminIcon name={FILTER_ICON[f.key]} size={13} />
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
          <p className="relative text-slate-400">
            No quotes yet.{" "}
            <a href="/pricing" className="text-sky-300 underline">
              Create one
            </a>
            .
          </p>
        )}

        {quotes.length > 0 && (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm min-w-[980px] table-fixed">
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[22%]" />
                <col className="w-[16%]" />
                <col className="w-[6%]" />
                <col className="w-[10%]" />
                <col className="w-[13%]" />
                <col className="w-[8%]" />
                <col className="w-[11%]" />
              </colgroup>
              <thead>
                <tr>
                  <th className={TH}>Customer</th>
                  <th className={TH}>Address</th>
                  <th className={TH}>System</th>
                  <th className={TH}>Options</th>
                  <th className={TH}>From</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Quote</th>
                  <th className={TH}>Job</th>
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
                    <tr key={q.id} className={TR}>
                      <td className={TD}>
                        <span className="flex items-center gap-2 min-w-0">
                          <AdminIcon name="user" className="text-sky-400" />
                          <span className="truncate">
                            {cust.firstName} {cust.lastName}
                          </span>
                        </span>
                      </td>
                      <td className={TD} title={cust.address || ""}>
                        <span className="flex items-center gap-2 min-w-0">
                          <AdminIcon name="pin" className="text-[#ff5a2c]" />
                          <span className="truncate">{cust.address || "—"}</span>
                        </span>
                      </td>
                      <td className={TD}>
                        <span className="flex items-center gap-2 min-w-0">
                          <SystemIcon type={q.systemType} />
                          <span className="truncate">
                            {q.capacityLitres} L · {q.systemType.replace(/_/g, " ")}
                          </span>
                        </span>
                      </td>
                      <td className={TD}>{q.options.length}</td>
                      <td className={`${TD} font-bold text-white`}>{money(from)}</td>
                      <td className={TD}>
                        <StatusPill status={q.status} />
                      </td>
                      <td className={TD}>
                        <a href={`/quote/${q.id}`} className={LINK}>
                          <AdminIcon name="eye" /> View
                        </a>
                      </td>
                      <td className={TD}>
                        {q.confirmationId ? (
                          <span className="flex flex-col items-start gap-1">
                            <a href={`/dashboard/jobs/${q.confirmationId}`} className={`${LINK} whitespace-nowrap`}>
                              <AdminIcon name="open" /> Open Job
                            </a>
                            {isUnread && (
                              <span className="inline-block bg-[#25D366] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                New Message
                              </span>
                            )}
                          </span>
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
          <div className="relative flex items-center justify-between gap-3 mt-6 text-sm">
            {admin.page > 1 ? (
              <a
                href={dashHref({ q: admin.q, status: admin.status, page: admin.page - 1 })}
                className={PAGE_BTN}
              >
                ← Previous
              </a>
            ) : (
              <span className="rounded-xl border border-white/5 px-4 py-2 text-slate-600">← Previous</span>
            )}
            <span className="rounded-full border border-[#ff5a2c]/40 bg-[#ff5a2c]/10 px-4 py-1.5 font-semibold text-white">
              Page {admin.page} of {admin.pages}
            </span>
            {admin.page < admin.pages ? (
              <a
                href={dashHref({ q: admin.q, status: admin.status, page: admin.page + 1 })}
                className={PAGE_BTN}
              >
                Next →
              </a>
            ) : (
              <span className="rounded-xl border border-white/5 px-4 py-2 text-slate-600">Next →</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Styling helpers (match /admin) ----
const TH =
  "text-left py-3 px-3 font-semibold text-slate-200 bg-white/[0.05] first:rounded-l-lg last:rounded-r-lg whitespace-nowrap";
const TR = "border-b border-white/5 text-slate-200 transition-colors hover:bg-white/[0.04]";
const TD = "py-3 px-3 align-middle";
const LINK =
  "inline-flex items-center gap-1.5 text-sky-300 hover:text-sky-200 underline underline-offset-2";
const PAGE_BTN =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-slate-200 hover:bg-white/10 hover:-translate-y-0.5 transition";

const FILTER_ICON: Record<string, AdminIconName> = {
  "": "list",
  approved: "clock",
  presented: "file",
  locked: "check",
  cancelled: "ban",
};

const STATUS_BASE =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap";

function StatusPill({ status }: { status: string }) {
  if (status === "locked")
    return (
      <span className={`${STATUS_BASE} bg-green-600 text-white shadow-[0_0_14px_rgba(22,163,74,0.45)]`}>
        <AdminIcon name="check" size={14} /> Confirmed
      </span>
    );
  if (status === "approved")
    return (
      <span className={`${STATUS_BASE} bg-orange-500 text-white shadow-[0_0_14px_rgba(251,146,60,0.55)] animate-pulse`}>
        <AdminIcon name="clock" size={14} /> Waiting
      </span>
    );
  if (status === "cancelled")
    return (
      <span className={`${STATUS_BASE} bg-slate-600/70 text-slate-200`}>
        <AdminIcon name="ban" size={14} /> Cancelled
      </span>
    );
  return (
    <span className={`${STATUS_BASE} bg-sky-600 text-white shadow-[0_0_14px_rgba(2,132,199,0.45)]`}>
      <AdminIcon name="file" size={14} /> Quoted
    </span>
  );
}

function SystemIcon({ type }: { type: string }) {
  if (type === "electric") return <AdminIcon name="bolt" className="text-yellow-400" />;
  if (type === "heat_pump") return <AdminIcon name="fan" className="text-sky-300" />;
  if (type === "gas") return <AdminIcon name="flame" className="text-orange-400" />;
  return <AdminIcon name="sun" className="text-amber-300" />; // solar
}
