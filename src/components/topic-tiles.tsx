import Link from "@/i18n/link";
import { getDictionary, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { ruPlural } from "@/i18n/messages/plural";
import type { List } from "@/lib/data";
import { TOPIC_KEYS, topicLabel } from "@/lib/topics";
import { TopicIllustration } from "@/components/illustration";

const m = defineMessages(
  { wrote: (n: number, total: number) => `${n} מתוך ${total} מפלגות כתבו על זה` },
  {
    en: { wrote: (n: number, total: number) => `${n} of ${total} parties wrote about it` },
    ar: { wrote: (n: number, total: number) => `كتب ${n} من ${total} حزبًا عن هذه القضية` },
    ru: { wrote: (n: number, total: number) => `${n} из ${total} партий ${ruPlural(n, "написала", "написали", "написали")} об этом` },
    am: { wrote: (n: number, total: number) => `ከ${total} ፓርቲዎች ውስጥ ${n} ስለዚህ ጽፈዋል` },
  },
);

/** The eight topics as painted tiles; each leads to what every list wrote on it. */
export async function TopicTiles({ lists }: { lists: List[] }) {
  const t = await getMessages(m);
  const dict = await getDictionary();
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {TOPIC_KEYS.map((key) => {
        const n = lists.filter((l) => l.platform?.positions.some((p) => p.topic === key)).length;
        return (
          <li key={key}>
            <Link href={`/#${key}`} className="group flex h-full flex-col items-center rounded-[2.5rem] bg-mist px-5 pt-8 pb-7 text-center transition hover:bg-tile">
              <TopicIllustration topic={key} className="!w-28 mix-blend-multiply transition group-hover:scale-105" />
              <span className="title mt-5 text-2xl">{topicLabel(dict, key)}</span>
              <span className="mt-2 text-sm text-ink-2">
                {t.wrote(n, lists.length)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
