import "server-only";
import { lang } from "next/root-params";
import type { Dictionary } from "./dictionaries/he";
import { DEFAULT_LOCALE, LOCALE_INFO, hasLocale, type Locale } from "./config";

export { LOCALES, LOCALE_INFO, DEFAULT_LOCALE, hasLocale, type Locale } from "./config";
export type { Dictionary } from "./dictionaries/he";

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  he: () => import("./dictionaries/he").then((m) => m.he),
  en: () => import("./dictionaries/en").then((m) => m.en),
  ar: () => import("./dictionaries/ar").then((m) => m.ar),
  ru: () => import("./dictionaries/ru").then((m) => m.ru),
  am: () => import("./dictionaries/am").then((m) => m.am),
};

/** The language of the page being rendered, from the URL. Server components only. */
export async function getLocale(): Promise<Locale> {
  const l = await lang();
  return l && hasLocale(l) ? l : DEFAULT_LOCALE;
}

/** The Intl tag for numbers and dates in the current language. */
export async function getIntl() {
  return LOCALE_INFO[await getLocale()].intl;
}

export async function getDictionary(locale?: Locale) {
  return loaders[locale ?? (await getLocale())]();
}

/** Server: the page's strings in the current language. */
export async function getMessages<T>(m: Record<Locale, T>): Promise<T> {
  return m[await getLocale()];
}
