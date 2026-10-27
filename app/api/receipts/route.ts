import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { HttpError, requireMember, route } from "@/lib/api";
import { IMAGE_MIMES, listSelect, MAX_IMAGE_BYTES, parseFields, serialize } from "@/lib/receipts";

export const dynamic = "force-dynamic";

export const GET = route(async () => {
  const { householdId } = await requireMember();
  const receipts = await prisma.receipt.findMany({
    where: { householdId },
    select: listSelect,
    orderBy: [{ purchaseDate: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(receipts.map(serialize));
});

async function readImage(file: FormDataEntryValue | null, label: string, required: boolean) {
  if (!(file instanceof File) || file.size === 0) {
    if (required) throw new HttpError(400, "Pilt on kohustuslik.");
    return null;
  }
  if (file.size > MAX_IMAGE_BYTES) throw new HttpError(413, `${label} on suurem kui 5 MB.`);
  const mime = file.type.toLowerCase();
  if (!IMAGE_MIMES.includes(mime)) throw new HttpError(400, "Toetamata pildivorming.");
  return { data: Buffer.from(await file.arrayBuffer()), mime };
}

export const POST = route(async (req: Request) => {
  const { user, householdId } = await requireMember();
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new HttpError(400, "Vigane päring.");
  }
  const fields = parseFields(Object.fromEntries(form.entries()));
  const image = await readImage(form.get("image"), "Pilt", true);
  const thumb = await readImage(form.get("thumb"), "Eelvaade", false);

  const created = await prisma.receipt.create({
    data: {
      ...fields,
      householdId,
      addedById: user.id,
      imageData: image!.data,
      imageMime: image!.mime,
      thumbData: thumb?.data,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: created.id }, { status: 201 });
});
