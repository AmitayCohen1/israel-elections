import type { Metadata } from "next";
import { getLocale, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { getDataset } from "@/lib/data";
import { leaderEntryIn } from "@/lib/leaders";
import { PeopleExplorer } from "@/components/people-explorer";
import { View, ViewHead } from "@/components/view-head";

const m = defineMessages(
  {
    title: "ראשי המפלגות",
    description: "מי עומד בראש כל מפלגה, מה עשה בחייו ומי איתו בצוות.",
    hint: "בראש כל מפלגה עומד אדם. בחרו אחד כדי לקרוא מי הוא, מה עשה בחייו ומי איתו בצוות.",
  },
  {
    en: {
      title: "Party leaders",
      description: "Who heads each party, what they have done in their life, and who is on their team.",
      hint: "Every party has someone at its head. Pick one to read who they are, what they have done, and who is on their team.",
    },
    ar: {
      title: "رؤساء الأحزاب",
      description: "من يترأس كل حزب، وماذا فعل في حياته، ومن معه في الفريق.",
      hint: "على رأس كل حزب شخص. اختاروا واحدًا لتقرؤوا من هو، وماذا فعل في حياته، ومن معه في الفريق.",
    },
    ru: {
      title: "Лидеры партий",
      description: "Кто возглавляет каждую партию, чем он занимался в жизни и кто в его команде.",
      hint: "У каждой партии есть лидер. Выберите одного, чтобы прочитать, кто он, чем занимался и кто в его команде.",
    },
    am: {
      title: "የፓርቲ መሪዎች",
      description: "እያንዳንዱን ፓርቲ የሚመራው ማን እንደሆነ፣ በሕይወቱ ምን እንደሠራና በቡድኑ ውስጥ ከእሱ ጋር ያሉት እነማን እንደሆኑ።",
      hint: "እያንዳንዱ ፓርቲ መሪ አለው። ማን እንደሆነ፣ በሕይወቱ ምን እንደሠራና በቡድኑ ውስጥ ከእሱ ጋር ያሉት እነማን እንደሆኑ ለማንበብ አንዱን ይምረጡ።",
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages(m);
  return { title: t.title, description: t.description };
}

export default async function People() {
  const t = await getMessages(m);
  const locale = await getLocale();
  const lists = await getDataset();
  const sorted = [...lists].sort((a, b) => a.cec_order - b.cec_order);
  const leaders = await Promise.all(sorted.map((l) => leaderEntryIn(l, locale)));
  return (
    <View>
      <ViewHead title={t.title} hint={t.hint} />
      <PeopleExplorer leaders={leaders} />
    </View>
  );
}
