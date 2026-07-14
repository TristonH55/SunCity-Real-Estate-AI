// Adds the ELECTRIC "Internal relocation (inside)" add-on (2026-07-14): a base
// per-region charge, default $125 all regions, applied when Step 3 = relocation +
// new system installed INSIDE. Admin-editable afterwards via /admin/prices.
// Idempotent: upserts the Extra by code; creates a $125 ExtraPrice per region only
// where missing (never overwrites a price you've since edited).
// Runs against whatever DATABASE_URL `.env` points at — the host is printed below.
//
//   npx tsx prisma/add-internal-relocation-extra.ts
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { ExtraSystemType } from "@prisma/client";

const CODE = "internal_relocation_electric";
const NAME = "Internal relocation (inside)";
const DEFAULT_PRICE = 125;

async function main() {
  const host = (process.env.DATABASE_URL ?? "").replace(/^.*@/, "@").replace(/\/.*$/, "");
  console.log("DATABASE_URL host:", host || "(unset)");

  const regions = await prisma.region.findMany();
  if (regions.length === 0) throw new Error("No regions found — seed regions first.");

  const extra = await prisma.extra.upsert({
    where: { code: CODE },
    update: { name: NAME, systemType: ExtraSystemType.electric, active: true },
    create: { code: CODE, name: NAME, systemType: ExtraSystemType.electric, active: true },
  });

  for (const region of regions) {
    const existing = await prisma.extraPrice.findFirst({
      where: { extraId: extra.id, regionId: region.id },
    });
    if (!existing) {
      await prisma.extraPrice.create({
        data: { extraId: extra.id, regionId: region.id, price: DEFAULT_PRICE },
      });
      console.log(`created ${CODE} @ ${region.code} = $${DEFAULT_PRICE}`);
    } else {
      console.log(`kept ${CODE} @ ${region.code} = $${Number(existing.price)} (unchanged)`);
    }
  }
  console.log("✅ Internal relocation add-on upserted (idempotent).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
