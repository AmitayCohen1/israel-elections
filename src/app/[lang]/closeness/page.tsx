import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getDictionary, getLocale, getMessages } from "@/i18n";
import { m } from "@/i18n/messages/games";
import { loadMatchData } from "@/lib/games";
import { layout } from "@/lib/space";
import { ModeTabs } from "@/components/mode-tabs";
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
    { id: "all", label: t.all, questions: [], axes, points: layout(axes, parties) },
    ...topics.map((topic) => {
      const own = axes.filter((a) => a.topic === topic);
      return { id: topic, label: dict.topics[topic as keyof typeof dict.topics] ?? topic, questions: own.map((a) => a.short), axes: own, points: layout(own, parties, { topic: true }) };
    }),
  ];
  return (
    // One grey band under the top bar, like the position map. On wide screens it is exactly the height that is left (the bar
    // is 4rem, 5rem from xl), so the map and its side list are read without scrolling the page.
    <section className="flex flex-col overflow-x-clip bg-mist py-6 lg:h-[calc(100dvh-4rem)] lg:min-h-[40rem] xl:h-[calc(100dvh-5rem)]">
      <div className="mx-auto flex min-h-0 w-full max-w-[88rem] flex-1 flex-col px-4 sm:px-8">
        <div className="flex justify-center">
          <ModeTabs />
        </div>
        <h1 className="sr-only">{t.title}</h1>
        <PartySpace views={views} parties={parties} />
      </div>
    </section>
  );
}
