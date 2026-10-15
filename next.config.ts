import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Old addresses from before the four sections (2026-10-15): each lands where its content lives now.
  redirects: async () =>
    [
      ["/positions/:topic", "/positions#:topic"],
      ["/topics/:topic(security|economy|religion_state|judiciary|housing|education|welfare_health|governance)", "/positions#:topic"],
      ["/topics", "/positions"],
      ["/map", "/positions"],
      ["/lists", "/"],
      ["/people", "/"],
      ["/explore", "/tools"],
    ].flatMap(([from, to]) => [
      { source: from, destination: to, permanent: false },
      { source: `/:lang(he|en|ar|ru|am)${from}`, destination: `/:lang${to === "/" ? "" : to}`, permanent: false },
    ]),
  images: {
    remotePatterns: [
      new URL("https://upload.wikimedia.org/wikipedia/commons/**"),
      new URL("https://thumb.wikimedia.org/wikipedia/commons/**"),
      new URL("https://i.ytimg.com/vi/**"),
    ],
  },
};

export default nextConfig;
