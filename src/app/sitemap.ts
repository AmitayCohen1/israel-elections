import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/config";
import { getDataset } from "@/lib/data";
import { SITE_URL, languageAlternates, localeUrl } from "@/lib/seo";

const VIEWS = ["", "/topics", "/quiz", "/coalition", "/closeness", "/people", "/lists", "/how-it-works", "/about", "/resources", "/contact"];

/** Every public page in every language, each entry listing its siblings in the other languages. ~1.5k pages × 5 languages, well under the 50k limit. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lists = await getDataset(DEFAULT_LOCALE);
  const abs = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, SITE_URL + v]));
  const entry = (path: string, priority: number) =>
    LOCALES.map((l) => ({
      url: SITE_URL + localeUrl(l, path),
      changeFrequency: "daily" as const,
      priority,
      alternates: { languages: abs(languageAlternates(path)) },
    }));
  return [
    ...VIEWS.flatMap((p) => entry(p, p === "" ? 1 : 0.8)),
    ...lists.flatMap((l) => [
      ...entry(`/lists/${l.slug}`, 0.7),
      ...l.candidates.flatMap((c) => entry(`/lists/${l.slug}/${c.position}`, c.position <= 10 ? 0.5 : 0.3)),
    ]),
  ];
}
