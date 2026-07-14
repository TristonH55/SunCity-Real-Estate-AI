export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/require-api-role";
import { allow, limiters } from "@/lib/ratelimit";
import { checkOrigin } from "@/lib/origin-check";
import { clientIp } from "@/lib/client-ip";
import { getGstMode, GST_MODE_KEY, type GstMode } from "@/lib/gst";

// GET → { mode } the current site-wide GST mode.
export async function GET() {
  const { error } = await requireApiRole("admin");
  if (error) return error;

  const mode = await getGstMode();
  return NextResponse.json({ mode });
}

// PATCH { mode } → switch the site-wide GST mode (affects NEW quotes only).
export async function PATCH(req: NextRequest) {
  const { error } = await requireApiRole("admin");
  if (error) return error;

  const originError = checkOrigin(req);
  if (originError) return originError;

  if (!(await allow(limiters.adminPrices, clientIp(req)))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const mode = body?.mode as GstMode;

  if (mode !== "inclusive" && mode !== "exclusive") {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  await prisma.appSetting.upsert({
    where: { key: GST_MODE_KEY },
    update: { value: mode },
    create: { key: GST_MODE_KEY, value: mode },
  });

  return NextResponse.json({ success: true, mode });
}
