"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Team, TeamPerson } from "@/lib/showcase";

type Phase = "show" | "hide" | "enter";

/**
 * Steps through the lists one at a time: show, leave, swap, arrive.
 * Pauses while the pointer is over the illustration, and jumps straight to a list that was picked.
 */
export function useCycle(n: number, hold = 5600, leave = 420) {
  const [idx, setIdx] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("show");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (phase === "show") {
      if (paused || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const id = setTimeout(() => setPhase("hide"), hold);
      return () => clearTimeout(id);
    }
    if (phase === "hide") {
      const id = setTimeout(() => {
        setIdx((x) => next ?? (x + 1) % n);
        setNext(null);
        setPhase("enter");
      }, leave);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setPhase("show"), 70);
    return () => clearTimeout(id);
  }, [phase, paused, next, n, hold, leave]);

  return {
    idx,
    /** The list the picker should mark: the one arriving, if one was picked. */
    target: next ?? idx,
    phase,
    pick: (k: number) => {
      if (k === idx || phase !== "show") return;
      setNext(k);
      setPhase("hide");
    },
    hover: { onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false) },
  };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

/** Fills its (relative) parent with the person's photo, or their initials when there is none. */
export function Portrait({ p, sizes }: { p: TeamPerson; sizes: string }) {
  return p.img ? (
    <Image src={p.img} alt={p.name} fill sizes={sizes} className="object-cover object-top" />
  ) : (
    <span className="absolute inset-0 grid place-items-center bg-tile text-[1.1em] font-medium text-ink/35">{initials(p.name)}</span>
  );
}

/** One thing the list proposes, arriving word by word. */
export function Proposal({ team, className = "" }: { team: Team; className?: string }) {
  if (!team.says) return null;
  return (
    <p key={team.slug} className={className} dir="rtl">
      <span className="word-in text-ink-2" style={{ animationDelay: "120ms" }}>
        על {team.says.topic}:&nbsp;
      </span>
      {team.says.text.split(" ").map((w, k) => (
        <span key={k} className="word-in" style={{ animationDelay: `${220 + k * 55}ms` }}>
          {w}&nbsp;
        </span>
      ))}
    </p>
  );
}

/** Every list as a small ballot slip; the one on show stands proud of the rest. */
export function Picker({ teams, active, onPick }: { teams: Team[]; active: number; onPick: (k: number) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-1" dir="ltr">
      {teams.map((t, k) => {
        const on = k === active;
        return (
          <button
            key={t.slug}
            type="button"
            onClick={() => onPick(k)}
            aria-label={t.name}
            aria-pressed={on}
            title={t.name}
            className={`slip grid h-[2.9rem] w-[2.2rem] place-items-center rounded-md border font-ballot leading-none font-black transition duration-300 ${
              on ? "-translate-y-2 border-ink shadow-[0_12px_20px_-12px_rgb(0_12_31/0.6)]" : "border-line-strong opacity-60 hover:-translate-y-1 hover:opacity-100"
            }`}
            style={{ fontSize: t.letters.length > 2 ? "0.68rem" : "0.92rem" }}
          >
            {t.letters}
          </button>
        );
      })}
    </div>
  );
}
