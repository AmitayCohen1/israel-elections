import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getLocale, getMessages } from "@/i18n";
import { m } from "@/i18n/messages/games";
import { loadMatchData } from "@/lib/games";
import { View, ViewHead } from "@/components/view-head";
import { MatchQuiz } from "@/components/match-quiz";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getMessages(m)).quiz;
  return pageMeta({ path: "/quiz", title: t.title, description: t.hint });
}

export default async function Quiz() {
  const t = (await getMessages(m)).quiz;
  const { axes, parties } = await loadMatchData(await getLocale());
  return (
    <View width="wide">
      <ViewHead title={t.title} hint={t.hint} />
      <MatchQuiz axes={axes} parties={parties} />
    </View>
  );
}
