"use client";
import { useState } from "react";
import Link from "next/link";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { Eye, MoreVertical, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ConfirmDelete } from "@/components/confirm-delete";
import { isoToDisplay } from "@/lib/dates";
import type { ReceiptDto } from "@/lib/receipts";

export function ReceiptCard({ receipt, onDeleted }: { receipt: ReceiptDto; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <Card className="relative flex gap-3 p-3">
      <Link href={`/tsekk/${receipt.id}`} className="flex min-w-0 flex-1 gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/receipts/${receipt.id}/image?thumb=1`}
          alt={`Tšekk: ${receipt.seller}`}
          loading="lazy"
          className="h-24 w-20 shrink-0 rounded-lg border border-border bg-white object-cover object-top"
        />
        <div className="min-w-0 space-y-0.5">
          <p className="truncate font-semibold">{receipt.seller}</p>
          <p className="truncate text-sm">{receipt.content}</p>
          <p className="text-sm text-muted">
            {isoToDisplay(receipt.purchaseDate)}
            {receipt.total && ` · ${receipt.total} €`}
          </p>
          <p className="truncate text-xs">
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-primary-dark">{receipt.category}</span>
          </p>
          <p className="text-xs text-muted">
            Kustub: {isoToDisplay(receipt.retainUntil)} · Lisas: {receipt.addedBy}
          </p>
        </div>
      </Link>

      <Menu.Root>
        <Menu.Trigger
          aria-label="Tšeki menüü"
          className="absolute right-2 top-2 rounded-lg p-1.5 text-muted hover:bg-primary-soft"
        >
          <MoreVertical className="h-5 w-5" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content
            align="end"
            className="z-50 min-w-40 rounded-lg border border-border bg-card p-1 shadow-soft"
          >
            <Menu.Item asChild>
              <Link
                href={`/tsekk/${receipt.id}`}
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-highlighted:bg-primary-soft"
              >
                <Eye className="h-4 w-4" /> Ava
              </Link>
            </Menu.Item>
            <Menu.Item
              onSelect={() => setConfirming(true)}
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-700 outline-none data-highlighted:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Kustuta
            </Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>

      <ConfirmDelete
        open={confirming}
        onOpenChange={setConfirming}
        receiptId={receipt.id}
        label={receipt.seller}
        onDeleted={onDeleted}
      />
    </Card>
  );
}
