"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/avatar";
import { TopicIllustration } from "@/components/illustration";
import type { TopicKey } from "@/lib/topics";

export type Cell = {
  slug: string;
  name: string;
  color: string;
  face: string | null;
  order: number;
  level: number;
  quote: string;
  source_url: string;
  draft: boolean;
};
export type AxisData = {
  id: string;
  topic: string;
  short: string;
  question: string;
  /** false when the answers are categories with no order between them: they cannot sit on a line */
  ordered: boolean;
  poles: [string, string] | null;
  scale: { level: number; label: string; short: string }[];
  rules: string[];
  cells: Cell[];
  /** the lists with no coded answer on this question; `main` marks the ones the map never leaves out */
  uncoded: { slug: string; name: string; color: string; face: string | null; main: boolean }[];
};

function host(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

const POP = 520; // popover width, px
type Open = { slug: string; left: number; top?: number; bottom?: number; sheet?: boolean };
const SHEET_BELOW = 1024; // below this the axis runs top to bottom and the words open as a sheet from the bottom

/** Where the popover goes: beside the party that was pressed, below it when there is room and above when there is not, kept inside the window. */
function place(slug: string, el: HTMLElement): Open {
  if (window.innerWidth < SHEET_BELOW) return { slug, left: 0, sheet: true };
  const r = el.getBoundingClientRect();
  const width = Math.min(POP, window.innerWidth - 32);
  const left = Math.max(
    16,
    Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - 16),
  );
  return window.innerHeight - r.bottom > 340
    ? { slug, left, top: r.bottom + 10 }
    : { slug, left, bottom: window.innerHeight - r.top + 10 };
}

/** The topic inside the question sentence: it reads as part of the sentence, and opens a short list of the other topics under it. `idle` is its look at rest (the overview sets it on a grey card). */
export function TopicMenu({
  axes,
  value,
  onChange,
  idle = "bg-tile hover:bg-mist",
}: {
  axes: { id: string; short: string }[];
  value: string;
  onChange: (id: string) => void;
  idle?: string;
}) {
  const [show, setShow] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const current = axes.find((a) => a.id === value)!;

  useEffect(() => {
    if (!show) return;
    const press = (e: PointerEvent) =>
      !root.current?.contains(e.target as Node) && setShow(false);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setShow(false);
    window.addEventListener("pointerdown", press);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("keydown", key);
    };
  }, [show]);

  return (
    <span ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={show}
        onClick={() => setShow((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 transition ${show ? "bg-ink text-paper" : idle}`}
      >
        {current.short}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={`size-5 transition ${show ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {show && (
        <ul
          role="listbox"
          aria-label="נושא"
          className="absolute start-0 top-full z-40 mt-2 w-max min-w-full rounded-[1.5rem] border border-line bg-paper p-1.5 shadow-[0_18px_40px_-22px_rgb(0_12_31/0.3)]"
        >
          {axes.map((a) => {
            const on = a.id === value;
            return (
              <li key={a.id} role="option" aria-selected={on}>
                <button
                  type="button"
                  autoFocus={on}
                  onClick={() => {
                    onChange(a.id);
                    setShow(false);
                  }}
                  className={`flex w-full items-center justify-between gap-6 rounded-2xl px-4 py-2.5 text-start text-xl font-normal transition ${on ? "bg-mist font-medium" : "hover:bg-tile"}`}
                >
                  {a.short}
                  {on && (
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="size-5 text-ink"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12.5 10 17 19 7.5" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </span>
  );
}

/** One thick line with named stops on a grey card (the look of the overview's lead; `className` replaces the card, e.g. when the page sets it on a grey band of its own); the parties stand at their stop as faces. Pressing a party opens its words right there. */
export function AxisStacks({
  axes,
  className = "rounded-[2rem] bg-mist p-6 sm:p-8",
  chart,
  quiet = false,
  art = quiet,
}: {
  axes: AxisData[];
  className?: string;
  /**
   * Heads the map like a chart: the question, the topic picker across from it and a rule under them, with no hint.
   * A string is a small name over the question too, for a page where the map is one part of many, which also leaves out the footnote.
   */
  chart?: string | boolean;
  /** Leaves out the hint and the footnote and centres the head, for a page that heads the map itself. */
  quiet?: boolean;
  /** The topic's picture over the question; on with `quiet` unless turned off. */
  art?: boolean;
}) {
  const [id, setId] = useState(axes[0].id);
  const [open, setOpen] = useState<Open | null>(null);
  const pop = useRef<HTMLDivElement>(null);
  // A link can name the question to open on (the overview does): /map#security-gaza.
  useEffect(() => {
    const asked = window.location.hash.slice(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (axes.some((a) => a.id === asked)) setId(asked);
  }, [axes]);
  const axis = axes.find((a) => a.id === id)!;
  const named = typeof chart === "string";
  const cell = axis.cells.find((c) => c.slug === open?.slug);
  const cols = {
    gridTemplateColumns: `repeat(${axis.scale.length}, minmax(0, 1fr))`,
  };

  // The popover is pinned to the window, so anything that moves the page under it closes it.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(null);
    const width = window.innerWidth;
    const onScroll = (e: Event) => !pop.current?.contains(e.target as Node) && close();
    const onResize = () => window.innerWidth !== width && close();
    const key = (e: KeyboardEvent) => e.key === "Escape" && close();
    const press = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!pop.current?.contains(t) && !t.closest("[data-party]")) close();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", press);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", key);
      window.removeEventListener("pointerdown", press);
    };
  }, [open]);

  // A party at its stop is its leader's face, as on the overview; its name leads the words that open.
  const chip = (c: Cell) => {
    const active = open?.slug === c.slug;
    return (
      <button
        type="button"
        data-party
        onClick={(e) => setOpen(active ? null : place(c.slug, e.currentTarget))}
        aria-expanded={active}
        aria-label={c.name}
        title={c.name}
        className={`block cursor-pointer rounded-full ring-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${active ? "ring-ink ring-offset-2 ring-offset-mist" : "ring-paper hover:-translate-y-0.5 hover:ring-ink"}`}
      >
        <Avatar name={c.name} src={c.face} color={c.color} size={52} />
      </button>
    );
  };

  return (
    <div className={className}>
      {chart ? (
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-line-strong pb-6">
          <div className="min-w-0 max-w-3xl">
            {named && <h2 className="text-base font-medium tracking-wide text-muted">{chart}</h2>}
            <p className="title mt-1 text-2xl leading-snug sm:text-[1.75rem]">{axis.question}</p>
          </div>
          <TopicMenu axes={axes} value={id} onChange={(next) => (setId(next), setOpen(null))} idle="bg-paper hover:bg-mist-deep" />
        </div>
      ) : (
        <div className={quiet ? "flex flex-col items-center text-center" : ""}>
          {art && <TopicIllustration key={axis.topic} topic={axis.topic as TopicKey} className="dot-in !w-24 sm:!w-32" />}
          <div className={`min-w-0 ${art ? "mt-4" : ""}`}>
            {/* The question is one sentence; the topic in it is the control. */}
            <p className={`title flex flex-wrap items-center gap-x-3 gap-y-2 text-2xl sm:text-3xl ${quiet ? "justify-center" : ""}`}>
              מה עמדת המפלגות בנושא
              <TopicMenu
                axes={axes}
                value={id}
                onChange={(next) => {
                  setId(next);
                  setOpen(null);
                }}
                idle="bg-paper hover:bg-mist-deep"
              />
            </p>
            <p className={`mt-2 max-w-3xl text-xl text-ink-2 ${quiet ? "mx-auto text-balance" : ""}`}>{axis.question}</p>
            {!quiet && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-paper px-4 py-1.5 text-lg font-medium text-ink">
                <span aria-hidden>👆</span> לחצו על מפלגה כדי לקרוא את הציטוט שלה
              </p>
            )}
          </div>
        </div>
      )}

      <div className="min-w-0">
        {/* Phones and tablets: the axis runs top to bottom, each stop a section with its parties wrapped beneath. */}
        <ol className={`relative border-s-4 border-ink ps-6 lg:hidden ${quiet ? "mt-14" : "mt-8"}`}>
          {axis.scale.map((lv) => (
            <li key={lv.level} className="relative pb-9 last:pb-0">
              <span aria-hidden className="absolute -start-[2.2rem] top-1.5 size-5 rounded-full border-4 border-mist bg-ink" />
              <p className="text-xl font-medium leading-tight">{lv.short}</p>
              <p className="mt-1 text-lg leading-snug text-ink-2">{lv.label}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {axis.cells
                  .filter((c) => c.level === lv.level)
                  .map((c) => (
                    <li key={c.slug}>{chip(c)}</li>
                  ))}
              </ul>
            </li>
          ))}
        </ol>

        <div className={`hidden lg:block ${chart || quiet ? "mt-24" : "mt-12"}`}>
          <div className="grid items-end gap-4" style={cols}>
            {axis.scale.map((lv) => (
              <ul key={lv.level} className="flex flex-wrap justify-center gap-2 pb-4">
                {axis.cells
                  .filter((c) => c.level === lv.level)
                  .map((c) => (
                    <li key={c.slug}>{chip(c)}</li>
                  ))}
              </ul>
            ))}
          </div>
          <div className="relative">
            <div aria-hidden className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink" />
            <div className="relative grid gap-4" style={cols}>
              {axis.scale.map((lv) => (
                <span key={lv.level} aria-hidden className="mx-auto size-5 rounded-full border-4 border-mist bg-ink" />
              ))}
            </div>
          </div>
          <div className="mt-3 grid items-start gap-4" style={cols}>
            {axis.scale.map((lv) => (
              <div key={lv.level} className="text-center">
                <p className="text-xl font-medium leading-tight">{lv.short}</p>
                <p className="mx-auto mt-2 max-w-[17rem] text-base leading-snug text-ink-2">{lv.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* A main list is never missing from the map: with no coded answer here, it stands under the line, greyed, and says so. */}
        {axis.uncoded.some((l) => l.main) && (
          <div className={`mt-10 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line-strong pt-5 ${quiet ? "justify-center" : ""}`}>
            <p className="text-base text-ink-2">עוד לא מצאנו עמדה מצוטטת בשאלה זו:</p>
            <ul className="flex flex-wrap gap-2">
              {axis.uncoded
                .filter((l) => l.main)
                .map((l) => (
                  <li key={l.slug} title={l.name} className="flex items-center gap-2 rounded-full bg-paper/70 py-1 ps-1 pe-3 text-base text-ink-2">
                    <Avatar name={l.name} src={l.face} color={l.color} size={32} className="opacity-70 grayscale" />
                    {l.name}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {!named && !quiet && (
          <p className="mt-10 max-w-4xl text-base leading-relaxed text-ink-2">
            טרם סיווגנו בשאלה זו ({axis.uncoded.length} מפלגות):{" "}
            {axis.uncoded.map((l) => l.name).join(" · ")}
          </p>
        )}
      </div>

      {open && cell && (
        <div
          ref={pop}
          role="dialog"
          aria-label={cell.name}
          className={`fixed z-50 overflow-y-auto border border-line-strong bg-paper shadow-[0_24px_50px_-20px_rgb(0_12_31/0.4)] ${open.sheet ? "inset-x-0 bottom-0 max-h-[75dvh] rounded-t-[1.75rem] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-7" : "max-h-[75vh] rounded-[1.75rem] p-7"}`}
          style={open.sheet ? undefined : { left: open.left, top: open.top, bottom: open.bottom, width: `min(${POP}px, calc(100vw - 2rem))` }}
        >
          {open.sheet && (
            <button type="button" onClick={() => setOpen(null)} aria-label="סגירה" className="absolute end-4 top-4 grid size-11 place-items-center rounded-full bg-tile text-2xl hover:bg-mist">
              ×
            </button>
          )}
          <p className={`flex items-center gap-3 text-xl font-medium ${open.sheet ? "pe-12" : ""}`}>
            <Avatar name={cell.name} src={cell.face} color={cell.color} size={44} />
            {cell.name}
          </p>
          <p className="title mt-4 text-2xl leading-snug">{axis.scale.find((s) => s.level === cell.level)?.label}</p>
          <blockquote className="mt-4 border-s-4 border-line-strong ps-5 text-xl leading-relaxed text-ink">
            {cell.quote}
          </blockquote>
          <span className="mt-5 flex flex-wrap items-center gap-3 text-lg">
            <a
              href={cell.source_url}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-4"
              dir="auto"
            >
              למקור המלא · {host(cell.source_url)} ↗
            </a>
            {cell.draft && (
              <span className="rounded-full bg-tile px-3 py-1 text-ink-2">
                טיוטה, לא אושר
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

/** The map at full size: a grey band from edge to edge with the map bare on it, all centred. `label` is a small name over it, `top` whatever goes first (the map page's tabs); the page sets the height in `className`. */
export function MapBand({ axes, label, top, art = true, className = "", ...rest }: { axes: AxisData[]; label?: string; top?: React.ReactNode; art?: boolean; className?: string } & React.HTMLAttributes<HTMLElement>) {
  return (
    <section {...rest} className={`flex flex-col justify-center bg-mist ${className}`}>
      {/* A classic centred block: the label, the picture and the question on the middle line, the axis under them. */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-8">
        {top}
        {label && <h2 className="mb-6 text-center text-lg font-medium text-ink-2">{label}</h2>}
        <AxisStacks axes={axes} quiet art={art} />
      </div>
    </section>
  );
}
