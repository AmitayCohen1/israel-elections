import { getDictionary, getIntl, getLocale, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { arCount, ruPlural } from "@/i18n/messages/plural";
import { getDataset } from "@/lib/data";
import { TOPIC_KEYS, topicLabel } from "@/lib/topics";
import { loadAxes } from "@/lib/axes";
import { FlapCountdown } from "@/components/flap-countdown";
import { PartyFan, TopicFan } from "@/components/party-fan";
import { MapTeaser } from "@/components/map-teaser";
import { FaceRow } from "@/components/face-row";
import Link from "@/i18n/link";
import { Gate } from "@/components/gate";
import { VoteClip } from "@/components/vote-clip";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL, localeUrl } from "@/lib/seo";

const m = defineMessages(
  {
    about: "מי אנחנו ואיך נאסף המידע",
    until: (date: string) => `עד ${date}`,
    mapLine: "איפה כל מפלגה עומדת בשאלות הגדולות.",
    mapCta: "למפה",
    topicsLine: "מה כל מפלגה אומרת, במילים שלה.",
    topicsCta: "לנושאים",
    peopleLine: "מי הם, ומה עשו עד היום.",
    peopleCta: "לראשי המפלגות",
    partiesLine: (n: number) => `${n} מפלגות מתמודדות. כל אחת והרשימה שלה.`,
    partiesCta: "לכל המפלגות",
    guideLine: "איך מצביעים, ואיך קולות הופכים למנדטים.",
    guideCta: "למדריך",
  },
  {
    en: {
      about: "Who we are and how the information was gathered",
      until: (date: string) => `Until ${date}`,
      mapLine: "Where each party stands on the big questions.",
      mapCta: "Open the map",
      topicsLine: "What each party says, in its own words.",
      topicsCta: "Browse topics",
      peopleLine: "Who they are and what they have done.",
      peopleCta: "Meet the leaders",
      partiesLine: (n: number) => `${n} parties are running. Each one and its list.`,
      partiesCta: "All parties",
      guideLine: "How to vote, and how votes become seats.",
      guideCta: "Open the guide",
    },
    ar: {
      about: "من نحن وكيف جُمعت المعلومات",
      until: (date: string) => `حتى ${date}`,
      mapLine: "أين يقف كل حزب في القضايا الكبرى.",
      mapCta: "إلى الخريطة",
      topicsLine: "ماذا يقول كل حزب، بكلماته.",
      topicsCta: "إلى المواضيع",
      peopleLine: "من هم، وماذا فعلوا حتى اليوم.",
      peopleCta: "إلى رؤساء الأحزاب",
      partiesLine: (n: number) => `يتنافس ${arCount(n, ["حزب واحد", "حزبان", "أحزاب", "حزبًا"])}. كل حزب وقائمته.`,
      partiesCta: "إلى جميع الأحزاب",
      guideLine: "كيف نصوّت، وكيف تتحول الأصوات إلى مقاعد.",
      guideCta: "إلى الدليل",
    },
    ru: {
      about: "Кто мы и как собрана информация",
      until: (date: string) => `До ${date}`,
      mapLine: "Где стоит каждая партия по главным вопросам.",
      mapCta: "К карте",
      topicsLine: "Что говорит каждая партия — своими словами.",
      topicsCta: "К темам",
      peopleLine: "Кто они и что сделали до сих пор.",
      peopleCta: "К лидерам",
      partiesLine: (n: number) => `${ruPlural(n, "Участвует", "Участвуют", "Участвуют")} ${n} ${ruPlural(n, "партия", "партии", "партий")}. Каждая — со своим списком.`,
      partiesCta: "Ко всем партиям",
      guideLine: "Как голосовать и как голоса становятся мандатами.",
      guideCta: "К путеводителю",
    },
    am: {
      about: "እኛ ማን ነን፣ መረጃውስ እንዴት ተሰበሰበ",
      until: (date: string) => `እስከ ${date}`,
      mapLine: "እያንዳንዱ ፓርቲ በትልልቅ ጥያቄዎች ላይ የት እንደሚቆም።",
      mapCta: "ወደ ካርታው",
      topicsLine: "እያንዳንዱ ፓርቲ በራሱ ቃል ምን ይላል።",
      topicsCta: "ወደ ርዕሶች",
      peopleLine: "እነማን ናቸው፣ እስካሁንስ ምን ሠሩ።",
      peopleCta: "ወደ መሪዎቹ",
      partiesLine: (n: number) => `${n} ፓርቲዎች ይወዳደራሉ። እያንዳንዱ ከዝርዝሩ ጋር።`,
      partiesCta: "ወደ ሁሉም ፓርቲዎች",
      guideLine: "እንዴት እንደሚመርጡ፣ ድምጽ እንዴት ወደ መቀመጫ እንደሚቀየር።",
      guideCta: "ወደ መመሪያው",
    },
  },
);

/**
 * The dashboard's home is a set of gates, nothing to read through: the title, the countdown, and one gate per view. Each
 * gate is the view's name, one line, a link, and one living visual that hints at what is inside: the map's line with the
 * parties arriving at their stops, the painted topics, the leaders' portraits, the parties' cards, the voting clip.
 * The content itself lives in the views. The long landing page lives at /old, the first dashboard overview at /archive.
 */
export default async function Home() {
  const intl = await getIntl();
  const t = await getMessages(m);
  const dict = await getDictionary();
  const locale = await getLocale();
  const electionDay = new Intl.DateTimeFormat(intl, { day: "numeric", month: "long", timeZone: "UTC" }).format(Date.UTC(2026, 9, 27));
  const lists = await getDataset();
  const sorted = [...lists].sort((a, b) => a.cec_order - b.cec_order);

  // The map's gate shows only the line and the faces (no words), so it works in every language.
  const axes = (await loadAxes())
    .filter((a) => a.ordered)
    .map((a) => ({ id: a.id, stops: a.scale.map((s) => a.cells.filter((c) => c.level === s.level).map((c) => ({ slug: c.slug, name: c.name, color: c.color, face: c.face }))) }));
  const topics = TOPIC_KEYS.map((key) => ({ key, label: topicLabel(dict, key), art: `/media/illustrations/topics/${key}.png` }));
  // The leaders with a portrait, of the parties in the polls.
  const faces = sorted
    .filter((l) => l.tier === "main" && l.candidates[0]?.image_url)
    .map((l) => ({ slug: l.slug, name: l.candidates[0].display_name, img: l.candidates[0].image_url, color: l.color }));

  return (
    <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-6 p-4 sm:p-8 lg:h-dvh lg:min-h-[54rem] lg:px-10 lg:py-8">
      <JsonLd data={{ "@type": "WebSite", name: dict.ui.brand, url: SITE_URL + localeUrl(locale), inLanguage: locale, description: dict.meta.description }} />
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="serif text-[clamp(2.75rem,4.4vw,4.5rem)] leading-none">{dict.nav.home}</h1>
          {/* Who we are, in one line, with the way to the full account */}
          <p className="mt-2 max-w-2xl text-lg leading-snug text-ink-2 text-pretty">
            {dict.ui.blurb}{" "}
            <Link href="/about" className="font-medium text-ink underline underline-offset-4">
              {t.about}
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-base text-ink-2">{t.until(electionDay)}</p>
          <FlapCountdown className="text-[1.9rem]" gap="gap-2.5" />
        </div>
      </header>

      {/* Five gates on a grid that fills the screen: the map and the topics on top, wide; the leaders, the parties and the guide under them. */}
      <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-6 lg:grid-rows-[5fr_7fr]">
        <Gate className="lg:col-span-3" href="/map" title={dict.nav.map} line={t.mapLine} cta={t.mapCta}>
          <MapTeaser axes={axes} />
        </Gate>
        <Gate className="lg:col-span-3" href="/topics" title={dict.nav.topics} line={t.topicsLine} cta={t.topicsCta}>
          <TopicFan topics={topics} />
        </Gate>
        <Gate className="lg:col-span-2" stack href="/people" title={dict.nav.people} line={t.peopleLine} cta={t.peopleCta}>
          <FaceRow faces={faces} />
        </Gate>
        <Gate className="lg:col-span-2" stack href="/lists" title={dict.nav.lists} line={t.partiesLine(lists.length)} cta={t.partiesCta}>
          <PartyFan parties={sorted.map((l) => ({ slug: l.slug, name: l.name, letters: l.letters, color: l.color, count: l.candidates.length }))} />
        </Gate>
        <Gate className="lg:col-span-2" stack href="/how-it-works" title={dict.nav.vote} line={t.guideLine} cta={t.guideCta} tone="bg-cream hover:bg-[#f8f4de]">
          <VoteClip autoplay loop className="pointer-events-none h-full max-h-[9rem] min-h-0 w-auto object-contain" />
        </Gate>
      </div>
    </div>
  );
}
