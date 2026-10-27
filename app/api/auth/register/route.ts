import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { startSession } from "@/lib/auth";
import { HttpError, readJson, route, str } from "@/lib/api";
import { clientIp, tooManyAttempts } from "@/lib/rate-limit";

export const POST = route(async (req: Request) => {
  if (tooManyAttempts(`register:${clientIp(req)}`, 10, 60 * 60 * 1000)) {
    throw new HttpError(429, "Liiga palju katseid. Proovi hiljem uuesti.");
  }
  const body = await readJson(req);
  const name = str(body.name, 40);
  const email = str(body.email, 120).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (name.length < 2) throw new HttpError(400, "Nimi peab olema vähemalt 2 märki.");
  if (name.includes("@")) throw new HttpError(400, "Nimi ei tohi sisaldada märki @.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "E-posti aadress on vigane.");
  }
  if (password.length < 8) throw new HttpError(400, "Parool peab olema vähemalt 8 märki.");
  if (password.length > 200) throw new HttpError(400, "Parool on liiga pikk.");

  const nameKey = name.toLowerCase();
  const clash = await prisma.user.findFirst({
    where: { OR: [{ nameKey }, ...(email ? [{ email }] : [])] },
    select: { nameKey: true },
  });
  if (clash) {
    throw new HttpError(409, clash.nameKey === nameKey ? "See nimi on juba kasutusel." : "See e-posti aadress on juba kasutusel.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, nameKey, email: email || null, passwordHash },
  });
  await startSession(user.id);
  return NextResponse.json({ ok: true });
});
