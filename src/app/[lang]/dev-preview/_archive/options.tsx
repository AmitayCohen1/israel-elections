import { Fragment } from "react";
import Image from "next/image";
import Link from "@/i18n/link";
import type { PersonData } from "@/components/showcase";

import type { Voice } from "@/lib/showcase";
export type { Voice };

const FADE =
  "[mask-composite:intersect] [mask-image:linear-gradient(180deg,transparent_0%,black_12%,black_88%,transparent_100%),linear-gradient(90deg,transparent_0%,black_10%,black_90%,transparent_100%)]";

/* ─────────────── G. Rows: big portraits drifting sideways, with a few words between them ─────────────── */
export function OptionRows({ people, voices }: { people: PersonData[]; voices: Voice[] }) {
  const rows = [0, 1, 2].map((r) => people.filter((_, i) => i % 3 === r).slice(0, 9));
  return (
    <div className={`wall relative h-[42rem] overflow-hidden ${FADE}`} dir="ltr">
      <div className="absolute inset-0 flex -rotate-[5deg] scale-110 flex-col justify-center gap-5">
        {rows.map((row, r) => (
          <div key={r} className="flex w-max">
            <div className={`drift flex gap-5 pr-5 ${r % 2 ? "drift-reverse" : ""}`} style={{ ["--drift-duration" as string]: `${80 + r * 18}s` }}>
              {[0, 1].map((copy) =>
                row.map((p, i) => {
                  const v = voices[(r * 3 + Math.floor(i / 3)) % voices.length];
                  return (
                    <Fragment key={`${copy}-${p.href}`}>
                      <Link href={p.href} tabIndex={copy ? -1 : undefined} aria-hidden={copy === 1} title={`${p.name} · ${p.list}`} className="relative block h-[12.5rem] w-[10rem] shrink-0 overflow-hidden rounded-[1.75rem] bg-tile">
                        <Image src={p.img} alt={p.name} fill sizes="160px" className="object-cover object-top" />
                      </Link>
                      {i % 3 === 1 && v && (
                        <Link
                          href={v.href}
                          tabIndex={copy ? -1 : undefined}
                          aria-hidden={copy === 1}
                          className="flex h-[12.5rem] w-[15rem] shrink-0 flex-col justify-center rounded-[1.75rem] border border-line bg-card p-5 text-right shadow-[0_24px_50px_-36px_rgb(0_12_31/0.5)]"
                          dir="rtl"
                        >
                          <span className="text-base text-ink-2">
                            {v.list} · {v.topic}
                          </span>
                          <span className="serif mt-2 line-clamp-4 text-[1.35rem] leading-[1.2]">{v.text}</span>
                        </Link>
                      )}
                    </Fragment>
                  );
                }),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── H. Floor: a field of faces in perspective, sliding away ─────────────── */
export function OptionFloor({ people, voices }: { people: PersonData[]; voices: Voice[] }) {
  const cols = [0, 1, 2, 3, 4].map((c) => people.filter((_, i) => i % 5 === c));
  return (
    <div className={`hero-wall relative h-[42rem] overflow-hidden [perspective:1100px] ${FADE}`} dir="ltr">
      <div
        className="absolute top-1/2 left-1/2 flex h-[64rem] w-[56rem] justify-center gap-4 overflow-hidden"
        style={{ transform: "translate(-50%, -50%) rotateX(52deg) rotateZ(-30deg) scale(1.15)" }}
      >
        {cols.map((col, c) => (
          <div key={c} className="w-[9.5rem] shrink-0">
            <div className={`rise flex flex-col ${c % 2 ? "rise-reverse" : ""}`} style={{ ["--rise-duration" as string]: `${55 + c * 12}s` }}>
              {[0, 1].map((copy) => (
                <div key={copy} className="flex flex-col gap-4 pb-4" aria-hidden={copy === 1}>
                  {col.map((p, i) => {
                    const v = voices[(c * 2 + i) % voices.length];
                    return (
                      <Fragment key={p.href}>
                        <Link href={p.href} tabIndex={copy ? -1 : undefined} title={`${p.name} · ${p.list}`} className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-tile shadow-[0_20px_40px_-20px_rgb(0_12_31/0.5)]">
                          <Image src={p.img} alt={p.name} fill sizes="150px" className="object-cover object-top" />
                        </Link>
                        {i % 4 === 2 && v && (
                          <Link href={v.href} tabIndex={copy ? -1 : undefined} className="flex aspect-[4/5] flex-col justify-end rounded-2xl bg-accent p-3.5 text-right text-white" dir="rtl">
                            <span className="text-base text-white/65">{v.list}</span>
                            <span className="serif mt-1 line-clamp-5 text-lg leading-[1.15]">{v.text}</span>
                          </Link>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── L. Flip: a tight mosaic; tiles turn over to show what that list talks about ─────────────── */
export function OptionFlip({ people, voices }: { people: PersonData[]; voices: Voice[] }) {
  return (
    <div className="mx-auto grid w-full max-w-[38rem] grid-cols-5 gap-3" dir="ltr">
      {people.slice(0, 25).map((p, i) => {
        const v = voices.find((x) => x.list === p.list) ?? voices[i % voices.length];
        return (
          <Link key={p.href} href={p.href} title={`${p.name} · ${p.list}`} className="relative aspect-square [perspective:800px]">
            <div className="flip absolute inset-0 [transform-style:preserve-3d]" style={{ animationDelay: `${-((i * 37) % 25) * 0.5}s` }}>
              <div className="absolute inset-0 overflow-hidden rounded-2xl bg-tile [backface-visibility:hidden]">
                <Image src={p.img} alt={p.name} fill sizes="130px" className="object-cover object-top" />
              </div>
              <div className="absolute inset-0 grid [transform:rotateY(180deg)] place-items-center rounded-2xl bg-accent p-2 text-center text-white [backface-visibility:hidden]" dir="rtl">
                <div>
                  <p className="serif text-lg leading-tight">{v.topic}</p>
                  <p className="mt-1 text-base text-white/65">{p.list}</p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
