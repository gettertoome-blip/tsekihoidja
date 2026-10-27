import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Palun logi sisse.");
  return user;
}

/** Signed-in user who belongs to a household; returns the household id as well. */
export async function requireMember() {
  const user = await requireUser();
  if (!user.householdId) throw new HttpError(403, "Liitu enne leibkonnaga.");
  return { user, householdId: user.householdId };
}

export function isDbUnreachable(e: unknown) {
  return (
    e instanceof Prisma.PrismaClientInitializationError ||
    (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P1001")
  );
}

export const DB_ERROR_TEXT = "Andmebaasiga ei õnnestunud ühendust luua. Proovi hiljem uuesti.";

/** Wraps a route handler: maps errors to JSON responses without leaking details. */
export function route<A extends unknown[]>(
  handler: (...args: A) => Promise<Response>,
): (...args: A) => Promise<Response> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (e) {
      if (e instanceof HttpError) {
        return NextResponse.json({ error: e.message }, { status: e.status });
      }
      if (isDbUnreachable(e)) {
        return NextResponse.json({ error: DB_ERROR_TEXT }, { status: 503 });
      }
      console.error("API error:", e instanceof Error ? e.name : "unknown");
      return NextResponse.json({ error: "Serveri viga." }, { status: 500 });
    }
  };
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (body && typeof body === "object") return body as Record<string, unknown>;
  } catch {
    // fall through
  }
  throw new HttpError(400, "Vigane päring.");
}

export function str(v: unknown, max = 200) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
