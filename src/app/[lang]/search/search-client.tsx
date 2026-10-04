"use client";

import Link, { useMessages } from "@/i18n/link";
import { defineMessages } from "@/i18n/messages";
import { useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import type { SearchEntry } from "@/lib/data";
import { match, prepare } from "@/lib/search";
import { Avatar } from "@/components/avatar";
import { Ballot } from "@/components/ballot";

const LIMIT = 40;

const m = defineMessages(
  {
    placeholder: "שם פרטי או שם משפחה",
    label: "שם המועמד",
    none: (q: string) => `לא מצאנו מועמד בשם „${q}“.`,
    slot: (p: number, list: string) => `מקום ${p} ב${list}`,
    more: (n: number) => `ועוד ${n}. הוסיפו אותיות כדי לדייק.`,
  },
  {
    en: {
      placeholder: "First name or surname",
      label: "Candidate name",
      none: (q: string) => `No candidate named “${q}” was found.`,
      slot: (p: number, list: string) => `No. ${p} on ${list}`,
      more: (n: number) => `And ${n} more. Add letters to narrow it down.`,
    },
    ar: {
      placeholder: "الاسم الأول أو اسم العائلة",
      label: "اسم المرشح",
      none: (q: string) => `لم نجد مرشحًا باسم «${q}».`,
      slot: (p: number, list: string) => `المكان ${p} في ${list}`,
      more: (n: number) => `و${n} آخرون. أضيفوا حروفًا لتحديد البحث.`,
    },
    ru: {
      placeholder: "Имя или фамилия",
      label: "Имя кандидата",
      none: (q: string) => `Кандидата «${q}» не нашли.`,
      slot: (p: number, list: string) => `№${p} в списке «${list}»`,
      more: (n: number) => `И ещё ${n}. Добавьте буквы, чтобы уточнить поиск.`,
    },
    am: {
      placeholder: "ስም ወይም የአባት ስም",
      label: "የእጩው ስም",
      none: (q: string) => `«${q}» የሚባል እጩ አላገኘንም።`,
      slot: (p: number, list: string) => `በ${list} ውስጥ ቁጥር ${p}`,
      more: (n: number) => `እና ሌሎች ${n}። ለማጥበብ ተጨማሪ ፊደላት ይጻፉ።`,
    },
  },
);

export function SearchClient({ index }: { index: SearchEntry[] }) {
  const t = useMessages(m);
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const deferred = useDeferredValue(q);

  const prepared = useMemo(() => prepare(index), [index]);
  const results = useMemo(() => match(prepared, deferred), [deferred, prepared]);

  return (
    <>
      <input
        type="search"
        value={q}
        autoFocus
        onChange={(e) => {
          setQ(e.target.value);
          const url = new URL(window.location.href);
          url.searchParams.set("q", e.target.value);
          window.history.replaceState(null, "", url);
        }}
        placeholder={t.placeholder}
        aria-label={t.label}
        className="h-14 w-full rounded-full bg-mist px-6 text-xl outline-none ring-1 ring-transparent transition placeholder:text-muted focus:bg-paper focus:ring-ink/30"
      />

      <div aria-live="polite" className="mt-6">
        {deferred.trim() !== "" && results.length === 0 && <p className="py-10 text-center text-xl text-ink-2">{t.none(deferred)}</p>}
        {results.length > 0 && (
          <>
            <ul className="border-t border-line">
              {results.slice(0, LIMIT).map((r) => (
                <li key={`${r.s}:${r.p}`}>
                  <Link href={`/lists/${r.s}/${r.p}`} className="group flex items-center gap-4 border-b border-line py-4 sm:gap-6">
                    <Avatar name={r.n} src={r.i} color={r.c} size={56} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xl font-medium">{r.n}</span>
                      <span className="block truncate text-sm text-muted">
                        {t.slot(r.p, r.l)}
                        {r.k && ` · ${r.k}`}
                      </span>
                    </span>
                    <Ballot letters={r.t} color={r.c} size="sm" />
                  </Link>
                </li>
              ))}
            </ul>
            {results.length > LIMIT && <p className="pt-8 text-center text-ink-2">{t.more(results.length - LIMIT)}</p>}
          </>
        )}
      </div>
    </>
  );
}
