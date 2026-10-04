// Load data/*.json into Neon. Replaces all rows; safe to re-run.
// Usage: node --env-file=.env.local scripts/seed.mjs
import { neon } from "@neondatabase/serverless";
import { readFileSync, readdirSync, existsSync } from "node:fs";

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

const platformDir = new URL("../data/platforms/", import.meta.url);
const basePlatforms = existsSync(platformDir)
  ? readdirSync(platformDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(new URL(f, platformDir))))
  : [];
const known = new Set(lists.map((l) => l.slug));

// Approved extraction drafts (data/extracted/<slug>.json with status "approved") replace a list's positions with
// quotes taken from the list's own pages, and add the per-topic gist and digest the list page shows.
const TOPIC_KEYS = ["security", "economy", "religion_state", "judiciary", "housing", "education", "welfare_health", "governance"];
const norm = (s) => s.replace(/״/g, '"').replace(/׳/g, "'").replace(/[–—־]/g, "-").replace(/\s+/g, " ").trim();
const extractedDir = new URL("../data/extracted/", import.meta.url);
const snapshotsDir = new URL("../data/snapshots/", import.meta.url);

function snapshotsFor(slug) {
  const dir = new URL(`${slug}/`, snapshotsDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".json")).flatMap((f) => {
    const j = JSON.parse(readFileSync(new URL(f, dir)));
    return j.text ? [{ field: f.replace(/\.json$/, ""), url: j.url, text: norm(j.text) }] : [];
  });
}

const approved = existsSync(extractedDir)
  ? readdirSync(extractedDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(new URL(f, extractedDir)))).filter((d) => d.status === "approved" && known.has(d.slug))
  : [];

const platformBySlug = new Map(basePlatforms.map((p) => [p.slug, p]));
for (const d of approved) {
  const snaps = snapshotsFor(d.slug);
  const positions = d.positions.map((x) => {
    // The page a quote was actually found on is its source; pages saved as the list's platform count as "platform".
    const hit = snaps.find((sn) => sn.text.includes(norm(x.quote)));
    const own = hit ? (hit.field === "platform_url" || hit.field.startsWith("plan_") ? "platform" : "party_site") : "platform";
    return { topic: x.topic, point: x.stance, quote: x.quote, source_url: hit?.url ?? d.source_url, source_title: null, source_type: own, date: null };
  });
  const base = platformBySlug.get(d.slug) ?? { slug: d.slug, platform_doc: null, self_description: null, notes: null };
  platformBySlug.set(d.slug, {
    ...base,
    positions,
    topics_without_position: TOPIC_KEYS.filter((k) => !positions.some((x) => x.topic === k)),
    researched_at: d.extracted_at,
    topic_titles: d.topic_titles ?? null,
    topic_digests: d.topic_digests ?? null,
  });
}
const platforms = [...platformBySlug.values()];
const platformRows = platforms.filter((p) => known.has(p.slug)).map((p) => ({
  list_slug: p.slug, platform_doc: p.platform_doc ?? null, self_description: p.self_description ?? null,
  topics_without_position: p.topics_without_position ?? [], researched_at: p.researched_at ?? null, notes: p.notes ?? null,
  topic_titles: p.topic_titles ?? null, topic_digests: p.topic_digests ?? null,
}));
// Own words only: a list's positions come from its own platform or site. Older research that leaned on news reports,
// interviews or statements is not published (lists with an approved draft already use quotes from their own pages).
const OWN = new Set(["platform", "party_site"]);
const positionRows = platforms.filter((p) => known.has(p.slug)).flatMap((p) => (p.positions ?? []).filter((x) => OWN.has(x.source_type)).map((x) => ({
  list_slug: p.slug, topic: x.topic, point: x.point, quote: x.quote, source_url: x.source_url,
  source_title: x.source_title ?? null, source_type: x.source_type ?? null,
  source_date: /^\d{4}-\d{2}-\d{2}$/.test(x.date ?? "") ? x.date : null,
})));

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

console.log(`seeded ${listRows.length} lists, ${candidateRows.length} candidates, ${platformRows.length} platforms, ${positionRows.length} positions (${approved.length} from approved drafts)`);

// Tell the running app to drop its cached dataset.
if (process.env.REVALIDATE_URL && process.env.REVALIDATE_SECRET) {
  const res = await fetch(process.env.REVALIDATE_URL, { method: "POST", headers: { "x-revalidate-secret": process.env.REVALIDATE_SECRET } }).catch((e) => ({ status: e.message }));
  console.log(`revalidate: ${res.status}`);
}
