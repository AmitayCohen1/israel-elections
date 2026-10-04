"use client";

import Link from "@/i18n/link";
import { SearchBox } from "@/components/search-box";
import { DaysLeft } from "@/components/countdown";
import { Face, Lead, type HeroListItem } from "./face";
import { useSwap } from "./grid";

function Words({ center = false }: { center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-[60rem] text-center" : ""}>
      <p className="text-lg text-ink-2">
        <DaysLeft /> · 27 באוקטובר 2026
      </p>
      <h1 className="serif mt-5 text-[clamp(4rem,7.4vw,8.25rem)] leading-[0.95]">מי בכלל רץ?</h1>
      <p className={`mt-6 text-2xl leading-snug text-ink-2 ${center ? "" : "max-w-lg"}`}>כל הרשימות, כל המועמדים, ומה הם מציעים.</p>
      <div className={`mt-9 max-w-[36rem] ${center ? "mx-auto" : ""}`}>
        <SearchBox size="lg" />
      </div>
    </div>
  );
}

/**
 * J. Focus: the quietest possible way to show every party — one at a time.
 * The words on the right; on the left one generous card holding a single party:
 * its lead candidate large, the party's name, the next three people. It turns to the next party on its own.
 */
export function HeroFocus({ lists, counts }: { lists: HeroListItem[]; counts: string }) {
  const { shown, hover } = useSwap(lists.length, 1, 4200);
  const l = lists[shown[0]];
  return (
    <section className="px-3 pb-10 sm:px-6">
      <div className="mx-auto grid max-w-[104rem] items-center gap-14 overflow-hidden rounded-[2.75rem] bg-mist px-6 py-14 sm:px-12 lg:grid-cols-2 lg:gap-10 lg:px-20 lg:py-20">
        <div>
          <Words />
          <p className="mt-5 text-ink-2">{counts}</p>
        </div>
        <div className="mx-auto w-full max-w-[26rem]" {...hover}>
          <Link key={l.slug} href={`/lists/${l.slug}`} className="card-in group block rounded-[2.5rem] bg-paper p-9 text-center shadow-[0_50px_90px_-60px_rgb(0_12_31/0.4)]">
            <Lead l={l} sizes="220px" className="mx-auto size-[13rem] rounded-full bg-tile text-[2.2rem]" />
            <span className="title mt-7 block text-[2rem] leading-tight underline-offset-4 group-hover:underline">{l.name}</span>
            <span className="mt-1.5 block text-ink-2">{l.count} מועמדים ברשימה</span>
            <span className="mt-6 flex items-center justify-center">
              {l.faces.slice(1, 4).map((f, k) => (
                <Face key={k} f={f} sizes="56px" className={`size-[3.1rem] rounded-full bg-tile text-xs text-ink/40 ring-[3px] ring-paper ${k ? "-ms-2.5" : ""}`} />
              ))}
            </span>
          </Link>
          <p className="mt-5 text-center text-sm text-ink-2 tabular-nums" dir="rtl">
            רשימה {shown[0] + 1} מתוך {lists.length} ·{" "}
            <Link href="/#lists" className="font-medium text-ink underline underline-offset-4">
              לכולן
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * K. Register: the words centred, and under them three parties set wide apart on white,
 * like the opening of an official register. Hairlines between them, one change at a time.
 */
export function HeroRegister({ lists, counts }: { lists: HeroListItem[]; counts: string }) {
  const { shown, hover } = useSwap(lists.length, 3, 4200);
  return (
    <section className="px-5 pt-6 pb-14 sm:px-10">
      <Words center />
      <div className="mx-auto mt-16 grid max-w-[74rem] gap-10 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-line sm:[direction:rtl]" {...hover}>
        {shown.map((i, place) => {
          const l = lists[i];
          return (
            <Link key={`${place}-${l.slug}`} href={`/lists/${l.slug}`} className="card-in group flex items-center justify-center gap-5 px-6 py-2 sm:px-10" dir="rtl">
              <Lead l={l} sizes="110px" className="size-[5.9rem] shrink-0 rounded-full bg-tile text-base" />
              <span className="min-w-0">
                <span className="title block truncate text-[1.45rem] leading-tight underline-offset-4 group-hover:underline">{l.name}</span>
                <span className="mt-2 flex items-center gap-2">
                  <span className="flex">
                    {l.faces.slice(1, 4).map((f, k) => (
                      <Face key={k} f={f} sizes="32px" className={`size-7 rounded-full bg-tile text-[0.55rem] text-ink/40 ring-2 ring-paper ${k ? "-ms-1.5" : ""}`} />
                    ))}
                  </span>
                  <span className="text-sm whitespace-nowrap text-ink-2">+{Math.max(l.count - 4, 0)}</span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
      <p className="mt-14 text-center text-ink-2">
        {counts} ·{" "}
        <Link href="/#lists" className="font-medium text-ink underline underline-offset-4">
          לכל הרשימות
        </Link>
      </p>
    </section>
  );
}
