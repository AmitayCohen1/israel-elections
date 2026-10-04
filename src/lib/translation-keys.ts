// The translation key schema, shared by the data layer (overlay), scripts/i18n-export.mjs and scripts/i18n-import.mjs.
// Keep this file free of TypeScript-only runtime syntax (no enums/namespaces): Node imports it directly.
//
// A translation is one row of `translations` (entity, entity_id, field, locale) -> value, with the Hebrew base stored
// on the entity itself. Keys in work files are written "entity|entity_id|field".
//
//   entity               entity_id            fields
//   lists                slug                 name, official_name, summary, parties.<i>, background.<i>
//   candidates           "slug:position"      display_name, official_name, bio
//   platform_positions   id (serial)          point, quote, source_title
//   list_platforms       slug                 topic_titles.<topic>, topic_digests.<topic>, self_description.quote,
//                                             self_description.source_title, platform_doc.title, notes
//   people               "slug:position"      name, headline, facts.<i>.label, facts.<i>.value   (data/people/<slug>.json)
//   knesset              the Hebrew string    text   (role / detail / faction strings of candidates.knesset; shared)
//
// Staleness: translations.src_hash = srcHash(Hebrew text it was made from). A row whose hash no longer matches the
// current Hebrew text (or whose id shifted after a re-seed) is ignored and re-queued by the export.
// candidates.official_name is only queued when it differs from display_name; otherwise it reuses display_name's translation.
import { createHash } from "node:crypto";

export const TRANSLATED_LOCALES = ["en", "ar", "ru", "am"] as const;
export type TranslatedLocale = (typeof TRANSLATED_LOCALES)[number];

/** name: transliterate/established spelling. label: short title or role. prose: running text. quote: verbatim quote from the party's own words. */
export type ItemKind = "name" | "label" | "prose" | "quote";

export type TItem = { entity: string; entity_id: string; field: string; he: string; kind: ItemKind; ctx?: string };

export const tkey = (entity: string, entityId: string | number, field: string) => `${entity}|${entityId}|${field}`;
export const parseKey = (key: string) => {
  const [entity, ...rest] = key.split("|");
  const field = rest.pop() as string;
  return { entity, entity_id: rest.join("|"), field };
};

/** Short stable hash of a Hebrew source string. */
export const srcHash = (he: string) => createHash("md5").update(he).digest("hex").slice(0, 12);

/** Row shapes as selected from the database (only the columns used here). */
export type SourceRows = {
  lists: { slug: string; name: string; official_name: string; summary: string | null; parties: string[]; background: string[] }[];
  candidates: {
    list_slug: string;
    position: number;
    official_name: string;
    display_name: string;
    bio: string | null;
    knesset: { is_current?: boolean; factions?: { name: string }[]; roles?: { role: string; detail: string | null }[] } | null;
  }[];
  platforms: {
    list_slug: string;
    platform_doc: { title?: string } | null;
    self_description: { quote?: string; source_title?: string } | null;
    topic_titles: Record<string, string> | null;
    topic_digests: Record<string, string> | null;
    notes: string | null;
  }[];
  positions: { id: number; point: string; quote: string; source_title: string | null }[];
  people?: { slug: string; people: { position: number; name?: string; headline?: string | null; facts?: { label: string; value: string }[] }[] }[];
};

/** Every translatable string in the dataset, in a stable order. Empty strings are skipped. */
export function collectItems(src: SourceRows): TItem[] {
  const out: TItem[] = [];
  const add = (entity: string, id: string | number, field: string, he: string | null | undefined, kind: ItemKind, ctx?: string) => {
    if (he && he.trim()) out.push({ entity, entity_id: String(id), field, he, kind, ctx });
  };
  const listName = new Map(src.lists.map((l) => [l.slug, l.name]));

  for (const l of src.lists) {
    add("lists", l.slug, "name", l.name, "name");
    add("lists", l.slug, "official_name", l.official_name, "name");
    add("lists", l.slug, "summary", l.summary, "prose", l.name);
    l.parties.forEach((p, i) => add("lists", l.slug, `parties.${i}`, p, "name", `מפלגה ברשימת ${l.name}`));
    l.background.forEach((b, i) => add("lists", l.slug, `background.${i}`, b, "prose", l.name));
  }

  for (const c of src.candidates) {
    const id = `${c.list_slug}:${c.position}`;
    const ctx = `רשימת ${listName.get(c.list_slug) ?? c.list_slug}, מקום ${c.position}${c.knesset?.is_current ? ", חבר/ת הכנסת מכהן/ת" : ""}${c.bio ? ` — ${c.bio.slice(0, 70)}` : ""}`;
    add("candidates", id, "display_name", c.display_name, "name", ctx);
    if (c.official_name !== c.display_name) add("candidates", id, "official_name", c.official_name, "name", ctx);
    add("candidates", id, "bio", c.bio, "prose", c.display_name);
  }

  for (const p of src.platforms) {
    const ctx = listName.get(p.list_slug);
    add("list_platforms", p.list_slug, "self_description.quote", p.self_description?.quote, "quote", ctx);
    add("list_platforms", p.list_slug, "self_description.source_title", p.self_description?.source_title, "label", ctx);
    add("list_platforms", p.list_slug, "platform_doc.title", p.platform_doc?.title, "label", ctx);
    add("list_platforms", p.list_slug, "notes", p.notes, "prose", ctx);
    for (const [t, v] of Object.entries(p.topic_titles ?? {})) add("list_platforms", p.list_slug, `topic_titles.${t}`, v, "label", ctx);
    for (const [t, v] of Object.entries(p.topic_digests ?? {})) add("list_platforms", p.list_slug, `topic_digests.${t}`, v, "prose", ctx);
  }

  for (const x of src.positions) {
    add("platform_positions", x.id, "point", x.point, "prose");
    add("platform_positions", x.id, "quote", x.quote, "quote");
    add("platform_positions", x.id, "source_title", x.source_title, "label");
  }

  for (const f of src.people ?? []) {
    for (const p of f.people) {
      const id = `${f.slug}:${p.position}`;
      add("people", id, "name", p.name, "name", `רשימת ${listName.get(f.slug) ?? f.slug}, מקום ${p.position}`);
      add("people", id, "headline", p.headline, "label");
      (p.facts ?? []).forEach((x, i) => {
        add("people", id, `facts.${i}.label`, x.label, "label");
        add("people", id, `facts.${i}.value`, x.value, "prose");
      });
    }
  }

  // Knesset roles and parties are shared by many candidates, so they are keyed by the Hebrew string itself.
  const seen = new Set<string>();
  const shared = (s: string | null | undefined, kind: ItemKind) => {
    if (!s || seen.has(s)) return;
    seen.add(s);
    add("knesset", s, "text", s, kind);
  };
  for (const c of src.candidates) {
    for (const r of c.knesset?.roles ?? []) {
      shared(r.role, "label");
      shared(r.detail, "label");
    }
    for (const f of c.knesset?.factions ?? []) shared(f.name, "name");
  }
  return out;
}
