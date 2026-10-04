import { getDictionary, getIntl, getLocale, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { arCount, ruPlural } from "@/i18n/messages/plural";
import { getDataset } from "@/lib/data";
import { TOPIC_KEYS, topicLabel } from "@/lib/topics";
import { getTopicUi, topicItems } from "@/components/topic-panels";
import { FlapCountdown } from "@/components/flap-countdown";
import { Card } from "@/components/card";
import { TopicStage } from "@/components/topic-stage";
import { PersonStrip } from "@/components/person-strip";
import { leaderEntryIn } from "@/lib/leaders";
import { PartyFan } from "@/components/party-fan";
import Link from "@/i18n/link";
import { Gate } from "@/components/gate";
import { VoteClip } from "@/components/vote-clip";

const m = defineMessages(
  {
    blurb: "אתר עצמאי ולא מפלגתי. המפלגות והמועמדים מוועדת הבחירות המרכזית, הרקע מהכנסת ומוויקיפדיה, והעמדות מהמצעים של המפלגות עצמן, עם ציטוט ומקור לכל דבר.",
    about: "מי אנחנו ואיך נאסף המידע",
    until: (date: string) => `עד ${date}`,
    peopleTitle: "ראשי מפלגות",
    peopleNote: (n: string) => `${n} מועמדים, ולכל אחד עמוד`,
    partiesLine: (n: number) => `${n} מפלגות מתמודדות, לפי הסדר הרשמי.`,
    partiesCta: "לכל המפלגות",
    guideTitle: "המדריך",
    guideLine: "איך מצביעים, איך סופרים, ומתי.",
    guideCta: "למדריך",
  },
  {
    en: {
      blurb: "Independent and non-partisan. Parties and candidates come from the Central Elections Committee, background from the Knesset and Wikipedia, and positions from the parties' own platforms, with a quote and a source for everything.",
      about: "Who we are and how the information was gathered",
      until: (date: string) => `Until ${date}`,
      peopleTitle: "Party leaders",
      peopleNote: (n: string) => `${n} candidates, each with a page`,
      partiesLine: (n: number) => `${n} parties are running, in the official order.`,
      partiesCta: "All parties",
      guideTitle: "The guide",
      guideLine: "How to vote, how the votes are counted, and when.",
      guideCta: "To the guide",
    },
    ar: {
      blurb: "موقع مستقل وغير حزبي. الأحزاب والمرشحون من لجنة الانتخابات المركزية، والخلفية من الكنيست وويكيبيديا، والمواقف من برامج الأحزاب نفسها، مع اقتباس ومصدر لكل أمر.",
      about: "من نحن وكيف جُمعت المعلومات",
      until: (date: string) => `حتى ${date}`,
      peopleTitle: "رؤساء الأحزاب",
      peopleNote: (n: string) => `${n} مرشحًا، ولكل واحد صفحة`,
      partiesLine: (n: number) => `يتنافس ${arCount(n, ["حزب واحد", "حزبان", "أحزاب", "حزبًا"])} في الانتخابات، بحسب الترتيب الرسمي.`,
      partiesCta: "إلى جميع الأحزاب",
      guideTitle: "الدليل",
      guideLine: "كيف نصوّت، وكيف تُحسب الأصوات، ومتى.",
      guideCta: "إلى الدليل",
    },
    ru: {
      blurb: "Независимый и беспартийный сайт. Партии и кандидаты — из Центральной избирательной комиссии, биографии — из Кнессета и Википедии, позиции — из программ самих партий, с цитатой и источником для каждого пункта.",
      about: "Кто мы и как собрана информация",
      until: (date: string) => `До ${date}`,
      peopleTitle: "Лидеры партий",
      peopleNote: (n: string) => `${n} кандидатов, у каждого своя страница`,
      partiesLine: (n: number) => `${ruPlural(n, "Участвует", "Участвуют", "Участвуют")} ${n} ${ruPlural(n, "партия", "партии", "партий")} — в официальном порядке.`,
      partiesCta: "Ко всем партиям",
      guideTitle: "Путеводитель",
      guideLine: "Как голосовать, как считают голоса и когда.",
      guideCta: "К путеводителю",
    },
    am: {
      blurb: "ገለልተኛና ከፓርቲ ነጻ የሆነ ድረ ገጽ። ፓርቲዎችና እጩዎች ከማዕከላዊ ምርጫ ኮሚቴ፣ ዳራው ከክኔሴትና ከዊኪፔዲያ፣ አቋሞቹ ደግሞ ከፓርቲዎቹ የራሳቸው መርሐ ግብሮች የተወሰዱ ናቸው፤ ለእያንዳንዱ ጥቅስና ምንጭ ተያይዟል።",
      about: "እኛ ማን ነን፣ መረጃውስ እንዴት ተሰበሰበ",
      until: (date: string) => `እስከ ${date}`,
      peopleTitle: "የፓርቲ መሪዎች",
      peopleNote: (n: string) => `${n} እጩዎች፣ ለእያንዳንዳቸው የራሳቸው ገጽ አላቸው`,
      partiesLine: (n: number) => `${n} ፓርቲዎች በይፋዊው ቅደም ተከተል ይወዳደራሉ።`,
      partiesCta: "ወደ ሁሉም ፓርቲዎች",
      guideTitle: "መመሪያው",
      guideLine: "እንዴት እንደሚመርጡ፣ ድምጽ እንዴት እንደሚቆጠርና መቼ።",
      guideCta: "ወደ መመሪያው",
    },
  },
);

/**
 * The dashboard's home: a classic title and three plain cards on a grid that fills the screen. Nothing moves and nothing is
 * coloured except the guide. The categories are tall on the left; the lists and the people sit side by side on the right half;
 * the guide is under them. The samples are the first in the official order. The long landing page lives at /old, the first
 * dashboard overview at /archive.
 */
export default async function Home() {
  const intl = await getIntl();
  const t = await getMessages(m);
  const dict = await getDictionary();
  const ui = await getTopicUi();
  const locale = await getLocale();
  const electionDay = new Intl.DateTimeFormat(intl, { day: "numeric", month: "long", timeZone: "UTC" }).format(Date.UTC(2026, 9, 27));
  const lists = await getDataset();
  const sorted = [...lists].sort((a, b) => a.cec_order - b.cec_order);
  const candidates = lists.reduce((n, l) => n + l.candidates.length, 0);
  /** A taste of what a party wrote: its own paragraph, cut at a sentence or a word, never mid-word. */
  const take = (text: string, max = 150) => {
    if (text.length <= max) return text;
    const cut = text.slice(0, max);
    const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
    return stop > max * 0.5 ? cut.slice(0, stop + 1) : cut.slice(0, cut.lastIndexOf(" ")) + "…";
  };
  /** A quote cut short: at a word, never mid-word, and always marked with an ellipsis so it never reads as the whole thing. */
  const excerpt = (text: string, max = 300) => {
    if (text.length <= max) return text;
    const cut = text.slice(0, max);
    return cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.\-–—]+$/, "") + "…";
  };
  const byList = new Map(lists.map((l) => [l.slug, l]));
  // The positions card is led by the category: for every topic, the parties that wrote on it, each in its own words (trimmed).
  const stageTopics = TOPIC_KEYS.map((key) => ({
    key,
    label: topicLabel(dict, key),
    art: `/media/illustrations/topics/${key}.png`,
    rows: topicItems(sorted, key, ui)
      .filter((r) => r.gist)
      .map((r) => {
        const l = byList.get(r.id);
        const lead = l?.candidates[0];
        // The party's own words where we have them; our summary of them only as a fallback.
        const quote = l?.platform?.positions.find((p) => p.topic === key && p.quote)?.quote;
        return { id: r.id, name: r.name, text: excerpt(quote ?? l?.platform?.topic_digests?.[key] ?? (r.gist as string)), quoted: !!quote, face: { name: lead?.display_name ?? r.name, src: lead?.image_url ?? null, color: l?.color ?? null } };
      }),
  }));

  // People: the leaders of ALL the polled parties we have a biography for (the card shows nine of them per visit, a different run each time), one shown at a time, the rest as a still list under them.
  const entries = await Promise.all(sorted.filter((l) => l.tier === "main").map((l) => leaderEntryIn(l, locale)));
  const strip = entries
    .map((e) => ({ e, p: e.people[0] }))
    .filter(({ p }) => p.bio)
    .map(({ e, p }) => ({
      slug: e.slug,
      name: p.name,
      party: e.listName,
      color: e.color,
      img: p.img,
      headline: p.line,
      bio: take(p.bio ?? "", 160),
      facts: [],
    }));

  return (
    <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5 p-4 sm:p-8 lg:h-dvh lg:min-h-[40rem] lg:px-10 lg:py-8">
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="serif text-[clamp(2.75rem,4.4vw,4.5rem)] leading-none">{dict.nav.home}</h1>
          {/* Who we are and where the data comes from, with the way to the full account */}
          <p className="mt-2 max-w-3xl text-base leading-snug text-ink-2 text-pretty">
            {t.blurb}{" "}
            <Link href="/about" className="font-medium text-ink underline underline-offset-4">
              {t.about}
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-2">{t.until(electionDay)}</p>
          <FlapCountdown className="text-[1.9rem]" gap="gap-2.5" />
        </div>
      </header>

      {/* The grid fills the screen. The people card is only as tall as its content; the guide takes the rest of that column with its clip growing to fit; the positions card shows as many parties as fit. So no card is mostly air, on a short screen or a tall one. */}
      <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-12 lg:grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)]">
        {/* People: a lot of faces, moving, and every one of them has a page */}
        <Card className="lg:col-span-6 lg:col-start-1 lg:row-start-1" title={t.peopleTitle} note={t.peopleNote(candidates.toLocaleString(intl))} href="/people">
          <PersonStrip people={strip} />
        </Card>

        {/* Under the people, one above the other, two gates of the same shape: words at the start side, one visual at the other. The parties (grey, three party cards with their ballot slips) and the guide (cream, the voting clip). */}
        <Gate className="lg:col-span-6 lg:col-start-1 lg:row-start-2" href="/lists" title={dict.nav.lists} line={t.partiesLine(lists.length)} cta={t.partiesCta}>
          <PartyFan parties={sorted.map((l) => ({ slug: l.slug, name: l.name, letters: l.letters, color: l.color, count: l.candidates.length }))} />
        </Gate>
        <Gate className="lg:col-span-6 lg:col-start-1 lg:row-start-3" href="/how-it-works" title={t.guideTitle} line={t.guideLine} cta={t.guideCta} tone="bg-cream hover:bg-[#f8f4de]">
          <VoteClip autoplay loop className="pointer-events-none h-full max-h-[11rem] min-h-0 w-auto object-contain" />
        </Gate>

        {/* Positions, led by the category: the title is the category, and a few parties respond to it; then the next one */}
        <TopicStage className="lg:col-span-6 lg:col-start-7 lg:row-span-3 lg:row-start-1" topics={stageTopics} />
      </div>
    </div>
  );
}
