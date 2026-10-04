"use client";

import Image from "next/image";
import Link, { useMessages } from "@/i18n/link";
import { defineMessages } from "@/i18n/messages";
import { positionLabels } from "@/i18n/messages/positions";
import { arCount, ruPlural } from "@/i18n/messages/plural";
import { useDict } from "@/i18n/provider";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/avatar";
import type { ChatTopic } from "@/components/topic-chat";
import { Arrow } from "@/components/arrow";

const m = defineMessages(
  {
    sub: "מה המפלגות אומרות, במילים שלהן",
    allOn: (topic: string) => `כל העמדות בנושא ${topic}`,
    count: (n: number) => `${n} מפלגות`,
    rest: (n: number, topic: string) => ` כתבו על ${topic}. כאן רק חלק מהן, ובכל סיבוב אחרות · לכולן `,
  },
  {
    en: {
      sub: "What the parties say, in their own words",
      allOn: (topic: string) => `All positions on ${topic}`,
      count: (n: number) => `${n} ${n === 1 ? "party" : "parties"}`,
      rest: (n: number, topic: string) => ` wrote on ${topic}. Only some are shown here, and others come up each round · See all `,
    },
    ar: {
      sub: "ماذا تقول الأحزاب، بكلماتها",
      allOn: (topic: string) => `جميع المواقف في قضية ${topic}`,
      count: (n: number) => arCount(n, ["حزب واحد", "حزبان", "أحزاب", "حزبًا"]),
      rest: (n: number, topic: string) => ` ${n === 1 ? "تناول" : n === 2 ? "تناولا" : "تناولت"} «${topic}». نعرض هنا بعضها فقط، وفي كل دورة تظهر أحزاب أخرى · للجميع `,
    },
    ru: {
      sub: "Что говорят партии, их собственными словами",
      allOn: (topic: string) => `Все позиции по теме «${topic}»`,
      count: (n: number) => `${n} ${ruPlural(n, "партия", "партии", "партий")}`,
      rest: (n: number, topic: string) => ` ${ruPlural(n, "написала", "написали", "написали")} по теме «${topic}». Здесь показана только часть, в каждом круге — другие · Ко всем `,
    },
    am: {
      sub: "ፓርቲዎች በራሳቸው ቃል ምን ይላሉ",
      allOn: (topic: string) => `በ${topic} ላይ ያሉ ሁሉም አቋሞች`,
      count: (n: number) => `${n} ፓርቲዎች`,
      rest: (n: number, topic: string) => ` በ${topic} ላይ ጽፈዋል። እዚህ የተወሰኑት ብቻ ይታያሉ፤ በእያንዳንዱ ዙር ሌሎች ይመጣሉ · ለሁሉም `,
    },
  },
);

// Up to eight are drawn; the card shows as many as fit whole (the rest wrap out of sight), so a short screen gets three and a tall one more. A phone, where the card has no fixed height, shows four.
const SHOWN = 8;

/**
 * The positions card. A proper card title, then all eight categories as a row, each with its painted object, the one in view framed, and under it how a
 * few parties respond to it, in their own words (a verbatim quote, on a side rule) (as many as fit whole), arriving like rows on a departures board (each flips down
 * into place a beat after the one before) and then standing still so they can be read. After a while the whole card turns to the next category.
 * Each time a category comes round again it shows the next parties, so every party gets its turn. The row picks a category;
 * it holds while the pointer is over it, and with reduced motion it only moves when asked.
 */
export function TopicStage({ topics, every = 9000, className = "" }: { topics: ChatTopic[]; every?: number; className?: string }) {
  const tx = useMessages(m);
  const labels = useMessages(positionLabels);
  const dict = useDict();
  const L = topics.length;
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (held || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((k) => k + 1), every);
    return () => clearInterval(id);
  }, [held, every]);

  const on = i % L;
  // On a phone the categories are a row that scrolls sideways: keep the one in view in the middle of it.
  const tabs = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = tabs.current;
    const tab = row?.children[on] as HTMLElement | undefined;
    if (row && tab && row.scrollWidth > row.clientWidth) row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
  }, [on]);
  const t = topics[on];
  const lap = Math.floor(i / L);
  // Each category starts from a different party, and moves on every lap.
  const rows = Array.from({ length: Math.min(SHOWN, t.rows.length) }, (_, k) => t.rows[(on * 2 + lap * SHOWN + k) % t.rows.length]);

  return (
    <section onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} className={`flex min-h-[30rem] flex-col overflow-hidden rounded-[2rem] bg-mist p-6 lg:min-h-0 ${className}`}>
      <div className="flex shrink-0 items-start justify-between gap-3">
        <div>
          <h2 className="title text-2xl leading-tight">{dict.nav.topics}</h2>
          <p className="mt-0.5 text-base text-ink-2">{tx.sub}</p>
        </div>
        <Link href={`/topics#${t.key}`} aria-label={tx.allOn(t.label)} className="grid size-10 shrink-0 place-items-center rounded-full bg-paper hover:bg-ink hover:text-white">
          <Arrow>↖</Arrow>
        </Link>
      </div>

      {/* The categories, all eight in a row, each with its painted object: the one in view is framed, and the card walks along the row by itself */}
      <div ref={tabs} role="tablist" aria-label={dict.nav.topics} className="scrollbar-none relative -mx-6 mt-4 flex shrink-0 gap-1.5 overflow-x-auto px-6 py-1 lg:mx-0 lg:grid lg:grid-cols-8 lg:overflow-visible lg:p-0">
        {topics.map((x, n) => (
          <button key={x.key} type="button" role="tab" aria-selected={n === on} onClick={() => setI(lap * L + n)} className={`flex shrink-0 flex-col items-center gap-0.5 rounded-2xl px-3 pt-1.5 pb-2 text-base whitespace-nowrap transition lg:shrink lg:px-1 lg:whitespace-normal ${n === on ? "title bg-paper ring-2 ring-ink" : "text-ink-2 hover:bg-paper/70 hover:text-ink"}`}>
            <span className="relative size-10">
              <Image src={x.art} alt="" fill sizes="40px" loading="eager" className="object-contain mix-blend-multiply" />
            </span>
            {x.label}
          </button>
        ))}
      </div>

      <ul key={i} style={{ perspective: "1100px" }} className="mt-4 flex min-h-0 flex-1 flex-col flex-wrap content-start gap-x-8 gap-y-3 overflow-hidden">
        {rows.map((r, k) => (
          <li key={r.id} style={{ "--d": `${180 + k * 130}ms` } as React.CSSProperties} className="board-in w-full max-lg:nth-[n+5]:hidden">
            <Link href={`/topics#${t.key}:${r.id}`} className="block rounded-[1.5rem] bg-paper p-4">
              <span className="flex items-center gap-3">
                <Avatar name={r.face.name} src={r.face.src} color={r.face.color} size={40} />
                <span className="title text-lg leading-tight">{r.name}</span>
              </span>
              {r.quoted ? (
                // Set as a quote: a large opening mark, closed with the matching mark.
                <span className="mt-1 flex gap-2">
                  <span aria-hidden className="serif -mt-2 shrink-0 text-[4.5rem] leading-[0.8] font-bold text-accent">
                    {/\p{Script=Hebrew}/u.test(r.text) ? "”" : "“"}
                  </span>
                  <q className="line-clamp-5 pt-1.5 text-lg leading-snug text-pretty before:content-none after:content-none">
                    {r.text}
                    {/\p{Script=Hebrew}/u.test(r.text) ? "“" : "”"}
                  </q>
                </span>
              ) : (
                <span className="mt-2 block text-lg leading-snug text-pretty"><span className="block text-sm font-semibold text-muted">{labels.summary}</span><span className="line-clamp-5">{r.text}</span></span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {/* Says out loud that this is a sample: how many parties wrote on the category, and the way to all of them */}
      <Link href={`/topics#${t.key}`} className="mt-3 block shrink-0 text-base text-ink-2 underline-offset-4 hover:text-ink hover:underline">
        <span className="title text-ink">{tx.count(t.rows.length)}</span>
        {tx.rest(t.rows.length, t.label)}
        <Arrow />
      </Link>
    </section>
  );
}
