"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";

export function ConfirmDelete({
  open,
  onOpenChange,
  receiptId,
  label,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptId: string;
  label: string;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/receipts/${receiptId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return setError(data.error ?? "Kustutamine ebaõnnestus.");
      }
      onOpenChange(false);
      onDeleted();
    } catch {
      setError("Kustutamine ebaõnnestus. Kontrolli ühendust.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Kustuta tšekk?"
        description={`Tšekk "${label}" kustutatakse jäädavalt kõigi leibkonna liikmete jaoks. Seda ei saa tagasi võtta.`}
      >
        {error && (
          <p role="alert" className="mb-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Katkesta</Button>
          </DialogClose>
          <Button variant="danger" onClick={remove} disabled={busy}>
            {busy ? "Kustutan..." : "Kustuta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
