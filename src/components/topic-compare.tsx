import Link from "@/i18n/link";
import { getDictionary, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import type { List, Position } from "@/lib/data";
import type { TopicKey } from "@/lib/topics";
import { topicGist } from "@/lib/gist";
import { Avatar } from "@/components/avatar";
import { sourceLabel } from "@/components/topic-rows";

const m = defineMessages(
  {
    what: "מה כל מפלגה אומרת",
    none: "לא מצאנו עמדה של המפלגה בנושא הזה.",
    quotes: (n: number) => (n === 1 ? "הציטוט והמקור" : `${n} ציטוטים ומקורות`),
    others: "מפלגות נוספות שכתבו על הנושא",
    silent: (n: number) => `עוד ${n} מפלגות קטנות לא פרסמו עמדה בנושא.`,
  },
  {
    en: {
      what: "What each party says",
      none: "We found no position by this party on this topic.",
      quotes: (n: number) => (n === 1 ? "The quote and its source" : `${n} quotes and sources`),
      others: "Other parties that wrote on this topic",
      silent: (n: number) => `${n} more small parties published nothing on this topic.`,
    },
    ar: {
      what: "ماذا يقول كل حزب",
      none: "لم نجد موقفًا لهذا الحزب في هذه القضية.",
      quotes: (n: number) => (n === 1 ? "الاقتباس ومصدره" : `${n} اقتباسات ومصادر`),
      others: "أحزاب أخرى كتبت عن هذه القضية",
      silent: (n: number) => `${n} أحزاب صغيرة أخرى لم تنشر موقفًا في هذه القضية.`,
    },
    ru: {
      what: "Что говорит каждая партия",
      none: "Мы не нашли позиции этой партии по этой теме.",
      quotes: (n: number) => (n === 1 ? "Цитата и источник" : `Цитаты и источники: ${n}`),
      others: "Другие партии, писавшие на эту тему",
      silent: (n: number) => `Ещё малых партий без позиции по теме: ${n}.`,
    },
    am: {
      what: "እያንዳንዱ ፓርቲ የሚለው",
      none: "የዚህን ፓርቲ አቋም በዚህ ርዕስ ላይ አላገኘንም።",
      quotes: (n: number) => (n === 1 ? "ጥቅሱና ምንጩ" : `${n} ጥቅሶችና ምንጮች`),
      others: "በዚህ ርዕስ ላይ የጻፉ ሌሎች ፓርቲዎች",
      silent: (n: number) => `ሌሎች ${n} ትናንሽ ፓርቲዎች በዚህ ርዕስ ላይ አቋም አላወጡም።`,
    },
  },
);

/** The party's own words on the topic, each with a link to where it was said. */
export async function Quotes({ items }: { items: Position[] }) {
  const { sourceTypes } = await getDictionary();
  return (
    <ul className="mt-3 space-y-4 border-s-2 border-line-strong ps-4">
      {items.map((p, i) => (
        <li key={i}>
          <p className="text-lg leading-relaxed text-pretty">{/\p{Script=Hebrew}/u.test(p.quote) ? `”${p.quote}“` : `“${p.quote}”`}</p>
          <a href={p.source_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-base text-accent underline-offset-4 hover:underline">
            {sourceLabel(p, sourceTypes)} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}

/** One party on one topic: who it is beside its bottom line, a short explanation under it, the quotes a click away. */
async function Row({ list, topic }: { list: List; topic: TopicKey }) {
  const t = await getMessages(m);
  const items = list.platform?.positions.filter((p) => p.topic === topic) ?? [];
  const gist = topicGist(list, topic);
  const digest = list.platform?.topic_digests?.[topic];
  const leader = list.candidates[0];
  return (
    <li id={list.slug} className="scroll-mt-32 border-b border-line py-5 md:grid md:grid-cols-[15rem_minmax(0,1fr)] md:gap-8">
      <Link href={`/lists/${list.slug}#${topic}`} className="flex items-center gap-3 self-start hover:underline">
        {leader && <Avatar name={leader.display_name} src={leader.image_url} color={list.color} size={44} />}
        <span className={`text-xl leading-tight font-bold ${items.length ? "" : "text-muted"}`}>{list.name}</span>
      </Link>
      {items.length ? (
        <div className="mt-3 min-w-0 md:mt-0">
          {gist && <p className="text-xl leading-snug font-semibold text-balance">{gist}</p>}
          {digest && <p className="mt-2 text-lg leading-relaxed text-ink-2 text-pretty">{digest}</p>}
          <details className="mt-2">
            <summary className="cursor-pointer text-lg font-medium text-accent underline-offset-4 hover:underline">{t.quotes(items.length)}</summary>
            <Quotes items={items} />
          </details>
        </div>
      ) : (
        <p className="mt-2 text-lg text-muted md:mt-0">{t.none}</p>
      )}
    </li>
  );
}

/**
 * Every party on one topic, as one tab of the positions page: the topic's axes first (where its parties were scored), then
 * each party's bottom line. The parties in the polls always show; the rest only when they wrote on it.
 */
export async function TopicPanel({ topic, lists, axes }: { topic: TopicKey; lists: List[]; axes: React.ReactNode }) {
  const t = await getMessages(m);
  const main = lists.filter((l) => l.tier === "main");
  const has = (l: List) => l.platform?.positions.some((p) => p.topic === topic);
  const others = lists.filter((l) => l.tier !== "main" && has(l));
  const silent = lists.filter((l) => l.tier !== "main" && !has(l)).length;
  return (
    <div>
      {axes && <div className="mb-10 space-y-10 border-b border-line-strong pb-10 sm:rounded-2xl sm:border-0 sm:bg-mist sm:p-6">{axes}</div>}
      <h2 className="text-2xl font-bold">{t.what}</h2>
      <ul className="mt-3 border-t border-line-strong">
        {main.map((l) => (
          <Row key={l.slug} list={l} topic={topic} />
        ))}
      </ul>
      {others.length > 0 && (
        <section className="mt-12">
          <h3 className="text-2xl font-bold">{t.others}</h3>
          <ul className="mt-3 border-t border-line-strong">
            {others.map((l) => (
              <Row key={l.slug} list={l} topic={topic} />
            ))}
          </ul>
        </section>
      )}
      {silent > 0 && <p className="mt-6 text-lg text-ink-2">{t.silent(silent)}</p>}
    </div>
  );
}

export { m as topicCompareMessages };
