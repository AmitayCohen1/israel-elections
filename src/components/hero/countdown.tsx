"use client";

import { useState, useSyncExternalStore } from "react";
import { MS_DAY, POLLS_OPEN } from "@/lib/election";

const OPEN_MS = Date.parse(POLLS_OPEN);

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 250);
  return () => clearInterval(id);
};
const second = () => Math.floor(Date.now() / 1000);

/** One digit in a clipped window: the old one drops out the bottom while the new one slides in from the top. */
export function Digit({ value }: { value: string }) {
  const [cur, setCur] = useState(value);
  const [prev, setPrev] = useState<string | null>(null);
  if (value !== cur) {
    setPrev(cur);
    setCur(value);
  }
  return (
    <span className="cd-window relative grid h-[1.3em] w-[0.64em] overflow-hidden text-center leading-[1.3em]" dir="ltr">
      {prev !== null && (
        <span key={`o${prev}`} aria-hidden className="cd-out col-start-1 row-start-1" onAnimationEnd={() => setPrev(null)}>
          {prev}
        </span>
      )}
      <span key={cur} className={`col-start-1 row-start-1 ${prev !== null ? "cd-in" : ""}`}>
        {cur}
      </span>
    </span>
  );
}

/** The time left to the polls opening, ticking every second. `ready` is false until hydrated. */
export function useCountdown() {
  const s = useSyncExternalStore<number | null>(subscribe, second, () => null);
  const ready = s !== null;
  const diff = ready ? Math.max(0, OPEN_MS - s * 1000) : 0;
  return {
    ready,
    open: ready && diff === 0,
    now: ready ? s * 1000 : OPEN_MS,
    days: Math.floor(diff / MS_DAY),
    hours: Math.floor((diff % MS_DAY) / 3_600_000),
    mins: Math.floor((diff % 3_600_000) / 60_000),
    secs: Math.floor((diff % 60_000) / 1000),
  };
}

function Num({ n }: { n: number }) {
  return (
    <span className="inline-flex align-bottom" dir="ltr" aria-hidden>
      {[...String(n).padStart(2, "0")].map((c, i, a) => (
        <Digit key={a.length - i} value={c} />
      ))}
    </span>
  );
}

/** A number in the serif, underlined by a highlighter that draws itself in. */
function Mark({ n, delay }: { n: number; delay: number }) {
  return (
    <span className="mark relative inline-block px-1" style={{ animationDelay: `${delay}ms` }}>
      <Num n={n} />
    </span>
  );
}

/** The live countdown to the polls opening, as one sentence with the numbers rolling inside it. */
export function HeroCountdown() {
  const { ready, open, days, hours, mins, secs } = useCountdown();

  if (open) {
    return <p className="serif text-[clamp(1.6rem,2.4vw,2.6rem)] leading-[1.3]">הקלפיות פתוחות. תצביעו.</p>;
  }

  return (
    <p
      role="timer"
      aria-label={ready ? `עוד ${days} ימים, ${hours} שעות, ${mins} דקות ו-${secs} שניות עד שתצביעו` : "ספירה לאחור עד פתיחת הקלפיות"}
      className={`serif text-[clamp(1.6rem,2.4vw,2.6rem)] leading-[1.35] transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
    >
      עוד <Mark n={days} delay={0} /> {days === 1 ? "יום" : "ימים"}, <Mark n={hours} delay={150} /> שעות, <Mark n={mins} delay={300} /> דקות ו-<Mark n={secs} delay={450} /> שניות עד שתצביעו.
    </p>
  );
}

/** The hero's quiet status: days and a clock whose seconds fade over, e.g. "22 ימים · 19:54:33". */
export function HeroClock() {
  const { ready, open, days, hours, mins, secs } = useCountdown();
  if (open) return <>היום בוחרים</>;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className={`transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
      {days} {days === 1 ? "יום" : "ימים"} ·{" "}
      <span className="tabular-nums" dir="ltr" role="timer" aria-label={`${hours} שעות, ${mins} דקות ו-${secs} שניות`}>
        <span aria-hidden>
          {pad(hours)}:{pad(mins)}:
          <span key={secs} className="soft-tick inline-block">
            {pad(secs)}
          </span>
        </span>
      </span>
    </span>
  );
}
