/** The translation index: every language the site speaks, and how each one is laid out. Hebrew is the base. */
export const LOCALES = ["he", "en", "ar", "ru", "am"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "he";

type LocaleInfo = {
  /** The language's own name, for the switcher. */
  native: string;
  english: string;
  dir: "rtl" | "ltr";
  /** BCP 47 tag for Intl (numbers, dates). */
  intl: string;
  /** Script, so we know which font subset to load. */
  script: "Hebrew" | "Latin" | "Arabic" | "Cyrillic" | "Ethiopic";
};

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  he: { native: "עברית", english: "Hebrew", dir: "rtl", intl: "he-IL", script: "Hebrew" },
  en: { native: "English", english: "English", dir: "ltr", intl: "en-IL", script: "Latin" },
  ar: { native: "العربية", english: "Arabic", dir: "rtl", intl: "ar-IL", script: "Arabic" },
  ru: { native: "Русский", english: "Russian", dir: "ltr", intl: "ru-IL", script: "Cyrillic" },
  am: { native: "አማርኛ", english: "Amharic", dir: "ltr", intl: "am-ET", script: "Ethiopic" },
};

export const hasLocale = (l: string): l is Locale => (LOCALES as readonly string[]).includes(l);
