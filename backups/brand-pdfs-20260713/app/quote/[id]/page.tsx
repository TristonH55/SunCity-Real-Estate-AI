export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import LockQuote from "./LockQuote";
import HomeownerCard from "./HomeownerCard";

const money = (v: number) =>
  v.toLocaleString("en-AU", { style: "currency", currency: "AUD" });

export default async function QuoteViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      options: {
        include: {
          system: {
            select: {
              brand: true,
              model: true,
              capacityLitres: true,
              warrantyPrimaryYears: true,
              warrantySecondaryYears: true,
            },
          },
        },
      },
    },
  });

  if (!quote) notFound();

  // Per-agent isolation: only the owning agent (or an admin) may view.
  const isOwner = quote.agentId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) notFound();

  const customer = (quote.customerSnapshot ?? {}) as Record<string, string>;
  const snapshot = (quote.customerSnapshot ?? {}) as Record<string, any>;
  const lineItems = Array.isArray(snapshot.lineItems)
    ? (snapshot.lineItems as { code: string; label: string; amount: number }[])
    : [];
  const requiresSiteVisit = !!snapshot.requiresSiteVisit;
  const disclaimers = Array.isArray(snapshot.disclaimers)
    ? (snapshot.disclaimers as string[])
    : [];
  const options = [...quote.options].sort(
    (a, b) => Number(a.totalIncGst) - Number(b.totalIncGst)
  );

  // Names of the agent's selected (paid) extras — for the homeowner summary card.
  const extras = quote.extraIds.length
    ? await prisma.extra.findMany({
        where: { id: { in: quote.extraIds } },
        select: { name: true },
      })
    : [];

  return (
    <div className="min-h-screen text-white px-6 md:px-8 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-2">Your Quote</h1>
          <p className="text-slate-400">
            {customer.firstName} {customer.lastName} ·{" "}
            {snapshot.sizeBand ?? `${quote.capacityLitres} L`} ·{" "}
            {quote.systemType.replace(/_/g, " ")} ·{" "}
            <span className="uppercase">{quote.status}</span>
          </p>
        </div>
        <a
          href={`/api/quote/${quote.id}/pdf`}
          className="btn-primary whitespace-nowrap"
        >
          Download PDF
        </a>
      </div>

      <HomeownerCard
        quoteId={quote.id}
        name={`${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim()}
        address={customer.address ?? ""}
        phone={customer.phone ?? ""}
        email={customer.email ?? ""}
      />

      {requiresSiteVisit && (
        <div className="mb-5 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-200">
          ⚠ <strong>Internal relocation</strong> — final price is subject to a site visit (running
          pipes/electrical through walls is assessed on site, and may not be feasible). The options
          below cover the system and standard items only; SunCity will arrange a site visit.
        </div>
      )}

      {disclaimers.length > 0 && (
        <div className="mb-5 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-200">
          <p className="font-semibold mb-1">Please note</p>
          <ul className="list-disc list-inside space-y-1">
            {disclaimers.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {options.map((o) => (
          <div key={o.id} className="glass-card p-5 space-y-2">
            <h2 className="text-lg font-semibold text-[#ff5a2c]">
              {o.system.brand}
            </h2>
            <p className="text-sm text-slate-300">{o.system.model}</p>
            <p className="text-sm text-slate-400">
              {o.system.capacityLitres} L · warranty{" "}
              {o.system.warrantyPrimaryYears}
              {o.system.warrantySecondaryYears
                ? ` + ${o.system.warrantySecondaryYears}`
                : ""}{" "}
              yrs
            </p>

            <div className="border-t border-white/10 pt-3 mt-3 space-y-1 text-sm text-slate-200">
              <div className="flex justify-between">
                <span>Base (ex GST)</span>
                <span>{money(Number(o.basePriceExGst))}</span>
              </div>
              <div className="flex justify-between">
                <span>Included (ex GST)</span>
                <span>{money(Number(o.extrasTotalExGst))}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal (ex GST)</span>
                <span>{money(Number(o.subtotalExGst))}</span>
              </div>
              <div className="flex justify-between">
                <span>GST</span>
                <span>{money(Number(o.gst))}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-white/10 pt-2">
                <span>Total (inc GST)</span>
                <span className="text-gradient">
                  {money(Number(o.totalIncGst))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Homeowner verification: install/property answers + selected extras */}
      <div className="glass-card p-5 mt-5">
        <h2 className="text-lg font-semibold text-[#ff5a2c] mb-4">
          Installation &amp; What&apos;s Included
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Property type</p>
            <p className="text-white">{customer.propertyType || "—"}</p>
          </div>
          <div>
            <p className="text-slate-400">Existing system</p>
            <p className="text-white">{customer.existingSystemType || "—"}</p>
          </div>
          <div>
            <p className="text-slate-400">System location</p>
            <p className="text-white">{customer.systemLocation || "—"}</p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-4 pt-4">
          <p className="text-slate-400 text-sm mb-2">What&apos;s included</p>
          {extras.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
              {extras.map((e, i) => (
                <li key={i}>{e.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">None selected</p>
          )}
        </div>

        {lineItems.length > 0 && (
          <div className="border-t border-white/10 mt-4 pt-4">
            <p className="text-slate-400 text-sm mb-2">Relocation</p>
            <ul className="text-sm text-slate-200 space-y-1">
              {lineItems.map((li, i) => (
                <li key={i} className="flex justify-between">
                  <span>{li.label}</span>
                  <span>{li.amount > 0 ? money(li.amount) : "Site visit"}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <LockQuote
        quoteId={quote.id}
        status={quote.status}
        selectedOptionId={quote.selectedOptionId}
        confirmationId={quote.confirmationId}
        approvedByName={quote.approvedByName}
        approvedAt={quote.approvedAt ? quote.approvedAt.toISOString() : null}
        options={options.map((o) => ({
          id: o.id,
          brand: o.system.brand,
          total: Number(o.totalIncGst),
        }))}
      />
    </div>
  );
}
