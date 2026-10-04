"use client";

import Link from "@/i18n/link";
import { useEffect, useState } from "react";
import type { Team, TeamPerson } from "@/lib/showcase";
import { Portrait } from "./cycle";

export type CardVariant = "gallery" | "group" | "portrait" | "row";

function Slip({ letters, className }: { letters: string; className: string }) {
  return (
    <span className={`slip grid shrink-0 place-items-center rounded-md border border-line-strong font-ballot leading-none font-black ${className}`}>
      <span className={letters.length > 2 ? "text-[0.72em]" : ""}>{letters}</span>
    </span>
  );
}

function Face({ p, sizes, className }: { p: TeamPerson; sizes: string; className: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden bg-tile ${className}`}>
      <Portrait p={p} sizes={sizes} />
    </span>
  );
}

const CARD = "group block border border-line bg-card transition duration-300 hover:border-line-strong hover:shadow-[0_24px_50px_-36px_rgb(0_12_31/0.45)]";

/** Gallery: the lead candidate large, four more beside them, the list's name underneath. */
function GalleryCard({ t }: { t: Team }) {
  const [lead, ...rest] = t.people;
  return (
    <Link href={`/lists/${t.slug}`} className={`${CARD} rounded-[1.75rem] p-2.5`}>
      <span className="grid h-[10.75rem] grid-cols-[1.5fr_1fr_1fr] grid-rows-2 gap-1.5" dir="rtl">
        <Face p={lead} sizes="200px" className="row-span-2 rounded-[1.15rem] text-[2rem]" />
        {rest.slice(0, 4).map((p) => (
          <Face key={p.slot} p={p} sizes="110px" className="rounded-[0.85rem] text-base" />
        ))}
      </span>
      <span className="flex items-center justify-between gap-3 px-2 pt-3 pb-1.5">
        <span className="min-w-0">
          <span className="title block truncate text-[1.35rem] leading-tight">{t.name}</span>
          <span className="mt-0.5 block truncate text-sm text-ink-2">
            בראשות {lead.name} · {t.count} מועמדים
          </span>
        </span>
        <Slip letters={t.letters} className="h-11 w-[2.1rem] text-base" />
      </span>
    </Link>
  );
}

/** Group: five faces standing together, the lead only a little larger, the list's name underneath. */
function GroupCard({ t }: { t: Team }) {
  const p = t.people;
  // Left to right on screen; the lead in the middle, slot 2 to their right, the way the page reads.
  const row: [TeamPerson | undefined, string][] = [
    [p[4], "z-[1] size-12 text-sm"],
    [p[2], "z-[2] -ms-3.5 size-[4.25rem] text-lg"],
    [p[0], "z-[3] -ms-3.5 size-[5.75rem] text-2xl"],
    [p[1], "z-[2] -ms-3.5 size-[4.25rem] text-lg"],
    [p[3], "z-[1] -ms-3.5 size-12 text-sm"],
  ];
  return (
    <Link href={`/lists/${t.slug}`} className={`${CARD} flex flex-col items-center rounded-[1.75rem] px-4 pt-7 pb-5 text-center`}>
      <span className="flex items-center justify-center" dir="ltr">
        {row.map(([person, cls], k) => person && <Face key={k} p={person} sizes="100px" className={`rounded-full ring-[3px] ring-card ${cls}`} />)}
      </span>
      <span className="title mt-5 block max-w-full truncate text-[1.35rem] leading-tight">{t.name}</span>
      <span className="mt-1.5 flex items-center gap-2 text-sm text-ink-2">
        <Slip letters={t.letters} className="h-7 w-[1.4rem] rounded-[4px] text-[0.7rem]" />
        {t.count} מועמדים
      </span>
    </Link>
  );
}

/** Portrait: one large photo of the lead candidate, then a short row of the people after them. */
function PortraitCard({ t }: { t: Team }) {
  const [lead, ...rest] = t.people;
  return (
    <Link href={`/lists/${t.slug}`} className={`${CARD} rounded-[2rem] p-3`}>
      <span className="relative block aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-tile text-[3rem]">
        <Portrait p={lead} sizes="320px" />
        <Slip letters={t.letters} className="absolute top-3 right-3 h-12 w-9 text-lg" />
      </span>
      <span className="block px-2 pt-4 pb-2">
        <span className="title block truncate text-[1.6rem] leading-tight">{t.name}</span>
        <span className="mt-3 flex items-center justify-between gap-3">
          <span className="flex items-center">
            {rest.slice(0, 4).map((p, k) => (
              <Face key={p.slot} p={p} sizes="44px" className={`size-10 rounded-full text-xs ring-2 ring-card ${k ? "-ms-2.5" : ""}`} />
            ))}
          </span>
          <span className="shrink-0 text-ink-2">{t.count} מועמדים</span>
        </span>
      </span>
    </Link>
  );
}

/** Row: the slip, the name and one thing the list proposes, then its first five people. */
function RowCard({ t }: { t: Team }) {
  const [lead, ...rest] = t.people;
  return (
    <Link href={`/lists/${t.slug}`} className={`${CARD} flex items-center gap-4 rounded-[1.5rem] px-4 py-3.5`}>
      <Slip letters={t.letters} className="h-[3.6rem] w-[2.7rem] text-xl" />
      <span className="min-w-0 flex-1">
        <span className="title block truncate text-[1.4rem] leading-tight">{t.name}</span>
        <span className="mt-0.5 block truncate text-ink-2">{t.says ? `על ${t.says.topic}: ${t.says.text}` : `${t.count} מועמדים`}</span>
      </span>
      <span className="flex shrink-0 items-center">
        <Face p={lead} sizes="60px" className="z-[1] size-14 rounded-full text-base ring-[3px] ring-card" />
        {rest.slice(0, 4).map((p) => (
          <Face key={p.slot} p={p} sizes="48px" className="-ms-2.5 size-11 rounded-full text-xs ring-[3px] ring-card" />
        ))}
      </span>
    </Link>
  );
}

const CARDS: Record<CardVariant, { Card: (props: { t: Team }) => React.ReactNode; count: number; grid: string }> = {
  gallery: { Card: GalleryCard, count: 4, grid: "grid-cols-2 gap-4" },
  group: { Card: GroupCard, count: 4, grid: "grid-cols-2 gap-4" },
  portrait: { Card: PortraitCard, count: 2, grid: "grid-cols-2 gap-4" },
  row: { Card: RowCard, count: 4, grid: "gap-3" },
};
// Which place changes next, so two neighbours never change one after the other.
const ORDER: Record<number, number[]> = { 2: [0, 1], 4: [0, 3, 1, 2] };

/**
 * A few party cards standing still. Every few seconds one of them gives its place to the next list,
 * so every list gets the same time on the page. It waits while the pointer is over the cards.
 */
export function PartyDeck({ teams, variant, total }: { teams: Team[]; variant: CardVariant; total: number }) {
  const { Card, count, grid } = CARDS[variant];
  const n = teams.length;
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || n <= count || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setStep((s) => s + 1), 3400);
    return () => clearInterval(id);
  }, [paused, n, count]);

  // The first `count` lists to begin with; step s puts the next list in place ORDER[s % count].
  const shown = Array.from({ length: Math.min(count, n) }, (_, j) => j);
  for (let s = Math.max(0, step - count); s < step; s++) shown[ORDER[count][s % count]] = (count + s) % n;

  return (
    <div className="mx-auto w-full max-w-[41rem]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className={`grid ${grid}`}>
        {shown.map((i, place) => (
          <div key={`${place}-${teams[i].slug}`} className="card-in min-w-0">
            <Card t={teams[i]} />
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-ink-2">
        <Link href="/#lists" className="underline-offset-4 hover:underline">
          לכל {total} הרשימות
        </Link>
      </p>
    </div>
  );
}
