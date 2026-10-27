import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { HttpError, readJson, requireUser, route } from "@/lib/api";

export const PUT = route(async (req: Request) => {
  const user = await requireUser();
  const body = await readJson(req);
  if (typeof body.expiryNotice !== "boolean") throw new HttpError(400, "Vigane päring.");
  await prisma.user.update({ where: { id: user.id }, data: { expiryNotice: body.expiryNotice } });
  return NextResponse.json({ ok: true });
});
