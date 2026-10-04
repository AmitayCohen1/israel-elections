// What the site publishes about each list's positions, computed from data/. Shared by scripts/seed.mjs (everything)
// and scripts/publish-list.mjs (one list, without renumbering the others).
import { readFileSync, readdirSync, existsSync } from "node:fs";

const data = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url)));
export const TOPIC_KEYS = ["security", "economy", "religion_state", "judiciary", "housing", "education", "welfare_health", "governance"];
const norm = (s) => s.replace(/״/g, '"').replace(/׳/g, "'").replace(/[–—־]/g, "-").replace(/\s+/g, " ").trim();
const platformDir = new URL("../data/platforms/", import.meta.url);
const extractedDir = new URL("../data/extracted/", import.meta.url);
const snapshotsDir = new URL("../data/snapshots/", import.meta.url);
const readDir = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(new URL(f, dir)))) : []);

function snapshotsFor(slug) {
  const dir = new URL(`${slug}/`, snapshotsDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".json")).flatMap((f) => {
    const j = JSON.parse(readFileSync(new URL(f, dir)));
    return j.text ? [{ field: f.replace(/\.json$/, ""), url: j.url, text: norm(j.text) }] : [];
  });
}

// A list's own words come first: its platform and its site.
const OWN = new Set(["platform", "party_site"]);
// What its leaders said in public, in their own words: an official statement or an interview, and a news report only
// where the quote is direct speech (marked direct_quote). A reporter's wording of a position is never published, nor a
// quote we could not find again on the page it cites (marked unverified).
const said = (x) => !x.unverified && (x.source_type === "official_statement" || x.source_type === "interview" || (x.source_type === "news_report" && x.direct_quote === true));

/**
 * { platformRows, positionRows, approvedCount } for the lists in `known` (a Set of slugs).
 * Approved extraction drafts (data/extracted/<slug>.json, status "approved") give a list's positions from its own pages,
 * with the per-topic gist and digest. A list that published a platform for this election (registry status "found", with
 * an approved extraction) shows only that. Every other list also shows what its leaders said, after its own pages,
 * each with its kind of source and a link.
 */
export function buildPlatforms(known) {
  const registry = data("sources.json");
  const base = new Map(readDir(platformDir).map((p) => [p.slug, p]));
  const approved = readDir(extractedDir).filter((d) => d.status === "approved" && known.has(d.slug));
  const bySlug = new Map();
  for (const [slug, p] of base) {
    bySlug.set(slug, { ...p, positions: (p.positions ?? []).filter((x) => OWN.has(x.source_type)) });
  }
  for (const d of approved) {
    const snaps = snapshotsFor(d.slug);
    const positions = d.positions.map((x) => {
      // The page a quote was actually found on is its source; pages saved as the list's platform count as "platform".
      const hit = snaps.find((sn) => sn.text.includes(norm(x.quote)));
      const own = hit ? (hit.field === "platform_url" || hit.field.startsWith("plan_") ? "platform" : "party_site") : "platform";
      return { topic: x.topic, point: x.stance, quote: x.quote, source_url: hit?.url ?? d.source_url, source_title: null, source_type: own, date: null };
    });
    const b = base.get(d.slug) ?? { slug: d.slug, platform_doc: null, self_description: null, notes: null };
    bySlug.set(d.slug, { ...b, positions, researched_at: d.extracted_at, topic_titles: d.topic_titles ?? null, topic_digests: d.topic_digests ?? null });
  }
  const hasPlatform = new Set(approved.filter((d) => registry[d.slug]?.status === "found").map((d) => d.slug));
  for (const [slug, p] of bySlug) {
    if (!hasPlatform.has(slug)) p.positions = [...p.positions, ...(base.get(slug)?.positions ?? []).filter(said)];
    p.topics_without_position = TOPIC_KEYS.filter((k) => !p.positions.some((x) => x.topic === k));
  }
  const platforms = [...bySlug.values()].filter((p) => known.has(p.slug));
  const platformRows = platforms.map((p) => ({
    list_slug: p.slug, platform_doc: p.platform_doc ?? null, self_description: p.self_description ?? null,
    topics_without_position: p.topics_without_position ?? [], researched_at: p.researched_at ?? null, notes: p.notes ?? null,
    topic_titles: p.topic_titles ?? null, topic_digests: p.topic_digests ?? null,
  }));
  const positionRows = platforms.flatMap((p) => p.positions.map((x) => ({
    list_slug: p.slug, topic: x.topic, point: x.point, quote: x.quote, source_url: x.source_url,
    source_title: x.source_title ?? null, source_type: x.source_type ?? null,
    source_date: /^\d{4}-\d{2}-\d{2}$/.test(x.date ?? "") ? x.date : null,
  })));
  return { platformRows, positionRows, approvedCount: approved.length };
}
