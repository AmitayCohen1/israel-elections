import { getDictionary, getIntl, getLocale, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { arCount, ruPlural } from "@/i18n/messages/plural";
import { getDataset } from "@/lib/data";
import { FlapCountdown } from "@/components/flap-countdown";
import { VoteClip } from "@/components/vote-clip";
import Image from "next/image";
import { PartyFan } from "@/components/party-fan";
import { FaceRow } from "@/components/face-row";
import Link from "@/i18n/link";
import { Gate } from "@/components/gate";
import { JsonLd } from "@/components/json-ld";
import { Statement } from "@/components/statement";
import { MapBand } from "./dev-preview/map/options";
import { loadAxes } from "@/lib/axes";
import { ListRow } from "@/components/list-card";
import { TileFigure } from "@/components/tile";
import { m as guide } from "@/i18n/messages/how-it-works";
import { SITE_URL, localeUrl } from "@/lib/seo";

const m = defineMessages(
  {
    about: "על האתר ומקורות המידע",
    until: (date: string) => `הבחירות ב־${date}`,
    quizLine: "מה חשוב לכם? ענו על שאלות וגלו אילו מפלגות קרובות לעמדות שלכם.",
    quizCta: "לשאלון",
    positionsLine: "השוו בין עמדות המפלגות בנושאים שחשובים לכם, עם ציטוטים וקישורים למקורות.",
    positionsCta: "להשוואת עמדות",
    coalitionLine: "בחרו מפלגות, קבעו כמה מנדטים יקבלו ובדקו איפה הן מסכימות ואיפה יש פערים.",
    coalitionCta: "לבניית קואליציה",
    partiesLine: (n: number) => `${n} מפלגות באתר: מי עומד בראשן, מי ברשימה ומה הן מציעות.`,
    partiesCta: "לכל המפלגות",
    guideLine: "מה עושים בקלפי, ואיך נקבע כמה מנדטים תקבל כל מפלגה.",
    guideCta: "למדריך ההצבעה",
    peopleLine: "הכירו את ראשי המפלגות ואת המועמדים המובילים: הרקע שלהם, הניסיון והתפקידים שמילאו.",
    peopleCta: "להיכרות עם המועמדים",
    peopleTitle: "מתמודדים",
    gamesTitle: "משחקים",
    gamesLine: "שאלון התאמה, בניית קואליציה, מפת קרבה ומחשבון מנדטים.",
    gamesCta: "לכל המשחקים",
    statement: ["מי מתמודד,", "מי ברשימה", "ומה כל מפלגה מציעה."],
    playTitle: "איך יכולה להיראות הכנסת הבאה?",
    playNote: "בדקו הרכבים אפשריים של קואליציה, את הקרבה בין המפלגות ואת חלוקת המנדטים.",
    closenessLine: "ראו אילו מפלגות מחזיקות בעמדות דומות, ואיך הקרבה ביניהן משתנה מנושא לנושא.",
    closenessCta: "למפת הקרבה",
    seatsTitle: "מחשבון מנדטים",
    seatsLine: "שנו את מספר הקולות לכל מפלגה וראו איך זה משפיע על חלוקת המנדטים.",
    seatsCta: "למחשבון המנדטים",
    listsTitle: "המפלגות",
    listsNote: "המפלגות המרכזיות בסקרים. בחרו מפלגה כדי לקרוא על המועמדים ועל העמדות שלה.",
    listsAll: (n: number) => `לכל ${n} המפלגות`,
    voteTitle: "מה עושים בקלפי?",
    voteAll: "המדריך המלא",
  },
  {
    en: {
      about: "Who we are and how the information was gathered",
      until: (date: string) => `Until ${date}`,
      quizLine: "Answer a few questions and see which parties are close to your views.",
      quizCta: "Start",
      positionsLine: "Where each party stands, and what it says in its own words.",
      positionsCta: "See positions",
      coalitionLine: "Hand out seats, add parties and see what they agree on.",
      coalitionCta: "Start building",
      partiesLine: (n: number) => `${n} parties are running. Each one, its list and its leader.`,
      partiesCta: "All parties",
      guideLine: "How to vote, and how votes become seats.",
      guideCta: "Open the guide",
      peopleLine: "Who is on the lists: what they did before, and the roles they held.",
      peopleCta: "Meet them",
      peopleTitle: "Candidates",
      gamesTitle: "Games",
      gamesLine: "A match quiz, a coalition builder, a closeness map and a seat calculator.",
      gamesCta: "See them",
      statement: ["The parties,", "the people", "and the positions, with sources you can check."],
      playTitle: "Play with the data",
      playNote: "Four tools that turn the positions into something you can try yourself.",
      closenessLine: "Who is close to whom, topic by topic.",
      closenessCta: "Open the map",
      seatsTitle: "Seat calculator",
      seatsLine: "Move the votes and see how the 120 seats are divided.",
      seatsCta: "Calculate",
      listsTitle: "The parties",
      listsNote: "Those that appear in the polls, in the Central Elections Committee's official order.",
      listsAll: (n: number) => `All ${n} parties`,
      voteTitle: "How to vote",
      voteAll: "The full guide",
    },
    ar: {
      about: "من نحن وكيف جُمعت المعلومات",
      until: (date: string) => `حتى ${date}`,
      quizLine: "أجيبوا عن بضعة أسئلة وشاهدوا أي الأحزاب أقرب إلى مواقفكم.",
      quizCta: "ابدأوا",
      positionsLine: "أين يقف كل حزب، وماذا يقول بكلماته.",
      positionsCta: "إلى المواقف",
      coalitionLine: "وزّعوا المقاعد، أضيفوا أحزابًا وشاهدوا على ماذا تتفق.",
      coalitionCta: "ابدأوا البناء",
      partiesLine: (n: number) => `يتنافس ${arCount(n, ["حزب واحد", "حزبان", "أحزاب", "حزبًا"])}. كل حزب وقائمته ورئيسه.`,
      partiesCta: "إلى جميع الأحزاب",
      guideLine: "كيف نصوّت، وكيف تتحول الأصوات إلى مقاعد.",
      guideCta: "إلى الدليل",
      peopleLine: "من في القوائم: ماذا فعلوا من قبل، وأي مناصب شغلوا.",
      peopleCta: "إلى الأشخاص",
      peopleTitle: "المرشحون",
      gamesTitle: "ألعاب",
      gamesLine: "استبيان توافق، بناء ائتلاف، خريطة تقارب وحاسبة مقاعد.",
      gamesCta: "إلى الألعاب",
      statement: ["الأحزاب،", "الأشخاص", "والمواقف، مع مصادر يمكن التحقق منها."],
      playTitle: "العبوا بالبيانات",
      playNote: "أربع أدوات تحوّل المواقف إلى شيء يمكنكم تجربته بأنفسكم.",
      closenessLine: "من قريب ممن، في كل موضوع على حدة.",
      closenessCta: "إلى الخريطة",
      seatsTitle: "حاسبة المقاعد",
      seatsLine: "حرّكوا الأصوات وشاهدوا كيف تتوزع المقاعد الـ120.",
      seatsCta: "احسبوا",
      listsTitle: "الأحزاب",
      listsNote: "تلك التي تظهر في الاستطلاعات، بالترتيب الرسمي للجنة الانتخابات المركزية.",
      listsAll: (n: number) => `جميع الأحزاب (${n})`,
      voteTitle: "هكذا نصوّت",
      voteAll: "الدليل الكامل",
    },
    ru: {
      about: "Кто мы и как собрана информация",
      until: (date: string) => `До ${date}`,
      quizLine: "Ответьте на несколько вопросов и узнайте, какие партии близки вашим взглядам.",
      quizCta: "Начать",
      positionsLine: "Где стоит каждая партия и что она говорит своими словами.",
      positionsCta: "К позициям",
      coalitionLine: "Раздайте мандаты, добавьте партии и посмотрите, в чём они согласны.",
      coalitionCta: "Собрать",
      partiesLine: (n: number) => `${ruPlural(n, "Участвует", "Участвуют", "Участвуют")} ${n} ${ruPlural(n, "партия", "партии", "партий")}. Каждая — со своим списком и лидером.`,
      partiesCta: "Ко всем партиям",
      guideLine: "Как голосовать и как голоса становятся мандатами.",
      guideCta: "К путеводителю",
      peopleLine: "Кто в списках: чем занимались раньше и какие должности занимали.",
      peopleCta: "К людям",
      peopleTitle: "Кандидаты",
      gamesTitle: "Игры",
      gamesLine: "Тест на совпадение, сборка коалиции, карта близости и калькулятор мандатов.",
      gamesCta: "К играм",
      statement: ["Партии,", "люди", "и позиции — с источниками, которые можно проверить."],
      playTitle: "Поиграйте с данными",
      playNote: "Четыре инструмента, которые превращают позиции в то, что можно попробовать самому.",
      closenessLine: "Кто к кому близок — по каждой теме отдельно.",
      closenessCta: "К карте",
      seatsTitle: "Калькулятор мандатов",
      seatsLine: "Двигайте голоса и смотрите, как делятся 120 мандатов.",
      seatsCta: "Посчитать",
      listsTitle: "Партии",
      listsNote: "Те, что есть в опросах, в официальном порядке ЦИК.",
      listsAll: (n: number) => `Все партии (${n})`,
      voteTitle: "Как голосовать",
      voteAll: "Полный путеводитель",
    },
    am: {
      about: "እኛ ማን ነን፣ መረጃውስ እንዴት ተሰበሰበ",
      until: (date: string) => `እስከ ${date}`,
      quizLine: "ጥቂት ጥያቄዎችን ይመልሱና የትኞቹ ፓርቲዎች ለአቋምዎ እንደሚቀርቡ ይመልከቱ።",
      quizCta: "ይጀምሩ",
      positionsLine: "እያንዳንዱ ፓርቲ የት እንደሚቆምና በራሱ ቃል ምን እንደሚል።",
      positionsCta: "ወደ አቋሞች",
      coalitionLine: "መቀመጫዎችን ያከፋፍሉ፣ ፓርቲዎችን ይጨምሩና በምን እንደሚስማሙ ይመልከቱ።",
      coalitionCta: "መገንባት ይጀምሩ",
      partiesLine: (n: number) => `${n} ፓርቲዎች ይወዳደራሉ። እያንዳንዱ ከዝርዝሩና ከመሪው ጋር።`,
      partiesCta: "ወደ ሁሉም ፓርቲዎች",
      guideLine: "እንዴት እንደሚመርጡ፣ ድምጽ እንዴት ወደ መቀመጫ እንደሚቀየር።",
      guideCta: "ወደ መመሪያው",
      peopleLine: "በዝርዝሮቹ ላይ ያሉት እነማን ናቸው፦ ከዚህ በፊት ምን እንደሠሩና የያዟቸው ኃላፊነቶች።",
      peopleCta: "ወደ ሰዎቹ",
      peopleTitle: "ዕጩዎች",
      gamesTitle: "ጨዋታዎች",
      gamesLine: "የተዛማጅነት መጠይቅ፣ ጥምረት መገንባት፣ የቅርበት ካርታ እና የመቀመጫ ማስያ።",
      gamesCta: "ወደ ጨዋታዎቹ",
      statement: ["ፓርቲዎቹ፣", "ሰዎቹ", "እና አቋሞቹ፣ ሊረጋገጡ ከሚችሉ ምንጮች ጋር።"],
      playTitle: "በመረጃው ይጫወቱ",
      playNote: "አቋሞቹን እራስዎ ሊሞክሩት ወደሚችሉት ነገር የሚቀይሩ አራት መሣሪያዎች።",
      closenessLine: "ማን ለማን ይቀርባል፣ በእያንዳንዱ ርዕስ በተናጠል።",
      closenessCta: "ወደ ካርታው",
      seatsTitle: "የመቀመጫ ማስያ",
      seatsLine: "ድምጾቹን ያንቀሳቅሱና 120ው መቀመጫዎች እንዴት እንደሚከፋፈሉ ይመልከቱ።",
      seatsCta: "አስሉ",
      listsTitle: "ፓርቲዎቹ",
      listsNote: "በሕዝብ አስተያየት ላይ የሚታዩት፣ በማዕከላዊ ምርጫ ኮሚቴው ይፋዊ ቅደም ተከተል።",
      listsAll: (n: number) => `ሁሉም ፓርቲዎች (${n})`,
      voteTitle: "እንዴት እንደሚመረጥ",
      voteAll: "ሙሉው መመሪያ",
    },
  },
);


function Painted({ name }: { name: string }) {
  return <Image src={`/media/illustrations/${name}.png`} alt="" width={1000} height={1000} sizes="380px" className="h-[86%] w-auto mix-blend-multiply [mask-image:radial-gradient(closest-side,black_78%,transparent_100%)]" />;
}

/** A section of the long page: a serif title and one line, set at the start, then its content. It rises in as it scrolls into view. */
function Section({ id, title, note, children, wide = false }: { id: string; title: string; note?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section id={id} className={`reveal mx-auto scroll-mt-28 px-4 pt-16 sm:px-8 sm:pt-40 ${wide ? "max-w-[88rem]" : "max-w-[72rem]"}`}>
      <h2 className="serif text-4xl text-balance sm:text-[4rem] sm:leading-none">{title}</h2>
      {note && <p className="mt-3 max-w-2xl text-lg text-ink-2 sm:mt-4 sm:text-2xl sm:leading-snug">{note}</p>}
      <div className="mt-6 sm:mt-14">{children}</div>
    </section>
  );
}

/** Faces scattered at fixed spots, some near each other and some apart: the closeness map in miniature. */
function Scatter({ faces }: { faces: { slug: string; name: string; img: string | null }[] }) {
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

/**
 * The home page, one long scroll. The hero leads straight into three ways in (the candidates, the parties, the games),
 * then the page walks through the rest: one sentence that sharpens as it passes, the tools to play with, the comparison of a
 * few parties side by side, the parties as an index, and how to vote. Each section rises in as it arrives.
 */
export default async function Home() {
  const intl = await getIntl();
  const t = await getMessages(m);
  const g = await getMessages(guide);
  const dict = await getDictionary();
  const locale = await getLocale();
  const electionDay = new Intl.DateTimeFormat(intl, { day: "numeric", month: "long", timeZone: "UTC" }).format(Date.UTC(2026, 9, 27));
  const lists = await getDataset();
  // Only questions whose answers form a scale can sit on a line.
  const axes = (await loadAxes()).filter((a) => a.ordered);
  const sorted = [...lists].sort((a, b) => a.cec_order - b.cec_order);
  const main = sorted.filter((l) => l.tier === "main");

  // The leaders with a portrait, of the parties in the polls.
  const faces = main.filter((l) => l.candidates[0]?.image_url).map((l) => ({ slug: l.slug, name: l.candidates[0].display_name, img: l.candidates[0].image_url, color: l.color }));
  const trio = faces.slice(0, 3);


  return (
    <div className="pb-8">
      <JsonLd data={{ "@type": "WebSite", name: dict.ui.brand, url: SITE_URL + localeUrl(locale), inLanguage: locale, description: dict.meta.description }} />

      {/* The hero: the time left and the slip going into the box in the top corners, the name and the line, then the three ways in, a little apart. */}
      <section className="mx-auto max-w-[88rem] px-4 pt-6 sm:px-8 sm:pt-8">
        <div className="flex flex-col items-center text-center">
          {/* The time left in the top right corner and the clip in the top left, on a line of their own above the name.
              On a phone the bar's logo is already the ballot box, so the clip steps aside and the countdown stands alone. */}
          <div className="flex w-full items-center justify-center sm:justify-between ltr:flex-row-reverse">
            <FlapCountdown className="text-[1.3rem]" gap="gap-2" />
            <VoteClip autoplay loop className="pointer-events-none hidden h-20 w-auto object-contain sm:block" />
          </div>
          <h1 className="serif mt-7 text-[clamp(3.2rem,5.6vw,6rem)] leading-[0.95] text-balance sm:mt-14">{dict.ui.brand}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-snug text-ink-2 text-pretty sm:text-xl">
            {dict.ui.blurb}{" "}
            <Link href="/about" className="font-medium text-ink underline underline-offset-4">
              {t.about}
            </Link>
          </p>
        </div>
        {/* Three ways in, one visual each and none repeated: faces for the candidates, ballot slips for the parties, seats for the games. */}
        <div className="mt-8 grid gap-3 sm:mt-14 sm:gap-4 lg:mt-20 lg:grid-cols-3">
          <Gate stack className="sm:min-h-[18rem]" href="/people" title={t.peopleTitle} line={t.peopleLine} cta={t.peopleCta}>
            <FaceRow faces={faces} />
          </Gate>
          <Gate stack className="sm:min-h-[18rem]" href="/lists" title={dict.nav.lists} line={t.partiesLine(lists.length)} cta={t.partiesCta}>
            <PartyFan parties={sorted.map((l) => ({ slug: l.slug, name: l.name, letters: l.letters, color: l.color, count: l.candidates.length }))} />
          </Gate>
          <Gate stack className="sm:min-h-[18rem]" href="#play" title={t.gamesTitle} line={t.gamesLine} cta={t.gamesCta}>
            <Seats />
          </Gate>
        </div>
      </section>

      {/* One sentence that sharpens word by word as it scrolls past. */}
      <section className="mx-auto max-w-[62rem] px-4 pt-20 pb-2 text-center sm:pt-48 sm:pb-10">
        <Statement
          className="serif text-[clamp(2.5rem,5.6vw,6rem)] leading-[1.06]"
          parts={[
            <span key="b" className="chip-inline slip relative !h-[0.92em] !w-[0.74em] overflow-hidden !rounded-[0.08em] shadow-md ring-1 ring-ink/10">
              <span className="absolute inset-x-0 top-0 h-[0.05em] bg-accent" />
            </span>,
            t.statement[0],
            <span key="f" className="chip-inline -space-x-[0.22em] space-x-reverse">
              {trio.map((f) => (
                <span key={f.slug} className="relative block size-[0.86em] overflow-hidden rounded-full shadow-md ring-[0.04em] ring-paper">
                  {f.img && <Image src={f.img} alt="" fill sizes="96px" className="object-cover object-top" />}
                </span>
              ))}
            </span>,
            t.statement[1],
            <span key="m" className="chip-inline size-[0.92em] overflow-hidden bg-tile shadow-md">
              <Image src="/media/illustrations/microphone.png" alt="" width={120} height={120} className="size-full scale-125 object-cover mix-blend-multiply" />
            </span>,
            t.statement[2],
          ]}
        />
      </section>

      <Section id="play" title={t.playTitle} note={t.playNote} wide>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <Gate stack className="sm:min-h-[22rem]" href="/quiz" title={dict.nav.quiz} line={t.quizLine} cta={t.quizCta}>
            <Choices />
          </Gate>
          <Gate stack className="sm:min-h-[22rem]" href="/coalition" title={dict.nav.coalition} line={t.coalitionLine} cta={t.coalitionCta}>
            <span className="relative block h-[9rem] w-[12rem]">
              <Image src="/media/illustrations/knesset.png" alt="" fill sizes="192px" style={{ "--bob-duration": "7s" } as React.CSSProperties} className="bob object-contain mix-blend-multiply" />
            </span>
          </Gate>
          <Gate stack className="sm:min-h-[22rem]" href="/closeness" title={dict.nav.closeness} line={t.closenessLine} cta={t.closenessCta}>
            <Scatter faces={faces} />
          </Gate>
          <Gate stack className="sm:min-h-[22rem]" href="/how-it-works" title={t.seatsTitle} line={t.seatsLine} cta={t.seatsCta}>
            <Seats />
          </Gate>
        </div>
      </Section>

      {/* The position map gets the whole screen, as on its own page. */}
      <MapBand id="map" axes={axes} label={dict.nav.map} className="reveal mt-16 scroll-mt-0 py-10 sm:mt-40 sm:min-h-dvh sm:py-24" />

      <Section id="parties" title={t.listsTitle} note={t.listsNote}>
        <ul className="border-t border-line-strong">
          {main.map((l) => (
            <ListRow key={l.slug} list={l} />
          ))}
        </ul>
        <p className="mt-10">
          <Link href="/lists" className="inline-flex h-14 items-center rounded-full bg-ink px-7 text-lg font-medium text-paper transition hover:bg-accent">
            {t.listsAll(lists.length)}
          </Link>
        </p>
      </Section>

      <Section id="vote" title={t.voteTitle} wide>
        {/* How long is left, where the page talks about election day */}
        <div className="mb-10 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mb-14">
          <p className="text-xl whitespace-nowrap text-ink-2">{t.until(electionDay)}</p>
          <FlapCountdown className="text-[1.9rem]" gap="gap-2.5" />
        </div>
        <div className="grid gap-x-4 gap-y-8 sm:gap-y-12 md:grid-cols-3">
          <TileFigure compact className="bg-cream" lead={g.tray.lead} text={g.tray.text}>
            <Painted name="tray" />
          </TileFigure>
          <TileFigure compact className="bg-[#dcebf3]" lead={g.envelope.lead} text={g.envelope.text}>
            <Painted name="envelope" />
          </TileFigure>
          <TileFigure compact className="bg-tile" lead={g.box.lead} text={g.box.text}>
            <Painted name="ballot-box" />
          </TileFigure>
        </div>
        <p className="mt-12">
          <Link href="/how-it-works" className="inline-flex h-14 items-center rounded-full bg-ink px-7 text-lg font-medium text-paper transition hover:bg-accent">
            {t.voteAll}
          </Link>
        </p>
      </Section>
    </div>
  );
}
