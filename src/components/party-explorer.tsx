"use client";

import Link, { useMessages } from "@/i18n/link";
import { defineMessages } from "@/i18n/messages";
import { useState } from "react";
import { Avatar } from "@/components/avatar";
import { Ballot } from "@/components/ballot";

const m = defineMessages(
  {
    leads: (name: string) => `בראש הרשימה: ${name}`,
    onList: "ברשימה",
    openParty: (name: string) => `לעמוד של ${name}`,
    whatPartiesSay: "מה המפלגות אומרות",
    noSummary: "עוד לא כתבנו תקציר על המפלגה הזאת.",
    pick: "בחרו מפלגה כדי לקרוא עליה.",
  },
  {
    en: {
      leads: (name: string) => `Heads the list: ${name}`,
      onList: "On the list",
      openParty: (name: string) => `${name}'s page`,
      whatPartiesSay: "What the parties say",
      noSummary: "We haven't written a summary for this party yet.",
      pick: "Pick a party to read about it.",
    },
    ar: {
      leads: (name: string) => `يرأس القائمة: ${name}`,
      onList: "في القائمة",
      openParty: (name: string) => `إلى صفحة ${name}`,
      whatPartiesSay: "ماذا تقول الأحزاب",
      noSummary: "لم نكتب بعد ملخصًا عن هذا الحزب.",
      pick: "اختاروا حزبًا لتقرؤوا عنه.",
    },
    ru: {
      leads: (name: string) => `Во главе списка: ${name}`,
      onList: "В списке",
      openParty: (name: string) => `Страница: ${name}`,
      whatPartiesSay: "Что говорят партии",
      noSummary: "Краткого описания этой партии у нас пока нет.",
      pick: "Выберите партию, чтобы прочитать о ней.",
    },
    am: {
      leads: (name: string) => `የዝርዝሩ መሪ፦ ${name}`,
      onList: "በዝርዝሩ ውስጥ",
      openParty: (name: string) => `ወደ ${name} ገጽ`,
      whatPartiesSay: "ፓርቲዎች ምን ይላሉ",
      noSummary: "ስለዚህ ፓርቲ ገና ማጠቃለያ አልጻፍንም።",
      pick: "ስለ ፓርቲው ለማንበብ ይምረጡ።",
    },
  },
);

export type PartyEntry = {
  slug: string;
  name: string;
  color: string | null;
  letters: string;
  main: boolean;
  leader: { name: string; img: string | null } | null;
  summary: string | null;
  candidatesLabel: string;
  positionsLabel: string;
  top: { position: number; name: string }[];
};

/**
 * The parties, laid out like the party heads: one row per party on the start side, and the one you pick read beside it.
 * Same sidebar, same rhythm; the order is the official order of the Central Elections Committee.
 */
export function PartyExplorer({ parties, moreLabel }: { parties: PartyEntry[]; moreLabel: string }) {
  const t = useMessages(m);
  const [slug, setSlug] = useState(parties.find((p) => p.main)?.slug ?? parties[0]?.slug);
  const main = parties.filter((p) => p.main);
  const other = parties.filter((p) => !p.main);
  const sel = parties.find((p) => p.slug === slug);

  const row = (p: PartyEntry) => {
    const on = p.slug === slug;
    return (
      <li key={p.slug} className="shrink-0">
        <button
          type="button"
          onClick={() => setSlug(p.slug)}
          aria-pressed={on}
          className={`flex w-28 flex-col items-center gap-1.5 rounded-2xl p-2 text-center transition lg:w-full lg:flex-row lg:gap-5 lg:px-3 lg:py-3 lg:text-start ${on ? "bg-mist" : "hover:bg-mist/60"}`}
        >
          <Avatar name={p.leader?.name ?? p.name} src={p.leader?.img ?? null} color={p.color} size={88} />
          <span className="min-w-0 lg:flex-1">
            <span className={`block truncate text-lg leading-tight lg:text-xl ${on ? "title" : "font-medium"}`}>{p.name}</span>
            {p.leader && <span className="block truncate text-lg leading-tight text-ink-2 lg:text-lg">{p.leader.name}</span>}
          </span>
        </button>
      </li>
    );
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[28rem_minmax(0,1fr)] lg:gap-14">
      <div className="scrollbar-none -mx-4 overflow-x-auto px-4 sm:-mx-8 sm:px-8 lg:sticky lg:top-24 xl:top-28 lg:mx-0 lg:max-h-[calc(100dvh-8rem)] xl:max-h-[calc(100dvh-9rem)] lg:overflow-y-auto lg:overflow-x-visible lg:px-0">
        <ul className="flex gap-1 lg:flex-col">{main.map(row)}</ul>
        {other.length > 0 && (
          <details className="group mt-3 hidden border-t border-line pt-3 lg:block">
            <summary className="cursor-pointer px-3 text-lg font-semibold text-accent underline-offset-4 hover:underline">
              {moreLabel} · {other.length}
            </summary>
            <ul className="mt-2 flex flex-col gap-1">{other.map(row)}</ul>
          </details>
        )}
      </div>

      <article key={sel?.slug} className="min-w-0 max-w-2xl">
        {sel ? (
          <>
            <div className="flex items-center gap-5">
              <Avatar name={sel.leader?.name ?? sel.name} src={sel.leader?.img ?? null} color={sel.color} size={120} />
              <div className="min-w-0 flex-1">
                <h2 className="serif text-4xl leading-tight text-balance sm:text-5xl">{sel.name}</h2>
                {sel.leader && <p className="mt-1.5 text-xl text-ink-2">{t.leads(sel.leader.name)}</p>}
                <p className="mt-0.5 text-lg text-ink-2">
                  {sel.candidatesLabel} · {sel.positionsLabel}
                </p>
              </div>
              <Ballot letters={sel.letters} color={sel.color} size="sm" />
            </div>

            <p className="mt-6 text-2xl leading-snug text-pretty">{sel.summary ?? <span className="text-ink-2">{t.noSummary}</span>}</p>

            {sel.top.length > 0 && (
              <div className="mt-10">
                <h3 className="mb-3 text-lg text-ink-2">{t.onList}</h3>
                <ul className="flex flex-wrap gap-2">
                  {sel.top.map((c) => (
                    <li key={c.position}>
                      <Link href={`/lists/${sel.slug}/${c.position}`} className="flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-lg transition hover:border-ink-2">
                        <span className="text-lg text-ink-2 tabular-nums">{c.position}</span>
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-lg font-medium">
              <Link href={`/lists/${sel.slug}`} className="rounded-full bg-ink px-5 py-2.5 text-paper transition hover:bg-accent">
                {t.openParty(sel.name)}
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
