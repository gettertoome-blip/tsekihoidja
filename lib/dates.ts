// Dates travel as "yyyy-MM-dd" strings so time zones never shift them.
export function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addYearsIso(iso: string, years: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y + years, m - 1, d);
  // 29 Feb + n years that overflows into March: clamp to the last day of Feb.
  if (target.getMonth() !== m - 1) target.setDate(0);
  return toIso(target);
}

export function isValidIso(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

export function todayIso() {
  return toIso(new Date());
}
