/** The dashboard's views. `match` says which paths light up the entry; `key` names the label in the dictionary. */
export const VIEWS = [
  { id: "home", href: "/", key: "home", match: ["/"] },
  { id: "topics", href: "/topics", key: "topics", match: ["/topics", "/positions"] },
  { id: "map", href: "/map", key: "map", match: ["/map"] },
  { id: "people", href: "/people", key: "people", match: ["/people"] },
  { id: "lists", href: "/lists", key: "lists", match: ["/lists"] },
  { id: "vote", href: "/how-it-works", key: "vote", match: ["/how-it-works"] },
] as const;

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
