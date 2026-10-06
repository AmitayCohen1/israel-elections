"use client";

import Link, { useMessages } from "@/i18n/link";
import { defineMessages } from "@/i18n/messages";
import { positionLabels } from "@/i18n/messages/positions";
import { arCount, ruPlural } from "@/i18n/messages/plural";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/avatar";

const m = defineMessages(
  {
    others: (n: number) => `עוד ${n} מפלגות`,
    place: (p: number): [string, string] => (p === 1 ? ["בראש רשימת ", ""] : [`מקום ${p} ברשימת `, ""]),
    sitting: (n: number) => (n === 1 ? "חבר כנסת מכהן אחד ברשימה" : `${n} חברי כנסת מכהנים ברשימה`),

    moreAbout: (name: string) => `עוד על ${name}`,
    noBackground: (name: string) => `עוד לא מצאנו רקע על ${name}.`,
    team: (list: string) => `המועמדים המובילים של ${list}`,
    toPage: (name: string) => `לעמוד של ${name}`,
    wholeList: "לרשימת המועמדים המלאה",
    whatPartiesSay: "עמדות לפי נושא",
    pick: "בחרו שם כדי לקרוא עליו.",
  },
  {
    en: {
      others: (n: number) => `${n} more ${n === 1 ? "party" : "parties"}`,
      place: (p: number): [string, string] => (p === 1 ? ["Heads the candidate list for ", ""] : [`No. ${p} on the candidate list for `, ""]),
      sitting: (n: number) => `${n} sitting ${n === 1 ? "MK" : "MKs"} on the list`,

      moreAbout: (name: string) => `More about ${name}`,
      noBackground: (name: string) => `We haven't found any background on ${name} yet.`,
      team: (list: string) => `Leading candidates for ${list}`,
      toPage: (name: string) => `${name}'s page`,
      wholeList: "View the full candidate list",
      whatPartiesSay: "Party positions",
      pick: "Pick a name to read about them.",
    },
    ar: {
      others: (n: number) => `${arCount(n, ["حزب آخر", "حزبان آخران", "أحزاب أخرى", "حزبًا آخر"])}`,
      place: (p: number): [string, string] => (p === 1 ? ["على رأس قائمة مرشحي ", ""] : [`المرتبة ${p} في قائمة مرشحي `, ""]),
      sitting: (n: number) => `${arCount(n, ["عضو كنيست حالي واحد", "عضوا كنيست حاليان", "أعضاء كنيست حاليين", "عضو كنيست حاليًا"])} في القائمة`,

      moreAbout: (name: string) => `المزيد عن ${name}`,
      noBackground: (name: string) => `لم نجد بعد خلفية عن ${name}.`,
      team: (list: string) => `فريق ${list}`,
      toPage: (name: string) => `إلى صفحة ${name}`,
      wholeList: "إلى قائمة المرشحين كاملة",
      whatPartiesSay: "مواقف الأحزاب",
      pick: "اختاروا اسمًا لتقرؤوا عنه.",
    },
    ru: {
      others: (n: number) => `Ещё ${n} ${ruPlural(n, "партия", "партии", "партий")}`,
      place: (p: number): [string, string] => (p === 1 ? ["Во главе списка кандидатов: ", ""] : [`№${p} в списке кандидатов: `, ""]),
      sitting: (n: number) => `${n} ${ruPlural(n, "действующий депутат", "действующих депутата", "действующих депутатов")} Кнессета в списке`,

      moreAbout: (name: string) => `Подробнее: ${name}`,
      noBackground: (name: string) => `Справки пока нет: ${name}.`,
      team: (list: string) => `Команда: ${list}`,
      toPage: (name: string) => `Страница: ${name}`,
      wholeList: "Полный список кандидатов",
      whatPartiesSay: "Позиции партий",
      pick: "Выберите имя, чтобы прочитать о человеке.",
    },
    am: {
      others: (n: number) => `ሌሎች ${n} ፓርቲዎች`,
      place: (p: number): [string, string] => (p === 1 ? ["የ", " የእጩ ዝርዝርን ይመራል"] : ["በ", ` የእጩ ዝርዝር ውስጥ ቁጥር ${p}`]),
      sitting: (n: number) => (n === 1 ? "በዝርዝሩ ውስጥ አንድ የአሁን የክኔሴት አባል" : `በዝርዝሩ ውስጥ ${n} የአሁን የክኔሴት አባላት`),

      moreAbout: (name: string) => `ስለ ${name} ተጨማሪ`,
      noBackground: (name: string) => `ስለ ${name} ገና ዳራ አላገኘንም።`,
      team: (list: string) => `የ${list} ቡድን`,
      toPage: (name: string) => `ወደ ${name} ገጽ`,
      wholeList: "ወደ ሙሉው የእጩ ዝርዝር",
      whatPartiesSay: "የፓርቲዎች አቋሞች",
      pick: "ስለ እሱ ለማንበብ ስም ይምረጡ።",
    },
  },
);

export type PersonFact = { label: string; value: string; url?: string };
export type PersonCard = { position: number; name: string; img: string | null; role: string | null; line: string | null; bio: string | null; facts: PersonFact[] };
export type LeaderEntry = { slug: string; listName: string; color: string | null; main: boolean; sittingMks: number; people: PersonCard[] };

/**
 * Meet the heads of the lists: the leader of every list as one row on the start side, and the one you pick read in full beside it.
 * The rest of the top five ("the team") is one tap away. Equal treatment: every list is the same row, in random order.
 */
export function PeopleExplorer({ leaders }: { leaders: LeaderEntry[] }) {
  const t = useMessages(m);
  const labels = useMessages(positionLabels);
  const [order, setOrder] = useState<LeaderEntry[] | null>(null);
  const [sel, setSel] = useState<{ slug: string; pos: number } | null>(null);

  useEffect(() => {
    // Randomness exists only in the browser: the server always renders the same HTML, so the order and the first pick are set after hydration.
    const shuffled = [...leaders];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(shuffled);
    // Open on someone we have something to say about, so the page is never first seen empty.
    const first = shuffled.find((l) => l.people[0]?.facts.length) ?? shuffled.find((l) => l.main) ?? shuffled[0];
    setSel({ slug: first.slug, pos: 1 });
  }, [leaders]);

  const rows = order ?? leaders;
  const main = rows.filter((l) => l.main);
  const other = rows.filter((l) => !l.main);
  const list = leaders.find((l) => l.slug === sel?.slug);
  const person = list?.people.find((p) => p.position === sel?.pos);
  const team = list?.people ?? [];

  const row = (l: LeaderEntry) => {
    const lead = l.people[0];
    if (!lead) return null;
    const on = sel?.slug === l.slug;
    return (
      <li key={l.slug} className="shrink-0">
        <button
          type="button"
          onClick={() => setSel({ slug: l.slug, pos: 1 })}
          aria-pressed={on}
          className={`flex w-28 flex-col items-center gap-1.5 rounded-2xl p-2 text-center transition lg:w-full lg:flex-row lg:gap-5 lg:px-3 lg:py-3 lg:text-start ${on ? "bg-mist" : "hover:bg-mist/60"}`}
        >
          <Avatar name={lead.name} src={lead.img} color={l.color} size={88} />
          <span className="w-full min-w-0 lg:w-auto lg:flex-1">
            <span className={`block truncate text-lg leading-tight lg:text-xl ${on ? "title" : "font-medium"}`}>{lead.name}</span>
            <span className="block truncate text-lg leading-tight text-ink-2 lg:text-lg">{l.listName}</span>
          </span>
        </button>
      </li>
    );
  };

  return (
    <div className={`grid items-start gap-6 lg:grid-cols-[28rem_minmax(0,1fr)] lg:gap-14 ${order ? "" : "[&_ul]:invisible"}`}>
      {/* The picker: a strip of faces on phones, a scrolling list beside the person on wide screens. */}
      <div className="scrollbar-none -mx-4 overflow-x-auto px-4 sm:-mx-8 sm:px-8 lg:sticky lg:top-24 xl:top-28 lg:mx-0 lg:max-h-[calc(100dvh-8rem)] xl:max-h-[calc(100dvh-9rem)] lg:overflow-y-auto lg:overflow-x-visible lg:px-0">
        <ul className="flex gap-1 lg:flex-col">{main.map(row)}</ul>
        {other.length > 0 && (
          <details className="group mt-3 hidden border-t border-line pt-3 lg:block">
            <summary className="cursor-pointer px-3 text-lg font-semibold text-accent underline-offset-4 hover:underline">{t.others(other.length)}</summary>
            <ul className="mt-2 flex flex-col gap-1">{other.map(row)}</ul>
          </details>
        )}
      </div>

      <article key={`${sel?.slug}-${sel?.pos}`} className="min-w-0 max-w-2xl">
        {person && list ? (
          <>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
              <Avatar name={person.name} src={person.img} color={list.color} size={120} />
              <div className="min-w-0">
                <h2 className="serif text-4xl leading-tight text-balance sm:text-5xl">{person.name}</h2>
                <p className="mt-1.5 text-xl text-ink-2">
                  {t.place(person.position)[0]}
                  <Link href={`/lists/${list.slug}`} className="font-medium text-ink underline-offset-4 hover:underline">
                    {list.listName}
                  </Link>
                  {t.place(person.position)[1]}
                  {person.role && <span> · {person.role}</span>}
                </p>
                {list.sittingMks > 0 && <p className="mt-0.5 text-lg text-ink-2">{t.sitting(list.sittingMks)}</p>}
              </div>
            </div>

            {person.line && <p className="mt-6 text-2xl leading-snug text-pretty">{person.line}</p>}

            {person.facts.length > 0 && (
              <dl className="mt-6 divide-y divide-line border-t border-line">
                {person.facts.map((f, i) => (
                  <div key={i} className="grid items-baseline gap-x-4 gap-y-0.5 py-3 sm:grid-cols-[11rem_1fr]">
                    <dt className="text-lg text-ink-2">{f.label}</dt>
                    <dd className="text-xl text-pretty">
                      {f.value}
                      {f.url && (
                        <a href={f.url} target="_blank" rel="noreferrer" aria-label={labels.source} title={labels.source} className="ms-1.5 text-lg text-ink-2 transition hover:text-accent">
                          ↗
                        </a>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {person.bio &&
              (person.facts.length > 0 ? (
                <details className="group mt-4">
                  <summary className="inline-block cursor-pointer text-lg font-semibold text-accent underline-offset-4 hover:underline">{t.moreAbout(person.name)}</summary>
                  <p className="mt-2 text-xl leading-relaxed text-pretty text-ink-2">{person.bio}</p>
                </details>
              ) : (
                <p className="mt-5 text-xl leading-relaxed text-pretty text-ink-2">{person.bio}</p>
              ))}
            {!person.bio && !person.line && person.facts.length === 0 && <p className="mt-6 text-xl text-ink-2">{t.noBackground(person.name)}</p>}

            {team.length > 1 && (
              <div className="mt-10">
                <h3 className="mb-3 text-lg text-ink-2">{t.team(list.listName)}</h3>
                <ul className="flex flex-wrap gap-2">
                  {team.map((p) => (
                    <li key={p.position}>
                      <button
                        type="button"
                        onClick={() => setSel({ slug: list.slug, pos: p.position })}
                        aria-pressed={p.position === person.position}
                        className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-lg transition ${p.position === person.position ? "border-ink font-medium" : "border-line hover:border-ink-2"}`}
                      >
                        <span className="text-lg text-ink-2 tabular-nums">{p.position}</span>
                        {p.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-lg font-medium">
              <Link href={`/lists/${list.slug}/${person.position}`} className="rounded-full bg-ink px-5 py-2.5 text-paper transition hover:bg-accent">
                {t.toPage(person.name)}
              </Link>
              <Link href={`/lists/${list.slug}`} className="text-accent underline-offset-4 hover:underline">
                {t.wholeList}
              </Link>
              <Link href="/topics" className="text-accent underline-offset-4 hover:underline">
                {t.whatPartiesSay}
              </Link>
            </p>
          </>
        ) : (
          <p className="py-10 text-xl text-ink-2">{t.pick}</p>
        )}
      </article>
    </div>
  );
}
