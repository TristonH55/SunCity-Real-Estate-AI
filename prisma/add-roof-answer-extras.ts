// Idempotent add of the no-charge solar roof answers, so they appear in "What's
// included" and on /admin/prices. Create-only: an existing item or price is left
// alone, so re-running never undoes a price set in the admin page.
//
//   npx tsx prisma/add-roof-answer-extras.ts
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { ExtraSystemType } from "@prisma/client";

const NEW_EXTRAS = [
  { code: "single_storey_thermosiphon", name: "Single Storey / Lowset" },
  { code: "pitch_flat_thermosiphon", name: "Roof pitch: Flat" },
  { code: "pitch_moderate_thermosiphon", name: "Roof pitch: Moderate" },
  { code: "single_storey_split", name: "Single Storey / Lowset" },
  { code: "pitch_flat_split", name: "Roof pitch: Flat" },
  { code: "pitch_moderate_split", name: "Roof pitch: Moderate" },
] as const;

async function main() {
  const regions = await prisma.region.findMany();
  if (regions.length === 0) throw new Error("No regions found — seed regions first.");

  for (const item of NEW_EXTRAS) {
    const extra = await prisma.extra.upsert({
      where: { code: item.code },
      update: {},
      create: { code: item.code, name: item.name, systemType: ExtraSystemType.solar, active: true },
    });
    for (const region of regions) {
      const existing = await prisma.extraPrice.findFirst({
        where: { extraId: extra.id, regionId: region.id },
      });
      if (!existing) {
        await prisma.extraPrice.create({
          data: { extraId: extra.id, regionId: region.id, price: 0 },
        });
        console.log(`created ${item.code} @ ${region.code} = $0`);
      }
    }
  }
  console.log("✅ Roof answer items added (existing prices left alone).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
