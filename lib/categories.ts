import { normalize } from "./text";

export const CATEGORIES = [
  "Elektroonika ja kodumasinad",
  "Riided ja jalanõud",
  "Mööbel ja sisustus",
  "Tööriistad ja aed",
  "Sport ja vaba aeg",
  "Auto ja transport",
  "Tervis ja ilu",
  "Muu",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(v: unknown): v is Category {
  return typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);
}

// Keyword stems (diacritics-free) matched against the purchase content.
const KEYWORDS: Record<Exclude<Category, "Muu">, string[]> = {
  "Elektroonika ja kodumasinad": [
    "korvaklapid", "kuularid", "telefon", "arvuti", "tahvel", "teler", "monitor", "kaamera",
    "klaviatuur", "hiir", "laadija", "akupank", "kolar", "nutikell", "konsool", "printer",
    "kulmik", "pesumasin", "tolmuimeja", "kohvimasin", "mikrolaineahi", "veekeetja",
    "blender", "foen", "raseerija", "router",
  ],
  "Riided ja jalanõud": [
    "kingad", "jalanoud", "saapad", "tossud", "sussid", "sandaalid", "jope", "mantel", 
    "puksid", "teksad", "kleit", "sark", "kampsun", "pusa", "sokid", "muts", "kindad", "sall",
    "pesu", "rihm", "vihmakuub",
  ],
  "Mööbel ja sisustus": [
    "diivan", "laud", "tool", "riiul", "voodi", "kapp", "madrats", "lamp", "vaip", "kummut",
    "kardin", "peegel", "komuut", "polster", "sisustus", "padi", "tekk", "valgusti",
  ],
  "Tööriistad ja aed": [
    "trell", "haamer", "saag", "kruvikeeraja", "tooriist", "murulõikur", "murutraktor", "murulikur",
    "labidas", "aiavoolik", "kruvid", "naelad", "varv", "pintsel", "tostuk", "ketaslõikur",
    "ketaslikur", "taimed", "seemned", "muld", "oksakaar", "kasvuhoone",
  ],
  "Sport ja vaba aeg": [
    "jalgratas", "ratas", "pall", "suusad", "matkakott", "telk", "hantlid", "jooksulint", "uisud",
    "kalastus", "ujumis", "jooga", "magamiskott", "mang", "kiiver", "lauamang", "ronimis",
  ],
  "Auto ja transport": [
    "rehvid", "velg", "autooli", "mootorioli", "kojamehed", "autolamp", "pidurid", "kutus",
    "parkimine", "akulaadija auto", "autohooldus", "salongi", "antifriis", "pirn auto",
  ],
  "Tervis ja ilu": [
    "shampoon", "sampoon", "kreem", "parfuum", "vitamiin", "ravim", "hambahari", "meik",
    "huulepulk", "seep", "plaaster", "dusigeel", "deodorant", "prillid", "kontaktlääts",
    "kontaktlaats", "massaaz",
  ],
};

/** Suggests a category from the purchase content (longest keyword match wins). */
export function suggestCategory(content: string): Category {
  const text = normalize(content);
  let best: Category = "Muu";
  let bestLen = 0;
  for (const [category, words] of Object.entries(KEYWORDS) as [Category, string[]][]) {
    for (const w of words) {
      const key = normalize(w);
      if (key.length > bestLen && text.includes(key)) {
        best = category;
        bestLen = key.length;
      }
    }
  }
  return best;
}
