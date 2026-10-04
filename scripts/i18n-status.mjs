// Translation coverage per locale and entity (counting only non-stale rows against the current Hebrew source).
// Usage: node --env-file=.env.local scripts/i18n-status.mjs
import { collectItems, loadSource, sql, srcHash, tkey, TRANSLATED_LOCALES } from "./i18n-lib.mjs";

const items = collectItems(await loadSource());
const rows = await sql()`SELECT entity, entity_id, field, locale, status, src_hash FROM translations`;
const byKey = new Map(items.map((i) => [tkey(i.entity, i.entity_id, i.field), i]));
const entities = [...new Set(items.map((i) => i.entity))];
const total = Object.fromEntries(entities.map((e) => [e, items.filter((i) => i.entity === e).length]));
const done = Object.fromEntries(TRANSLATED_LOCALES.map((l) => [l, Object.fromEntries(entities.map((e) => [e, 0]))]));
const stale = Object.fromEntries(TRANSLATED_LOCALES.map((l) => [l, 0]));
const status = Object.fromEntries(TRANSLATED_LOCALES.map((l) => [l, {}]));
for (const r of rows) {
  const it = byKey.get(tkey(r.entity, r.entity_id, r.field));
  if (!done[r.locale]) continue;
  if (!it || (r.src_hash && r.src_hash !== srcHash(it.he))) { stale[r.locale]++; continue; }
  done[r.locale][r.entity]++;
  status[r.locale][r.status] = (status[r.locale][r.status] ?? 0) + 1;
}
const pad = (s, n) => String(s).padEnd(n);
console.log(pad("entity", 20) + pad("total", 7) + TRANSLATED_LOCALES.map((l) => pad(l, 14)).join(""));
for (const e of entities) console.log(pad(e, 20) + pad(total[e], 7) + TRANSLATED_LOCALES.map((l) => pad(`${done[l][e]} (${Math.round((100 * done[l][e]) / total[e])}%)`, 14)).join(""));
const sum = (l) => Object.values(done[l]).reduce((a, b) => a + b, 0);
console.log(pad("ALL", 20) + pad(items.length, 7) + TRANSLATED_LOCALES.map((l) => pad(`${sum(l)} (${Math.round((100 * sum(l)) / items.length)}%)`, 14)).join(""));
console.log("stale/orphan rows:", JSON.stringify(stale), " status:", JSON.stringify(status));
