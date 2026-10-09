"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMessages } from "@/i18n/link";
import { m } from "@/i18n/messages/games";
import { qm } from "@/i18n/messages/quiz-questions";
import { Avatar } from "@/components/avatar";
import { Sheet, Stage } from "@/components/game-stage";
import { H, W, COLORS, ShareSheet, drawFace, fitText, loadFaces, startCard, useDir } from "@/components/share-card";
import { agreement, score, type Answers, type QAxis, type QParty } from "@/lib/match";

/** A party gets a final percentage only once it has a coded position on at least half of the questions answered. */
const enough = (overlap: number, answered: number) => overlap >= Math.max(1, Math.ceil(answered / 2));

/** Points for one answer: 100 when the party gave the same answer, 0 at the far end, doubled on a starred question. */
type Phase = "intro" | "play" | "end";

/**
 * The quiz as a game on one screen. A question at a time; once you pick an answer the parties drop into the answers they
 * actually hold, so every answer shows who stands with you. Parties collect points as you go (no percentages on one answer,
 * which would mean nothing), and the end puts the closest three on a podium. Every number opens down to its quote.
 */
export function MatchQuiz({ axes: all, parties }: { axes: QAxis[]; parties: QParty[] }) {
  const t = useMessages(m).quiz;
  const words = useMessages(qm);
  // The questions most parties are coded on come first, so the first reveals are full. Each is asked in the quiz's own
  // wording, to the voter, rather than the map's coding rubric.
  const axes = useMemo(() => {
    const n = (a: QAxis) => parties.filter((p) => a.id in p.levels).length;
    const asked = all.map((a): QAxis => {
      const w = (words as Record<string, (typeof words)[keyof typeof words] | undefined>)[a.id];
      if (!w) return a;
      return { ...a, short: w.topic, question: w.question, scale: a.scale.map((s) => ({ ...s, label: w.answers[s.level - 1] ?? s.label, short: w.shorts[s.level - 1] ?? s.short })) };
    });
    return asked.sort((a, b) => n(b) - n(a));
  }, [all, parties, words]);
  const coded = useMemo(() => parties.filter((p) => Object.keys(p.levels).length > 0), [parties]);

  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [starred, setStarred] = useState<Record<string, boolean>>({});
  const [sheet, setSheet] = useState<string | null>(null); // the party whose "why" is open, or "all" for the full ranking

  const axis = axes[step];
  const mine = axis ? answers[axis.id] : undefined;
  const answered = Object.keys(answers).length;

  // The live standing: each party's agreement with the answers so far, out of the most it could have. No number is shown
  // while playing (a share after one answer means little); the bars and the order carry it, and the % waits for the end.
  const standing = useMemo(() => {
    const done = axes.filter((a) => answers[a.id]);
    const most = done.reduce((n, a) => n + answers[a.id].weight, 0);
    const share = (p: QParty) => (most ? done.reduce((n, a) => n + (a.id in p.levels ? agreement(a, answers[a.id].level, p.levels[a.id]) * answers[a.id].weight : 0), 0) / most : 0);
    return [...coded].map((p) => ({ p, share: share(p) })).sort((a, b) => b.share - a.share);
  }, [axes, answers, coded]);

  const ranked = useMemo(() => {
    const scored = coded.map((p) => ({ p, ...score(axes, answers, p) }));
    const ok = scored.filter((r) => r.score != null && enough(r.overlap, answered)).sort((a, b) => b.score! - a.score! || b.overlap - a.overlap);
    const thin = scored.filter((r) => !ok.includes(r));
    return { ok, thin };
  }, [axes, answers, answered, coded]);

  const pick = useCallback(
    (level: number) => {
      if (!axis) return;
      setAnswers((a) => ({ ...a, [axis.id]: { level, weight: starred[axis.id] ? 2 : 1 } }));
    },
    [axis, starred],
  );

  const next = useCallback(() => {
    if (step + 1 >= axes.length) setPhase("end");
    else setStep(step + 1);
  }, [axes.length, step]);

  function skip() {
    setAnswers((a) => {
      const n = { ...a };
      delete n[axis.id];
      return n;
    });
    next();
  }


  function restart() {
    setAnswers({});
    setStarred({});
    setSheet(null);
    setStep(0);
    setPhase("play");
  }

  // Keys: 1–n pick an answer, Enter moves on once one is picked.
  useEffect(() => {
    if (phase !== "play") return;
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable]"))) return;
      const n = Number(e.key);
      if (n >= 1 && n <= axis.scale.length) pick(axis.scale[n - 1].level);
      else if (e.key === "Enter" && mine && !(e.target instanceof HTMLButtonElement)) next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [axis, mine, next, phase, pick]);

  const sheetParty = sheet && sheet !== "all" ? coded.find((p) => p.slug === sheet) : null;

  // Sharing: the closest three on a card, and a link that carries them so a friend sees them before playing.
  const share = useMessages(m).share;
  const dir = useDir();
  const [sharing, setSharing] = useState(false);
  const top = useMemo(() => ranked.ok.slice(0, 3), [ranked]);
  const shareUrl =
    typeof window === "undefined" ? "" : `${window.location.origin}${window.location.pathname}?r=${top.map((r) => `${r.p.slug}.${Math.round(r.score! * 100)}`).join(",")}`;
  const draw = useCallback(async () => {
    const { canvas, ctx, f } = await startCard(dir, share.brand);
    const faces = await loadFaces(top.map((r) => r.p));
    ctx.textAlign = "center";
    ctx.fillStyle = COLORS.ink;
    ctx.font = `400 92px ${f.serif}`;
    ctx.fillText(share.quizCard, W / 2, 250);
    const [a, b, c] = top;
    if (a) {
      drawFace(ctx, faces[0], a.p, W / 2, 490, 140, f.sans, 12);
      ctx.fillStyle = COLORS.ink;
      fitText(ctx, a.p.name, W / 2, 685, 900, 64, 500, f.sans);
      ctx.font = `400 128px ${f.serif}`;
      ctx.fillText(`${Math.round(a.score! * 100)}%`, W / 2, 790);
    }
    [b, c].forEach((r, i) => {
      if (!r) return;
      // second on the start side, third on the other, as on the podium
      const x = W / 2 + (i === 0 ? 1 : -1) * (dir === "rtl" ? 230 : -230);
      drawFace(ctx, faces[i + 1], r.p, x, 945, 72, f.sans, 8);
      ctx.fillStyle = COLORS.ink;
      fitText(ctx, r.p.name, x, 1052, 400, 38, 500, f.sans);
      ctx.font = `400 60px ${f.serif}`;
      ctx.fillText(`${Math.round(r.score! * 100)}%`, x, 1115);
    });
    ctx.fillStyle = COLORS.flag;
    ctx.font = `500 40px ${f.sans}`;
    ctx.fillText(share.quizCta, W / 2, H - 120);
    return canvas;
  }, [dir, share, top]);

  return (
    <Stage>
      {phase === "intro" && <Intro parties={coded} all={parties} questions={axes.length} onStart={() => setPhase("play")} />}

      {phase === "play" && axis && (
        // Half and half: the question on the start side, and on the other the parties lining up live as the answers come in.
        <div className="scrollbar-none grid h-full grid-cols-[minmax(0,1fr)] overflow-y-auto lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
          <div className="scrollbar-none lg:min-h-0 lg:overflow-y-auto">
          <div key={axis.id} className="q-in mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-4 py-6 sm:px-8 sm:py-8">
            <div className="flex items-center gap-4">
              <p className="shrink-0 text-lg text-ink-2 tabular-nums">{t.progress(step + 1, axes.length)}</p>
              <ol className="flex flex-1 gap-1.5" aria-hidden>
                {axes.map((a, i) => (
                  <li key={a.id} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-[#0038b8]" : "bg-line-strong/60"}`} />
                ))}
              </ol>
            </div>

            <p className="mt-6 text-lg text-ink-2 sm:mt-10">{axis.short}</p>
            <h2 className="title mt-2 text-2xl leading-snug text-balance sm:text-4xl">{axis.question}</h2>

            <div className="mt-6 grid gap-2.5 sm:mt-8" role="group" aria-label={axis.question}>
              {axis.scale.map((s) => {
                const on = mine?.level === s.level;
                return (
                  <button
                    key={s.level}
                    type="button"
                    onClick={() => pick(s.level)}
                    aria-pressed={on}
                    className={`rounded-2xl px-4 py-3.5 text-start text-lg leading-snug transition sm:px-5 sm:py-4 sm:text-xl ${on ? "bg-[#0038b8] text-paper" : "bg-paper hover:bg-paper/60"}`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              {step > 0 && (
                <button type="button" onClick={() => setStep(step - 1)} className="rounded-full px-3 py-3 sm:px-4 text-lg text-ink-2 transition hover:text-ink">
                  {t.back}
                </button>
              )}
              <span className="flex-1" />
              {!mine && (
                <button type="button" onClick={skip} className="rounded-full px-3 py-3 sm:px-4 text-lg text-ink-2 transition hover:text-ink">
                  {t.skip}
                </button>
              )}
              <button
                type="button"
                onClick={next}
                disabled={!mine}
                className="rounded-full bg-ink px-6 py-3 whitespace-nowrap sm:px-8 text-lg font-medium text-paper transition hover:bg-accent disabled:opacity-30 disabled:hover:bg-ink"
              >
                {step + 1 >= axes.length ? t.finish : t.next}
              </button>
            </div>
          </div>
          </div>
          <div className="p-3 pt-0 sm:p-4 lg:min-h-0 lg:ps-0 lg:pt-4">
            <Standing title={t.live} note={answered > 0 ? t.liveNote : t.boardEmpty} rows={standing} started={answered > 0} />
          </div>
        </div>
      )}

      {phase === "end" && (
        <Podium
          ranked={ranked.ok}
          answered={answered}
          onWhy={(slug) => setSheet(slug)}
          onAll={() => setSheet("all")}
          onRestart={restart}
          onShare={() => setSharing(true)}
          onChange={() => {
            setStep(0);
            setPhase("play");
          }}
        />
      )}

      <ShareSheet open={sharing} onClose={() => setSharing(false)} draw={draw} url={shareUrl} text={top[0] ? share.quizText(top[0].p.name, Math.round(top[0].score! * 100)) : ""} file="my-match" />

      <Sheet open={sheet != null} onClose={() => setSheet(null)} title={sheetParty ? sheetParty.name : t.all} closeLabel={t.close}>
        {sheetParty ? (
          <Breakdown axes={axes} answers={answers} party={sheetParty} />
        ) : (
          <>
            <ol className="divide-y divide-line">
              {ranked.ok.map((r, i) => {
                const pct = Math.round(r.score! * 100);
                return (
                  <li key={r.p.slug}>
                    <button type="button" onClick={() => setSheet(r.p.slug)} className="flex w-full items-center gap-3 py-3 text-start transition hover:bg-mist/60">
                      <span className="w-7 text-center text-lg text-ink-2 tabular-nums">{i + 1}</span>
                      <Avatar name={r.p.name} src={r.p.face} color={r.p.color} size={44} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-lg font-medium">{r.p.name}</span>
                        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-mist-deep">
                          <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: r.p.color }} />
                        </span>
                      </span>
                      <span className="w-14 text-end text-xl font-medium tabular-nums">{pct}%</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            {ranked.thin.length > 0 && (
              <div className="mt-6 rounded-3xl bg-mist p-5">
                <p className="text-lg font-medium">{t.thin}</p>
                <p className="mt-1 text-base text-ink-2">{t.thinNote}</p>
                <p className="mt-3 text-lg">{ranked.thin.map((r) => r.p.name).join(" · ")}</p>
              </div>
            )}
            <p className="mt-6 text-base text-ink-2">{t.method}</p>
          </>
        )}
      </Sheet>
    </Stage>
  );
}

/** The start screen: the question in large type, the parties floating around it, one button. */
function Intro({ parties, all, questions, onStart }: { parties: QParty[]; all: QParty[]; questions: number; onStart: () => void }) {
  const t = useMessages(m).quiz;
  const s = useMessages(m).share;
  const ring = parties.slice(0, 16);
  // A shared link (?r=likud.83,shas.78) shows the friend's closest three before the start button.
  const [friend, setFriend] = useState<{ p: QParty; pct: number }[]>([]);
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("r") ?? "";
    const got = r
      .split(",")
      .map((x) => {
        const [slug, n] = x.split(".");
        const p = all.find((q) => q.slug === slug);
        const pct = Number(n);
        return p && pct >= 0 && pct <= 100 ? { p, pct } : null;
      })
      .filter((x): x is { p: QParty; pct: number } => x != null)
      .slice(0, 3);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the address is only readable in the browser
    setFriend(got);
  }, [all]);
  return (
    <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 max-sm:hidden">
        {ring.map((p, i) => {
          const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
          const size = i % 3 === 0 ? 88 : i % 3 === 1 ? 72 : 60;
          return (
            <span
              key={p.slug}
              className="absolute"
              style={{ left: `${(50 + Math.cos(a) * 42).toFixed(2)}%`, top: `${(50 + Math.sin(a) * 40).toFixed(2)}%`, translate: "-50% -50%" }}
            >
              <span className="hover-float block rounded-full p-[3px] shadow-[0_14px_30px_-16px_rgb(0_12_31/0.5)]" style={{ animationDelay: `${-i * 0.7}s`, background: p.color }}>
                <Avatar name={p.name} src={p.face} color={p.color} size={size} className="ring-2 ring-paper" />
              </span>
            </span>
          );
        })}
      </div>
      {/* A phone has no room for the ring around the title: the faces line up in one row above it instead. */}
      <div aria-hidden className="mb-6 flex -space-x-3 sm:hidden rtl:space-x-reverse">
        {ring.slice(0, 6).map((p) => (
          <span key={p.slug} className="rounded-full p-[2px]" style={{ background: p.color }}>
            <Avatar name={p.name} src={p.face} color={p.color} size={48} className="ring-2 ring-paper" />
          </span>
        ))}
      </div>
      <p className="relative rounded-full bg-paper px-4 py-1.5 text-lg text-ink-2">{t.meta(questions)}</p>
      <h1 className="serif relative mt-6 max-w-3xl text-6xl text-balance sm:text-7xl xl:text-8xl">{t.title}</h1>
      <p className="relative mt-6 max-w-xl text-xl text-ink-2 text-balance">{t.introNote}</p>
      {friend.length > 0 && (
        <div className="card-in relative mt-8 rounded-3xl bg-paper px-6 py-4 shadow-[0_14px_34px_-22px_rgb(0_12_31/0.5)]">
          <p className="text-lg text-ink-2">{s.friend}</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-4">
            {friend.map(({ p, pct }) => (
              <li key={p.slug} className="flex items-center gap-2">
                <Avatar name={p.name} src={p.face} color={p.color} size={40} />
                <span className="text-lg">{p.name}</span>
                <span className="text-lg font-medium tabular-nums">{pct}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button type="button" onClick={onStart} className="relative mt-10 rounded-full bg-ink px-10 py-4 text-xl font-medium text-paper transition hover:scale-[1.03] hover:bg-accent">
        {friend.length ? s.friendStart : t.start}
      </button>
    </div>
  );
}

type Ranked = { p: QParty; score: number | null; overlap: number };

/** The end: the closest party in the middle, the next two beside it, on pedestals. */
function Podium({
  ranked,
  answered,
  onWhy,
  onAll,
  onRestart,
  onShare,
  onChange,
}: {
  ranked: Ranked[];
  answered: number;
  onWhy: (slug: string) => void;
  onAll: () => void;
  onRestart: () => void;
  onShare: () => void;
  onChange: () => void;
}) {
  const s = useMessages(m).share;
  const t = useMessages(m).quiz;
  const [first, second, third] = ranked;
  if (!first)
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <h2 className="serif text-6xl">{t.noAnswers}</h2>
        <p className="mt-4 max-w-xl text-xl text-ink-2">{t.noAnswersNote}</p>
        <button type="button" onClick={onChange} className="mt-8 rounded-full bg-ink px-8 py-4 text-xl font-medium text-paper">
          {t.review}
        </button>
      </div>
    );
  // Order on the podium: second, first, third (the reading direction mirrors it on right-to-left pages).
  const spots = [
    { r: second, place: 2, h: "h-20 sm:h-28", face: 88, delay: 200 },
    { r: first, place: 1, h: "h-32 sm:h-44", face: 128, delay: 0 },
    { r: third, place: 3, h: "h-12 sm:h-16", face: 76, delay: 400 },
  ].filter((s) => s.r);
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-8 text-center sm:pt-10">
        <p className="text-lg text-ink-2">{t.best}</p>
        <h2 className="serif mt-2 text-5xl sm:text-6xl">{first.p.name}</h2>
      </div>
      <div className="flex min-h-0 flex-1 items-end justify-center gap-3 px-4 sm:gap-5">
        {spots.map(({ r, place, h, face, delay }) => {
          const pct = Math.round(r!.score! * 100);
          return (
            <button key={r!.p.slug} type="button" onClick={() => onWhy(r!.p.slug)} className="card-in group flex w-32 flex-col items-center sm:w-52" style={{ animationDelay: `${delay}ms` }}>
              <span className="rounded-full p-1 transition group-hover:scale-105" style={{ background: r!.p.color }}>
                <Avatar name={r!.p.name} src={r!.p.face} color={r!.p.color} size={face} className="ring-4 ring-mist" />
              </span>
              {place !== 1 && <span className="mt-3 line-clamp-2 text-center text-lg leading-tight">{r!.p.name}</span>}
              <span className={`serif mt-2 tabular-nums ${place === 1 ? "text-7xl" : "text-5xl"}`}>{pct}%</span>
              <span className="text-base text-muted">{t.basedOn(r!.overlap, answered)}</span>
              <span
                className={`mt-3 flex w-full items-start justify-center rounded-t-2xl pt-3 text-3xl font-medium ${h}`}
                style={{ background: `color-mix(in srgb, ${r!.p.color} ${place === 1 ? 85 : 22}%, white)`, color: place === 1 ? "white" : "var(--ink)" }}
              >
                {place}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 border-t border-line px-5 py-4">
        <button type="button" onClick={onShare} className="flex items-center gap-2 rounded-full bg-[#0038b8] px-7 py-3 text-lg font-medium text-paper shadow-[0_14px_30px_-14px_rgb(0_56_184/0.8)] transition hover:bg-accent">
          <ShareIcon />
          {s.quizButton}
        </button>
        <button type="button" onClick={() => onWhy(first.p.slug)} className="rounded-full bg-ink px-7 py-3 text-lg font-medium text-paper transition hover:bg-accent">
          {t.why}
        </button>
        <button type="button" onClick={onAll} className="rounded-full bg-paper px-6 py-3 text-lg transition hover:bg-mist-deep">
          {t.all}
        </button>
        <button type="button" onClick={onChange} className="rounded-full px-5 py-3 text-lg text-ink-2 transition hover:bg-mist-deep hover:text-ink">
          {t.review}
        </button>
        <button type="button" onClick={onRestart} className="rounded-full px-5 py-3 text-lg text-ink-2 transition hover:bg-mist-deep hover:text-ink">
          {t.restart}
        </button>
      </div>
    </div>
  );
}

/** One party against the answers, question by question: both picks marked on the question's own scale, then the quote. */
function Breakdown({ axes, answers, party }: { axes: QAxis[]; answers: Answers; party: QParty }) {
  const t = useMessages(m).quiz;
  const items = axes.filter((a) => answers[a.id]);
  return (
    <ul className="divide-y divide-line">
      {items.map((a) => {
        const mine = answers[a.id].level;
        const lvl = party.levels[a.id];
        const agree = lvl == null ? null : Math.round(agreement(a, mine, lvl) * 100);
        const q = party.quotes[a.id];
        return (
          <li key={a.id} className="py-5 first:pt-0">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-lg font-medium">
                {a.short}
                {answers[a.id].weight === 2 && <Star filled className="ms-2 inline size-4 align-[-1px] text-[#c99a1e]" />}
              </p>
              <p className={`rounded-full px-3 py-0.5 text-base tabular-nums ${agree == null ? "bg-mist text-ink-2" : agree >= 67 ? "bg-[#e3f3eb] text-[#1f7a52]" : agree >= 34 ? "bg-[#fbf3e1] text-[#8a5a0b]" : "bg-[#fbeee6] text-[#b4440f]"}`}>
                {agree == null ? t.none : `${agree}%`}
              </p>
            </div>
            <div className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${a.scale.length}, minmax(0, 1fr))` }}>
              {a.scale.map((s) => {
                const you = s.level === mine;
                const them = s.level === lvl;
                return (
                  <div key={s.level} className={`flex min-h-20 flex-col items-center justify-between gap-1 rounded-2xl p-2 text-center ${you || them ? "bg-mist" : "bg-tile/60"} ${you ? "ring-2 ring-ink ring-inset" : ""}`}>
                    <span className="flex items-center gap-1">
                      {you && <span className="rounded-full bg-ink px-2 py-0.5 text-base leading-tight text-paper">{t.you}</span>}
                      {them && <Avatar name={party.name} src={party.face} color={party.color} size={28} />}
                    </span>
                    <span className={`text-base leading-tight ${you || them ? "text-ink" : "text-ink-2"}`}>{s.short}</span>
                  </div>
                );
              })}
            </div>
            {q && (
              <blockquote className="mt-3 border-s-2 border-line-strong ps-4 text-lg">
                ״{q.quote}״{" "}
                {q.source_url && (
                  <a href={q.source_url} target="_blank" rel="noreferrer" className="text-base text-ink-2 underline underline-offset-4 hover:text-ink">
                    {t.source}
                  </a>
                )}
              </blockquote>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Star({ filled, className = "size-5" }: { filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden className={className}>
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-5">
      <path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
    </svg>
  );
}

const ROW = 52; // one row of the live standing, in px: rows slide between fixed slots as the order changes

/**
 * The live standing beside the question: every party as a face, a name and a bar for how close it is to the answers so far.
 * Rows sit at fixed slots and glide to their new place after each answer, the bars growing and shrinking with them. On a
 * phone only the first five show.
 */
function Standing({ title, note, rows, started }: { title: string; note: string; rows: { p: QParty; share: number }[]; started: boolean }) {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-[1.75rem] bg-paper p-4 sm:p-6">
      <h2 className="title text-2xl">{title}</h2>
      <p className="mt-1 text-lg text-ink-2">{note}</p>
      <div className="scrollbar-none mt-4 min-h-0 flex-1 lg:overflow-y-auto">
        <ol className="relative h-[calc(5*52px)] max-lg:overflow-hidden lg:h-[calc(var(--n)*52px)]" style={{ "--n": rows.length } as React.CSSProperties}>
          {rows.map(({ p, share }, i) => (
            <li
              key={p.slug}
              className={`absolute inset-x-0 flex items-center gap-3 rounded-2xl px-2 transition-[top,opacity] duration-700 ease-in-out ${i >= 5 ? "max-lg:pointer-events-none max-lg:opacity-0" : ""} ${i === 0 && started ? "bg-mist" : ""}`}
              style={{ top: i * ROW, height: ROW - 4 }}
            >
              <Avatar name={p.name} src={p.face} color={p.color} size={36} />
              <span className="min-w-0 flex-1 truncate text-lg sm:w-48 sm:flex-none">{p.name}</span>
              <span className={`h-2.5 w-16 shrink-0 overflow-hidden rounded-full sm:w-auto sm:flex-1 transition-colors duration-700 ${started ? "bg-mist-deep" : "bg-transparent"}`}>
                <span className="block h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${Math.round(share * 100)}%`, background: p.color }} />
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
