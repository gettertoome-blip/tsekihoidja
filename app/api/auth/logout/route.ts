import { NextResponse } from "next/server";
import { endSession } from "@/lib/auth";
import { route } from "@/lib/api";

export const POST = route(async () => {
  await endSession();
  return NextResponse.json({ ok: true });
});
