export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { demoEnabled } = await import("./lib/demo");
  if (!demoEnabled()) return;
  try {
    const { prisma } = await import("./lib/db");
    const { seedIfEmpty } = await import("./lib/seed");
    if (await seedIfEmpty(prisma)) console.log("Demo household seeded.");
  } catch {
    // Database may be unreachable at startup; the app shows a friendly error instead.
    console.warn("Startup seeding skipped (database unavailable).");
  }
}
