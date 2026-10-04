"use client";

import Link from "@/i18n/link";
import { useEffect, useState } from "react";
import { TopicIllustration } from "@/components/illustration";
import { TOPICS, TOPIC_KEYS } from "@/lib/topics";
import { Lead, Slip } from "./face";
import { Words } from "./side";
import { useThrow } from "./toss";
import { FairNote, useFair, type Stance, type StancesByTopic } from "./topics";

const SECTION = "px-5 pb-12 sm:px-10";
const GRID = "mx-auto grid max-w-[104rem] items-center gap-12 lg:grid-cols-2 lg:gap-16";
const who = (s: Stance) => ({ ...s, faces: s.face ? [s.face] : [] });
const vars = (o: Record<string, string | number>) => o as React.CSSProperties;

/**
 * AB. Board: a departures board. A navy header row with the topic, then a row per list, each flipping
 * down into place one after another; when the time is up the rows flip away and the next topic flips in.
 */
export function HeroBoard({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  const { topic, step, leaving } = useThrow(4200);
  const fair = useFair(stances);
  const say = fair.take(topic, 5, step);
  return (
    <section className={SECTION}>
      <div className={GRID}>
        <Words counts={counts} />
        <div className="mx-auto w-full max-w-[34rem]">
          <div key={topic} style={{ perspective: "1100px" }} className={`overflow-hidden rounded-[1.75rem] bg-paper shadow-[0_30px_60px_-40px_rgb(0_12_31/0.35)] ring-1 ring-line ${leaving ? "leaving" : ""}`}>
            <div style={vars({ "--d": "0ms", "--i": 0 })} className="flip flex items-center gap-4 bg-ink py-3 ps-3 pe-6 text-white">
              <span className="grid size-[4.5rem] shrink-0 place-items-center rounded-2xl bg-paper">
                <TopicIllustration topic={topic} className="!w-16" />
              </span>
              <span className="serif flex-1 text-5xl leading-none">{TOPICS[topic].label}</span>
              <span className="text-sm text-white/60">מה הרשימות אומרות</span>
            </div>
            {say.map((s, i) => (
              <Link key={s.slug} href={`/lists/${s.slug}#positions`} style={vars({ "--d": `${120 + i * 110}ms`, "--i": i + 1 })} className="flip group flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-b-0">
                <Lead l={who(s)} sizes="48px" className="size-11 shrink-0 rounded-full bg-tile text-xs" />
                <span className="title w-32 shrink-0 leading-tight underline-offset-4 group-hover:underline">{s.name}</span>
                <span className="min-w-0 flex-1 text-[1.05rem] leading-snug text-ink-2 text-pretty">{s.text}</span>
              </Link>
            ))}
          </div>
          <FairNote shown={say.length} total={fair.total(topic)} className="mt-3" />
        </div>
      </div>
    </section>
  );
}

const SWING = ["-2deg", "1.5deg", "-1deg", "2deg", "-1.5deg", "1deg"];

/**
 * AC. Line: a washing line with cards pegged to it. Each card swings in from above and settles,
 * the topic first, then the lists; when the time is up they swing back up and the next topic is pegged on.
 */
export function HeroLine({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  const { topic, step, leaving } = useThrow(4800);
  const fair = useFair(stances);
  const say = fair.take(topic, 5, step);
  const peg = <span aria-hidden className="absolute -top-3 start-1/2 z-10 h-6 w-2.5 -translate-x-1/2 rounded-sm bg-ink/75" />;
  const card = "relative rounded-[1.25rem] bg-paper p-4 shadow-[0_18px_30px_-20px_rgb(0_12_31/0.4)] ring-1 ring-line";
  return (
    <section className={SECTION}>
      <div className={GRID}>
        <Words counts={counts} />
        <div className="mx-auto w-full max-w-[36rem]">
          <div key={topic} className={`relative overflow-hidden pt-4 pb-3 ${leaving ? "leaving" : ""}`}>
            {[0, 1].map((row) => (
              <div key={row} className="relative mb-9 grid grid-cols-3 items-start gap-3 pt-3 last:mb-0">
                <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 rounded-full bg-ink/25" />
                {(row === 0 ? [null, ...say.slice(0, 2)] : say.slice(2, 5)).map((s, k) => {
                  const i = row * 3 + k;
                  const style = vars({ "--r": SWING[i], "--d": `${i * 160}ms`, "--i": i });
                  return s ? (
                    <Link key={s.slug} href={`/lists/${s.slug}#positions`} style={style} className={`swing group ${card}`}>
                      {peg}
                      <Lead l={who(s)} sizes="40px" className="size-9 rounded-full bg-tile text-[0.65rem]" />
                      <span className="title mt-2 block leading-tight underline-offset-4 group-hover:underline">{s.name}</span>
                      <span className="mt-1 block text-[0.95rem] leading-snug text-ink-2 text-pretty">{s.text}</span>
                    </Link>
                  ) : (
                    <div key="topic" style={style} className={`swing flex flex-col items-center !pb-5 text-center ${card}`}>
                      {peg}
                      <TopicIllustration topic={topic} className="!w-24" />
                      <p className="serif -mt-1 text-4xl leading-none">{TOPICS[topic].label}</p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <FairNote shown={say.length} total={fair.total(topic)} className="mt-2" />
        </div>
      </div>
    </section>
  );
}

/**
 * AD. Flip: cards lie face down showing only their ballot letters, then turn over one by one to show
 * what each list says. They turn back, and the next topic's cards turn over.
 */
export function HeroFlip({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  const { topic, step, leaving } = useThrow(4600);
  const fair = useFair(stances);
  const say = fair.take(topic, 6, step);
  const face = "absolute inset-0 overflow-hidden rounded-[1.25rem] bg-paper ring-1 ring-line [backface-visibility:hidden]";
  return (
    <section className={SECTION}>
      <div className={GRID}>
        <Words counts={counts} />
        <div className="mx-auto w-full max-w-[36rem]">
          <div key={topic} style={{ perspective: "1400px" }} className={`grid grid-cols-2 gap-3 ${leaving ? "leaving" : ""}`}>
            <div style={vars({ "--d": "0ms", "--i": 0 })} className="flipcard col-span-2 h-[8.5rem]">
              <div className={`${face} flex items-center justify-center gap-5 !bg-ink text-white`}>
                <span className="grid size-[6rem] place-items-center rounded-2xl bg-paper">
                  <TopicIllustration topic={topic} className="!w-[5.2rem]" />
                </span>
                <span>
                  <span className="block text-ink-2 text-white/60">מה הרשימות אומרות על</span>
                  <span className="serif block text-6xl leading-none">{TOPICS[topic].label}</span>
                </span>
              </div>
              <div className={`${face} [transform:rotateY(180deg)]`} />
            </div>
            {say.map((s, i) => (
              <Link key={s.slug} href={`/lists/${s.slug}#positions`} style={vars({ "--d": `${250 + i * 140}ms`, "--i": i + 1 })} className="flipcard group relative block h-[9.25rem]">
                <span className={`${face} flex items-start gap-3 p-4`}>
                  <Lead l={who(s)} sizes="48px" className="size-10 shrink-0 rounded-full bg-tile text-xs" />
                  <span className="min-w-0 leading-snug">
                    <span className="title block underline-offset-4 group-hover:underline">{s.name}</span>
                    <span className="mt-0.5 block text-[0.98rem] text-ink-2 text-pretty">{s.text}</span>
                  </span>
                </span>
                <span className={`${face} grid place-items-center [transform:rotateY(180deg)]`}>
                  <Slip letters={s.letters} className="h-16 w-14 text-3xl" />
                </span>
              </Link>
            ))}
          </div>
          <FairNote shown={say.length} total={fair.total(topic)} className="mt-3" />
        </div>
      </div>
    </section>
  );
}

/** Reveals its text a letter at a time; remount it (key) to start over. */
function Typed({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((c) => c + 1), 18);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      {text.slice(0, n)}
      <span aria-hidden className="opacity-30">
        ▍
      </span>
    </>
  );
}

/**
 * AE. Roller: nothing but type. The topic's word rolls up into place beside its painted object, and
 * the lists speak under it one at a time, their line typed out as they go; then the word rolls to the next.
 */
export function HeroRoller({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  const fair = useFair(stances);
  const PER = 4;
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((n) => n + 1), 1900);
    return () => clearInterval(id);
  }, []);
  const step = Math.floor(t / PER);
  const topic = TOPIC_KEYS[step % TOPIC_KEYS.length];
  const speakers = fair.take(topic, PER, step);
  const s = speakers[t % PER];
  return (
    <section className={SECTION}>
      <div className={GRID}>
        <Words counts={counts} />
        <div className="mx-auto w-full max-w-[34rem]">
          <div className="flex items-center gap-5">
            <div key={`i${topic}`} className="roll-in shrink-0">
              <TopicIllustration topic={topic} className="!mx-0 !w-36" />
            </div>
            <div className="overflow-hidden py-1">
              <span key={topic} className="roll-in serif block text-[clamp(4.5rem,7vw,6.5rem)] leading-[1.05]">
                {TOPICS[topic].label}
              </span>
            </div>
          </div>
          <div className="mt-4 border-t border-line pt-6">
            {s && (
              <Link key={t} href={`/lists/${s.slug}#positions`} className="group block min-h-[11.5rem]">
                <span className="flex items-center gap-4">
                  <Lead l={who(s)} sizes="80px" className="size-16 shrink-0 rounded-full bg-tile text-lg" />
                  <span className="title text-3xl underline-offset-4 group-hover:underline">{s.name}</span>
                </span>
                <span className="mt-4 block text-[1.7rem] leading-snug text-pretty">
                  <Typed text={s.text} />
                </span>
              </Link>
            )}
            <div aria-hidden className="mt-2 flex gap-2">
              {speakers.map((p, k) => (
                <Lead key={p.slug} l={who(p)} sizes="40px" className={`size-9 rounded-full bg-tile text-[0.6rem] transition-opacity duration-300 ${k === t % PER ? "opacity-100 ring-2 ring-ink" : "opacity-35"}`} />
              ))}
            </div>
          </div>
          <FairNote shown={speakers.length} total={fair.total(topic)} className="mt-4" />
        </div>
      </div>
    </section>
  );
}
