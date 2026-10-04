"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/avatar";
import type { ChatTopic } from "@/components/topic-chat";
import type { StripPerson } from "@/components/person-strip";

/** Steps through 0, 1, 2… on a timer, holding while the pointer is over `ref`-less wrapper state; reduced motion holds at 0. */
function useStep(ms: number) {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (held || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((k) => k + 1), ms);
    return () => clearInterval(id);
  }, [held, ms]);
  return { i, setI, hold: { onMouseEnter: () => setHeld(true), onMouseLeave: () => setHeld(false) } };
}

/* ───────────── Categories ───────────── */

/** B · Carousel: one topic at a time, big painted object, three parties under it; slides sideways, dots below. */
export function TopicCarousel({ topics }: { topics: ChatTopic[] }) {
  const { i, setI, hold } = useStep(7000);
  const L = topics.length;
  return (
    <div {...hold} className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {[i - 1, i, i + 1].map((step) => {
          const t = topics[((step % L) + L) % L];
          return (
            <div key={step} style={{ transform: `translateX(${-(step - i) * 100}%)` }} className="absolute inset-0 flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
              <div className="relative min-h-0 flex-1">
                <Image src={t.art} alt="" fill sizes="300px" loading="eager" className="object-contain mix-blend-multiply [mask-image:radial-gradient(closest-side,black_68%,transparent_100%)]" />
              </div>
              <p className="serif text-center text-4xl leading-none">{t.label}</p>
              <ul className="mt-3 grid gap-1 border-t border-ink/10 pt-2">
                {t.rows.slice(0, 3).map((r) => (
                  <li key={r.id} className="flex items-center gap-3 py-1">
                    <Avatar name={r.face.name} src={r.face.src} color={r.face.color} size={34} />
                    <span className="min-w-0">
                      <span className="title block text-sm leading-tight">{r.name}</span>
                      <span className="line-clamp-1 block text-sm text-ink-2">{r.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {topics.map((t, n) => (
          <button key={t.key} aria-label={t.label} onClick={() => setI(Math.floor(i / L) * L + n)} className={`h-2 rounded-full transition-all ${n === i % L ? "w-9 bg-ink" : "w-2 bg-ink/25"}`} />
        ))}
      </div>
    </div>
  );
}

/** C · Round table: the topic in the middle, the parties' leaders around it; each takes a turn to speak. */
export function RoundTable({ topics }: { topics: ChatTopic[] }) {
  const { i, hold } = useStep(3200);
  const T = topics.length;
  const SEATS = 7;
  const t = topics[Math.floor(i / SEATS) % T];
  const seats = t.rows.slice(0, SEATS);
  const who = i % SEATS;
  const speaker = seats[who % seats.length];
  return (
    <div {...hold} className="flex h-full flex-col">
      <div className="relative h-[13rem] shrink-0">
        {seats.map((r, k) => {
          const a = Math.PI * (k / (seats.length - 1));
          const on = k === who % seats.length;
          return (
            <span key={r.id} style={{ left: `${50 + 44 * Math.cos(a)}%`, top: `${92 - 82 * Math.sin(a)}%` }} className={`absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full transition duration-500 ${on ? "scale-125 ring-4 ring-ink" : "opacity-60"}`}>
              <Avatar name={r.face.name} src={r.face.src} color={r.face.color} size={56} />
            </span>
          );
        })}
        <div className="absolute inset-x-0 bottom-0 text-center">
          <p className="serif text-5xl leading-none">{t.label}</p>
        </div>
      </div>
      <div key={`${t.key}-${who}`} className="card-in mt-4 flex-1 rounded-2xl bg-paper p-4">
        <p className="title text-sm text-ink-2">{speaker.name}</p>
        <p className="mt-1 text-lg leading-snug text-pretty">{speaker.text}</p>
      </div>
    </div>
  );
}

/* ───────────── People ───────────── */

/** B · Deck: a long overlapping row of faces, and one featured person under it with a few facts. */
export function DeckFeature({ faces, people }: { faces: { src: string; name: string }[]; people: StripPerson[] }) {
  const { i, hold } = useStep(6000);
  const p = people[i % people.length];
  return (
    <div {...hold} className="flex h-full flex-col">
      <div className="flex shrink-0 justify-center py-3" dir="ltr">
        {faces.slice(0, 13).map((f, k) => (
          <span key={f.src} title={f.name} className={`relative block size-14 overflow-hidden rounded-full bg-paper ring-4 ring-mist ${k ? "-ml-4" : ""}`}>
            <Image src={f.src} alt="" fill sizes="56px" className="object-cover object-top" />
          </span>
        ))}
      </div>
      <div key={p.slug} className="card-in mt-3 flex-1 rounded-2xl bg-paper p-4">
        <div className="flex items-center gap-4">
          <Avatar name={p.name} src={p.img} color={p.color} size={72} />
          <div>
            <p className="title text-xl leading-tight">{p.name}</p>
            <p className="text-sm text-ink-2">{p.party}</p>
            {p.headline && <p className="mt-1 text-base">{p.headline}</p>}
          </div>
        </div>
        <dl className="mt-3 divide-y divide-ink/10 border-t border-ink/10">
          {p.facts.map((f, k) => (
            <div key={k} className="flex gap-3 py-1.5 text-sm">
              <dt className="w-24 shrink-0 text-ink-2">{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/** C · Directory: a grid of faces with names, one lit at a time, and what we have on them underneath. */
export function Directory({ people }: { people: StripPerson[] }) {
  const { i, setI, hold } = useStep(3500);
  const on = i % people.length;
  const p = people[on];
  return (
    <div {...hold} className="flex h-full flex-col">
      <ul className="grid shrink-0 grid-cols-4 gap-x-2 gap-y-3">
        {people.map((q, k) => (
          <li key={q.slug}>
            <button onClick={() => setI(k)} className="flex w-full flex-col items-center gap-1">
              <span className={`block overflow-hidden rounded-full transition duration-300 ${k === on ? "scale-110 ring-4 ring-ink" : "opacity-60"}`}>
                <Avatar name={q.name} src={q.img} color={q.color} size={60} />
              </span>
              <span className="line-clamp-1 text-xs text-ink-2">{q.name}</span>
            </button>
          </li>
        ))}
      </ul>
      <div key={p.slug} className="card-in mt-4 flex-1 rounded-2xl bg-paper p-4">
        <p className="title text-lg">
          {p.name} <span className="text-base font-normal text-ink-2">· {p.party}</span>
        </p>
        {p.headline && <p className="mt-1 text-base">{p.headline}</p>}
        <ul className="mt-2 flex flex-wrap gap-2">
          {p.facts.map((f, k) => (
            <li key={k} className="rounded-full bg-mist px-3 py-1 text-sm">
              <span className="text-ink-2">{f.label}: </span>
              {f.value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ───────────── More: categories ───────────── */

/** F · Spotlight: one party's words, large, on one topic; the topics as a row of words above it. */
export function Spotlight({ topics }: { topics: ChatTopic[] }) {
  const { i, setI, hold } = useStep(5500);
  const L = topics.length;
  const t = topics[i % L];
  const r = t.rows[Math.floor(i / L) % t.rows.length];
  return (
    <div {...hold} className="flex h-full flex-col">
      <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-1 border-b border-ink/10 pb-3">
        {topics.map((x, n) => (
          <button key={x.key} onClick={() => setI(Math.floor(i / L) * L + n)} className={`text-lg transition ${n === i % L ? "title text-ink" : "text-ink-2 hover:text-ink"}`}>
            {x.label}
          </button>
        ))}
      </div>
      <div key={i} className="card-in flex min-h-0 flex-1 flex-col justify-center">
        <p className="serif line-clamp-6 text-[1.9rem] leading-[1.25] text-pretty">{r.text}</p>
        <p className="mt-5 flex items-center gap-3">
          <Avatar name={r.face.name} src={r.face.src} color={r.face.color} size={44} />
          <span>
            <span className="title block text-lg leading-tight">{r.name}</span>
            <span className="text-sm text-ink-2">על {t.label}</span>
          </span>
        </p>
      </div>
    </div>
  );
}

/** G · Side by side: one topic, two parties next to each other; the pair changes, then the topic. */
export function Versus({ topics }: { topics: ChatTopic[] }) {
  const { i, hold } = useStep(6500);
  const t = topics[i % topics.length];
  const lap = Math.floor(i / topics.length);
  const pair = [t.rows[(lap * 2) % t.rows.length], t.rows[(lap * 2 + 1) % t.rows.length]];
  return (
    <div {...hold} className="flex h-full flex-col">
      <div key={t.key} className="card-in flex shrink-0 items-center gap-4 pb-4">
        <span className="relative size-16 shrink-0">
          <Image src={t.art} alt="" fill sizes="64px" loading="eager" className="object-contain mix-blend-multiply [mask-image:radial-gradient(closest-side,black_70%,transparent_100%)]" />
        </span>
        <p className="serif text-5xl leading-none">{t.label}</p>
      </div>
      <div key={i} className="card-in grid min-h-0 flex-1 grid-cols-2 gap-3">
        {pair.map((r) => (
          <div key={r.id} className="flex flex-col rounded-2xl bg-paper p-4">
            <Avatar name={r.face.name} src={r.face.src} color={r.face.color} size={56} />
            <p className="title mt-3 text-lg leading-tight">{r.name}</p>
            <p className="mt-2 line-clamp-[8] text-base leading-snug text-pretty">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────── More: people ───────────── */

/** E · Mosaic: a dense grid of portraits filling the card; one is lit at a time, and a line under the grid says who it is. */
export function Mosaic({ faces }: { faces: { src: string; name: string; list: string; sub: string | null }[] }) {
  const { i, setI, hold } = useStep(2600);
  // A fixed stride that shares no factor with the count, so the light jumps around the grid instead of walking along it.
  const on = (i * 7) % faces.length;
  const f = faces[on];
  return (
    <div {...hold} className="flex h-full flex-col">
      <ul className="grid min-h-0 flex-1 grid-cols-6 gap-1.5">
        {faces.map((x, k) => (
          <li key={x.src} className="relative min-h-0">
            <button onMouseEnter={() => setI(faces.findIndex((_, n) => (n * 7) % faces.length === k))} aria-label={x.name} className={`absolute inset-0 overflow-hidden rounded-xl transition duration-500 ${k === on ? "z-10 scale-110 ring-4 ring-ink" : "opacity-55 grayscale"}`}>
              <Image src={x.src} alt="" fill sizes="90px" className="object-cover object-top" />
            </button>
          </li>
        ))}
      </ul>
      <p key={f.src} className="card-in mt-4 shrink-0 truncate">
        <span className="title text-xl">{f.name}</span>
        <span className="text-base text-ink-2"> · {f.list}</span>
        {f.sub && <span className="text-base text-ink-2"> · {f.sub}</span>}
      </p>
    </div>
  );
}

/** F · File: one large portrait, and beside it what we hold on that person, as a checklist of labelled facts. */
export function PersonFile({ people }: { people: StripPerson[] }) {
  const { i, setI, hold } = useStep(6000);
  const n = people.length;
  const p = people[i % n];
  return (
    <div {...hold} className="flex h-full flex-col">
      <div key={p.slug} className="card-in grid min-h-0 flex-1 grid-cols-[11rem_minmax(0,1fr)] gap-5">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-paper">{p.img && <Image src={p.img} alt="" fill sizes="180px" className="object-cover object-top" />}</div>
        <div className="flex min-w-0 flex-col justify-center">
          <p className="title text-2xl leading-tight">{p.name}</p>
          <p className="text-base text-ink-2">{p.party}</p>
          <ul className="mt-3 grid gap-2">
            {p.facts.map((f, k) => (
              <li key={k} className="flex items-start gap-2.5">
                <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-ink text-[0.65rem] text-white">
                  ✓
                </span>
                <span className="min-w-0">
                  <span className="block text-sm text-ink-2">{f.label}</span>
                  <span className="line-clamp-2 block text-base leading-snug">{f.value}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ul className="mt-4 flex shrink-0 items-center gap-2 border-t border-ink/10 pt-3">
        {people.map((q, k) => (
          <li key={q.slug}>
            <button onClick={() => setI(k)} title={q.name} aria-label={q.name} className={`block overflow-hidden rounded-full transition ${k === i % n ? "ring-2 ring-ink" : "opacity-60 hover:opacity-100"}`}>
              <Avatar name={q.name} src={q.img} color={q.color} size={40} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
