import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getDictionary, getLocale, getMessages } from "@/i18n";
import { m } from "@/i18n/messages/games";
import { loadMatchData } from "@/lib/games";
import { layout } from "@/lib/space";
import { View, ViewHead } from "@/components/view-head";
import { PartySpace, type SpaceView } from "@/components/party-space";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getMessages(m)).space;
  return pageMeta({ path: "/closeness", title: t.title, description: t.hint });
}

export default async function Closeness() {
  const t = (await getMessages(m)).space;
  const dict = await getDictionary();
  const { axes, parties } = await loadMatchData(await getLocale());
  // All the questions together, then one layout per topic, from that topic's questions alone.
  const topics = [...new Set(axes.map((a) => a.topic))];
  const views: SpaceView[] = [
    { id: "all", label: t.all, questions: [], points: layout(axes, parties) },
    ...topics.map((topic) => {
      const own = axes.filter((a) => a.topic === topic);
      return { id: topic, label: dict.topics[topic as keyof typeof dict.topics] ?? topic, questions: own.map((a) => a.short), points: layout(own, parties, { topic: true }) };
    }),
  ];
  return (
    <View width="wide">
      <ViewHead title={t.title} hint={t.hint} />
      <PartySpace views={views} parties={parties} />
    </View>
  );
}
