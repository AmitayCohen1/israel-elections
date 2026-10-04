// Load data/*.json into Neon. Replaces all rows; safe to re-run.
// Usage: node --env-file=.env.local scripts/seed.mjs
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { buildPlatforms } from "./platforms-lib.mjs";

const sql = neon(process.env.DATABASE_URL);
const data = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url)));
const lists = data("lists.json");
const enriched = data("candidates_enriched.json");

const listRows = lists.map((l) => ({
  slug: l.slug, name: l.name, name_en: l.name_en, official_name: l.official_name, letters: l.letters,
  color: l.color, tier: l.tier, parties: l.parties, background: l.background, summary: l.summary ?? null, cec_url: l.cec_url ?? null,
  slate_source: l.slate_source, candidate_count: l.candidates.length, cec_order: l.cec_order ?? null,
}));

const candidateRows = lists.flatMap((l) => l.candidates.map((c) => {
  const e = enriched[`${l.slug}:${c.position}`] ?? {};
  return {
    list_slug: l.slug, position: c.position, official_name: c.official_name,
    display_name: c.display_name ?? c.official_name,
    bio: e.wiki?.bio ?? null, wiki_title: e.wiki?.title ?? null, wiki_url: e.wiki?.url ?? null,
    wikidata: e.wiki?.wikidata ?? null, wiki_guessed: e.wiki?.guessed ?? false,
    image_url: e.image?.url ?? null, image_page: e.image?.page ?? null,
    image_license: e.image?.license ?? null, image_artist: e.image?.artist ?? null,
    knesset: e.knesset ?? null,
  };
}));

const known = new Set(lists.map((l) => l.slug));
const { platformRows, positionRows, approvedCount } = buildPlatforms(known);

// json_populate_recordset keeps this to one round trip per table.
await sql.transaction([
  sql`TRUNCATE platform_positions, list_platforms, candidates, lists RESTART IDENTITY CASCADE`,
  sql`INSERT INTO lists SELECT * FROM json_populate_recordset(null::lists, ${JSON.stringify(listRows.map((r) => ({ ...r, updated_at: new Date().toISOString() })))})`,
  sql`INSERT INTO candidates (list_slug, position, official_name, display_name, bio, wiki_title, wiki_url, wikidata, wiki_guessed, image_url, image_page, image_license, image_artist, knesset)
      SELECT list_slug, position, official_name, display_name, bio, wiki_title, wiki_url, wikidata, wiki_guessed, image_url, image_page, image_license, image_artist, knesset
      FROM json_populate_recordset(null::candidates, ${JSON.stringify(candidateRows)})`,
  sql`INSERT INTO list_platforms SELECT * FROM json_populate_recordset(null::list_platforms, ${JSON.stringify(platformRows)})`,
  sql`INSERT INTO platform_positions (list_slug, topic, point, quote, source_url, source_title, source_type, source_date)
      SELECT list_slug, topic, point, quote, source_url, source_title, source_type, source_date
      FROM json_populate_recordset(null::platform_positions, ${JSON.stringify(positionRows)})`,
]);

console.log(`seeded ${listRows.length} lists, ${candidateRows.length} candidates, ${platformRows.length} platforms, ${positionRows.length} positions (${approvedCount} lists from approved drafts)`);

// Tell the running app to drop its cached dataset.
if (process.env.REVALIDATE_URL && process.env.REVALIDATE_SECRET) {
  const res = await fetch(process.env.REVALIDATE_URL, { method: "POST", headers: { "x-revalidate-secret": process.env.REVALIDATE_SECRET } }).catch((e) => ({ status: e.message }));
  console.log(`revalidate: ${res.status}`);
}
