"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ConfirmDelete } from "@/components/confirm-delete";
import { ErrorState } from "@/components/states";
import { CATEGORIES } from "@/lib/categories";
import { isoToDisplay } from "@/lib/dates";
import type { ReceiptDto } from "@/lib/receipts";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

export function ReceiptDetail({ id }: { id: string }) {
  const router = useRouter();
  const [receipt, setReceipt] = useState<ReceiptDto | null>(null);
  const [failed, setFailed] = useState("");
  const [zoom, setZoom] = useState(1);
  const [confirming, setConfirming] = useState(false);

  const [seller, setSeller] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [total, setTotal] = useState("");
  const [category, setCategory] = useState("");
  const [retainUntil, setRetainUntil] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  function fill(r: ReceiptDto) {
    setReceipt(r);
    setSeller(r.seller);
    setDate(r.purchaseDate);
    setContent(r.content);
    setTotal(r.total ?? "");
    setCategory(r.category);
    setRetainUntil(r.retainUntil);
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/receipts/${id}`);
        if (res.status === 401) return router.replace("/login");
        if (res.status === 404) return setFailed("Seda tšekki ei leitud. Võib-olla see kustutati.");
        if (!res.ok) return setFailed("");
        fill(await res.json());
      } catch {
        setFailed("");
      }
    })();
  }, [id, router]);

  async function save() {
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/receipts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller, purchaseDate: date, content, total, category, retainUntil }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error ?? "Salvestamine ebaõnnestus.");
      fill(data);
      setSaved(true);
    } catch {
      setError("Salvestamine ebaõnnestus. Kontrolli ühendust.");
    } finally {
      setBusy(false);
    }
  }

  if (failed) {
    return (
      <div className="space-y-4">
        <ErrorState text={failed} />
        <Link href="/">
          <Button variant="outline">Tagasi avalehele</Button>
        </Link>
      </div>
    );
  }
  if (!receipt) return <p className="text-sm text-muted">Laen...</p>;

  return (
    <div className="space-y-4 pb-16">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Tagasi
      </Link>
      <h1 className="text-2xl font-semibold">{receipt.seller}</h1>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm text-muted">Suurendus {Math.round(zoom * 100)}%</span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label="Vähenda"
              onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.5))}
              disabled={zoom <= MIN_ZOOM}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Suurenda"
              onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.5))}
              disabled={zoom >= MAX_ZOOM}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="max-h-[70vh] overflow-auto bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/receipts/${id}/image`}
            alt={`Tšekk: ${receipt.seller}`}
            style={{ width: `${zoom * 100}%`, maxWidth: "none" }}
            className="mx-auto h-auto"
          />
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="text-lg font-semibold">Andmed</h2>
        <Field label="Müüja">
          <Input value={seller} onChange={(e) => setSeller(e.target.value)} />
        </Field>
        <Field label="Ostukuupäev">
          <DatePicker value={date} onChange={setDate} ariaLabel="Ostukuupäev" />
        </Field>
        <Field label="Ostu sisu">
          <Input value={content} onChange={(e) => setContent(e.target.value)} />
        </Field>
        <Field label="Summa, € (valikuline)">
          <Input value={total} onChange={(e) => setTotal(e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="Kategooria">
          <Select
            value={category}
            onValueChange={setCategory}
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            ariaLabel="Kategooria"
          />
        </Field>
        <Field label="Säilita kuni" hint={`Tšekk kustutatakse automaatselt: ${isoToDisplay(retainUntil)}`}>
          <DatePicker value={retainUntil} onChange={setRetainUntil} min={date} ariaLabel="Säilita kuni" />
        </Field>
        <p className="text-xs text-muted">Lisas: {receipt.addedBy}</p>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="text-sm text-green-700">
            Muudatused on salvestatud.
          </p>
        )}
        <Button onClick={save} disabled={busy} className="w-full">
          {busy ? "Salvestan..." : "Salvesta muudatused"}
        </Button>
      </Card>

      <div className="fixed inset-x-0 bottom-14 z-20 border-t border-border bg-card/95 backdrop-blur md:static md:border-0 md:bg-transparent">
        <div className="mx-auto flex max-w-4xl gap-2 px-4 py-2 md:px-0">
          <Button variant="danger" className="flex-1" onClick={() => setConfirming(true)}>
            <Trash2 className="h-4 w-4" /> Kustuta
          </Button>
        </div>
      </div>

      <ConfirmDelete
        open={confirming}
        onOpenChange={setConfirming}
        receiptId={id}
        label={receipt.seller}
        onDeleted={() => {
          router.replace("/");
          router.refresh();
        }}
      />
    </div>
  );
}
