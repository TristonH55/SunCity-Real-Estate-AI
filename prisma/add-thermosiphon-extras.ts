// Idempotent add of Darren's Thermosiphon Solar Step-3 add-ons. These are
// systemType "solar" rows but are shown ONLY for solar_thermosiphon (the extras
// API filters `*_thermosiphon` codes to that type, so they don't appear for split
// solar). Safe to run against any DB (local now, prod later) — upserts by `code`
// and creates per-region prices only if missing.
//
//   npx tsx prisma/add-thermosiphon-extras.ts
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { ExtraSystemType } from "@prisma/client";

const NEW_EXTRAS = [
  { code: "double_storey_thermosiphon", name: "Double storey / highset roof", price: 450 },
  { code: "pitch_steep_thermosiphon", name: "Steep roof pitch", price: 150 },
  { code: "pitch_crazy_steep_thermosiphon", name: "Very steep roof pitch", price: 500 },
  { code: "tilt_frame_thermosiphon", name: "Tilt / pitch frame (new)", price: 875 },
] as const;

async function main() {
  const regions = await prisma.region.findMany();
  if (regions.length === 0) throw new Error("No regions found — seed regions first.");

  for (const item of NEW_EXTRAS) {
    const extra = await prisma.extra.upsert({
      where: { code: item.code },
      update: { name: item.name, systemType: ExtraSystemType.solar, active: true },
      create: { code: item.code, name: item.name, systemType: ExtraSystemType.solar, active: true },
    });
    for (const region of regions) {
      const existing = await prisma.extraPrice.findFirst({
        where: { extraId: extra.id, regionId: region.id },
      });
      if (!existing) {
        await prisma.extraPrice.create({
          data: { extraId: extra.id, regionId: region.id, price: item.price },
        });
        console.log(`created ${item.code} @ ${region.code} = $${item.price}`);
      } else if (Number(existing.price) !== item.price) {
        await prisma.extraPrice.update({ where: { id: existing.id }, data: { price: item.price } });
        console.log(`updated ${item.code} @ ${region.code} -> $${item.price}`);
      }
    }
  }
  console.log("✅ Thermosiphon add-ons upserted (idempotent).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
