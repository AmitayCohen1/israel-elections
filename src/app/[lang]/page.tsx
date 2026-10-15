import { getDictionary, getIntl, getLocale, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { getDataset, type List } from "@/lib/data";
import Link from "@/i18n/link";
import { JsonLd } from "@/components/json-ld";
import { Avatar } from "@/components/avatar";
import { PartyCard } from "@/components/list-card";
import { Chevron } from "@/components/chevron";
import { Arrow } from "@/components/arrow";
import { TOPIC_KEYS } from "@/lib/topics";
import { topicGist } from "@/lib/gist";
import { SITE_URL, localeUrl } from "@/lib/seo";

const m = defineMessages(
  {
    title: "המפלגות ומה הן אומרות",
    intro: (n: number, date: string) => `${n} המפלגות שבסקרים: מי בראשן ומה הן אומרות בכל נושא. לחצו על מפלגה כדי לפתוח אותה. הבחירות ב־${date}.`,
    byTopic: "מפת העמדות לפי נושא",
    quiz: "שאלון: מי קרוב אליי?",
    vote: "איך מצביעים",
    ledBy: (name: string) => `בראשות ${name}`,
    ballot: (letters: string) => `פתק ${letters}`,
    none: "לא מצאנו עמדה",
    more: (name: string) => `כל העמדות והמועמדים של ${name}`,
    others: "מפלגות נוספות",
    othersNote: "מתמודדות בבחירות אך אינן מופיעות בסקרים.",
  },
  {
    en: {
      title: "The parties and what they say",
      intro: (n: number, date: string) => `The ${n} parties in the polls: who leads them and what they say on each topic. Click a party to open it. Election day is ${date}.`,
      byTopic: "Positions by topic",
      quiz: "Quiz: who is close to me?",
      vote: "How to vote",
      ledBy: (name: string) => `Led by ${name}`,
      ballot: (letters: string) => `Ballot ${letters}`,
      none: "No position found",
      more: (name: string) => `All of ${name}'s positions and candidates`,
      others: "Other parties",
      othersNote: "Running, but not in the polls.",
    },
    ar: {
      title: "الأحزاب وماذا تقول",
      intro: (n: number, date: string) => `الأحزاب الـ${n} في الاستطلاعات: من يقودها وماذا تقول في كل قضية. اضغطوا على حزب لفتحه. الانتخابات في ${date}.`,
      byTopic: "مقارنة حسب القضية",
      quiz: "استبيان: من الأقرب إليّ؟",
      vote: "كيف نصوّت",
      ledBy: (name: string) => `برئاسة ${name}`,
      ballot: (letters: string) => `ورقة ${letters}`,
      none: "لم نجد موقفًا",
      more: (name: string) => `جميع مواقف ومرشحي ${name}`,
      others: "أحزاب أخرى",
      othersNote: "تتنافس في الانتخابات لكنها لا تظهر في الاستطلاعات.",
    },
    ru: {
      title: "Партии и что они говорят",
      intro: (n: number, date: string) => `${n} партий из опросов: кто их возглавляет и что они говорят по каждой теме. Нажмите на партию, чтобы открыть её. Выборы ${date}.`,
      byTopic: "Сравнить по темам",
      quiz: "Тест: кто мне ближе?",
      vote: "Как голосовать",
      ledBy: (name: string) => `Во главе: ${name}`,
      ballot: (letters: string) => `Бюллетень ${letters}`,
      none: "Позиция не найдена",
      more: (name: string) => `Все позиции и кандидаты: ${name}`,
      others: "Другие партии",
      othersNote: "Участвуют в выборах, но не представлены в опросах.",
    },
    am: {
      title: "ፓርቲዎቹና የሚሉት",
      intro: (n: number, date: string) => `በጥናቶቹ ያሉት ${n} ፓርቲዎች፦ ማን ይመራቸዋል፣ በእያንዳንዱ ርዕስ ምን ይላሉ። ለመክፈት ፓርቲውን ይጫኑ። ምርጫው ${date} ነው።`,
      byTopic: "በርዕስ ያወዳድሩ",
      quiz: "መጠይቅ፦ ማን ይቀርበኛል?",
      vote: "እንዴት እንደሚመረጥ",
      ledBy: (name: string) => `በ${name} የሚመራ`,
      ballot: (letters: string) => `የድምጽ ወረቀት ${letters}`,
      none: "አቋም አልተገኘም",
      more: (name: string) => `የ${name} ሁሉም አቋሞችና እጩዎች`,
      others: "ሌሎች ፓርቲዎች",
      othersNote: "በምርጫው ይወዳደራሉ፣ ግን በሕዝብ አስተያየት ጥናቶች ላይ አይታዩም።",
    },
  },
);

/** One party in full, without a click: who leads it, what it is, and its line on every topic, each line leading to the quote. */
async function Party({ list }: { list: List }) {
  const [t, dict] = await Promise.all([getMessages(m), getDictionary()]);
  const leader = list.candidates[0];
  return (
    <details id={list.slug} className="group scroll-mt-32 border-b border-line">
      {/* Closed, a party is one row: its leader's face, its name and who leads it. It opens in place. */}
      <summary className="flex cursor-pointer items-center gap-3 py-3 sm:gap-4 sm:py-4">
        {leader && <Avatar name={leader.display_name} src={leader.image_url} color={list.color} size={48} />}
        <span className="min-w-0 flex-1">
          <span className="block text-xl leading-tight font-bold sm:text-2xl">{list.name}</span>
          <span className="mt-0.5 block text-base text-ink-2 sm:text-lg">
            {leader && t.ledBy(leader.display_name)}
            {/* The ballot letters only where there is room: on a phone the leader's name alone keeps the row to two lines. */}
            <span className="max-sm:hidden">{leader ? " · " : ""}{t.ballot(list.letters)}</span>
          </span>
        </span>
        <Chevron className="size-9 bg-mist" />
      </summary>
      <div className="pb-6 sm:ps-16">
        {list.summary && <p className="max-w-3xl text-lg leading-relaxed text-pretty">{list.summary}</p>}
        <ul className="mt-4 border-t border-line">
          {TOPIC_KEYS.map((key) => {
            const gist = topicGist(list, key);
            return (
              <li key={key} className="border-b border-line">
                {gist ? (
                  <Link href={`/lists/${list.slug}#${key}`} className="block py-3 sm:flex sm:gap-4">
                    <span className="block shrink-0 font-semibold sm:w-40">{dict.topics[key]}</span>
                    <span className="mt-0.5 block text-ink-2 hover:text-ink hover:underline sm:mt-0">{gist}</span>
                  </Link>
                ) : (
                  <div className="py-3 sm:flex sm:gap-4">
                    <span className="block shrink-0 font-semibold text-muted sm:w-40">{dict.topics[key]}</span>
                    <span className="mt-0.5 block text-muted sm:mt-0">{t.none}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <Link href={`/lists/${list.slug}`} className="mt-4 inline-block text-lg font-semibold text-accent underline-offset-4 hover:underline">
          {t.more(list.name)} <Arrow />
        </Link>
      </div>
    </details>
  );
}

/**
 * The home page is the answer: every party in the polls as one row that opens in place to who it is and what it says on
 * each topic. Closed, the rows are the index; the rest of the parties close the page.
 */
export default async function Home() {
  const [t, dict, intl, locale, lists] = await Promise.all([getMessages(m), getDictionary(), getIntl(), getLocale(), getDataset()]);
  const electionDay = new Intl.DateTimeFormat(intl, { day: "numeric", month: "long", timeZone: "UTC" }).format(Date.UTC(2026, 9, 27));
  const sorted = [...lists].sort((a, b) => a.cec_order - b.cec_order);
  const main = sorted.filter((l) => l.tier === "main");
  const other = sorted.filter((l) => l.tier !== "main");

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 pb-16 sm:px-8 sm:pt-10">
      <JsonLd data={{ "@type": "WebSite", name: dict.ui.brand, url: SITE_URL + localeUrl(locale), inLanguage: locale, description: dict.meta.description }} />

      <h1 className="text-2xl leading-tight font-bold text-balance sm:text-4xl">{t.title}</h1>
      <p className="mt-3 max-w-3xl text-lg leading-relaxed text-ink-2 text-pretty sm:text-xl">{t.intro(main.length, electionDay)}</p>
      {/* Where else to go, as plain links: they leave this page, so they look like links, not tabs or buttons. */}
      <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-lg font-semibold">
        <Link href="/positions" className="text-accent underline-offset-4 hover:underline">
          {t.byTopic} <Arrow />
        </Link>
        <Link href="/quiz" className="text-accent underline-offset-4 hover:underline">
          {t.quiz} <Arrow />
        </Link>
        <Link href="/how-it-works" className="text-accent underline-offset-4 hover:underline">
          {t.vote} <Arrow />
        </Link>
      </p>

      <div className="mt-8 border-t border-line-strong">
        {main.map((l) => (
          <Party key={l.slug} list={l} />
        ))}
      </div>

      <section id="others" className="mt-14">
        <h2 className="text-2xl font-bold sm:text-3xl">{t.others}</h2>
        <p className="mt-1 text-lg text-ink-2">{t.othersNote}</p>
        <ul className="mt-4 border-t border-line">
          {other.map((l) => (
            <PartyCard key={l.slug} list={l} />
          ))}
        </ul>
      </section>
    </div>
  );
}
