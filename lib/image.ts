"use client";

// Client-side image helpers: everything is rasterized to JPEG/PNG so files
// open everywhere (this also covers SVG samples) and stay under the size limit.

export const MAX_SIDE = 1600;
export const THUMB_SIDE = 360;
export const MAX_BYTES = 5 * 1024 * 1024;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Pilti ei õnnestunud avada."));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Pildi töötlemine ebaõnnestus."))), type, quality),
  );
}

/** Rasterizes any image URL (blob:, data:, same-origin, incl. SVG) onto a white canvas. */
export async function rasterize(
  src: string,
  maxSide: number,
  type: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.85,
): Promise<Blob> {
  const img = await loadImage(src);
  // SVGs without intrinsic size report 0; fall back to a sensible default.
  const w = img.naturalWidth || 720;
  const h = img.naturalHeight || 1000;
  // Upscale small vector images a little so text stays sharp, never beyond maxSide.
  const scale = Math.min(maxSide / Math.max(w, h), src.includes("svg") ? 3 : 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Pildi töötlemine ebaõnnestus.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvasToBlob(canvas, type, quality);
}

/** Resizes to ~1600px JPEG, lowering quality until it fits the 5 MB limit. */
export async function compressForUpload(source: Blob | string): Promise<Blob> {
  const url = typeof source === "string" ? source : URL.createObjectURL(source);
  try {
    for (const q of [0.85, 0.7, 0.55, 0.4]) {
      const blob = await rasterize(url, MAX_SIDE, "image/jpeg", q);
      if (blob.size <= MAX_BYTES) return blob;
    }
    throw new Error("Pilt on liiga suur (üle 5 MB). Proovi väiksemat pilti.");
  } finally {
    if (typeof source !== "string") URL.revokeObjectURL(url);
  }
}

export async function makeThumb(blob: Blob): Promise<Blob> {
  const url = URL.createObjectURL(blob);
  try {
    return await rasterize(url, THUMB_SIDE, "image/jpeg", 0.75);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Faili lugemine ebaõnnestus."));
    r.readAsDataURL(blob);
  });
}
