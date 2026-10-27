import { prisma } from "@/lib/db";
import { HttpError, requireMember, route } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

// ?thumb=1 returns the small preview (falls back to the full image).
export const GET = route(async (req: Request, { params }: Ctx) => {
  const { householdId } = await requireMember();
  const { id } = await params;
  const wantThumb = new URL(req.url).searchParams.get("thumb") === "1";

  const receipt: { thumbData?: Uint8Array | null; imageData: Uint8Array; imageMime: string } | null =
    await prisma.receipt.findFirst({
      where: { id, householdId },
      select: { thumbData: wantThumb, imageData: true, imageMime: true },
    });
  if (!receipt) throw new HttpError(404, "Pilti ei leitud.");

  const thumb = receipt.thumbData ?? null;
  const bytes = thumb ?? receipt.imageData;
  const mime = thumb ? "image/jpeg" : receipt.imageMime;
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      // SVG images must never run scripts, even if opened directly.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
});
