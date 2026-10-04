import Image from "next/image";
import Link from "@/i18n/link";
import { getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { arCount, ruPlural } from "@/i18n/messages/plural";
import { ballot } from "@/i18n/messages/ballot";
import type { Candidate, List } from "@/lib/data";
import { listColor } from "@/lib/color";
import { Ballot } from "./ballot";
import { PartyMark } from "./party-mark";

export const m = defineMessages(
  {
    candidates: (n: number) => `${n} מועמדים`,
    positions: (n: number) => `עמדות ב-${n} נושאים`,
    noPlatform: "לא מצאנו מצע",
  },
  {
    en: {
      candidates: (n: number) => `${n} ${n === 1 ? "candidate" : "candidates"}`,
      positions: (n: number) => `Positions on ${n} ${n === 1 ? "topic" : "topics"}`,
      noPlatform: "No platform found",
    },
    ar: {
      candidates: (n: number) => arCount(n, ["مرشح واحد", "مرشحان", "مرشحين", "مرشحًا"]),
      positions: (n: number) => `مواقف في ${arCount(n, ["قضية واحدة", "قضيتين", "قضايا", "قضية"])}`,
      noPlatform: "لم نجد برنامجًا",
    },
    ru: {
      candidates: (n: number) => `${n} ${ruPlural(n, "кандидат", "кандидата", "кандидатов")}`,
      positions: (n: number) => `Позиции по ${n} ${ruPlural(n, "теме", "темам", "темам")}`,
      noPlatform: "Программа не найдена",
    },
    am: {
      candidates: (n: number) => `${n} እጩዎች`,
      positions: (n: number) => `በ${n} ርዕሶች ላይ አቋሞች`,
      noPlatform: "መርሐ ግብር አላገኘንም",
    },
  },
);

function initials(name: string) {
  return name
    .replace(/["'׳״]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

function Face({ c, size }: { c: Candidate | undefined; size: number }) {
  if (!c) return null;
  const cls = "shrink-0 rounded-full ring-[3px] ring-paper";
  return c.image_url ? (
    <Image src={c.image_url} alt={c.display_name} width={size} height={size} style={{ width: size, height: size }} className={`${cls} object-cover object-top`} />
  ) : (
    <span style={{ width: size, height: size, fontSize: size * 0.34 }} className={`${cls} grid place-items-center bg-tile font-medium text-ink/40`}>
      {initials(c.display_name)}
    </span>
  );
}

/**
 * One list, one line. Reading order is the hierarchy: the lead person's face, the list name
 * (the largest thing), who leads it, a few more faces, and the ballot slip last.
 */
export function ListRow({ list }: { list: List }) {
  const [leader, ...rest] = list.candidates;
  return (
    <li>
      <Link href={`/lists/${list.slug}`} className="group flex items-center gap-4 border-b border-line py-3">
        <Face c={leader} size={48} />
        <span className="title min-w-0 flex-1 truncate text-2xl transition duration-300 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1">{list.name}</span>
        <span className="hidden text-ink-2 lg:block">{leader?.display_name}</span>
        <span className="hidden -space-x-2 rtl:space-x-reverse sm:flex">
          {rest.slice(0, 3).map((c) => (
            <Face key={c.position} c={c} size={32} />
          ))}
        </span>
        <Ballot letters={list.letters} color={list.color} size="sm" />
      </Link>
    </li>
  );
}

/**
 * One party as a card, for a grid: the lead person's face and the party's name on top with the ballot slip beside them,
 * and underneath what is inside: the next few faces, how many candidates, and whether we found positions.
 */
export async function PartyCard({ list }: { list: List }) {
  const t = await getMessages(m);
  const [leader, ...rest] = list.candidates;
  const topics = new Set(list.platform?.positions.map((p) => p.topic)).size;
  return (
    <li className="min-w-0">
      <Link href={`/lists/${list.slug}`} className="group flex h-full flex-col gap-5 rounded-[1.75rem] bg-mist p-5 transition hover:bg-mist-deep">
        <span className="flex items-center gap-3.5">
          <Face c={leader} size={60} />
          <span className="min-w-0 flex-1">
            <span className="title block text-xl leading-tight text-balance">{list.name}</span>
            {leader && <span className="mt-0.5 block truncate text-base text-ink-2">{leader.display_name}</span>}
          </span>
          <PartyMark slug={list.slug} letters={list.letters} color={list.color} size="sm" />
        </span>
        <span className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="flex -space-x-2 rtl:space-x-reverse">
            {rest.slice(0, 4).map((c) => (
              <Face key={c.position} c={c} size={32} />
            ))}
          </span>
          <span className="text-base whitespace-nowrap text-ink-2">{t.candidates(list.candidates.length)}</span>
          <span className="ms-auto text-base whitespace-nowrap text-ink-2">{topics > 0 ? t.positions(topics) : t.noPlatform}</span>
        </span>
      </Link>
    </li>
  );
}

/** The mark of a list wherever it appears small: its leader's face, with the slip as a badge. */
export async function ListMark({ list, size = 56 }: { list: List; size?: number }) {
  const leader = list.candidates[0];
  if (!leader?.image_url) {
    const t = await getMessages(ballot);
    return (
      <span
        className="slip relative grid shrink-0 place-items-center overflow-hidden rounded-[0.3rem] shadow-[0_1px_1px_rgb(0_12_31/0.05),0_12px_22px_-16px_rgb(0_12_31/0.3)] ring-1 ring-ink/10"
        style={{ width: Math.round(size * 0.79), height: size }}
        aria-label={t.slip(list.letters)}
      >
        <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: listColor(list.color) }} />
        <span className="font-ballot leading-none font-black tracking-tight text-ink" style={{ fontSize: size * 0.4 }}>
          {list.letters}
        </span>
      </span>
    );
  }
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <Image src={leader.image_url} alt="" width={size} height={size} className="size-full rounded-full object-cover object-top" />
      <span
        className="slip absolute -bottom-1 -end-2 grid place-items-center rounded-[3px] border border-line-strong px-1 font-ballot leading-none font-black shadow-sm"
        style={{ fontSize: size * 0.2, height: size * 0.42, minWidth: size * 0.36 }}
      >
        {list.letters}
      </span>
    </span>
  );
}
