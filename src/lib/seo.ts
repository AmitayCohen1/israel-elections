import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, LOCALE_INFO, getDictionary, getLocale, type Locale } from "@/i18n";

/**
 * The site's public address. Set NEXT_PUBLIC_SITE_URL once there is a real domain; until then Vercel's
 * production address, and localhost in development. Every canonical, sitemap entry and share image hangs off it.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

/** Open Graph wants underscores: he_IL, en_IL. */
export const ogLocale = (l: Locale) => LOCALE_INFO[l].intl.replace("-", "_");

/** The address of one page in one language. `path` is locale-free: "" for home, "/lists/likud". */
export const localeUrl = (l: Locale, path = "") => `/${l}${path}`;

/** The same page in every language, plus x-default (Hebrew), for <link rel="alternate" hreflang>. */
export const languageAlternates = (path = "") => ({
  ...Object.fromEntries(LOCALES.map((l) => [l, localeUrl(l, path)])),
  "x-default": localeUrl(DEFAULT_LOCALE, path),
});

/**
 * A page's metadata: title and description, its canonical address and its siblings in the other languages,
 * and the share card (Open Graph + X) — whose title Next does not derive by itself, so we spell it out.
 * The share image is the language's site card unless the page brings its own.
 */
export async function pageMeta({ path = "", title, description }: { path?: string; title?: string; description?: string }): Promise<Metadata> {
  const lang = await getLocale();
  const { meta, ui } = await getDictionary(lang);
  const shareTitle = title ? meta.titleTemplate.replace("%s", title) : meta.title;
  const desc = description ?? meta.description;
  const image = { url: `/og/${lang}.png`, width: 1200, height: 630, alt: meta.title };
  return {
    ...(title ? { title } : {}),
    description: desc,
    alternates: { canonical: localeUrl(lang, path), languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      siteName: ui.brand,
      url: localeUrl(lang, path),
      title: shareTitle,
      description: desc,
      locale: ogLocale(lang),
      alternateLocale: LOCALES.filter((l) => l !== lang).map(ogLocale),
      images: [image],
    },
    twitter: { card: "summary_large_image", title: shareTitle, description: desc, images: [image] },
  };
}
