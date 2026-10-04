// Publish one or more lists' positions from data/ without a full re-seed. A re-seed renumbers every position, which
// orphans the translations keyed on position ids; this replaces only the named lists' rows, so the others keep theirs.
// It writes exactly what scripts/seed.mjs would write for those lists.
// Usage: node --env-file=.env.local scripts/publish-list.mjs [--dry] <slug> [<slug> ...]
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { buildPlatforms } from "./platforms-lib.mjs";

const dry = process.argv.includes("--dry");
const slugs = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const lists = JSON.parse(readFileSync(new URL("../data/lists.json", import.meta.url)));
const known = new Set(lists.map((l) => l.slug));
for (const s of slugs) if (!known.has(s)) throw new Error(`unknown list: ${s}`);
if (!slugs.length) throw new Error("name at least one list");

const { platformRows, positionRows } = buildPlatforms(known);
const sql = neon(process.env.DATABASE_URL);
for (const slug of slugs) {
  const plat = platformRows.find((p) => p.list_slug === slug) ?? { list_slug: slug, platform_doc: null, self_description: null, topics_without_position: [], researched_at: null, notes: null, topic_titles: null, topic_digests: null };
  const rows = positionRows.filter((p) => p.list_slug === slug);
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM platform_positions WHERE list_slug = ${slug}`;
  const kinds = Object.entries(Object.groupBy(rows, (r) => r.source_type)).map(([k, v]) => `${k}:${v.length}`).join(" ");
  console.log(`${slug}: ${n} -> ${rows.length} positions (${kinds || "none"})${dry ? " [dry]" : ""}`);
  if (dry) continue;
  await sql.transaction([
    sql`DELETE FROM platform_positions WHERE list_slug = ${slug}`,
    sql`DELETE FROM list_platforms WHERE list_slug = ${slug}`,
    sql`INSERT INTO list_platforms SELECT * FROM json_populate_recordset(null::list_platforms, ${JSON.stringify([plat])})`,
    sql`INSERT INTO platform_positions (list_slug, topic, point, quote, source_url, source_title, source_type, source_date)
        SELECT list_slug, topic, point, quote, source_url, source_title, source_type, source_date
        FROM json_populate_recordset(null::platform_positions, ${JSON.stringify(rows)})`,
  ]);
}
