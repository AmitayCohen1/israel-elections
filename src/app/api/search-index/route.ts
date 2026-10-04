import { getSearchIndex } from "@/lib/data";
import { DEFAULT_LOCALE, hasLocale } from "@/i18n/config";

/** The compact candidate index for the typeahead (?lang=he|en|ar|ru|am); the data itself is served from the "dataset" cache. */
export async function GET(request: Request) {
  const lang = new URL(request.url).searchParams.get("lang") ?? "";
  const index = await getSearchIndex(hasLocale(lang) ? lang : DEFAULT_LOCALE);
  return Response.json(index, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400" },
  });
}
