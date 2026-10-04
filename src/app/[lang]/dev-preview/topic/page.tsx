import type { Metadata } from "next";
import Link from "@/i18n/link";
import { getDataset, type List, type Position } from "@/lib/data";
import { TOPICS, type TopicKey } from "@/lib/topics";
import { ListMark } from "@/components/list-card";
import { CanvasRow, QuoteList, TopicCanvas, sourceLabel } from "@/components/topic-rows";
import { Tabs } from "@/components/tabs";
import { Reader } from "./reader";

export const metadata: Metadata = { title: "Dev preview · topic page options", robots: { index: false } };

const KEY: TopicKey = "economy";

const OPTIONS = [
  { id: "b", title: "Equal cards", note: "A grid of identical cards: same size, same template, same face-and-slip mark, every paragraph cut at the same line. Nobody takes more space." },
  { id: "c", title: "One line each", note: "A single gist line per party, all on one screen so you can compare at a glance; open a line for the full paragraph and quotes." },
  { id: "d", title: "Swipe", note: "Equal-size cards in a sideways row, one at a time, like turning pages. Same card for everyone." },
  { id: "e", title: "Text only", note: "No marks at all, no photos, no colours: a name in bold, the gist, a few lines. Two newspaper columns in official order." },
  { id: "f", title: "Reader", note: "Pick a party in the column; its full text opens beside it. Every party is one equal row, you read one at a time, nothing is longer than anything else on the page." },
  { id: "g", title: "Flip cards", note: "Equal cards: the face, the name and the gist on the front; hover or tap and the card turns to show the full paragraph. Same size for everyone." },
  { id: "h", title: "Voices", note: "Quote first: each party's own words in a large serif, the face and gist above. Equal cards, three across." },
  { id: "i", title: "Wall", note: "A wall of small equal tiles (face, name, gist) that fits on one screen. Open a tile and it grows to a full row with the paragraph and quotes." },
  { id: "j", title: "Faces and text", note: "Two newspaper columns in official order, each block led by its face; every paragraph is cut at the same line." },
];

type Row = { l: List; items: Position[]; gist: string | null; text: string; digest: string | null };

async function load(): Promise<{ rows: Row[]; total: number }> {
  const lists = [...(await getDataset())].sort((a, b) => a.cec_order - b.cec_order);
  const rows = lists
    .map((l): Row => {
      const items = l.platform?.positions.filter((p) => p.topic === KEY) ?? [];
      const digest = l.platform?.topic_digests?.[KEY] ?? null;
      return { l, items, digest, gist: l.platform?.topic_titles?.[KEY] ?? null, text: digest ?? items.map((p) => p.point).join(" · ") };
    })
    .filter((r) => r.items.length);
  return { rows, total: lists.length };
}

function EqualCard({ r, h }: { r: Row; h: string }) {
  return (
    <div className={`flex ${h} flex-col rounded-[2rem] bg-mist p-6`}>
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center">
          <ListMark list={r.l} size={44} />
        </span>
        <h3 className="title text-xl">{r.l.name}</h3>
      </div>
      {r.gist && <p className="mt-4 leading-snug font-medium">{r.gist}</p>}
      <p className="mt-3 line-clamp-6 leading-relaxed text-ink-2">{r.text}</p>
      <Link href={`/lists/${r.l.slug}#positions`} className="mt-auto pt-4 text-sm font-semibold text-accent underline-offset-4 hover:underline">
        להמשך ←
      </Link>
    </div>
  );
}

/* B — identical cards in a grid */
function OptionGrid({ rows }: { rows: Row[] }) {
  return (
    <ul className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((r) => (
        <li key={r.l.slug}>
          <EqualCard r={r} h="h-[21rem]" />
        </li>
      ))}
    </ul>
  );
}

/* C — a gist line per party, open for the rest */
function OptionLines({ rows }: { rows: Row[] }) {
  return (
    <div className="mx-auto max-w-4xl px-4">
      <TopicCanvas>
        <div className="pt-4">
          <div className="border-t border-ink/10">
            {rows.map(({ l, items, digest, gist, text }) => (
              <CanvasRow key={l.slug} name="c-lines" lead={<ListMark list={l} size={52} />} title={l.name} sub={gist ?? `${items.length} עמדות`}>
                <p className="text-lg leading-relaxed text-pretty sm:text-xl">{digest ?? text}</p>
                <QuoteList items={items.map((p) => ({ quote: p.quote, href: p.source_url, label: sourceLabel(p) }))} />
              </CanvasRow>
            ))}
          </div>
        </div>
      </TopicCanvas>
    </div>
  );
}

/* D — equal cards, sideways */
function OptionSwipe({ rows }: { rows: Row[] }) {
  return (
    <div className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-[max(1rem,calc((100vw-72rem)/2))] pb-6">
      {rows.map((r) => (
        <div key={r.l.slug} className="w-[min(24rem,85vw)] shrink-0 snap-start">
          <EqualCard r={r} h="h-[26rem]" />
        </div>
      ))}
    </div>
  );
}

/* E — words only */
function OptionText({ rows }: { rows: Row[] }) {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="gap-14 md:columns-2">
        {rows.map((r) => (
          <article key={r.l.slug} className="mb-12 break-inside-avoid">
            <h3 className="title text-2xl">{r.l.name}</h3>
            {r.gist && <p className="mt-1 font-medium text-ink-2">{r.gist}</p>}
            <p className="mt-3 line-clamp-5 text-lg leading-relaxed text-pretty">{r.text}</p>
            <Link href={`/lists/${r.l.slug}#positions`} className="mt-2 inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline">
              להמשך ←
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

/* F — a reading pane */
function OptionReader({ rows }: { rows: Row[] }) {
  const items = rows.map(({ l, items: ps, digest, gist, text }) => ({
    id: l.slug,
    name: l.name,
    gist,
    mark: <ListMark list={l} size={44} />,
    panel: (
      <div>
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center">
            <ListMark list={l} size={56} />
          </span>
          <div>
            <h3 className="title text-3xl">{l.name}</h3>
            {gist && <p className="mt-1 text-lg text-ink-2">{gist}</p>}
          </div>
        </div>
        <p className="mt-6 text-lg leading-relaxed text-pretty sm:text-xl">{digest ?? text}</p>
        <QuoteList items={ps.map((p) => ({ quote: p.quote, href: p.source_url, label: sourceLabel(p) }))} />
      </div>
    ),
  }));
  return (
    <div className="mx-auto max-w-6xl px-4">
      <Reader items={items} />
    </div>
  );
}

/* G — cards that turn over */
function OptionFlip({ rows }: { rows: Row[] }) {
  return (
    <ul className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((r) => (
        <li key={r.l.slug} className="group h-[22rem] [perspective:1200px]" tabIndex={0}>
          <div className="relative size-full transition duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-within:[transform:rotateY(180deg)]">
            <div className="absolute inset-0 flex flex-col rounded-[2rem] bg-mist p-7 [backface-visibility:hidden]">
              <span className="grid size-20 place-items-center">
                <ListMark list={r.l} size={72} />
              </span>
              <h3 className="title mt-5 text-2xl">{r.l.name}</h3>
              {r.gist && <p className="mt-2 text-lg leading-snug font-medium text-ink-2">{r.gist}</p>}
              <p className="mt-auto text-sm text-muted">הפכו את הכרטיס כדי לקרוא</p>
            </div>
            <div className="absolute inset-0 flex flex-col rounded-[2rem] bg-paper p-7 shadow-[0_30px_50px_-36px_rgb(0_12_31/0.35)] ring-1 ring-ink/10 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <h3 className="title text-lg">{r.l.name}</h3>
              <p className="mt-3 overflow-y-auto leading-relaxed text-ink-2">{r.text}</p>
              <Link href={`/lists/${r.l.slug}#positions`} className="mt-auto pt-3 text-sm font-semibold text-accent underline-offset-4 hover:underline">
                להמשך ←
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* H — their words first */
function OptionVoices({ rows }: { rows: Row[] }) {
  return (
    <ul className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((r) => (
        <li key={r.l.slug} className="flex h-[24rem] flex-col rounded-[2rem] bg-mist p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center">
              <ListMark list={r.l} size={44} />
            </span>
            <div>
              <h3 className="title text-xl">{r.l.name}</h3>
              {r.gist && <p className="text-sm text-ink-2">{r.gist}</p>}
            </div>
          </div>
          <blockquote className="serif mt-6 line-clamp-7 text-[1.35rem] leading-snug text-pretty">”{r.items[0].quote}“</blockquote>
          <a href={r.items[0].source_url} target="_blank" rel="noreferrer" className="mt-auto pt-4 text-sm text-accent underline-offset-4 hover:underline">
            {sourceLabel(r.items[0])} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}

/* I — a wall of tiles that grow */
function OptionWall({ rows }: { rows: Row[] }) {
  return (
    <ul className="mx-auto grid max-w-6xl gap-3 px-4 sm:grid-cols-2 lg:grid-cols-4">
      {rows.map(({ l, items, digest, gist, text }) => (
        <li key={l.slug} className="contents">
          <details className="group rounded-[1.75rem] bg-mist open:bg-paper open:shadow-[0_30px_50px_-36px_rgb(0_12_31/0.3)] open:ring-1 open:ring-ink/10 sm:open:col-span-2 lg:open:col-span-4">
            <summary className="flex min-h-36 cursor-pointer flex-col gap-3 p-5 group-open:min-h-0">
              <span className="flex items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center">
                  <ListMark list={l} size={44} />
                </span>
                <span className="title text-lg leading-tight">{l.name}</span>
              </span>
              {gist && <span className="text-sm leading-snug text-ink-2">{gist}</span>}
            </summary>
            <div className="px-6 pb-7">
              <p className="max-w-3xl text-lg leading-relaxed text-pretty">{digest ?? text}</p>
              <QuoteList items={items.map((p) => ({ quote: p.quote, href: p.source_url, label: sourceLabel(p) }))} />
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

/* J — newspaper columns, each block led by a face */
function OptionFacesText({ rows }: { rows: Row[] }) {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="gap-14 md:columns-2">
        {rows.map((r) => (
          <article key={r.l.slug} className="mb-12 flex break-inside-avoid gap-4">
            <span className="grid size-14 shrink-0 place-items-center">
              <ListMark list={r.l} size={52} />
            </span>
            <div>
              <h3 className="title text-2xl">{r.l.name}</h3>
              {r.gist && <p className="mt-1 font-medium text-ink-2">{r.gist}</p>}
              <p className="mt-3 line-clamp-6 text-lg leading-relaxed text-pretty">{r.text}</p>
              <Link href={`/lists/${r.l.slug}#positions`} className="mt-2 inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline">
                להמשך ←
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default async function TopicDesigns() {
  const { rows, total } = await load();
  const RENDER: Record<string, React.ReactNode> = {
    b: <OptionGrid rows={rows} />,
    c: <OptionLines rows={rows} />,
    d: <OptionSwipe rows={rows} />,
    e: <OptionText rows={rows} />,
    f: <OptionReader rows={rows} />,
    g: <OptionFlip rows={rows} />,
    h: <OptionVoices rows={rows} />,
    i: <OptionWall rows={rows} />,
    j: <OptionFacesText rows={rows} />,
  };
  return (
    <div className="pb-24">
      <p className="mx-auto mt-8 max-w-3xl px-4 text-center text-sm text-muted">
        Real data: {TOPICS[KEY].label}, {rows.length} of {total} lists, strict official order. Pick an option below.
      </p>
      <div className="mx-auto mt-6 max-w-[90rem] px-4">
        <Tabs
          tabs={OPTIONS.map((o) => ({ id: o.id, label: `${o.id.toUpperCase()} · ${o.title}` }))}
          panels={OPTIONS.map((o) => (
            <div key={o.id}>
              <p className="mx-auto max-w-2xl pb-10 text-center text-base leading-relaxed text-ink-2">{o.note}</p>
              {RENDER[o.id]}
            </div>
          ))}
        />
      </div>
    </div>
  );
}
