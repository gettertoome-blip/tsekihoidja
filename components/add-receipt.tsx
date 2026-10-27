"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, CheckCircle2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CATEGORIES, suggestCategory } from "@/lib/categories";
import { addYearsIso, isoToDisplay } from "@/lib/dates";
import { fromSample, mockExtract } from "@/lib/extract";
import { compressForUpload, makeThumb } from "@/lib/image";
import { SAMPLES, sampleLabel } from "@/lib/samples";
import { useLocalDemo } from "@/lib/demo-client";

type Step = "photo" | "reading" | "review" | "keep" | "done";
type Photo = { url: string; file?: File; sampleId?: string };

export function AddReceipt({ demo }: { demo: boolean }) {
  const [localDemo] = useLocalDemo();
  const showSamples = demo && localDemo;

  const [step, setStep] = useState<Step>("photo");
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [image, setImage] = useState<Blob | null>(null);
  const [sampleId, setSampleId] = useState<string>("");
  const [seller, setSeller] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [total, setTotal] = useState("");
  const [retention, setRetention] = useState<"default" | "custom">("default");
  const [customDate, setCustomDate] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[CATEGORIES.length - 1]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  // Free the object URL when a photo is replaced or the page closes.
  useEffect(() => {
    const url = photo?.file ? photo.url : null;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [photo]);

  const retainUntil = retention === "default" ? (date ? addYearsIso(date, 2) : "") : customDate;

  function pickFile(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) return setError("Palun vali pildifail.");
    setPhoto({ url: URL.createObjectURL(file), file });
  }

  function pickSample(id: string) {
    const s = SAMPLES.find((x) => x.id === id);
    if (s) setPhoto({ url: s.file, sampleId: s.id });
  }

  function retake() {
    setPhoto(null);
    setImage(null);
    setError("");
  }

  function applySample(id: string) {
    const s = SAMPLES.find((x) => x.id === id);
    if (!s) return;
    const d = fromSample(s);
    setSampleId(s.id);
    setSeller(d.seller);
    setDate(d.date);
    setContent(d.content);
    setTotal(d.total);
  }

  async function usePhoto() {
    if (!photo) return;
    setError("");
    setStep("reading");
    try {
      const [blob, result] = await Promise.all([
        compressForUpload(photo.file ?? photo.url),
        mockExtract(photo.sampleId),
      ]);
      setImage(blob);
      applySample(result.sample.id);
      setStep("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pildi töötlemine ebaõnnestus.");
      setStep("photo");
    }
  }

  function goToKeep() {
    setError("");
    if (!seller.trim() || !content.trim() || !date) {
      return setError("Müüja, ostukuupäev ja ostu sisu on kohustuslikud.");
    }
    if (total && !/^\d{1,8}([.,]\d{1,2})?$/.test(total.trim())) {
      return setError("Summa peab olema number, nt 129.90.");
    }
    setCategory(suggestCategory(content));
    setStep("keep");
  }

  async function save() {
    if (!image) return;
    if (!retainUntil) return setError("Vali säilitamise kuupäev.");
    if (retainUntil < date) return setError("Säilitustähtaeg ei saa olla enne ostukuupäeva.");
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("seller", seller.trim());
      form.set("purchaseDate", date);
      form.set("content", content.trim());
      form.set("total", total.trim());
      form.set("category", category);
      form.set("retainUntil", retainUntil);
      form.set("image", image, "receipt.jpg");
      form.set("thumb", await makeThumb(image), "thumb.jpg");
      const res = await fetch("/api/receipts", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error ?? "Salvestamine ebaõnnestus.");
      setStep("done");
    } catch {
      setError("Salvestamine ebaõnnestus. Kontrolli ühendust ja proovi uuesti.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setPhoto(null);
    setImage(null);
    setSampleId("");
    setSeller("");
    setDate("");
    setContent("");
    setTotal("");
    setRetention("default");
    setCustomDate("");
    setError("");
    setStep("photo");
  }

  const errorEl = error && (
    <p role="alert" className="text-sm text-red-700">
      {error}
    </p>
  );

  if (step === "done") {
    return (
      <Card className="flex flex-col items-center gap-3 px-6 py-10 text-center" role="status">
        <CheckCircle2 className="h-14 w-14 text-green-700" />
        <h2 className="text-xl font-semibold">Tšekk on salvestatud!</h2>
        <p className="text-sm text-muted">
          Leiad selle nüüd avalehelt ja see kustutatakse automaatselt {isoToDisplay(retainUntil)}.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/">
            <Button>Vaata tšekke</Button>
          </Link>
          <Button variant="outline" onClick={reset}>
            Lisa veel üks
          </Button>
        </div>
      </Card>
    );
  }

  if (step === "reading") {
    return (
      <Card className="flex flex-col items-center gap-4 px-6 py-14 text-center" role="status">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium">Loen tšekki...</p>
      </Card>
    );
  }

  if (step === "photo") {
    return (
      <div className="space-y-4">
        {photo ? (
          <Card className="space-y-4 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="Tšeki eelvaade" className="mx-auto max-h-[55vh] rounded-lg border border-border" />
            {errorEl}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={retake}>
                Pildista uuesti
              </Button>
              <Button className="flex-1" onClick={usePhoto}>
                Kasuta fotot
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="space-y-4 p-5">
            <p className="text-sm text-muted">Pildista tšekk või vali pilt oma seadmest.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button onClick={() => cameraRef.current?.click()}>
                <Camera className="h-5 w-5" /> Pildista
              </Button>
              <Button variant="outline" onClick={() => uploadRef.current?.click()}>
                <Upload className="h-5 w-5" /> Lae pilt üles
              </Button>
            </div>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => {
                pickFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                pickFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {errorEl}
          </Card>
        )}

        {showSamples && !photo && (
          <Card className="space-y-3 border-dashed p-4">
            <p className="text-sm font-medium">Demorežiim: vali näidistšekk</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {SAMPLES.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => pickSample(s.id)}
                    className="w-full space-y-1 rounded-lg border border-border bg-white p-1.5 text-left hover:border-primary"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.file} alt={sampleLabel(s)} className="h-28 w-full rounded object-cover object-top" />
                    <span className="block truncate text-xs font-medium">{s.seller}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    );
  }

  if (step === "review") {
    return (
      <Card className="space-y-4 p-5">
        <p className="rounded-lg bg-primary-soft px-3 py-2 text-sm font-medium text-primary-dark">
          Tuvastatud automaatselt - palun kontrolli
        </p>
        <Field label="Näidis (demo)">
          <Select
            value={sampleId}
            onValueChange={applySample}
            options={SAMPLES.map((s) => ({ value: s.id, label: sampleLabel(s) }))}
            ariaLabel="Vaheta näidist"
          />
        </Field>
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
        {errorEl}
        <Button className="w-full" onClick={goToKeep}>
          Kinnita
        </Button>
      </Card>
    );
  }

  // step === "keep"
  return (
    <Card className="space-y-5 p-5">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Säilita kuni</legend>
        <label className="flex items-center gap-3 rounded-lg border border-border p-3">
          <input
            type="radio"
            className="accent-primary"
            checked={retention === "default"}
            onChange={() => setRetention("default")}
          />
          2 aastat ostukuupäevast
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-border p-3">
          <input
            type="radio"
            className="accent-primary"
            checked={retention === "custom"}
            onChange={() => {
              setRetention("custom");
              if (!customDate) setCustomDate(addYearsIso(date, 2));
            }}
          />
          Vali ise kuupäev
        </label>
        {retention === "custom" && (
          <DatePicker value={customDate} onChange={setCustomDate} min={date} ariaLabel="Säilita kuni" />
        )}
        {retainUntil && (
          <p className="text-sm text-muted">Tšekk kustutatakse automaatselt: {isoToDisplay(retainUntil)}</p>
        )}
      </fieldset>

      <Field label="Kategooria" hint="Soovitus tehti ostu sisu põhjal, saad seda muuta.">
        <Select
          value={category}
          onValueChange={setCategory}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          ariaLabel="Kategooria"
        />
      </Field>
      {errorEl}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep("review")}>
          Tagasi
        </Button>
        <Button className="flex-1" onClick={save} disabled={busy}>
          {busy ? "Salvestan..." : "Salvesta"}
        </Button>
      </div>
    </Card>
  );
}
