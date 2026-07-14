// Deactivate old-solar-flow leftover `all` add-ons that no wizard uses (2026-07-14):
//   - safe_tray_mildred_valve — thermosiphon (roof tank) never needs a tray; electric/split
//     use their own safe_catch_tray_*/mildred_valve_* rows.
//   - concrete_base — superseded by support_base_electric / support_base_heat_pump.
// Both are `active: false` → hidden from the admin add-on editor AND the quote flow (both
// filter active:true). No wizard/quote references either extraId. Idempotent; re-run safe.
// Runs against whatever DATABASE_URL `.env` points at — check the datasource Prisma prints.
//
//   npx tsx prisma/deactivate-legacy-all-extras.ts
import "dotenv/config";
import { prisma } from "../lib/prisma";

const CODES = ["safe_tray_mildred_valve", "concrete_base"];

async function main() {
  const res = await prisma.extra.updateMany({
    where: { code: { in: CODES }, active: true },
    data: { active: false },
  });
  console.log(`Deactivated ${res.count} legacy add-on row(s): ${CODES.join(", ")}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
