import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { ErrorState } from "@/components/states";
import { getCurrentUser } from "@/lib/auth";
import { demoEnabled } from "@/lib/demo";
import { DEMO_PASSWORD, DEMO_USERS } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  try {
    if (await getCurrentUser()) redirect("/");
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e; // redirect signal
    return (
      <main className="mx-auto max-w-md px-4 py-10">
        <ErrorState />
      </main>
    );
  }
  const demo = demoEnabled();
  return (
    <AuthForm
      mode="login"
      demo={demo}
      demoUsers={demo ? DEMO_USERS.map((u) => u.name) : undefined}
      demoPassword={demo ? DEMO_PASSWORD : undefined}
    />
  );
}
