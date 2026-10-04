import type { Metadata } from "next";
import { SITE_URL, localeUrl, pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { notFound } from "next/navigation";
import { getDataset, getList, type List } from "@/lib/data";
import { TOPIC_KEYS } from "@/lib/topics";
import { getDictionary, getLocale, getMessages } from "@/i18n";
import Link from "@/i18n/link";
import { PartyMark } from "@/components/party-mark";
import { Ballot } from "@/components/ballot";
import { partyLogo } from "@/lib/logos";
import { AccRow } from "@/components/accordion";
import { Avatar } from "@/components/avatar";
import { View, ViewHead } from "@/components/view-head";
import { YouTubeLite } from "@/components/youtube-lite";
import { TopicIcon } from "@/components/topic-icon";
import { OwnWords } from "@/components/topic-rows";
import { leadBio, shortBio } from "@/lib/text";
import { mkLabelT, mkMessages } from "@/components/candidate-messages";
import { m } from "./messages";
import { quoteGist } from "@/lib/quotes";
import sources from "../../../../../data/sources.json";
import { Chevron } from "@/components/chevron";

type MediaItem = { title: string; url: string; outlet: string; date: string | null };
const mediaFor = (slug: string): MediaItem[] => (sources as Record<string, { media?: MediaItem[] }>)[slug]?.media ?? [];

export async function generateStaticParams() {
  return (await getDataset()).map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/lists/[slug]">): Promise<Metadata> {
  const list = await getList((await params).slug);
  if (!list) return {};
  const t = await getMessages(m);
  return pageMeta({
    path: `/lists/${list.slug}`,
    title: `${list.name} (${list.letters})`,
    description: t.description(list.candidates.length, list.name),
  });
}

export default async function ListPage({ params }: PageProps<"/[lang]/lists/[slug]">) {
  const { slug } = await params;
  const list = await getList(slug);
  if (!list) notFound();
  const t = await getMessages(m);
  const served = list.candidates.filter((c) => c.knesset).length;
  const sitting = list.candidates.filter((c) => c.knesset?.is_current).length;
  const hasPositions = !!list.platform?.positions.length;
  const found = (sources as Record<string, { status?: string }>)[list.slug]?.status === "found";
  const lead = list.summary ?? list.background[0];

  const logo = partyLogo(list.slug);
  const lang = await getLocale();
  return (
    <View>
      <JsonLd
        data={{
          "@type": "PoliticalParty",
          name: list.name,
          alternateName: [...new Set([list.official_name, list.name_en, list.letters])].filter((n) => n && n !== list.name),
          url: SITE_URL + localeUrl(lang, `/lists/${list.slug}`),
          ...(lead ? { description: lead } : {}),
          ...(logo ? { logo: SITE_URL + logo.src } : {}),
        }}
      />
      <ViewHead
        title={list.name}
        back={{ href: "/lists", label: t.allParties }}
        lead={<PartyMark slug={list.slug} letters={list.letters} color={list.color} size="sm" />}
        hint={t.hint({ total: list.candidates.length, served, sitting })}
      />

      {/* Wikipedia-style article: a single reading column with one facts panel to the side. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-x-12">
        <article className="lg:col-start-1 lg:row-start-1 lg:min-w-0">
          {lead && <p className="max-w-3xl text-xl leading-relaxed text-pretty">{lead}</p>}
          <Faces list={list} />
          {!hasPositions && <p className="mt-4 w-fit rounded-full bg-mist px-4 py-1.5 text-base text-ink-2">{found ? t.platformPending : t.platformMissing}</p>}

          <div className="mt-10 space-y-12">
            {hasPositions && <Positions list={list} />}
            <People list={list} top={hasPositions ? 8 : 12} />
            <Media slug={list.slug} />
            <About list={list} />
          </div>
        </article>

        <div className="mt-10 lg:col-start-2 lg:row-start-1 lg:mt-0 lg:sticky lg:top-8">
          <Infobox list={list} served={served} sitting={sitting} />
        </div>
      </div>
    </View>
  );
}

/** Section heading + a hairline rule: the one shape every section on the page shares. */
function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="title text-2xl text-balance">{children}</h2>;
}
const rows = "mt-3 border-t border-line";
const plus = (
  <Chevron className="size-8 bg-tile" />
);

/** What the party says: one quiet line icon per topic, the topic, a one-line gist; open a row for the quotes. */
async function Positions({ list }: { list: List }) {
  const [t, dict] = await Promise.all([getMessages(m), getDictionary()]);
  const p = list.platform;
  const byTopic = Map.groupBy(p?.positions ?? [], (x) => x.topic);
  const missing = TOPIC_KEYS.filter((k) => !byTopic.has(k));
  return (
    <section>
      <Heading>{t.whatSays}</Heading>
      <div className={rows}>
        {TOPIC_KEYS.map((key) => {
          const items = byTopic.get(key) ?? [];
          if (!items.length) return null;
          const digest = p?.topic_digests?.[key];
          const gist = quoteGist(items) ?? items[0].point;
          return (
            <details key={key} name="topics" className="group border-b border-line">
              <summary className="flex cursor-pointer items-center gap-4 py-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-tile text-ink/75">
                  <TopicIcon topic={key} className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="title block text-xl">{dict.topics[key]}</span>
                  <span className="mt-0.5 block truncate text-base text-ink-2">{gist}</span>
                </span>
                {plus}
              </summary>
              <div className="pt-1 pb-6 ps-[3.75rem]">
                <OwnWords items={items} summary={digest} size="base" />
              </div>
            </details>
          );
        })}
      </div>
      {(missing.length > 0 || p?.platform_doc) && (
        <p className="mt-4 text-base text-ink-2">
          {missing.length > 0 && t.noPositionsOn(missing.map((k) => dict.topics[k]).join(" · "))}
          {p?.platform_doc && (
            <a href={p.platform_doc.url} target="_blank" rel="noreferrer" className="font-semibold text-accent underline-offset-4 hover:underline">
              {t.fullPlatform} ↗
            </a>
          )}
        </p>
      )}
    </section>
  );
}

/** The top of the slate as faces, right under the opening line, so the people are one glance away; each face opens that person. */
async function Faces({ list }: { list: List }) {
  const t = await getMessages(m);
  const top = list.candidates.slice(0, 8);
  if (!top.length) return null;
  return (
    <div className="mt-8">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-base text-muted">{t.whoIsOnList}</p>
        <a href="#people" className="text-base font-semibold text-accent underline-offset-4 hover:underline">
          {t.allCandidates(list.candidates.length)} <span aria-hidden>↓</span>
        </a>
      </div>
      <ol className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {top.map((c) => (
          <li key={c.position} className="w-[6.5rem] shrink-0">
            <Link href={`/lists/${c.list_slug}/${c.position}`} className="group flex flex-col items-center gap-2 rounded-2xl p-2 text-center transition hover:bg-mist">
              <Avatar name={c.display_name} src={c.image_url} color={list.color} size={64} priority />
              <span className="line-clamp-2 text-base leading-tight font-medium">{c.display_name}</span>
              <span className="-mt-1 text-base text-muted tabular-nums">{c.position}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The slate, one line each; open a person for the opening of their background, then on to their page. */
async function People({ list, top: n }: { list: List; top: number }) {
  const [t, mk] = await Promise.all([getMessages(m), getMessages(mkMessages)]);
  const top = list.candidates.slice(0, n);
  const rest = list.candidates.slice(n);
  return (
    <section id="people" className="scroll-mt-8">
      <Heading>{t.whoIsOnList}</Heading>
      <div className={rows}>
        {top.map((c) => {
          const bio = leadBio(c.bio, 220);
          return (
            <details key={c.position} name="people" className="group border-b border-line">
              <summary className="flex cursor-pointer items-center gap-4 py-4">
                <span className="serif w-5 shrink-0 text-center text-lg text-muted tabular-nums">{c.position}</span>
                <Avatar name={c.display_name} src={c.image_url} color={list.color} size={40} className="shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-lg font-medium">{c.display_name}</span>
                  <span className="block truncate text-base text-ink-2">{c.knesset ? mkLabelT(mk, c.knesset) : shortBio(c.bio, 50)}</span>
                </span>
                {plus}
              </summary>
              <div className="pb-6 ps-[4.25rem]">
                {bio && <p className="text-base leading-relaxed text-pretty text-ink-2">{bio}</p>}
                <Link href={`/lists/${c.list_slug}/${c.position}`} className="mt-2 inline-block text-base font-semibold text-accent underline-offset-4 hover:underline">
                  {t.toPersonPage(c.display_name)} <span aria-hidden className="inline-block ltr:-scale-x-100">←</span>
                </Link>
              </div>
            </details>
          );
        })}
      </div>
      {rest.length > 0 && (
        <details className="group mt-3">
          <summary className="inline-block cursor-pointer text-base font-semibold text-accent underline-offset-4 hover:underline">{t.allCandidates(list.candidates.length)}</summary>
          <ol className="mt-3 grid gap-x-6 gap-y-1 text-base sm:grid-cols-2">
            {rest.map((c) => (
              <li key={c.position} className="flex min-w-0 gap-2">
                <span className="w-7 shrink-0 text-end text-muted tabular-nums">{c.position}</span>
                <Link href={`/lists/${c.list_slug}/${c.position}`} className="truncate underline-offset-4 hover:underline">
                  {c.display_name}
                </Link>
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}

const youtubeId = (url: string) => url.match(/[?&]v=([\w-]{11})/)?.[1] ?? url.match(/youtu\.be\/([\w-]{11})/)?.[1] ?? null;

/** Interviews: the YouTube ones play here, the rest link out to the outlet. */
async function Media({ slug }: { slug: string }) {
  const items = mediaFor(slug);
  if (!items.length) return null;
  const t = await getMessages(m);
  const videos = items.flatMap((m) => {
    const id = youtubeId(m.url);
    return id ? [{ ...m, id }] : [];
  });
  const articles = items.filter((m) => !youtubeId(m.url));
  return (
    <section>
      <Heading>{t.hearThem}</Heading>
      {videos.length > 0 && (
        <div className={`mt-4 grid gap-5 sm:grid-cols-2 ${videos.length > 2 ? "xl:grid-cols-3" : ""}`}>
          {videos.map((v) => (
            <YouTubeLite key={v.id} id={v.id} title={v.title} outlet={v.outlet} />
          ))}
        </div>
      )}
      {articles.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-base">
          {articles.map((m) => (
            <li key={m.url}>
              <a href={m.url} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                {m.title}
              </a>
              <span className="text-base text-ink-2"> · {m.outlet} ↗</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** The facts panel: the mark, the numbers that matter, who leads, and every official link — the one grey surface on the page. */
async function Infobox({ list, served, sitting }: { list: List; served: number; sitting: number }) {
  const t = await getMessages(m);
  const SOCIAL = t.social;
  const src = (sources as Record<string, { website?: string | null; platform_url?: string | null }>)[list.slug];
  const found = await import(`../../../../../data/links/${list.slug}.json`).then((m) => m.default as { links: { url: string; kind: string; owner?: string }[] }).catch(() => null);
  const seen = new Set<string>();
  const links = [
    src?.website && { label: SOCIAL.website, href: src.website },
    ...(found?.links ?? []).filter((l) => SOCIAL[l.kind] && (l.owner ?? "list") === "list").map((l) => ({ label: SOCIAL[l.kind], href: l.url })),
    src?.platform_url && { label: t.platformPage, href: src.platform_url },
    list.cec_url && { label: t.elections, href: list.cec_url },
  ].filter((l): l is { label: string; href: string } => {
    if (!l || seen.has(l.href.replace(/\/$/, ""))) return false;
    seen.add(l.href.replace(/\/$/, ""));
    return true;
  });

  const leader = list.candidates[0];
  const facts: { label: string; value: React.ReactNode }[] = [
    { label: t.ballotLetters, value: list.letters },
    { label: t.candidatesLabel, value: list.candidates.length },
  ];
  if (served > 0) facts.push({ label: t.servedLabel, value: served });
  if (sitting > 0) facts.push({ label: t.sittingLabel, value: sitting });
  if (leader)
    facts.push({
      label: t.leaderLabel,
      value: (
        <Link href={`/lists/${leader.list_slug}/${leader.position}`} className="underline-offset-4 hover:underline">
          {leader.display_name}
        </Link>
      ),
    });

  return (
    <aside className="rounded-[1.75rem] bg-mist p-5">
      <div className="flex items-center gap-4">
        {partyLogo(list.slug) ? <PartyMark slug={list.slug} letters={list.letters} color={list.color} size="md" /> : <Ballot letters={list.letters} color={list.color} size="md" />}
        <div className="min-w-0">
          <p className="title text-xl leading-tight text-balance">{list.name}</p>
          {list.official_name !== list.name && <p className="mt-1 text-base leading-snug text-ink-2">{list.official_name}</p>}
        </div>
      </div>

      <dl className="mt-5 border-t border-ink/10 text-base">
        {facts.map((f) => (
          <div key={f.label} className="flex items-baseline justify-between gap-3 border-b border-ink/10 py-2.5">
            <dt className="text-base text-muted">{f.label}</dt>
            <dd className="tabular-nums text-end font-medium">{f.value}</dd>
          </div>
        ))}
        {list.parties.length > 1 && (
          <div className="border-b border-ink/10 py-2.5">
            <dt className="text-base text-muted">{t.partiesInList}</dt>
            <dd className="mt-1 leading-snug">{list.parties.join(" · ")}</dd>
          </div>
        )}
      </dl>

      {links.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noreferrer" className="block rounded-full bg-paper px-3.5 py-1.5 text-base font-medium transition hover:bg-ink hover:text-paper">
                {l.label} ↗
              </a>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

async function About({ list }: { list: List }) {
  const t = await getMessages(m);
  if (list.background.length === 0 && !list.cec_url && !partyLogo(list.slug)) return null;
  return (
    <section className="border-t border-line">
      <AccRow title={t.aboutParty}>
        <div className="space-y-12 leading-relaxed">
          <Block label={t.officialName}>{list.official_name}</Block>
          {list.parties.length > 0 && <Block label={t.partiesInList}>{list.parties.join(" · ")}</Block>}
          {list.background.length > 0 && (
            <Block label={t.background}>
              <div className="space-y-4 text-ink-2">
                {list.background.map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>
              <p className="mt-4 text-base text-muted">
                {t.from}{" "}
                <a href="https://he.wikipedia.org/wiki/הבחירות_לכנסת_העשרים_ושש" target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  {t.wikipedia}
                </a>{" "}
                · CC BY-SA 4.0
              </p>
            </Block>
          )}
          {list.cec_url && (
            <a href={list.cec_url} target="_blank" rel="noreferrer" className="inline-block font-semibold text-accent underline-offset-4 hover:underline">
              {t.cecPage} ↗
            </a>
          )}
          {partyLogo(list.slug) && (
            <p className="mt-3 text-base text-ink-2">
              לוגו:{" "}
              <a href={partyLogo(list.slug)!.page} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                ויקישיתוף
              </a>
              {partyLogo(list.slug)!.artist ? ` · ${partyLogo(list.slug)!.artist}` : ""} · {partyLogo(list.slug)!.license}
            </p>
          )}
        </div>
      </AccRow>
    </section>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-base text-muted">{label}</p>
      <div className="text-xl">{children}</div>
    </div>
  );
}
