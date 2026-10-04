import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getDictionary, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { getDataset } from "@/lib/data";
import { TOPIC_KEYS, topicLabel } from "@/lib/topics";
import { TopicIllustration } from "@/components/illustration";
import { getTopicUi, topicItems } from "@/components/topic-panels";
import { TopicExplorer } from "@/components/topic-explorer";
import { View, ViewHead } from "@/components/view-head";

const m = defineMessages(
  {
    hint: "בחרו נושא, וראו מה כל מפלגה כתבה עליו, במילים שלה ועם המקור.",
    description: "מה כל מפלגה כתבה בכל נושא, במילים שלה ועם המקור.",
  },
  {
    en: {
      hint: "Pick a topic and see what each party wrote about it, in its own words and with the source.",
      description: "What each party wrote on every topic, in its own words and with the source.",
    },
    ar: {
      hint: "اختاروا قضية، وانظروا ماذا كتب كل حزب عنها، بكلماته ومع المصدر.",
      description: "ماذا كتب كل حزب في كل قضية، بكلماته ومع المصدر.",
    },
    ru: {
      hint: "Выберите тему и посмотрите, что о ней написала каждая партия: её словами и с источником.",
      description: "Что каждая партия написала по каждой теме: её словами и с источником.",
    },
    am: {
      hint: "ርዕስ ይምረጡና እያንዳንዱ ፓርቲ ስለ እሱ የጻፈውን በራሱ ቃልና ከምንጩ ጋር ይመልከቱ።",
      description: "እያንዳንዱ ፓርቲ በእያንዳንዱ ርዕስ ላይ የጻፈው፣ በራሱ ቃልና ከምንጩ ጋር።",
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages(m);
  const dict = await getDictionary();
  return pageMeta({ path: "/topics", title: dict.nav.topics, description: t.description });
}

/** One view of the dashboard: what the lists say, by topic. */
export default async function Topics() {
  const t = await getMessages(m);
  const dict = await getDictionary();
  const ui = await getTopicUi();
  const lists = await getDataset();
  const sorted = [...lists].sort((a, b) => a.cec_order - b.cec_order);
  return (
    <View>
      <ViewHead title={dict.nav.topics} hint={t.hint} />
      <TopicExplorer
        defaultKey="economy"
        topics={TOPIC_KEYS.map((key) => {
          const rows = topicItems(sorted, key, ui);
          return {
            key,
            label: topicLabel(dict, key),
            icon: <TopicIllustration topic={key} className="!w-20" />,
            rows: rows.map((r) => ({ id: r.id, name: r.name, gist: r.gist, mark: r.mark, body: r.body })),
            silent: lists.filter((l) => !rows.some((r) => r.id === l.slug)).map((l) => ({ slug: l.slug, name: l.name })),
            total: lists.length,
          };
        })}
      />
    </View>
  );
}
