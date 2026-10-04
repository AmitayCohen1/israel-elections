import "server-only";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { getDataset } from "@/lib/data";
import { listColor } from "@/lib/color";
import type { AxisData, Cell } from "@/app/[lang]/dev-preview/map/options";

/** The position map's data: each question, its scale, and where every coded party sits on it, with the quote behind the coding. Shared by the map page and the overview. */
const AXES = ["security-territory", "security-gaza", "religion-draft", "governance-oct7", "judiciary-review", "economy-state"];

const read = async <T,>(...p: string[]) => JSON.parse(await readFile(path.join(process.cwd(), "data", ...p), "utf8")) as T;
const norm = (t: string) => t.replace(/״/g, '"').replace(/׳/g, "'").replace(/[–—־]/g, "-").replace(/\s+/g, " ").trim();

/** The page the quote actually sits on: a list has several snapshots, and the extraction names only one source. */
async function quoteUrl(slug: string, quote: string) {
  const dir = path.join(process.cwd(), "data", "snapshots", slug);
  const files = await readdir(dir).catch(() => [] as string[]);
  for (const f of files.filter((f) => f.endsWith(".json"))) {
    const snap = await read<{ url: string; text?: string }>("snapshots", slug, f);
    if (snap.text && norm(snap.text).includes(norm(quote))) return snap.url;
  }
  return null;
}

type RawPos = { topic: string; stance?: string; point?: string; quote: string; source_url?: string };
type Raw = { status?: string; source_url?: string; positions: RawPos[] };

/** The stored position a coded cell points at: from the extraction when there is one, else the platform file. */
async function position(slug: string, topic: string, match: string) {
  let doc: Raw;
  let status = "platforms";
  try {
    doc = await read<Raw>("extracted", `${slug}.json`);
    status = doc.status ?? "draft";
  } catch {
    doc = await read<Raw>("platforms", `${slug}.json`);
  }
  const hits = doc.positions.filter((p) => p.topic === topic && (p.stance ?? p.point ?? "").includes(match));
  if (hits.length !== 1) throw new Error(`${slug}: ${hits.length} matches for "${match}"`);
  const source_url = hits[0].source_url ?? (await quoteUrl(slug, hits[0].quote)) ?? doc.source_url ?? "";
  return { quote: hits[0].quote, source_url, draft: status === "draft" };
}

type AxisFile = Omit<AxisData, "cells" | "uncoded" | "ordered"> & { ordered?: boolean; coding: { slug: string; level: number; match: string }[] };

/** Cached so the route can prerender (a "seconds" life is too short to prerender and blocks the route). */
export async function loadAxes(): Promise<AxisData[]> {
  "use cache";
  cacheLife("minutes");
  const lists = await getDataset();
  const byslug = new Map(lists.map((l) => [l.slug, l]));
  return Promise.all(
    AXES.map(async (id) => {
      const ax = await read<AxisFile>("axes", `${id}.json`);
      const cells: Cell[] = await Promise.all(
        ax.coding.map(async (c) => {
          const l = byslug.get(c.slug)!;
          return { slug: c.slug, name: l.name, color: listColor(l.color), face: l.candidates[0]?.image_url ?? null, order: l.cec_order, level: c.level, ...(await position(c.slug, ax.topic, c.match)) };
        }),
      );
      const coded = new Set(ax.coding.map((c) => c.slug));
      const uncoded = lists.filter((l) => !coded.has(l.slug)).sort((a, b) => a.cec_order - b.cec_order).map((l) => ({ slug: l.slug, name: l.name }));
      return { id, topic: ax.topic, short: ax.short, question: ax.question, ordered: ax.ordered !== false, poles: ax.poles, scale: ax.scale, rules: ax.rules, cells: cells.sort((a, b) => a.order - b.order), uncoded };
    }),
  );
}
