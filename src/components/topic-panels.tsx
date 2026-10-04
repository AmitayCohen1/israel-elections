import Link from "@/i18n/link";
import { getDictionary, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import type { List } from "@/lib/data";
import { topicLabel, type TopicKey } from "@/lib/topics";
import { Arrow } from "@/components/arrow";
import { ListMark } from "@/components/list-card";
import { TopicIllustration } from "@/components/illustration";
import { OwnWords } from "@/components/topic-rows";
import { quoteGist } from "@/lib/quotes";

const m = defineMessages(
  {
    allPositionsOf: (name: string) => `כל העמדות של ${name}`,
    pickTitle: "בחרו מפלגה כדי לקרוא",
    pickBody: (topic: string) => `מה כתבה על ${topic}, במילים שלה ועם המקור. כל המפלגות בעמודה שוות, בסדר אקראי.`,
  },
  {
    en: {
      allPositionsOf: (name: string) => `All of ${name}'s positions`,
      pickTitle: "Pick a party to read",
      pickBody: (topic: string) => `What it wrote on ${topic}, in its own words and with the source. All parties are equal here, in random order.`,
    },
    ar: {
      allPositionsOf: (name: string) => `جميع مواقف ${name}`,
      pickTitle: "اختاروا حزبًا لتقرؤوا",
      pickBody: (topic: string) => `ما كتبه في موضوع «${topic}»، بكلماته هو ومع المصدر. جميع الأحزاب متساوية في القائمة، بترتيب عشوائي.`,
    },
    ru: {
      allPositionsOf: (name: string) => `Все позиции: ${name}`,
      pickTitle: "Выберите партию, чтобы прочитать",
      pickBody: (topic: string) => `Что партия написала по теме «${topic}»: её словами и с источником. Все партии в списке равны, порядок случайный.`,
    },
    am: {
      allPositionsOf: (name: string) => `የ${name} ሁሉም አቋሞች`,
      pickTitle: "ለማንበብ ፓርቲ ይምረጡ",
      pickBody: (topic: string) => `በ«${topic}» ላይ የጻፈው በራሱ ቃልና ከምንጩ ጋር። በዝርዝሩ ውስጥ ሁሉም ፓርቲዎች እኩል ናቸው፤ ቅደም ተከተሉ በዘፈቀደ ነው።`,
    },
  },
);

/** What `topicItems` needs to speak a language. Hebrew when left out. */
export type TopicUi = { t: (typeof m)["he"] };
const HE_UI: TopicUi = { t: m.he };

/** Server: the language for `topicItems` and friends, from the page's URL. */
export async function getTopicUi(): Promise<TopicUi> {
  return { t: await getMessages(m) };
}

export type ReaderItem = { id: string; mark: React.ReactNode; name: string; gist: string | null; panel: React.ReactNode; body: React.ReactNode };

/** The rows (and the text opened beside them) for one topic: every list that wrote on it, in the order given. */
export function topicItems(lists: List[], key: TopicKey, ui: TopicUi = HE_UI): ReaderItem[] {
  const { t } = ui;
  return lists.flatMap((l): ReaderItem[] => {
    const items = l.platform?.positions.filter((p) => p.topic === key) ?? [];
    if (!items.length) return [];
    const digest = l.platform?.topic_digests?.[key];
    const gist = quoteGist(items);
    const body = (
      <div>
        <OwnWords items={items} summary={digest} />
        <p className="mt-5 text-lg font-semibold">
          <Link href={`/lists/${l.slug}#positions`} className="text-accent underline-offset-4 hover:underline">
            {t.allPositionsOf(l.name)} <Arrow />
          </Link>
        </p>
      </div>
    );
    return [
      {
        id: l.slug,
        name: l.name,
        gist,
        mark: <ListMark list={l} size={44} />,
        body,
        panel: (
          <div>
            <div className="flex items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center">
                <ListMark list={l} size={56} />
              </span>
              <div>
                <h3 className="title text-3xl">
                  <Link href={`/lists/${l.slug}#positions`} className="hover:underline">
                    {l.name}
                  </Link>
                </h3>
                {gist && <p className="mt-1 text-xl text-ink-2">{gist}</p>}
              </div>
            </div>
            <div className="mt-6">
              <OwnWords items={items} summary={digest} />
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-lg font-semibold">
              <Link href={`/lists/${l.slug}#positions`} className="text-accent underline-offset-4 hover:underline">
                {t.allPositionsOf(l.name)} <Arrow />
              </Link>
            </div>
          </div>
        ),
      },
    ];
  });
}

/** What opens under a table row when you click one cell: the party's own quotes first, then our short summary. */
export function cellDetail(l: List, key: TopicKey): React.ReactNode {
  const items = l.platform?.positions.filter((p) => p.topic === key) ?? [];
  const digest = l.platform?.topic_digests?.[key];
  return <OwnWords items={items} summary={digest} />;
}

/** One row per list (`wrote` says whether it has a position on any of the given topics): its mark, and per topic the one-line position plus the detail behind it. */
export function compareRows(lists: List[], keys: TopicKey[]) {
  return lists.flatMap((l) => {
    const cells = Object.fromEntries(
      keys.map((key) => {
        const items = l.platform?.positions.filter((p) => p.topic === key) ?? [];
        return [key, items.length ? { gist: quoteGist(items) ?? items[0].point, detail: cellDetail(l, key) } : null];
      }),
    );
    return [{ slug: l.slug, name: l.name, main: l.tier === "main", wrote: Object.values(cells).some(Boolean), mark: <ListMark list={l} size={44} />, markSm: <ListMark list={l} size={32} />, markLg: <ListMark list={l} size={112} />, cells }];
  });
}

/** What the reading pane shows before anyone is picked. */
export async function TopicEmpty({ topic }: { topic: TopicKey }) {
  const t = await getMessages(m);
  const dict = await getDictionary();
  return (
    <div className="flex min-h-[22rem] flex-col items-center justify-center text-center">
      <TopicIllustration topic={topic} className="!w-32 mix-blend-multiply" />
      <p className="title mt-6 text-2xl">{t.pickTitle}</p>
      <p className="mt-2 max-w-sm text-xl text-ink-2">{t.pickBody(topicLabel(dict, topic))}</p>
    </div>
  );
}
