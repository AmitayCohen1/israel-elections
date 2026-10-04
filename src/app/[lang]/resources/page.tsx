import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getMessages } from "@/i18n";
import Link from "@/i18n/link";
import { m } from "@/i18n/messages/resources";
import { getDataset } from "@/lib/data";
import { View, ViewHead } from "@/components/view-head";
import { ListMark } from "@/components/list-card";
import { Ballot } from "@/components/ballot";

/** The official places, before anything of ours: the committee, the state, the Knesset. Names and descriptions are in the messages, in this order. */
const OFFICIAL_URLS = [
  "https://www.bechirot.gov.il",
  "https://boharim.bechirot.gov.il",
  "https://www.gov.il/he/pages/candidates-lists-26",
  "https://www.knesset.gov.il",
  "https://knesset.gov.il/OdataV4/ParliamentInfo/",
];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages(m);
  return pageMeta({ path: "/resources", title: t.title, description: t.hint });
}

export default async function Resources() {
  const t = await getMessages(m);
  const lists = await getDataset();
  const ordered = [...lists.filter((l) => l.tier === "main"), ...lists.filter((l) => l.tier !== "main")].filter(
    (l): l is typeof l & { cec_url: string } => !!l.cec_url,
  );

  return (
    <View width="read">
      <ViewHead title={t.title} hint={t.hint} />

      <h2 className="title pb-3 text-2xl">{t.state}</h2>
      <ul className="border-t border-line">
        {t.official.map(([name, what], i) => (
          <li key={name} className="border-b border-line py-4">
            <a href={OFFICIAL_URLS[i]} target="_blank" rel="noreferrer" className="title text-xl underline-offset-4 hover:underline">
              {name} ↗
            </a>
            <p className="mt-0.5 text-lg text-ink-2">{what}</p>
          </li>
        ))}
      </ul>

      <h2 className="title pt-12 pb-3 text-2xl">{t.background}</h2>
      <ul className="border-t border-line">
        <li className="border-b border-line py-4">
          <a
            href="https://www.idi.org.il/policy/parties-and-elections/"
            target="_blank"
            rel="noreferrer"
            className="title text-xl underline-offset-4 hover:underline"
          >
            {t.idi} ↗
          </a>
          <p className="mt-0.5 text-lg text-ink-2">{t.idiText}</p>
        </li>
      </ul>

      <h2 className="title pt-12 pb-1 text-2xl">{t.perParty}</h2>
      <p className="pb-3 text-lg text-ink-2">{t.perPartyText}</p>
      <ul className="border-t border-line">
        {ordered.map((l) => (
          <li key={l.slug}>
            <a href={l.cec_url} target="_blank" rel="noreferrer" className="group flex items-center gap-4 border-b border-line py-4">
              <ListMark list={l} size={44} />
              <span className="title min-w-0 flex-1 truncate text-xl underline-offset-4 group-hover:underline">{l.name}</span>
              <Ballot letters={l.letters} color={l.color} size="sm" className="max-sm:hidden" />
              <span className="text-ink-2">↗</span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-12 rounded-[2rem] bg-mist p-6 text-lg">
        <span className="font-medium">{t.howWeUse}</span>{" "}
        <Link href="/about" className="underline underline-offset-4">
          {t.aboutLink}
        </Link>
      </p>
    </View>
  );
}
