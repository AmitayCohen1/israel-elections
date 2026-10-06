import { getDictionary, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { positionLabels } from "@/i18n/messages/positions";
import { SOURCE_TYPES, topicLabel, type TopicKey } from "@/lib/topics";
import type { Position } from "@/lib/data";
import { TopicIllustration } from "@/components/illustration";
import { Chevron } from "@/components/chevron";

const m = defineMessages(
  { quote: (q: string) => `”${q}“` },
  {
    en: { quote: (q: string) => `“${q}”` },
    ar: { quote: (q: string) => `«${q}»` },
    ru: { quote: (q: string) => `«${q}»` },
    am: { quote: (q: string) => `«${q}»` },
  },
);

/** Design M: topic rows set on the hero's grey canvas, used by the list pages and the draft review pages. */
export function TopicCanvas({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[2.75rem] bg-mist px-5 pb-6 sm:px-12">{children}</div>;
}

/** A collapsed row on the canvas: a lead (disc, face), a title, an optional one-line gist; it opens to its content. */
export function CanvasRow({ id, lead, title, sub, name = "rows", children }: { id?: string; lead: React.ReactNode; title: React.ReactNode; sub?: string | null; name?: string; children: React.ReactNode }) {
  return (
    <details id={id} name={name} className="group scroll-mt-24 border-b border-ink/10 target:bg-white/50">
      <summary className="flex cursor-pointer items-center gap-5 py-6">
        <span className="grid size-16 shrink-0 place-items-center">{lead}</span>
        <span className="flex-1">
          <span className="title block text-2xl sm:text-3xl">{title}</span>
          {sub && <span className="mt-1 block text-lg text-ink-2">{sub}</span>}
        </span>
        <Chevron className="size-10 bg-paper" />
      </summary>
      <div className="pb-10">{children}</div>
    </details>
  );
}

/** One topic as a row: the painted object on a white disc, the topic, a one-line gist. */
export async function TopicRow({ topic, sub, name = "topics", children }: { topic: TopicKey; sub?: string | null; name?: string; children: React.ReactNode }) {
  const dict = await getDictionary();
  return (
    <CanvasRow
      name={name}
      title={topicLabel(dict, topic)}
      sub={sub}
      lead={
        <span className="grid size-16 place-items-center rounded-full bg-paper shadow-[0_14px_30px_-24px_rgb(0_12_31/0.35)]">
          <TopicIllustration topic={topic} className="!w-11" />
        </span>
      }
    >
      {children}
    </CanvasRow>
  );
}

export type QuoteItem = { quote: string; href: string; label: string };

/** "In their own words": the exact quotes behind a digest, each with where it was said. */
export async function QuoteList({ items, heading = true }: { items: QuoteItem[]; heading?: boolean }) {
  if (!items.length) return null;
  const t = await getMessages(m);
  const labels = await getMessages(positionLabels);
  return (
    <div className={heading ? "mt-7" : "mt-4"}>
      {heading && <p className="text-lg font-semibold tracking-wide text-muted">{labels.quote}</p>}
      <ul className="mt-3 space-y-4 border-s-2 border-ink/15 ps-4">
        {items.map((q, i) => (
          <li key={i}>
            <p className="leading-relaxed text-ink-2">{t.quote(q.quote)}</p>
            <a href={q.href} target="_blank" rel="noreferrer" className="mt-1 inline-block text-lg text-accent underline-offset-4 hover:underline">
              {labels.source} · {q.label} ↗
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * What a party said on a topic, quotes first: its own words, verbatim, each with where it was said; and only after them
 * our short summary, labelled as ours. `size` is the reading size.
 */
export async function OwnWords({ items, summary, size = "lg" }: { items: Position[]; summary?: string | null; size?: "base" | "lg" }) {
  const t = await getMessages(m);
  const labels = await getMessages(positionLabels);
  const { sourceTypes } = await getDictionary();
  const big = size === "lg" ? "text-xl leading-[1.7] sm:text-2xl sm:leading-[1.7]" : "text-lg leading-relaxed";
  return (
    <div>
      <p className="mb-3 text-lg font-semibold text-muted">{labels.quote}</p>
      <ul className="space-y-5 border-s-2 border-ink/20 ps-3 sm:ps-4">
        {items.map((p, i) => (
          <li key={i}>
            <p className={`${big} text-pretty`}>{t.quote(p.quote)}</p>
            <a href={p.source_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-lg text-accent underline-offset-4 hover:underline">
              {labels.source} · {sourceLabel(p, sourceTypes)} ↗
            </a>
          </li>
        ))}
      </ul>
      {(summary || items.some((p) => p.point)) && (
        <div className="mt-6">
          <p className="text-lg font-semibold tracking-wide text-muted">{labels.summary}</p>
          {summary ? (
            <p className="mt-1 text-lg leading-relaxed text-pretty text-ink-2">{summary}</p>
          ) : (
            <ul className="mt-1 space-y-1.5 text-lg leading-relaxed text-pretty text-ink-2">
              {items.map((p, i) => (
                <li key={i}>{p.point}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/** Where a quote was said, for the line under it: "Party website · example.org". `types` is the dictionary's sourceTypes; Hebrew without it. */
export function sourceLabel(x: Position, types: Record<string, string> = SOURCE_TYPES) {
  let host = x.source_url;
  try {
    host = new URL(x.source_url).hostname.replace(/^www\./, "");
  } catch {}
  return `${x.source_type ? `${types[x.source_type] ?? x.source_type} · ` : ""}${host}`;
}
