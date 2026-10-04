"use client";

import { useSyncExternalStore } from "react";
import { LOCALE_INFO } from "@/i18n/config";
import { useLocale, useMessages } from "@/i18n/link";
import { m as msgs } from "@/i18n/messages/countdown";
import { time } from "@/i18n/messages/time";
import { EVENTS, MS_DAY, POLLS_OPEN, ELECTION_DAY, eventText, israelDate } from "@/lib/election";

// Minute resolution: seconds ticking would be noise, and a stable snapshot keeps React calm.
const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 30_000);
  return () => clearInterval(id);
};
const minute = () => Math.floor(Date.now() / 60_000);

const YEAR = 2026;
const MONTH = 9; // October, zero-based
const DAYS_IN_MONTH = 31;
const MILESTONES = EVENTS.filter((e) => e.date.startsWith("2026-10")).map((e) => [Number(e.date.slice(8)), e.id] as const);
const ELECTION = Number(ELECTION_DAY.slice(8));
const LEAD = new Date(Date.UTC(YEAR, MONTH, 1)).getUTCDay(); // Sunday-first, like the Israeli calendar

/** A big live countdown beside the October calendar: the one month that matters. */
export function ElectionCountdown() {
  const lang = useLocale();
  const t = useMessages(msgs);
  const tm = useMessages(time);
  const milestones = new Map(MILESTONES.map(([day, id]) => [day, eventText[lang][id].title]));
  const m = useSyncExternalStore<number | null>(subscribe, minute, () => null);
  const diff = m === null ? null : Date.parse(POLLS_OPEN) - m * 60_000;
  const open = diff !== null && diff <= 0;
  const days = diff !== null && diff > 0 ? Math.floor(diff / MS_DAY) : 0;
  const hours = diff !== null && diff > 0 ? Math.floor((diff % MS_DAY) / 3_600_000) : 0;
  const mins = diff !== null && diff > 0 ? Math.floor((diff % 3_600_000) / 60_000) : 0;

  const iso = m === null ? null : israelDate(m * 60_000);
  const todayNum = iso?.startsWith("2026-10") ? Number(iso.slice(8)) : null;
  const allPast = iso !== null && iso > "2026-10-31";

  const cells: (number | null)[] = [...Array<null>(LEAD).fill(null), ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1)];

  return (
    <div className="grid items-center gap-14 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-20">
      <div className="text-center lg:text-start">
        <p className="text-lg text-ink-2">{open ? t.pollsOpened : t.untilOpen}</p>
        <p className="mt-3 flex items-baseline justify-center gap-4 lg:justify-start">
          <span className="serif text-[clamp(6.5rem,13vw,11rem)] leading-[0.85] tabular-nums" dir="ltr">
            {m === null ? "—" : open ? 0 : days}
          </span>
          <span className="title text-3xl sm:text-4xl">{tm.dayWord(days)}</span>
        </p>
        {!open && (
          <p className="mt-5 min-h-8 text-2xl text-ink-2 tabular-nums">
            {m !== null && t.andMore(tm.hours(hours), tm.mins(mins))}
          </p>
        )}
        <p className="mx-auto mt-8 max-w-md text-lg leading-relaxed text-ink-2 lg:mx-0">
          {t.dateLine}
        </p>
      </div>

      <div className="rounded-[2rem] bg-paper p-6 shadow-[0_14px_30px_-24px_rgb(0_12_31/0.25)] sm:p-8">
        <p className="serif text-3xl">{new Date(Date.UTC(YEAR, MONTH, 1)).toLocaleDateString(`${LOCALE_INFO[lang].intl}-u-ca-gregory`, { month: "long", year: "numeric", timeZone: "UTC" })}</p>
        <div className="mt-5 grid grid-cols-7 gap-y-1 text-center">
          {t.weekdays.map((d, i) => (
            <span key={i} className="pb-2 text-base text-muted">
              {d}
            </span>
          ))}
          {cells.map((n, i) => {
            if (n === null) return <span key={`b${i}`} />;
            const isElection = n === ELECTION;
            const isToday = n === todayNum;
            const past = allPast || (todayNum !== null && n < todayNum);
            const milestone = milestones.get(n);
            return (
              <span
                key={n}
                title={milestone}
                className={`relative mx-auto grid size-10 place-items-center rounded-full text-lg tabular-nums sm:size-11 ${
                  isElection ? "cal-pop bg-ink font-semibold text-paper" : isToday ? "font-semibold ring-2 ring-ink" : past ? "text-ink/30" : ""
                }`}
              >
                {n}
                {milestone && !isElection && <span aria-hidden className="absolute bottom-1 size-1 rounded-full bg-accent" />}
              </span>
            );
          })}
        </div>
        <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-5 text-base text-ink-2">
          <li className="flex items-center gap-2">
            <span className="size-3.5 rounded-full ring-2 ring-ink" />
            {t.legendToday}
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-accent" />
            {t.legendMilestone}
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3.5 rounded-full bg-ink" />
            {t.legendElection}
          </li>
        </ul>
      </div>
    </div>
  );
}
