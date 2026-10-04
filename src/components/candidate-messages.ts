import { defineMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import { hebrewKnessets } from "@/lib/text";

/** Picks the right noun form for a count in any of the five languages (Intl plural rules: ru has 3 forms, ar has 6). */
export function plural(locale: Locale, n: number, forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }) {
  return forms[new Intl.PluralRules(locale).select(n)] ?? forms.other;
}

const en = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;

type Mk = { is_current: boolean; female?: boolean; terms: number[] };

/** A Knesset member's record in one line: sitting now, or which Knessets they served in. Same wording as `mkLabel` in lib/text, per language. */
export const mkMessages = defineMessages(
  {
    current: (female: boolean) => (female ? "חברת כנסת מכהנת" : "חבר כנסת מכהן"),
    served: (female: boolean, terms: number[], range: string) => `${female ? "כיהנה" : "כיהן"} ${terms.length === 1 ? `בכנסת ה-${terms[0]}` : `בכנסות ${range}`}`,
  },
  {
    en: {
      current: () => "Sitting member of Knesset",
      served: (_f: boolean, terms: number[], range: string) => `Served in ${terms.length === 1 ? `the ${en(terms[0])} Knesset` : `Knessets ${range}`}`,
    },
    ar: {
      current: (female: boolean) => (female ? "عضوة كنيست حالية" : "عضو كنيست حالي"),
      served: (female: boolean, terms: number[], range: string) => `${female ? "شغلت" : "شغل"} عضوية ${terms.length === 1 ? `الكنيست الـ${terms[0]}` : `الكنيست في الدورات ${range}`}`,
    },
    ru: {
      current: () => "Сейчас депутат Кнессета",
      served: (female: boolean, terms: number[], range: string) => `${female ? "Была" : "Был"} депутатом Кнессета ${terms.length === 1 ? `${terms[0]}-го созыва` : `${range} созывов`}`,
    },
    am: {
      current: () => "የአሁኑ የክኔሴት አባል",
      served: (female: boolean, terms: number[], range: string) => `${terms.length === 1 ? `በ${terms[0]}ኛው ክኔሴት` : `በክኔሴት ${range}`} አባል ${female ? "ነበረች" : "ነበር"}`,
    },
  },
);

export function mkLabelT(t: (typeof mkMessages)[Locale], k: Mk) {
  return k.is_current ? t.current(!!k.female) : t.served(!!k.female, k.terms, hebrewKnessets(k.terms));
}

export const ordinalEn = en;
