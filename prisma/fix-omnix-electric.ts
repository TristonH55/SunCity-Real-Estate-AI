// One-off fix for ELECTRIC OMNI X systems (Darren 2026-07-14):
//   - brand "OMNI X / Thermann" → "OMNI X" (drop Thermann, the rebadged Dux)
//   - tankMaterial mild_steel → stainless_steel
//   - model "Electric NNL Mild Steel" → "Electric NNL Stainless"
// Only System.brand/model/tankMaterial change; SystemPrice rows reference systemId
// so prices are unaffected. Idempotent — matches "OMNI X / Thermann", so re-running
// after it's applied does nothing.
//
//   npx tsx prisma/fix-omnix-electric.ts
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { TankMaterial } from "@prisma/client";

async function main() {
  const rows = await prisma.system.findMany({
    where: { systemType: "electric", brand: "OMNI X / Thermann" },
  });
  for (const s of rows) {
    await prisma.system.update({
      where: { id: s.id },
      data: {
        brand: "OMNI X",
        tankMaterial: TankMaterial.stainless_steel,
        model: s.model.replace("Mild Steel", "Stainless"),
      },
    });
  }
  console.log(
    `Updated ${rows.length} OMNI X electric system(s): brand → "OMNI X", stainless steel, model renamed.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
