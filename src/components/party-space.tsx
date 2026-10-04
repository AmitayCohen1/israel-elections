"use client";

import { useState } from "react";
import { useMessages } from "@/i18n/link";
import { m } from "@/i18n/messages/games";
import { Avatar } from "@/components/avatar";
import type { QParty } from "@/lib/match";
import type { SpacePoint } from "@/lib/space";

const PAD = 0.08; // room at the edges for the faces and names, as a share of the box

/** One way to read the map: all the questions, or a single topic's. */
export type SpaceView = { id: string; label: string; questions: string[]; points: SpacePoint[] };

/** Where each party sits in a view, as percentages of the box. */
function place(points: SpacePoint[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const w = x1 - x0 || 1;
  const h = y1 - y0 || 1;
  return new Map(points.map((p) => [p.slug, { left: (PAD + ((p.x - x0) / w) * (1 - 2 * PAD)) * 100, top: (PAD + ((p.y - y0) / h) * (1 - 2 * PAD)) * 100 }]));
}

/**
 * The closeness map: each party a face, placed so that near means "answered alike". A topic redraws it from that topic's
 * questions alone, and the faces glide there, so parties close on one topic and far on another visibly part. Pressing a
 * party draws lines to its closest and lists its closest on every topic.
 */
export function PartySpace({ views, parties }: { views: SpaceView[]; parties: QParty[] }) {
  const t = useMessages(m).space;
  const [viewId, setViewId] = useState(views[0].id);
  const [on, setOn] = useState<string | null>(null);
  const view = views.find((v) => v.id === viewId)!;
  const by = new Map(parties.map((p) => [p.slug, p]));

  // Every party that shows in any view stays on the page; one with no position in this view fades out where it last was.
  const all = place(views[0].points);
  const here = place(view.points);
  const slugs = [...new Set(views.flatMap((v) => v.points.map((p) => p.slug)))];
  const last = new Map(slugs.map((s) => [s, here.get(s) ?? all.get(s) ?? { left: 50, top: 50 }]));

  const sel = view.points.find((p) => p.slug === on);
  const near = new Set(sel?.near.map((n) => n.slug));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2" role="group">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setViewId(v.id)}
            aria-pressed={v.id === viewId}
            className={`rounded-full px-5 py-2.5 text-lg transition ${v.id === viewId ? "bg-ink text-paper" : "bg-mist hover:bg-mist-deep"}`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <p className="mb-5 min-h-7 text-lg text-ink-2">{view.questions.length > 0 ? `${t.basedOn} ${view.questions.join(" · ")}` : t.few}</p>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] lg:items-start">
        {/* One box for every topic, so the faces glide between layouts instead of the box jumping; taller on phones so they have room. */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-tile sm:aspect-[3/2]">
          <svg key={viewId + on} className="pointer-events-none absolute inset-0 size-full animate-[fade_0.4s_0.5s_both]" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {sel &&
              sel.near.map((n) => {
                const a = here.get(sel.slug)!;
                const b = here.get(n.slug)!;
                return <line key={n.slug} x1={a.left} y1={a.top} x2={b.left} y2={b.top} stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" className="text-ink/40" />;
              })}
          </svg>
          {slugs.map((slug) => {
            const party = by.get(slug)!;
            const { left, top } = last.get(slug)!;
            const absent = !here.has(slug);
            const dim = absent || (sel && slug !== on && !near.has(slug));
            return (
              <button
                key={slug}
                type="button"
                onClick={() => setOn(on === slug ? null : slug)}
                aria-pressed={on === slug}
                tabIndex={absent ? -1 : undefined}
                aria-hidden={absent || undefined}
                className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 transition-[left,top,opacity] duration-700 ease-in-out ${absent ? "pointer-events-none opacity-0" : dim ? "opacity-25" : ""} ${on === slug ? "z-10" : ""}`}
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <span className={`rounded-full p-0.5 ${on === slug ? "bg-ink" : "bg-paper"}`}>
                  <Avatar name={party.name} src={party.face} color={party.color} size={40} />
                </span>
                {/* On phones only the pressed party and its closest carry names; the rest would cover each other. */}
                <span className={`max-w-32 truncate rounded-full bg-paper/90 px-2 text-base leading-snug ${on === slug || near.has(slug) ? "" : "max-sm:hidden"}`}>{party.name}</span>
              </button>
            );
          })}
        </div>

        <aside>
          {on ? (
            <>
              <h2 className="title text-2xl">{by.get(on)!.name}</h2>
              {sel ? (
                <>
                  <p className="mt-1 text-lg text-ink-2">
                    {t.nearest} · {view.label}
                  </p>
                  <ul className="mt-3 divide-y divide-line">
                    {sel.near.map((n) => (
                      <Row key={n.slug} party={by.get(n.slug)!} close={n.close} note={t.shared(n.shared)} />
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-1 text-lg text-ink-2">{t.notHere}</p>
              )}
              <p className="mt-6 text-lg font-medium">{t.byTopic}</p>
              <ul className="mt-2 divide-y divide-line">
                {views.slice(1).map((v) => {
                  const top = v.points.find((p) => p.slug === on)?.near[0];
                  return (
                    <li key={v.id}>
                      <button type="button" onClick={() => setViewId(v.id)} className={`flex w-full items-center gap-3 py-2.5 text-start ${v.id === viewId ? "font-medium" : ""}`}>
                        <span className="w-32 shrink-0 text-lg">{v.label}</span>
                        {top ? (
                          <>
                            <span className="min-w-0 flex-1 truncate text-lg text-ink-2">{by.get(top.slug)!.name}</span>
                            <span className="text-lg tabular-nums">{Math.round(top.close * 100)}%</span>
                          </>
                        ) : (
                          <span className="flex-1 text-lg text-muted">—</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="text-lg text-ink-2">{view.id === "all" ? t.pick : t.fewTopic}</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ party, close, note }: { party: QParty; close: number; note: string }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <Avatar name={party.name} src={party.face} color={party.color} size={36} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-lg">{party.name}</span>
        <span className="block text-base text-ink-2">{note}</span>
      </span>
      <span className="text-lg tabular-nums">{Math.round(close * 100)}%</span>
    </li>
  );
}
