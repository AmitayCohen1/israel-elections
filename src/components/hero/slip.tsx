"use client";

import Link from "@/i18n/link";
import type { Team } from "@/lib/showcase";
import { Picker, Portrait, Proposal, useCycle } from "./cycle";

// Where each slot sits: angle from straight up (degrees), radius (rem), diameter (rem).
// Slot 1 is directly above the slip; even slots go to its right, odd to its left (the page reads right to left).
const R1 = 12.25;
const R2 = 18.25;
const SEATS: [number, number, number][] = [
  [0, R1, 6],
  [33, R1, 4.75],
  [-33, R1, 4.75],
  [66, R1, 4.75],
  [-66, R1, 4.75],
  [0, R2, 3.75],
  [24, R2, 3.75],
  [-24, R2, 3.75],
  [48, R2, 3.75],
  [-48, R2, 3.75],
  [72, R2, 3.75],
  [-72, R2, 3.75],
];

/**
 * What only this election has: you don't pick a person, you pick a paper slip from a tray.
 * A slip lifts out of the tray and opens up — the people behind it fan out in slot order, and a line
 * of what the list proposes writes itself underneath. Then the next slip. Any slip in the tray can be picked.
 */
export function HeroSlip({ teams }: { teams: Team[] }) {
  const { idx, target, phase, pick, hover } = useCycle(teams.length);
  const team = teams[idx];
  const out = phase === "show";

  return (
    <div className="mx-auto w-full max-w-[41rem]" {...hover}>
      {/* The slip and the people behind it */}
      <div className="relative h-[26.5rem]" dir="ltr">
        {[R1, R2].map((r) => (
          <span
            key={r}
            aria-hidden
            className="absolute rounded-full border border-dashed border-ink/12 [clip-path:inset(0_0_47%_0)]"
            style={{ width: `${r * 2}rem`, height: `${r * 2}rem`, left: "50%", top: "20.5rem", transform: "translate(-50%, -50%)" }}
          />
        ))}

        {team.people.slice(0, SEATS.length).map((p, k) => {
          const [deg, r, d] = SEATS[k];
          const rad = (deg * Math.PI) / 180;
          // Rounded so the server and the browser print the same style.
          const x = +(Math.sin(rad) * r).toFixed(3);
          const y = +(-Math.cos(rad) * r).toFixed(3);
          return (
            <Link
              key={`${team.slug}-${p.slot}`}
              href={p.href}
              title={p.name}
              tabIndex={out ? 0 : -1}
              className="group absolute top-[20.5rem] left-1/2"
              style={{
                width: `${d}rem`,
                height: `${d}rem`,
                fontSize: `${+(d * 0.27).toFixed(3)}rem`,
                transform: out ? `translate(-50%, -50%) translate(${x}rem, ${y}rem)` : "translate(-50%, -50%) scale(0.25)",
                opacity: out ? 1 : 0,
                transition: out ? "transform 0.75s cubic-bezier(0.2, 1.25, 0.35, 1), opacity 0.35s ease" : "transform 0.4s ease-in, opacity 0.3s ease-in",
                transitionDelay: out ? `${k * 45}ms` : "0ms",
                zIndex: 12 - k,
              }}
            >
              <span className="relative block size-full overflow-hidden rounded-full bg-tile shadow-[0_14px_28px_-14px_rgb(0_12_31/0.55)] ring-[3px] ring-paper transition duration-300 group-hover:scale-110">
                <Portrait p={p} sizes="112px" />
              </span>
              <span className="serif absolute -right-0.5 -bottom-0.5 grid size-[34%] place-items-center rounded-full bg-ink text-[0.7em] text-white tabular-nums">{p.slot}</span>
            </Link>
          );
        })}

        <Link href={`/lists/${team.slug}`} className="absolute top-[20.5rem] left-1/2 block -translate-x-1/2 -translate-y-1/2 [perspective:900px]" aria-label={team.name} style={{ zIndex: 20 }}>
          <span
            key={team.slug}
            className="slip-turn slip grid h-[11rem] w-[8.5rem] place-items-center rounded-xl border border-line-strong shadow-[0_2px_0_rgb(0_12_31/0.04),0_30px_50px_-26px_rgb(0_12_31/0.5)]"
          >
            <span className="font-ballot leading-none font-black" style={{ fontSize: team.letters.length > 2 ? "3.4rem" : "4.6rem" }}>
              {team.letters}
            </span>
          </span>
        </Link>
      </div>

      {/* Who they are, and one thing they propose */}
      <div className="mt-5 min-h-[7.75rem] text-center">
        <Link href={`/lists/${team.slug}`} key={team.slug} className="word-in title text-[2.25rem] underline-offset-8 hover:underline">
          {team.name}
        </Link>
        <Proposal team={team} className="mx-auto mt-2 max-w-[34rem] text-xl leading-snug" />
      </div>

      {/* The tray: every slip, pick one */}
      <div className="mt-4">
        <Picker teams={teams} active={target} onPick={pick} />
        <div aria-hidden className="mx-auto -mt-1.5 h-3 max-w-[39rem] rounded-b-2xl bg-tile shadow-[inset_0_2px_3px_rgb(0_12_31/0.08)]" />
      </div>
    </div>
  );
}
