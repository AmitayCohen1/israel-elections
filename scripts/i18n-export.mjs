// Write translation work chunks: data/i18n/todo/<locale>/<series>-NN.json
//   series: names (people, parties), labels (short titles/roles), text (prose), quotes (verbatim party quotes)
// Skips items already translated (and not stale) in the DB, or already sitting in data/i18n/done/<locale>/.
// Usage: node --env-file=.env.local scripts/i18n-export.mjs [--locale=en,ar] [--max-chars=30000]
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { collectItems, loadSource, sql, I18N_DIR, readJsonDir, srcHash, tkey, TRANSLATED_LOCALES } from "./i18n-lib.mjs";

const arg = (n, d) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1] ?? d;
const locales = arg("locale", TRANSLATED_LOCALES.join(",")).split(",");
const MAX_CHARS = Number(arg("max-chars", 30000));
const SIZES = { names: 150, labels: 120, text: 70, quotes: 70 };
const SERIES = { name: "names", label: "labels", prose: "text", quote: "quotes" };

const LANG = {
  en: { name: "English", script: "Latin", names: "Binyamin Netanyahu, Yair Lapid, Likud, Yesh Atid. Use the spelling established in English-language media (Times of Israel, Haaretz English, Wikipedia); otherwise a plain Hebrew-to-Latin transliteration (no diacritics). Do not put the Hebrew in the output." },
  ru: { name: "Russian", script: "Cyrillic", names: "Биньямин Нетаньяху, Яир Лапид, Ликуд, Еш Атид. Use the established Russian-language spelling (Wikipedia, Russian Israeli media: NEWSru.co.il, vesty.co.il); otherwise standard Hebrew-to-Russian practical transcription." },
  ar: { name: "Arabic", script: "Arabic", names: "بنيامين نتنياهو، يائير لبيد، الليكود، يش عتيد. Use the established Arabic spelling (Arabic Wikipedia, Al-Jazeera, Arab-Israeli media) for known figures and parties; otherwise a standard transliteration. Arabic letters only, no diacritics (tashkeel) unless needed." },
  am: { name: "Amharic", script: "Ethiopic (Ge'ez fidel)", names: "ቢንያሚን ኔታንያሁ, ያኢር ላፒድ, ሊኩድ, የሽ አቲድ. Transliterate into Amharic script using the conventional Amharic spelling where one exists (Amharic Wikipedia, Ethiopian media); otherwise a phonetic transliteration in fidel." },
};

const HOW = {
  names: (L) => `Each item is a Hebrew NAME (person, party or list). Write how that name is conventionally written in ${L.name} (${L.script}). Examples: ${L.names} "ctx" is context to identify the person or party (list, slot, MK status, start of bio): use it, do not translate it. Names are given either in natural order or surname-first (official form like "כהן יוסי"): always output the natural given-name-first order. Party and list names: use the established ${L.name} name of the party if there is one, otherwise translate the meaning (e.g. "הציונות הדתית" = Religious Zionism) rather than transliterate. Keep ballot-letter acronyms as they are written.`,
  labels: (L) => `Each item is a short Hebrew label: a title, role, heading, source title or fact label. Translate into natural ${L.name} (${L.script}). Government ministries and Knesset committees: use the standard ${L.name} names (e.g. משרד האוצר = Ministry of Finance; ועדת הכספים = Finance Committee; ח״כ/חבר כנסת = Member of Knesset). Keep proper names consistent with how they would be written in ${L.name} (see "names" convention). Keep it short.`,
  text: (L) => `Each item is Hebrew prose (biography, background, platform summary, research notes). Translate faithfully into natural, neutral ${L.name} (${L.script}). Do not add, drop or soften facts or claims. Keep every number, date and year exactly as in the source. Person, party and place names must be written as in the "names" convention for ${L.name}. This is a non-partisan election guide: neutral register.`,
  quotes: (L) => `Each item is a VERBATIM QUOTE from a party's own platform or website, written in Hebrew. Translate it faithfully into ${L.name} (${L.script}), keeping the party's voice, tone, emphasis and any slogans. Do not neutralize, summarize, correct or add anything. Keep numbers and dates exactly. It will be displayed with a "translated from Hebrew" note, so a faithful translation matters more than polished style.`,
};
const COMMON = `Output: for every item return {"key": <same key>, "value": <your translation>}. Return ONLY a JSON array (or {"items":[...]}) with one entry per input item, same keys, no omissions, no extra commentary. Value must be non-empty and written in the target script; never leave Hebrew letters in it. Preserve numbers, placeholders and punctuation meaning. Save the result as data/i18n/done/<locale>/<same file name>.`;

const db = sql();
const src = await loadSource();
const items = collectItems(src);

// What is already done: in the DB (not stale) or in done/ files.
const have = {};
for (const loc of locales) have[loc] = new Set();
const rows = await db`SELECT entity, entity_id, field, locale, src_hash FROM translations`;
const byKey = new Map(items.map((i) => [tkey(i.entity, i.entity_id, i.field), i]));
for (const r of rows) {
  const it = byKey.get(tkey(r.entity, r.entity_id, r.field));
  if (it && have[r.locale] && (!r.src_hash || r.src_hash === srcHash(it.he))) have[r.locale].add(tkey(r.entity, r.entity_id, r.field));
}
for (const loc of locales) {
  for (const { json } of readJsonDir(new URL(`done/${loc}/`, I18N_DIR))) {
    for (const x of Array.isArray(json) ? json : json.items ?? []) {
      const it = byKey.get(x.key);
      if (it && x.value && (!x.he || srcHash(x.he) === srcHash(it.he))) have[loc].add(x.key);
    }
  }
}

console.log(`${items.length} translatable strings (${items.reduce((n, i) => n + i.he.length, 0).toLocaleString()} chars)`);
let grand = { files: 0, items: 0, chars: 0 };
for (const loc of locales) {
  const dir = new URL(`todo/${loc}/`, I18N_DIR);
  if (existsSync(dir)) rmSync(dir, { recursive: true });
  mkdirSync(dir, { recursive: true });
  const L = LANG[loc];
  const stat = {};
  for (const [kind, series] of Object.entries(SERIES)) {
    const todo = items.filter((i) => i.kind === kind && !have[loc].has(tkey(i.entity, i.entity_id, i.field)));
    const chunks = [];
    let cur = [], chars = 0;
    for (const i of todo) {
      if (cur.length && (cur.length >= SIZES[series] || chars + i.he.length > MAX_CHARS)) { chunks.push(cur); cur = []; chars = 0; }
      cur.push(i); chars += i.he.length;
    }
    if (cur.length) chunks.push(cur);
    chunks.forEach((c, n) => {
      const name = `${series}-${String(n + 1).padStart(2, "0")}`;
      const doc = {
        locale: loc, series, target_language: L.name, source_language: "Hebrew",
        instructions: `${HOW[series](L)} ${COMMON}`,
        items: c.map((i) => ({ key: `${i.entity}|${i.entity_id}|${i.field}`, he: i.he, ...(i.ctx ? { ctx: i.ctx } : {}) })),
      };
      writeFileSync(new URL(`${name}.json`, dir), JSON.stringify(doc, null, 1));
    });
    stat[series] = { chunks: chunks.length, items: todo.length, chars: todo.reduce((n, i) => n + i.he.length, 0) };
    grand.files += chunks.length; grand.items += todo.length; grand.chars += stat[series].chars;
  }
  console.log(loc, Object.entries(stat).map(([s, v]) => `${s}: ${v.chunks} chunks/${v.items} items/${v.chars.toLocaleString()} chars`).join(" | "));
}
console.log(`TOTAL ${grand.files} chunks, ${grand.items} items, ${grand.chars.toLocaleString()} source chars (all locales)`);
