"use client";
import { useState } from "react";
import { FileDown, ImageDown, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadImage, downloadPdf, shareReceipt } from "@/lib/export";
import type { ReceiptDto } from "@/lib/receipts";

type Action = "image" | "pdf" | "share";

/**
 * Download/share buttons. Used in exactly two places: the image toolbar
 * (download buttons only) and the bottom action bar (all three).
 */
export function ReceiptActions({
  receipt,
  withShare,
  compact,
  onError,
}: {
  receipt: ReceiptDto;
  withShare?: boolean;
  compact?: boolean;
  onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState<Action | null>(null);

  async function run(action: Action) {
    setBusy(action);
    onError("");
    try {
      if (action === "image") await downloadImage(receipt);
      else if (action === "pdf") await downloadPdf(receipt);
      else await shareReceipt(receipt);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Toiming ebaõnnestus.");
    } finally {
      setBusy(null);
    }
  }

  const size = compact ? "sm" : "md";
  const grow = compact ? "" : "flex-1";
  return (
    <>
      <Button variant="outline" size={size} className={grow} disabled={busy !== null} onClick={() => run("image")}>
        <ImageDown className="h-4 w-4" /> Laadi alla pilt
      </Button>
      <Button variant="outline" size={size} className={grow} disabled={busy !== null} onClick={() => run("pdf")}>
        <FileDown className="h-4 w-4" /> Laadi alla PDF
      </Button>
      {withShare && (
        <Button variant="outline" size={size} className={grow} disabled={busy !== null} onClick={() => run("share")}>
          <Share2 className="h-4 w-4" /> Jaga
        </Button>
      )}
    </>
  );
}
