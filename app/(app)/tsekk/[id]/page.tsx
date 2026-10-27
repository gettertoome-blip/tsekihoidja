import { redirect } from "next/navigation";
import { ReceiptDetail } from "@/components/receipt-detail";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.householdId) redirect("/leibkond");
  const { id } = await params;
  return <ReceiptDetail id={id} />;
}
