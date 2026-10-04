import Link from "@/i18n/link";
import { SearchBox } from "@/components/search-box";
import { DaysLeft } from "@/components/countdown";
import { Face, Lead, type HeroListItem } from "./face";

/**
 * A hero built from one component, the party bundle: the list's name, its lead candidate large,
 * and the next three people small.
 */

/* ─────────────── Wheel: the words in the middle, and every party on one huge wheel turning up from below ─────────────── */
const RADIUS = 82; // rem

export function HeroWheel({ lists, counts }: { lists: HeroListItem[]; counts: string }) {
  return (
    <section className="wheel-stage relative h-[56rem] overflow-hidden">
      <div className="relative z-10 mx-auto max-w-[60rem] px-5 pt-6 text-center">
        <p className="text-lg text-ink-2">
          <DaysLeft /> · 27 באוקטובר 2026
        </p>
        <h1 className="serif mt-4 text-[clamp(4rem,8vw,8.5rem)] leading-[0.95]">מי בכלל רץ?</h1>
        <p className="mt-5 text-2xl text-ink-2">כל הרשימות, כל המועמדים, ומה הם מציעים.</p>
        <div className="mx-auto mt-8 max-w-[36rem]">
          <SearchBox size="lg" />
        </div>
      </div>
      {/* The hub sits far below the section; only the top of the wheel shows. */}
      <div className="absolute top-[30.5rem] left-1/2" dir="ltr" style={{ transform: `translateY(${RADIUS}rem)` }}>
        <div className="wheel">
          {lists.map((l, i) => (
            <Link
              key={l.slug}
              href={`/lists/${l.slug}`}
              className="group absolute top-0 left-0 flex w-[11.5rem] flex-col items-center text-center"
              style={{ transform: `rotate(${((i * 360) / lists.length).toFixed(3)}deg) translate(-50%, -${RADIUS}rem)`, transformOrigin: "0 0" }}
            >
              <Lead l={l} sizes="170px" className="size-[9.25rem] rounded-full bg-tile text-[1.5rem] shadow-[0_24px_40px_-24px_rgb(0_12_31/0.45)] ring-[5px] ring-paper transition duration-500 group-hover:scale-105" />
              <span className="-mt-5 flex" dir="rtl">
                {l.faces.slice(1, 4).map((f, k) => (
                  <Face key={k} f={f} sizes="48px" className={`size-11 rounded-full bg-tile text-[0.7rem] text-ink/40 ring-[3px] ring-paper ${k ? "-ms-2" : ""}`} />
                ))}
              </span>
              <span className="title mt-3 line-clamp-2 text-[1.2rem] leading-tight underline-offset-4 group-hover:underline" dir="rtl">
                {l.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
      <p className="absolute inset-x-0 bottom-5 z-10 text-center text-ink-2">{counts}</p>
    </section>
  );
}
