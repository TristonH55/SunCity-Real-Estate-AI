// Attach the initial add-on brochure images (2026-07-21). Files live in
// public/pdfs/Extras/ (served at /pdfs/Extras/...). The same physical item exists
// as per-type Extra rows, so we set the brochure on each variant.
// Idempotent — updates brochureUrl by code. Prints the DB host it writes to.
//
//   npx tsx prisma/set-extra-brochures.ts
import "dotenv/config";
import { prisma } from "../lib/prisma";

const MAP: { codes: string[]; brochureUrl: string }[] = [
  {
    codes: ["safe_catch_tray_electric", "safe_catch_tray_split"],
    brochureUrl: "/pdfs/Extras/catch-tray.png",
  },
  {
    codes: ["support_base_electric", "support_base_heat_pump"],
    brochureUrl: "/pdfs/Extras/concrete-base.png",
  },
];

async function main() {
  const host = (process.env.DATABASE_URL ?? "").replace(/^.*@/, "@").replace(/\/.*$/, "");
  console.log("DATABASE_URL host:", host || "(unset)");

  for (const { codes, brochureUrl } of MAP) {
    const res = await prisma.extra.updateMany({
      where: { code: { in: codes } },
      data: { brochureUrl },
    });
    console.log(`Set ${brochureUrl} on ${res.count} extra(s): ${codes.join(", ")}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
