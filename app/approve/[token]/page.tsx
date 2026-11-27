export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { verifyQuoteApprovalToken } from "@/lib/quote-approval-token";
import ApproveForm from "./ApproveForm";
import { OFFICE_PHONE } from "@/lib/customer";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-white px-6 py-10 max-w-3xl mx-auto">
      {children}
    </div>
  );
}

export default async function ApprovePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const quoteId = verifyQuoteApprovalToken(token);

  if (!quoteId) {
    return (
      <Shell>
        <div className="glass-card p-6">
          <h1 className="text-xl font-bold mb-2">Link invalid or expired</h1>
          <p className="text-slate-400">
            This approval link is no longer valid. Please ask your agent to
            re-send your quote, or call SunCity on {OFFICE_PHONE}.
          </p>
        </div>
      </Shell>
    );
  }

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      agent: { select: { role: true } },
      options: {
        include: {
          system: {
            select: {
              brand: true,
              model: true,
              capacityLitres: true,
              warrantyPrimaryYears: true,
              warrantySecondaryYears: true,
              brochureUrl: true,
            },
          },
        },
      },
    },
  });

  if (!quote) {
    return (
      <Shell>
        <div className="glass-card p-6">
          <h1 className="text-xl font-bold mb-2">Quote not found</h1>
          <p className="text-slate-400">Please ask your agent to re-send your quote, or call SunCity on {OFFICE_PHONE}.</p>
        </div>
      </Shell>
    );
  }

  const customer = (quote.customerSnapshot ?? {}) as Record<string, string>;
  // Public customer quotes: SunCity (not an agent) finalises.
  const isCustomerQuote = quote.agent.role === "customer";
  const who = isCustomerQuote ? `call SunCity on ${OFFICE_PHONE}` : "contact your agent";
  const finaliser = isCustomerQuote ? "SunCity" : "Your agent";

  if (quote.status === "cancelled") {
    return (
      <Shell>
        <div className="glass-card p-6">
          <h1 className="text-xl font-bold mb-2">This quote has been cancelled</h1>
          <p className="text-slate-400">
            If you&apos;d like to go ahead after all, please {who}.
          </p>
        </div>
      </Shell>
    );
  }

  if (quote.status === "locked") {
    return (
      <Shell>
        <div className="glass-card p-6">
          <h1 className="text-xl font-bold mb-2 text-green-300">
            Already confirmed ✓
          </h1>
          <p className="text-slate-400">
            This quote has already been confirmed. If you need to make a change,
            please {who}.
          </p>
        </div>
      </Shell>
    );
  }

  const options = [...quote.options]
    .sort((a, b) => Number(a.totalIncGst) - Number(b.totalIncGst))
    .map((o) => ({
      id: o.id,
      brand: o.system.brand,
      model: o.system.model,
      capacityLitres: o.system.capacityLitres,
      warrantyPrimaryYears: o.system.warrantyPrimaryYears,
      warrantySecondaryYears: o.system.warrantySecondaryYears,
      brochureUrl: o.system.brochureUrl,
      total: Number(o.totalIncGst),
    }));

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Approve your hot water quote</h1>
        <p className="text-slate-400">
          Hi {customer.firstName || "there"} — choose your preferred system below
          and approve it. {finaliser} will then finalise the order.
        </p>
      </div>
      <ApproveForm
        token={token}
        options={options}
        selectedOptionId={quote.selectedOptionId}
        alreadyApproved={quote.status === "approved"}
        approvedByName={quote.approvedByName}
        address={customer.address ?? ""}
        isCustomerQuote={isCustomerQuote}
      />
    </Shell>
  );
}
