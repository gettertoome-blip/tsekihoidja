import { redirect } from "next/navigation";
import { ReceiptList } from "@/components/receipt-list";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user?.householdId) redirect("/leibkond");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Avaleht</h1>
      <ReceiptList expiryNotice={user.expiryNotice} />
    </div>
  );
}
