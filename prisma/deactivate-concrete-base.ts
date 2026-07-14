// One-off cleanup (2026-07-14): deactivate the dead `concrete_base` add-on.
// It's a legacy `all`-scoped Extra ("Concrete base (if required)", $65) that no
// wizard/API/lib references — superseded by support_base_electric /
// support_base_heat_pump. Setting active:false hides it from the Step-3 flow AND
// the admin add-on editor (both filter active:true). No ExtraPrice is deleted and
// no locked quote references its extraId, so nothing else is affected.
// Idempotent — re-running after it's applied does nothing.
//
//   npx tsx prisma/deactivate-concrete-base.ts
import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const res = await prisma.extra.updateMany({
    where: { code: "concrete_base", active: true },
    data: { active: false },
  });
  console.log(`Deactivated ${res.count} concrete_base add-on row(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
