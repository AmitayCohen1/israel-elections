import Link from "@/i18n/link";
import { SearchBox } from "@/components/search-box";
import { DaysLeft } from "@/components/countdown";
import { Face, Slip, type HeroListItem } from "./face";

/**
 * The hero as one grey panel: the words on the right, and on the left one white card
 * with every list passing slowly through it — slip, name, three small faces.
 */
export function HeroList({ lists, counts }: { lists: HeroListItem[]; counts: string }) {
  return (
    <section className="px-3 pb-10 sm:px-6">
      <div className="mx-auto grid max-w-[104rem] items-center gap-14 overflow-hidden rounded-[2.75rem] bg-mist px-6 py-14 sm:px-12 lg:grid-cols-2 lg:gap-10 lg:px-20 lg:py-20">
        <div>
          <p className="text-lg text-ink-2">
            <DaysLeft /> · 27 באוקטובר 2026
          </p>
          <h1 className="serif mt-6 text-[clamp(4rem,7.4vw,8.25rem)] leading-[0.95]">מי בכלל רץ?</h1>
          <p className="mt-7 max-w-lg text-2xl leading-snug text-ink-2">כל הרשימות, כל המועמדים, ומה הם מציעים.</p>
          <div className="mt-10 max-w-[36rem]">
            <SearchBox size="lg" />
          </div>
          <p className="mt-5 text-ink-2">{counts}</p>
        </div>
        <div className="hero-wall mx-auto w-full max-w-[31rem] rounded-[2.5rem] bg-paper p-3 shadow-[0_50px_90px_-60px_rgb(0_12_31/0.4)]">
          <div className="h-[31rem] overflow-hidden rounded-[1.75rem] [mask-image:linear-gradient(180deg,transparent_0%,black_10%,black_90%,transparent_100%)]">
            <div className="rise flex flex-col" style={{ ["--rise-duration" as string]: "150s" }}>
              {[0, 1].map((copy) => (
                <div key={copy} aria-hidden={copy === 1}>
                  {lists.map((l) => (
                    <Link key={l.slug} href={`/lists/${l.slug}`} tabIndex={copy ? -1 : undefined} className="group flex items-center gap-4 border-b border-line px-4 py-3.5">
                      <Slip letters={l.letters} className="h-12 w-9 rounded-md text-[1.15rem]" />
                      <span className="title min-w-0 flex-1 truncate text-xl underline-offset-4 group-hover:underline">{l.name}</span>
                      <span className="flex shrink-0 items-center">
                        {l.faces.slice(0, 3).map((f, k) => (
                          <Face key={k} f={f} sizes="40px" className={`size-9 rounded-full bg-tile text-[0.65rem] text-ink/40 ring-2 ring-paper ${k ? "-ms-2" : ""}`} />
                        ))}
                      </span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
