import type { Metadata } from "next";
import { getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { arCount, ruPlural } from "@/i18n/messages/plural";
import { getDataset } from "@/lib/data";
import { PartyCard } from "@/components/list-card";
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
  return { title: t.title, description: t.description };
}

const GRID = "grid gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[110rem]:grid-cols-4";

/** Every party as a card on a grid: first the ones in the polls, then all the rest, each group in the official order. Nothing is folded away. */
export default async function Lists() {
  const t = await getMessages(m);
  const lists = await getDataset();
  const sorted = [...lists].sort((a, b) => a.cec_order - b.cec_order);
  const main = sorted.filter((l) => l.tier === "main");
  const other = sorted.filter((l) => l.tier !== "main");
  return (
    <View>
      <ViewHead title={t.title} hint={t.hint(lists.length)} />

      <h2 className="title flex items-baseline gap-2 pb-3 text-xl">
        {t.inPolls} <span className="text-base font-normal text-ink-2 tabular-nums">{main.length}</span>
      </h2>
      <ul className={GRID}>
        {main.map((l) => (
          <PartyCard key={l.slug} list={l} />
        ))}
      </ul>

      <h2 className="title flex items-baseline gap-2 pt-10 pb-3 text-xl">
        {t.more} <span className="text-base font-normal text-ink-2 tabular-nums">{other.length}</span>
      </h2>
      <ul className={GRID}>
        {other.map((l) => (
          <PartyCard key={l.slug} list={l} />
        ))}
      </ul>
    </View>
  );
}
