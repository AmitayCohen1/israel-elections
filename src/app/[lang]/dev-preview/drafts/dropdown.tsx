"use client";

import { useState } from "react";
import Image from "next/image";

type Group = { key: string; label: string; items: { stance: string; quote: string }[] };

/** One quiet dropdown holds the topics; the page shows a single topic's positions at a time. */
export function TopicDropdown({ groups }: { groups: Group[] }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const g = groups[current];

  return (
    <div>
      <div className="relative mx-auto max-w-md">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-4 rounded-[1.5rem] bg-tile/60 px-5 py-3.5 text-start transition hover:bg-tile"
          aria-expanded={open}
        >
          <Image src={`/media/illustrations/topics/${g.key}.png`} alt="" width={200} height={200} className="w-11" />
          <span className="flex-1">
            <span className="block text-lg leading-tight font-medium">{g.label}</span>
            <span className="block text-sm text-muted">{g.items.length} עמדות</span>
          </span>
          <span aria-hidden className={`text-sm text-ink-2 transition ${open ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>
        {open && (
          <ul className="menu-pop absolute inset-x-0 top-full z-10 mt-2 overflow-hidden rounded-[1.5rem] bg-paper py-2 shadow-[0_24px_50px_-24px_rgb(0_12_31/0.35)] ring-1 ring-line">
            {groups.map((t, i) => (
              <li key={t.key}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrent(i);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-5 py-2.5 text-start transition hover:bg-tile/60 ${i === current ? "bg-tile/40" : ""}`}
                >
                  <Image src={`/media/illustrations/topics/${t.key}.png`} alt="" width={200} height={200} className="w-9" />
                  <span className="flex-1 font-medium">{t.label}</span>
                  <span className="text-sm text-muted">{t.items.length}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ul className="mt-12 space-y-10 border-t border-line pt-10">
        {g.items.map((p, i) => (
          <li key={`${g.key}-${i}`}>
            <p className="text-xl leading-snug font-medium text-pretty">{p.stance}</p>
            <blockquote className="mt-3 border-r-2 border-line-strong pr-4 leading-relaxed text-ink-2">”{p.quote}“</blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
}
