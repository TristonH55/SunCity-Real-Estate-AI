// Idempotent add of Darren's Split Solar Step-3 add-ons. These are systemType
// "solar" rows shown ONLY for solar_split (the extras API filters `*_split` codes
// to that type). Safe to run against any DB (local now, prod later).
//
//   npx tsx prisma/add-split-solar-extras.ts
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { ExtraSystemType } from "@prisma/client";

const NEW_EXTRAS = [
  { code: "double_storey_split", name: "Double storey / highset roof", price: 450 },
  { code: "pitch_steep_split", name: "Steep roof pitch", price: 150 },
  { code: "pitch_crazy_steep_split", name: "Very steep roof pitch", price: 500 },
  { code: "tilt_frame_split", name: "Tilt / pitch frame (new)", price: 675 },
  { code: "safe_catch_tray_split", name: "Safe / Catch Tray", price: 165 },
  { code: "mildred_valve_split", name: "Mildred anti-flood valve", price: 225 },
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
  console.log("✅ Split-solar add-ons upserted (idempotent).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
