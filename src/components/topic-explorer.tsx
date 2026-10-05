"use client";

import Link, { useMessages } from "@/i18n/link";
import { defineMessages } from "@/i18n/messages";
import { arCount, ruPlural } from "@/i18n/messages/plural";
import { useDict } from "@/i18n/provider";
import { useEffect, useRef, useState } from "react";
import { Chevron } from "@/components/chevron";

export type ExplorerRow = { id: string; name: string; gist: string | null; mark: React.ReactNode; body: React.ReactNode };
export type ExplorerTopic = {
  key: string;
  label: string;
  icon: React.ReactNode;
  /** Every list that wrote on this topic. */
  rows: ExplorerRow[];
  silent: { slug: string; name: string; main?: boolean }[];
  total: number;
};

const m = defineMessages(
  {
    wrote: (n: number, total: number, topic: string) => `מצאנו עמדה בנושא ${topic} אצל ${n} מתוך ${total} מפלגות. הסדר אקראי ומשתנה בכל ביקור.`,
    silent: (n: number, topic: string) => `לא מצאנו עמדה בנושא ${topic} אצל ${n} מפלגות`,
  },
  {
    en: {
      wrote: (n: number, total: number, topic: string) => `We found a position on ${topic} for ${n} of ${total} parties. The order is random and changes on each visit.`,
      silent: (n: number, topic: string) => `No position on ${topic} found for ${n} ${n === 1 ? "party" : "parties"}`,
    },
    ar: {
      wrote: (n: number, total: number, topic: string) => `وجدنا موقفًا في قضية «${topic}» لدى ${n} من ${total} حزبًا. الترتيب عشوائي ويتغير في كل زيارة.`,
      silent: (n: number, topic: string) => `لم نجد موقفًا في قضية «${topic}» لدى ${arCount(n, ["حزب واحد", "حزبين", "أحزاب", "حزبًا"])}`,
    },
    ru: {
      wrote: (n: number, total: number, topic: string) => `Мы нашли позицию по теме «${topic}» у ${n} из ${total} партий. Порядок случайный и меняется при каждом посещении.`,
      silent: (n: number, topic: string) => `Позиции по теме «${topic}» не нашли у ${n} ${ruPlural(n, "партии", "партий", "партий")}`,
    },
    am: {
      wrote: (n: number, total: number, topic: string) => `በ${topic} ላይ ከ${total} ፓርቲዎች ውስጥ ለ${n} አቋም አግኝተናል። ቅደም ተከተሉ በዘፈቀደ ነው፣ በእያንዳንዱ ጉብኝትም ይቀየራል።`,
      silent: (n: number, topic: string) => `በ${topic} ላይ አቋም ያላገኘንላቸው ${n} ፓርቲዎች`,
    },
  },
);

/**
 * The category is the lens: pick one, and every list that wrote on it is a row with its position in a line.
 * Open a row for the full text. The order is random and changes on every visit, so no list is always first.
 * #topic (or #topic:list, which opens that row) in the URL opens a category.
 */
export function TopicExplorer({ topics, defaultKey }: { topics: ExplorerTopic[]; defaultKey?: string }) {
  const tx = useMessages(m);
  const dict = useDict();
  const [key, setKey] = useState(defaultKey && topics.some((x) => x.key === defaultKey) ? defaultKey : topics[0].key);
  const [focus, setFocus] = useState<string | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Randomness exists only in the browser: the server always renders the same HTML, so the order is set after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeed(Math.random());
  }, []);

  useEffect(() => {
    const fromHash = () => {
      const [t, id] = decodeURIComponent(window.location.hash.slice(1)).split(":");
      if (!topics.some((x) => x.key === t)) return;
      setKey(t);
      setFocus(id ?? null);
      root.current?.scrollIntoView({ block: "start" });
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [topics]);

  const t = topics.find((x) => x.key === key) ?? topics[0];
  const rows = seed === null ? t.rows : [...t.rows].sort((a, b) => hash(a.id + seed) - hash(b.id + seed));

  useEffect(() => {
    if (focus) document.getElementById(`${key}-${focus}`)?.scrollIntoView({ block: "center" });
  }, [key, focus, seed]);

  const pickTopic = (k: string) => {
    setKey(k);
    setFocus(null);
    window.history.replaceState(null, "", `#${k}`);
  };

  return (
    <div ref={root} id="topics" className="scroll-mt-24 lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-14 lg:items-start">
      {/* One click: pick a topic. A chip strip on small screens, a sticky side list on wide ones. */}
      <nav aria-label={dict.nav.topics} className="scrollbar-none sticky top-0 z-10 -mx-4 mb-6 flex gap-2 overflow-x-auto bg-paper/95 px-4 py-2 backdrop-blur-[1.5px] sm:-mx-8 sm:px-8 lg:top-4 lg:mx-0 lg:mb-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        {topics.map((x) => {
          const on = x.key === key;
          return (
            <button
              key={x.key}
              type="button"
              aria-pressed={on}
              onClick={() => pickTopic(x.key)}
              className={`flex shrink-0 items-center gap-3 rounded-full px-4 py-2 text-xl transition lg:rounded-2xl lg:px-3 lg:py-1.5 lg:text-2xl ${on ? "bg-ink text-white lg:bg-mist lg:text-ink" : "bg-tile hover:bg-mist lg:bg-transparent"}`}
            >
              <span className="hidden size-20 shrink-0 place-items-center lg:grid">{x.icon}</span>
              <span className="title leading-tight">{x.label}</span>
            </button>
          );
        })}
      </nav>

      {/* One line per list. Open one for the full text: it opens in place, in a single column, so nothing jumps. */}
      <div className="min-w-0 max-w-3xl">
        <p className="mb-3 text-xl text-ink-2">
          {tx.wrote(t.rows.length, t.total, t.label)}
        </p>
        <div className="border-t border-line">
          {rows.map((r) => (
            <details key={`${t.key}-${r.id}`} id={`${t.key}-${r.id}`} name="rows" open={focus === r.id} className="group scroll-mt-32 border-b border-line">
              <summary className="flex cursor-pointer items-center gap-3 py-3.5">
                <span className="grid size-11 shrink-0 place-items-center">{r.mark}</span>
                <span className="min-w-0 flex-1">
                  <span className="title block text-xl leading-tight">{r.name}</span>
                  {r.gist && <span className="mt-0.5 line-clamp-1 block text-lg leading-snug text-ink-2 group-open:hidden">{r.gist}</span>}
                </span>
                <Chevron className="size-8 bg-tile" />
              </summary>
              <div className="pb-6 ps-14">{r.body}</div>
            </details>
          ))}
        </div>

        {/* A main list with nothing on this topic is named in the open; the rest of the silent ones fold away. */}
        {[t.silent.filter((l) => l.main), t.silent.filter((l) => !l.main)].map((group, k) => {
          if (group.length === 0) return null;
          const names = (
            <p className="mt-1">
              {group.map((l, i) => (
                <span key={l.slug}>
                  {i > 0 && " · "}
                  <Link href={`/lists/${l.slug}`} className="underline-offset-4 hover:underline">
                    {l.name}
                  </Link>
                </span>
              ))}
            </p>
          );
          return k === 0 ? (
            <div key="main" className="mt-4 text-lg leading-snug text-ink-2">
              <p className="font-semibold text-ink">{tx.silent(group.length, t.label)}</p>
              {names}
            </div>
          ) : (
            <details key="rest" className="mt-4 text-lg leading-snug text-ink-2">
              <summary className="inline-block cursor-pointer font-semibold text-accent underline-offset-4 hover:underline">{tx.silent(group.length, t.label)}</summary>
              {names}
            </details>
          );
        })}
      </div>
    </div>
  );
}

/** A small stable string hash, so one seed gives one shuffle. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
