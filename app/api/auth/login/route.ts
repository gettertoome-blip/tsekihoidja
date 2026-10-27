import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { startSession } from "@/lib/auth";
import { HttpError, readJson, route, str } from "@/lib/api";
import { clientIp, tooManyAttempts } from "@/lib/rate-limit";

// Real hash used for missing accounts, so response time is the same either way.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

export const POST = route(async (req: Request) => {
  const body = await readJson(req);
  const login = str(body.login, 120).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (
    tooManyAttempts(`login-ip:${clientIp(req)}`, 20, 15 * 60 * 1000) ||
    (login && tooManyAttempts(`login-acc:${login}`, 8, 15 * 60 * 1000))
  ) {
    throw new HttpError(429, "Liiga palju katseid. Proovi 15 minuti pärast uuesti.");
  }
  if (!login || !password) throw new HttpError(400, "Sisesta nimi või e-post ja parool.");

  const user = await prisma.user.findUnique({
    where: login.includes("@") ? { email: login } : { nameKey: login },
  });
  // Compare even when the user is missing so response time doesn't reveal accounts.
  const hash = user?.passwordHash ?? DUMMY_HASH;
  const ok = await bcrypt.compare(password, hash);
  if (!user || !ok) throw new HttpError(401, "Vale nimi, e-post või parool.");

  await startSession(user.id);
  return NextResponse.json({ ok: true });
});
