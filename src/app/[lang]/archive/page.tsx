import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/i18n/link";
import { getDataset } from "@/lib/data";
import { TOPICS, TOPIC_KEYS } from "@/lib/topics";
import { Illustration, TopicIllustration, type IllustrationName } from "@/components/illustration";
import { topicItems } from "@/components/topic-panels";
import { HeroClock } from "@/components/hero/countdown";
import { Statement } from "@/components/statement";
import { CountTiles } from "@/components/count-tiles";
import { SectionTitle, TileFigure } from "@/components/tile";
import { faces } from "@/lib/faces";

function Painted({ name }: { name: string }) {
  return (
    <Image
      src={`/media/illustrations/${name}.png`}
      alt=""
      width={1000}
      height={1000}
      sizes="380px"
      className="h-[86%] w-auto mix-blend-multiply [mask-image:radial-gradient(closest-side,black_78%,transparent_100%)]"
    />
  );
}

export const metadata: Metadata = { title: "ארכיון: סקירה", robots: { index: false } };

const WAYS: [string, string, string, IllustrationName][] = [
  ["/topics", "דרך הנושאים", "מה כל רשימה כתבה על מה שחשוב לכם.", "booklets"],
  ["/people", "דרך האנשים", "מי עומד בראש כל רשימה, ומה עשה בחייו.", "microphone"],
  ["/lists", "דרך הרשימות", "כל הרשימות, לפי הסדר הרשמי של ועדת הבחירות.", "slips"],
];

/**
 * ARCHIVE of the first dashboard overview (before the fixed one-screen home). The brand's grey canvas with the words and three ways in, then the topics as
 * painted tiles with how many lists wrote on each, the one sentence that sharpens as you scroll, and how to vote.
 * The earlier long landing page lives at /old.
 */
export default async function Archive() {
  const lists = await getDataset();
  const sorted = [...lists].sort((a, b) => a.cec_order - b.cec_order);
  const main = lists.filter((l) => l.tier === "main");
  const trio = faces(main, 3, 11);

  return (
    <>
      {/* The words, and three ways in: the grey canvas, white cards on it */}
      <section className="px-3 pt-4 sm:px-6">
        <div className="mx-auto max-w-[104rem] rounded-[2.75rem] bg-mist px-6 py-12 text-center sm:px-14 sm:py-16">
          <p className="text-lg text-ink-2">
            <HeroClock /> · יום שלישי, 27 באוקטובר 2026
          </p>
          <h1 className="serif mx-auto mt-4 max-w-4xl text-[clamp(2.75rem,5.4vw,5.5rem)] leading-[0.98] text-balance">בוחרים כנסת. מי רץ, ומה הם אומרים?</h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-snug text-ink-2 text-pretty">
            ב-27 באוקטובר בוחרים 120 חברי כנסת. מצביעים לרשימה ולא לאדם, ו-{lists.length} רשימות מתמודדות. כאן תכירו מי עומד בראש כל אחת ומה היא כתבה, עם מקור לכל דבר.
          </p>

          <p className="mt-10 text-lg text-ink-2">איך תרצו להכיר אותן?</p>
          <div className="mx-auto mt-4 grid max-w-5xl gap-4 md:grid-cols-3">
            {WAYS.map(([href, title, text, art]) => (
              <Link key={href} href={href} className="group flex flex-col items-center rounded-[2rem] bg-paper px-6 pt-6 pb-7 shadow-[0_14px_30px_-24px_rgb(0_12_31/0.25)] ring-1 ring-transparent transition hover:ring-ink/20">
                <Illustration name={art} className="!w-36 transition duration-300 group-hover:scale-105" />
                <span className="title mt-2 block text-2xl">{title}</span>
                <span className="mt-1 block text-base text-ink-2 text-pretty">{text}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What matters to you: each topic, painted, with how many lists wrote on it */}
      <section className="mx-auto max-w-[92rem] px-5 pt-20 sm:px-10 sm:pt-28">
        <div className="text-center">
          <h2 className="serif text-4xl sm:text-5xl">מה חשוב לכם?</h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-ink-2">בחרו נושא, וראו מה כל רשימה כתבה עליו.</p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TOPIC_KEYS.map((k) => (
            <Link key={k} href={`/topics#${k}`} className="group flex flex-col items-center rounded-[2rem] px-2 pt-4 pb-5 text-center transition hover:bg-tile">
              <TopicIllustration topic={k} className="!w-28 transition duration-300 group-hover:scale-105 sm:!w-32" />
              <span className="title mt-1 text-xl">{TOPICS[k].label}</span>
              <span className="mt-0.5 text-base text-ink-2">
                {topicItems(sorted, k).length} מתוך {lists.length} רשימות
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* One sentence that sharpens as you scroll */}
      <section className="mx-auto max-w-[62rem] px-4 py-32 text-center sm:py-44">
        <Statement
          className="serif text-[clamp(2.25rem,4.6vw,5rem)] leading-[1.06]"
          parts={[
            <span key="b" className="chip-inline slip relative !h-[0.92em] !w-[0.74em] overflow-hidden !rounded-[0.08em] ring-1 ring-ink/10 shadow-md">
              <span className="absolute inset-x-0 top-0 h-[0.05em] bg-accent" />
              <span className="font-ballot text-[0.3em] font-black tracking-normal">פתק</span>
            </span>,
            "הרשימות,",
            <span key="f" className="chip-inline -space-x-[0.22em] space-x-reverse">
              {trio.map((f) => (
                <span key={f.href} className="relative block size-[0.86em] overflow-hidden rounded-full shadow-md ring-[0.04em] ring-paper">
                  <Image src={f.src} alt="" fill sizes="96px" className="object-cover object-top" />
                </span>
              ))}
            </span>,
            "האנשים",
            <span key="m" className="chip-inline size-[0.92em] overflow-hidden bg-tile shadow-md">
              <Image src="/media/illustrations/microphone.png" alt="" width={120} height={120} className="size-full scale-125 object-cover mix-blend-multiply" />
            </span>,
            "והעמדות — עם מקורות שאפשר לבדוק.",
          ]}
        />
      </section>

      {/* How to vote, and from votes to seats */}
      <section className="mx-auto max-w-[87rem] px-5 sm:px-10">
        <SectionTitle>ככה מצביעים</SectionTitle>
        <div className="grid gap-x-4 gap-y-20 md:grid-cols-3">
          <TileFigure className="bg-[#f7f4ea]" lead="בוחרים פתק." text="מאחורי הפרגוד מחכה מגש עם פתק לכל רשימה.">
            <Painted name="tray" />
          </TileFigure>
          <TileFigure className="bg-[#dcebf3]" lead="מכניסים למעטפה." text="פתק אחד, במעטפה אחת.">
            <Painted name="envelope" />
          </TileFigure>
          <TileFigure className="bg-tile" lead="משלשלים לקלפי." text="מול ועדת הקלפי, וזה הכול.">
            <Painted name="ballot-box" />
          </TileFigure>
        </div>

        <SectionTitle>מקולות למנדטים</SectionTitle>
        <CountTiles />

        <div className="mt-20 text-center">
          <Link href="/how-it-works" className="inline-flex h-14 items-center rounded-full bg-ink px-7 font-bold text-white transition hover:bg-accent">
            המדריך המלא, כולל מחשבון מנדטים
          </Link>
        </div>
      </section>
      <div className="pb-8" />
    </>
  );
}
