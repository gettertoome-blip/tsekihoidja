import type { PrismaClient } from "@prisma/client";

export type ExpiryResult = {
  deleted: number;
  items: { seller: string; content: string; retainUntil: string }[];
};

function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/**
 * Permanently deletes receipts (including their images) whose "keep until"
 * date has arrived. Pass a householdId to limit the run to one household.
 */
export async function runExpiry(prisma: PrismaClient, householdId?: string): Promise<ExpiryResult> {
  const expired = await prisma.receipt.findMany({
    where: { retainUntil: { lte: todayUtc() }, ...(householdId ? { householdId } : {}) },
    select: { id: true, seller: true, content: true, retainUntil: true },
  });
  if (expired.length > 0) {
    await prisma.receipt.deleteMany({ where: { id: { in: expired.map((r) => r.id) } } });
  }
  if (!householdId) {
    await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  }
  return {
    deleted: expired.length,
    items: expired.map((r) => ({
      seller: r.seller,
      content: r.content,
      retainUntil: r.retainUntil.toISOString().slice(0, 10),
    })),
  };
}
