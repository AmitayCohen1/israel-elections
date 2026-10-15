import Image from "next/image";
import Link from "@/i18n/link";
import { getDictionary, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import type { AxisData, Cell } from "@/app/[lang]/dev-preview/map/options";
import type { TopicKey } from "@/lib/topics";

const m = defineMessages(
  {
    none: "לא מצאנו עמדה בשאלה הזו:",
    others: (n: number) => `ועוד ${n} מפלגות קטנות, בלשונית הנושא.`,
  },
  {
    en: { none: "No position found on this question:", others: (n: number) => `And ${n} small parties, in the topic's tab.` },
    ar: { none: "لم نجد موقفًا في هذا السؤال:", others: (n: number) => `و${n} أحزاب صغيرة أخرى، في تبويب القضية.` },
    ru: { none: "Позиция по этому вопросу не найдена:", others: (n: number) => `И ещё малых партий: ${n}, во вкладке темы.` },
    am: { none: "በዚህ ጥያቄ ላይ አቋም አልተገኘም፦", others: (n: number) => `እና ሌሎች ${n} ትናንሽ ፓርቲዎች፣ በርዕሱ ትር ውስጥ።` },
  },
);

/** One party on the axis: its leader's face and its name, leading to what it said on the topic. The quote behind the score is the tooltip. */
function Chip({ c, topic }: { c: Cell; topic: string }) {
  return (
    <Link href={`/lists/${c.slug}#${topic}`} title={c.quote} className="flex min-w-0 items-center gap-2 rounded-full bg-paper py-1 ps-1 pe-3 ring-1 ring-line-strong transition hover:ring-ink">
      <span className="relative size-8 shrink-0 overflow-hidden rounded-full" style={{ background: c.color }}>
        {c.face && <Image src={c.face} alt="" fill sizes="32px" className="object-cover object-top" />}
      </span>
      <span className="truncate text-base font-medium">{c.name}</span>
    </Link>
  );
}

/**
 * One subject as an x axis: its two poles at the ends, the coded levels as columns along it, and every party in the polls
 * placed in the column its own quoted words were scored on. A phone reads the columns top to bottom.
 * `only` limits the parties to these slugs (the parties in the polls); the rest are counted, not drawn.
 */
export async function AxisScale({ axis, only, heading = "h2" }: { axis: AxisData; only?: Set<string>; heading?: "h2" | "h3" }) {
  const [t, dict] = await Promise.all([getMessages(m), getDictionary()]);
  const keep = (slug: string) => !only || only.has(slug);
  const cells = axis.cells.filter((c) => keep(c.slug));
  const hidden = axis.cells.length - cells.length;
  const missing = axis.uncoded.filter((u) => (only ? only.has(u.slug) : u.main));
  const n = axis.scale.length;
  const H = heading;
  return (
    <section id={axis.id} className="scroll-mt-32">
      <H className="text-xl leading-tight font-bold sm:text-2xl">
        <span className="text-ink-2">{dict.topics[axis.topic as TopicKey]} · </span>
        {axis.short}
      </H>
      <p className="mt-1 text-lg text-ink-2">{axis.question}</p>

      {/* The axis itself: the poles at its ends and a tick per level, on wide screens only (a phone has the columns as a list). */}
      {axis.poles && (
        <div className="mt-5 hidden md:block">
          <div className="flex justify-between text-lg font-bold">
            <span>{axis.poles[0]}</span>
            <span>{axis.poles[1]}</span>
          </div>
          <div className="relative mt-2 h-2 rounded-full bg-gradient-to-l from-[#0038b8]/25 via-line-strong to-[#0038b8]/25 rtl:bg-gradient-to-r">
            {axis.scale.map((s, i) => (
              <span key={s.level} className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-ink ring-4 ring-paper" style={{ insetInlineStart: `calc(${((i + 0.5) / n) * 100}% - 0.5rem)` }} />
            ))}
          </div>
        </div>
      )}
      {axis.poles && (
        <p className="mt-4 text-lg font-semibold md:hidden">
          {axis.poles[0]} ⟷ {axis.poles[1]}
        </p>
      )}

      <div className="mt-3 grid gap-x-3 gap-y-5 md:mt-4" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {axis.scale.map((s) => {
          const here = cells.filter((c) => c.level === s.level);
          return (
            <div key={s.level} className="col-span-full min-w-0 md:col-span-1">
              <p className="font-semibold md:text-center">{s.short}</p>
              <p className="text-base leading-snug text-ink-2 md:text-center">{s.label}</p>
              <div className="mt-2 flex flex-wrap gap-1.5 md:flex-col md:flex-nowrap">
                {here.map((c) => (
                  <Chip key={c.slug} c={c} topic={axis.topic} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {(missing.length > 0 || hidden > 0) && (
        <p className="mt-4 text-base text-ink-2">
          {missing.length > 0 && (
            <>
              {t.none}{" "}
              {missing.map((u, i) => (
                <span key={u.slug}>
                  {i > 0 && " · "}
                  <Link href={`/lists/${u.slug}`} className="underline-offset-4 hover:underline">
                    {u.name}
                  </Link>
                </span>
              ))}
              {". "}
            </>
          )}
          {hidden > 0 && (
            <a href={`#${axis.topic}`} className="text-accent underline-offset-4 hover:underline">
              {t.others(hidden)}
            </a>
          )}
        </p>
      )}
    </section>
  );
}
