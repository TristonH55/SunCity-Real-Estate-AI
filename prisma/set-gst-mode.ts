// Sets the site-wide GST mode (2026-07-14). Darren's prices are GST-inclusive,
// so the default is "inclusive". Idempotent — upserts the single AppSetting row.
// Optionally pass "exclusive" to revert to the legacy add-10%-on-top behaviour:
//
//   npx tsx prisma/set-gst-mode.ts            # → inclusive (default)
//   npx tsx prisma/set-gst-mode.ts exclusive  # → legacy ex-GST
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { GST_MODE_KEY } from "../lib/gst";

async function main() {
  const arg = process.argv[2];
  const mode = arg === "exclusive" ? "exclusive" : "inclusive";
  await prisma.appSetting.upsert({
    where: { key: GST_MODE_KEY },
    update: { value: mode },
    create: { key: GST_MODE_KEY, value: mode },
  });
  console.log(`GST mode set to "${mode}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
