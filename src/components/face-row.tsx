"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/avatar";

export type RowFace = { slug: string; name: string; img: string | null; color: string | null };

// Five portraits side by side, the middle one the largest; each floats at its own pace.
const SLOTS = [
  { size: 56, bob: 7 },
  { size: 72, bob: 5.5 },
  { size: 92, bob: 6.5 },
  { size: 72, bob: 5 },
  { size: 56, bob: 7.5 },
];

/**
 * The party leaders as a row of floating portraits, for their gate on the overview. Every couple of seconds one portrait
 * gives its place to the next leader, round all of them from a random starting point, so everyone shows up and no one is
 * always in the middle. It holds while the pointer is over it, and with reduced motion it stands still.
 */
export function FaceRow({ faces, every = 1800 }: { faces: RowFace[]; every?: number }) {
  const n = faces.length;
  const S = Math.min(SLOTS.length, n);
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
    <span onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} className="isolate flex h-[6.5rem] shrink-0 items-center justify-center -space-x-3 rtl:space-x-reverse">
      {SLOTS.slice(0, S).map((s, k) => {
        // How many times this slot has been swapped so far: slots take turns, one per tick.
        const turns = Math.floor((tick + (S - 1 - k)) / S);
        const f = faces[(((from + k + turns * S) % n) + n) % n];
        return (
          <span key={k} style={{ "--bob-duration": `${s.bob}s`, zIndex: s.size } as React.CSSProperties} className="bob relative block">
            <span key={turns} className="dot-in block rounded-full ring-[3px] ring-paper">
              <Avatar name={f.name} src={f.img} color={f.color} size={s.size} />
            </span>
          </span>
        );
      })}
    </span>
  );
}
