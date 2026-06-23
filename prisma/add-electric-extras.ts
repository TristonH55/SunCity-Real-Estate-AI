// Idempotent add of Darren's electric-only "same-location replacement" add-ons.
// Safe to run against ANY database (local now, prod later) WITHOUT the destructive
// full re-seed: it upserts the 4 electric Extra rows by `code` and creates their
// per-region ExtraPrice only if missing. Re-running makes no duplicates and only
// corrects a price if it has drifted. Existing shared (`all`) rows are untouched.
//
//   npx tsx prisma/add-electric-extras.ts
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { ExtraSystemType } from "@prisma/client";

const NEW_EXTRAS = [
  { code: "cupboard_install_electric", name: "Cupboard installation", price: 50 },
  { code: "safe_catch_tray_electric", name: "Safe / Catch Tray", price: 165 },
  { code: "mildred_valve_electric", name: "Mildred anti-flood valve", price: 225 },
  { code: "support_base_electric", name: "Concrete / Poly support base", price: 65 },
] as const;

async function main() {
  const regions = await prisma.region.findMany();
  if (regions.length === 0) {
    throw new Error("No regions found — seed regions before running this.");
  }

  for (const item of NEW_EXTRAS) {
    const extra = await prisma.extra.upsert({
      where: { code: item.code },
      update: { name: item.name, systemType: ExtraSystemType.electric, active: true },
      create: {
        code: item.code,
        name: item.name,
        systemType: ExtraSystemType.electric,
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

  console.log("✅ Electric add-ons upserted (idempotent).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
