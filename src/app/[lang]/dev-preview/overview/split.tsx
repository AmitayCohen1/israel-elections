"use client";

import Link from "@/i18n/link";
import { useState } from "react";

export type SplitTopic = { key: string; label: string; art: React.ReactNode; rows: { id: string; name: string; gist: string | null; mark: React.ReactNode }[] };

/** Option B: the topics down one side, and what the lists said on the chosen one beside them. */
export function Split({ topics }: { topics: SplitTopic[] }) {
  const [key, setKey] = useState(topics[0].key);
  const t = topics.find((x) => x.key === key) ?? topics[0];
  return (
    <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <div role="tablist" className="grid content-start gap-1">
        {topics.map((x) => (
          <button key={x.key} role="tab" aria-selected={x.key === key} onClick={() => setKey(x.key)} className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-start transition ${x.key === key ? "bg-mist" : "hover:bg-mist/60"}`}>
            <span className="w-10 shrink-0">{x.art}</span>
            <span className="title flex-1 text-lg">{x.label}</span>
            <span className="text-sm text-ink-2 tabular-nums">{x.rows.length}</span>
          </button>
        ))}
      </div>
      <div className="rounded-[2rem] bg-mist p-6">
        <div className="flex items-baseline justify-between">
          <h3 className="serif text-5xl leading-none">{t.label}</h3>
          <Link href={`/topics#${t.key}`} className="text-sm text-ink-2 underline-offset-4 hover:text-ink hover:underline">
            כל {t.rows.length} הרשימות ←
          </Link>
        </div>
        <ul className="mt-5 grid gap-1 md:grid-cols-2">
          {t.rows.slice(0, 6).map((r) => (
            <li key={r.id}>
              <Link href={`/topics#${t.key}:${r.id}`} className="flex items-start gap-3 rounded-2xl px-2 py-2 transition hover:bg-paper">
                <span className="mt-0.5 grid size-11 shrink-0 place-items-center">{r.mark}</span>
                <span className="min-w-0">
                  <span className="title block text-base leading-tight">{r.name}</span>
                  {r.gist && <span className="mt-0.5 line-clamp-2 block text-sm leading-snug text-ink-2">{r.gist}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
