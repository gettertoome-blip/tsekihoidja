import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { HttpError, readJson, requireMember, requireUser, route, str } from "@/lib/api";
import { newInviteCode } from "@/lib/household";

export const GET = route(async () => {
  const { householdId } = await requireMember();
  const household = await prisma.household.findUnique({
    where: { id: householdId },
    include: { users: { select: { id: true, name: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!household) throw new HttpError(404, "Leibkonda ei leitud.");
  return NextResponse.json({
    id: household.id,
    name: household.name,
    inviteCode: household.inviteCode,
    members: household.users,
  });
});

export const POST = route(async (req: Request) => {
  const user = await requireUser();
  if (user.householdId) throw new HttpError(409, "Oled juba leibkonnas.");
  const body = await readJson(req);
  const name = str(body.name, 60);
  if (name.length < 2) throw new HttpError(400, "Leibkonna nimi peab olema vähemalt 2 märki.");

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const household = await prisma.household.create({
        data: {
          name,
          inviteCode: newInviteCode(),
          users: { connect: { id: user.id } },
        },
      });
      return NextResponse.json({ id: household.id });
    } catch (e) {
      // Invite code collision: try another code.
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
    }
  }
  throw new HttpError(500, "Kutsekoodi loomine ebaõnnestus.");
});
