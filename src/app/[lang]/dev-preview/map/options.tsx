"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/avatar";

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
  uncoded: { slug: string; name: string }[];
};

function host(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

const POP = 416; // popover width, px
type Open = { slug: string; left: number; top?: number; bottom?: number };

/** Where the popover goes: beside the party that was pressed, below it when there is room and above when there is not, kept inside the window. */
function place(slug: string, el: HTMLElement): Open {
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

/** The topic inside the question sentence: it reads as part of the sentence, and opens a short list of the other topics under it. */
function TopicMenu({
  axes,
  value,
  onChange,
}: {
  axes: AxisData[];
  value: string;
  onChange: (id: string) => void;
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
        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 transition ${show ? "bg-ink text-paper" : "bg-tile hover:bg-mist"}`}
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

/** One thick line with named stops; the parties stack upward from their stop. Pressing a party opens its words right there. */
export function AxisStacks({ axes }: { axes: AxisData[] }) {
  const [id, setId] = useState(axes[0].id);
  const [open, setOpen] = useState<Open | null>(null);
  const pop = useRef<HTMLDivElement>(null);
  const axis = axes.find((a) => a.id === id)!;
  const cell = axis.cells.find((c) => c.slug === open?.slug);
  const cols = {
    gridTemplateColumns: `repeat(${axis.scale.length}, minmax(0, 1fr))`,
  };

  // The popover is pinned to the window, so anything that moves the page under it closes it.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(null);
    const key = (e: KeyboardEvent) => e.key === "Escape" && close();
    const press = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!pop.current?.contains(t) && !t.closest("[data-party]")) close();
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", press);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", key);
      window.removeEventListener("pointerdown", press);
    };
  }, [open]);

  return (
    <div>
      {/* The question is one sentence; the topic in it is the control. */}
      <p className="title flex flex-wrap items-center gap-x-3 gap-y-2 text-2xl sm:text-3xl">
        מה עמדת המפלגות בנושא
        <TopicMenu
          axes={axes}
          value={id}
          onChange={(next) => {
            setId(next);
            setOpen(null);
          }}
        />
      </p>
      <p className="mt-2 max-w-3xl text-lg text-ink-2">{axis.question}</p>

      <div className="min-w-0">
        <div className="mt-12">
          <div className="grid items-end gap-4" style={cols}>
            {axis.scale.map((lv) => (
              <ul
                key={lv.level}
                className="flex flex-col-reverse items-center gap-2 pb-4"
              >
                {axis.cells
                  .filter((c) => c.level === lv.level)
                  .map((c) => {
                    const active = open?.slug === c.slug;
                    return (
                      <li key={c.slug}>
                        <button
                          type="button"
                          data-party
                          onClick={(e) =>
                            setOpen(
                              active ? null : place(c.slug, e.currentTarget),
                            )
                          }
                          aria-expanded={active}
                          className={`inline-flex items-center gap-2.5 rounded-full border py-1 pe-4 ps-1 text-lg transition ${active ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-line-strong"}`}
                        >
                          <Avatar
                            name={c.name}
                            src={c.face}
                            color={c.color}
                            size={30}
                          />
                          {c.name}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            ))}
          </div>
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink"
            />
            <div className="relative grid gap-4" style={cols}>
              {axis.scale.map((lv) => (
                <span
                  key={lv.level}
                  aria-hidden
                  className="mx-auto size-5 rounded-full border-4 border-paper bg-ink"
                />
              ))}
            </div>
          </div>
          <div className="mt-3 grid items-start gap-4" style={cols}>
            {axis.scale.map((lv) => (
              <div key={lv.level} className="text-center">
                <p className="text-xl font-medium leading-tight">{lv.short}</p>
                <p className="mx-auto mt-2 max-w-[17rem] text-base leading-snug text-ink-2">
                  {lv.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-10 max-w-4xl text-base leading-relaxed text-muted">
          אין עמדה מתועדת בשאלה זו ({axis.uncoded.length} מפלגות):{" "}
          {axis.uncoded.map((l) => l.name).join(" · ")}
        </p>
      </div>

      {open && cell && (
        <div
          ref={pop}
          role="dialog"
          aria-label={cell.name}
          className="fixed z-50 max-h-[70vh] overflow-y-auto rounded-[1.75rem] border border-line bg-paper p-6 shadow-[0_18px_40px_-22px_rgb(0_12_31/0.3)]"
          style={{
            left: open.left,
            top: open.top,
            bottom: open.bottom,
            width: `min(${POP}px, calc(100vw - 2rem))`,
          }}
        >
          <p className="text-base font-medium leading-snug">
            {axis.scale.find((s) => s.level === cell.level)?.label}
          </p>
          <blockquote className="mt-3 border-s-2 border-line-strong ps-4 text-lg leading-relaxed text-ink-2">
            {cell.quote}
          </blockquote>
          <span className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <a
              href={cell.source_url}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-4"
              dir="ltr"
            >
              {host(cell.source_url)} ↗
            </a>
            {cell.draft && (
              <span className="rounded-full bg-tile px-3 py-0.5 text-ink-2">
                טיוטה, לא אושר
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
