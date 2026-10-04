import Link from "@/i18n/link";
import { getDictionary, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { ruPlural } from "@/i18n/messages/plural";
import type { Dictionary } from "@/i18n";
import type { List } from "@/lib/data";
import { TOPIC_KEYS, topicLabel } from "@/lib/topics";
import { TopicIllustration } from "@/components/illustration";
import { ListMark } from "@/components/list-card";

const m = defineMessages(
  {
    read: (party: string, topic: string) => `${party}, ${topic}: קראו מה כתבה המפלגה`,
    none: "לא מצאנו עמדה",
    party: "המפלגה",
    more: (n: number) => `ועוד ${n} מפלגות`,
  },
  {
    en: { read: (party: string, topic: string) => `${party}, ${topic}: read what the party wrote`, none: "No position found", party: "Party", more: (n: number) => `${n} more parties` },
    ar: { read: (party: string, topic: string) => `${party}، ${topic}: اقرؤوا ما كتبه الحزب`, none: "لم نجد موقفًا", party: "الحزب", more: (n: number) => `أحزاب أخرى (${n})` },
    ru: { read: (party: string, topic: string) => `${party}, ${topic}: прочитайте, что написала партия`, none: "Позиция не найдена", party: "Партия", more: (n: number) => `Ещё ${n} ${ruPlural(n, "партия", "партии", "партий")}` },
    am: { read: (party: string, topic: string) => `${party}፣ ${topic}፦ ፓርቲው የጻፈውን ያንብቡ`, none: "አቋም አላገኘንም", party: "ፓርቲ", more: (n: number) => `ሌሎች ${n} ፓርቲዎች` },
  },
);

function Row({ l, t, dict }: { l: List; t: (typeof m)["he"]; dict: Dictionary }) {
  const said = TOPIC_KEYS.map((k) => !!l.platform?.positions.some((p) => p.topic === k));
  return (
    <tr className="border-b border-ink/10">
      <th scope="row" className="py-2.5 pe-3 text-start font-normal">
        <Link href={`/lists/${l.slug}`} className="flex items-center gap-3 hover:underline">
          <span className="grid size-11 shrink-0 place-items-center">
            <ListMark list={l} size={36} />
          </span>
          <span className="text-base font-medium">{l.name}</span>
        </Link>
      </th>
      {TOPIC_KEYS.map((k, i) => (
        <td key={k} className="py-2.5 text-center">
          {said[i] ? (
            <Link
              href={`/#${k}:${l.slug}`}
              title={`${l.name} · ${topicLabel(dict, k)}`}
              aria-label={t.read(l.name, topicLabel(dict, k))}
              className="mx-auto block size-6 rounded-full bg-ink transition hover:scale-125 hover:bg-accent"
            />
          ) : (
            <span aria-label={t.none} className="mx-auto block size-6 rounded-full ring-1 ring-ink/10" />
          )}
        </td>
      ))}
    </tr>
  );
}

/** Who said what, at a glance: a list per row, a topic per column, a dot (with the number of positions) where the list said something. */
export async function CoverageMap({ lists }: { lists: List[] }) {
  const t = await getMessages(m);
  const dict = await getDictionary();
  const main = lists.filter((l) => l.tier === "main");
  const other = lists.filter((l) => l.tier === "other");

  const head = (
    <thead>
      <tr className="border-b border-ink/10 align-bottom">
        <th className="pb-3 text-start text-base font-normal text-muted">{t.party}</th>
        {TOPIC_KEYS.map((k) => (
          <th key={k} scope="col" className="px-1 pb-3 text-center font-normal">
            <Link href={`/#${k}`} className="group flex flex-col items-center gap-1">
              <TopicIllustration topic={k} className="!w-14 transition group-hover:scale-110" />
              <span className="text-base leading-tight text-ink-2 group-hover:underline">{topicLabel(dict, k)}</span>
            </Link>
          </th>
        ))}
      </tr>
    </thead>
  );

  return (
    <div className="overflow-x-auto rounded-[2.5rem] bg-mist px-5 pt-8 pb-4 sm:px-10">
      <table className="w-full min-w-[44rem] border-collapse">
        {head}
        <tbody>
          {main.map((l) => (
            <Row key={l.slug} l={l} t={t} dict={dict} />
          ))}
        </tbody>
      </table>
      <details className="group">
        <summary className="mx-auto my-6 flex h-12 w-fit cursor-pointer items-center rounded-full bg-ink px-6 text-base font-bold text-white transition hover:bg-accent group-open:hidden">
          {t.more(other.length)}
        </summary>
        <table className="w-full min-w-[44rem] border-collapse">
          <tbody>
            {other.map((l) => (
              <Row key={l.slug} l={l} t={t} dict={dict} />
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
