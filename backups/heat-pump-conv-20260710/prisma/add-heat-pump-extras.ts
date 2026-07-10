// Idempotent add of the heat-pump install add-on(s). Heat pumps always install
// outside, so the only chargeable add-on is the concrete/poly support base
// (other extras either don't apply or are included in the unit price).
// Safe to run against ANY database (local now, prod later) WITHOUT the
// destructive full re-seed: upserts the row by `code` and creates its per-region
// ExtraPrice only if missing. Re-running makes no duplicates.
//
//   npx tsx prisma/add-heat-pump-extras.ts
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { ExtraSystemType } from "@prisma/client";

const NEW_EXTRAS = [
  { code: "support_base_heat_pump", name: "Concrete / Poly support base", price: 65 },
] as const;

async function main() {
  const regions = await prisma.region.findMany();
  if (regions.length === 0) {
    throw new Error("No regions found — seed regions before running this.");
  }

  for (const item of NEW_EXTRAS) {
    const extra = await prisma.extra.upsert({
      where: { code: item.code },
      update: { name: item.name, systemType: ExtraSystemType.heat_pump, active: true },
      create: {
        code: item.code,
        name: item.name,
        systemType: ExtraSystemType.heat_pump,
        active: true,
      },
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
        await prisma.extraPrice.update({
          where: { id: existing.id },
          data: { price: item.price },
        });
        console.log(`updated ${item.code} @ ${region.code} -> $${item.price}`);
      }
    }
  }

  console.log("✅ Heat-pump add-ons upserted (idempotent).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
