"use client";

import Link from "@/i18n/link";
import { useEffect, useState } from "react";
import { SearchBox } from "@/components/search-box";
import { DaysLeft } from "@/components/countdown";
import { Face, Lead, type HeroListItem } from "./face";

// The drum the cards sit on: each card is a chord of a cylinder seen from the side,
// so it slides up AND back as it turns away, the way an iPhone picker does.
const ANGLE = 28; // degrees between neighbouring cards
const RADIUS = 21.5; // rem
const NEAR = 3;

/**
 * L. Picker: all the parties on an iPhone-style picker wheel. One big horizontal card is in focus;
 * the ones above and below tilt away in 3D and blur, and the wheel keeps turning on its own,
 * one party at a time. It holds still under the pointer, and clicking a blurred card brings it to the middle.
 */
export function HeroPicker({ lists, counts }: { lists: HeroListItem[]; counts: string }) {
  const n = lists.length;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIdx((x) => x + 1), 1500);
    return () => clearInterval(id);
  }, [paused, n]);

  return (
    <section className="px-3 pb-10 sm:px-6">
      <div className="mx-auto grid max-w-[104rem] items-center gap-14 overflow-hidden rounded-[2.75rem] bg-mist px-6 py-14 sm:px-12 lg:grid-cols-2 lg:gap-10 lg:px-20 lg:py-16">
        <div>
          <p className="text-lg text-ink-2">
            <DaysLeft /> · 27 באוקטובר 2026
          </p>
          <h1 className="serif mt-5 text-[clamp(4rem,7.4vw,8.25rem)] leading-[0.95]">מי בכלל רץ?</h1>
          <p className="mt-6 max-w-lg text-2xl leading-snug text-ink-2">כל הרשימות, כל המועמדים, ומה הם מציעים.</p>
          <div className="mt-9 max-w-[36rem]">
            <SearchBox size="lg" />
          </div>
          <p className="mt-5 text-ink-2">{counts}</p>
        </div>

        <div
          className="relative mx-auto h-[34rem] w-full max-w-[34rem] [perspective:950px] [transform-style:preserve-3d] [mask-image:linear-gradient(180deg,transparent_2%,black_30%,black_70%,transparent_98%)]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {lists.map((l, k) => {
            // The shortest way round the wheel from the middle to this card.
            const raw = (((k - idx) % n) + n) % n;
            const d = raw > n / 2 ? raw - n : raw;
            const a = Math.abs(d);
            const on = d === 0;
            const shown = a <= NEAR;
            return (
              <Link
                key={l.slug}
                href={`/lists/${l.slug}`}
                tabIndex={on ? 0 : -1}
                aria-hidden={!on}
                onClick={(e) => {
                  if (!on) {
                    e.preventDefault();
                    setIdx(idx + d);
                  }
                }}
                className={`absolute inset-x-0 top-1/2 flex items-center gap-6 rounded-[2rem] bg-paper p-5 pe-8 ${on ? "shadow-[0_40px_70px_-45px_rgb(0_12_31/0.5)]" : ""}`}
                dir="rtl"
                style={{
                  transform: `translateY(-50%) translateY(${(RADIUS * Math.sin((d * ANGLE * Math.PI) / 180)).toFixed(3)}rem) translateZ(${(RADIUS * (Math.cos((d * ANGLE * Math.PI) / 180) - 1)).toFixed(3)}rem) rotateX(${d * -ANGLE}deg)`,
                  filter: a ? `blur(${a * 2}px)` : "none",
                  opacity: shown ? 1 - a * 0.22 : 0,
                  zIndex: 10 - a,
                  pointerEvents: shown ? "auto" : "none",
                  transition: "transform 0.45s cubic-bezier(0.25,0.8,0.25,1), filter 0.45s, opacity 0.45s",
                }}
              >
                <Lead l={l} sizes="130px" className="size-[6.9rem] shrink-0 rounded-[1.4rem] bg-tile text-xl" />
                <span className="min-w-0 flex-1">
                  <span className="title block truncate text-[1.7rem] leading-tight">{l.name}</span>
                  <span className="mt-0.5 block text-ink-2">{l.count} מועמדים ברשימה</span>
                  <span className="mt-2.5 flex">
                    {l.faces.slice(1, 4).map((f, j) => (
                      <Face key={j} f={f} sizes="40px" className={`size-9 rounded-full bg-tile text-[0.6rem] text-ink/40 ring-2 ring-paper ${j ? "-ms-1.5" : ""}`} />
                    ))}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
