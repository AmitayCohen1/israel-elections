// Shared helpers for the i18n scripts. Run with: node --env-file=.env.local scripts/<script>.mjs
// (Node >= 22.18 imports the .ts key schema directly.)
import { neon } from "@neondatabase/serverless";
import { readFileSync, readdirSync, existsSync } from "node:fs";
export { collectItems, parseKey, tkey, srcHash, TRANSLATED_LOCALES } from "../src/lib/translation-keys.ts";

export const sql = () => neon(process.env.DATABASE_URL);
export const I18N_DIR = new URL("../data/i18n/", import.meta.url);

/** The Hebrew source rows, from the database (so ids match) plus data/people/*.json. */
export async function loadSource() {
  const q = sql();
  const [lists, candidates, platforms, positions] = await Promise.all([
    q`SELECT slug, name, official_name, summary, parties, background FROM lists ORDER BY cec_order, slug`,
    q`SELECT list_slug, position, official_name, display_name, bio, knesset FROM candidates ORDER BY list_slug, position`,
    q`SELECT list_slug, platform_doc, self_description, topic_titles, topic_digests, notes FROM list_platforms ORDER BY list_slug`,
    q`SELECT id, point, quote, source_title FROM platform_positions ORDER BY id`,
  ]);
  const dir = new URL("../data/people/", import.meta.url);
  const people = existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(readFileSync(new URL(f, dir))))
    : [];
  return { lists, candidates, platforms, positions, people };
}

export const SCRIPT_RE = {
  en: /\p{Script=Latin}/u,
  ar: /\p{Script=Arabic}/u,
  ru: /\p{Script=Cyrillic}/u,
  am: /\p{Script=Ethiopic}/u,
};

export const readJsonDir = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => ({ file: f, json: JSON.parse(readFileSync(new URL(f, dir))) })) : [];
