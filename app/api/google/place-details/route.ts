import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/require-api-role";

export async function GET(req: Request) {
  // Auth: agents only (route is outside the middleware matcher).
  const { error } = await requireApiRole("agent");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json({ result: {} });
  }

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=address_component,formatted_address&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );

  const data = await res.json();
  return NextResponse.json(data);
}
