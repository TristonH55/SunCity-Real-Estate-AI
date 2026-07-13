// Idempotent brand rename: on ELECTRIC systems only, "Dux / Thermann" → "OMNI X / Thermann".
// (Darren no longer wants the Dux brand on electric.) Solar's "Dux" (Ecosmart) is left alone.
// Only changes System.brand; SystemPrice rows reference systemId so they're unaffected.
// Safe to run against any DB (local now, prod later) — re-running matches nothing once renamed.
//
//   npx tsx prisma/rename-electric-dux.ts
import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const res = await prisma.system.updateMany({
    where: { systemType: "electric", brand: "Dux / Thermann" },
    data: { brand: "OMNI X / Thermann" },
  });
  console.log(`Renamed ${res.count} electric system(s): "Dux / Thermann" → "OMNI X / Thermann".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
