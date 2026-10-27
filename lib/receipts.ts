import type { Prisma } from "@prisma/client";
import { HttpError, str } from "@/lib/api";
import { isCategory } from "@/lib/categories";
import { isValidIso } from "@/lib/dates";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export type ReceiptFields = {
  seller: string;
  purchaseDate: Date;
  content: string;
  total: string | null;
  category: string;
  retainUntil: Date;
};

function parseTotal(v: unknown): string | null {
  const raw = typeof v === "string" ? v.trim().replace(",", ".") : typeof v === "number" ? String(v) : "";
  if (!raw) return null;
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(raw)) throw new HttpError(400, "Summa on vigane.");
  return raw;
}

/** Validates the text fields shared by create and update. */
export function parseFields(input: Record<string, unknown>): ReceiptFields {
  const seller = str(input.seller, 120);
  const content = str(input.content, 300);
  if (!seller) throw new HttpError(400, "Müüja on kohustuslik.");
  if (!content) throw new HttpError(400, "Ostu sisu on kohustuslik.");
  if (!isValidIso(input.purchaseDate)) throw new HttpError(400, "Ostukuupäev on vigane.");
  if (!isValidIso(input.retainUntil)) throw new HttpError(400, "Säilitustähtaeg on vigane.");
  if (input.retainUntil < input.purchaseDate) {
    throw new HttpError(400, "Säilitustähtaeg ei saa olla enne ostukuupäeva.");
  }
  if (!isCategory(input.category)) throw new HttpError(400, "Kategooria on vigane.");
  return {
    seller,
    content,
    total: parseTotal(input.total),
    category: input.category,
    purchaseDate: new Date(`${input.purchaseDate}T00:00:00Z`),
    retainUntil: new Date(`${input.retainUntil}T00:00:00Z`),
  };
}

// Never selects imageData/thumbData, so list responses stay small.
export const listSelect = {
  id: true,
  seller: true,
  purchaseDate: true,
  content: true,
  total: true,
  category: true,
  retainUntil: true,
  createdAt: true,
  addedBy: { select: { id: true, name: true } },
} satisfies Prisma.ReceiptSelect;

export type ListedReceipt = Prisma.ReceiptGetPayload<{ select: typeof listSelect }>;

export function serialize(r: ListedReceipt) {
  return {
    id: r.id,
    seller: r.seller,
    purchaseDate: r.purchaseDate.toISOString().slice(0, 10),
    content: r.content,
    total: r.total ? r.total.toFixed(2) : null,
    category: r.category,
    retainUntil: r.retainUntil.toISOString().slice(0, 10),
    createdAt: r.createdAt.toISOString(),
    addedBy: r.addedBy.name,
    addedById: r.addedBy.id,
  };
}

export type ReceiptDto = ReturnType<typeof serialize>;
