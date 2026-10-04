import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { arCount, ruPlural } from "@/i18n/messages/plural";
import { getDataset } from "@/lib/data";
import { m as cardMessages } from "@/components/list-card";
import { PartyExplorer, type PartyEntry } from "@/components/party-explorer";
import { View, ViewHead } from "@/components/view-head";

const m = defineMessages(
  {
    title: "המפלגות",
    description: "כל המפלגות שמתמודדות, לפי הסדר הרשמי של ועדת הבחירות.",
    hint: (n: number) => `${n} מפלגות מתמודדות. בכל קבוצה הסדר הוא הסדר הרשמי של ועדת הבחירות המרכזית.`,
    inPolls: "מופיעות בסקרים",
    more: "מפלגות נוספות",
  },
  {
    en: {
      title: "The parties",
      description: "Every party that is running, in the official order of the Elections Committee.",
      hint: (n: number) => `${n} parties are running. Within each group the order is the official order of the Central Elections Committee.`,
      inPolls: "In the polls",
      more: "Other parties",
    },
    ar: {
      title: "الأحزاب",
      description: "جميع الأحزاب المتنافسة، بحسب الترتيب الرسمي للجنة الانتخابات.",
      hint: (n: number) => `يتنافس ${arCount(n, ["حزب واحد", "حزبان", "أحزاب", "حزبًا"])}. الترتيب داخل كل مجموعة هو الترتيب الرسمي للجنة الانتخابات المركزية.`,
      inPolls: "الأحزاب في استطلاعات الرأي",
      more: "أحزاب أخرى",
    },
    ru: {
      title: "Партии",
      description: "Все участвующие партии в официальном порядке Центральной избирательной комиссии.",
      hint: (n: number) => `${ruPlural(n, "Участвует", "Участвуют", "Участвуют")} ${n} ${ruPlural(n, "партия", "партии", "партий")}. В каждой группе порядок официальный, по списку Центральной избирательной комиссии.`,
      inPolls: "Есть в опросах",
      more: "Другие партии",
    },
    am: {
      title: "ፓርቲዎች",
      description: "የሚወዳደሩ ሁሉም ፓርቲዎች፣ በምርጫ ኮሚቴው ይፋዊ ቅደም ተከተል።",
      hint: (n: number) => `${n} ፓርቲዎች ይወዳደራሉ። በእያንዳንዱ ቡድን ውስጥ ቅደም ተከተሉ የማዕከላዊ ምርጫ ኮሚቴው ይፋዊ ቅደም ተከተል ነው።`,
      inPolls: "በቅድመ ምርጫ ጥናቶች ውስጥ ያሉ",
      more: "ሌሎች ፓርቲዎች",
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages(m);
  return pageMeta({ path: "/lists", title: t.title, description: t.description });
}

/** Every party, in the official order, with the ones in the polls first. Same layout as the party heads: names on one side, the picked party beside them. */
export default async function Lists() {
  const [t, card] = await Promise.all([getMessages(m), getMessages(cardMessages)]);
  const lists = await getDataset();
  const sorted = [...lists].sort((a, b) => (a.tier === b.tier ? a.cec_order - b.cec_order : a.tier === "main" ? -1 : 1));
  const parties: PartyEntry[] = sorted.map((l) => {
    const lead = l.candidates[0];
    const topics = new Set(l.platform?.positions.map((p) => p.topic)).size;
    return {
      slug: l.slug,
      name: l.name,
      color: l.color,
      letters: l.letters,
      main: l.tier === "main",
      leader: lead ? { name: lead.display_name, img: lead.image_url } : null,
      summary: l.summary,
      candidatesLabel: card.candidates(l.candidates.length),
      positionsLabel: topics > 0 ? card.positions(topics) : card.noPlatform,
      top: l.candidates.slice(0, 5).map((c) => ({ position: c.position, name: c.display_name })),
    };
  });
  return (
    <View>
      <ViewHead title={t.title} hint={t.hint(lists.length)} />
      <PartyExplorer parties={parties} moreLabel={t.more} />
    </View>
  );
}
