import { redirect } from "next/navigation";
import { AppNav } from "@/components/nav";
import { ErrorState } from "@/components/states";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let user: CurrentUser | null = null;
  let failed = false;
  try {
    user = await getCurrentUser();
  } catch {
    failed = true;
  }
  if (!failed && !user) redirect("/login");

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-4xl px-4 pb-28 pt-6 md:pb-10">
        {failed ? <ErrorState /> : children}
      </main>
    </>
  );
}
