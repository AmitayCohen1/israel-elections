"use client";

import { useState } from "react";
import { useCountdown } from "@/components/hero/countdown";
import { useMessages } from "@/i18n/link";
import { m } from "@/i18n/messages/countdown";
import { time } from "@/i18n/messages/time";

const pad = (n: number, min = 2) => String(n).padStart(min, "0");

function Half({ d, part, className = "", style }: { d: string; part: "top" | "bottom"; className?: string; style?: React.CSSProperties }) {
  const top = part === "top";
  return (
    <span
      className={`absolute inset-x-0 overflow-hidden bg-paper ${top ? "top-0 h-1/2 rounded-t-[0.28em]" : "bottom-0 h-1/2 rounded-b-[0.28em]"} ${className}`}
      style={{ backfaceVisibility: "hidden", ...style }}
    >
      <span className={`absolute inset-x-0 grid h-[200%] place-items-center ${top ? "top-0" : "bottom-0"}`}>{d}</span>
    </span>
  );
}

/** One flap: the top half of the old digit falls, and the bottom half of the new one swings down behind it. */
function Flap({ value }: { value: string }) {
  const [cur, setCur] = useState(value);
  const [prev, setPrev] = useState<string | null>(null);
  if (value !== cur) {
    setPrev(cur);
    setCur(value);
  }
  return (
    <span
      className="relative inline-block h-[1.35em] w-[0.86em] text-ink shadow-[0_1px_2px_-1px_rgb(0_12_31/0.18)]"
      style={{ perspective: "22em" }}
      dir="ltr"
      aria-hidden
    >
      <Half d={cur} part="top" />
      <Half d={cur} part="bottom" />
      {prev !== null && (
        <>
          <Half key={`b${prev}`} d={prev} part="bottom" className="flap-hold" />
          <Half key={`t${prev}`} d={prev} part="top" className="flap-fall" style={{ transformOrigin: "bottom", backfaceVisibility: "hidden" }} />
          <Half key={`n${cur}`} d={cur} part="bottom" className="flap-land" style={{ transformOrigin: "top" }} />
          <span key={`e${cur}`} className="absolute inset-0" onAnimationEnd={() => setPrev(null)} style={{ animation: "flap-done 0.55s linear" }} />
        </>
      )}
      <span className="absolute inset-x-0 top-1/2 z-[4] h-px -translate-y-1/2 bg-ink/[0.07]" />
    </span>
  );
}

function FlapNum({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-[0.12em] rounded-[0.42em] bg-mist p-[0.18em]">
      {[...pad(n)].map((c, i, a) => (
        <Flap key={a.length - i} value={c} />
      ))}
    </span>
  );
}

/**
 * The countdown as a quiet split-flap board: pale tiles that fall and land, navy numerals, like a calm station clock.
 * Days, hours, minutes, seconds, each with its word under it. The size follows the font-size given in `className`.
 * On election day it says so instead.
 */
export function FlapCountdown({ className = "text-[clamp(2.2rem,3vw,3.2rem)]", gap = "gap-4" }: { className?: string; gap?: string }) {
  const c = useCountdown();
  const t = useMessages(m);
  const tm = useMessages(time);
  if (c.open) return <p className="title text-xl">{t.today}</p>;
  const units = [
    { n: c.days, label: tm.dayWord(c.days) },
    { n: c.hours, label: tm.hourWord(c.hours) },
    { n: c.mins, label: tm.minWord(c.mins) },
    { n: c.secs, label: tm.secWord(c.secs) },
  ];
  return (
    <div role="timer" aria-label={t.timer(tm.days(c.days), tm.hours(c.hours), tm.mins(c.mins))} className={`flex items-start ${gap} transition-opacity duration-700 ${c.ready ? "opacity-100" : "opacity-0"}`}>
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center gap-2">
          <span className={`serif ${className}`}>
            <FlapNum n={u.n} />
          </span>
          <span className="text-base font-medium tracking-wide text-muted">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
