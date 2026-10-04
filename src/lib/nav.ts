/**
 * The dashboard's views. `match` says which paths light up the entry; `key` names the label in the dictionary.
 * Two of them hold several pages that show the same thing in different ways (see MODES): the entry leads to the first.
 */
export const VIEWS = [
  { id: "home", href: "/", key: "home", match: ["/"] },
  { id: "quiz", href: "/quiz", key: "quiz", match: ["/quiz"] },
  { id: "map", href: "/map", key: "positions", match: ["/map", "/topics", "/positions", "/closeness"] },
  { id: "lists", href: "/lists", key: "lists", match: ["/lists", "/people"] },
  { id: "coalition", href: "/coalition", key: "coalition", match: ["/coalition"] },
  { id: "vote", href: "/how-it-works", key: "vote", match: ["/how-it-works"] },
] as const;

/** Pages that are modes of one view: the positions (the map, by topic, who is close to whom) and the parties (the parties, their leaders). Each page shows its group as tabs. */
export const MODES = [
  [
    { href: "/map", key: "map" },
    { href: "/topics", key: "topics" },
    { href: "/closeness", key: "closeness" },
  ],
  [
    { href: "/lists", key: "lists" },
    { href: "/people", key: "people" },
  ],
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
