import Image from "next/image";
import Link from "@/i18n/link";
import { SearchBox } from "@/components/search-box";
import { DaysLeft } from "@/components/countdown";
import type { PersonData } from "@/components/showcase";

/**
 * M. Card: the words centred, and under them one soft grey card — the brand surface — that holds the crowd:
 * even rows of portraits drifting very slowly — with the search floating on top of it.
 */
export function HeroCard({ people, counts }: { people: PersonData[]; counts: string }) {
  const rows = [0, 1, 2].map((r) => people.filter((_, i) => i % 3 === r));
  return (
    <section className="px-5 pt-6 pb-14 sm:px-10">
      <div className="mx-auto max-w-[60rem] text-center">
        <p className="text-lg text-ink-2">
          <DaysLeft /> · 27 באוקטובר 2026
        </p>
        <h1 className="serif mt-4 text-[clamp(4rem,8vw,8.5rem)] leading-[0.95]">מי בכלל רץ?</h1>
        <p className="mt-5 text-2xl text-ink-2">כל הרשימות, כל המועמדים, ומה הם מציעים.</p>
      </div>

      <div className="wall relative mx-auto mt-12 max-w-[76rem]">
        <div className="relative h-[30rem] overflow-hidden rounded-[3rem] bg-mist shadow-[0_50px_90px_-60px_rgb(0_12_31/0.4)]">
          {/* The crowd */}
          <div className="absolute inset-x-0 top-0 flex flex-col gap-3 p-3 [mask-image:linear-gradient(180deg,black_78%,transparent_100%)]" dir="ltr">
            {rows.map((row, r) => (
              <div key={r} className="flex w-max">
                <div className={`drift flex gap-3 pr-3 ${r % 2 ? "drift-reverse" : ""}`} style={{ ["--drift-duration" as string]: `${300 + r * 40}s` }}>
                  {[0, 1].map((copy) =>
                    row.map((p) => (
                      <Link
                        key={`${copy}-${p.href}`}
                        href={p.href}
                        title={`${p.name} · ${p.list}`}
                        tabIndex={copy ? -1 : undefined}
                        aria-hidden={copy === 1}
                        className="relative block h-[11.5rem] w-[9.25rem] shrink-0 overflow-hidden rounded-[1.6rem] bg-paper"
                      >
                        <Image src={p.img} alt={copy ? "" : p.name} fill sizes="150px" className="object-cover object-top" />
                      </Link>
                    )),
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Quiet shade behind the search so it stays legible */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-36 bg-[linear-gradient(180deg,rgb(242_242_240/0.92),transparent)]" />
          <div className="absolute inset-x-5 top-6 sm:inset-x-10">
            <div className="mx-auto max-w-[42rem]">
              <SearchBox size="lg" />
            </div>
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-ink-2">{counts}</p>
    </section>
  );
}
