import type { MetadataRoute } from "next";
import { he } from "@/i18n/dictionaries/he";

/** So "add to home screen" gets the name, the colours and the icon. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: he.meta.title,
    short_name: he.ui.brand,
    description: he.meta.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "he",
    dir: "rtl",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
