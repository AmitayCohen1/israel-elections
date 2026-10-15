import type { Metadata } from "next";
import Image from "next/image";
import { pageMeta } from "@/lib/seo";
import { getDictionary, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { getDataset } from "@/lib/data";
import { Gate } from "@/components/gate";

const m = defineMessages(
  {
    hint: "דרכים לשחק עם העמדות: לבדוק מי קרוב אליכם, להרכיב קואליציה, לראות מי קרוב למי ולחשב מנדטים. כל כלי נפתח בעמוד משלו.",
    quizLine: "ענו על שאלות וגלו אילו מפלגות קרובות לעמדות שלכם.",
    quizCta: "לשאלון",
    coalitionLine: "בחרו מפלגות, קבעו כמה מנדטים יקבלו ובדקו איפה הן מסכימות ואיפה יש פערים.",
    coalitionCta: "לבניית קואליציה",
    closenessLine: "ראו אילו מפלגות מחזיקות בעמדות דומות, ואיך הקרבה ביניהן משתנה מנושא לנושא.",
    closenessCta: "למפת הקרבה",
    seatsTitle: "מחשבון מנדטים",
    seatsLine: "שנו את מספר הקולות לכל מפלגה וראו איך זה משפיע על חלוקת המנדטים.",
    seatsCta: "למחשבון המנדטים",
  },
  {
    en: {
      hint: "Ways to play with the positions: see who is close to you, build a coalition, see who is close to whom and count seats. Each tool opens on its own page.",
      quizLine: "Answer a few questions and see which parties are close to your views.",
      quizCta: "Start",
      coalitionLine: "Hand out seats, add parties and see what they agree on.",
      coalitionCta: "Start building",
      closenessLine: "Who is close to whom, topic by topic.",
      closenessCta: "Open the map",
      seatsTitle: "Seat calculator",
      seatsLine: "Move the votes and see how the 120 seats are divided.",
      seatsCta: "Calculate",
    },
    ar: {
      hint: "طرق للعب بالمواقف: من الأقرب إليكم، بناء ائتلاف، من قريب ممن وحساب المقاعد. كل أداة تُفتح في صفحتها.",
      quizLine: "أجيبوا عن بضعة أسئلة وشاهدوا أي الأحزاب أقرب إلى مواقفكم.",
      quizCta: "ابدأوا",
      coalitionLine: "وزّعوا المقاعد، أضيفوا أحزابًا وشاهدوا على ماذا تتفق.",
      coalitionCta: "ابدأوا البناء",
      closenessLine: "من قريب ممن، في كل موضوع على حدة.",
      closenessCta: "إلى الخريطة",
      seatsTitle: "حاسبة المقاعد",
      seatsLine: "حرّكوا الأصوات وشاهدوا كيف تتوزع المقاعد الـ120.",
      seatsCta: "احسبوا",
    },
    ru: {
      hint: "Способы поиграть с позициями: кто вам ближе, сборка коалиции, кто к кому близок и подсчёт мандатов. Каждый инструмент открывается на своей странице.",
      quizLine: "Ответьте на несколько вопросов и узнайте, какие партии близки вашим взглядам.",
      quizCta: "Начать",
      coalitionLine: "Раздайте мандаты, добавьте партии и посмотрите, в чём они согласны.",
      coalitionCta: "Собрать",
      closenessLine: "Кто к кому близок — по каждой теме отдельно.",
      closenessCta: "К карте",
      seatsTitle: "Калькулятор мандатов",
      seatsLine: "Двигайте голоса и смотрите, как делятся 120 мандатов.",
      seatsCta: "Посчитать",
    },
    am: {
      hint: "በአቋሞቹ የሚጫወቱባቸው መንገዶች፦ ማን እንደሚቀርብዎ፣ ጥምረት መገንባት፣ ማን ለማን እንደሚቀርብና መቀመጫ ማስላት። እያንዳንዱ መሣሪያ በራሱ ገጽ ይከፈታል።",
      quizLine: "ጥቂት ጥያቄዎችን ይመልሱና የትኞቹ ፓርቲዎች ለአቋምዎ እንደሚቀርቡ ይመልከቱ።",
      quizCta: "ይጀምሩ",
      coalitionLine: "መቀመጫዎችን ያከፋፍሉ፣ ፓርቲዎችን ይጨምሩና በምን እንደሚስማሙ ይመልከቱ።",
      coalitionCta: "መገንባት ይጀምሩ",
      closenessLine: "ማን ለማን ይቀርባል፣ በእያንዳንዱ ርዕስ በተናጠል።",
      closenessCta: "ወደ ካርታው",
      seatsTitle: "የመቀመጫ ማስያ",
      seatsLine: "ድምጾቹን ያንቀሳቅሱና 120ው መቀመጫዎች እንዴት እንደሚከፋፈሉ ይመልከቱ።",
      seatsCta: "አስሉ",
    },
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const [t, dict] = await Promise.all([getMessages(m), getDictionary()]);
  return pageMeta({ path: "/tools", title: dict.nav.tools, description: t.hint });
}

/** Faces scattered at fixed spots, some near each other and some apart: the closeness map in miniature. */
function Scatter({ faces }: { faces: { slug: string; img: string | null }[] }) {
  const SPOTS = [
    [18, 30], [30, 22], [26, 58], [62, 34], [72, 26], [68, 62], [84, 70], [46, 76],
  ];
  return (
    <span className="relative block h-[9rem] w-full max-w-[16rem]">
      {faces.slice(0, SPOTS.length).map((f, i) => (
        <span key={f.slug} className="absolute size-11 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-line ring-2 ring-paper" style={{ left: `${SPOTS[i][0]}%`, top: `${SPOTS[i][1]}%` }}>
          {f.img && <Image src={f.img} alt="" fill sizes="44px" className="object-cover object-top" />}
        </span>
      ))}
    </span>
  );
}

/** The 120 seats, the first 61 filled: the majority line the seat counter is about. */
function Seats() {
  return (
    <span className="grid w-full max-w-[15rem] grid-cols-15 gap-1" aria-hidden>
      {Array.from({ length: 120 }, (_, i) => (
        <span key={i} className={`aspect-square rounded-full ${i < 61 ? "bg-accent" : "bg-line-strong/60"}`} />
      ))}
    </span>
  );
}

/** A question's answers, one of them picked: the quiz in miniature, without words. */
function Choices() {
  return (
    <span className="flex w-full max-w-[14rem] flex-col gap-2.5" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={`flex h-9 items-center gap-3 rounded-full px-3 ${i === 1 ? "bg-accent" : "bg-paper ring-1 ring-line-strong"}`}>
          <span className={`size-4 shrink-0 rounded-full ${i === 1 ? "bg-paper" : "ring-2 ring-line-strong"}`} />
          <span className={`h-2 rounded-full ${i === 1 ? "bg-paper/70" : "bg-line-strong/70"}`} style={{ width: `${[58, 72, 46, 64][i]}%` }} />
        </span>
      ))}
    </span>
  );
}

/** The tools section: four cards, each a plain link into its tool, each with a small picture of what it does. */
export default async function Tools() {
  const [t, dict, lists] = await Promise.all([getMessages(m), getDictionary(), getDataset()]);
  const faces = lists.filter((l) => l.tier === "main" && l.candidates[0]?.image_url).map((l) => ({ slug: l.slug, img: l.candidates[0].image_url }));
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-16 sm:px-8 sm:pt-10">
      <h1 className="text-2xl leading-tight font-bold text-balance sm:text-4xl">{dict.nav.tools}</h1>
      <p className="mt-3 mb-8 max-w-3xl text-lg leading-relaxed text-ink-2 text-pretty">{t.hint}</p>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <Gate stack className="sm:min-h-[20rem]" href="/quiz" title={dict.nav.quiz} line={t.quizLine} cta={t.quizCta}>
          <Choices />
        </Gate>
        <Gate stack className="sm:min-h-[20rem]" href="/coalition" title={dict.nav.coalition} line={t.coalitionLine} cta={t.coalitionCta}>
          <span className="relative block h-[9rem] w-[12rem]">
            <Image src="/media/illustrations/knesset.png" alt="" fill sizes="192px" style={{ "--bob-duration": "7s" } as React.CSSProperties} className="bob object-contain mix-blend-multiply" />
          </span>
        </Gate>
        <Gate stack className="sm:min-h-[20rem]" href="/closeness" title={dict.nav.closeness} line={t.closenessLine} cta={t.closenessCta}>
          <Scatter faces={faces} />
        </Gate>
        <Gate stack className="sm:min-h-[20rem]" href="/how-it-works#seats" title={t.seatsTitle} line={t.seatsLine} cta={t.seatsCta}>
          <Seats />
        </Gate>
      </div>
    </div>
  );
}
