import { defineMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";

const NIKUD = /[֑-ׇ]/g;

/** "בנימין נתניהו (נולד ב-...) הוא פוליטיקאי ישראלי המכהן..." -> "פוליטיקאי ישראלי המכהן..." */
export function shortBio(bio: string | null, max = 70) {
  if (!bio) return null;
  let s = bio.replace(NIKUD, "").replace(/\s*\([^()]*\)/g, "");
  const m = s.match(/\s(?:הוא|היא|היה|הייתה)\s(.+)/);
  if (m) s = m[1];
  s = s.split(/[.;]/)[0].split(/,\s/)[0].trim();
  return s.length > max ? s.slice(0, max).replace(/\s\S*$/, "") + "…" : s;
}

/** The opening of a bio as a couple of readable sentences: brackets and vowel marks dropped, cut at a word. */
export function leadBio(bio: string | null, max = 240) {
  if (!bio) return null;
  const s = bio.replace(NIKUD, "").replace(/\s*\([^()]*\)/g, "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), 0);
  return stop > max * 0.5 ? cut.slice(0, stop + 1) : cut.replace(/\s\S*$/, "") + "…";
}

/** Consecutive Knesset terms collapsed into runs: [20,21,22,25] -> "20–22, 25". Numbers only, so it reads in any language. */
export function knessetRuns(terms: number[]) {
  if (terms.length === 0) return "";
  const runs: string[] = [];
  let start = terms[0];
  for (let i = 1; i <= terms.length; i++) {
    if (terms[i] !== terms[i - 1] + 1) {
      runs.push(start === terms[i - 1] ? `${start}` : `${start}–${terms[i - 1]}`);
      start = terms[i];
    }
  }
  return runs.join(", ");
}

/** Kept for existing callers. */
export const hebrewKnessets = knessetRuns;

const enOrdinal = (n: number) => {
  const r = n % 100;
  return `${n}${r >= 11 && r <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
};

const mk = defineMessages(
  {
    current: (female: boolean) => (female ? "חברת כנסת מכהנת" : "חבר כנסת מכהן"),
    one: (female: boolean, term: number) => `${female ? "כיהנה" : "כיהן"} בכנסת ה-${term}`,
    many: (female: boolean, runs: string) => `${female ? "כיהנה" : "כיהן"} בכנסות ${runs}`,
    short: "ח״כ",
    shortFormer: (female: boolean) => (female ? "ח״כית לשעבר" : "ח״כ לשעבר"),
  },
  {
    en: {
      current: () => "Sitting MK",
      one: (_f: boolean, term: number) => `Served in the ${enOrdinal(term)} Knesset`,
      many: (_f: boolean, runs: string) => `Served in Knessets ${runs}`,
      short: "MK",
      shortFormer: () => "Former MK",
    },
    ar: {
      current: (female: boolean) => (female ? "عضوة كنيست حالية" : "عضو كنيست حالي"),
      one: (female: boolean, term: number) => `${female ? "شغلت" : "شغل"} عضوية الكنيست الـ${term}`,
      many: (female: boolean, runs: string) => `${female ? "شغلت" : "شغل"} عضوية الكنيست في الدورات ${runs}`,
      short: "عضو كنيست",
      shortFormer: (female: boolean) => (female ? "عضوة كنيست سابقة" : "عضو كنيست سابق"),
    },
    ru: {
      current: () => "Действующий депутат Кнессета",
      one: (female: boolean, term: number) => `${female ? "Была" : "Был"} депутатом Кнессета ${term}-го созыва`,
      many: (female: boolean, runs: string) => `${female ? "Была" : "Был"} депутатом Кнессета, созывы ${runs}`,
      short: "Депутат",
      shortFormer: () => "Бывший депутат",
    },
    am: {
      current: () => "የአሁኑ የክኔሴት አባል",
      one: (female: boolean, term: number) => `በ${term}ኛው ክኔሴት አባል ${female ? "ነበረች" : "ነበር"}`,
      many: (female: boolean, runs: string) => `በክኔሴቶች ${runs} አባል ${female ? "ነበረች" : "ነበር"}`,
      short: "የክኔሴት አባል",
      shortFormer: () => "የቀድሞ የክኔሴት አባል",
    },
  },
);

type MkLike = { is_current: boolean; female?: boolean; terms: number[] };

/** "Sitting MK" / "Served in Knessets 19–21". Hebrew unless a locale is given. */
export function mkLabel(k: MkLike, locale: Locale = "he") {
  const t = mk[locale];
  const female = !!k.female;
  if (k.is_current) return t.current(female);
  return k.terms.length === 1 ? t.one(female, k.terms[0]) : t.many(female, knessetRuns(k.terms));
}

export function mkShort(k: MkLike, locale: Locale = "he") {
  const t = mk[locale];
  return k.is_current ? t.short : t.shortFormer(!!k.female);
}
