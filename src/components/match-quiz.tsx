"use client";

import { useMemo, useState } from "react";
import { useMessages } from "@/i18n/link";
import { m } from "@/i18n/messages/games";
import { Avatar } from "@/components/avatar";
import { agreement, score, type Answers, type QAxis, type QParty } from "@/lib/match";

const ROW = 64; // board row height, px: rows move by this much when the order changes

/** A party is ranked once it has a coded position on at least half of the questions answered. */
const enough = (overlap: number, answered: number) => overlap >= Math.max(1, Math.ceil(answered / 2));

/**
 * The quiz: the position map's questions one at a time, and beside them the parties lining up live by how close they are
 * to the answers so far. Every number can be opened down to the quote it comes from.
 */
export function MatchQuiz({ axes: all, parties }: { axes: QAxis[]; parties: QParty[] }) {
  const t = useMessages(m).quiz;
  // The questions most parties are coded on come first, so the board fills up from the start.
  const axes = useMemo(() => {
    const n = (a: QAxis) => parties.filter((p) => a.id in p.levels).length;
    return [...all].sort((a, b) => n(b) - n(a));
  }, [all, parties]);
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [before, setBefore] = useState<Record<string, number>>({}); // the scores before the last answer

  const coded = useMemo(() => parties.filter((p) => Object.keys(p.levels).length > 0), [parties]);
  const answered = Object.keys(answers).length;
  const done = step >= axes.length;
  const axis = axes[Math.min(step, axes.length - 1)];

  const rows = useMemo(() => {
    const scored = coded.map((p) => ({ p, ...score(axes, answers, p) }));
    const ranked = scored.filter((r) => r.score != null && enough(r.overlap, answered)).sort((a, b) => b.score! - a.score! || b.overlap - a.overlap);
    const thin = scored.filter((r) => !ranked.includes(r)).sort((a, b) => b.overlap - a.overlap);
    return { ranked, thin };
  }, [axes, answers, answered, coded]);

  // How much each party moved with the last answer: the chip beside its number.
  const now = Object.fromEntries(rows.ranked.map((r) => [r.p.slug, Math.round(r.score! * 100)]));
  const delta = (slug: string) => (before[slug] == null || now[slug] == null ? 0 : now[slug] - before[slug]);

  function answer(level: number | null) {
    setBefore(now);
    setAnswers((a) => {
      const next = { ...a };
      if (level == null) delete next[axis.id];
      else next[axis.id] = { level, weight: a[axis.id]?.weight ?? 1 };
      return next;
    });
    setStep((s) => s + 1);
  }

  function toggleWeight() {
    const a = answers[axis.id];
    if (!a) return;
    setBefore(now);
    setAnswers({ ...answers, [axis.id]: { ...a, weight: a.weight === 2 ? 1 : 2 } });
  }

  const openParty = open ? coded.find((p) => p.slug === open) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-start lg:gap-14">
      <section>
        <ol className="flex gap-2" aria-label={t.progress(Math.min(step + 1, axes.length), axes.length)}>
          {axes.map((a, i) => (
            <li key={a.id} className="flex-1">
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-label={`${i + 1}. ${a.short}`}
                aria-current={i === step ? "step" : undefined}
                className={`block h-2.5 w-full rounded-full transition ${i === step ? "bg-ink" : answers[a.id] ? "bg-accent" : "bg-line hover:bg-line-strong"}`}
              />
            </li>
          ))}
        </ol>

        {!done ? (
          <div key={axis.id} className="mt-8">
            <p className="text-lg text-ink-2 tabular-nums">
              {t.progress(step + 1, axes.length)} · {axis.short}
            </p>
            <h2 className="title mt-2 text-3xl text-balance sm:text-4xl">{axis.question}</h2>
            <div className="mt-7 grid gap-3">
              {axis.scale.map((s) => {
                const on = answers[axis.id]?.level === s.level;
                return (
                  <button
                    key={s.level}
                    type="button"
                    onClick={() => answer(s.level)}
                    aria-pressed={on}
                    className={`rounded-3xl px-6 py-5 text-start text-xl transition ${on ? "bg-ink text-paper" : "bg-tile hover:bg-mist-deep"}`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {step > 0 && (
                <button type="button" onClick={() => setStep(step - 1)} className="rounded-full bg-mist px-5 py-3 text-lg transition hover:bg-mist-deep">
                  {t.back}
                </button>
              )}
              <button type="button" onClick={() => answer(null)} className="rounded-full bg-mist px-5 py-3 text-lg transition hover:bg-mist-deep">
                {t.skip}
              </button>
              {answers[axis.id] && (
                <label className="flex cursor-pointer items-center gap-3 rounded-full bg-mist px-5 py-3 text-lg">
                  <input type="checkbox" checked={answers[axis.id].weight === 2} onChange={toggleWeight} className="size-5 accent-[#0e0d12]" />
                  {t.important}
                </label>
              )}
            </div>
            {answers[axis.id] && <p className="mt-3 text-base text-ink-2">{t.importantNote}</p>}
          </div>
        ) : (
          <div className="mt-8">
            <h2 className="title text-3xl sm:text-4xl">{t.done}</h2>
            <p className="mt-3 max-w-2xl text-xl text-ink-2">{t.doneNote}</p>
            <button
              type="button"
              onClick={() => {
                setBefore({});
                setAnswers({});
                setOpen(null);
                setStep(0);
              }}
              className="mt-6 rounded-full bg-mist px-5 py-3 text-lg transition hover:bg-mist-deep"
            >
              {t.restart}
            </button>
          </div>
        )}

        {openParty && <Breakdown axes={axes} answers={answers} party={openParty} onClose={() => setOpen(null)} />}
        <p className="mt-10 max-w-2xl text-base text-ink-2">{t.method}</p>
      </section>

      <aside id="board" className="scroll-mt-20 rounded-[2rem] bg-tile p-5 sm:p-7 lg:sticky lg:top-24 xl:top-28">
        <h2 className="title text-2xl">{t.board}</h2>
        {answered === 0 ? (
          <p className="mt-3 text-lg text-ink-2">{t.boardEmpty}</p>
        ) : (
          <>
            <ol className="relative mt-4" style={{ height: rows.ranked.length * ROW }}>
              {rows.ranked.map((r, i) => {
                const pct = Math.round(r.score! * 100);
                const d = delta(r.p.slug);
                return (
                  <li key={r.p.slug} className="absolute inset-x-0 transition-transform duration-500 ease-out" style={{ transform: `translateY(${i * ROW}px)`, height: ROW }}>
                    <button
                      type="button"
                      onClick={() => setOpen(open === r.p.slug ? null : r.p.slug)}
                      aria-expanded={open === r.p.slug}
                      className={`flex h-full w-full items-center gap-3 rounded-2xl px-2 text-start transition ${open === r.p.slug ? "bg-paper" : "hover:bg-paper/60"}`}
                    >
                      <span className="w-6 text-lg text-ink-2 tabular-nums">{i + 1}</span>
                      <Avatar name={r.p.name} src={r.p.face} color={r.p.color} size={40} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-lg font-medium">{r.p.name}</span>
                        <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-line">
                          <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: r.p.color }} />
                        </span>
                      </span>
                      <span className="text-base text-ink-2 tabular-nums" title={t.basedOn(r.overlap, answered)}>
                        {r.overlap}/{answered}
                      </span>
                      <span className="w-14 text-end text-lg font-medium tabular-nums">{pct}%</span>
                      <span className={`w-10 text-base tabular-nums ${d > 0 ? "text-[#1f8a5b]" : d < 0 ? "text-[#c2410c]" : "text-transparent"}`} aria-hidden>
                        {d > 0 ? `+${d}` : d < 0 ? d : "0"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <p className="mt-2 text-base text-ink-2">{t.coverage}</p>
            {rows.thin.length > 0 && (
              <details className="mt-5 border-t border-line pt-4">
                <summary className="cursor-pointer text-lg">
                  {t.thin} ({rows.thin.length})
                </summary>
                <p className="mt-2 text-base text-ink-2">{t.thinNote}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {rows.thin.map((r) => (
                    <li key={r.p.slug} className="rounded-full bg-paper px-3 py-1.5 text-base">
                      {r.p.name}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </>
        )}
      </aside>

      {/* Phones: the board sits under the questions, so the top three ride along at the bottom of the screen while answering. */}
      {answered > 0 && !done && rows.ranked.length > 0 && (
        <a href="#board" aria-label={t.board} className="fixed inset-x-3 bottom-3 z-30 flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-paper shadow-[0_18px_40px_-16px_rgb(0_12_31/0.6)] lg:hidden">
          <span className="flex flex-1 items-center justify-around gap-2">
            {rows.ranked.slice(0, 3).map((r) => (
              <span key={r.p.slug} className="flex items-center gap-1.5">
                <Avatar name={r.p.name} src={r.p.face} color={r.p.color} size={30} />
                <span className="text-base tabular-nums">{Math.round(r.score! * 100)}%</span>
              </span>
            ))}
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-5 shrink-0">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </a>
      )}
    </div>
  );
}

/** One party against the answers, question by question, with the quote behind each of its positions. */
function Breakdown({ axes, answers, party, onClose }: { axes: QAxis[]; answers: Answers; party: QParty; onClose: () => void }) {
  const t = useMessages(m).quiz;
  const items = axes.filter((a) => answers[a.id]);
  return (
    <section className="mt-10 rounded-[2rem] border border-line p-5 sm:p-7">
      <div className="flex items-center gap-4">
        <Avatar name={party.name} src={party.face} color={party.color} size={52} />
        <h3 className="title flex-1 text-2xl">{party.name}</h3>
        <button type="button" onClick={onClose} className="rounded-full bg-mist px-4 py-2 text-base transition hover:bg-mist-deep">
          ✕
        </button>
      </div>
      <ul className="mt-5 divide-y divide-line">
        {items.map((a) => {
          const you = a.scale.find((s) => s.level === answers[a.id].level)!;
          const lvl = party.levels[a.id];
          const them = a.scale.find((s) => s.level === lvl);
          const agree = lvl == null ? null : Math.round(agreement(a, answers[a.id].level, lvl) * 100);
          return (
            <li key={a.id} className="py-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-lg font-medium">{a.short}</p>
                {agree != null && <p className="text-lg tabular-nums">{agree}%</p>}
              </div>
              <p className="mt-1 text-lg text-ink-2">
                {t.you}: {you.short} · {t.them}: {them ? them.short : t.none}
              </p>
              {party.quotes[a.id] && (
                <blockquote className="mt-2 border-s-2 border-line-strong ps-4 text-lg">
                  ״{party.quotes[a.id].quote}״{" "}
                  {party.quotes[a.id].source_url && (
                    <a href={party.quotes[a.id].source_url} target="_blank" rel="noreferrer" className="text-base text-ink-2 underline underline-offset-4 hover:text-ink">
                      {t.source}
                    </a>
                  )}
                </blockquote>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
