"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PartyMark } from "@/components/party-mark";

export type FanParty = { slug: string; name: string; letters: string; color: string | null; count: number };
export type FanTopic = { key: string; label: string; art: string };

// A loose pile of small cards, as if tossed on a table: where each one lands, and how it leans.
const PILE = [
  { start: 0, top: 0.6, rot: -7, z: 2 },
  { start: 4.1, top: 1.5, rot: 5, z: 4 },
  { start: 8.2, top: 0.3, rot: -4, z: 3 },
  { start: 12.3, top: 1.4, rot: 7, z: 5 },
];

/**
 * A loose pile of small tossed cards. Every second or so one card is tossed away and the next item lands in its place, round
 * all the items in their given order from a random starting point, so over a short while every one shows up and none is
 * always first. It holds while the pointer is over it, and with reduced motion it stands still.
 */
function Pile<T>({ items, every, card }: { items: T[]; every: number; card: (item: T) => React.ReactNode }) {
  const n = items.length;
  const S = Math.min(PILE.length, n);
  // tick counts the swaps so far; slot k shows item (from + k + S * laps-for-that-slot).
  const [from, setFrom] = useState(0);
  const [tick, setTick] = useState(0);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    // Randomness exists only in the browser: the server always renders the same HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFrom(Math.floor(Math.random() * n));
  }, [n]);
  useEffect(() => {
    if (held || n <= S || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setTick((k) => k + 1), every);
    return () => clearInterval(id);
  }, [held, n, S, every]);
  return (
    <span onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} className="relative block h-[8.5rem] w-[17.5rem] shrink-0 max-[359px]:scale-[0.85]">
      {PILE.slice(0, S).map((s, k) => {
        // How many times this slot has been swapped so far: slots take turns, one per tick.
        const turns = Math.floor((tick + (S - 1 - k)) / S);
        const step = from + k + turns * S;
        return (
          <span
            key={`${k}-${turns}`}
            style={{ insetInlineStart: `${s.start}rem`, top: `${s.top}rem`, zIndex: s.z, "--rot": `${s.rot}deg` } as React.CSSProperties}
            className="toss-in absolute flex h-[6.75rem] w-[5.25rem] flex-col items-center justify-center gap-1 rounded-xl bg-paper p-1.5 text-center shadow-[0_14px_24px_-16px_rgb(0_12_31/0.45)] ring-1 ring-ink/5 [transform:rotate(var(--rot))]"
          >
            {card(items[((step % n) + n) % n])}
          </span>
        );
      })}
    </span>
  );
}

/** The parties as the pile: each card the party's logo where we have one (otherwise its ballot slip) and its name, in the official order. */
export function PartyFan({ parties, every = 1300 }: { parties: FanParty[]; every?: number }) {
  return (
    <Pile
      items={parties}
      every={every}
      card={(p) => (
        <>
          <PartyMark slug={p.slug} letters={p.letters} color={p.color} size="xs" />
          <span className="title line-clamp-2 text-base leading-tight">{p.name}</span>
        </>
      )}
    />
  );
}

/** The eight topics as the pile: each card its painted object and its name. */
export function TopicFan({ topics, every = 1700 }: { topics: FanTopic[]; every?: number }) {
  return (
    <Pile
      items={topics}
      every={every}
      card={(t) => (
        <>
          <span className="relative block size-12">
            <Image src={t.art} alt="" fill sizes="48px" loading="eager" className="object-contain mix-blend-multiply" />
          </span>
          <span className="title line-clamp-2 text-base leading-tight">{t.label}</span>
        </>
      )}
    />
  );
}
