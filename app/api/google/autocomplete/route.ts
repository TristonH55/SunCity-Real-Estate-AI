export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/require-api-role";

export async function GET(req: Request) {
  // Auth: agents only (route is outside the middleware matcher).
  const { error } = await requireApiRole("agent");
  if (error) return error;

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
