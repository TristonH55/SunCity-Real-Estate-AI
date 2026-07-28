// Adds the SPLIT SOLAR "Concrete / Poly support base" add-on (2026-07-29): shown
// when the split-solar storage tank is OUTSIDE (ground). $65 all regions (same as
// every other poly support base). Idempotent: upsert the Extra by code + create a
// $65 ExtraPrice per region only where missing. Prints the DB host it writes to.
//
//   npx tsx prisma/add-split-support-base.ts
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { ExtraSystemType } from "@prisma/client";

const CODE = "support_base_split";
const NAME = "Concrete / Poly support base";
const PRICE = 65;

async function main() {
  const host = (process.env.DATABASE_URL ?? "").replace(/^.*@/, "@").replace(/\/.*$/, "");
  console.log("DATABASE_URL host:", host || "(unset)");

  const regions = await prisma.region.findMany();
  if (regions.length === 0) throw new Error("No regions found — seed regions first.");

  const extra = await prisma.extra.upsert({
    where: { code: CODE },
    update: { name: NAME, systemType: ExtraSystemType.solar, active: true },
    create: { code: CODE, name: NAME, systemType: ExtraSystemType.solar, active: true },
  });

  for (const region of regions) {
    const existing = await prisma.extraPrice.findFirst({
      where: { extraId: extra.id, regionId: region.id },
    });
    if (!existing) {
      await prisma.extraPrice.create({
        data: { extraId: extra.id, regionId: region.id, price: PRICE },
      });
      console.log(`created ${CODE} @ ${region.code} = $${PRICE}`);
    } else {
      console.log(`kept ${CODE} @ ${region.code} = $${Number(existing.price)} (unchanged)`);
    }
  }
  console.log("✅ Split-solar support base upserted (idempotent).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
