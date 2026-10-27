import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";

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
  return { household, users };
}

/** Startup seeding: only in demo mode and only into an empty database. */
export async function seedIfEmpty(prisma: PrismaClient) {
  if ((await prisma.household.count()) > 0) return false;
  await seedDemo(prisma);
  return true;
}
