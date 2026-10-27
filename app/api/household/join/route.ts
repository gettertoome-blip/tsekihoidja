import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { HttpError, readJson, requireUser, route, str } from "@/lib/api";
import { clientIp, tooManyAttempts } from "@/lib/rate-limit";

export const POST = route(async (req: Request) => {
  const user = await requireUser();
  if (tooManyAttempts(`join:${user.id}:${clientIp(req)}`, 10, 15 * 60 * 1000)) {
    throw new HttpError(429, "Liiga palju katseid. Proovi hiljem uuesti.");
  }
  if (user.householdId) throw new HttpError(409, "Oled juba leibkonnas.");
  const body = await readJson(req);
  const code = str(body.code, 20).toUpperCase().replace(/\s|-/g, "");
  const household = code ? await prisma.household.findUnique({ where: { inviteCode: code } }) : null;
  if (!household) throw new HttpError(404, "Sellist kutsekoodi ei leitud.");

  await prisma.user.update({ where: { id: user.id }, data: { householdId: household.id } });
  return NextResponse.json({ id: household.id });
});
