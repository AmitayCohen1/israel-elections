"use client";

import Image from "next/image";
import Link from "@/i18n/link";
import { useEffect, useState } from "react";
import type { PersonData } from "@/components/showcase";

/**
 * Which person stands in each place. Every few seconds one place quietly passes to the next person
 * waiting, so everyone gets a turn. It holds still while the pointer is over the picture.
 */
export function useSwap(total: number, places: number, ms = 3200) {
  const [{ shown }, setState] = useState(() => ({
    shown: Array.from({ length: Math.min(places, total) }, (_, i) => i),
    waiting: Array.from({ length: Math.max(total - places, 0) }, (_, i) => places + i),
    step: 0,
  }));
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || total <= places || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // A stride that shares no factor with the number of places, so every place gets its turn.
    const stride = places % 11 ? 11 : 7;
    const id = setInterval(() => {
      setState((s) => {
        const place = (s.step * stride) % s.shown.length;
        const [next, ...rest] = s.waiting;
        return { shown: s.shown.map((p, k) => (k === place ? next : p)), waiting: [...rest, s.shown[place]], step: s.step + 1 };
      });
    }, ms);
    return () => clearInterval(id);
  }, [paused, total, places, ms]);

  return { shown, hover: { onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false) } };
}

/** One candidate's photo, linking to them. Fills the box its className gives it. */
export function FaceTile({ p, className, sizes = "120px" }: { p: PersonData; className: string; sizes?: string }) {
  return (
    <Link href={p.href} title={`${p.name} · ${p.list}`} className={`card-in relative block overflow-hidden bg-tile transition duration-300 hover:scale-[1.03] ${className}`}>
      <Image src={p.img} alt={p.name} fill sizes={sizes} className="object-cover object-top" />
    </Link>
  );
}

/** A list's ballot slip as a tile, linking to the list of the given person. */
export function SlipTile({ p, className }: { p: PersonData; className: string }) {
  return (
    <Link
      href={p.href.replace(/\/\d+$/, "")}
      title={p.list}
      className={`slip grid place-items-center border border-line-strong font-ballot leading-none font-black transition duration-300 hover:scale-[1.03] ${className}`}
      style={{ fontSize: p.letters.length > 2 ? "1.3rem" : "1.9rem" }}
    >
      {p.letters}
    </Link>
  );
}

const COLS = 6;
const ROWS = 5;
// Places in the grid that hold a ballot slip instead of a face.
const SLIPS = [3, 10, 17, 24];

/** Candidates in a plain, even grid, with a few ballot slips among them. */
export function HeroGrid({ people }: { people: PersonData[] }) {
  const { shown, hover } = useSwap(people.length, COLS * ROWS - SLIPS.length);
  let face = 0;
  return (
    <div className="mx-auto grid w-max grid-cols-6 gap-[0.8rem]" dir="ltr" {...hover}>
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const slip = SLIPS.indexOf(i);
        if (slip >= 0) return <SlipTile key={i} p={people[(slip * 4 + 1) % people.length]} className="size-[5.6rem] rounded-[1.15rem]" />;
        const p = people[shown[face++ % shown.length]];
        return <FaceTile key={`${i}-${p.href}`} p={p} className="size-[5.6rem] rounded-[1.15rem]" />;
      })}
    </div>
  );
}
