import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_URL, localeUrl, pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { notFound } from "next/navigation";
import { getDataset, getList, type List } from "@/lib/data";
import { TOPIC_KEYS } from "@/lib/topics";
import { getDictionary, getLocale, getMessages } from "@/i18n";
import { PartyMark } from "@/components/party-mark";
import { partyLogo } from "@/lib/logos";
import { AccRow } from "@/components/accordion";
import { Avatar } from "@/components/avatar";
import { View, ViewHead } from "@/components/view-head";
import { CandidateProfile, CandidateSkeleton, popupId } from "@/components/candidate-profile";
import { Popup, PopupLink } from "@/components/popup";
import { m as cm } from "./[position]/messages";
import { YouTubeLite } from "@/components/youtube-lite";
import { OwnWords } from "@/components/topic-rows";
import { mkLabelT, mkMessages } from "@/components/candidate-messages";
import { m } from "./messages";
import { quoteGist } from "@/lib/quotes";
import sources from "../../../../../data/sources.json";
import { Chevron } from "@/components/chevron";
import { TopicIllustration } from "@/components/illustration";

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

// Which party this is comes from the address, so it is read inside the boundary: moving between parties shows the frame at once.
export default function ListPage({ params }: PageProps<"/[lang]/lists/[slug]">) {
  return (
    <Suspense
      fallback={
        <View width="read">
          <CandidateSkeleton />
        </View>
      }
    >
      <Party params={params} />
    </Suspense>
  );
}

async function Party({ params }: { params: PageProps<"/[lang]/lists/[slug]">["params"] }) {
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
      >
        <Links list={list} />
      </ViewHead>

      {/* Two columns: what the party says leads; who is on its slate sits beside it. */}
      <div className="grid gap-10 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-10 sm:space-y-14">
          {lead && <p className="text-lg leading-relaxed text-pretty sm:text-xl">{lead}</p>}
          {hasPositions ? <Positions list={list} /> : <p className="w-fit rounded-full bg-mist px-4 py-2 text-lg text-ink-2">{found ? t.positionsPending : t.positionsMissing}</p>}
          <People list={list} />
          <Media slug={list.slug} />
          <About list={list} />
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Slate list={list} />
        </aside>
      </div>
      <Popups list={list} />
    </View>
  );
}

/** One closed popup per candidate we know something about; the faces and rows above open them. The rest link to their own pages. */
async function Popups({ list }: { list: List }) {
  const [t, mk] = await Promise.all([getMessages(cm), getMessages(mkMessages)]);
  return list.candidates
    .filter((c) => c.bio || c.knesset)
    .map((c) => (
      <Popup key={c.position} id={popupId(c.position)}>
        <header className="mb-6 flex flex-col items-start gap-4 pe-12 sm:flex-row sm:items-center">
          <Avatar name={c.display_name} src={c.image_url} color={list.color} size={96} />
          <div className="min-w-0">
            <h2 id={`${popupId(c.position)}-title`} className="title text-3xl text-balance sm:text-4xl">
              {c.display_name}
            </h2>
            <p className="mt-1.5 text-lg text-ink-2">
              {t.hint(c.position, list.name)}
              {c.knesset ? ` · ${mkLabelT(mk, c.knesset)}` : ""}
            </p>
          </div>
        </header>
        <CandidateProfile list={list} c={c} popup />
      </Popup>
    ));
}

/** A section's title: the one shape every section on the page opens with. */
function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="title text-2xl text-balance">{children}</h2>;
}
const plus = <Chevron className="size-8 shrink-0 bg-mist sm:size-9 sm:bg-paper" />;

/** What the party says: one quiet line icon per topic, the topic, a one-line gist; open a row for the quotes. */
async function Positions({ list }: { list: List }) {
  const [t, dict] = await Promise.all([getMessages(m), getDictionary()]);
  const p = list.platform;
  const byTopic = Map.groupBy(p?.positions ?? [], (x) => x.topic);
  const missing = TOPIC_KEYS.filter((k) => !byTopic.has(k));
  return (
    <section>
      <Heading>{t.whatSays}</Heading>
      {/* One grey panel, a row per topic: its painted object, the topic and the party's words; a row opens to every quote. */}
      <div className="mt-4 divide-y divide-line border-y border-line sm:divide-y-0 sm:rounded-[2rem] sm:border-0 sm:bg-mist sm:p-2">
        {TOPIC_KEYS.map((key) => {
          const items = byTopic.get(key) ?? [];
          if (!items.length) return null;
          const digest = p?.topic_digests?.[key];
          const gist = quoteGist(items) ?? items[0].point;
          return (
            <details key={key} name="topics" className="group transition sm:rounded-3xl sm:open:bg-paper sm:open:shadow-[0_14px_30px_-24px_rgb(0_12_31/0.25)]">
              {/* On a phone the painted object moves beside the topic's name, so the party's words get the whole width. */}
              <summary className="flex cursor-pointer items-start gap-3 py-4 transition sm:items-center sm:gap-4 sm:rounded-3xl sm:p-3 sm:hover:bg-paper/60">
                <span className="hidden size-16 shrink-0 place-items-center rounded-full bg-paper sm:grid">
                  <TopicIllustration topic={key} className="!w-12" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="title flex items-center gap-2 text-xl">
                    <TopicIllustration topic={key} className="!mx-0 !w-8 shrink-0 sm:hidden" />
                    {dict.topics[key]}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-lg text-ink-2 group-open:line-clamp-none sm:line-clamp-1">{gist}</span>
                </span>
                {plus}
              </summary>
              <div className="pt-1 pb-6 sm:px-4 sm:ps-[5.75rem]">
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

/** The side column: the head of the slate, then the next few, each opening that person over the page. */
async function Slate({ list }: { list: List }) {
  const [t, mk] = await Promise.all([getMessages(m), getMessages(mkMessages)]);
  const [leader, ...rest] = list.candidates;
  if (!leader) return null;
  return (
    <div className="rounded-[2rem] bg-mist p-5">
      <p className="text-base text-ink-2">{t.leaderLabel}</p>
      <PopupLink popup={popupId(leader.position)} href={`/lists/${list.slug}/${leader.position}`} className="mt-3 flex items-center gap-4 rounded-2xl transition hover:opacity-80">
        <Avatar name={leader.display_name} src={leader.image_url} color={list.color} size={72} priority />
        <span className="min-w-0">
          <span className="title block text-xl leading-tight">{leader.display_name}</span>
          {leader.knesset && <span className="mt-0.5 block text-base text-ink-2">{mkLabelT(mk, leader.knesset)}</span>}
        </span>
      </PopupLink>
      <ol className="mt-5 border-t border-ink/10">
        {rest.slice(0, 7).map((c) => (
          <li key={c.position}>
            <PopupLink popup={popupId(c.position)} href={`/lists/${list.slug}/${c.position}`} className="flex items-center gap-3 border-b border-ink/10 py-2.5 transition hover:bg-paper/50">
              <span className="w-5 shrink-0 text-center text-base text-ink-2 tabular-nums">{c.position}</span>
              <Avatar name={c.display_name} src={c.image_url} color={list.color} size={36} />
              <span className="min-w-0 flex-1 truncate text-lg">{c.display_name}</span>
            </PopupLink>
          </li>
        ))}
      </ol>
      <a href="#people" className="mt-4 inline-block text-lg font-medium text-accent underline-offset-4 hover:underline">
        {t.allCandidates(list.candidates.length)} <span aria-hidden>↓</span>
      </a>
    </div>
  );
}

/** The whole slate in order, two columns of names; the first twenty show, the rest open under them. */
async function People({ list }: { list: List }) {
  const t = await getMessages(m);
  const first = list.candidates.slice(0, 20);
  const rest = list.candidates.slice(20);
  const item = (c: List["candidates"][number]) => (
    <li key={c.position} className="flex min-w-0 items-baseline gap-3 border-b border-line py-2">
      <span className="w-7 shrink-0 text-end text-base text-ink-2 tabular-nums">{c.position}</span>
      <PopupLink popup={popupId(c.position)} href={`/lists/${c.list_slug}/${c.position}`} className="truncate text-lg underline-offset-4 hover:underline">
        {c.display_name}
      </PopupLink>
    </li>
  );
  return (
    <section id="people" className="scroll-mt-28">
      <Heading>{t.whoIsOnList}</Heading>
      <ol className="mt-4 grid gap-x-10 sm:grid-cols-2">{first.map(item)}</ol>
      {rest.length > 0 && (
        <details className="group mt-3">
          <summary className="inline-block cursor-pointer text-lg font-medium text-accent underline-offset-4 hover:underline group-open:hidden">{t.allCandidates(list.candidates.length)}</summary>
          <ol className="grid gap-x-10 sm:grid-cols-2">{rest.map(item)}</ol>
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

/** Every official link of the party, as one quiet row of pills under the opening line. */
async function Links({ list }: { list: List }) {
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

  if (!links.length) return null;
  return (
    <>
      {/* A phone gets one button that opens the list, so the links do not fill the first screen. */}
      <details className="group mt-5 sm:hidden">
        <summary className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-mist px-4 py-3 text-lg font-medium">
          {t.links(links.length)}
          <Chevron className="size-8 shrink-0 bg-paper" />
        </summary>
        <ul className="mt-2 divide-y divide-line rounded-2xl border border-line">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 px-4 py-3 text-lg">
                {l.label}
                <span aria-hidden className="text-ink-2">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </details>
      <ul className="mt-5 hidden flex-wrap gap-2 sm:flex">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} target="_blank" rel="noreferrer" className="block rounded-full bg-mist px-4 py-1.5 text-base font-medium transition hover:bg-ink hover:text-paper">
              {l.label} ↗
            </a>
          </li>
        ))}
      </ul>
    </>
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
          <Block label={t.ballotLetters}>{list.letters}</Block>
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
