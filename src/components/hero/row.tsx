"use client";

import Link from "@/i18n/link";
import { SearchBox } from "@/components/search-box";
import { DaysLeft } from "@/components/countdown";
import { Face, Lead, type HeroListItem } from "./face";
import { useSwap } from "./grid";

/**
 * The quiet one: the words in the middle, then a single still row of five parties on a hairline.
 * Each is the party's name, its lead candidate, and the next three people. Nothing moves, except that
 * every few seconds one party gives its place to another, so all of them get a turn.
 */
export function HeroRow({ lists, counts }: { lists: HeroListItem[]; counts: string }) {
  const { shown, hover } = useSwap(lists.length, 5, 3800);
  return (
    <section className="px-5 pt-6 pb-14 sm:px-10">
      <div className="mx-auto max-w-[60rem] text-center">
        <p className="text-lg text-ink-2">
          <DaysLeft /> · 27 באוקטובר 2026
        </p>
        <h1 className="serif mt-4 text-[clamp(4rem,8vw,8.5rem)] leading-[0.95]">מי בכלל רץ?</h1>
        <p className="mt-5 text-2xl text-ink-2">כל הרשימות, כל המועמדים, ומה הם מציעים.</p>
        <div className="mx-auto mt-8 max-w-[36rem]">
          <SearchBox size="lg" />
        </div>
      </div>
      <div className="mx-auto mt-16 grid max-w-[76rem] grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-12 sm:grid-cols-5" {...hover}>
        {shown.map((i, place) => {
          const l = lists[i];
          return (
            <Link key={`${place}-${l.slug}`} href={`/lists/${l.slug}`} className="card-in group flex flex-col items-center text-center">
              <Lead l={l} sizes="140px" className="size-[7.75rem] rounded-full bg-tile text-[1.25rem]" />
              <span className="-mt-4 flex">
                {l.faces.slice(1, 4).map((f, k) => (
                  <Face key={k} f={f} sizes="40px" className={`size-9 rounded-full bg-tile text-[0.6rem] text-ink/40 ring-[3px] ring-paper ${k ? "-ms-1.5" : ""}`} />
                ))}
              </span>
              <span className="title mt-4 line-clamp-2 text-[1.3rem] leading-tight underline-offset-4 group-hover:underline">{l.name}</span>
              <span className="mt-1 text-base text-ink-2">{l.count} מועמדים</span>
            </Link>
          );
        })}
      </div>
      <p className="mt-12 text-center text-ink-2">
        {counts} ·{" "}
        <Link href="/#lists" className="font-medium text-ink underline underline-offset-4">
          לכל הרשימות
        </Link>
      </p>
    </section>
  );
}
