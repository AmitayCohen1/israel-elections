"use client";

import Image from "next/image";
import Link from "@/i18n/link";
import { useEffect, useState } from "react";

export type Voice = { href: string; img: string; leader: string; list: string; letters: string; topic: string; point: string };

/**
 * F. Voices — who said what. A stack of photographs, one per list; the list on top speaks:
 * its position arrives word by word. It moves on by itself; the arrows step through.
 */
export function OptionVoices({ voices }: { voices: Voice[] }) {
  const n = voices.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((x) => (x + 1) % n), 5200);
    return () => clearInterval(id);
  }, [paused, n]);

  const v = voices[i];

  return (
    <div className="mx-auto grid w-full max-w-[42rem] items-center gap-10 sm:grid-cols-[17rem_1fr]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* The stack */}
      <div className="relative mx-auto h-[22rem] w-[17rem]" dir="ltr">
        {voices.map((x, k) => {
          const d = (k - i + n) % n; // 0 = on top
          const tilt = ((k * 7) % 13) - 6;
          return (
            <div
              key={x.href}
              className="absolute inset-0 overflow-hidden rounded-[2rem] bg-tile shadow-[0_30px_60px_-34px_rgb(0_12_31/0.55)] transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              style={{
                transform: d === 0 ? "none" : `rotate(${tilt}deg) scale(${1 - Math.min(d, 4) * 0.025}) translateY(${Math.min(d, 4) * 6}px)`,
                opacity: d === 0 ? 1 : d < 4 ? 0.75 : 0,
                zIndex: n - d,
              }}
            >
              <Image src={x.img} alt={d === 0 ? x.leader : ""} fill sizes="280px" className="object-cover object-top" priority={k < 2} />
            </div>
          );
        })}
      </div>

      {/* What it says */}
      <div dir="rtl">
        <p className="flex items-center gap-2.5 text-sm text-ink-2">
          <span className="slip rounded-[4px] border border-line-strong px-1.5 py-0.5 font-ballot text-xs leading-none font-black text-ink">{v.letters}</span>
          {v.topic}
        </p>
        <p className="title mt-3 text-3xl">{v.list}</p>
        <p key={v.href} className="serif mt-4 min-h-[9.5rem] text-[1.55rem] leading-[1.22]">
          {v.point.split(" ").map((w, k) => (
            <span key={k} className="word-in" style={{ animationDelay: `${k * 45}ms` }}>
              {w}&nbsp;
            </span>
          ))}
        </p>
        <div className="mt-6 flex items-center gap-3" dir="ltr">
          <button type="button" aria-label="הקודם" onClick={() => setI((x) => (x - 1 + n) % n)} className="grid size-11 place-items-center rounded-full bg-tile transition hover:bg-line">
            ←
          </button>
          <button type="button" aria-label="הבא" onClick={() => setI((x) => (x + 1) % n)} className="grid size-11 place-items-center rounded-full bg-tile transition hover:bg-line">
            →
          </button>
          <Link href={v.href} className="mr-auto text-base font-bold underline-offset-4 hover:underline" dir="rtl">
            הציטוט והמקור
          </Link>
        </div>
      </div>
    </div>
  );
}
