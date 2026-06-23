import "dotenv/config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
async function main() {
  const passwordHash = await bcrypt.hash("edwards00", 10);
  await prisma.user.upsert({
    where: { email: "oop@oopdesign.com.au" },
    update: { passwordHash, role: "admin", approved: true, companyName: "Local Dev" },
    create: { email: "oop@oopdesign.com.au", passwordHash, role: "admin", approved: true, companyName: "Local Dev" },
  });
  console.log("✅ Local admin ready: oop@oopdesign.com.au");
}
main().finally(() => prisma.$disconnect());
