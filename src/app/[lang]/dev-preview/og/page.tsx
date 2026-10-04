import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary, getIntl, getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { getDataset } from "@/lib/data";
import { ELECTION_DAY } from "@/lib/election";

export const metadata: Metadata = {
  title: "Dev preview · share card",
  robots: { index: false },
};

const m = defineMessages(
  {
    line: "כל המפלגות וכל המועמדים לכנסת ה-26, עם מקור לכל דבר.",
    parties: "מפלגות",
    candidates: "מועמדים",
    neutral: "עצמאי ולא מפלגתי",
  },
  {
    en: {
      line: "Every party and every candidate for the 26th Knesset, with a source for everything.",
      parties: "parties",
      candidates: "candidates",
      neutral: "Independent, non-partisan",
    },
    ar: {
      line: "كل الأحزاب وكل المرشحين للكنيست الـ26، مع مصدر لكل شيء.",
      parties: "حزبًا",
      candidates: "مرشحًا",
      neutral: "مستقل وغير حزبي",
    },
    ru: {
      line: "Все партии и все кандидаты в Кнессет 26-го созыва — с источником для каждого факта.",
      parties: "партий",
      candidates: "кандидатов",
      neutral: "Независимо и беспартийно",
    },
    am: {
      line: "ለ26ኛው ክኔሴት ሁሉም ፓርቲዎችና ሁሉም ዕጩዎች፣ ለሁሉም ነገር ምንጭ ያለው።",
      parties: "ፓርቲዎች",
      candidates: "ዕጩዎች",
      neutral: "ገለልተኛ፣ ከፓርቲ ነፃ",
    },
  },
);

/**
 * The share card (Open Graph / X), one per language, at exactly 1200×630. It covers the app shell so a headless
 * screenshot of the viewport is the image: `node scripts/og.mjs` writes public/og/<lang>.png from here.
 */
export default async function ShareCard() {
  const [t, { ui }, intl, lists] = await Promise.all([
    getMessages(m),
    getDictionary(),
    getIntl(),
    getDataset(),
  ]);
  const candidates = lists.reduce((n, l) => n + l.candidates.length, 0);
  const date = new Intl.DateTimeFormat(intl, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jerusalem",
  }).format(new Date(`${ELECTION_DAY}T12:00:00+02:00`));
  const stat = (n: number, label: string) => (
    <span>
      <span className="serif text-[3.25rem] leading-none text-ink tabular-nums">
        {n.toLocaleString(intl)}
      </span>{" "}
      <span className="ms-2 text-[1.6rem] text-ink-2">{label}</span>
    </span>
  );
  return (
    <>
      {/* No dev-tools badge in the picture */}
      <style>{"nextjs-portal{display:none!important}"}</style>
      <div className="fixed top-0 left-0 z-[100] flex h-[630px] w-[1200px] gap-10 bg-paper p-12">
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-[1.45rem] text-ink-2">
            {t.neutral} · {date}
          </p>
          <h1 className="serif mt-6 text-[6.5rem] leading-[0.95] text-ink">
            {ui.brand}
          </h1>
          <p className="mt-7 max-w-[34rem] text-[2rem] leading-snug text-ink-2 text-pretty">
            {t.line}
          </p>
          <div className="mt-auto flex items-baseline gap-10">
            {stat(lists.length, t.parties)}
            {stat(candidates, t.candidates)}
          </div>
        </div>
        <div className="relative grid w-[25rem] shrink-0 place-items-center overflow-hidden rounded-[2.5rem] bg-cream">
          <Image
            src="/media/illustrations/ballot-box.png"
            alt=""
            width={1000}
            height={1000}
            priority
            className="w-[92%] mix-blend-multiply [mask-image:radial-gradient(closest-side,black_78%,transparent_100%)]"
          />
        </div>
      </div>
    </>
  );
}
