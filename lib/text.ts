const EXTRA: Record<string, string> = { ø: "o", æ: "ae", ß: "ss", œ: "oe", đ: "d", ł: "l" };

/**
 * Lower-cases and strips diacritics so "tsekk" matches "tšekk".
 * Covers Estonian letters (õ ä ö ü š ž) through Unicode decomposition,
 * plus letters that don't decompose (ø æ ß ...).
 */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[øæßœđł]/g, (c) => EXTRA[c])
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}
