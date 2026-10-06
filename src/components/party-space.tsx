"use client";

import { useState } from "react";
import { useMessages } from "@/i18n/link";
import { m } from "@/i18n/messages/games";
import { Avatar } from "@/components/avatar";
import { distance, type QAxis, type QParty } from "@/lib/match";
import type { SpacePoint } from "@/lib/space";

// A face and its name need this much of the box to themselves, in percent of its width and height.
const BOX_W = 12;
const BOX_H = 18;
const EDGE = { x0: 7, x1: 93, y0: 8, y1: 86 }; // the name hangs under the face, so the bottom keeps more room
const LINES = 4; // the pressed party is joined to this many of its closest

/** One way to read the map: all the questions, or a single topic's. `axes` are the questions it is drawn from. */
export type SpaceView = { id: string; label: string; questions: string[]; axes: QAxis[]; points: SpacePoint[] };

type At = { left: number; top: number };

/** Where each party sits in a view, as percentages of the box, nudged apart until no name sits on another face. */
function place(points: SpacePoint[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const w = x1 - x0 || 1;
  const h = y1 - y0 || 1;
  const P: At[] = points.map((p) => ({ left: EDGE.x0 + ((p.x - x0) / w) * (EDGE.x1 - EDGE.x0), top: EDGE.y0 + ((p.y - y0) / h) * (EDGE.y1 - EDGE.y0) }));
  // A topic can show more parties than fit at full size: then each gets less room, so they still part instead of piling up.
  const fit = Math.min(1, Math.sqrt((0.5 * (EDGE.x1 - EDGE.x0 + BOX_W) * (EDGE.y1 - EDGE.y0 + BOX_H)) / (P.length * BOX_W * BOX_H)));
  const [bw, bh] = [BOX_W * fit, BOX_H * fit];
  for (let it = 0; it < 600; it++) {
    let moved = false;
    for (let i = 0; i < P.length; i++)
      for (let j = i + 1; j < P.length; j++) {
        const dx = P[j].left - P[i].left;
        const dy = P[j].top - P[i].top;
        const ox = bw - Math.abs(dx);
        const oy = bh - Math.abs(dy);
        if (ox <= 0.01 || oy <= 0.01) continue;
        // Part them along the side where they overlap less, so the picture changes as little as possible.
        if (ox / bw < oy / bh) {
          const push = (ox / 2) * (dx < 0 ? -1 : 1);
          P[i].left -= push;
          P[j].left += push;
        } else {
          const push = (oy / 2) * (dy < 0 ? -1 : 1);
          P[i].top -= push;
          P[j].top += push;
        }
        moved = true;
      }
    for (const p of P) {
      p.left = Math.min(EDGE.x1, Math.max(EDGE.x0, p.left));
      p.top = Math.min(EDGE.y1, Math.max(EDGE.y0, p.top));
    }
    if (!moved) break;
  }
  return new Map(points.map((p, i) => [p.slug, P[i]]));
}

const pct = (close: number) => `${Math.round(close * 100)}%`;

/**
 * The closeness map with its side list. The map is only faces and names on a white card, placed so that near means
 * "answered alike"; a topic redraws it from that topic's questions alone, and the faces glide there. The side list names
 * every party on the map. Pressing a party, there or on the map, joins it to its closest with thin lines, lets the far ones
 * step back, and turns the list into its ranking: every other party from the closest down, each row opening to say why,
 * what the two agree on and where they differ. On wide screens the two share the screen's height.
 */
export function PartySpace({ views, parties }: { views: SpaceView[]; parties: QParty[] }) {
  const t = useMessages(m).space;
  const uncoded = useMessages(m).coalition.uncoded;
  const [viewId, setViewId] = useState(views[0].id);
  const [on, setOn] = useState<string | null>(null);
  const [vsId, setVsId] = useState<string | null>(null);
  const [hot, setHot] = useState<string | null>(null);
  const view = views.find((v) => v.id === viewId)!;
  const whole = view.id === views[0].id;
  const by = new Map(parties.map((p) => [p.slug, p]));

  // Every party that shows in any view stays on the page; one with no position in this view fades out where it last was.
  const all = place(views[0].points);
  const here = place(view.points);
  const slugs = [...new Set(views.flatMap((v) => v.points.map((p) => p.slug)))];
  const last = new Map(slugs.map((s) => [s, here.get(s) ?? all.get(s) ?? { left: 50, top: 50 }]));

  // The pressed party against every other party on the map, the closest first. A pair needs a couple of questions in common (one, inside a topic).
  const a = on ? by.get(on) : undefined;
  const rows = !a || !here.has(a.slug)
    ? []
    : view.points
        .filter((p) => p.slug !== a.slug)
        .map((p) => {
          const b = by.get(p.slug)!;
          const r = distance(view.axes, a, b);
          return { party: b, close: 1 - (r.d ?? 1), shared: r.shared };
        })
        .filter((r) => r.shared >= (whole ? Math.min(2, view.axes.length) : 1))
        .sort((x, y) => y.close - x.close || y.shared - x.shared);
  const vs = rows.find((r) => r.party.slug === vsId) ?? rows[0];
  const near = new Set(rows.slice(0, LINES).map((r) => r.party.slug));
  if (vs) near.add(vs.party.slug);
  // A main list is never missing from the page: one without enough coded answers to be placed is named under the map.
  const off = parties.filter((p) => p.tier === "main" && !here.has(p.slug));
  const pick = (slug: string | null) => {
    setOn(slug);
    setVsId(null);
    setHot(null);
  };

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[minmax(0,1fr)] lg:gap-6">
      <div className="flex min-h-0 min-w-0 flex-col">
        <div className="scrollbar-none -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group">
          {views.map((v) => (
            <button key={v.id} type="button" onClick={() => setViewId(v.id)} aria-pressed={v.id === viewId} className={`shrink-0 rounded-full px-4 py-1.5 text-lg whitespace-nowrap transition ${v.id === viewId ? "bg-ink text-paper" : "bg-paper hover:bg-mist-deep"}`}>
              {v.label}
            </button>
          ))}
        </div>

        {/* One box for every topic, so the faces glide between layouts instead of the box jumping; on wide screens it takes the height that is left. */}
        <div className="relative mt-4 aspect-[4/5] w-full rounded-[1.75rem] bg-paper sm:aspect-[16/10] lg:aspect-auto lg:min-h-0 lg:flex-1">
          {/* Nothing is drawn between the faces but the pressed party's lines to its closest; the one open in the list is the darkest. */}
          {a && here.has(a.slug) && (
            <svg key={`lines ${viewId} ${on}`} className="pointer-events-none absolute inset-0 size-full animate-[fade_0.4s_0.5s_both]" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              {[...near].map((slug) => {
                const p = here.get(a.slug)!;
                const q = here.get(slug)!;
                const strong = slug === (hot ?? vs?.party.slug);
                return <line key={slug} x1={p.left} y1={p.top} x2={q.left} y2={q.top} stroke="var(--ink)" strokeWidth={strong ? 2 : 1.5} strokeOpacity={strong ? 0.8 : 0.2} strokeLinecap="round" vectorEffect="non-scaling-stroke" className="transition-[stroke-opacity]" />;
              })}
            </svg>
          )}
          {slugs.map((slug) => {
            const party = by.get(slug)!;
            const { left, top } = last.get(slug)!;
            const absent = !here.has(slug);
            const picked = on === slug;
            const lit = picked || near.has(slug) || hot === slug;
            const dim = absent || (a != null && here.has(a.slug) && !lit);
            return (
              <button
                key={slug}
                type="button"
                // One of the pressed party's closest opens in the list against it; any other party becomes the pressed one.
                onClick={() => (picked ? pick(null) : a && near.has(slug) ? setVsId(slug) : pick(slug))}
                aria-pressed={picked}
                tabIndex={absent ? -1 : undefined}
                aria-hidden={absent || undefined}
                className={`group absolute flex w-28 -translate-x-1/2 -translate-y-6 flex-col items-center gap-1.5 transition-[left,top,opacity] duration-700 ease-in-out ${absent ? "pointer-events-none opacity-0" : dim ? "opacity-30 hover:opacity-100" : ""} ${picked ? "z-20" : lit ? "z-10" : "hover:z-10"}`}
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <span className={`rounded-full ring-2 transition duration-300 max-sm:scale-75 ${picked ? "scale-115 ring-ink ring-offset-2 ring-offset-paper max-sm:scale-90" : slug === (hot ?? vs?.party.slug) ? "ring-ink" : "ring-mist group-hover:ring-ink"}`}>
                  <Avatar name={party.name} src={party.face} color={party.color} size={48} priority />
                </span>
                {/* On phones the faces stand without names, which would cover each other; the list names them. */}
                <span className={`line-clamp-2 text-center text-base leading-tight text-balance max-sm:hidden ${picked ? "font-bold" : "text-ink-2 group-hover:text-ink"}`}>{party.name}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 shrink-0 text-base text-muted">{view.questions.length > 0 ? `${t.basedOn} ${view.questions.join(" · ")}` : t.few}</p>
        {off.length > 0 && (
          <p className="mt-1 flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 text-base text-ink-2">
            <span className="flex">
              {off.map((p) => (
                <Avatar key={p.slug} name={p.name} src={p.face} color={p.color} size={28} className="-ms-1.5 opacity-70 ring-2 ring-mist grayscale first:ms-0" />
              ))}
            </span>
            {uncoded(off.map((p) => p.name).join(", "))}
          </p>
        )}
      </div>

      {/* The side list: the parties on the map, or the pressed party's ranking with the why inside each row. */}
      <aside className="flex min-h-0 min-w-0 flex-col rounded-[1.75rem] bg-paper p-4">
        {a ? (
          <>
            <div className="flex shrink-0 items-center gap-3 px-1">
              <Avatar name={a.name} src={a.face} color={a.color} size={44} />
              <h2 className="title min-w-0 flex-1 text-xl leading-tight">{t.closestTo(a.name)}</h2>
              <button type="button" onClick={() => pick(null)} aria-label={t.clear} title={t.clear} className="grid size-10 shrink-0 place-items-center rounded-full bg-mist text-2xl leading-none transition hover:bg-mist-deep">
                ×
              </button>
            </div>
            {rows.length === 0 ? (
              <p className="mt-4 px-1 text-lg text-ink-2">{t.notHere}</p>
            ) : (
              <ol key={`${viewId} ${on}`} className="scrollbar-none mt-3 min-h-0 animate-[fade_0.35s_both] lg:overflow-y-auto" onMouseLeave={() => setHot(null)}>
                {rows.map((r) => {
                  const open = r.party.slug === vs?.party.slug;
                  return (
                    <li key={r.party.slug} className={`rounded-2xl transition-colors ${open ? "bg-mist" : ""}`}>
                      <button type="button" onClick={() => setVsId(r.party.slug)} onMouseEnter={() => setHot(r.party.slug)} onFocus={() => setHot(r.party.slug)} onBlur={() => setHot(null)} aria-expanded={open} className={`flex w-full items-center gap-3 rounded-2xl p-1.5 pe-3 text-start transition ${open ? "" : "hover:bg-mist"}`}>
                        <Avatar name={r.party.name} src={r.party.face} color={r.party.color} size={32} priority />
                        <span className="min-w-0 flex-1 truncate text-lg leading-tight">{r.party.name}</span>
                        <span dir="ltr" className={`shrink-0 text-lg tabular-nums ${open ? "font-bold" : ""}`}>
                          {pct(r.close)}
                        </span>
                      </button>
                      {open && <Why axes={view.axes} a={a} b={r.party} note={t.shared(r.shared)} agree={t.agree} differ={t.differ} />}
                    </li>
                  );
                })}
              </ol>
            )}
          </>
        ) : (
          <>
            <p className="shrink-0 px-2 pb-3 text-base leading-snug text-ink-2">{t.pick}</p>
            <ul className="scrollbar-none flex min-h-0 gap-1 overflow-x-auto lg:flex-col lg:overflow-x-visible lg:overflow-y-auto" onMouseLeave={() => setHot(null)}>
              {view.points.map(({ slug }) => {
                const p = by.get(slug)!;
                return (
                  <li key={slug} className="shrink-0">
                    <button type="button" onClick={() => pick(slug)} onMouseEnter={() => setHot(slug)} onFocus={() => setHot(slug)} onBlur={() => setHot(null)} aria-label={p.name} className="flex w-full items-center gap-3 rounded-full p-1.5 text-start text-lg leading-tight transition hover:bg-mist lg:pe-4">
                      <Avatar name={p.name} src={p.face} color={p.color} size={36} priority />
                      <span className="min-w-0 flex-1 truncate max-lg:hidden">{p.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </aside>
    </div>
  );
}

/** Why two parties are as close as they are, inside the open row: the questions both answered, first those they answered alike, then those they did not, with each one's own answer under its name. */
function Why({ axes, a, b, note, agree, differ }: { axes: QAxis[]; a: QParty; b: QParty; note: string; agree: string; differ: string }) {
  const shared = axes.filter((ax) => ax.id in a.levels && ax.id in b.levels);
  const same = shared.filter((ax) => a.levels[ax.id] === b.levels[ax.id]);
  const other = shared.filter((ax) => a.levels[ax.id] !== b.levels[ax.id]);
  const answer = (ax: QAxis, p: QParty) => ax.scale.find((s) => s.level === p.levels[ax.id])?.short ?? "";
  return (
    <div className="animate-[fade_0.3s_both] px-3 pb-3">
      <p className="text-base text-ink-2">{note}</p>
      {same.length > 0 && (
        <>
          <p className="mt-3 text-base font-bold">
            {agree} · {same.length}
          </p>
          <ul>
            {same.map((ax) => (
              <li key={ax.id} className="mt-1.5 text-base leading-snug">
                <span className="text-ink-2">{ax.short}:</span> {answer(ax, a)}
              </li>
            ))}
          </ul>
        </>
      )}
      {other.length > 0 && (
        <>
          <p className="mt-3 text-base font-bold">
            {differ} · {other.length}
          </p>
          <ul>
            {other.map((ax) => (
              <li key={ax.id} className="mt-1.5 text-base leading-snug">
                <p className="text-ink-2">{ax.short}:</p>
                {[a, b].map((p) => (
                  <p key={p.slug} className="mt-1 flex items-start gap-2">
                    <Avatar name={p.name} src={p.face} color={p.color} size={24} className="shrink-0" />
                    {answer(ax, p)}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
