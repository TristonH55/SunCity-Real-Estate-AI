export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";
import { allow, limiters } from "@/lib/ratelimit";
import { checkOrigin } from "@/lib/origin-check";
import { clientIp } from "@/lib/client-ip";
import { computeOptionPricing, getGstMode, type GstMode } from "@/lib/gst";
import {
  capacityFilterFor,
  CLEAR_APPROVAL,
  enteredExtrasTotal,
  MAX_QUOTE_OPTIONS,
  withLogEntry,
} from "@/lib/quote-adjust";

type QuoteWithOptions = NonNullable<Awaited<ReturnType<typeof loadQuote>>>;

function loadQuote(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: { options: { include: { system: { select: { brand: true, model: true } } } } },
  });
}

// The quote's entered extras, priced off its first option's current system price.
async function quoteExtras(quote: QuoteWithOptions, mode: GstMode) {
  const first = quote.options[0];
  const current = await prisma.systemPrice.findFirst({
    where: { systemId: first.systemId, region: { code: quote.regionCode } },
    select: { price: true },
  });
  const snapshot = (quote.customerSnapshot ?? {}) as Record<string, any>;
  return enteredExtrasTotal(snapshot, first, mode, current ? Number(current.price) : undefined);
}

// Systems that could replace (or join) an option: same type, size and region
// the quote was generated with, available and not already on the quote.
async function candidatePrices(quote: QuoteWithOptions, systemId?: string) {
  const region = await prisma.region.findUnique({ where: { code: quote.regionCode } });
  if (!region) return [];
  const snapshot = (quote.customerSnapshot ?? {}) as Record<string, any>;
  const onQuote = quote.options.map((o) => o.systemId);
  return prisma.systemPrice.findMany({
    where: {
      regionId: region.id,
      active: true,
      system: {
        systemType: quote.systemType,
        active: true,
        archived: false,
        ...capacityFilterFor(quote, snapshot),
        id: systemId ? { equals: systemId, notIn: onQuote } : { notIn: onQuote },
      },
    },
    include: {
      system: {
        select: {
          id: true,
          brand: true,
          model: true,
          capacityLitres: true,
          warrantyPrimaryYears: true,
          warrantySecondaryYears: true,
        },
      },
    },
  });
}

async function guard(req: NextRequest, write: boolean) {
  const { session, error } = await requireApiRole("admin");
  if (error) return { error };
  if (write) {
    const originError = checkOrigin(req);
    if (originError) return { error: originError };
    if (!(await allow(limiters.adminPrices, clientIp(req)))) {
      return { error: NextResponse.json({ error: "Too many requests" }, { status: 429 }) };
    }
  }
  return { session: session! };
}

// GET → the systems admin can pick, with the customer total each would give.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(req, false);
  if ("error" in g) return g.error;

  const { id } = await params;
  const quote = await loadQuote(id);
  if (!quote || quote.options.length === 0) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const mode = await getGstMode();
  const extras = await quoteExtras(quote, mode);
  const systems = (await candidatePrices(quote))
    .map((sp) => ({
      systemId: sp.system.id,
      brand: sp.system.brand,
      model: sp.system.model,
      capacityLitres: sp.system.capacityLitres,
      warrantyPrimaryYears: sp.system.warrantyPrimaryYears,
      warrantySecondaryYears: sp.system.warrantySecondaryYears,
      total: computeOptionPricing(Number(sp.price), extras, mode).totalIncGst,
    }))
    .sort((a, b) => a.brand.localeCompare(b.brand) || a.total - b.total);

  return NextResponse.json({
    systems,
    canAdd: quote.options.length < MAX_QUOTE_OPTIONS,
    locked: quote.status === "locked",
  });
}

// POST { systemId, optionId? } → replace that option with the system, or add it
// as a new option when optionId is left out.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(req, true);
  if ("error" in g) return g.error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const systemId = String(body?.systemId ?? "");
  const optionId = body?.optionId ? String(body.optionId) : null;

  const quote = await loadQuote(id);
  if (!quote || quote.options.length === 0) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }
  if (quote.status === "locked") {
    return NextResponse.json({ error: "This quote is locked and can't be changed." }, { status: 409 });
  }
  if (quote.status === "cancelled") {
    return NextResponse.json({ error: "This quote has been cancelled and can't be changed." }, { status: 409 });
  }

  const replacing = optionId ? quote.options.find((o) => o.id === optionId) : null;
  if (optionId && !replacing) {
    return NextResponse.json({ error: "That option is not part of this quote." }, { status: 400 });
  }
  if (!replacing && quote.options.length >= MAX_QUOTE_OPTIONS) {
    return NextResponse.json(
      { error: `A quote can have at most ${MAX_QUOTE_OPTIONS} options.` },
      { status: 400 }
    );
  }

  const [sp] = systemId ? await candidatePrices(quote, systemId) : [];
  if (!sp) {
    return NextResponse.json({ error: "That system isn't available for this quote." }, { status: 400 });
  }

  const mode = await getGstMode();
  const snapshot = (quote.customerSnapshot ?? {}) as Record<string, any>;
  const pricing = computeOptionPricing(Number(sp.price), await quoteExtras(quote, mode), mode);
  const newName = `${sp.system.brand} ${sp.system.model}`;
  const log = replacing
    ? `Changed ${replacing.system.brand} ${replacing.system.model} to ${newName}`
    : `Added ${newName}`;

  await prisma.$transaction([
    replacing
      ? prisma.quoteOption.update({
          where: { id: replacing.id },
          data: { systemId: sp.system.id, ...pricing },
        })
      : prisma.quoteOption.create({
          data: { quoteId: quote.id, systemId: sp.system.id, ...pricing },
        }),
    prisma.quote.update({
      where: { id },
      data: {
        customerSnapshot: { ...snapshot, changeLog: withLogEntry(snapshot, g.session.user.email, log) },
        ...(quote.status === "approved" ? CLEAR_APPROVAL : {}),
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}

// DELETE { optionId } → take an option off the quote (e.g. a brand added by
// mistake). A quote always keeps at least one option.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(req, true);
  if ("error" in g) return g.error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const optionId = String(body?.optionId ?? "");

  const quote = await loadQuote(id);
  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }
  if (quote.status === "locked") {
    return NextResponse.json({ error: "This quote is locked and can't be changed." }, { status: 409 });
  }
  if (quote.status === "cancelled") {
    return NextResponse.json({ error: "This quote has been cancelled and can't be changed." }, { status: 409 });
  }
  const removing = quote.options.find((o) => o.id === optionId);
  if (!removing) {
    return NextResponse.json({ error: "That option is not part of this quote." }, { status: 400 });
  }
  if (quote.options.length <= 1) {
    return NextResponse.json({ error: "A quote needs at least one option." }, { status: 400 });
  }

  const snapshot = (quote.customerSnapshot ?? {}) as Record<string, any>;
  const log = `Removed ${removing.system.brand} ${removing.system.model}`;

  await prisma.$transaction([
    prisma.quoteOption.delete({ where: { id: removing.id } }),
    prisma.quote.update({
      where: { id },
      data: {
        customerSnapshot: { ...snapshot, changeLog: withLogEntry(snapshot, g.session.user.email, log) },
        ...(quote.status === "approved" ? CLEAR_APPROVAL : {}),
        ...(quote.selectedOptionId === removing.id ? { selectedOptionId: null } : {}),
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
