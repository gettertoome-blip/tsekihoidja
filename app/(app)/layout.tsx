import { AppNav } from "@/components/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-4xl px-4 pb-28 pt-6 md:pb-10">{children}</main>
    </>
  );
}
