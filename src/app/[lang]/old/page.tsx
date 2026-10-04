import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/i18n/link";
import { getDataset } from "@/lib/data";
import { faces } from "@/lib/faces";
import { HeroColumns } from "@/components/hero/columns";
import { StickySearch } from "@/components/sticky-search";
import { ListRow } from "@/components/list-card";
import { Statement } from "@/components/statement";
import { TopicExplorer } from "@/components/topic-explorer";
import { topicItems } from "@/components/topic-panels";
import { TopicIllustration, Illustration } from "@/components/illustration";
import { TOPICS, TOPIC_KEYS, type TopicKey } from "@/lib/topics";
import { ElectionCountdown } from "@/components/election-countdown";
import { CountTiles } from "@/components/count-tiles";
import { SectionTitle, TileFigure } from "@/components/tile";

/** The headline topics the landing page offers; every list page still carries all eight. */
const LANDING_TOPICS: TopicKey[] = ["economy", "security", "religion_state", "education", "welfare_health"];

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

export const metadata: Metadata = { title: "הדף הראשי הקודם", robots: { index: false, follow: false } };

export default async function OldHome() {
  const lists = await getDataset();
  const main = lists.filter((l) => l.tier === "main");
  const other = lists.filter((l) => l.tier === "other");
  const positions = lists.reduce((n, l) => n + (l.platform?.positions.length ?? 0), 0);
  const trio = faces(main, 3, 11);

  // The hero cards: the main lists first, then the rest, alphabetical within each tier.
  const heroLists = [...main, ...other].map((l, i) => {
    // One line the list wrote: a different topic for each card, so the wall reads as a mix, then any topic it has.
    const order = [...LANDING_TOPICS.slice(i % LANDING_TOPICS.length), ...LANDING_TOPICS.slice(0, i % LANDING_TOPICS.length), ...TOPIC_KEYS];
    const key = order.find((k) => l.platform?.topic_titles?.[k] || l.platform?.positions.some((p) => p.topic === k));
    const point = key ? (l.platform?.topic_titles?.[key] ?? l.platform?.positions.find((p) => p.topic === key)?.point) : (l.summary ?? undefined);
    return {
      slug: l.slug,
      name: l.name,
      letters: l.letters,
      count: l.candidates.length,
      faces: l.candidates.slice(0, 4).map((c) => ({ name: c.display_name, img: c.image_url })),
      topic: key ? TOPICS[key].label : undefined,
      point,
    };
  });

  const sortedLists = [...lists].sort((a, b) => a.cec_order - b.cec_order);

  return (
    <>
      {/* 1. The hero: the words and the search beside two columns of party cards that never stop moving */}
      <HeroColumns lists={heroLists} counts={`${lists.length} מפלגות מתמודדות · ${positions} עמדות עם מקור`} />

      {/* 2. By topic: pick what matters, then a list, and read what it wrote (the lens that matters more than the party) */}
      <section id="says" className="mx-auto max-w-[92rem] scroll-mt-24 px-5 pt-20 sm:px-10 sm:pt-24">
        <h2 className="serif text-center text-4xl sm:text-5xl">מה הרשימות אומרות?</h2>
        <div className="mt-6">
          <TopicExplorer
            topics={TOPIC_KEYS.map((key) => {
              const rows = topicItems(sortedLists, key);
              return {
                key,
                label: TOPICS[key].label,
                icon: <TopicIllustration topic={key} className="!w-14" />,
                rows: rows.map((r) => ({ id: r.id, name: r.name, gist: r.gist, mark: r.mark, body: r.body })),
                silent: lists.filter((l) => !rows.some((r) => r.id === l.slug)).map((l) => ({ slug: l.slug, name: l.name })),
                total: lists.length,
              };
            })}
          />
        </div>
      </section>

      {/* 3. The lists: an index, one line each */}
      <section id="lists" className="mx-auto max-w-[64rem] scroll-mt-24 px-5 pt-32 sm:pt-44">
        <div className="text-center">
          <Illustration name="slips" className="!w-28 sm:!w-36" />
          <h2 className="serif mt-5 text-5xl sm:text-[4rem]">הרשימות</h2>
          <p className="mx-auto mt-5 max-w-xl text-xl text-ink-2 sm:text-[1.75rem] sm:leading-tight">אלה שמופיעות בסקרים, לפי הסדר הרשמי של ועדת הבחירות.</p>
        </div>
        <ul className="mt-16 border-t border-line-strong">
          {main.map((l) => (
            <ListRow key={l.slug} list={l} />
          ))}
        </ul>
        <details className="group">
          <summary className="mx-auto mt-12 flex h-14 w-fit cursor-pointer items-center rounded-full bg-ink px-7 font-bold text-white transition hover:bg-accent group-open:hidden">
            ועוד {other.length} רשימות
          </summary>
          <ul>
            {other.map((l) => (
              <ListRow key={l.slug} list={l} />
            ))}
          </ul>
        </details>
      </section>

      {/* 3. One sentence that sharpens as you scroll */}
      <section className="mx-auto max-w-[62rem] px-4 py-40 text-center sm:py-64">
        <Statement
          className="serif text-[clamp(2.5rem,5.6vw,6rem)] leading-[1.06]"
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

      {/* 6. The road to election day: the countdown and October, then every date on a rail that draws itself */}
      <section className="px-3 pt-24 sm:px-6 sm:pt-40">
        <div className="text-center">
          <h2 className="serif text-5xl sm:text-[4rem]">הדרך ליום הבחירות</h2>
          <p className="mx-auto mt-5 max-w-xl text-xl text-ink-2 sm:text-[1.75rem] sm:leading-tight">מה קורה, ומתי.</p>
        </div>
        <div className="mx-auto mt-14 max-w-[80rem] rounded-[2.75rem] bg-mist px-6 py-14 sm:px-14 sm:py-20">
          <ElectionCountdown />
        </div>
        <p className="mt-8 text-center">
          <Link href="/how-it-works#timeline" className="text-lg font-semibold text-accent underline-offset-4 hover:underline">
            לוח הזמנים המלא ←
          </Link>
        </p>
      </section>

      {/* 7. How to vote, in the same tiles as the guide */}
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

        {/* 8. From votes to seats */}
        <SectionTitle>מקולות למנדטים</SectionTitle>
        <CountTiles />

        <div className="mt-24 text-center">
          <Link href="/how-it-works" className="inline-flex h-14 items-center rounded-full bg-ink px-7 font-bold text-white transition hover:bg-accent">
            המדריך המלא, כולל מחשבון מנדטים
          </Link>
        </div>
      </section>

      <StickySearch />
    </>
  );
}
