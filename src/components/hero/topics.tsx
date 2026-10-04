"use client";

import Link from "@/i18n/link";
import { useEffect, useMemo, useState } from "react";
import { SearchBox } from "@/components/search-box";
import { DaysLeft } from "@/components/countdown";
import { TopicIllustration } from "@/components/illustration";
import { TopicIcon } from "@/components/topic-icon";
import { TOPICS, TOPIC_KEYS, type TopicKey } from "@/lib/topics";
import { Lead, type HeroFace } from "./face";

/** What one list says on one topic: a few words, linking to the full position. */
export type Stance = { slug: string; name: string; letters: string; face: HeroFace | null; count: number; text: string };
export type StancesByTopic = Record<TopicKey, Stance[]>;

/** The active topic. Turns to the next every few seconds, and holds still once someone picks one or points at the hero. `step` counts every topic shown so far, so it also says which lap of the eight we are on. */
export function useTopic(ms = 5000) {
  const [step, setStep] = useState(0);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (held || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setStep((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [held, ms]);
  return {
    topic: TOPIC_KEYS[step % TOPIC_KEYS.length],
    step,
    pick: (k: TopicKey) => {
      setStep((n) => n - (n % TOPIC_KEYS.length) + TOPIC_KEYS.indexOf(k));
      setHeld(true);
    },
    hover: { onMouseEnter: () => setHeld(true), onMouseLeave: () => setHeld(false) },
  };
}

function seeded(a: number) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fair turns. Every list with a stated position on a topic is in that topic's pool, no matter its size.
 * The pool's order is shuffled once per visit (so nobody is permanently first), and each time the topic
 * comes round again the window moves on, so every list gets the same number of turns. Before the browser
 * has shuffled, the official order is used so the server and the first paint agree.
 */
export function useFair(stances: StancesByTopic) {
  const [seed, setSeed] = useState<number | null>(null);
  useEffect(() => {
    const id = setTimeout(() => setSeed(Math.floor(Math.random() * 2 ** 31)), 0);
    return () => clearTimeout(id);
  }, []);
  const pools = useMemo(() => {
    if (seed == null) return stances;
    return Object.fromEntries(
      TOPIC_KEYS.map((k, ki) => {
        const rand = seeded(seed + ki * 977);
        const a = [...stances[k]];
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(rand() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return [k, a];
      }),
    ) as StancesByTopic;
  }, [stances, seed]);
  return {
    total: (k: TopicKey) => pools[k].length,
    take: (k: TopicKey, n: number, step: number) => {
      const pool = pools[k];
      if (pool.length <= n) return pool;
      const lap = Math.floor(step / TOPIC_KEYS.length);
      return Array.from({ length: n }, (_, j) => pool[(lap * n + j) % pool.length]);
    },
  };
}

/** Says out loud that this is a sample, and that the sample changes. */
export function FairNote({ shown, total, className = "" }: { shown: number; total: number; className?: string }) {
  return (
    <p className={`text-center text-base text-ink-2 ${className}`}>
      {shown} מתוך {total} רשימות עם עמדה בנושא · בכל סבב מופיעות אחרות, בסדר אקראי
    </p>
  );
}

/** Small topic switcher: text only, so it stays out of the way of the sequence. */
function MiniTabs({ topic, pick, className = "" }: { topic: TopicKey; pick: (k: TopicKey) => void; className?: string }) {
  return (
    <div role="tablist" className={`flex flex-wrap justify-center gap-x-1 gap-y-1 ${className}`}>
      {TOPIC_KEYS.map((k) => (
        <button key={k} role="tab" aria-selected={k === topic} onClick={() => pick(k)} className={`rounded-full px-3.5 py-1.5 transition ${k === topic ? "bg-ink text-white" : "text-ink-2 hover:bg-ink/10"}`}>
          {TOPICS[k].label}
        </button>
      ))}
    </div>
  );
}

/** One party's line on the topic. Each arrives a beat after the one before, so the topic lands first and then they speak. */
function Say({ s, i, className = "" }: { s: Stance; i: number; className?: string }) {
  return (
    <Link href={`/lists/${s.slug}#positions`} style={{ animationDelay: `${250 + i * 170}ms` }} className={`card-in group flex items-center gap-3.5 rounded-[1.5rem] bg-paper px-4 py-3 shadow-[0_14px_30px_-24px_rgb(0_12_31/0.25)] ${className}`}>
      <Lead l={{ ...s, faces: s.face ? [s.face] : [] }} sizes="48px" className="size-10 shrink-0 rounded-full bg-tile text-base" />
      <span className="min-w-0 text-lg leading-snug">
        <span className="title underline-offset-4 group-hover:underline">{s.name}</span>
        <span className="text-ink-2"> · {s.text}</span>
      </span>
    </Link>
  );
}

function Top({ counts }: { counts: string }) {
  return (
    <div className="mx-auto max-w-[44rem] text-center">
      <p className="text-ink-2">
        <DaysLeft /> · 27 באוקטובר 2026
      </p>
      <h1 className="serif mt-2 text-[clamp(2.8rem,4.6vw,5rem)] leading-[0.98] text-balance">למי לעזאזל להצביע?</h1>
      <div className="mx-auto mt-5 max-w-[30rem]">
        <SearchBox size="lg" />
      </div>
      <p className="mt-3 text-base text-ink-2">{counts}</p>
    </div>
  );
}

const CANVAS = "mx-auto max-w-[104rem] rounded-[2.75rem] bg-mist px-6 py-10 sm:px-12 lg:px-16 lg:py-12";

/**
 * R. Sequence: the words and search, small, then one topic arrives with its painted object,
 * and then the parties say their piece one after another. Then the next topic.
 */
export function HeroSequence({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  const { topic, step, pick, hover } = useTopic();
  const fair = useFair(stances);
  const say = fair.take(topic, 4, step);
  return (
    <section className="px-3 pb-10 sm:px-6">
      <div className={CANVAS} {...hover}>
        <Top counts={counts} />
        <div key={topic} className="mx-auto mt-8 grid max-w-[64rem] items-center gap-6 sm:grid-cols-[13rem_1fr] sm:gap-10">
          <div className="card-in text-center">
            <TopicIllustration topic={topic} className="!w-32 sm:!w-40" />
            <p className="serif -mt-1 text-5xl leading-none">{TOPICS[topic].label}</p>
          </div>
          <div className="grid gap-2.5">{say.map((s, i) => <Say key={s.slug} s={s} i={i} />)}</div>
        </div>
        <MiniTabs topic={topic} pick={pick} className="mt-6" />
      </div>
    </section>
  );
}

/**
 * S. Strip: everything on one centred line of sight. The topic's painted object and name sit in the
 * middle above the parties, who speak in two compact columns; no extra chrome.
 */
export function HeroStrip({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  const { topic, step, pick, hover } = useTopic();
  const fair = useFair(stances);
  const say = fair.take(topic, 6, step);
  return (
    <section className="px-3 pb-10 sm:px-6">
      <div className={CANVAS} {...hover}>
        <Top counts={counts} />
        <div key={topic} className="mx-auto mt-8 max-w-[60rem]">
          <div className="card-in flex items-center justify-center gap-4">
            <TopicIllustration topic={topic} className="!mx-0 !w-24" />
            <div>
              <p className="text-ink-2">מה הרשימות אומרות על</p>
              <p className="serif text-6xl leading-none">{TOPICS[topic].label}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-2.5 md:grid-cols-2">{say.map((s, i) => <Say key={s.slug} s={s} i={i} />)}</div>
        </div>
        <MiniTabs topic={topic} pick={pick} className="mt-6" />
      </div>
    </section>
  );
}

/**
 * T. Stage: the topic's painted object is the middle of the picture, its name beneath it,
 * and the parties speak on either side, alternating, one after another.
 */
export function HeroStage({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  const { topic, step, pick, hover } = useTopic();
  const fair = useFair(stances);
  const say = fair.take(topic, 4, step);
  return (
    <section className="px-3 pb-10 sm:px-6">
      <div className={CANVAS} {...hover}>
        <Top counts={counts} />
        <div key={topic} className="mx-auto mt-8 grid max-w-[78rem] items-center gap-4 lg:grid-cols-[1fr_15rem_1fr] lg:gap-8">
          <div className="grid gap-2.5">{say.filter((_, i) => i % 2 === 0).map((s) => <Say key={s.slug} s={s} i={say.indexOf(s)} />)}</div>
          <div className="card-in order-first text-center lg:order-none">
            <TopicIllustration topic={topic} className="!w-32 sm:!w-40" />
            <p className="serif -mt-1 text-5xl leading-none">{TOPICS[topic].label}</p>
          </div>
          <div className="grid gap-2.5">{say.filter((_, i) => i % 2 === 1).map((s) => <Say key={s.slug} s={s} i={say.indexOf(s)} />)}</div>
        </div>
        <MiniTabs topic={topic} pick={pick} className="mt-6" />
      </div>
    </section>
  );
}

function Words({ counts }: { counts: string }) {
  return (
    <div className="mx-auto max-w-[60rem] text-center">
      <p className="text-lg text-ink-2">
        <DaysLeft /> · 27 באוקטובר 2026
      </p>
      <h1 className="serif mt-5 text-[clamp(3.6rem,6.8vw,7.5rem)] leading-[0.95] text-balance">למי לעזאזל להצביע?</h1>
      <p className="mt-6 text-2xl leading-snug text-ink-2">בחרו נושא, וראו מה כל רשימה אומרת עליו.</p>
      <div className="mx-auto mt-8 max-w-[36rem]">
        <SearchBox size="lg" />
      </div>
      <p className="mt-5 text-ink-2">{counts}</p>
    </div>
  );
}

function TopicTabs({ topic, pick, className = "" }: { topic: TopicKey; pick: (k: TopicKey) => void; className?: string }) {
  return (
    <div role="tablist" className={`flex flex-wrap justify-center gap-2 ${className}`}>
      {TOPIC_KEYS.map((k) => (
        <button
          key={k}
          role="tab"
          aria-selected={k === topic}
          onClick={() => pick(k)}
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-lg transition ${k === topic ? "bg-ink text-white" : "bg-paper text-ink hover:bg-ink/10"}`}
        >
          <TopicIcon topic={k} className="size-5" />
          {TOPICS[k].label}
        </button>
      ))}
    </div>
  );
}

function Foot() {
  return (
    <p className="mt-8 text-center text-base text-ink-2">
      לכל העמדות של כל הרשימות ·{" "}
      <Link href="/positions" className="font-medium text-ink underline underline-offset-4">
        עמוד העמדות
      </Link>
    </p>
  );
}

/**
 * O. Topics: the words centred, a row of topics under them, and under that the topic's
 * answer from five parties side by side. The topic turns on its own; picking one holds it.
 */
export function HeroTopics({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  const { topic, step, pick, hover } = useTopic();
  const fair = useFair(stances);
  const row = fair.take(topic, 5, step);
  return (
    <section className="px-3 pb-10 sm:px-6">
      <div className="mx-auto max-w-[104rem] rounded-[2.75rem] bg-mist px-6 py-14 sm:px-12 lg:px-16 lg:py-20" {...hover}>
        <Words counts={counts} />
        <TopicTabs topic={topic} pick={pick} className="mt-12" />
        <div key={topic} className="mx-auto mt-8 grid max-w-[88rem] gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {row.map((s) => (
            <Link key={s.slug} href={`/lists/${s.slug}#positions`} className="card-in group flex flex-col rounded-[2rem] bg-paper p-6 shadow-[0_14px_30px_-24px_rgb(0_12_31/0.25)]">
              <span className="flex items-center gap-3">
                <Lead l={{ ...s, faces: s.face ? [s.face] : [] }} sizes="64px" className="size-12 rounded-full bg-tile text-base" />
                <span className="title text-xl underline-offset-4 group-hover:underline">{s.name}</span>
              </span>
              <span className="mt-4 text-xl leading-snug text-pretty">{s.text}</span>
            </Link>
          ))}
        </div>
        <Foot />
      </div>
    </section>
  );
}

/**
 * P. Sentence: one sentence in the middle, "what do the parties say about ___", with the topic
 * set as the huge word. Under it the parties as index rows, the way the rest of the site reads.
 */
export function HeroSentence({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  const { topic, step, pick, hover } = useTopic(5500);
  const fair = useFair(stances);
  const rows = fair.take(topic, 6, step);
  return (
    <section className="px-5 pt-6 pb-14 sm:px-10" {...hover}>
      <div className="mx-auto max-w-[60rem] text-center">
        <p className="text-lg text-ink-2">
          <DaysLeft /> · 27 באוקטובר 2026
        </p>
        <h1 className="mt-5 text-[clamp(1.6rem,2.4vw,2.4rem)] leading-tight text-ink-2">מה הרשימות אומרות על</h1>
        <p key={topic} className="serif card-in mt-1 text-[clamp(5rem,11vw,12rem)] leading-[0.95]">
          {TOPICS[topic].label}
        </p>
        <TopicTabs topic={topic} pick={pick} className="mt-8" />
      </div>
      <div key={topic} className="mx-auto mt-12 max-w-[64rem] border-t border-line">
        {rows.map((s) => (
          <Link key={s.slug} href={`/lists/${s.slug}#positions`} className="card-in group flex items-center gap-6 border-b border-line py-5">
            <Lead l={{ ...s, faces: s.face ? [s.face] : [] }} sizes="64px" className="size-14 shrink-0 rounded-full bg-tile text-base" />
            <span className="title w-44 shrink-0 truncate text-xl underline-offset-4 group-hover:underline">{s.name}</span>
            <span className="min-w-0 flex-1 text-xl leading-snug text-ink-2 text-pretty">{s.text}</span>
          </Link>
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-[36rem]">
        <SearchBox size="lg" />
      </div>
      <p className="mt-5 text-center text-ink-2">{counts}</p>
    </section>
  );
}

/**
 * Q. Centre: the topic is the middle of the picture, a big white disc with its icon and name,
 * and the parties stand on either side of it with what they say. Picking a topic swaps the sides.
 */
export function HeroCentre({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  const { topic, step, pick, hover } = useTopic(5000);
  const fair = useFair(stances);
  const side = fair.take(topic, 6, step);
  const cards = (items: Stance[]) =>
    items.map((s) => (
      <Link key={s.slug} href={`/lists/${s.slug}#positions`} className="card-in group flex items-start gap-4 rounded-[2rem] bg-paper p-5 shadow-[0_14px_30px_-24px_rgb(0_12_31/0.25)]">
        <Lead l={{ ...s, faces: s.face ? [s.face] : [] }} sizes="64px" className="size-12 shrink-0 rounded-full bg-tile text-base" />
        <span className="min-w-0">
          <span className="title block text-lg underline-offset-4 group-hover:underline">{s.name}</span>
          <span className="mt-1 block text-lg leading-snug text-ink-2 text-pretty">{s.text}</span>
        </span>
      </Link>
    ));
  return (
    <section className="px-3 pb-10 sm:px-6">
      <div className="mx-auto max-w-[104rem] rounded-[2.75rem] bg-mist px-6 py-14 sm:px-12 lg:px-16 lg:py-16" {...hover}>
        <div className="mx-auto max-w-[52rem] text-center">
          <p className="text-lg text-ink-2">
            <DaysLeft /> · 27 באוקטובר 2026
          </p>
          <h1 className="serif mt-4 text-[clamp(3.2rem,5.6vw,6.2rem)] leading-[0.95] text-balance">למי לעזאזל להצביע?</h1>
        </div>
        <div className="mt-12 grid items-center gap-6 lg:grid-cols-[1fr_20rem_1fr]">
          <div key={`a-${topic}`} className="grid gap-4">{cards(side.filter((_, i) => i % 2 === 0))}</div>
          <div className="order-first mx-auto grid size-[17rem] place-items-center rounded-full bg-paper text-center shadow-[0_50px_90px_-60px_rgb(0_12_31/0.4)] lg:order-none lg:size-[20rem]">
            <div key={topic} className="card-in">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-tile text-ink/75">
                <TopicIcon topic={topic} className="size-7" />
              </span>
              <p className="serif mt-3 text-[4.5rem] leading-none">{TOPICS[topic].label}</p>
              <p className="mt-3 text-ink-2">מה כל רשימה אומרת</p>
            </div>
          </div>
          <div key={`b-${topic}`} className="grid gap-4">{cards(side.filter((_, i) => i % 2 === 1))}</div>
        </div>
        <TopicTabs topic={topic} pick={pick} className="mt-10" />
        <div className="mx-auto mt-10 max-w-[36rem]">
          <SearchBox size="lg" />
        </div>
        <p className="mt-5 text-center text-ink-2">{counts}</p>
      </div>
    </section>
  );
}
