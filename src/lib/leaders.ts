import { getTranslator, type List } from "@/lib/data";
import type { LeaderEntry, PersonCard } from "@/components/people-explorer";
import type { Locale } from "@/i18n/config";
import { leadBio, mkLabel, shortBio } from "@/lib/text";

type Researched = { people: { position: number; name?: string; headline: string | null; facts: { label: string; value: string; source_url?: string }[] }[] };

/** The researched career lines and facts for the top of a list, when we have them. */
async function researched(slug: string): Promise<Researched | null> {
  return import(`../../data/people/${slug}.json`).then((m) => m.default as Researched).catch(() => null);
}

/** Hebrew labels; safe to pass straight to `.map`. */
export const leaderEntry = (l: List) => leaderEntryIn(l, "he");

/** `locale` picks the language of the generated labels (the role line); the researched lines and facts come as the data has them. */
export async function leaderEntryIn(l: List, locale: Locale): Promise<LeaderEntry> {
  const extra = await researched(l.slug);
  const t = await getTranslator();
  const people: PersonCard[] = l.candidates.slice(0, 5).map((c) => {
    const r = extra?.people.find((p) => p.position === c.position);
    // Where the database only has the official surname-first form, prefer the natural-order name from the research.
    const pid = `${l.slug}:${c.position}`;
    const natural = c.display_name === c.official_name && r?.name ? t("people", pid, "name", r.name) : undefined;
    return {
      position: c.position,
      name: natural ?? c.display_name,
      img: c.image_url,
      role: c.knesset ? mkLabel(c.knesset, locale) : null,
      line: (r?.headline ? t("people", pid, "headline", r.headline) : null) ?? shortBio(c.bio, 90),
      bio: leadBio(c.bio, 420),
      facts: (r?.facts ?? []).map((f, i) => ({ label: t("people", pid, `facts.${i}.label`, f.label), value: t("people", pid, `facts.${i}.value`, f.value), url: f.source_url })),
    };
  });
  const sittingMks = l.candidates.filter((c) => c.knesset?.is_current).length;
  const lead = l.candidates[0];
  // The grid holds the lists in the polls and any list whose lead we already have a photo or a background for; the rest are folded.
  const known = l.tier === "main" || !!lead?.image_url || !!lead?.bio;
  return { slug: l.slug, listName: l.name, color: l.color, main: known, sittingMks, people };
}
