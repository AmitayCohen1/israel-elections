"use client";

import { useState } from "react";

export type ReaderItem = { id: string; mark: React.ReactNode; name: string; gist: string | null; panel: React.ReactNode };

/** A reading pane: the parties as a column of equal rows, the selected one's full text beside it. */
export function Reader({ items }: { items: ReaderItem[] }) {
  const [current, setCurrent] = useState(items[0]?.id);
  const item = items.find((i) => i.id === current) ?? items[0];
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[22rem_1fr]">
      <ul className="max-h-[40rem] space-y-1 overflow-y-auto rounded-[2rem] bg-mist p-3">
        {items.map((i) => (
          <li key={i.id}>
            <button
              type="button"
              onClick={() => setCurrent(i.id)}
              aria-current={i.id === current}
              className={`flex w-full items-center gap-3 rounded-[1.4rem] p-3 text-start transition ${i.id === current ? "bg-paper shadow-[0_14px_30px_-24px_rgb(0_12_31/0.35)]" : "hover:bg-paper/60"}`}
            >
              <span className="grid size-12 shrink-0 place-items-center">{i.mark}</span>
              <span className="min-w-0">
                <span className="title block text-lg">{i.name}</span>
                {i.gist && <span className="block truncate text-base text-ink-2">{i.gist}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="min-h-[24rem] rounded-[2rem] bg-mist p-8 sm:p-10">{item.panel}</div>
    </div>
  );
}
