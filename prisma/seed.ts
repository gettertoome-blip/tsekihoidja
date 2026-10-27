import { PrismaClient } from "@prisma/client";
import { seedDemo } from "../lib/seed";

async function main() {
  const demo = (process.env.DEMO_MODE ?? "true").toLowerCase() !== "false";
  if (!demo && !process.argv.includes("--force")) {
    console.error("DEMO_MODE=false: refusing to seed. Pass --force to seed anyway.");
    process.exit(1);
  }
  const prisma = new PrismaClient();
  try {
    await seedDemo(prisma);
    console.log("Demo data is in place.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Seeding failed:", e instanceof Error ? e.message : "unknown error");
  process.exit(1);
});
