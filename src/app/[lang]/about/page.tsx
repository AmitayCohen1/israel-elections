import { getIntl, getMessages } from "@/i18n";
import { m } from "@/i18n/messages/about";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { View, ViewHead } from "@/components/view-head";
import Link from "@/i18n/link";
import { AccRow } from "@/components/accordion";
import { getDataset } from "@/lib/data";

const SOURCE_URLS = [
  "https://www.gov.il/he/pages/candidates-lists-26",
  "https://www.knesset.tv/main-articles/61384/94592/",
  "https://knesset.gov.il/OdataV4/ParliamentInfo/",
  "https://he.wikipedia.org/wiki/הבחירות_לכנסת_העשרים_ושש",
  "https://commons.wikimedia.org",
];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages(m);
  return pageMeta({ path: "/about", title: t.title, description: t.hint });
}

export default async function About() {
  const t = await getMessages(m);
  const intl = await getIntl();
  const lists = await getDataset();
  const candidates = lists.reduce((n, l) => n + l.candidates.length, 0);
  const withPositions = lists.filter((l) => (l.platform?.positions.length ?? 0) > 0).length;
  const positions = lists.reduce((n, l) => n + (l.platform?.positions.length ?? 0), 0);
  return (
    <View width="read">
      <ViewHead title={t.title} hint={t.hint} />

      <h2 className="title pb-3 text-2xl">{t.whoTitle}</h2>
      <div className="space-y-3 border-t border-line pt-4 text-xl leading-relaxed text-ink-2">
        <p>
          {t.who1}{" "}
          <a href="https://x.com/amitay1599" target="_blank" rel="noreferrer" className="text-accent underline underline-offset-4" dir="ltr">
            @amitay1599
          </a>
          .
        </p>
        <p>{t.who2}</p>
        <p>{t.who3}</p>
        <p>
          {t.who4a}{" "}
          <Link href="/contact" className="text-accent underline underline-offset-4">
            {t.who4link}
          </Link>
          {t.who4b}
        </p>
      </div>

      <h2 className="title pt-12 pb-3 text-2xl">{t.howTitle}</h2>
      <p className="pb-4 text-lg text-ink-2">
        {t.stats({ lists: lists.length, candidates, withPositions, positions }, (n) => n.toLocaleString(intl))}
      </p>
      <ol className="border-t border-line">
        {t.steps.map(([title, text], i) => (
          <li key={title} className="flex gap-4 border-b border-line py-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-tile text-base tabular-nums">{i + 1}</span>
            <div>
              <h3 className="title text-xl">{title}</h3>
              <p className="mt-1 text-lg leading-relaxed text-ink-2">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="title pt-12 pb-3 text-2xl">{t.rulesTitle}</h2>
      <div className="border-t border-line">
        {t.rules.map(([title, text], i) => (
          <AccRow key={title} name="rules" open={i === 0} title={title}>
            <p className="text-xl leading-relaxed text-ink-2">{text}</p>
          </AccRow>
        ))}
      </div>

      <h2 className="title pt-12 pb-3 text-2xl">{t.sourcesTitle}</h2>
      <ul className="border-t border-line">
        {t.sources.map(([name, what], i) => (
          <li key={name} className="border-b border-line py-4">
            <a href={SOURCE_URLS[i]} target="_blank" rel="noreferrer" className="title text-xl underline-offset-4 hover:underline">
              {name} ↗
            </a>
            <p className="mt-0.5 text-lg text-ink-2">{what}</p>
          </li>
        ))}
      </ul>
      <p className="pt-6 text-lg text-ink-2">{t.sourcesNote}</p>
    </View>
  );
}
