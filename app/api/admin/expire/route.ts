import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMember, route } from "@/lib/api";
import { demoEnabled } from "@/lib/demo";
import { runExpiry } from "@/lib/expiry";

export const dynamic = "force-dynamic";

// Demo-mode helper: runs the expiry check right now for the caller's own household.
export const POST = route(async () => {
  if (!demoEnabled()) return new Response(null, { status: 404 });
  const { householdId } = await requireMember();
  return NextResponse.json(await runExpiry(prisma, householdId));
});
