"use client";

import { useEffect, useRef, useState } from "react";
import type { CompareRow, CompareTopic } from "@/components/party-compare";

type Props = { rows: CompareRow[]; topics: CompareTopic[] };
const MAX = 3;

/** Two of the larger lists, at random on every visit. */
function useDefaults(rows: CompareRow[]) {
  const [picked, setPicked] = useState<string[]>([]);
  useEffect(() => {
    const wrote = rows.filter((r) => r.wrote !== false);
    const pool = wrote.filter((r) => r.main).length >= 2 ? wrote.filter((r) => r.main) : wrote;
    const ids = pool.map((r) => r.slug);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPicked(ids.slice(0, 2));
  }, [rows]);
  return [picked, setPicked] as const;
}

/** The result every picker feeds: the quick table, a line per list per topic. */
function MiniTable({ rows, topics, picked, head, tail }: Props & { picked: string[]; head?: (r: CompareRow, i: number) => React.ReactNode; tail?: React.ReactNode }) {
  const selected = picked.flatMap((s) => rows.find((r) => r.slug === s) ?? []);
  if (!selected.length && !tail) return <p className="mt-10 text-center text-xl text-ink-2">בחרו רשימה כדי להתחיל.</p>;
  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[48rem] border-collapse">
        <thead>
          <tr>
            <td className="w-56" />
            {selected.map((r, i) => (
              <th key={r.slug} scope="col" className="px-2 pb-4 text-start font-normal">
                {head ? (
                  head(r, i)
                ) : (
                  <span className="flex items-center gap-3">
                    <span className="grid size-12 shrink-0 place-items-center">{r.mark}</span>
                    <span className="title text-2xl">{r.name}</span>
                  </span>
                )}
              </th>
            ))}
            {tail && <th className="px-2 pb-4 text-start font-normal">{tail}</th>}
          </tr>
        </thead>
        <tbody>
          {topics.map((t) => (
            <tr key={t.key} className="border-t border-ink/10 align-top">
              <th scope="row" className="py-5 pe-4 text-start font-normal">
                <span className="flex items-center gap-3">
                  <span className="grid size-20 shrink-0 place-items-center">{t.icon}</span>
                  <span className="text-lg leading-tight font-medium">{t.label}</span>
                </span>
              </th>
              {selected.map((r) => (
                <td key={r.slug} className="px-3 py-5 text-lg leading-snug">
                  {r.cells[t.key] ? (
                    <>
                      <p className="font-medium text-pretty">{r.cells[t.key]!.gist}</p>
                      <div className="mt-3">{r.cells[t.key]!.detail}</div>
                    </>
                  ) : (
                    <span className="text-ink/35">לא מצאנו עמדה</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** C: a sentence with the blanks filled by plain selects. */
export function PickerSentence({ rows, topics }: Props) {
  const [picked, setPicked] = useDefaults(rows);
  const set = (i: number, slug: string) => setPicked((p) => p.map((s, j) => (j === i ? slug : s)));
  const select = "h-12 rounded-full bg-tile px-5 text-lg font-medium outline-none ring-1 ring-transparent transition focus:ring-ink/40";
  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-xl text-ink-2">
        <span>אני מתלבט בין</span>
        {picked.map((slug, i) => (
          <span key={i} className="flex items-center gap-3">
            {i > 0 && <span>{i === picked.length - 1 ? "לבין" : "ובין"}</span>}
            <select value={slug} onChange={(e) => set(i, e.target.value)} className={select}>
              {rows.map((r) => (
                <option key={r.slug} value={r.slug} disabled={picked.includes(r.slug) && r.slug !== slug}>
                  {r.name}
                </option>
              ))}
            </select>
          </span>
        ))}
        {picked.length < MAX && (
          <button type="button" onClick={() => setPicked((p) => [...p, rows.find((r) => !p.includes(r.slug))?.slug ?? p[0]])} className="text-base font-semibold text-accent underline-offset-4 hover:underline">
            + עוד אחת
          </button>
        )}
        {picked.length > 2 && (
          <button type="button" onClick={() => setPicked((p) => p.slice(0, -1))} className="text-base text-ink-2 underline-offset-4 hover:underline">
            הסרה
          </button>
        )}
      </div>
      <MiniTable rows={rows} topics={topics} picked={picked} />
    </div>
  );
}

/** I: no choosing at all. Press for a new pair, lock the one you want to keep. */
export function PickerShuffle({ rows, topics }: Props) {
  const [picked, setPicked] = useDefaults(rows);
  const [locked, setLocked] = useState<boolean[]>([false, false]);
  const duo = picked.slice(0, 2);
  const shuffle = () =>
    setPicked((p) => {
      const out = [...p];
      for (let i = 0; i < 2; i++) {
        if (locked[i]) continue;
        const free = rows.filter((r) => !out.includes(r.slug));
        if (free.length) out[i] = free[Math.floor(Math.random() * free.length)].slug;
      }
      return out;
    });
  return (
    <div>
      <div className="mx-auto flex max-w-2xl items-start justify-center gap-6 sm:gap-10">
        {duo.map((slug, i) => {
          const r = rows.find((x) => x.slug === slug);
          return (
            <div key={i} className="flex flex-1 flex-col items-center text-center">
              <span className="grid size-28 place-items-center">{r?.markLg ?? r?.mark}</span>
              <span className="title mt-3 text-2xl">{r?.name}</span>
              <button
                type="button"
                aria-pressed={locked[i]}
                onClick={() => setLocked((l) => l.map((v, j) => (j === i ? !v : v)))}
                className={`mt-3 rounded-full px-4 py-1.5 text-base font-medium transition ${locked[i] ? "bg-ink text-paper" : "bg-tile hover:bg-line"}`}
              >
                {locked[i] ? "נעולה" : "נעלו"}
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex justify-center">
        <button type="button" onClick={shuffle} className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-base font-bold text-white transition hover:bg-accent">
          <span aria-hidden>↻</span> ערבבו זוג חדש
        </button>
      </div>
      <MiniTable rows={rows} topics={topics} picked={duo} />
    </div>
  );
}

const box = "size-4 shrink-0 accent-[#0b1f3a]";

/** J: the classic filter dropdown. One button, a panel with a search box and a checkbox per list. */
export function PickerCheckboxMenu({ rows, topics }: Props) {
  const [picked, setPicked] = useDefaults(rows);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  const shown = rows.filter((r) => r.name.includes(q.trim()));
  const toggle = (slug: string) => setPicked((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : p.length < MAX ? [...p, slug] : p));
  return (
    <div>
      <div ref={wrap} className="relative flex flex-wrap items-center gap-2">
        <span className="text-xl whitespace-nowrap text-ink">אני מתלבט בין</span>
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink/20 bg-paper px-4 text-base font-medium hover:border-ink/40">
          רשימות {picked.length > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-ink px-1.5 text-base text-paper">{picked.length}</span>} <span aria-hidden>▾</span>
        </button>
        {picked.map((slug) => (
          <span key={slug} className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-tile ps-1.5 pe-1 text-base">
            <span className="grid size-8 shrink-0 place-items-center">{rows.find((r) => r.slug === slug)?.markSm ?? rows.find((r) => r.slug === slug)?.mark}</span>
            {rows.find((r) => r.slug === slug)?.name}
            <button type="button" aria-label="הסרה" onClick={() => toggle(slug)} className="grid size-7 place-items-center rounded-full text-ink-2 hover:bg-paper hover:text-ink">
              ×
            </button>
          </span>
        ))}
        {picked.length > 0 && (
          <button type="button" onClick={() => setPicked([])} className="text-base text-ink-2 underline-offset-4 hover:underline">
            ניקוי
          </button>
        )}
        {open && (
          <div className="menu-pop absolute start-0 top-full z-20 mt-1 w-72 rounded-xl bg-paper p-2 shadow-[0_24px_60px_-24px_rgb(0_12_31/0.4)] ring-1 ring-ink/10">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש רשימה..." aria-label="חיפוש רשימה" className="h-9 w-full rounded-lg border border-ink/20 px-3 text-base outline-none focus:border-ink" />
            <ul className="mt-2 max-h-64 overflow-y-auto">
              {shown.map((r) => {
                const on = picked.includes(r.slug);
                return (
                  <li key={r.slug}>
                    <label className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-tile/60 ${!on && picked.length >= MAX ? "opacity-40" : ""}`}>
                      <input type="checkbox" checked={on} disabled={!on && picked.length >= MAX} onChange={() => toggle(r.slug)} className={box} />
                      <span className="grid size-8 shrink-0 place-items-center">{r.markSm ?? r.mark}</span>
                      <span className="text-base">{r.name}</span>
                    </label>
                  </li>
                );
              })}
              {shown.length === 0 && <li className="px-2 py-3 text-base text-ink-2">לא נמצאה רשימה.</li>}
            </ul>
            {picked.length >= MAX && <p className="px-2 pt-2 text-base text-muted">אפשר להשוות עד {MAX} רשימות.</p>}
          </div>
        )}
      </div>
      <MiniTable rows={rows} topics={topics} picked={picked} />
    </div>
  );
}

/** K: classic filter pills. Text only, all visible, a search box that narrows them. */
export function PickerPills({ rows, topics }: Props) {
  const [picked, setPicked] = useDefaults(rows);
  const [q, setQ] = useState("");
  const toggle = (slug: string) => setPicked((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : p.length < MAX ? [...p, slug] : p));
  const shown = rows.filter((r) => r.name.includes(q.trim()));
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="סינון רשימות..." aria-label="סינון רשימות" className="h-9 w-48 rounded-lg border border-ink/20 px-3 text-base outline-none focus:border-ink" />
        <span className="text-base text-muted">
          {picked.length} מתוך {MAX} נבחרו
        </span>
        {picked.length > 0 && (
          <button type="button" onClick={() => setPicked([])} className="text-base text-ink-2 underline-offset-4 hover:underline">
            ניקוי
          </button>
        )}
      </div>
      <div className="mt-3 flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
        {shown.map((r) => {
          const on = picked.includes(r.slug);
          return (
            <button
              key={r.slug}
              type="button"
              aria-pressed={on}
              disabled={!on && picked.length >= MAX}
              onClick={() => toggle(r.slug)}
              className={`h-8 rounded-full px-3 text-base font-medium transition disabled:opacity-40 ${on ? "bg-ink text-paper" : "bg-tile hover:bg-line"}`}
            >
              {r.name}
            </button>
          );
        })}
      </div>
      <MiniTable rows={rows} topics={topics} picked={picked} />
    </div>
  );
}
