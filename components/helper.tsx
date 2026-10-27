"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const TIPS: Record<string, string[]> = {
  "/": [
    "Otsi müüja või ostu järgi. \"tsekk\" leiab ka sõna \"tšekk\".",
    "Garantiiga asi? Hoia tšekk alles, siis on see vajadusel käepärast.",
  ],
  "/lisa": [
    "Pildista tšekk tasasel pinnal ja heas valguses.",
    "Kontrolli üle, mida ma tuvastasin. Eksida võin ka mina!",
  ],
  "/leibkond": [
    "Jaga kutsekoodi pereliikmetega, et nad näeksid sama tšekikogu.",
  ],
  "/tsekk": [
    "Saad tšeki alla laadida pildina või PDF-ina ning jagada.",
    "Vajad rohkem aega? Muuda \"Säilita kuni\" kuupäeva.",
  ],
};

function tipsFor(pathname: string) {
  if (pathname.startsWith("/tsekk")) return TIPS["/tsekk"];
  return TIPS[pathname] ?? TIPS["/"];
}

/** "Tšekk": a small friendly helper that gives short tips in a speech balloon. */
export function Helper() {
  const pathname = usePathname();
  const tips = tipsFor(pathname);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-36 right-3 z-20 flex max-w-[16rem] flex-col items-end gap-2 md:bottom-6">
      {open && (
        <div
          role="status"
          className="relative rounded-lg border border-border bg-card p-3 pr-8 text-sm shadow-soft after:absolute after:-bottom-1.5 after:right-6 after:h-3 after:w-3 after:rotate-45 after:border-b after:border-r after:border-border after:bg-card"
        >
          <button
            type="button"
            aria-label="Sulge vihje"
            onClick={() => setOpen(false)}
            className="absolute right-1.5 top-1.5 rounded p-1 text-muted hover:bg-primary-soft"
          >
            <X className="h-4 w-4" />
          </button>
          <p>{tips[index % tips.length]}</p>
          {tips.length > 1 && (
            <button
              type="button"
              onClick={() => setIndex((i) => i + 1)}
              className="mt-1 text-xs font-medium text-primary underline"
            >
              Järgmine vihje
            </button>
          )}
        </div>
      )}
      <button
        type="button"
        aria-label="Tšekk, abiline"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="h-14 w-14 rounded-full border border-border bg-card shadow-soft hover:scale-105"
      >
        <svg viewBox="0 0 64 64" aria-hidden="true" className="h-full w-full p-1.5">
          <path
            d="M14 6h36v48l-6-4-6 4-6-4-6 4-6-4-6 4z"
            fill="#fffdf9"
            stroke="#c65d3b"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="25" cy="24" r="3" fill="#3b2a22" />
          <circle cx="39" cy="24" r="3" fill="#3b2a22" />
          <path d="M24 33q8 7 16 0" fill="none" stroke="#c65d3b" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
