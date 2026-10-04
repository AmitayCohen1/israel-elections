"use client";

import { LOCALE_INFO } from "@/i18n/config";
import { useLocale, useMessages } from "@/i18n/link";
import { useSyncExternalStore } from "react";
import { m } from "@/i18n/messages/countdown";
import { time } from "@/i18n/messages/time";
import { EVENTS, dayIndex, eventText, israelDate } from "@/lib/election";

const subscribe = () => () => {};
const today = () => israelDate(Date.now());

/** How much of the rail between event i and the next has already happened (0–1). */
function railFill(i: number, now: string | null) {
  if (!now || i >= EVENTS.length - 1) return 0;
  const a = dayIndex(EVENTS[i].date);
  const b = dayIndex(EVENTS[i + 1].date);
  return Math.min(1, Math.max(0, (dayIndex(now) - a) / (b - a)));
}

function Node({ state }: { state: "past" | "next" | "later" }) {
  if (state === "past")
    return (
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-paper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
    );
  if (state === "next")
    return (
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent ring-[6px] ring-accent/15">
        <span className="size-2 rounded-full bg-paper" />
      </span>
    );
  return <span className="size-7 shrink-0 rounded-full border-2 border-line-strong bg-paper" />;
}

/** The calendar as a vertical rail that draws itself down the page as it scrolls into view. `compact` splits it into two columns on wide screens. */
export function Timeline({ compact = false }: { compact?: boolean }) {
  const lang = useLocale();
  const t = useMessages(m);
  const tm = useMessages(time);
  const text = eventText[lang];
  const now = useSyncExternalStore(subscribe, today, () => null);
  const nextIdx = now ? EVENTS.findIndex((e) => e.date >= now) : -1;
  const half = Math.ceil(EVENTS.length / 2);
  const groups = compact ? [EVENTS.slice(0, half), EVENTS.slice(half)] : [EVENTS];

  return (
    <div className={compact ? "grid lg:grid-cols-2 lg:gap-x-20" : ""}>
      {groups.map((group, g) => {
        const offset = g * half;
        return (
          <ol key={g}>
            {group.map((e, k) => {
              const i = offset + k;
              const past = now !== null && e.date < now;
              const isNext = i === nextIdx;
              const last = i === EVENTS.length - 1;
              // The rail runs on between the two columns when they stack on a phone, and ends at the foot of the first column on wide screens.
              const endOfColumn = compact && k === group.length - 1 && !last;
              const daysAway = isNext && now ? Math.round(dayIndex(e.date) - dayIndex(now)) : 0;
              const election = e.id === "election";
              return (
                <li key={e.date} className="flex gap-5 sm:gap-8">
                  <div className="flex w-7 shrink-0 flex-col items-center">
                    <Node state={past ? "past" : isNext ? "next" : "later"} />
                    {!last && (
                      <span className={`relative mt-1.5 w-0.5 flex-1 overflow-hidden rounded-full bg-line ${endOfColumn ? "lg:hidden" : ""}`}>
                        <span className="tl-fill absolute inset-0 origin-top bg-ink" style={{ "--fill": railFill(i, now) } as React.CSSProperties} />
                      </span>
                    )}
                  </div>
                  <div className={`tl-reveal ${last ? "" : compact ? "pb-7" : "pb-12 sm:pb-14"}`}>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-muted">
                      {new Date(e.date).toLocaleDateString(`${LOCALE_INFO[lang].intl}-u-ca-gregory`, { day: "numeric", month: "long", timeZone: "UTC" })}
                      {isNext && (
                        <span className="rounded-full bg-ink px-3 py-0.5 text-base font-medium text-paper">
                          {t.next}
                          {daysAway > 0 ? t.inDays(daysAway, tm.days(daysAway)) : t.isToday}
                        </span>
                      )}
                    </p>
                    <p className={`title mt-1 ${election ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"} ${past ? "text-ink-2" : ""}`}>{text[e.id].title}</p>
                    <p className={`mt-2 max-w-xl text-lg leading-relaxed ${past ? "text-muted" : "text-ink-2"}`}>{text[e.id].text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        );
      })}
    </div>
  );
}
