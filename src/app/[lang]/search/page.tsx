import { getIntl, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { arCount, ruPlural } from "@/i18n/messages/plural";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getSearchIndex } from "@/lib/data";
import { View, ViewHead } from "@/components/view-head";
import { SearchClient } from "./search-client";

const m = defineMessages(
  {
    title: "חיפוש מועמד",
    hint: (n: string, count: number, parties: number) => `${n} מועמדים ב-${parties} מפלגות. הקלידו שם.`,
  },
  {
    en: {
      title: "Find a candidate",
      hint: (n: string, count: number, parties: number) => `${n} candidates in ${parties} parties. Type a name.`,
    },
    ar: {
      title: "البحث عن مرشح",
      hint: (n: string, count: number, parties: number) => `${arCount(count, ["مرشح واحد", "مرشحان", "مرشحين", "مرشحًا"], n)} في ${arCount(parties, ["حزب واحد", "حزبين", "أحزاب", "حزبًا"])}. اكتبوا اسمًا.`,
    },
    ru: {
      title: "Поиск кандидата",
      hint: (n: string, count: number, parties: number) => `${n} ${ruPlural(count, "кандидат", "кандидата", "кандидатов")} в ${parties} ${ruPlural(parties, "партии", "партиях", "партиях")}. Введите имя.`,
    },
    am: {
      title: "እጩ ፈልግ",
      hint: (n: string, count: number, parties: number) => `በ${parties} ፓርቲዎች ውስጥ ${n} እጩዎች። ስም ይጻፉ።`,
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages(m);
  return { title: t.title };
}

export default async function SearchPage() {
  const intl = await getIntl();
  const t = await getMessages(m);
  const index = await getSearchIndex();
  const parties = new Set(index.map((e) => e.s)).size;
  return (
    <View width="read">
      <ViewHead title={t.title} hint={t.hint(index.length.toLocaleString(intl), index.length, parties)} />
      <Suspense>
        <SearchClient index={index} />
      </Suspense>
    </View>
  );
}
