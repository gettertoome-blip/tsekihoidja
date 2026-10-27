// Demo receipts: the printed date in each SVG (public/samples/<id>.svg) must
// match `date` here, because the form is pre-filled from this definition.
export type Sample = {
  id: string;
  file: string;
  seller: string;
  /** ISO date yyyy-MM-dd; printed as DD.MM.YYYY on the image */
  date: string;
  content: string;
  total: string;
};

export const SAMPLES: Sample[] = [
  { id: "elkjop", file: "/samples/elkjop.svg", seller: "Elkjøp", date: "2026-09-14", content: "Samsungi kõrvaklapid", total: "129.00" },
  { id: "nike", file: "/samples/nike.svg", seller: "Nike", date: "2026-10-02", content: "Jooksukingad", total: "119.90" },
  { id: "bauhof", file: "/samples/bauhof.svg", seller: "Bauhof", date: "2026-08-21", content: "Akutrell", total: "89.00" },
  { id: "rimi", file: "/samples/rimi.svg", seller: "Rimi", date: "2026-10-18", content: "Jalanõud", total: "25.22" },
  { id: "ikea", file: "/samples/ikea.svg", seller: "IKEA", date: "2026-10-05", content: "Raamaturiiul", total: "79.00" },
];

export function sampleLabel(s: Sample) {
  return `${s.seller} – ${s.content}`;
}
