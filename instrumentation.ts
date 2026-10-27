const globalForJobs = globalThis as unknown as { expiryJobStarted?: boolean };

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { prisma } = await import("./lib/db");

  // Expiry check on startup, then daily. Runs regardless of demo mode.
  if (!globalForJobs.expiryJobStarted) {
    globalForJobs.expiryJobStarted = true;
    const { runExpiry } = await import("./lib/expiry");
    const check = async () => {
      try {
        const { deleted } = await runExpiry(prisma);
        if (deleted > 0) console.log(`Expiry check: deleted ${deleted} receipt(s).`);
      } catch {
        console.warn("Expiry check skipped (database unavailable).");
      }
    };
    await check();
    const cron = await import("node-cron");
    cron.schedule("15 3 * * *", check);
  }

  const { demoEnabled } = await import("./lib/demo");
  if (!demoEnabled()) return;
  try {
    const { seedIfEmpty } = await import("./lib/seed");
    if (await seedIfEmpty(prisma)) console.log("Demo household seeded.");
  } catch {
    // Database may be unreachable at startup; the app shows a friendly error instead.
    console.warn("Startup seeding skipped (database unavailable).");
  }
}
