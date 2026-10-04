import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { TOPICS, TOPIC_KEYS, type TopicKey } from "@/lib/topics";
import { Ballot } from "@/components/ballot";
import { TopicIllustration } from "@/components/illustration";
import { AccRow } from "@/components/accordion";
import { TopicDropdown } from "./dropdown";

export const metadata: Metadata = { title: "Dev preview · draft review options", robots: { index: false } };

// Internal review page; reads draft JSON from disk, so it can't be prerendered into a static shell.
export const instant = false;

type P = { topic: TopicKey; stance: string; quote: string };
type Draft = {
  slug: string;
  extracted_at: string;
  source_url: string;
  positions: P[];
  topic_titles?: Partial<Record<TopicKey, string>>;
  topic_digests?: Partial<Record<TopicKey, string>>;
};
type ListMeta = { slug: string; name: string; letters: string; color: string };

const OPTIONS = [
  { id: "a", title: "Index", note: "Hairline sections, the painted object beside each section title, the site's standard position item." },
  { id: "b", title: "Document", note: "Reads like a filed paper: small topic kickers, numbered entries, no icons at all. The quietest." },
  { id: "c", title: "Register", note: "Two columns per topic — the topic and its icon sit in a side rail, the positions read next to it." },
  { id: "d", title: "Testimony", note: "The quote leads, large and serif, like testimony on the record; our neutral line becomes the caption." },
  { id: "e", title: "Painted", note: "The new gouache topic paintings lead each section — the same eight objects every list shares." },
  { id: "f", title: "Folders", note: "Nothing open by default: each topic is one painted row that unfolds. The first screen is eight quiet lines." },
  { id: "g", title: "Gallery", note: "A shelf of painted topic tiles; tap one and only that topic's positions appear below. One topic at a time." },
  { id: "h", title: "Headlines", note: "Only our one-liners show, like headlines; the quote and source open per line. The least text possible first." },
  { id: "i", title: "Dropdown", note: "One painted dropdown holds all eight topics; the page shows a single topic's positions at a time." },
  { id: "j", title: "Digest", note: "One written paragraph per topic — their take in our words — with the exact quotes underneath as the receipts." },
  { id: "k", title: "Chosen", note: "The shape on /drafts today: painted row, topic + one-line gist, opens to the digest paragraph." },
  { id: "l", title: "Take first", note: "The same rows, but their take IS the big line; the topic becomes the small kicker above it." },
  { id: "m", title: "Canvas", note: "The chosen rows set on the grey rounded canvas, paintings on white discs — the hero's surface language." },
];

async function load(): Promise<{ draft: Draft; list: ListMeta | undefined }> {
  const draft: Draft = JSON.parse(await readFile(path.join(process.cwd(), "data", "extracted", "together.json"), "utf8"));
  const lists: ListMeta[] = JSON.parse(await readFile(path.join(process.cwd(), "data", "lists.json"), "utf8"));
  return { draft, list: lists.find((l) => l.slug === draft.slug) };
}

const grouped = (ps: P[]) => TOPIC_KEYS.map((k) => [k, ps.filter((p) => p.topic === k)] as const).filter(([, v]) => v.length);

function Header({ draft, list, tight }: { draft: Draft; list?: ListMeta; tight?: boolean }) {
  const host = new URL(draft.source_url).hostname.replace(/^www\./, "");
  return (
    <header className={`${tight ? "pb-10" : "pb-14"} pt-12 text-center`}>
      <p className="text-base tracking-wide text-muted">טיוטה לבדיקה פנימית · לא מפורסם באתר</p>
      <h1 className="serif mt-5 text-[clamp(2.75rem,4.6vw,4.5rem)]">{list?.name ?? draft.slug}</h1>
      <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-lg text-ink-2">
        {list && <Ballot letters={list.letters} color={list.color} size="sm" className="-rotate-6" />}
        <span>
          {draft.positions.length} עמדות מתוך המצע ·{" "}
          <a href={draft.source_url} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline">
            {host} ↗
          </a>
        </span>
      </p>
    </header>
  );
}

/* A — the current live design */
function OptionIndex({ draft, list }: { draft: Draft; list?: ListMeta }) {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <Header draft={draft} list={list} />
      {grouped(draft.positions).map(([key, items]) => (
        <section key={key} className="border-t border-line py-12">
          <h3 className="flex items-center gap-4">
            <TopicIllustration topic={key} className="!mx-0 !w-16 shrink-0" />
            <span className="title text-2xl sm:text-3xl">{TOPICS[key].label}</span>
          </h3>
          <ul className="mt-8 space-y-11">
            {items.map((p, i) => (
              <li key={i}>
                <p className="text-xl leading-snug font-medium text-pretty">{p.stance}</p>
                <blockquote className="mt-3 border-r-2 border-line-strong pr-4 leading-relaxed text-ink-2">”{p.quote}“</blockquote>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* B — a filed paper: kickers, numbers, no icons */
function OptionDocument({ draft, list }: { draft: Draft; list?: ListMeta }) {
  const groups = grouped(draft.positions);
  const offsets = groups.map((_, gi) => groups.slice(0, gi).reduce((s, [, v]) => s + v.length, 0));
  return (
    <div className="mx-auto max-w-2xl px-4">
      <Header draft={draft} list={list} tight />
      <div className="border-t border-line-strong">
        {groups.map(([key, items], gi) => (
          <section key={key} className="py-10">
            <p className="flex items-center gap-3 text-base font-semibold tracking-widest text-muted">
              <TopicIllustration topic={key} className="!mx-0 !w-11 shrink-0" />
              {TOPICS[key].label}
            </p>
            <ul className="mt-6 space-y-10">
              {items.map((p, i) => {
                return (
                  <li key={i} className="flex gap-6">
                    <span aria-hidden className="serif pt-0.5 text-2xl leading-none text-ink/25 tabular-nums">
                      {String(offsets[gi] + i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-xl leading-snug font-medium text-pretty">{p.stance}</p>
                      <blockquote className="mt-3 leading-relaxed text-ink-2">”{p.quote}“</blockquote>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

/* C — topic rail beside the reading column */
function OptionRegister({ draft, list }: { draft: Draft; list?: ListMeta }) {
  return (
    <div className="mx-auto max-w-4xl px-4">
      <Header draft={draft} list={list} />
      {grouped(draft.positions).map(([key, items]) => (
        <section key={key} className="grid gap-6 border-t border-line py-12 sm:grid-cols-[11rem_1fr] sm:gap-10">
          <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-3">
            <TopicIllustration topic={key} className="!mx-0 !w-20 shrink-0 sm:!w-24" />
            <p className="title text-xl leading-tight">{TOPICS[key].label}</p>
          </div>
          <ul className="space-y-11">
            {items.map((p, i) => (
              <li key={i}>
                <p className="text-xl leading-snug font-medium text-pretty">{p.stance}</p>
                <blockquote className="mt-3 border-r-2 border-line-strong pr-4 leading-relaxed text-ink-2">”{p.quote}“</blockquote>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* D — the quote on the record, our line as caption */
function OptionTestimony({ draft, list }: { draft: Draft; list?: ListMeta }) {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <Header draft={draft} list={list} />
      {grouped(draft.positions).map(([key, items]) => (
        <section key={key} className="border-t border-line py-12">
          <p className="flex items-center gap-3 text-base font-semibold tracking-widest text-muted">
            <TopicIllustration topic={key} className="!mx-0 !w-11 shrink-0" />
            {TOPICS[key].label}
          </p>
          <ul className="mt-8 space-y-14">
            {items.map((p, i) => (
              <li key={i}>
                <blockquote className="serif text-[1.65rem] leading-snug text-pretty sm:text-3xl">”{p.quote}“</blockquote>
                <p className="mt-4 text-base text-ink-2">{p.stance}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* E — the painted topic objects lead each section */
function OptionPainted({ draft, list }: { draft: Draft; list?: ListMeta }) {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <Header draft={draft} list={list} />
      {grouped(draft.positions).map(([key, items]) => (
        <section key={key} className="grid gap-4 border-t border-line py-12 sm:grid-cols-[8.5rem_1fr] sm:gap-10">
          <div className="text-center sm:text-start">
            <TopicIllustration topic={key} className="!w-24 sm:!w-28 sm:!mx-0" />
            <p className="title mt-3 text-xl leading-tight">{TOPICS[key].label}</p>
          </div>
          <ul className="space-y-11">
            {items.map((p, i) => (
              <li key={i}>
                <p className="text-xl leading-snug font-medium text-pretty">{p.stance}</p>
                <blockquote className="mt-3 border-r-2 border-line-strong pr-4 leading-relaxed text-ink-2">”{p.quote}“</blockquote>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* F — collapsed painted rows, the list-page accordion idiom */
function OptionFolders({ draft, list }: { draft: Draft; list?: ListMeta }) {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <Header draft={draft} list={list} />
      <div className="border-t border-line">
        {grouped(draft.positions).map(([key, items]) => (
          <AccRow key={key} name="f-topics" title={TOPICS[key].label} meta={items.length} lead={<TopicIllustration topic={key} className="!mx-0 !w-14 shrink-0" />}>
            <ul className="space-y-10">
              {items.map((p, i) => (
                <li key={i}>
                  <p className="text-xl leading-snug font-medium text-pretty">{p.stance}</p>
                  <blockquote className="mt-3 border-r-2 border-line-strong pr-4 leading-relaxed text-ink-2">”{p.quote}“</blockquote>
                </li>
              ))}
            </ul>
          </AccRow>
        ))}
      </div>
    </div>
  );
}

/* G — a shelf of painted tiles; :target shows one topic at a time */
function OptionGallery({ draft, list }: { draft: Draft; list?: ListMeta }) {
  const groups = grouped(draft.positions);
  return (
    <div className="mx-auto max-w-3xl px-4">
      <Header draft={draft} list={list} tight />
      <nav className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {groups.map(([key, items]) => (
          <a key={key} href={`#g-${key}`} className="group rounded-[1.75rem] bg-tile/60 px-4 pt-5 pb-4 text-center transition hover:bg-tile">
            <TopicIllustration topic={key} className="!w-16 transition group-hover:scale-105" />
            <span className="mt-3 block leading-tight font-medium">{TOPICS[key].label}</span>
            <span className="mt-1 block text-base text-muted">{items.length} עמדות</span>
          </a>
        ))}
      </nav>
      <div className="mt-4">
        {groups.map(([key, items]) => (
          <div key={key} id={`g-${key}`} className="hidden scroll-mt-24 border-t border-line pt-10 target:block">
            <ul className="space-y-10 pb-4">
              {items.map((p, i) => (
                <li key={i}>
                  <p className="text-xl leading-snug font-medium text-pretty">{p.stance}</p>
                  <blockquote className="mt-3 border-r-2 border-line-strong pr-4 leading-relaxed text-ink-2">”{p.quote}“</blockquote>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* H — headlines only; each line opens to its quote */
function OptionHeadlines({ draft, list }: { draft: Draft; list?: ListMeta }) {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <Header draft={draft} list={list} tight />
      {grouped(draft.positions).map(([key, items]) => (
        <section key={key} className="pt-10">
          <p className="flex items-center gap-3">
            <TopicIllustration topic={key} className="!mx-0 !w-12 shrink-0" />
            <span className="title text-xl">{TOPICS[key].label}</span>
          </p>
          <div className="mt-2 border-t border-line">
            {items.map((p, i) => (
              <details key={i} className="group border-b border-line">
                <summary className="flex cursor-pointer items-center gap-4 py-5">
                  <span className="flex-1 text-lg leading-snug font-medium text-pretty">{p.stance}</span>
                  <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-tile text-lg font-light transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <blockquote className="mb-6 border-r-2 border-line-strong pr-4 leading-relaxed text-ink-2">”{p.quote}“</blockquote>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* I — a dropdown picker; one topic on screen at a time */
function OptionDropdown({ draft, list }: { draft: Draft; list?: ListMeta }) {
  const groups = grouped(draft.positions).map(([key, items]) => ({ key, label: TOPICS[key].label, items }));
  return (
    <div className="mx-auto max-w-3xl px-4">
      <Header draft={draft} list={list} tight />
      <TopicDropdown groups={groups} />
    </div>
  );
}

/* J — a paragraph per topic, the quotes beneath as receipts */
function OptionDigest({ draft, list }: { draft: Draft; list?: ListMeta }) {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <Header draft={draft} list={list} />
      {grouped(draft.positions).map(([key, items]) => (
        <section key={key} className="border-t border-line py-12">
          <h3 className="flex items-center gap-4">
            <TopicIllustration topic={key} className="!mx-0 !w-16 shrink-0" />
            <span className="title text-2xl sm:text-3xl">{TOPICS[key].label}</span>
          </h3>
          {draft.topic_digests?.[key] && <p className="mt-6 text-lg leading-relaxed text-pretty sm:text-xl">{draft.topic_digests[key]}</p>}
          <ul className="mt-6 space-y-4 border-r-2 border-line-strong pr-4">
            {items.map((p, i) => (
              <li key={i} className="leading-relaxed text-ink-2">
                ”{p.quote}“ <span className="text-base text-muted">· מתוך המצע</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* K — the live /drafts shape, as the baseline to compare against */
function OptionChosen({ draft, list }: { draft: Draft; list?: ListMeta }) {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <Header draft={draft} list={list} />
      <div className="border-t border-line">
        {grouped(draft.positions).map(([key]) => (
          <AccRow
            key={key}
            name="k-topics"
            title={TOPICS[key].label}
            sub={draft.topic_titles?.[key]}
            lead={<TopicIllustration topic={key} className="!mx-0 !w-14 shrink-0" />}
          >
            <p className="text-lg leading-relaxed text-pretty sm:text-xl">{draft.topic_digests?.[key]}</p>
          </AccRow>
        ))}
      </div>
    </div>
  );
}

/* L — the gist is the headline; the topic is the kicker */
function OptionTakeFirst({ draft, list }: { draft: Draft; list?: ListMeta }) {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <Header draft={draft} list={list} />
      <div className="border-t border-line">
        {grouped(draft.positions).map(([key]) => (
          <AccRow
            key={key}
            name="l-topics"
            title={<span className="text-[1.45rem] leading-snug sm:text-[1.7rem]">{draft.topic_titles?.[key]}</span>}
            sub={<span className="text-base tracking-wide text-muted">{TOPICS[key].label}</span>}
            lead={<TopicIllustration topic={key} className="!mx-0 !w-14 shrink-0" />}
          >
            <p className="text-lg leading-relaxed text-pretty sm:text-xl">{draft.topic_digests?.[key]}</p>
          </AccRow>
        ))}
      </div>
    </div>
  );
}

/* M — the chosen rows on the hero's grey canvas */
function OptionCanvas({ draft, list }: { draft: Draft; list?: ListMeta }) {
  return (
    <div className="px-3">
      <div className="mx-auto max-w-4xl rounded-[2.75rem] bg-mist px-5 pb-6 sm:px-12">
        <Header draft={draft} list={list} tight />
        <div className="border-t border-ink/10">
          {grouped(draft.positions).map(([key]) => (
            <details key={key} name="m-topics" className="group border-b border-ink/10">
              <summary className="flex cursor-pointer items-center gap-5 py-6">
                <span className="grid size-16 shrink-0 place-items-center rounded-full bg-paper shadow-[0_14px_30px_-24px_rgb(0_12_31/0.35)]">
                  <TopicIllustration topic={key} className="!w-11" />
                </span>
                <span className="flex-1">
                  <span className="title block text-2xl sm:text-3xl">{TOPICS[key].label}</span>
                  {draft.topic_titles?.[key] && <span className="mt-1 block text-base text-ink-2">{draft.topic_titles[key]}</span>}
                </span>
                <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-paper text-2xl font-light transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-10 text-lg leading-relaxed text-pretty sm:text-xl">{draft.topic_digests?.[key]}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function DraftDesigns() {
  const { draft, list } = await load();
  const RENDER = {
    a: <OptionIndex draft={draft} list={list} />,
    b: <OptionDocument draft={draft} list={list} />,
    c: <OptionRegister draft={draft} list={list} />,
    d: <OptionTestimony draft={draft} list={list} />,
    e: <OptionPainted draft={draft} list={list} />,
    f: <OptionFolders draft={draft} list={list} />,
    g: <OptionGallery draft={draft} list={list} />,
    h: <OptionHeadlines draft={draft} list={list} />,
    i: <OptionDropdown draft={draft} list={list} />,
    j: <OptionDigest draft={draft} list={list} />,
    k: <OptionChosen draft={draft} list={list} />,
    l: <OptionTakeFirst draft={draft} list={list} />,
    m: <OptionCanvas draft={draft} list={list} />,
  } as const;

  return (
    <div className="pb-24">
      <nav className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 pt-8 text-base text-ink-2" dir="ltr">
        {OPTIONS.map((o) => (
          <a key={o.id} href={`#${o.id}`} className="underline-offset-4 hover:underline">
            {o.id.toUpperCase()} · {o.title}
          </a>
        ))}
      </nav>
      {OPTIONS.map((o) => (
        <section key={o.id} id={o.id} className="scroll-mt-16 border-b border-line-strong pb-20">
          <div className="mx-auto flex max-w-3xl items-baseline gap-5 px-4 pt-16" dir="ltr">
            <span className="serif text-6xl uppercase">{o.id}</span>
            <div>
              <p className="title text-xl">{o.title}</p>
              <p className="mt-1 text-base text-ink-2">{o.note}</p>
            </div>
          </div>
          <div className="mt-6">{RENDER[o.id as keyof typeof RENDER]}</div>
        </section>
      ))}
    </div>
  );
}
