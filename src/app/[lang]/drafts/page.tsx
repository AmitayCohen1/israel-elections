import type { Metadata } from "next";
import Link from "@/i18n/link";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

/** Index of extraction drafts awaiting review — internal, like the draft pages themselves. */

export const metadata: Metadata = {
  title: "טיוטות לבדיקה",
  robots: { index: false, follow: false },
};

// Reads draft JSON from disk per request, so it can't be prerendered into a static shell.
export const instant = false;

export default async function DraftsIndex() {
  const dir = path.join(process.cwd(), "data", "extracted");
  const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".json"));
  const lists = JSON.parse(await readFile(path.join(process.cwd(), "data", "lists.json"), "utf8")) as { slug: string; name: string }[];
  const drafts = await Promise.all(
    files.map(async (f) => {
      const d = JSON.parse(await readFile(path.join(dir, f), "utf8")) as { slug: string; positions: unknown[]; extracted_at: string };
      return { slug: d.slug, count: d.positions.length, date: d.extracted_at, name: lists.find((l) => l.slug === d.slug)?.name ?? d.slug };
    }),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24">
      <header className="pt-12 pb-10 text-center">
        <p className="text-sm tracking-wide text-muted">פנימי · לא מפורסם באתר</p>
        <h1 className="serif mt-5 text-5xl sm:text-6xl">טיוטות לבדיקה</h1>
        <p className="mt-4 text-ink-2">{drafts.length} רשימות חולצו מהמצעים וממתינות לאישור.</p>
      </header>
      <ul className="border-t border-line">
        {drafts.map((d) => (
          <li key={d.slug}>
            <Link href={`/drafts/${d.slug}`} className="group flex items-center gap-4 border-b border-line py-6">
              <span className="title flex-1 text-2xl sm:text-3xl">{d.name}</span>
              <span className="shrink-0 text-sm text-muted">{d.count} עמדות</span>
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-tile text-xl transition group-hover:bg-ink group-hover:text-paper">
                ←
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
