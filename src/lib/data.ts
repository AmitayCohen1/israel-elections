import "server-only";
import { neon } from "@neondatabase/serverless";
import { cacheLife, cacheTag } from "next/cache";
import type { TopicKey } from "./topics";
import { mkShort } from "./text";
import { getLocale, type Locale } from "@/i18n";
import { TRANSLATED_LOCALES, srcHash, tkey } from "./translation-keys";

export type KnessetRecord = {
  person_id: number;
  is_current: boolean;
  female?: boolean;
  terms: number[];
  factions: { knesset: number; name: string }[];
  roles: { role: string; detail: string | null; knesset: number | null; start: string; end: string | null }[];
  bills_initiated: number;
  url: string;
};

export type Candidate = {
  list_slug: string;
  position: number;
  official_name: string;
  display_name: string;
  bio: string | null;
  wiki_title: string | null;
  wiki_url: string | null;
  wiki_guessed: boolean;
  image_url: string | null;
  image_page: string | null;
  image_license: string | null;
  image_artist: string | null;
  knesset: KnessetRecord | null;
};

export type Position = {
  topic: TopicKey;
  point: string;
  quote: string;
  /** The Hebrew original when `quote` was translated (so the UI can say "translated from Hebrew"). */
  quote_he?: string;
  source_url: string;
  source_title: string | null;
  source_type: string | null;
  source_date: string | null;
};

export type Platform = {
  platform_doc: { url: string; title?: string; published?: string } | null;
  self_description: { quote: string; quote_he?: string; source_url: string; source_title?: string } | null;
  topics_without_position: TopicKey[];
  researched_at: string | null;
  notes: string | null;
  /** From an approved extraction draft: a ≤8-word gist and a short digest per topic. */
  topic_titles: Partial<Record<TopicKey, string>> | null;
  topic_digests: Partial<Record<TopicKey, string>> | null;
  positions: Position[];
};

export type List = {
  slug: string;
  name: string;
  name_en: string;
  official_name: string;
  letters: string;
  color: string | null;
  tier: "main" | "other";
  parties: string[];
  background: string[];
  summary: string | null;
  cec_order: number;
  cec_url: string | null;
  slate_source: string;
  candidate_count: number;
  candidates: Candidate[];
  platform: Platform | null;
  /** Set for non-Hebrew locales: how many of this list's strings had no translation yet and fell back to Hebrew. */
  i18n?: { locale: Locale; missing: number; total: number };
};

type BaseList = Omit<List, "candidates" | "platform" | "i18n">;
type PlatformRow = Omit<Platform, "positions"> & { list_slug: string };
type PositionRow = Position & { id: number; list_slug: string };
type CandidateRow = Candidate;

/** The Hebrew base rows, straight from the database. Cached once for every language. */
async function loadBase() {
  "use cache";
  cacheLife("days");
  cacheTag("dataset");

  const sql = neon(process.env.DATABASE_URL!);
  const [lists, candidates, platforms, positions] = await Promise.all([
    sql`SELECT slug, name, name_en, official_name, letters, color, tier, parties, background, summary, cec_order, cec_url, slate_source, candidate_count FROM lists`,
    sql`SELECT list_slug, position, official_name, display_name, bio, wiki_title, wiki_url, wiki_guessed, image_url, image_page, image_license, image_artist, knesset FROM candidates ORDER BY list_slug, position`,
    sql`SELECT list_slug, platform_doc, self_description, topics_without_position, researched_at::text, notes, topic_titles, topic_digests FROM list_platforms`,
    sql`SELECT id, list_slug, topic, point, quote, source_url, source_title, source_type, source_date::text FROM platform_positions ORDER BY id`,
  ]);
  return {
    lists: lists as BaseList[],
    candidates: candidates as CandidateRow[],
    platforms: platforms as PlatformRow[],
    positions: positions as PositionRow[],
  };
}

type Tr = Record<string, { v: string; h: string | null }>;

/** Every translation row, per locale: key "entity|id|field" -> value and the hash of the Hebrew it was made from. */
async function loadTranslations() {
  "use cache";
  cacheLife("days");
  cacheTag("dataset");

  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`SELECT entity, entity_id, field, locale, value, src_hash FROM translations`) as {
    entity: string;
    entity_id: string;
    field: string;
    locale: string;
    value: string;
    src_hash: string | null;
  }[];
  const out: Record<string, Tr> = Object.fromEntries(TRANSLATED_LOCALES.map((l) => [l, {}]));
  for (const r of rows) if (out[r.locale]) out[r.locale][tkey(r.entity, r.entity_id, r.field)] = { v: r.value, h: r.src_hash };
  return out;
}

export type Translate = (entity: string, id: string | number, field: string, he: string) => string;

function makePicker(tr: Tr | undefined, stats?: { missing: number; total: number }): Translate {
  return (entity, id, field, he) => {
    if (!tr || !he) return he;
    if (stats) stats.total++;
    const t = tr[tkey(entity, id, field)];
    if (t && (!t.h || t.h === srcHash(he))) return t.v;
    if (stats) stats.missing++;
    return he;
  };
}

/** For code that reads other Hebrew data (e.g. data/people/*.json): a function returning the translation, or the Hebrew when missing. */
export async function getTranslator(locale?: Locale): Promise<Translate> {
  const l = locale ?? (await getLocale());
  if (l === "he") return (_e, _i, _f, he) => he;
  return makePicker((await loadTranslations())[l]);
}

async function buildDataset(locale: Locale): Promise<List[]> {
  "use cache";
  cacheLife("days");
  cacheTag("dataset");

  const base = await loadBase();
  const trs = locale === "he" ? undefined : (await loadTranslations())[locale];

  const byList = Map.groupBy(base.candidates, (c) => c.list_slug);
  const posByList = Map.groupBy(base.positions, (p) => p.list_slug);
  const platformByList = new Map(base.platforms.map((p) => [p.list_slug, p]));

  return base.lists
    .map((l): List => {
      const stats = { missing: 0, total: 0 };
      const t = makePicker(trs, stats);
      const p = platformByList.get(l.slug);

      const candidates = (byList.get(l.slug) ?? []).map((c): Candidate => {
        const id = `${c.list_slug}:${c.position}`;
        const display = t("candidates", id, "display_name", c.display_name);
        const k = c.knesset;
        return {
          ...c,
          display_name: display,
          official_name: c.official_name === c.display_name ? display : t("candidates", id, "official_name", c.official_name),
          bio: c.bio ? t("candidates", id, "bio", c.bio) : c.bio,
          knesset: k && trs
            ? {
                ...k,
                factions: k.factions.map((f) => ({ ...f, name: t("knesset", f.name, "text", f.name) })),
                roles: k.roles.map((r) => ({
                  ...r,
                  role: t("knesset", r.role, "text", r.role),
                  detail: r.detail ? t("knesset", r.detail, "text", r.detail) : r.detail,
                })),
              }
            : k,
        };
      });

      let platform: Platform | null = null;
      if (p) {
        const sd = p.self_description;
        const doc = p.platform_doc;
        const quote = sd?.quote ? t("list_platforms", l.slug, "self_description.quote", sd.quote) : undefined;
        platform = {
          platform_doc: doc ? { ...doc, title: doc.title ? t("list_platforms", l.slug, "platform_doc.title", doc.title) : doc.title } : doc,
          self_description: sd
            ? {
                ...sd,
                quote: quote ?? sd.quote,
                ...(quote !== undefined && quote !== sd.quote ? { quote_he: sd.quote } : {}),
                source_title: sd.source_title ? t("list_platforms", l.slug, "self_description.source_title", sd.source_title) : sd.source_title,
              }
            : sd,
          topics_without_position: p.topics_without_position,
          researched_at: p.researched_at,
          notes: p.notes ? t("list_platforms", l.slug, "notes", p.notes) : p.notes,
          topic_titles: p.topic_titles && Object.fromEntries(Object.entries(p.topic_titles).map(([k, v]) => [k, t("list_platforms", l.slug, `topic_titles.${k}`, v)])),
          topic_digests: p.topic_digests && Object.fromEntries(Object.entries(p.topic_digests).map(([k, v]) => [k, t("list_platforms", l.slug, `topic_digests.${k}`, v)])),
          positions: (posByList.get(l.slug) ?? []).map(({ id, list_slug: _s, ...x }): Position => {
            const quote = t("platform_positions", id, "quote", x.quote);
            return {
              ...x,
              point: t("platform_positions", id, "point", x.point),
              quote,
              ...(quote !== x.quote ? { quote_he: x.quote } : {}),
              source_title: x.source_title ? t("platform_positions", id, "source_title", x.source_title) : x.source_title,
            };
          }),
        };
      }

      return {
        ...l,
        name: t("lists", l.slug, "name", l.name),
        official_name: t("lists", l.slug, "official_name", l.official_name),
        summary: l.summary ? t("lists", l.slug, "summary", l.summary) : l.summary,
        parties: l.parties.map((x, i) => t("lists", l.slug, `parties.${i}`, x)),
        background: l.background.map((x, i) => t("lists", l.slug, `background.${i}`, x)),
        candidates,
        platform,
        ...(trs ? { i18n: { locale, ...stats } } : {}),
      };
    })
    .sort((a, b) => (a.tier === b.tier ? a.cec_order - b.cec_order : a.tier === "main" ? -1 : 1));
}

/**
 * The whole dataset is small (~1.4k candidates), so we load it in one cached call per language and
 * derive every page from it. Hebrew is the base; other languages overlay `translations`, falling back to Hebrew per field.
 * Re-seed / re-import + revalidateTag("dataset") to refresh. The locale defaults to the page's.
 */
export async function getDataset(locale?: Locale): Promise<List[]> {
  return buildDataset(locale ?? (await getLocale()));
}

export async function getList(slug: string, locale?: Locale) {
  return (await getDataset(locale)).find((l) => l.slug === slug) ?? null;
}

export async function getStats(locale?: Locale) {
  const lists = await getDataset(locale);
  return {
    lists: lists.length,
    candidates: lists.reduce((n, l) => n + l.candidates.length, 0),
    withBio: lists.reduce((n, l) => n + l.candidates.filter((c) => c.bio).length, 0),
  };
}

export type SearchEntry = {
  n: string; // display name (in the requested language)
  o: string; // official name (in the requested language)
  a?: string; // the same names in every other language, space-joined, for matching only
  s: string; // list slug
  l: string; // list name
  t: string; // ballot letters
  c: string | null; // list colour
  p: number; // slot
  i: string | null; // photo
  k: string | null; // Knesset label
};

async function buildSearchIndex(locale: Locale): Promise<SearchEntry[]> {
  "use cache";
  cacheLife("days");
  cacheTag("dataset");

  const own = await buildDataset(locale);
  const others = await Promise.all((["he", ...TRANSLATED_LOCALES] as Locale[]).filter((l) => l !== locale).map((l) => buildDataset(l)));
  return own.flatMap((l, li) =>
    l.candidates.map((c, ci) => {
      const alt = new Set<string>();
      for (const o of others) {
        const oc = o[li].candidates[ci];
        alt.add(oc.display_name);
        alt.add(oc.official_name);
      }
      alt.delete(c.display_name);
      alt.delete(c.official_name);
      return {
        n: c.display_name,
        o: c.official_name,
        ...(alt.size ? { a: [...alt].join(" ") } : {}),
        s: l.slug,
        l: l.name,
        t: l.letters,
        c: l.color,
        p: c.position,
        i: c.image_url,
        k: c.knesset ? mkShort(c.knesset, locale) : null,
      };
    }),
  );
}

export async function getSearchIndex(locale?: Locale): Promise<SearchEntry[]> {
  return buildSearchIndex(locale ?? (await getLocale()));
}
