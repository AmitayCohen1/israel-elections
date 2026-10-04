import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";
import { SITE_URL } from "@/lib/seo";

/** Everything public is open. Kept out: the admin, the API, search results (endless thin pages) and the internal/retired pages. */
export default function robots(): MetadataRoute.Robots {
  const hidden = ["search", "old", "archive", "drafts", "dev-preview", "inbox"];
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", ...LOCALES.flatMap((l) => hidden.map((h) => `/${l}/${h}`))],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
