"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState, ErrorState } from "@/components/states";
import { ReceiptCard } from "@/components/receipt-card";
import { CATEGORIES } from "@/lib/categories";
import { normalize } from "@/lib/text";
import type { ReceiptDto } from "@/lib/receipts";

const ALL = "all";

export function ReceiptList() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<ReceiptDto[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/receipts");
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) return setFailed(true);
      setReceipts(await res.json());
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const visible = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return (receipts ?? []).filter((r) => {
      if (category !== ALL && r.category !== category) return false;
      if (from && r.purchaseDate < from) return false;
      if (to && r.purchaseDate > to) return false;
      const hay = normalize(`${r.seller} ${r.content}`);
      return words.every((w) => hay.includes(w));
    });
  }, [receipts, query, category, from, to]);

  const filtering = query.trim() !== "" || category !== ALL || from !== "" || to !== "";

  if (failed) return <ErrorState />;
  if (!receipts) return <p className="text-sm text-muted">Laen tšekke...</p>;

  if (receipts.length === 0) {
    return (
      <EmptyState
        title="Tšekke veel pole"
        text="Pildista oma esimene tšekk ja see on alati käepärast, kui seda vaja läheb."
        action={
          <Link href="/lisa">
            <Button>Lisa tšekk</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Otsi müüja või ostu järgi"
            aria-label="Otsi tšekke"
            className="pl-10"
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Select
            value={category}
            onValueChange={setCategory}
            options={[{ value: ALL, label: "Kõik kategooriad" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]}
            ariaLabel="Kategooria"
          />
          <DatePicker value={from} onChange={setFrom} placeholder="Alates" ariaLabel="Alates kuupäevast" />
          <DatePicker value={to} onChange={setTo} placeholder="Kuni" ariaLabel="Kuni kuupäevani" />
        </div>
        {filtering && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setCategory(ALL);
              setFrom("");
              setTo("");
            }}
          >
            <X className="h-4 w-4" /> Tühjenda filtrid
          </Button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="Midagi ei leitud" text="Proovi teist otsingusõna või eemalda mõni filter." />
      ) : (
        <>
          <p className="text-sm text-muted">{visible.length} tšekki</p>
          <ul className="grid gap-3 md:grid-cols-2">
            {visible.map((r) => (
              <li key={r.id}>
                <ReceiptCard receipt={r} onDeleted={load} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
