"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/avatar";

export type TeaserAxis = { id: string; stops: { slug: string; name: string; color: string; face: string | null }[][] };

/**
 * The position map in small, for its gate on the overview: one line, its stops, and the parties' faces arriving at the stop
 * each one stands on. No words. Every few seconds it turns to another question of the map and the faces arrive again; it
 * holds while the pointer is over it, and with reduced motion it stands still.
 */
export function MapTeaser({ axes, every = 5000 }: { axes: TeaserAxis[]; every?: number }) {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    // Randomness exists only in the browser: the server always renders the same HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setI(Math.floor(Math.random() * axes.length));
  }, [axes.length]);
  useEffect(() => {
    if (held || axes.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((k) => k + 1), every);
    return () => clearInterval(id);
  }, [held, axes.length, every]);
  const axis = axes[i % axes.length];
  const cols = { gridTemplateColumns: `repeat(${axis.stops.length}, minmax(0, 1fr))` };
  let n = 0;
  return (
    <span onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} className="block w-[19rem] max-w-full shrink-0">
      <span key={i} className="grid min-h-[4.75rem] items-end gap-2" style={cols}>
        {axis.stops.map((stop, k) => (
          <span key={k} className="flex flex-wrap-reverse content-start justify-center gap-1 pb-2">
            {stop.slice(0, 4).map((p) => (
              <span key={p.slug} style={{ animationDelay: `${n++ * 70}ms` }} className="dot-in block rounded-full ring-2 ring-paper">
                <Avatar name={p.name} src={p.face} color={p.color} size={30} />
              </span>
            ))}
          </span>
        ))}
      </span>
      <span className="relative block">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink" />
        <span className="relative grid gap-2" style={cols}>
          {axis.stops.map((_, k) => (
            <span key={k} aria-hidden className="mx-auto block size-4 rounded-full border-[3px] border-mist bg-ink" />
          ))}
        </span>
      </span>
    </span>
  );
}
