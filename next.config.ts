import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // The topic pages became a section of the home page.
  redirects: async () => [
    { source: "/positions/:topic", destination: "/#:topic", permanent: true },
    { source: "/:lang(he|en|ar|ru|am)/positions/:topic", destination: "/:lang#:topic", permanent: true },
  ],
  images: {
    remotePatterns: [
      new URL("https://upload.wikimedia.org/wikipedia/commons/**"),
      new URL("https://thumb.wikimedia.org/wikipedia/commons/**"),
      new URL("https://i.ytimg.com/vi/**"),
    ],
  },
};

export default nextConfig;
