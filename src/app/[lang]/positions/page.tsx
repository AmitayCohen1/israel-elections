import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getDictionary, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { getDataset } from "@/lib/data";
import { loadAxes } from "@/lib/axes";
import { TOPIC_KEYS } from "@/lib/topics";
import { PageTabs } from "@/components/page-tabs";
import { AxisScale } from "@/components/axis-scale";
import { TopicPanel } from "@/components/topic-compare";

const m = defineMessages(
  {
    title: "עמדות המפלגות",
    hint: "איפה כל מפלגה עומדת, נושא אחר נושא. כל מיקום על ציר מבוסס על ציטוט של המפלגה עצמה. לחצו על מפלגה כדי לקרוא מה אמרה.",
    tabs: "נושאים",
    glance: "מבט על",
  },
  {
    en: {
      title: "Where the parties stand",
      hint: "Where each party stands, topic by topic. Every place on an axis is based on the party's own quote. Click a party to read what it said.",
      tabs: "Topics",
      glance: "At a glance",
    },
    ar: {
      title: "مواقف الأحزاب",
      hint: "أين يقف كل حزب، قضية بعد قضية. كل موقع على المحور مبني على اقتباس من الحزب نفسه. اضغطوا على حزب لقراءة ما قاله.",
      tabs: "القضايا",
      glance: "نظرة عامة",
    },
    ru: {
      title: "Позиции партий",
      hint: "Где стоит каждая партия, тема за темой. Каждое место на оси основано на цитате самой партии. Нажмите на партию, чтобы прочитать сказанное.",
      tabs: "Темы",
      glance: "Обзор",
    },
    am: {
      title: "የፓርቲዎቹ አቋሞች",
      hint: "እያንዳንዱ ፓርቲ የት እንደሚቆም፣ ርዕስ በርዕስ። በዘንጉ ላይ ያለው እያንዳንዱ ቦታ በፓርቲው በራሱ ጥቅስ ላይ የተመሠረተ ነው። ያለውን ለማንበብ ፓርቲውን ይጫኑ።",
      tabs: "ርዕሶች",
      glance: "አጠቃላይ እይታ",
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages(m);
  return pageMeta({ path: "/positions", title: t.title, description: t.hint });
}

/**
 * The positions section, one page: a first tab with every scored subject as an x axis, then a tab per topic with its axes
 * and every party's own words. The tabs swap the content in place; nothing here leaves the page except the party links.
 */
export default async function Positions() {
  const [t, dict, lists, allAxes] = await Promise.all([getMessages(m), getDictionary(), getDataset(), loadAxes()]);
  const sorted = [...lists].sort((a, b) => a.cec_order - b.cec_order);
  const main = new Set(sorted.filter((l) => l.tier === "main").map((l) => l.slug));
  // Only questions whose answers form a scale can sit on a line.
  const axes = allAxes.filter((a) => a.ordered);

  const tabs = [{ id: "glance", label: t.glance }, ...TOPIC_KEYS.map((k) => ({ id: k, label: dict.topics[k] }))];
  const panels = [
    <div key="glance" className="space-y-14">
      {axes.map((a) => (
        <AxisScale key={a.id} axis={a} only={main} />
      ))}
    </div>,
    ...TOPIC_KEYS.map((k) => {
      const own = axes.filter((a) => a.topic === k);
      return (
        <TopicPanel
          key={k}
          topic={k}
          lists={sorted}
          axes={own.length ? own.map((a) => <AxisScale key={a.id} axis={a} only={main} heading="h3" />) : null}
        />
      );
    }),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-16 sm:px-8 sm:pt-10">
      <h1 className="text-2xl leading-tight font-bold text-balance sm:text-4xl">{t.title}</h1>
      <p className="mt-3 mb-6 max-w-3xl text-lg leading-relaxed text-ink-2 text-pretty">{t.hint}</p>
      <PageTabs label={t.tabs} tabs={tabs} panels={panels} />
    </div>
  );
}
