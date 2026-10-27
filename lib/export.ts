"use client";
import { isoToDisplay } from "@/lib/dates";
import { normalize } from "@/lib/text";
import { blobToDataUrl, MAX_SIDE, rasterize } from "@/lib/image";
import type { ReceiptDto } from "@/lib/receipts";

async function fetchImage(id: string): Promise<Blob> {
  const res = await fetch(`/api/receipts/${id}/image`);
  if (!res.ok) throw new Error("Pildi laadimine ebaõnnestus.");
  return res.blob();
}

function fileBase(r: ReceiptDto) {
  const slug = normalize(r.seller).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tsekk";
  return `tsekk-${slug}-${r.purchaseDate}`;
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Always yields a JPEG or PNG, so the file opens everywhere (SVGs are rasterized). */
async function rasterImage(id: string): Promise<{ blob: Blob; ext: "jpg" | "png" }> {
  const source = await fetchImage(id);
  if (source.type === "image/jpeg") return { blob: source, ext: "jpg" };
  if (source.type === "image/png") return { blob: source, ext: "png" };
  const url = URL.createObjectURL(source);
  try {
    return { blob: await rasterize(url, MAX_SIDE, "image/jpeg", 0.9), ext: "jpg" };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadImage(r: ReceiptDto) {
  const { blob, ext } = await rasterImage(r.id);
  saveBlob(blob, `${fileBase(r)}.${ext}`);
}

export async function downloadPdf(r: ReceiptDto) {
  const { jsPDF } = await import("jspdf");
  const { blob } = await rasterImage(r.id);
  // jsPDF needs JPEG/PNG data; PNGs are converted to JPEG to keep the file small.
  const jpegBlob =
    blob.type === "image/jpeg"
      ? blob
      : await (async () => {
          const url = URL.createObjectURL(blob);
          try {
            return await rasterize(url, MAX_SIDE, "image/jpeg", 0.9);
          } finally {
            URL.revokeObjectURL(url);
          }
        })();
  const dataUrl = await blobToDataUrl(jpegBlob);

  const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => reject(new Error("Pildi lugemine ebaõnnestus."));
    img.src = dataUrl;
  });

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 15;
  const pageW = 210;
  const pageH = 297;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(r.seller, margin, margin + 6);

  doc.setFontSize(11);
  const rows: [string, string][] = [
    ["Ostukuupäev", isoToDisplay(r.purchaseDate)],
    ["Ostu sisu", r.content],
    ["Summa", r.total ? `${r.total} €` : "-"],
    ["Kategooria", r.category],
  ];
  let y = margin + 16;
  for (const [label, value] of rows) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value, pageW - margin * 2 - 38) as string[];
    doc.text(lines, margin + 38, y);
    y += 6 * lines.length + 1;
  }

  const top = y + 4;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin - top;
  const scale = Math.min(maxW / dims.w, maxH / dims.h);
  const w = dims.w * scale;
  const h = dims.h * scale;
  doc.addImage(dataUrl, "JPEG", margin + (maxW - w) / 2, top, w, h);

  doc.save(`${fileBase(r)}.pdf`);
}

export async function shareReceipt(r: ReceiptDto): Promise<"shared" | "mailto"> {
  const title = `Tšekk: ${r.seller}`;
  const text = [
    `${r.seller} – ${r.content}`,
    `Ostukuupäev: ${isoToDisplay(r.purchaseDate)}`,
    r.total ? `Summa: ${r.total} €` : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      const { blob, ext } = await rasterImage(r.id);
      const file = new File([blob], `${fileBase(r)}.${ext}`, { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title, text, files: [file] });
      } else {
        await navigator.share({ title, text });
      }
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "shared"; // user cancelled
      // otherwise fall back to e-mail
    }
  }
  window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`;
  return "mailto";
}
