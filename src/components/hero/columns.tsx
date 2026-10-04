import Link from "@/i18n/link";
import { SearchBox } from "@/components/search-box";
import { Hourglass } from "./hourglass";
import { HeroClock } from "./countdown";
import { Face, Lead, type HeroListItem } from "./face";

/**
 * N. Columns: the whole hero on one rounded grey canvas, the america.gov way.
 * The words and the search on one side; on the other, columns of party cards
 * drifting up and down, dissolving softly at the canvas edge.
 */
export function HeroColumns({ lists, counts }: { lists: HeroListItem[]; counts: string }) {
  return (
    <section className="px-3 pb-10 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100svh-9.5rem)] max-w-[104rem] items-center gap-14 overflow-hidden rounded-[2.75rem] bg-mist px-6 py-14 sm:px-12 lg:grid-cols-2 lg:gap-10 lg:px-20 lg:py-16">
        <div>
          <p className="flex items-center gap-2.5 text-base text-ink-2">
            <Hourglass className="size-5 shrink-0 text-ink/60" />
            <span>
              <HeroClock />
            </span>
          </p>
          <h1 className="serif mt-5 text-[clamp(3.4rem,6.2vw,7rem)] leading-[0.95] text-balance">למי לעזאזל להצביע?</h1>
          <p className="mt-6 max-w-lg text-2xl leading-snug text-ink-2">הכירו את הרשימות, את המועמדים ואת העמדות שלהם — במקום אחד.</p>
          <div className="mt-9 max-w-[36rem]">
            <SearchBox size="lg" />
          </div>
          <p className="mt-5 text-ink-2">{counts}</p>
        </div>

        <div className="relative mx-auto h-[34rem] w-full max-w-[31rem] self-stretch lg:h-auto lg:-my-16">
          {/* Soft edges: an eased scrim in the canvas's own grey, with only a whisper of blur at the rim */}
          {(["top", "bottom"] as const).map((side) => {
            const deg = side === "top" ? "180deg" : "0deg";
            return (
              <div key={side} aria-hidden className={`pointer-events-none absolute inset-x-0 z-10 h-36 ${side === "top" ? "top-0" : "bottom-0"}`}>
                <div
                  className={`absolute inset-x-0 h-12 backdrop-blur-[1.5px] ${side === "top" ? "top-0" : "bottom-0"}`}
                  style={{ maskImage: `linear-gradient(${deg}, black, rgb(0 0 0 / 0.3) 55%, transparent 100%)` }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(${deg}, rgb(242 242 240) 0%, rgb(242 242 240 / 0.738) 13%, rgb(242 242 240 / 0.541) 24%, rgb(242 242 240 / 0.382) 34%, rgb(242 242 240 / 0.278) 42.5%, rgb(242 242 240 / 0.194) 51%, rgb(242 242 240 / 0.126) 59.5%, rgb(242 242 240 / 0.075) 68.5%, rgb(242 242 240 / 0.042) 77%, rgb(242 242 240 / 0.021) 85%, rgb(242 242 240 / 0.008) 92.5%, transparent 100%)`,
                  }}
                />
              </div>
            );
          })}

          <div className="hero-wall absolute inset-0 overflow-hidden" dir="ltr">
            <div className="rise flex flex-col" style={{ ["--rise-duration" as string]: "120s" }}>
              {[0, 1].map((copy) => (
                <div key={copy} aria-hidden={copy === 1} className="flex flex-col gap-3.5 pb-3.5">
                  {lists.map((l) => (
                    <Link
                      key={l.slug}
                      href={`/lists/${l.slug}`}
                      tabIndex={copy ? -1 : undefined}
                      className="group flex shrink-0 items-start gap-4 rounded-[2rem] bg-paper p-5 shadow-[0_14px_30px_-24px_rgb(0_12_31/0.25)]"
                      dir="rtl"
                    >
                      <Lead l={l} sizes="96px" className="size-16 shrink-0 rounded-full bg-tile text-lg" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base text-ink-2">
                          <span className="title text-xl text-ink underline-offset-4 group-hover:underline">{l.name}</span>
                          {l.topic && <span> · {l.topic}</span>}
                        </span>
                        {l.point && (
                          <span className={`mt-2 text-pretty ${l.topic ? "line-clamp-4 text-xl leading-snug" : "line-clamp-3 text-lg leading-snug text-ink-2"}`} style={{ display: "-webkit-box" }}>
                            {l.point}
                          </span>
                        )}
                        <span className="mt-3 flex items-center gap-2 text-sm text-ink-2">
                          <span className="flex">
                            {l.faces.slice(1, 4).map((f, j) => (
                              <Face key={j} f={f} sizes="32px" className={`size-7 rounded-full bg-tile text-[0.55rem] text-ink/40 ring-2 ring-paper ${j ? "-ms-2" : ""}`} />
                            ))}
                          </span>
                          {l.count} מועמדים ברשימה
                        </span>
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
