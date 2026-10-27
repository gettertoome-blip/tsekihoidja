import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { HttpError, readJson, requireMember, route } from "@/lib/api";
import { listSelect, parseFields, serialize } from "@/lib/receipts";

type Ctx = { params: Promise<{ id: string }> };

async function findOwn(id: string, householdId: string) {
  const receipt = await prisma.receipt.findFirst({
    where: { id, householdId },
    select: listSelect,
  });
  if (!receipt) throw new HttpError(404, "Tšekki ei leitud.");
  return receipt;
}

export const GET = route(async (_req: Request, { params }: Ctx) => {
  const { householdId } = await requireMember();
  const { id } = await params;
  return NextResponse.json(serialize(await findOwn(id, householdId)));
});

export const PUT = route(async (req: Request, { params }: Ctx) => {
  const { householdId } = await requireMember();
  const { id } = await params;
  await findOwn(id, householdId);
  const fields = parseFields(await readJson(req));
  const updated = await prisma.receipt.update({ where: { id }, data: fields, select: listSelect });
  return NextResponse.json(serialize(updated));
});

export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  const { householdId } = await requireMember();
  const { id } = await params;
  await findOwn(id, householdId);
  await prisma.receipt.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
