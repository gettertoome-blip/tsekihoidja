import { SAMPLES, type Sample } from "@/lib/samples";

export type Extracted = Pick<Sample, "seller" | "date" | "content" | "total">;

export function fromSample(s: Sample): Extracted {
  return { seller: s.seller, date: s.date, content: s.content, total: s.total };
}

/**
 * MOCK extractor: no OCR and no external service. After a short delay it
 * returns realistic Estonian sample data. A demo sample returns its own data
 * (so the printed date matches the form); any other photo gets a random one.
 */
export async function mockExtract(sampleId?: string): Promise<{ sample: Sample; data: Extracted }> {
  await new Promise((r) => setTimeout(r, 1500));
  const sample =
    SAMPLES.find((s) => s.id === sampleId) ?? SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
  return { sample, data: fromSample(sample) };
}
