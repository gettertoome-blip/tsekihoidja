import { redirect } from "next/navigation";
import { AddReceipt } from "@/components/add-receipt";
import { getCurrentUser } from "@/lib/auth";
import { demoEnabled } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function AddPage() {
  const user = await getCurrentUser();
  if (!user?.householdId) redirect("/leibkond");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Lisa tšekk</h1>
      <AddReceipt demo={demoEnabled()} />
    </div>
  );
}
