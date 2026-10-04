"use client";

import { Digit, useCountdown } from "@/components/hero/countdown";
import { FlapCountdown } from "@/components/flap-countdown";
import { ELECTION_DAY, EVENTS, dayIndex, israelDate } from "@/lib/election";

const pad = (n: number, min = 2) => String(n).padStart(min, "0");
const fade = (ready: boolean) => `transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`;

/** A number set in rolling digits, sized by the surrounding font-size. */
function Num({ n, min = 2 }: { n: number; min?: number }) {
  return (
    <span className="inline-flex align-bottom" dir="ltr" aria-hidden>
      {[...pad(n, min)].map((c, i, a) => (
        <Digit key={a.length - i} value={c} />
      ))}
    </span>
  );
}

/* ---------------------------------------------------------------- A. Split-flap */

/** A. A quiet split-flap board: pale tiles on a soft frame with navy numerals, falling and landing like a station clock. */
export function CountdownFlap() {
  return <FlapCountdown />;
}

/* ---------------------------------------------------------------- B. Watch face */

/** B. A watch face: sixty ticks light up with the seconds, an inner ring keeps the minutes, and the days sit in the middle. */
export function CountdownDial() {
  const c = useCountdown();
  return (
    <div className={`relative aspect-square w-[min(100%,19rem)] ${fade(c.ready)}`}>
      <svg viewBox="0 0 200 200" className="absolute inset-0" aria-hidden>
        {Array.from({ length: 60 }, (_, i) => {
          const major = i % 5 === 0;
          const on = i <= c.secs;
          const here = i === c.secs;
          return (
            <line
              key={i}
              x1="100"
              y1={major ? 6 : 9}
              x2="100"
              y2={major ? 20 : 17}
              transform={`rotate(${i * 6} 100 100)`}
              stroke={here ? "#002664" : "#000c1f"}
              strokeOpacity={here ? 1 : on ? 0.75 : 0.14}
              strokeWidth={here ? 3 : major ? 2 : 1.4}
              strokeLinecap="round"
              style={{ transition: "stroke-opacity 0.4s ease" }}
            />
          );
        })}
        {Array.from({ length: 60 }, (_, i) => (
          <circle
            key={i}
            cx="100"
            cy="30"
            r="1.1"
            transform={`rotate(${i * 6} 100 100)`}
            fill="#000c1f"
            fillOpacity={i < c.mins ? 0.6 : 0.12}
            style={{ transition: "fill-opacity 0.6s ease" }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="serif text-[5.5rem] leading-none sm:text-[6.5rem]">
          <Num n={c.days} />
        </span>
        <span className="title -mt-1 text-xl">{c.days === 1 ? "יום" : "ימים"}</span>
        <span className="mt-1 text-ink-2 tabular-nums">ועוד {c.hours} שעות</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- C. Every day a dot */

const START = EVENTS[0].date;

/** C. Every day of the campaign is a dot: the days gone are filled, today breathes, election day is the ring at the end. */
export function CountdownDots() {
  const c = useCountdown();
  const total = dayIndex(ELECTION_DAY) - dayIndex(START) + 1;
  const today = c.ready ? Math.min(Math.max(dayIndex(israelDate(c.now)) - dayIndex(START), 0), total - 1) : -1;
  return (
    <div className={`grid items-end gap-x-14 gap-y-8 lg:grid-cols-[auto_1fr] ${fade(c.ready)}`}>
      <div>
        <p className="serif text-[clamp(6rem,11vw,10rem)] leading-[0.85]">
          <Num n={c.days} />
        </p>
        <p className="mt-3 text-xl text-ink-2">
          {c.days === 1 ? "יום" : "ימים"} · <span className="tabular-nums" dir="ltr">{pad(c.hours)}:{pad(c.mins)}:{pad(c.secs)}</span>
        </p>
      </div>
      <div>
        <div className="flex flex-wrap gap-[0.55rem]" aria-hidden>
          {Array.from({ length: total }, (_, i) => {
            const last = i === total - 1;
            const state = i < today ? "past" : i === today ? "today" : "future";
            return (
              <span
                key={i}
                className={`dot-in size-[0.7rem] rounded-full ${
                  last ? "ring-2 ring-ink ring-offset-2 ring-offset-mist " : ""
                }${state === "past" ? "bg-ink" : state === "today" ? "cd-today bg-ink" : last ? "bg-ink" : "bg-ink/15"}`}
                style={{ animationDelay: `${i * 9}ms` }}
              />
            );
          })}
        </div>
        <p className="mt-5 flex justify-between text-sm text-ink-2" aria-hidden>
          <span>פיזור הכנסת</span>
          <span>יום הבחירות</span>
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- D. Monument */

/** D. The days as a monument: an outlined numeral too big for its frame, the clock set in white across it. */
export function CountdownMonument() {
  const c = useCountdown();
  return (
    <div className={`relative -mx-8 overflow-hidden sm:-mx-16 ${fade(c.ready)}`}>
      <p className="serif text-center text-[clamp(11rem,26vw,24rem)] leading-[0.82] text-transparent select-none" style={{ WebkitTextStroke: "1.5px rgb(0 12 31 / 0.55)" }}>
        <Num n={c.days} />
      </p>
      <div className="absolute inset-x-0 bottom-[12%] flex justify-center">
        <div className="flex items-center gap-5 rounded-full bg-ink px-8 py-3 text-paper">
          <span className="title text-lg">{c.days === 1 ? "יום" : "ימים"} עד הקלפי</span>
          <span className="serif flex items-center text-3xl" dir="ltr">
            <Num n={c.hours} />
            <span className="cd-colon px-1">:</span>
            <Num n={c.mins} />
            <span className="cd-colon px-1">:</span>
            <Num n={c.secs} />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- E. Sentence */

function Mark({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="mark relative inline-block px-1" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </span>
  );
}

/** E. Not a clock at all: one sentence, the numbers underlined in a highlighter that draws itself in. */
export function CountdownSentence() {
  const c = useCountdown();
  return (
    <p className={`max-w-[44rem] text-[clamp(2rem,3.6vw,3.8rem)] leading-[1.35] ${fade(c.ready)}`}>
      <span className="serif">עוד </span>
      <Mark delay={0}>
        <span className="serif">
          <Num n={c.days} />
        </span>
      </Mark>
      <span className="serif"> {c.days === 1 ? "יום" : "ימים"}, </span>
      <Mark delay={150}>
        <span className="serif">
          <Num n={c.hours} />
        </span>
      </Mark>
      <span className="serif"> שעות, </span>
      <Mark delay={300}>
        <span className="serif">
          <Num n={c.mins} />
        </span>
      </Mark>
      <span className="serif"> דקות ו-</span>
      <Mark delay={450}>
        <span className="serif">
          <Num n={c.secs} />
        </span>
      </Mark>
      <span className="serif"> שניות עד שתצביעו.</span>
    </p>
  );
}
