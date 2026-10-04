import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getDictionary, getLocale, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { getDataset } from "@/lib/data";
import { leaderEntryIn } from "@/lib/leaders";
import { PeopleExplorer } from "@/components/people-explorer";
import { View, ViewHead } from "@/components/view-head";

const m = defineMessages(
  {
    description: "ראשי המפלגות והמועמדים המובילים: רקע, ניסיון ותפקידים ציבוריים.",
    hint: "בחרו ראש מפלגה כדי לקרוא על הרקע והניסיון שלו ולהכיר את המועמדים המובילים ברשימה.",
  },
  {
    en: {
      description: "Party leaders and leading candidates: background, experience and public service.",
      hint: "Choose a party leader to explore their background and experience, and meet the leading candidates on their list.",
    },
    ar: {
      description: "من يترأس كل حزب، وماذا فعل في حياته، ومن معه في الفريق.",
      hint: "على رأس كل حزب شخص. اختاروا واحدًا لتقرؤوا من هو، وماذا فعل في حياته، ومن معه في الفريق.",
    },
    ru: {
      description: "Кто возглавляет каждую партию, чем он занимался в жизни и кто в его команде.",
      hint: "У каждой партии есть лидер. Выберите одного, чтобы прочитать, кто он, чем занимался и кто в его команде.",
    },
    am: {
      description: "እያንዳንዱን ፓርቲ የሚመራው ማን እንደሆነ፣ በሕይወቱ ምን እንደሠራና በቡድኑ ውስጥ ከእሱ ጋር ያሉት እነማን እንደሆኑ።",
      hint: "እያንዳንዱ ፓርቲ መሪ አለው። ማን እንደሆነ፣ በሕይወቱ ምን እንደሠራና በቡድኑ ውስጥ ከእሱ ጋር ያሉት እነማን እንደሆኑ ለማንበብ አንዱን ይምረጡ።",
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages(m);
  const dict = await getDictionary();
  return pageMeta({ path: "/people", title: dict.nav.people, description: t.description });
}

export default async function People() {
  const t = await getMessages(m);
  const dict = await getDictionary();
  const locale = await getLocale();
  const lists = await getDataset();
  const sorted = [...lists].sort((a, b) => a.cec_order - b.cec_order);
  const leaders = await Promise.all(sorted.map((l) => leaderEntryIn(l, locale)));
  return (
    <View>
      <ViewHead title={dict.nav.people} hint={t.hint} />
      <PeopleExplorer leaders={leaders} />
    </View>
  );
}
