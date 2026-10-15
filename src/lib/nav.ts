/**
 * The site's four sections. Every page belongs to exactly one, and the bar marks it: the parties (the home page and each
 * party's page), the positions (one page, its topics as tabs), the tools (a hub and each tool) and how to vote.
 */
export const VIEWS = [
  { id: "parties", href: "/", key: "lists", match: ["/", "/lists"] },
  { id: "positions", href: "/positions", key: "positions", match: ["/positions"] },
  { id: "tools", href: "/tools", key: "tools", match: ["/tools", "/quiz", "/coalition", "/closeness"] },
  { id: "vote", href: "/how-it-works", key: "vote", match: ["/how-it-works"] },
] as const;

/** About the site, in the footer only. */
export const MORE = [
  { id: "about", href: "/about", key: "about" },
  { id: "links", href: "/resources", key: "resources" },
  { id: "contact", href: "/contact", key: "contact" },
] as const;

/** The path without its language prefix: "/en/lists/likud" becomes "/lists/likud". */
export const stripLocale = (path: string) => path.replace(/^\/(?:he|en|ar|ru|am)(?=\/|$)/, "") || "/";

export function isActive(path: string, match: readonly string[]) {
  const p = stripLocale(path);
  return match.some((m) => (m === "/" ? p === "/" : p === m || p.startsWith(m + "/")));
}
