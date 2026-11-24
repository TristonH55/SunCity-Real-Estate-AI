export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";
import { allow, limiters } from "@/lib/ratelimit";
import { checkOrigin } from "@/lib/origin-check";
import { clientIp } from "@/lib/client-ip";
import { getGstMode } from "@/lib/gst";
import {
  CLEAR_APPROVAL,
  customItemsOf,
  shiftOptionExtras,
  withLogEntry,
  type CustomItem,
} from "@/lib/quote-adjust";

const money = (v: number) => v.toLocaleString("en-AU", { style: "currency", currency: "AUD" });

// Admin-only custom items on a quote (e.g. "5 foot wall removal charge").
// POST { label, amount } adds one; DELETE { itemId } removes one. Each item is
// added to every option's total. A locked quote can't change; an approved one
// goes back to presented so the homeowner approves the new total.
async function adjust(
  req: NextRequest,
  params: Promise<{ id: string }>,
  change: (items: CustomItem[]) => { items: CustomItem[]; delta: number; log: string } | { error: string }
) {
  const { session, error } = await requireApiRole("admin");
  if (error) return error;

  const originError = checkOrigin(req);
  if (originError) return originError;

  if (!(await allow(limiters.adminPrices, clientIp(req)))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  const quote = await prisma.quote.findUnique({ where: { id }, include: { options: true } });
  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }
  if (quote.status === "locked") {
    return NextResponse.json({ error: "This quote is locked and can't be changed." }, { status: 409 });
  }

  const snapshot = (quote.customerSnapshot ?? {}) as Record<string, any>;
  const result = change(customItemsOf(snapshot));
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const mode = await getGstMode();
  await prisma.$transaction([
    ...quote.options.map((o) =>
      prisma.quoteOption.update({
        where: { id: o.id },
        data: shiftOptionExtras(o, result.delta, mode),
      })
    ),
    prisma.quote.update({
      where: { id },
      data: {
        customerSnapshot: {
          ...snapshot,
          customItems: result.items,
          changeLog: withLogEntry(snapshot, session!.user.email, result.log),
        },
        ...(quote.status === "approved" ? CLEAR_APPROVAL : {}),
      },
    }),
  ]);

  return NextResponse.json({ success: true, items: result.items });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json().catch(() => ({}));
  const label = String(body?.label ?? "").trim();
  const amount = Math.round(Number(body?.amount) * 100) / 100;

  return adjust(req, params, (items) => {
    if (!label) return { error: "Enter a description." };
    if (label.length > 200) return { error: "Keep the description under 200 characters." };
    if (body?.amount === "" || !Number.isFinite(amount) || amount < 0) {
      return { error: "Price must be a number of 0 or more." };
    }
    return {
      items: [...items, { id: randomUUID(), label, amount }],
      delta: amount,
      log: `Added "${label}" — ${money(amount)}`,
    };
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json().catch(() => ({}));
  const itemId = String(body?.itemId ?? "");

  return adjust(req, params, (items) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return { error: "That item is no longer on this quote." };
    return {
      items: items.filter((i) => i.id !== itemId),
      delta: -Number(item.amount),
      log: `Removed "${item.label}" — ${money(Number(item.amount))}`,
    };
  });
}
