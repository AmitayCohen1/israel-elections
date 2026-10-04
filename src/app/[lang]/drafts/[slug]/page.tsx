import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { TOPIC_KEYS, type TopicKey } from "@/lib/topics";
import { Ballot } from "@/components/ballot";
import { TopicCanvas, TopicRow, QuoteList } from "@/components/topic-rows";

/**
 * Internal review page for AI-extracted position drafts (data/extracted/*.json).
 * Reads straight from disk — nothing here touches the DB or the public pages.
 * Same components as the public list page (design M), so what is reviewed here is what publishes.
 */

export const metadata: Metadata = {
  title: "טיוטת עמדות — לבדיקה",
  robots: { index: false, follow: false },
};

// Reads draft JSON from disk per request, so it can't be prerendered into a static shell.
export const instant = false;

type Draft = {
  slug: string;
  status: string;
  extracted_at: string;
  source_url: string;
  review?: { verdict: string; notes?: string };
  topic_titles?: Partial<Record<TopicKey, string>>;
  topic_digests?: Partial<Record<TopicKey, string>>;
  positions: { topic: TopicKey; stance: string; quote: string }[];
};

const DIR = path.join(process.cwd(), "data", "extracted");

export async function generateStaticParams() {
  const files = await readdir(DIR).catch(() => []);
  return files.filter((f) => f.endsWith(".json")).map((f) => ({ slug: f.replace(/\.json$/, "") }));
}

export default async function DraftPage({ params }: PageProps<"/[lang]/drafts/[slug]">) {
  const { slug } = await params;
  if (!/^[a-z0-9-]+$/.test(slug)) notFound();
  const raw = await readFile(path.join(DIR, `${slug}.json`), "utf8").catch(() => null);
  if (!raw) notFound();
  const draft: Draft = JSON.parse(raw);
  const lists = JSON.parse(await readFile(path.join(process.cwd(), "data", "lists.json"), "utf8")) as {
    slug: string;
    name: string;
    letters: string;
    color: string;
  }[];
  const list = lists.find((l) => l.slug === slug);
  const byTopic = Map.groupBy(draft.positions, (p) => p.topic);
  const host = new URL(draft.source_url).hostname.replace(/^www\./, "");

  return (
    <div className="px-3 pb-10">
      <div className="mx-auto max-w-4xl">
        <TopicCanvas>
          <header className="pt-12 pb-12 text-center sm:pt-14">
            <p className="text-base tracking-wide text-muted">
              טיוטה לבדיקה פנימית · {draft.status === "approved" ? "מאושרת, מפורסמת בעמוד הרשימה" : "לא מפורסם באתר"}
              {draft.review && ` · סקירה: ${draft.review.verdict}`}
            </p>
            <h1 className="serif mt-6 text-[clamp(3rem,5.2vw,5.5rem)] text-balance">{list?.name ?? slug}</h1>
            <p className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-lg text-ink-2 sm:text-xl">
              {list && <Ballot letters={list.letters} color={list.color} size="sm" className="-rotate-6" />}
              <span>
                מה הרשימה מציעה, נושא אחר נושא · מתוך{" "}
                <a href={draft.source_url} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline">
                  {host} ↗
                </a>
              </span>
            </p>
            {draft.review?.notes && <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-2">{draft.review.notes}</p>}
          </header>

          <div className="border-t border-ink/10">
            {TOPIC_KEYS.map((key) => {
              const digest = draft.topic_digests?.[key];
              const items = byTopic.get(key) ?? [];
              if (!digest && !items.length) return null;
              return (
                <TopicRow key={key} topic={key} sub={draft.topic_titles?.[key]}>
                  {digest ? (
                    <p className="text-lg leading-relaxed text-pretty sm:text-xl">{digest}</p>
                  ) : (
                    <ul className="space-y-4">
                      {items.map((p, i) => (
                        <li key={i} className="text-lg leading-relaxed">
                          {p.stance}
                        </li>
                      ))}
                    </ul>
                  )}
                  <QuoteList items={items.map((p) => ({ quote: p.quote, href: draft.source_url, label: `המצע באתר הרשימה · ${host}` }))} />
                </TopicRow>
              );
            })}
          </div>
        </TopicCanvas>
      </div>
    </div>
  );
}
