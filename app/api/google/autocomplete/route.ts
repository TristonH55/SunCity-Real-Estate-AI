export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/require-api-role";
import { allow, limiters } from "@/lib/ratelimit";
import { clientIp } from "@/lib/client-ip";

export async function GET(req: Request) {
  // Auth: agents only (route is outside the middleware matcher).
  const { error } = await requireApiRole("agent");
  if (error) return error;

  if (!(await allow(limiters.google, clientIp(req)))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input");

  if (!input) {
    return NextResponse.json({ predictions: [] });
  }

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&components=country:au&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );

  const data = await res.json();
  return NextResponse.json(data);
}
