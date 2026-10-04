"use client";

import { useEffect, useMemo, useState } from "react";
import { useMessages } from "@/i18n/link";
import { m } from "@/i18n/messages/games";
import { Avatar } from "@/components/avatar";
import { distance, type QAxis, type QParty } from "@/lib/match";

const SEATS = 120;
const MAJORITY = 61;
const MIN = 4; // the threshold, 3.25% of the votes, is about four seats: a list either has none or at least four
const MAX = 45;

type State = { seats: Record<string, number>; coalition: string[] };

/** The state in the address bar, so a coalition can be sent as a link: ?s=likud.30,shas.10&c=likud,shas */
function fromQuery(parties: QParty[], q: { s?: string; c?: string }): State {
  const known = new Set(parties.map((p) => p.slug));
  const seats: Record<string, number> = {};
  for (const pair of (q.s ?? "").split(",")) {
    const [slug, n] = pair.split(".");
    const v = Number(n);
    if (known.has(slug) && v >= MIN && v <= MAX) seats[slug] = v;
  }
  const coalition = (q.c ?? "").split(",").filter((c) => known.has(c));
  return { seats, coalition };
}

function toUrl({ seats, coalition }: State) {
  const s = Object.entries(seats).filter(([, n]) => n > 0).map(([k, n]) => `${k}.${n}`).join(",");
  const q = new URLSearchParams();
  if (s) q.set("s", s);
  if (coalition.length) q.set("c", coalition.join(","));
  const qs = q.toString().replace(/%2C/g, ",");
  return `${window.location.pathname}${qs ? `?${qs}` : ""}`;
}

/** Seats from the slider: below the threshold a list has none, so 1–3 snap to 0 or 4. */
const snap = (n: number) => (n === 0 ? 0 : n < MIN ? (n < 2 ? 0 : MIN) : n);

export function CoalitionBuilder({ axes, parties, query }: { axes: QAxis[]; parties: QParty[]; query: { s?: string; c?: string } }) {
  const t = useMessages(m).coalition;
  const [state, setState] = useState<State>(() => fromQuery(parties, query));
  const [all, setAll] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.history.replaceState(null, "", toUrl(state));
  }, [state]);

  const { seats, coalition } = state;
  const assigned = Object.values(seats).reduce((a, b) => a + b, 0);
  const left = SEATS - assigned;
  const members = parties.filter((p) => coalition.includes(p.slug));
  const total = members.reduce((n, p) => n + (seats[p.slug] ?? 0), 0);
  const shown = all ? parties : parties.filter((p) => p.tier === "main" || seats[p.slug] || coalition.includes(p.slug));

  const setSeats = (slug: string, n: number) =>
    setState((s) => {
      const others = Object.entries(s.seats).reduce((a, [k, v]) => (k === slug ? a : a + v), 0);
      const v = Math.min(snap(n), SEATS - others);
      return { ...s, seats: { ...s.seats, [slug]: v < MIN ? 0 : v } };
    });
  const toggle = (slug: string) => setState((s) => ({ ...s, coalition: s.coalition.includes(slug) ? s.coalition.filter((c) => c !== slug) : [...s.coalition, slug] }));

  // The 120 dots: the coalition first in its parties' colours, then the other seats given out, faint, then the empty ones.
  const dots = [
    ...members.flatMap((p) => Array.from({ length: seats[p.slug] ?? 0 }, () => ({ color: p.color, on: true, name: p.name }))),
    ...parties.filter((p) => !coalition.includes(p.slug)).flatMap((p) => Array.from({ length: seats[p.slug] ?? 0 }, () => ({ color: p.color, on: false, name: p.name }))),
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:items-start lg:gap-12">
      <section>
        <div className="rounded-[2rem] bg-tile p-5 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="title text-4xl tabular-nums">{t.total(total)}</p>
            <p className={`text-xl font-medium ${total >= MAJORITY ? "text-[#1f8a5b]" : "text-ink-2"}`}>{total >= MAJORITY ? t.majority : t.missing(MAJORITY - total)}</p>
          </div>
          <div className="mt-5 grid grid-cols-20 gap-1.5 sm:gap-2" role="img" aria-label={t.total(total)}>
            {Array.from({ length: SEATS }, (_, i) => {
              const d = dots[i];
              return (
                <span
                  key={i}
                  title={d?.name}
                  className={`aspect-square rounded-full transition-colors duration-300 ${i === MAJORITY - 1 ? "ring-2 ring-ink ring-offset-2 ring-offset-tile" : ""}`}
                  style={{ background: d ? d.color : "var(--line)", opacity: d && !d.on ? 0.28 : 1 }}
                />
              );
            })}
          </div>
          <p className="mt-4 text-lg text-ink-2">{left > 0 ? t.unassigned(left) : t.over}</p>
        </div>

        <ul className="mt-6 divide-y divide-line">
          {shown.map((p) => {
            const n = seats[p.slug] ?? 0;
            const on = coalition.includes(p.slug);
            return (
              <li key={p.slug} className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-3 py-3 sm:flex sm:gap-x-4">
                <Avatar name={p.name} src={p.face} color={p.color} size={44} />
                <label htmlFor={`seats-${p.slug}`} className="min-w-0 flex-1 truncate text-lg font-medium">
                  {p.name}
                </label>
                {/* Left to right like any count: in a right-to-left page the browser fills the track from the wrong end. */}
                <input
                  id={`seats-${p.slug}`}
                  type="range"
                  dir="ltr"
                  min={0}
                  max={MAX}
                  value={n}
                  onChange={(e) => setSeats(p.slug, Number(e.target.value))}
                  aria-valuetext={t.seats(n)}
                  className="order-last col-span-4 w-full sm:order-none sm:w-56"
                  style={{ accentColor: p.color }}
                />
                <span className="text-end text-lg tabular-nums sm:w-24">{n ? t.seats(n) : "—"}</span>
                <button
                  type="button"
                  onClick={() => toggle(p.slug)}
                  aria-pressed={on}
                  className={`rounded-full px-4 py-2 text-base whitespace-nowrap transition sm:w-36 ${on ? "bg-ink text-paper" : "bg-mist hover:bg-mist-deep"}`}
                >
                  {on ? t.join : t.add}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => setAll(!all)} className="rounded-full bg-mist px-5 py-3 text-lg transition hover:bg-mist-deep">
            {all ? t.less : t.more}
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            }}
            className="rounded-full bg-mist px-5 py-3 text-lg transition hover:bg-mist-deep"
          >
            {copied ? t.copied : t.share}
          </button>
          <button type="button" onClick={() => setState({ seats: {}, coalition: [] })} className="rounded-full bg-mist px-5 py-3 text-lg transition hover:bg-mist-deep">
            {t.reset}
          </button>
        </div>
        <p className="mt-4 max-w-2xl text-base text-ink-2">{t.threshold}</p>
      </section>

      <aside className="lg:sticky lg:top-24 xl:top-28">
        <h2 className="title text-2xl">{t.gaps}</h2>
        {members.length < 2 ? (
          <p className="mt-3 text-lg text-ink-2">{t.gapsEmpty}</p>
        ) : (
          <>
            <ul className="mt-4 space-y-4">
              {axes.map((a) => (
                <Gap key={a.id} axis={a} members={members} />
              ))}
            </ul>
            <Fit axes={axes} parties={parties} members={members} />
          </>
        )}
      </aside>
    </div>
  );
}

/** One question: where each member stands on it, and whether they agree. */
function Gap({ axis, members }: { axis: QAxis; members: QParty[] }) {
  const t = useMessages(m).coalition;
  const coded = members.filter((p) => axis.id in p.levels);
  const missing = members.filter((p) => !(axis.id in p.levels));
  const levels = coded.map((p) => p.levels[axis.id]);
  const spread = levels.length ? Math.max(...levels) - Math.min(...levels) : 0;
  const status = coded.length < 2 ? null : spread === 0 ? { label: t.agree, color: "#1f8a5b" } : !axis.ordered ? { label: t.split, color: "#c2410c" } : spread === 1 ? { label: t.small, color: "#b7791f" } : { label: t.wide, color: "#c2410c" };
  return (
    <li className="rounded-3xl bg-tile p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-lg font-medium">{axis.short}</p>
        {status && (
          <p className="text-base font-medium" style={{ color: status.color }}>
            {status.label}
          </p>
        )}
      </div>
      <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${axis.scale.length}, minmax(0, 1fr))` }}>
        {axis.scale.map((s) => (
          <div key={s.level} className="flex min-h-24 flex-col items-center justify-end gap-1 rounded-2xl bg-paper p-2">
            <div className="flex flex-wrap justify-center gap-1">
              {coded
                .filter((p) => p.levels[axis.id] === s.level)
                .map((p) => (
                  <span key={p.slug} title={`${p.name}: ״${p.quotes[axis.id]?.quote}״`}>
                    <Avatar name={p.name} src={p.face} color={p.color} size={30} />
                  </span>
                ))}
            </div>
            <p className="text-center text-base leading-tight text-ink-2">{s.short}</p>
          </div>
        ))}
      </div>
      {missing.length > 0 && <p className="mt-2 text-base text-ink-2">{t.uncoded(missing.map((p) => p.name).join(", "))}</p>}
    </li>
  );
}

/** The parties outside the coalition that sit closest to it: average closeness to the members, weighted by questions shared. */
function Fit({ axes, parties, members }: { axes: QAxis[]; parties: QParty[]; members: QParty[] }) {
  const t = useMessages(m).coalition;
  const rows = useMemo(() => {
    const ids = new Set(members.map((p) => p.slug));
    return parties
      .filter((p) => !ids.has(p.slug))
      .map((p) => {
        let sum = 0;
        let shared = 0;
        for (const q of members) {
          const r = distance(axes, p, q);
          if (r.d == null) continue;
          sum += (1 - r.d) * r.shared;
          shared += r.shared;
        }
        return { p, close: shared ? sum / shared : null, shared };
      })
      .filter((r) => r.close != null && r.shared >= 3)
      .sort((a, b) => b.close! - a.close!)
      .slice(0, 5);
  }, [axes, parties, members]);
  if (!rows.length) return null;
  return (
    <section className="mt-8">
      <h2 className="title text-2xl">{t.fit}</h2>
      <p className="mt-1 text-base text-ink-2">{t.fitNote}</p>
      <ul className="mt-3 divide-y divide-line">
        {rows.map((r) => (
          <li key={r.p.slug} className="flex items-center gap-3 py-2.5">
            <Avatar name={r.p.name} src={r.p.face} color={r.p.color} size={36} />
            <span className="flex-1 text-lg">{r.p.name}</span>
            <span className="text-lg tabular-nums">{Math.round(r.close! * 100)}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
