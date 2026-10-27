import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";
import { suggestCategory } from "./categories";
import { addYearsIso } from "./dates";
import { SAMPLES } from "./samples";

// Demo accounts. The password is public by design: it is shown on the login
// page while DEMO_MODE is on.
export const DEMO_PASSWORD = "tamme-pere-2026";
export const DEMO_USERS = [
  { name: "Kadri", email: "kadri@example.com" },
  { name: "Martin", email: "martin@example.com" },
];

/** Idempotent: safe to run repeatedly, never creates duplicates. */
export async function seedDemo(prisma: PrismaClient) {
  const household = await prisma.household.upsert({
    where: { inviteCode: "TAMME123" },
    update: {},
    create: { name: "Tamme pere", inviteCode: "TAMME123" },
  });
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = [];
  for (const u of DEMO_USERS) {
    users.push(
      await prisma.user.upsert({
        where: { nameKey: u.name.toLowerCase() },
        update: {},
        create: {
          name: u.name,
          nameKey: u.name.toLowerCase(),
          email: u.email,
          passwordHash,
          householdId: household.id,
        },
      }),
    );
  }
  // Demo receipts: only when the household has none, so reruns never duplicate.
  if ((await prisma.receipt.count({ where: { householdId: household.id } })) === 0) {
    const demoIds = ["elkjop", "nike", "bauhof", "ikea"];
    for (const [i, id] of demoIds.entries()) {
      const sample = SAMPLES.find((x) => x.id === id)!;
      const imageData = readFileSync(path.join(process.cwd(), "public", sample.file));
      await prisma.receipt.create({
        data: {
          householdId: household.id,
          addedById: users[i % users.length].id,
          seller: sample.seller,
          content: sample.content,
          total: sample.total,
          category: suggestCategory(sample.content),
          purchaseDate: new Date(sample.date + "T00:00:00Z"),
          retainUntil: new Date(addYearsIso(sample.date, 2) + "T00:00:00Z"),
          imageData,
          imageMime: "image/svg+xml",
        },
      });
    }
  }
  return { household, users };
}

/** Startup seeding: only in demo mode and only into an empty database. */
export async function seedIfEmpty(prisma: PrismaClient) {
  if ((await prisma.household.count()) > 0) return false;
  await seedDemo(prisma);
  return true;
}
