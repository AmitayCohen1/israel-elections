"use client";

import { useEffect, useState } from "react";
import { PartyMark } from "@/components/party-mark";

export type FanParty = { slug: string; name: string; letters: string; color: string | null; count: number };

// A loose pile of small cards, as if tossed on a table: where each one lands, and how it leans.
const PILE = [
  { start: 0, top: 0.5, rot: -12, z: 2 },
  { start: 2.1, top: 3.1, rot: 7, z: 5 },
  { start: 4.2, top: 0.2, rot: -5, z: 3 },
  { start: 6.3, top: 3.3, rot: 11, z: 6 },
  { start: 8.4, top: 0.6, rot: -8, z: 4 },
  { start: 10.5, top: 2.9, rot: 6, z: 7 },
  { start: 12.6, top: 0.3, rot: -10, z: 1 },
];

/**
 * The parties as a loose pile of small tossed cards: each one the party's logo where we have one (otherwise its ballot slip)
 * and its name. Every second or so one card is tossed away and the next party lands in its place, round all the parties in
 * the official order from a random starting point, so over a short while every party shows up and none is always first.
 * It holds while the pointer is over it, and with reduced motion it stands still.
 */
export function PartyFan({ parties, every = 1300 }: { parties: FanParty[]; every?: number }) {
  const n = parties.length;
  const S = Math.min(PILE.length, n);
  // tick counts the swaps so far; slot k shows party (from + k + S * laps-for-that-slot).
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
    <span onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} className="relative block h-[9rem] w-[17rem] shrink-0">
      {PILE.slice(0, S).map((s, k) => {
        // How many times this slot has been swapped so far: slots take turns, one per tick.
        const turns = Math.floor((tick + (S - 1 - k)) / S);
        const step = from + k + turns * S;
        const p = parties[((step % n) + n) % n];
        return (
          <span
            key={`${k}-${turns}`}
            style={{ insetInlineStart: `${s.start}rem`, top: `${s.top}rem`, zIndex: s.z, "--rot": `${s.rot}deg` } as React.CSSProperties}
            className="toss-in absolute flex h-[5.5rem] w-[4.25rem] flex-col items-center justify-center gap-1 rounded-xl bg-paper p-1.5 text-center shadow-[0_14px_24px_-16px_rgb(0_12_31/0.45)] ring-1 ring-ink/5 [transform:rotate(var(--rot))]"
          >
            <PartyMark slug={p.slug} letters={p.letters} color={p.color} size="xs" />
            <span className="title line-clamp-2 text-[0.65rem] leading-tight">{p.name}</span>
          </span>
        );
      })}
    </span>
  );
}
