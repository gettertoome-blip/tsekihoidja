"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Users, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Avaleht", icon: Home },
  { href: "/lisa", label: "Lisa", icon: PlusCircle },
  { href: "/leibkond", label: "Leibkond", icon: Users },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppNav() {
  const pathname = usePathname();
  return (
    <>
      <header className="sticky top-0 z-30 hidden border-b border-border bg-card/90 backdrop-blur md:block">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
            <Receipt className="h-5 w-5" /> Tšekihoidja
          </Link>
          <nav className="flex gap-1">
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-primary-soft",
                  isActive(pathname, href) && "bg-primary-soft text-primary-dark",
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <nav
        aria-label="Peamenüü"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="mx-auto flex max-w-md">
          {items.map(({ href, label, icon: Icon }) => (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-xs font-medium text-muted",
                  isActive(pathname, href) && "text-primary",
                )}
              >
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
