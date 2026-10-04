// Validate and upsert finished translations: data/i18n/done/<locale>/*.json -> translations (status 'machine').
// File shape: the todo chunk with a "value" added to every item ([{key,he,value}] or {items:[...]}).
// Rejects are listed and written to data/i18n/rejects/<locale>.json. Reviewed/native rows are never overwritten (unless --force).
// Usage: node --env-file=.env.local scripts/i18n-import.mjs [--locale=en,ru] [--dry] [--force]
import { mkdirSync, writeFileSync } from "node:fs";
import { parseKey, readJsonDir, I18N_DIR, SCRIPT_RE, sql, srcHash, TRANSLATED_LOCALES } from "./i18n-lib.mjs";

const flag = (n) => process.argv.includes(`--${n}`);
const locales = (process.argv.find((a) => a.startsWith("--locale="))?.split("=")[1] ?? TRANSLATED_LOCALES.join(",")).split(",");
const HEBREW = /\p{Script=Hebrew}/u;
const ET_NUM = /[፩-፼]/;

const digits = (s) =>
  s
    .replace(/[٠-٩]/g, (d) => d.charCodeAt(0) - 0x660)
    .replace(/[۰-۹]/g, (d) => d.charCodeAt(0) - 0x6f0)
    .replace(/(?<=\d)[,    ](?=\d{3}\b)/g, "")
    .match(/\d+/g) ?? [];
const tokens = (s) => s.match(/\{[^}]*\}|%[sd]|<[^>]+>/g) ?? [];

/** Returns an error string, or null when the translation passes. */
export function check(loc, he, value, kind) {
  if (typeof value !== "string" || !value.trim()) return "empty";
  if (HEBREW.test(he) && !SCRIPT_RE[loc].test(value)) return `no ${loc} script letters`;
  if (HEBREW.test(value)) return "contains Hebrew letters";
  if (he.length > 40 && value.length < he.length * 0.2) return "suspiciously short (truncated?)";
  if (value.length > Math.max(he.length * 8, 40)) return "suspiciously long";
  const dateLike = /\d{1,2}[./]\d{1,2}[./]\d{2,4}/.test(he);
  if (!dateLike && !(loc === "am" && ET_NUM.test(value))) {
    const have = [...digits(value)];
    for (const d of digits(he)) {
      const i = have.indexOf(d);
      if (i < 0) return `number "${d}" missing`;
      have.splice(i, 1);
    }
  }
  for (const t of tokens(he)) if (!value.includes(t)) return `placeholder ${t} missing`;
  return null;
}

const db = sql();
let total = { ok: 0, rejected: 0 };
for (const loc of locales) {
  const files = readJsonDir(new URL(`done/${loc}/`, I18N_DIR));
  const good = new Map();
  const rejects = [];
  for (const { file, json } of files) {
    for (const x of Array.isArray(json) ? json : json.items ?? []) {
      if (!x || typeof x.key !== "string") { rejects.push({ file, key: String(x?.key), reason: "bad item" }); continue; }
      const k = parseKey(x.key);
      if (!k.entity || !k.entity_id || !k.field) { rejects.push({ file, key: x.key, reason: "bad key" }); continue; }
      if (typeof x.he !== "string" || !x.he) { rejects.push({ file, key: x.key, reason: "missing he (needed for staleness hash)" }); continue; }
      const err = check(loc, x.he, x.value);
      if (err) { rejects.push({ file, key: x.key, reason: err, he: x.he.slice(0, 80), value: String(x.value ?? "").slice(0, 80) }); continue; }
      good.set(x.key, { ...k, value: x.value.trim(), src_hash: srcHash(x.he) });
    }
  }
  if (!flag("dry")) {
    const rows = [...good.values()];
    for (let i = 0; i < rows.length; i += 500) {
      await db`
        INSERT INTO translations (entity, entity_id, field, locale, value, status, src_hash, updated_at)
        SELECT r.entity, r.entity_id, r.field, ${loc}, r.value, 'machine', r.src_hash, now()
        FROM json_to_recordset(${JSON.stringify(rows.slice(i, i + 500))}::json) AS r(entity text, entity_id text, field text, value text, src_hash text)
        ON CONFLICT (entity, entity_id, field, locale) DO UPDATE
          SET value = EXCLUDED.value, src_hash = EXCLUDED.src_hash, status = 'machine', updated_at = now()
          WHERE translations.status = 'machine' OR ${flag("force")}`;
    }
  }
  mkdirSync(new URL("rejects/", I18N_DIR), { recursive: true });
  writeFileSync(new URL(`rejects/${loc}.json`, I18N_DIR), JSON.stringify(rejects, null, 1));
  total.ok += good.size; total.rejected += rejects.length;
  console.log(`${loc}: ${files.length} files, ${good.size} ${flag("dry") ? "valid" : "imported"}, ${rejects.length} rejected`);
  for (const r of rejects.slice(0, 15)) console.log(`   ✗ ${r.file} ${r.key} — ${r.reason}${r.value ? `: "${r.value}"` : ""}`);
  if (rejects.length > 15) console.log(`   … ${rejects.length - 15} more in data/i18n/rejects/${loc}.json`);
}
console.log(`total ${total.ok} ok, ${total.rejected} rejected`);
if (total.ok && !flag("dry") && process.env.REVALIDATE_URL && process.env.REVALIDATE_SECRET) {
  const res = await fetch(process.env.REVALIDATE_URL, { method: "POST", headers: { "x-revalidate-secret": process.env.REVALIDATE_SECRET } }).catch((e) => ({ status: e.message }));
  console.log(`revalidate: ${res.status}`);
}
