"use client";

import Link, { useMessages } from "@/i18n/link";
import { defineMessages } from "@/i18n/messages";
import { arCount, ruPlural } from "@/i18n/messages/plural";
import { useDict } from "@/i18n/provider";
import { useEffect, useRef, useState } from "react";

export type CompareCell = { gist: string; detail: React.ReactNode };
export type CompareRow = {
  slug: string;
  name: string;
  main: boolean;
  /** Has a position on at least one of the topics shown. */
  wrote?: boolean;
  mark: React.ReactNode;
  markSm?: React.ReactNode; markLg?: React.ReactNode;
  cells: Record<string, CompareCell | null>;
};
export type CompareTopic = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

const MAX = 3;

const m = defineMessages(
  {
    torn: "אני מתלבט בין",
    remove: (name: string) => `הסרת ${name}`,
    clear: "ניקוי",
    dialog: "בחירת מפלגות",
    pickUpTo: (max: number) => `בחרו עד ${max} מפלגות`,
    done: "סיום",
    searchPlaceholder: "חיפוש מפלגה...",
    searchLabel: "חיפוש מפלגה",
    noPlatform: "אין מצע",
    noMatch: "לא נמצאה מפלגה.",
    limit: (max: number) => `אפשר להשוות עד ${max} מפלגות.`,
    start: "בחרו מפלגה כדי להתחיל.",
    noPosition: "לא מצאנו עמדה",
    noPositionOn: (topic: string) => `לא מצאנו עמדה של המפלגה ב${topic}.`,
    found: (n: number, total: number) => `מצאנו עמדות של ${n} מתוך ${total} מפלגות. הסדר אקראי ומשתנה בכל ביקור.`,
    missing: (n: number) => `לא מצאנו מצע ל-${n} מפלגות`,
  },
  {
    en: {
      torn: "I'm torn between",
      remove: (name: string) => `Remove ${name}`,
      clear: "Clear",
      dialog: "Choose parties",
      pickUpTo: (max: number) => `Pick up to ${max} parties`,
      done: "Done",
      searchPlaceholder: "Search for a party...",
      searchLabel: "Search for a party",
      noPlatform: "No platform",
      noMatch: "No party found.",
      limit: (max: number) => `You can compare up to ${max} parties.`,
      start: "Pick a party to get started.",
      noPosition: "No position found",
      noPositionOn: (topic: string) => `We found no position by this party on ${topic}.`,
      found: (n: number, total: number) => `We found positions for ${n} of ${total} parties. The order is random and changes on every visit.`,
      missing: (n: number) => `No platform found for ${n} ${n === 1 ? "party" : "parties"}`,
    },
    ar: {
      torn: "أنا متردد بين",
      remove: (name: string) => `إزالة ${name}`,
      clear: "مسح",
      dialog: "اختيار الأحزاب",
      pickUpTo: (max: number) => `اختاروا حتى ${max} أحزاب`,
      done: "تم",
      searchPlaceholder: "البحث عن حزب...",
      searchLabel: "البحث عن حزب",
      noPlatform: "لا يوجد برنامج",
      noMatch: "لم يُعثر على حزب.",
      limit: (max: number) => `يمكن مقارنة ${max} أحزاب كحد أقصى.`,
      start: "اختاروا حزبًا للبدء.",
      noPosition: "لم نجد موقفًا",
      noPositionOn: (topic: string) => `لم نجد موقفًا للحزب في قضية «${topic}».`,
      found: (n: number, total: number) => `وجدنا مواقف لـ${n} من أصل ${total} حزبًا. الترتيب عشوائي ويتغير في كل زيارة.`,
      missing: (n: number) => `لم نجد برنامجًا لـ${arCount(n, ["حزب واحد", "حزبين", "أحزاب", "حزبًا"])}`,
    },
    ru: {
      torn: "Я выбираю между",
      remove: (name: string) => `Убрать: ${name}`,
      clear: "Очистить",
      dialog: "Выбор партий",
      pickUpTo: (max: number) => `Выберите до ${max} партий`,
      done: "Готово",
      searchPlaceholder: "Поиск партии...",
      searchLabel: "Поиск партии",
      noPlatform: "Нет программы",
      noMatch: "Партия не найдена.",
      limit: (max: number) => `Можно сравнить до ${max} партий.`,
      start: "Выберите партию, чтобы начать.",
      noPosition: "Позиция не найдена",
      noPositionOn: (topic: string) => `Позиция партии по теме «${topic}» не найдена.`,
      found: (n: number, total: number) => `Мы нашли позиции ${n} из ${total} партий. Порядок случайный и меняется при каждом посещении.`,
      missing: (n: number) => `Для ${n} ${ruPlural(n, "партии", "партий", "партий")} программа не найдена`,
    },
    am: {
      torn: "በእነዚህ መካከል እያመነታሁ ነው",
      remove: (name: string) => `${name}ን አስወግድ`,
      clear: "አጽዳ",
      dialog: "ፓርቲዎችን ምረጥ",
      pickUpTo: (max: number) => `እስከ ${max} ፓርቲዎች ይምረጡ`,
      done: "ተጠናቋል",
      searchPlaceholder: "ፓርቲ ፈልግ...",
      searchLabel: "ፓርቲ ፈልግ",
      noPlatform: "መርሐ ግብር የለም",
      noMatch: "ፓርቲ አልተገኘም።",
      limit: (max: number) => `እስከ ${max} ፓርቲዎች ማወዳደር ይቻላል።`,
      start: "ለመጀመር ፓርቲ ይምረጡ።",
      noPosition: "አቋም አላገኘንም",
      noPositionOn: (topic: string) => `ፓርቲው በ${topic} ላይ ያለውን አቋም አላገኘንም።`,
      found: (n: number, total: number) => `ከ${total} ፓርቲዎች ውስጥ የ${n} ፓርቲዎችን አቋም አግኝተናል። ቅደም ተከተሉ በዘፈቀደ ሲሆን በእያንዳንዱ ጉብኝት ይለወጣል።`,
      missing: (n: number) => `ለ${n} ፓርቲዎች መርሐ ግብር አላገኘንም`,
    },
  },
);

/**
 * "I'm torn between these lists": pick up to three from a checkbox menu (a bottom sheet on phones), then read them
 * as one table, a column per list and a row per topic with the full text (stacked per topic on phones). It opens with two of the larger lists, chosen
 * at random on every visit, so no list is always the default.
 */
export function PartyCompare({
  topics,
  rows,
  silentNames,
  total,
}: {
  topics: CompareTopic[];
  rows: CompareRow[];
  silentNames: string[];
  total: number;
}) {
  const tx = useMessages(m);
  const dict = useDict();
  const [picked, setPicked] = useState<string[] | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Randomness exists only in the browser: the server always renders the same HTML, so the defaults are set after hydration.
    const withPositions = rows.filter((r) => r.wrote !== false);
    const pool = withPositions.filter((r) => r.main).length >= 2 ? withPositions.filter((r) => r.main) : withPositions;
    const ids = pool.map((r) => r.slug);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPicked(ids.slice(0, 2));
  }, [rows]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const selected = (picked ?? []).flatMap((s) => bySlug.get(s) ?? []);
  const shown = rows.filter((r) => r.name.includes(q.trim()));
  const toggle = (slug: string) => setPicked((p) => ((p ?? []).includes(slug) ? (p ?? []).filter((x) => x !== slug) : (p ?? []).length < MAX ? [...(p ?? []), slug] : p));

  return (
    <div data-explorer className={picked ? "" : "invisible"}>
      <div ref={wrap} className="relative flex flex-wrap items-center gap-2">
        <span className="text-lg whitespace-nowrap text-ink sm:text-xl">{tx.torn}</span>
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink/20 bg-paper px-4 text-base font-medium hover:border-ink/40">
          {dict.nav.lists} {selected.length > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-ink px-1.5 text-base text-paper">{selected.length}</span>} <span aria-hidden>▾</span>
        </button>
        {selected.map((r) => (
          <span key={r.slug} className="inline-flex h-11 max-w-full items-center gap-1.5 rounded-lg bg-tile ps-1.5 pe-1 text-base">
            <span className="grid size-8 shrink-0 place-items-center">{r.markSm ?? r.mark}</span>
            <span className="min-w-0 truncate">{r.name}</span>
            {selected.length > 1 && (
              <button type="button" aria-label={tx.remove(r.name)} onClick={() => toggle(r.slug)} className="grid size-7 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-paper hover:text-ink">
                ×
              </button>
            )}
          </span>
        ))}
        {selected.length > 0 && (
          <button type="button" onClick={() => setPicked([])} className="text-base text-ink-2 underline-offset-4 hover:underline">
            {tx.clear}
          </button>
        )}
        {open && (
          <>
            <div className="fixed inset-0 z-40 bg-ink/30 md:hidden" onClick={() => setOpen(false)} />
            <div
              role="dialog"
              aria-label={tx.dialog}
              className="menu-pop fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col rounded-t-3xl bg-paper p-4 shadow-[0_-24px_60px_-24px_rgb(0_12_31/0.4)] md:absolute md:inset-x-auto md:start-0 md:top-full md:bottom-auto md:z-20 md:mt-1 md:max-h-none md:w-80 md:rounded-xl md:p-2 md:shadow-[0_24px_60px_-24px_rgb(0_12_31/0.4)] md:ring-1 md:ring-ink/10"
            >
              <div className="mb-3 flex items-center justify-between md:hidden">
                <p className="title text-xl">{tx.pickUpTo(MAX)}</p>
                <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-full bg-ink px-5 text-base font-bold text-white">
                  {tx.done}
                </button>
              </div>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx.searchPlaceholder} aria-label={tx.searchLabel} className="h-11 w-full rounded-lg border border-ink/20 px-3 text-base outline-none focus:border-ink md:h-9" />
              <ul className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain md:max-h-64 md:flex-none">
                {shown.map((r) => {
                  const on = (picked ?? []).includes(r.slug);
                  const locked = !on && (picked ?? []).length >= MAX;
                  return (
                    <li key={r.slug}>
                      <label className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-tile/60 md:py-1.5 ${locked ? "opacity-40" : ""}`}>
                        <input type="checkbox" checked={on} disabled={locked} onChange={() => toggle(r.slug)} className="size-5 shrink-0 accent-[#0b1f3a] md:size-4" />
                        <span className="grid size-8 shrink-0 place-items-center">{r.markSm ?? r.mark}</span>
                        <span className="text-base">{r.name}</span>
                        {r.wrote === false && <span className="ms-auto text-base text-muted">{tx.noPlatform}</span>}
                      </label>
                    </li>
                  );
                })}
                {shown.length === 0 && <li className="px-2 py-3 text-base text-ink-2">{tx.noMatch}</li>}
              </ul>
              {(picked ?? []).length >= MAX && <p className="px-2 pt-2 text-base text-muted">{tx.limit(MAX)}</p>}
            </div>
          </>
        )}
      </div>

      {selected.length === 0 ? (
        <p className="mt-6 text-center text-lg text-ink-2">{tx.start}</p>
      ) : (
        <>
          {/* Wide screens: one table, a column per list and a row per topic, with everything each list wrote. */}
          <div className="mt-8 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[48rem] border-collapse">
              <thead>
                <tr>
                  <td className="w-56" />
                  {selected.map((r) => (
                    <th key={r.slug} scope="col" className="px-3 pb-4 text-start font-normal">
                      <Link href={`/lists/${r.slug}`} className="flex items-center gap-3 hover:underline">
                        <span className="grid size-12 shrink-0 place-items-center">{r.mark}</span>
                        <span className="title text-2xl">{r.name}</span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topics.map((t) => (
                  <tr key={t.key} className="border-t border-ink/10 align-top">
                    <th scope="row" className="py-6 pe-4 text-start font-normal">
                      <span className="flex items-center gap-3">
                        <span className="grid size-20 shrink-0 place-items-center">{t.icon}</span>
                        <span className="text-lg leading-tight font-medium">{t.label}</span>
                      </span>
                    </th>
                    {selected.map((r) => {
                      const cell = r.cells[t.key];
                      return (
                        <td key={r.slug} className="px-3 py-6 text-lg leading-snug">
                          {cell ? (
                            <>
                              <p className="font-medium text-pretty">{cell.gist}</p>
                              <div className="mt-3">{cell.detail}</div>
                            </>
                          ) : (
                            <span className="text-ink/35">{tx.noPosition}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 md:hidden">
            {topics.map((t) => (
              <section key={t.key} className="border-t border-ink/10 py-5">
                <h3 className="flex items-center gap-3">
                  <span className="grid size-16 shrink-0 place-items-center">{t.icon}</span>
                  <span className="title text-2xl">{t.label}</span>
                </h3>
                <div className="mt-4 space-y-4">
                  {selected.map((r) => {
                    const cell = r.cells[t.key];
                    return (
                      <article key={r.slug} className="rounded-3xl bg-mist p-5">
                        <Link href={`/lists/${r.slug}`} className="flex items-center gap-3 hover:underline">
                          <span className="grid size-11 shrink-0 place-items-center">{r.mark}</span>
                          <span className="title text-xl">{r.name}</span>
                        </Link>
                        {cell ? (
                          <>
                            <p className="mt-4 text-lg leading-snug font-medium text-pretty">{cell.gist}</p>
                            <div className="mt-3 text-base">{cell.detail}</div>
                          </>
                        ) : (
                          <p className="mt-4 text-ink-2">{tx.noPositionOn(t.label)}</p>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      {silentNames.length > 0 && (
        <div className="mt-10 text-base leading-snug text-ink-2">
          <p>
            {tx.found(rows.filter((r) => r.wrote !== false).length, total)}
          </p>
          <details className="mt-1">
            <summary className="inline-block cursor-pointer font-semibold text-accent underline-offset-4 hover:underline">
              {tx.missing(silentNames.length)}
            </summary>
            <p className="mt-1">{silentNames.join(" · ")}</p>
          </details>
        </div>
      )}
    </div>
  );
}
