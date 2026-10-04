import type { SearchEntry } from "./data";

/**
 * Shared name matching for the search page and the typeahead: normalized, prefix-per-term.
 * Works across scripts: Hebrew (niqqud, quotes, maqaf), Arabic (harakat, alef/yaa/taa-marbuta variants),
 * Latin and Cyrillic (case, diacritics, ё), Ethiopic (no folding needed).
 */
export const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // niqqud, Arabic harakat, Latin/Cyrillic diacritics, hamza-on-alef -> alef
    .replace(/[ـ]/g, "") // tatweel
    .replace(/["'׳״`’‘“”«»]/g, "")
    .replace(/[-־–—_.,]/g, " ")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export type Prepared = { e: SearchEntry; tokens: string[] };

export const prepare = (index: SearchEntry[]): Prepared[] =>
  index.map((e) => ({ e, tokens: norm(`${e.n} ${e.o} ${e.a ?? ""}`).split(" ").filter(Boolean) }));

export function match(prepared: Prepared[], q: string): SearchEntry[] {
  const terms = norm(q).split(" ").filter(Boolean);
  if (terms.length === 0) return [];
  return prepared
    .filter(({ tokens }) => terms.every((t) => tokens.some((tok) => tok.startsWith(t))))
    .map(({ e }) => e)
    .sort((a, b) => a.p - b.p);
}
