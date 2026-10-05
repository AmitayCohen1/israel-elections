"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useMessages } from "@/i18n/link";
import { LOCALE_INFO } from "@/i18n/config";
import { m } from "@/i18n/messages/games";
import { Avatar } from "@/components/avatar";
import { Sheet, Stage } from "@/components/game-stage";
import { distance, type QAxis, type QParty } from "@/lib/match";

const SEATS = 120;
const MAJORITY = 61;
const MIN = 4; // the threshold, 3.25% of the votes, is about four seats: a list either has none or at least four
const MAX = 45;

type State = { seats: Record<string, number>; coalition: string[] };
type T = (typeof m)["he"]["coalition"];

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
  for (const k of Object.keys(seats)) if (!coalition.includes(k)) delete seats[k];
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

/**
 * The 120 chairs of the Knesset on six half rings, outer rings holding more. Ordered by angle, so consecutive seats form a
 * wedge from one end of the arc to the other, and seat 61 sits at the top of the middle.
 */
const ARC = (() => {
  const rows = [12, 15, 18, 22, 25, 28];
  const radii = [80, 102, 124, 146, 168, 190];
  const seats: { x: number; y: number; a: number; r: number }[] = [];
  rows.forEach((n, i) => {
    for (let j = 0; j < n; j++) {
      const a = Math.PI - (j * Math.PI) / (n - 1);
      // rounded, so the server and the browser print the same numbers
      seats.push({ x: Math.round((200 + radii[i] * Math.cos(a)) * 100) / 100, y: Math.round((200 - radii[i] * Math.sin(a)) * 100) / 100, a, r: radii[i] });
    }
  });
  return seats.sort((p, q) => q.a - p.a || p.r - q.r);
})();

/**
 * The coalition game on one screen: the Knesset in the middle, the coalition on the start side, and on the other a plain list
 * of parties to add. Only the coalition's parties get seats (that is all a majority needs); they fill the half circle from
 * the coalition's side, and the agreement on the position map's questions sits under it.
 */
export function CoalitionBuilder({ axes, parties, query }: { axes: QAxis[]; parties: QParty[]; query: { s?: string; c?: string } }) {
  const t = useMessages(m).coalition;
  const locale = useLocale();
  const rtl = LOCALE_INFO[locale].dir === "rtl";
  const [state, setState] = useState<State>(() => fromQuery(parties, query));
  const [all, setAll] = useState(false);
  const [copied, setCopied] = useState(false);
  const [details, setDetails] = useState(false);

  useEffect(() => {
    window.history.replaceState(null, "", toUrl(state));
  }, [state]);

  const { seats, coalition } = state;
  const members = coalition.map((s) => parties.find((p) => p.slug === s)!).filter(Boolean);
  // The parties to add, by name: the ballot's order means nothing to a reader looking for one party.
  const rest = parties.filter((p) => !coalition.includes(p.slug)).sort((a, b) => a.name.localeCompare(b.name, locale));
  const restShown = all ? rest : rest.filter((p) => p.tier === "main");
  const total = members.reduce((n, p) => n + (seats[p.slug] ?? 0), 0);
  const left = SEATS - total;
  const has = total >= MAJORITY;

  // − and +: below the threshold a list has none, so a member never goes under 4; the coalition cannot pass 120.
  const step = (slug: string, by: 1 | -1) =>
    setState((s) => {
      const n = s.seats[slug] ?? MIN;
      const v = Math.min(Math.max(MIN, n + by), MAX, SEATS - (total - n));
      return { ...s, seats: { ...s.seats, [slug]: v } };
    });
  // Typed: kept between 4 and 45, and within what the other members leave of the 120.
  const set = (slug: string, v: number) =>
    setState((s) => {
      if (!Number.isFinite(v)) return s;
      const others = total - (s.seats[slug] ?? 0);
      return { ...s, seats: { ...s.seats, [slug]: Math.min(Math.max(MIN, Math.round(v)), MAX, SEATS - others) } };
    });
  // A party joins with the threshold's four seats (a starting point, not a forecast) and leaves with its seats.
  const add = (slug: string) => {
    if (left < MIN) return;
    setState((s) => ({ coalition: [...s.coalition, slug], seats: { ...s.seats, [slug]: MIN } }));
  };
  const remove = (slug: string) =>
    setState((s) => {
      const seats = { ...s.seats };
      delete seats[slug];
      return { coalition: s.coalition.filter((c) => c !== slug), seats };
    });

  // The chairs, from the coalition's side in its parties' colours; the rest of the Knesset stays grey.
  const fill = members.flatMap((p) => Array.from({ length: seats[p.slug] ?? 0 }, () => ({ color: p.color, name: p.name })));
  const chairs = rtl ? [...ARC].reverse() : ARC;

  return (
    <Stage className="flex flex-col overflow-y-auto lg:grid lg:grid-cols-[22rem_minmax(0,1fr)_26rem] lg:overflow-hidden xl:grid-cols-[24rem_minmax(0,1fr)_30rem]">
      {/* Managing the coalition: who is in and with how many seats, then the parties to add */}
      <section className="order-2 flex min-h-0 flex-col lg:order-none lg:border-e lg:border-line">
        <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-5">
          <div className="flex items-baseline justify-between gap-3 px-1">
            <h2 className="title text-2xl">{t.coalitionSide}</h2>
            <p className="text-lg text-ink-2 tabular-nums">{t.seats(total)}</p>
          </div>
          {members.length ? (
            <ul className="mt-3 space-y-2">
              {members.map((p) => (
                <Member key={p.slug} party={p} seats={seats[p.slug] ?? MIN} canAdd={left > 0} onStep={(by) => step(p.slug, by)} onSet={(v) => set(p.slug, v)} onRemove={() => remove(p.slug)} t={t} />
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-2xl border-2 border-dashed border-line-strong p-4 text-lg text-ink-2">{t.emptyCoalition}</p>
          )}

          <h2 className="title mt-7 border-t border-line px-1 pt-5 text-2xl">{t.addTitle}</h2>
          <p className="mt-1 px-1 text-lg text-ink-2">{t.addHint}</p>
          <ul className="mt-2">
            {restShown.map((p) => (
              <li key={p.slug}>
                <button
                  type="button"
                  onClick={() => add(p.slug)}
                  disabled={left < MIN}
                  className="group flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-start transition hover:bg-paper disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <Avatar name={p.name} src={p.face} color={p.color} size={40} />
                  <span className="min-w-0 flex-1 truncate text-lg">{p.name}</span>
                  <span className="flex shrink-0 items-center gap-1 rounded-full border border-line-strong px-3 py-1 text-base transition group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                    <span aria-hidden>+</span>
                    {t.add}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setAll(!all)} className="mt-1 rounded-2xl px-2 py-2 text-start text-lg text-ink-2 underline underline-offset-4 transition hover:text-ink">
            {all ? t.less : t.more}
          </button>
          <p className="mt-1 px-1 text-base text-ink-2">{t.threshold}</p>
        </div>
      </section>

      {/* The Knesset */}
      <section className="order-1 flex min-h-0 flex-col items-center justify-center px-5 py-6 text-center lg:order-none">
        <h1 className="serif text-4xl xl:text-5xl">{t.title}</h1>
        <p className="mt-2 max-w-md text-lg text-ink-2">{t.tagline}</p>
        <div className="relative mt-6 w-full max-w-2xl">
          <svg viewBox="0 -2 400 236" className="max-h-[48vh] w-full" role="img" aria-label={`${t.total(total)}. ${has ? t.majorityOf(total) : t.missing(MAJORITY - total)}`}>
            <line x1="200" y1="0" x2="200" y2="114" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.35" />
            {chairs.map((c, i) => {
              const d = fill[i];
              return (
                <circle
                  key={i}
                  cx={c.x}
                  cy={c.y}
                  r={7.4}
                  style={{
                    fill: d ? d.color : "var(--line-strong)",
                    opacity: d ? 1 : 0.7,
                    transition: "fill 300ms ease, opacity 300ms ease",
                    transitionDelay: `${i * 2}ms`,
                  }}
                >
                  {d && <title>{d.name}</title>}
                </circle>
              );
            })}
          </svg>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
            <p key={String(has)} className={`serif text-7xl leading-none tabular-nums xl:text-8xl ${has ? "win-pop text-[#1f7a52]" : ""}`}>
              {total}
            </p>
            <p className="mt-2 text-base text-ink-2">{t.outOf}</p>
          </div>
        </div>
        <p className={`mt-5 rounded-full px-5 py-2 text-xl font-medium transition-colors ${has ? "bg-[#2f9e6c] text-paper" : "bg-paper"}`} aria-live="polite">
          {has ? t.majorityOf(total) : t.missing(MAJORITY - total)}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            }}
            className="rounded-full bg-paper px-5 py-2.5 text-lg transition hover:bg-mist-deep"
          >
            {copied ? t.copied : t.share}
          </button>
          {coalition.length > 0 && (
            <button type="button" onClick={() => setState({ seats: {}, coalition: [] })} className="rounded-full px-5 py-2.5 text-lg text-ink-2 transition hover:bg-mist-deep hover:text-ink">
              {t.reset}
            </button>
          )}
        </div>
      </section>

      {/* Where the partners agree and where they would argue */}
      <section className="order-3 flex min-h-0 flex-col p-3 lg:border-s lg:border-line">
        <Verdict axes={axes} members={members} t={t} onOpen={() => setDetails(true)} />
      </section>

      <Sheet open={details} onClose={() => setDetails(false)} title={t.gaps} closeLabel={t.close}>
        <Gaps axes={axes} members={members} parties={parties} t={t} />
      </Sheet>
    </Stage>
  );
}

/** A coalition member: face and name, its seats (typed, or with − and +), and a plain way out. */
function Member({
  party: p,
  seats: n,
  canAdd,
  onStep,
  onSet,
  onRemove,
  t,
}: {
  party: QParty;
  seats: number;
  canAdd: boolean;
  onStep: (by: 1 | -1) => void;
  onSet: (n: number) => void;
  onRemove: () => void;
  t: T;
}) {
  const [draft, setDraft] = useState<string | null>(null); // what is being typed, before it is a valid count
  return (
    <li className="card-in rounded-2xl bg-paper p-3">
      <div className="flex items-center gap-3">
        <Avatar name={p.name} src={p.face} color={p.color} size={44} />
        <p className="min-w-0 flex-1 truncate text-lg font-medium">{p.name}</p>
        <button type="button" onClick={onRemove} className="shrink-0 rounded-full px-3 py-1 text-base text-ink-2 transition hover:bg-mist hover:text-ink">
          {t.removeShort}
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2 ps-14" role="group" aria-label={`${p.name}: ${t.seats(n)}`}>
        <Step label={t.fewer} onClick={() => onStep(-1)} disabled={n <= MIN}>
          −
        </Step>
        <input
          type="number"
          inputMode="numeric"
          min={MIN}
          max={MAX}
          value={draft ?? n}
          onChange={(e) => {
            setDraft(e.target.value);
            const v = Number(e.target.value);
            if (v >= MIN) onSet(v);
          }}
          onFocus={(e) => e.target.select()}
          onBlur={() => setDraft(null)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          aria-label={t.seatsLabel}
          className="w-14 rounded-xl border border-line bg-paper py-1 text-center text-xl font-medium tabular-nums [appearance:textfield] focus:border-ink focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <Step label={t.moreSeat} onClick={() => onStep(1)} disabled={!canAdd || n >= MAX}>
          +
        </Step>
        <span className="text-base text-ink-2">{t.seatsLabel}</span>
      </div>
    </li>
  );
}

function Step({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-9 place-items-center rounded-full bg-mist text-xl transition hover:bg-mist-deep disabled:opacity-30 disabled:hover:bg-mist"
    >
      {children}
    </button>
  );
}

type Status = { key: "agree" | "small" | "wide" | "split"; label: string; tone: string; dot: string };

function statusOf(axis: QAxis, members: QParty[], t: T): Status | null {
  const levels = members.filter((p) => axis.id in p.levels).map((p) => p.levels[axis.id]);
  if (levels.length < 2) return null;
  const spread = Math.max(...levels) - Math.min(...levels);
  if (spread === 0) return { key: "agree", label: t.agree, tone: "bg-[#e3f3eb] text-[#1f7a52]", dot: "#2f9e6c" };
  if (!axis.ordered) return { key: "split", label: t.split, tone: "bg-[#fbeee6] text-[#b4440f]", dot: "#d4642a" };
  if (spread === 1) return { key: "small", label: t.small, tone: "bg-[#fbf3e1] text-[#8a5a0b]", dot: "#d9a23a" };
  return { key: "wide", label: t.wide, tone: "bg-[#fbeee6] text-[#b4440f]", dot: "#d4642a" };
}

/**
 * The heart of the game, under the Knesset: on which questions the partners give the same answer, and on which they would
 * argue, each side shown with its faces and its answer. Questions with too few coded partners are named at the end.
 */
function Verdict({ axes, members, t, onOpen }: { axes: QAxis[]; members: QParty[]; t: T; onOpen: () => void }) {
  const rows = axes.map((a) => ({ a, s: statusOf(a, members, t) }));
  const agree = rows.filter((r) => r.s?.key === "agree");
  const argue = rows.filter((r) => r.s && r.s.key !== "agree");
  const unknown = rows.filter((r) => !r.s);
  const answer = (a: QAxis, level: number) => a.scale.find((x) => x.level === level)?.short ?? "";
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-3xl bg-paper p-4 text-start sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="title text-2xl">{t.verdictTitle}</h2>
        {members.length >= 2 && agree.length + argue.length > 0 && <p className="text-lg text-ink-2">{t.agreeCount(agree.length, agree.length + argue.length)}</p>}
      </div>
      {members.length < 2 ? (
        <>
          <p className="mt-2 text-lg text-ink-2">{t.gapsEmpty}</p>
          <ul className="mt-4 space-y-2">
            {axes.map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-lg">
                <span className="size-3 shrink-0 rounded-full bg-line-strong" />
                {a.short}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto">
            <div className="rounded-2xl bg-[#eef8f2] p-4">
              <p className="flex items-center gap-2 text-lg font-medium text-[#1f7a52]">
                <span className="size-3 rounded-full bg-[#2f9e6c]" />
                {t.agreeOn} · {agree.length}
              </p>
              {agree.length ? (
                <ul className="mt-3 space-y-3">
                  {agree.map(({ a }) => {
                    const lvl = members.find((p) => a.id in p.levels)!.levels[a.id];
                    return (
                      <li key={a.id} className="card-in">
                        <p className="text-lg font-medium leading-snug">{a.short}</p>
                        <p className="text-lg text-ink-2">
                          {t.allSay} {answer(a, lvl)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-3 text-lg text-ink-2">{t.noneYet}</p>
              )}
            </div>
            <div className="rounded-2xl bg-[#fdf1ea] p-4">
              <p className="flex items-center gap-2 text-lg font-medium text-[#b4440f]">
                <span className="size-3 rounded-full bg-[#d4642a]" />
                {t.argueOn} · {argue.length}
              </p>
              {argue.length ? (
                <ul className="mt-3 space-y-4">
                  {argue.map(({ a, s }) => {
                    const levels = [...new Set(members.filter((p) => a.id in p.levels).map((p) => p.levels[a.id]))].sort((x, y) => x - y);
                    return (
                      <li key={a.id} className="card-in">
                        <p className="flex items-baseline justify-between gap-2">
                          <span className="text-lg font-medium leading-snug">{a.short}</span>
                          <span className="shrink-0 text-base text-ink-2">{s!.label}</span>
                        </p>
                        <ul className="mt-1.5 space-y-1.5">
                          {levels.map((lvl) => (
                            <li key={lvl} className="flex items-center gap-2">
                              <span className="flex shrink-0 -space-x-1.5 rtl:space-x-reverse">
                                {members
                                  .filter((p) => p.levels[a.id] === lvl)
                                  .map((p) => (
                                    <span key={p.slug} title={p.name}>
                                      <Avatar name={p.name} src={p.face} color={p.color} size={28} className="ring-2 ring-[#fdf1ea]" />
                                    </span>
                                  ))}
                              </span>
                              <span className="text-lg leading-snug">{answer(a, lvl)}</span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-3 text-lg text-ink-2">{t.noneYet}</p>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            {unknown.length > 0 ? <p className="text-base text-ink-2">{t.unknownQs(unknown.map((r) => r.a.short).join(" · "))}</p> : <span />}
            <button type="button" onClick={onOpen} className="text-lg text-ink underline underline-offset-4 hover:text-accent">
              {t.details}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** The full picture in the sheet: every question for the chosen partners, then who else would fit. */
function Gaps({ axes, members, parties, t }: { axes: QAxis[]; members: QParty[]; parties: QParty[]; t: T }) {
  return (
    <>
      <ul className="space-y-3">
        {axes.map((a) => (
          <Gap key={a.id} axis={a} members={members} status={statusOf(a, members, t)} t={t} />
        ))}
      </ul>
      <Fit axes={axes} parties={parties} members={members} t={t} />
    </>
  );
}

/** One question: where each member stands on it, and whether they agree. */
function Gap({ axis, members, status, t }: { axis: QAxis; members: QParty[]; status: Status | null; t: T }) {
  const coded = members.filter((p) => axis.id in p.levels);
  const missing = members.filter((p) => !(axis.id in p.levels));
  return (
    <li className="rounded-3xl border border-line p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-medium">{axis.short}</p>
        {status && <p className={`rounded-full px-3 py-0.5 text-base font-medium ${status.tone}`}>{status.label}</p>}
      </div>
      <div className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${axis.scale.length}, minmax(0, 1fr))` }}>
        {axis.scale.map((s) => {
          const here = coded.filter((p) => p.levels[axis.id] === s.level);
          return (
            <div key={s.level} className={`flex min-h-20 flex-col items-center justify-between gap-1 rounded-2xl p-2 ${here.length ? "bg-mist" : "bg-tile/60"}`}>
              <div className="flex flex-wrap justify-center -space-x-1.5 rtl:space-x-reverse">
                {here.map((p) => (
                  <span key={p.slug} title={`${p.name}: ״${p.quotes[axis.id]?.quote}״`}>
                    <Avatar name={p.name} src={p.face} color={p.color} size={32} className="ring-2 ring-mist" />
                  </span>
                ))}
              </div>
              <p className={`text-center text-base leading-tight ${here.length ? "text-ink" : "text-ink-2"}`}>{s.short}</p>
            </div>
          );
        })}
      </div>
      {missing.length > 0 && <p className="mt-2 text-base text-ink-2">{t.uncoded(missing.map((p) => p.name).join(", "))}</p>}
    </li>
  );
}

/** The parties outside the coalition that sit closest to it: average closeness to the members, weighted by questions shared. */
function Fit({ axes, parties, members, t }: { axes: QAxis[]; parties: QParty[]; members: QParty[]; t: T }) {
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
    <section className="mt-6 rounded-3xl bg-mist p-5">
      <h3 className="title text-2xl">{t.fit}</h3>
      <p className="mt-1 text-base text-ink-2">{t.fitNote}</p>
      <ul className="mt-4 space-y-3">
        {rows.map((r) => {
          const pct = Math.round(r.close! * 100);
          return (
            <li key={r.p.slug} className="flex items-center gap-3">
              <Avatar name={r.p.name} src={r.p.face} color={r.p.color} size={38} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-lg">{r.p.name}</span>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-mist-deep">
                  <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: r.p.color }} />
                </span>
              </span>
              <span className="w-12 text-end text-lg tabular-nums">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
