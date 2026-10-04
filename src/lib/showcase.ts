import type { List } from "./data";
import { faces } from "./faces";
import { TOPICS } from "./topics";
import type { ListData, Mixed, PersonData, PositionData } from "@/components/showcase";

/**
 * Display data for the hero wall and the orbit, drawn evenly from the given lists:
 * faces are dealt round-robin, and each list contributes one position and one list card.
 */
export function buildShowcase(lists: List[]) {
  const people: PersonData[] = faces(lists, 36).map((f) => ({ href: f.href, name: f.name, img: f.src, slot: f.slot, list: f.list, letters: f.letters }));
  const positions: PositionData[] = lists.flatMap((l, i) => {
    const all = l.platform?.positions ?? [];
    const p = all[i % Math.max(all.length, 1)];
    return p ? [{ href: `/lists/${l.slug}#positions`, topic: TOPICS[p.topic].label, point: p.point, list: l.name, letters: l.letters, img: l.candidates[0]?.image_url ?? null }] : [];
  });
  const listCards: ListData[] = lists.map((l) => ({ href: `/lists/${l.slug}`, name: l.name, letters: l.letters, faces: l.candidates.slice(0, 4).map((c) => c.image_url), count: l.candidates.length }));

  // Interleave the three kinds so any slice of the deck is mixed.
  const mixed: Mixed[] = [];
  for (let i = 0; i < lists.length; i++) {
    if (people[i]) mixed.push({ kind: "person", ...people[i] });
    if (positions[i]) mixed.push({ kind: "position", ...positions[i] });
    // Fewer slip cards than faces: one for every second list.
    if (i % 2 === 0 && listCards[i]) mixed.push({ kind: "list", ...listCards[(i + 7) % listCards.length] });
  }
  return { people, positions, listCards, mixed };
}

/** A few words of a position: drops the repeated "הרשימה" lead-in and cuts at a word boundary. */
export function snippet(point: string, words = 10) {
  const parts = point.replace(/^הרשימה\s+/, "").replace(/[.]$/, "").split(/\s+/);
  return parts.length <= words ? parts.join(" ") : parts.slice(0, words).join(" ").replace(/[,;:]$/, "") + "…";
}

export type Voice = { href: string; img: string; leader: string; list: string; letters: string; topic: string; text: string };

/** One voice per list that has both a photographed lead candidate and a position: who, on what, in a few words. */
export function buildVoices(lists: List[], words = 11): Voice[] {
  return lists.flatMap((l, i) => {
    const leader = l.candidates[0];
    const all = l.platform?.positions ?? [];
    const p = all[(i + 1) % Math.max(all.length, 1)];
    return leader?.image_url && p
      ? [{ href: `/lists/${l.slug}#positions`, img: leader.image_url, leader: leader.display_name, list: l.name, letters: l.letters, topic: TOPICS[p.topic].label, text: snippet(p.point, words) }]
      : [];
  });
}

export type TeamPerson = { name: string; img: string | null; slot: number; href: string };
export type Team = { slug: string; name: string; letters: string; count: number; people: TeamPerson[]; says: { topic: string; text: string } | null };

/** Every list as a team: its first people in slot order (photo or not), and one thing it proposes. */
export function buildTeams(lists: List[], size = 12, words = 13): Team[] {
  return lists.map((l, i) => {
    const all = l.platform?.positions ?? [];
    const p = all[(i + 1) % Math.max(all.length, 1)];
    return {
      slug: l.slug,
      name: l.name,
      letters: l.letters,
      count: l.candidates.length,
      people: l.candidates.slice(0, size).map((c) => ({ name: c.display_name, img: c.image_url, slot: c.position, href: `/lists/${l.slug}/${c.position}` })),
      says: p ? { topic: TOPICS[p.topic].label, text: snippet(p.point, words) } : null,
    };
  });
}
