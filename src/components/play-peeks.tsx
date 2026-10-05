"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link, { localePath, useLocale, useMessages } from "@/i18n/link";
import { defineMessages } from "@/i18n/messages";
import { m } from "@/i18n/messages/games";
import { Avatar } from "@/components/avatar";
import { TopicIllustration } from "@/components/illustration";
import { Verdict } from "@/components/coalition-builder";
import type { QAxis, QParty } from "@/lib/match";
import type { TopicKey } from "@/lib/topics";

const pm = defineMessages(
  {
    sample: (i: number, n: number) => `שאלה ${i} מתוך ${n} בשאלון`,
    howTo: "בחרו את התשובה הכי קרובה אליכם, ותראו אילו מפלגות ענו כמוכם.",
    others: "ענו אחרת",
    another: "שאלה אחרת",
    full: (n: number) => `לשאלון המלא (${n} שאלות)`,
  },
  {
    en: {
      sample: (i: number, n: number) => `Question ${i} of ${n} in the quiz`,
      howTo: "Pick the answer closest to yours and see which parties answered the same.",
      others: "Answered differently",
      another: "Another question",
      full: (n: number) => `The full quiz (${n} questions)`,
    },
    ar: {
      sample: (i: number, n: number) => `السؤال ${i} من ${n} في الاستبيان`,
      howTo: "اختاروا الإجابة الأقرب إليكم، وشاهدوا أي الأحزاب أجابت مثلكم.",
      others: "أجابت بشكل مختلف",
      another: "سؤال آخر",
      full: (n: number) => `الاستبيان الكامل (${n} أسئلة)`,
    },
    ru: {
      sample: (i: number, n: number) => `Вопрос ${i} из ${n} в тесте`,
      howTo: "Выберите самый близкий вам ответ и посмотрите, какие партии ответили так же.",
      others: "Ответили иначе",
      another: "Другой вопрос",
      full: (n: number) => `Весь тест (вопросов: ${n})`,
    },
    am: {
      sample: (i: number, n: number) => `በመጠይቁ ውስጥ ከ${n} ጥያቄዎች ${i}ኛው`,
      howTo: "ለእርስዎ በጣም የቀረበውን መልስ ይምረጡ፣ የትኞቹ ፓርቲዎች እንደ እርስዎ እንደመለሱ ይመልከቱ።",
      others: "በተለየ መልኩ የመለሱ",
      another: "ሌላ ጥያቄ",
      full: (n: number) => `ሙሉው መጠይቅ (${n} ጥያቄዎች)`,
    },
  },
);

function Chip({ p, size = 30, dim = false }: { p: QParty; size?: number; dim?: boolean }) {
  return (
    <span className={`flex max-w-full items-center gap-2 rounded-full bg-paper py-1 ps-1 pe-3 ${dim ? "opacity-60 grayscale" : ""}`}>
      <Avatar name={p.name} src={p.face} color={p.color} size={size} />
      <span className="truncate text-base">{p.name}</span>
    </span>
  );
}

/**
 * One of the quiz's questions on the home page, playable. Pick an answer and one plain result shows under the answers: the
 * parties that answered the same, then the ones that answered otherwise (each with its answer), then the main lists with no
 * quoted position, greyed. "Another question" steps through the quiz's questions; the button opens the whole quiz.
 */
export function QuizPeek({ axes, parties }: { axes: QAxis[]; parties: QParty[] }) {
  const t = useMessages(m).quiz;
  const p = useMessages(pm);
  // The quiz's own order: the questions most parties are coded on first.
  const n = (a: QAxis) => parties.filter((x) => a.id in x.levels).length;
  const order = [...axes].sort((a, b) => n(b) - n(a));
  const [step, setStep] = useState(0);
  const [mine, setMine] = useState<number | null>(null);
  const axis = order[step];
  if (!axis) return null;
  const coded = parties.filter((x) => axis.id in x.levels);
  const same = mine == null ? [] : coded.filter((x) => x.levels[axis.id] === mine);
  const other = mine == null ? [] : coded.filter((x) => x.levels[axis.id] !== mine);
  const silent = parties.filter((x) => x.tier === "main" && !(axis.id in x.levels));
  const short = (lvl: number) => axis.scale.find((s) => s.level === lvl)?.short ?? "";
  const next = () => {
    setStep((i) => (i + 1) % order.length);
    setMine(null);
  };

  return (
    <div className="rounded-[2rem] bg-mist p-4 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-paper sm:size-14">
          <TopicIllustration topic={axis.topic as TopicKey} className="!w-9 sm:!w-10" />
        </span>
        <p className="text-base text-ink-2 sm:text-lg">{p.sample(step + 1, order.length)}</p>
      </div>
      <h3 className="title mt-4 max-w-3xl text-2xl leading-snug text-balance sm:text-3xl">{axis.question}</h3>
      <p className="mt-2 text-lg text-ink-2">{p.howTo}</p>

      <div className="mt-5 grid gap-2 md:grid-cols-2" role="group" aria-label={axis.question}>
        {axis.scale.map((s, i) => {
          const on = mine === s.level;
          return (
            <button
              key={s.level}
              type="button"
              onClick={() => setMine(s.level)}
              aria-pressed={on}
              className={`flex items-center gap-3 rounded-3xl p-4 text-start transition ${on ? "bg-[#0038b8] text-paper" : mine != null ? "bg-paper/60 text-ink-2 hover:bg-paper" : "bg-paper hover:shadow-[0_12px_28px_-18px_rgb(0_12_31/0.45)]"}`}
            >
              <span className={`grid size-8 shrink-0 place-items-center rounded-full text-base tabular-nums ${on ? "bg-paper text-[#0038b8]" : "bg-mist text-ink-2"}`}>{i + 1}</span>
              <span className={`text-lg leading-snug sm:text-xl ${on ? "font-medium" : ""}`}>{s.label}</span>
            </button>
          );
        })}
      </div>

      {mine != null && (
        <div key={`${axis.id} ${mine}`} className="card-in mt-4 rounded-3xl bg-paper/70 p-4 sm:p-5">
          <p className="text-xl font-medium">{t.withYou(same.length)}</p>
          {same.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {same.map((x) => (
                <Chip key={x.slug} p={x} size={34} />
              ))}
            </div>
          )}
          {other.length > 0 && (
            <>
              <p className="mt-5 text-lg text-ink-2">{p.others}</p>
              <ul className="mt-2 space-y-2">
                {[...new Set(other.map((x) => x.levels[axis.id]))].sort((x, y) => x - y).map((lvl) => (
                  <li key={lvl} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <span className="text-base text-ink-2 sm:w-56 sm:shrink-0">{short(lvl)}</span>
                    <span className="flex flex-wrap gap-1.5">
                      {other.filter((x) => x.levels[axis.id] === lvl).map((x) => (
                        <Chip key={x.slug} p={x} size={26} />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {silent.length > 0 && (
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-base text-ink-2 sm:w-56 sm:shrink-0">{t.noQuote}</span>
              <span className="flex flex-wrap gap-1.5">
                {silent.map((x) => (
                  <Chip key={x.slug} p={x} size={26} dim />
                ))}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link href="/quiz" className="inline-flex h-14 items-center justify-center rounded-full bg-ink px-7 text-lg font-medium text-paper transition hover:bg-accent">
          {p.full(order.length)}
        </Link>
        <button type="button" onClick={next} className="inline-flex h-14 items-center justify-center rounded-full bg-paper px-7 text-lg font-medium transition hover:bg-mist-deep">
          {p.another}
        </button>
      </div>
    </div>
  );
}

/**
 * The coalition game's heart on the home page: pick the main parties, and see at once on which questions they agree and on
 * which they would argue. Seats are left to the builder, where the picked parties go along.
 */
export function CoalitionPeek({ axes, parties }: { axes: QAxis[]; parties: QParty[] }) {
  const t = useMessages(m).coalition;
  const lang = useLocale();
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>([]);
  const main = parties.filter((p) => p.tier === "main");
  const members = picked.map((s) => parties.find((p) => p.slug === s)!);
  const toggle = (slug: string) => setPicked((c) => (c.includes(slug) ? c.filter((x) => x !== slug) : [...c, slug]));
  const open = () => router.push(localePath(lang, picked.length ? `/coalition?s=${picked.map((s) => `${s}.4`).join(",")}&c=${picked.join(",")}` : "/coalition"));

  return (
    <div className="grid gap-4 rounded-[2rem] bg-mist p-4 sm:p-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <div>
        <p className="px-1 text-lg text-ink-2">{t.addHint}</p>
        <ul className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          {main.map((p) => {
            const on = picked.includes(p.slug);
            return (
              <li key={p.slug}>
                <button
                  type="button"
                  onClick={() => toggle(p.slug)}
                  aria-pressed={on}
                  className={`flex w-full items-center gap-3 rounded-full p-1.5 pe-4 text-start text-lg leading-tight transition ${on ? "bg-ink text-paper" : "bg-paper hover:bg-mist-deep lg:bg-transparent lg:hover:bg-paper"}`}
                >
                  <Avatar name={p.name} src={p.face} color={p.color} size={36} />
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <span aria-hidden className="text-xl leading-none">{on ? "✓" : "+"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <Verdict axes={axes} members={members} t={t} onOpen={open} />
    </div>
  );
}
