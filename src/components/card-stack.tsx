import Link from "@/i18n/link";
import { getDictionary, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { ruPlural } from "@/i18n/messages/plural";
import { Arrow } from "@/components/arrow";
import { topicLabel, type TopicKey } from "@/lib/topics";
import { TopicIllustration } from "@/components/illustration";

/** One topic, and how many of the main lists published a position on it. No list is named: every topic is treated alike. */
export type StackCard = { topic: TopicKey; answered: number; total: number };

const m = defineMessages(
  {
    ask: (topic: string) => `מה המפלגות מציעות ב${topic}?`,
    ofTotal: (n: number, total: number) => ` מתוך ${total} מפלגות פרסמו עמדה`,
    all: "לכל העמדות",
  },
  {
    en: { ask: (topic: string) => `What do the parties propose on ${topic}?`, ofTotal: (n: number, total: number) => ` of ${total} parties published a position`, all: "All positions" },
    ar: { ask: (topic: string) => `ماذا تقترح الأحزاب في مجال ${topic}؟`, ofTotal: (n: number, total: number) => ` من ${total} حزبًا نشرت موقفًا`, all: "إلى جميع المواقف" },
    ru: {
      ask: (topic: string) => `Что партии предлагают по теме «${topic}»?`,
      ofTotal: (n: number, total: number) => ` из ${total} партий ${ruPlural(n, "опубликовала", "опубликовали", "опубликовали")} позицию`,
      all: "Все позиции",
    },
    am: { ask: (topic: string) => `ፓርቲዎች በ${topic} ላይ ምን ያቀርባሉ?`, ofTotal: (n: number, total: number) => ` ከ${total} ፓርቲዎች ውስጥ አቋማቸውን አሳትመዋል`, all: "ወደ ሁሉም አቋሞች" },
  },
);

// The guide's pale tiles: the painted objects have a white ground, so they multiply cleanly into each.
const SURFACES = ["bg-[#f7f4ea]", "bg-[#dcebf3]", "bg-tile", "bg-[#dbe6fa]"];

/** Where card i flips in, as a share of the pinned scroll distance; the first and last 10% are rests. */
const REST = 10;

/**
 * The topics, as a deck: the section pins to the screen and each card flips up from below
 * while the one before settles behind it, driven only by scroll (CSS scroll-driven animations, see
 * globals.css). Without that support, or with reduced motion, the same cards are a plain list.
 */
export async function CardStack({ cards, title, body, href, cta }: { cards: StackCard[]; title: React.ReactNode; body: string; href: string; cta: string }) {
  const t = await getMessages(m);
  const dict = await getDictionary();
  const n = cards.length;
  const step = (100 - 2 * REST) / Math.max(1, n - 1);
  const window = (i: number) => [REST + (i - 1) * step, REST + i * step].map((v) => Math.round(v * 100) / 100);

  return (
    <section className="sc-section" style={{ "--n": n } as React.CSSProperties}>
      <div className="sc-stage">
        <div className="mx-auto grid h-full max-w-[87rem] items-center gap-10 px-5 py-20 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:py-0">
          <div className="max-w-md lg:justify-self-end">
            <h2 className="title text-[2.5rem] leading-tight sm:text-5xl">{title}</h2>
            <p className="mt-6 text-xl leading-relaxed text-ink-2">{body}</p>
            <Link href={href} className="mt-8 inline-block text-base font-bold underline underline-offset-4">
              {cta}
            </Link>
          </div>

          <div className="sc-deck">
            {cards.map((c, i) => {
              const [inA, inB] = i === 0 ? [0, 0] : window(i);
              const [outA, outB] = i === n - 1 ? [0, 0] : window(i + 1);
              return (
                <div
                  key={c.topic}
                  className={`sc-enter ${i === 0 ? "sc-first" : ""}`}
                  style={{ zIndex: i, "--a": inA, "--b": inB, "--tilt": `${i % 2 ? 2.2 : -2.2}deg` } as React.CSSProperties}
                >
                  <Link
                    href={`/#${c.topic}`}
                    className={`sc-card ${i === n - 1 ? "sc-last" : ""} ${SURFACES[i % SURFACES.length]}`}
                    style={{ "--a": outA, "--b": outB } as React.CSSProperties}
                  >
                    <p className="text-base tracking-widest text-ink-2 tabular-nums" dir="ltr">
                      {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                    </p>
                    <p className="title mt-6 text-[1.7rem] leading-snug text-pretty sm:text-[1.9rem]">{t.ask(topicLabel(dict, c.topic))}</p>
                    <p className="mt-5 text-lg text-ink-2">
                      <span className="serif text-4xl text-ink tabular-nums">{c.answered}</span>
                      {t.ofTotal(c.answered, c.total)}
                    </p>
                    <div className="mt-auto flex items-end justify-between pt-6">
                      <span className="text-base font-bold underline underline-offset-4">{t.all} <Arrow /></span>
                      <TopicIllustration topic={c.topic} className="!mx-0 !w-36 mix-blend-multiply sm:!w-44" />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
