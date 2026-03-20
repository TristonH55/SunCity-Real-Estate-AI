import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input");

  if (!input) {
    return NextResponse.json({ predictions: [] });
  }

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&components=country:au&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );

  const data = await res.json();

  return NextResponse.json(data);
}