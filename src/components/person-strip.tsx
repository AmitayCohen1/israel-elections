"use client";

import Image from "next/image";
import Link, { useLocale, useMessages } from "@/i18n/link";
import { LOCALE_INFO } from "@/i18n/config";
import { defineMessages } from "@/i18n/messages";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/avatar";
import { Arrow } from "@/components/arrow";

const m = defineMessages(
  { prev: "הקודם", next: "הבא" },
  {
    en: { prev: "Previous", next: "Next" },
    ar: { prev: "السابق", next: "التالي" },
    ru: { prev: "Назад", next: "Вперёд" },
    am: { prev: "ቀዳሚ", next: "ቀጣይ" },
  },
);

export type StripPerson = {
  slug: string;
  name: string;
  party: string;
  color: string | null;
  img: string | null;
  headline: string | null;
  /** The opening of their biography: a line or two. Shown here; the rest is on their page. */
  bio?: string | null;
  /** Facts from their background. Not shown on this card (the design options page uses them). */
  facts: { label: string; value: string }[];
};

/**
 * One person: a small portrait, the name large, their party, and the opening line or two of their biography. Under it, the list of people stands still and the highlight walks along it: back and forward at the
 * ends, or pick a face; left alone it steps forward by itself. It is a hint of what is on each person's page, not the page.
 * It holds while the pointer is over it, and with reduced motion it only moves when asked.
 */
export function PersonStrip({ people: all, every = 3500, show = 9 }: { people: StripPerson[]; every?: number; show?: number }) {
  const t = useMessages(m);
  const sign = LOCALE_INFO[useLocale()].dir === "rtl" ? -1 : 1;
  // The row holds `show` people. Which ones is drawn afresh on every visit (a run of the official order from a random
  // starting point), so over time everyone gets shown and no one is always left out. It stays put for the whole visit.
  const [from, setFrom] = useState(0);
  useEffect(() => {
    // Randomness exists only in the browser: the server always renders the same HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFrom(Math.floor(Math.random() * all.length));
  }, [all.length]);
  const people = Array.from({ length: Math.min(show, all.length) }, (_, k) => all[(from + k) % all.length]);
  const n = people.length;
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (held || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((k) => k + 1), every);
    return () => clearInterval(id);
  }, [held, n, every]);

  const at = (k: number) => people[((k % n) + n) % n];
  const on = ((i % n) + n) % n;
  const arrow = "grid size-9 shrink-0 place-items-center rounded-full bg-paper transition hover:bg-ink hover:text-white";
  return (
    <div onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} className="flex h-full flex-col">
      <div className="relative min-h-[7.5rem] flex-1 overflow-hidden">
        {[i - 1, i, i + 1].map((step) => {
          const p = at(step);
          return (
            <Link
              key={step}
              href={`/lists/${p.slug}/1`}
              tabIndex={step === i ? 0 : -1}
              aria-hidden={step !== i}
              style={{ transform: `translateX(${sign * (step - i) * 100}%)` }}
              className="absolute inset-x-0 bottom-0 flex gap-4 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none"
            >
              <span className="relative block h-28 w-24 shrink-0 self-start overflow-hidden rounded-2xl bg-paper">
                {p.img ? <Image src={p.img} alt="" fill sizes="96px" loading="eager" className="object-cover object-top" /> : <span className="grid size-full place-items-center"><Avatar name={p.name} src={null} color={p.color} size={72} /></span>}
              </span>
              <span className="flex min-w-0 flex-1 flex-col self-start">
                <span className="title block text-2xl leading-tight">{p.name}</span>
                <span className="block text-base text-ink-2">{p.party}</span>
                <span className="mt-2 line-clamp-2 text-base leading-snug text-pretty">{p.bio ?? p.headline}</span>
              </span>
            </Link>
          );
        })}
      </div>

      {/* Every portrait is fetched up front, so stepping to the next person never shows an empty frame. */}
      <div aria-hidden className="relative hidden">
        {people.map((q) => q.img && <Image key={q.slug} src={q.img} alt="" fill sizes="96px" loading="eager" />)}
      </div>

      {/* The list stands still; the highlight walks along it. Back and forward at the ends, or pick a face. */}
      <div className="mt-3 flex shrink-0 items-center gap-3">
        <button type="button" onClick={() => setI(i - 1)} aria-label={t.prev} className={arrow}>
          <Arrow>→</Arrow>
        </button>
        <ul className="flex min-w-0 flex-1 items-center justify-between">
          {people.map((q, k) => (
            <li key={q.slug}>
              <button type="button" onClick={() => setI(i + (k - on))} title={q.name} aria-label={q.name} aria-pressed={k === on} className={`block overflow-hidden rounded-full transition duration-300 ${k === on ? "ring-2 ring-ink ring-offset-2 ring-offset-mist" : "opacity-55 hover:opacity-100"}`}>
                <Avatar name={q.name} src={q.img} color={q.color} size={42} priority />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setI(i + 1)} aria-label={t.next} className={arrow}>
          <Arrow>←</Arrow>
        </button>
      </div>
    </div>
  );
}
