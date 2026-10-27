import { NextResponse } from "next/server";
import { requireUser, route } from "@/lib/api";
import { demoEnabled } from "@/lib/demo";

export const GET = route(async () => {
  const user = await requireUser();
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    householdId: user.householdId,
    householdName: user.household?.name ?? null,
    expiryNotice: user.expiryNotice,
    demo: demoEnabled(),
  });
});
