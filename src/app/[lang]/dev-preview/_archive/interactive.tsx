"use client";

import Image from "next/image";
import Link from "@/i18n/link";
import { useEffect, useState } from "react";
import type { PersonData } from "@/components/showcase";
import type { Voice } from "./options";

function useCycle(n: number, ms: number) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((x) => (x + 1) % n), ms);
    return () => clearInterval(id);
  }, [paused, n, ms]);
  return { i, setI, hold: { onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false) } };
}

function Bubble({ v, className = "" }: { v: Voice; className?: string }) {
  return (
    <div className={`rounded-[1.75rem] border border-line bg-card p-5 text-right shadow-[0_30px_60px_-30px_rgb(0_12_31/0.5)] ${className}`} dir="rtl">
      <p className="text-base text-ink-2">
        {v.list} · {v.topic}
      </p>
      <p className="serif mt-2 text-[1.45rem] leading-[1.2]">{v.text}</p>
    </div>
  );
}

/* ─────────────── I. Speaker: one large portrait speaking, the others waiting in a strip ─────────────── */
export function OptionSpeaker({ voices }: { voices: Voice[] }) {
  const { i, setI, hold } = useCycle(voices.length, 4200);
  const v = voices[i];
  return (
    <div className="mx-auto w-full max-w-[38rem]" {...hold}>
      <div className="relative h-[30rem]" dir="ltr">
        <Link href={v.href} className="absolute top-0 left-0 block h-[27rem] w-[21rem] overflow-hidden rounded-[2.75rem] bg-tile shadow-[0_40px_80px_-40px_rgb(0_12_31/0.55)]">
          {voices.map((x, k) => (
            <Image key={x.href} src={x.img} alt={k === i ? x.leader : ""} fill sizes="340px" priority={k === 0} className={`object-cover object-top transition-opacity duration-700 ${k === i ? "opacity-100" : "opacity-0"}`} />
          ))}
        </Link>
        <div key={v.href} className="word-in absolute right-0 bottom-0 w-[19rem]">
          <Bubble v={v} className="rounded-bl-md" />
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2.5" dir="ltr">
        {voices.map((x, k) => (
          <button key={x.href} type="button" aria-label={x.list} onClick={() => setI(k)} className={`overflow-hidden rounded-full transition duration-300 ${k === i ? "ring-[3px] ring-accent ring-offset-2" : "opacity-55 hover:opacity-100"}`}>
            <Image src={x.img} alt="" width={44} height={44} className="size-11 object-cover object-top" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── J. Cloud: a cluster of faces; one at a time steps forward and speaks ─────────────── */
const SPOTS: [number, number, number][] = [
  [50, 52, 128], [23, 27, 96], [77, 25, 104], [19, 66, 88], [81, 64, 100], [50, 17, 76], [37, 84, 88], [66, 85, 80],
  [7, 44, 60], [93, 43, 64], [35, 40, 64], [65, 38, 68], [31, 60, 56], [69, 61, 52], [51, 78, 56], [11, 87, 52], [91, 86, 56], [61, 5, 48], [36, 8, 44],
];

export function OptionCloud({ voices, people }: { voices: Voice[]; people: PersonData[] }) {
  const speakers = voices.slice(0, 8);
  const { i, hold } = useCycle(speakers.length, 3400);
  const fillers = people.filter((p) => !speakers.some((s) => s.img === p.img));
  const active = SPOTS[i];
  const below = active[1] < 40;
  return (
    <div className="relative mx-auto size-[38rem] max-w-full" dir="ltr" {...hold}>
      {SPOTS.map(([x, y, size], k) => {
        const speaker = speakers[k];
        const img = speaker?.img ?? fillers[k - speakers.length]?.img;
        const href = speaker?.href ?? fillers[k - speakers.length]?.href;
        if (!img || !href) return null;
        const on = k === i;
        return (
          <div key={k} className="bob absolute" style={{ left: `${x}%`, top: `${y}%`, marginLeft: -size / 2, marginTop: -size / 2, ["--bob-duration" as string]: `${5 + (k % 5)}s`, animationDelay: `${-(k % 7) * 0.8}s`, zIndex: on ? 20 : 1 }}>
            <Link
              href={href}
              className={`block overflow-hidden rounded-full shadow-[0_14px_30px_-14px_rgb(0_12_31/0.5)] ring-4 transition duration-500 ${on ? "scale-[1.18] ring-accent" : "ring-paper"} ${!on && speaker ? "" : ""}`}
              style={{ width: size, height: size }}
            >
              <Image src={img} alt="" width={size} height={size} className={`size-full object-cover object-top transition duration-500 ${on ? "" : "saturate-[0.85]"}`} />
            </Link>
          </div>
        );
      })}
      <div
        key={i}
        className="word-in pointer-events-none absolute z-30 w-[17rem]"
        style={{
          left: `clamp(8.5rem, ${active[0]}%, calc(100% - 8.5rem))`,
          top: `${active[1]}%`,
          transform: below ? `translate(-50%, ${active[2] / 2 + 22}px)` : `translate(-50%, calc(-100% - ${active[2] / 2 + 22}px))`,
        }}
      >
        <Bubble v={speakers[i]} />
      </div>
    </div>
  );
}

/* ─────────────── K. Coverflow: large portraits turning past, the middle one speaking ─────────────── */
export function OptionCoverflow({ voices }: { voices: Voice[] }) {
  const n = voices.length;
  const { i, setI, hold } = useCycle(n, 3600);
  return (
    <div className="relative mx-auto h-[36rem] w-full max-w-[40rem] [perspective:1400px]" dir="ltr" {...hold}>
      {voices.map((v, k) => {
        let d = k - i;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        const a = Math.abs(d);
        const shown = a <= 2;
        return (
          <Link
            key={v.href}
            href={v.href}
            aria-hidden={d !== 0}
            tabIndex={d === 0 ? 0 : -1}
            onClick={(e) => {
              if (d !== 0) {
                e.preventDefault();
                setI(k);
              }
            }}
            className="absolute top-1/2 left-1/2 block h-[30rem] w-[21rem] overflow-hidden rounded-[2.5rem] bg-tile shadow-[0_40px_80px_-40px_rgb(0_12_31/0.6)] transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{
              transform: `translate(-50%, -50%) translateX(${d * 46}%) rotateY(${-d * 28}deg) scale(${1 - a * 0.16})`,
              opacity: shown ? 1 - a * 0.25 : 0,
              zIndex: 10 - a,
              pointerEvents: shown ? "auto" : "none",
            }}
          >
            <Image src={v.img} alt={d === 0 ? v.leader : ""} fill sizes="340px" className="object-cover object-top" priority={k < 2} />
            <span className={`absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgb(0_12_31/0.88)_100%)] transition-opacity duration-500 ${d === 0 ? "opacity-100" : "opacity-0"}`} />
            <span className={`absolute inset-x-6 bottom-6 text-right text-white transition-opacity duration-500 ${d === 0 ? "opacity-100" : "opacity-0"}`} dir="rtl">
              <span className="block text-base text-white/70">
                {v.list} · {v.topic}
              </span>
              <span className="serif mt-1.5 block text-[1.5rem] leading-[1.18]">{v.text}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
