import type { Locale } from "@/i18n/config";
import type { Candidate, List } from "./data";
import { mkLabel, shortBio } from "./text";

export type Face = { name: string; src: string; href: string; slot: number; list: string; letters: string; color: string | null; sub: string | null };

/**
 * Photographed candidates for display, dealt round-robin across lists so no list gets more
 * faces than another. `offset` rotates which list comes first.
 */
export function faces(lists: List[], count: number, offset = 0, locale: Locale = "he"): Face[] {
  const rotated = [...lists.slice(offset % lists.length), ...lists.slice(0, offset % lists.length)];
  const pools = rotated.map((l) => l.candidates.filter((c): c is Candidate & { image_url: string } => Boolean(c.image_url)).map((c) => ({ c, l })));
  const out: Face[] = [];
  for (let round = 0; out.length < count && round < 60; round++) {
    for (const pool of pools) {
      const x = pool[round];
      if (x && out.length < count) {
        out.push({
          name: x.c.display_name,
          src: x.c.image_url,
          href: `/lists/${x.l.slug}/${x.c.position}`,
          slot: x.c.position,
          list: x.l.name,
          letters: x.l.letters,
          color: x.l.color,
          sub: x.c.knesset ? mkLabel(x.c.knesset, locale) : shortBio(x.c.bio, 60),
        });
      }
    }
  }
  return out;
}
