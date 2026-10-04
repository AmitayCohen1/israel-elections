"use client";

import Link, { useMessages } from "@/i18n/link";
import { defineMessages } from "@/i18n/messages";
import { useDict } from "@/i18n/provider";
import { Arrow } from "@/components/arrow";
import { useEffect, useState } from "react";
import { TopicIcon } from "@/components/topic-icon";
import type { TopicKey } from "@/lib/topics";

export type ColumnTopic = {
  key: TopicKey;
  label: string;
  /** The painted object for the topic. */
  art: React.ReactNode;
  rows: { id: string; name: string; gist: string | null; mark: React.ReactNode }[];
};

const m = defineMessages(
  { all: (n: number, topic: string) => `כל ${n} המפלגות שכתבו על ${topic}` },
  {
    en: { all: (n: number, topic: string) => `All ${n} parties that wrote on ${topic}` },
    ar: { all: (n: number, topic: string) => `جميع الأحزاب (${n}) التي كتبت في قضية «${topic}»` },
    ru: { all: (n: number, topic: string) => `Все партии, писавшие по теме «${topic}» (${n})` },
    am: { all: (n: number, topic: string) => `በ${topic} ላይ የጻፉት ሁሉም ${n} ፓርቲዎች` },
  },
);

/**
 * One column that keeps changing: it moves through the topics on its own, and gives a taste of the one in view (three lists' words).
 * Pick a topic from the row of icons to stay on it. It also holds still while the pointer is over it, and for reduced motion.
 */
export function TopicColumn({ topics, every = 9000, className = "" }: { topics: ColumnTopic[]; every?: number; className?: string }) {
  const tx = useMessages(m);
  const dict = useDict();
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const [picked, setPicked] = useState(false);

  useEffect(() => {
    if (held || picked || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => n + 1), every);
    return () => clearInterval(id);
  }, [held, picked, topics.length, every]);

  const L = topics.length;
  const t = topics[i % L];
  // A taste: three lists at a time, and a different three each time round.
  const start = (i * 3) % Math.max(t.rows.length, 1);
  const shown = Array.from({ length: Math.min(3, t.rows.length) }, (_, k) => t.rows[(start + k) % t.rows.length]);
  return (
    <section onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} className={`flex min-h-0 flex-col overflow-hidden rounded-[1.5rem] bg-mist p-4 ${className}`}>
      <div role="tablist" aria-label={dict.nav.topics} className="flex shrink-0 flex-wrap gap-1.5">
        {topics.map((x, n) => (
          <button
            key={x.key}
            type="button"
            role="tab"
            aria-selected={n === i % L}
            aria-label={x.label}
            title={x.label}
            onClick={() => {
              setI(Math.floor(i / L) * L + n);
              setPicked(true);
            }}
            className={`grid size-9 place-items-center rounded-full transition ${n === i % L ? "bg-ink text-white" : "bg-paper text-ink-2 hover:text-ink"}`}
          >
            <TopicIcon topic={x.key} className="size-[1.15rem]" />
          </button>
        ))}
      </div>

      <div key={i} className="card-in mt-5 flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-3">
          <span className="w-16 shrink-0">{t.art}</span>
          <h2 className="serif text-5xl leading-none">{t.label}</h2>
        </div>

        <ul className="mt-5 grid flex-1 content-start gap-1">
          {shown.map((r) => (
            <li key={r.id}>
              <Link href={`/topics#${t.key}:${r.id}`} className="flex items-start gap-3 rounded-2xl px-2 py-2.5 transition hover:bg-paper">
                <span className="mt-0.5 grid size-11 shrink-0 place-items-center">{r.mark}</span>
                <span className="min-w-0">
                  <span className="title block text-lg leading-tight">{r.name}</span>
                  {r.gist && <span className="mt-1 line-clamp-2 block text-base leading-snug text-ink-2">{r.gist}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Link href={`/topics#${t.key}`} className="mt-auto shrink-0 pt-3 text-base text-ink-2 underline-offset-4 hover:text-ink hover:underline">
          {tx.all(t.rows.length, t.label)} <Arrow />
        </Link>
      </div>
    </section>
  );
}
