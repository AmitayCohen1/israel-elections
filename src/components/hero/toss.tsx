"use client";

import Link from "@/i18n/link";
import { useEffect, useRef, useState } from "react";
import { TopicIllustration } from "@/components/illustration";
import { TOPICS, TOPIC_KEYS, type TopicKey } from "@/lib/topics";
import { Lead } from "./face";
import { Words } from "./side";
import { FairNote, useFair, type Stance, type StancesByTopic } from "./topics";

const SECTION = "px-5 pb-12 sm:px-10";
const GRID = "mx-auto grid max-w-[104rem] items-center gap-12 lg:grid-cols-2 lg:gap-16";

/** The topic on show, and whether its cards are being thrown away. Each topic stays a while, is tossed out, and the next one arrives. */
export function useThrow(hold = 4600) {
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), hold);
    const t2 = setTimeout(() => {
      setLeaving(false);
      setStep((n) => n + 1);
    }, hold + 650);
    return () => (clearTimeout(t1), clearTimeout(t2));
  }, [step, hold]);
  return { topic: TOPIC_KEYS[step % TOPIC_KEYS.length], step, leaving };
}

const TILT = ["-2.2deg", "1.6deg", "-1.1deg", "2.4deg", "-1.8deg", "1.2deg"];
const SIDE = ["-9rem", "8rem", "-5rem", "10rem", "-7rem", "6rem"];

/** The topic as a card: our painted object on white, and its name. */
function CategoryCard({ topic, className = "" }: { topic: TopicKey; className?: string }) {
  return (
    <div style={{ ["--r" as string]: "-2deg", ["--fx" as string]: "0rem", ["--ox" as string]: "-4rem", ["--i" as string]: 0 }} className={`toss mx-auto flex w-full max-w-[22rem] flex-col items-center rounded-[2.25rem] bg-paper px-8 pt-5 pb-7 shadow-[0_30px_60px_-34px_rgb(0_12_31/0.35)] ring-1 ring-line ${className}`}>
      <TopicIllustration topic={topic} className="!w-40" />
      <p className="serif -mt-1 text-6xl leading-none">{TOPICS[topic].label}</p>
    </div>
  );
}

function who(s: Stance) {
  return { ...s, faces: s.face ? [s.face] : [] };
}

/**
 * X. Toss: the topic is thrown up from below, overshoots and lands tilted; then each party's
 * card is thrown in after it and lands on the pile. After a while all of it is tossed away upward.
 */
export function HeroToss({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  const { topic, step, leaving } = useThrow();
  const fair = useFair(stances);
  const say = fair.take(topic, 4, step);
  return (
    <section className={SECTION}>
      <div className={GRID}>
        <Words counts={counts} />
        <div key={topic} className={`mx-auto flex min-h-[36rem] w-full max-w-[30rem] flex-col justify-center gap-3 overflow-hidden py-6 ${leaving ? "leaving" : ""}`}>
          <CategoryCard topic={topic} />
          {say.map((s, i) => (
            <Link
              key={s.slug}
              href={`/lists/${s.slug}#positions`}
              style={{ ["--r" as string]: TILT[i], ["--fx" as string]: SIDE[i], ["--ox" as string]: SIDE[(i + 2) % 6], ["--d" as string]: `${300 + i * 240}ms`, ["--i" as string]: i + 1 }}
              className="toss group flex items-start gap-3.5 rounded-[1.5rem] bg-paper p-4 shadow-[0_16px_34px_-24px_rgb(0_12_31/0.3)] ring-1 ring-line"
            >
              <Lead l={who(s)} sizes="48px" className="mt-0.5 size-10 shrink-0 rounded-full bg-tile text-xs" />
              <span className="min-w-0 text-lg leading-snug">
                <span className="title underline-offset-4 group-hover:underline">{s.name}</span>
                <span className="block text-ink-2 text-pretty">{s.text}</span>
              </span>
            </Link>
          ))}
          <FairNote shown={say.length} total={fair.total(topic)} className="mt-1" />
        </div>
      </div>
    </section>
  );
}

/** A reply in the thread: avatar, the list's name, what it says. */
function Reply({ s, delay, i = 0, className = "" }: { s: Stance; delay: string; i?: number; className?: string }) {
  return (
    <Link href={`/lists/${s.slug}#positions`} style={{ animationDelay: delay, ["--i" as string]: i }} className={`bubble group flex items-end gap-2.5 ${className}`}>
      <Lead l={who(s)} sizes="40px" className="size-9 shrink-0 rounded-full bg-tile text-[0.65rem]" />
      <span className="max-w-[24rem] rounded-[1.4rem] rounded-es-md bg-paper px-4 py-2.5 text-lg leading-snug ring-1 ring-line">
        <span className="title block text-base underline-offset-4 group-hover:underline">{s.name}</span>
        <span className="text-pretty">{s.text}</span>
      </span>
    </Link>
  );
}

/**
 * Y. Chat: a group conversation. Our side asks about a topic (its painted object on a white tile);
 * the lists answer one by one, each after a moment of typing. Older messages slide up and away.
 */
export function HeroChat({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  // The whole conversation as one list of messages, repeated without end.
  const fair = useFair(stances);
  const build = (lap: number) => TOPIC_KEYS.flatMap((k) => [{ kind: "ask" as const, topic: k }, ...fair.take(k, 4, lap * TOPIC_KEYS.length).map((s) => ({ kind: "reply" as const, topic: k, s }))]);
  const len = build(0).length;
  const at = (c: number) => build(Math.floor(c / len))[c % len];
  const [n, setN] = useState(0); // how many messages have been sent
  const [typing, setTyping] = useState(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    const next = at(n);
    const t: ReturnType<typeof setTimeout>[] = [];
    if (next.kind === "reply") {
      t.push(setTimeout(() => setTyping(true), 100));
      t.push(setTimeout(() => (setTyping(false), setN(n + 1)), 750));
    } else {
      t.push(setTimeout(() => setN(n + 1), n === 0 ? 200 : 1100));
    }
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const shown = Array.from({ length: Math.min(n, 6) }, (_, k) => n - Math.min(n, 6) + k);
  const nextIsReply = at(n).kind === "reply";
  return (
    <section className={SECTION}>
      <div className={GRID}>
        <Words counts={counts} />
        <div className="mx-auto w-full max-w-[32rem] overflow-hidden rounded-[2.25rem] bg-paper shadow-[0_30px_60px_-40px_rgb(0_12_31/0.35)] ring-1 ring-line">
          <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
            <span className="grid size-10 place-items-center rounded-full bg-ink text-sm font-bold text-white">מי?</span>
            <span>
              <span className="title block leading-tight">מי רץ?</span>
              <span className="text-sm text-ink-2">כל הרשימות, בסבבים ובסדר אקראי</span>
            </span>
          </div>
          <div className="relative flex h-[30rem] flex-col justify-end gap-3 px-5 pt-6 pb-5">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-paper via-paper/70 to-transparent" />
            {shown.map((c) => {
              const m = at(c);
              return m.kind === "ask" ? (
                <div key={c} className="bubble flex self-end">
                  <span className="flex items-center gap-3 rounded-[1.4rem] rounded-ee-md bg-ink py-2 ps-2 pe-5 text-white">
                    <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-paper">
                      <TopicIllustration topic={m.topic} className="!w-14" />
                    </span>
                    <span className="serif text-3xl leading-none">{TOPICS[m.topic].label}</span>
                  </span>
                </div>
              ) : (
                <Reply key={c} s={m.s} delay="0ms" />
              );
            })}
            {typing && nextIsReply && (
              <div key={`t${n}`} className="bubble flex items-end gap-2.5">
                <span className="size-9 shrink-0 rounded-full bg-tile" />
                <span className="typing flex gap-1.5 rounded-[1.4rem] rounded-es-md bg-paper px-4 py-4 ring-1 ring-line">
                  {[0, 1, 2].map((d) => (
                    <i key={d} className="size-2 rounded-full bg-ink" />
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Z. Thread: the two together. The topic card is thrown up and lands on top; the lists reply
 * beneath it as chat bubbles, one after another; then all of it is thrown away and the next topic arrives.
 */
export function HeroThread({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  const { topic, step, leaving } = useThrow(5000);
  const fair = useFair(stances);
  const say = fair.take(topic, 4, step);
  return (
    <section className={SECTION}>
      <div className={GRID}>
        <Words counts={counts} />
        <div key={topic} className={`mx-auto flex min-h-[36rem] w-full max-w-[30rem] flex-col justify-center gap-3 overflow-hidden py-6 ${leaving ? "leaving" : ""}`}>
          <CategoryCard topic={topic} className="mb-2" />
          {say.map((s, i) => (
            <Reply key={s.slug} s={s} i={i + 1} delay={`${450 + i * 380}ms`} />
          ))}
          <FairNote shown={say.length} total={fair.total(topic)} className="mt-1" />
        </div>
      </div>
    </section>
  );
}

// Where each note lands on the stage: over the card's corners and edges, tilted, in the order they are thrown.
const NOTES = [
  { top: "1%", side: "start", x: "0%", r: "-5deg", fx: "-10rem", ox: "-8rem", tint: "#fffbe8" },
  { top: "9%", side: "end", x: "-1%", r: "4deg", fx: "10rem", ox: "9rem", tint: "#ffffff" },
  { top: "38%", side: "start", x: "-3%", r: "-2.5deg", fx: "-12rem", ox: "-10rem", tint: "#ffffff" },
  { top: "46%", side: "end", x: "-3%", r: "5deg", fx: "12rem", ox: "10rem", tint: "#fffbe8" },
  { bottom: "3%", side: "start", x: "6%", r: "3deg", fx: "-8rem", ox: "-6rem", tint: "#fffbe8" },
  { bottom: "0%", side: "end", x: "5%", r: "-4deg", fx: "8rem", ox: "7rem", tint: "#ffffff" },
] as const;

/**
 * AA. Notes: the topic card is thrown into the middle of the stage; then the lists' sticky notes
 * are thrown on top of it one after another, each landing crooked over a corner. Then it all goes up and away.
 */
export function HeroNotes({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  const { topic, step, leaving } = useThrow(5400);
  const fair = useFair(stances);
  const say = fair.take(topic, NOTES.length, step);
  return (
    <section className={SECTION}>
      <div className={GRID}>
        <Words counts={counts} />
        <div key={topic} className={`relative mx-auto h-[38rem] w-full max-w-[36rem] ${leaving ? "leaving" : ""}`}>
          <div className="absolute inset-0 m-auto h-fit w-fit">
            <CategoryCard topic={topic} className="!max-w-none w-[20rem]" />
          </div>
          {say.map((s, i) => {
            const n = NOTES[i];
            return (
              <Link
                key={s.slug}
                href={`/lists/${s.slug}#positions`}
                style={{
                  ...("top" in n ? { top: n.top } : { bottom: n.bottom }),
                  [n.side === "start" ? "insetInlineStart" : "insetInlineEnd"]: n.x,
                  background: n.tint,
                  zIndex: i + 2,
                  ["--r" as string]: n.r,
                  ["--fx" as string]: n.fx,
                  ["--ox" as string]: n.ox,
                  ["--d" as string]: `${350 + i * 250}ms`,
                  ["--i" as string]: i + 1,
                }}
                className="toss group absolute w-[13rem] rounded-md p-4 pt-5 shadow-[0_18px_30px_-16px_rgb(0_12_31/0.4)] ring-1 ring-ink/10"
              >
                <span aria-hidden className="absolute -top-2.5 start-1/2 h-5 w-14 -translate-x-1/2 rotate-[-3deg] bg-ink/10" />
                <span className="flex items-center gap-2.5">
                  <Lead l={who(s)} sizes="40px" className="size-8 shrink-0 rounded-full bg-tile text-[0.6rem]" />
                  <span className="title leading-tight underline-offset-4 group-hover:underline">{s.name}</span>
                </span>
                <span className="mt-2.5 block text-[1.05rem] leading-snug text-pretty">{s.text}</span>
              </Link>
            );
          })}
          <FairNote shown={say.length} total={fair.total(topic)} className="absolute inset-x-0 -bottom-7" />
        </div>
      </div>
    </section>
  );
}
