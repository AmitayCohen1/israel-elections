import { getIntl, getLocale, getMessages } from "@/i18n";
import type { Metadata } from "next";
import { SITE_URL, localeUrl, pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import Link from "@/i18n/link";
import { notFound } from "next/navigation";
import { getDataset, getList } from "@/lib/data";
import { hebrewKnessets, leadBio } from "@/lib/text";
import { mkLabelT, mkMessages } from "@/components/candidate-messages";
import { m } from "./messages";
import { Avatar } from "@/components/avatar";
import { View, ViewHead } from "@/components/view-head";
import { AccRow } from "@/components/accordion";

// Only the top of each slate is prerendered (every candidate x 5 languages was ~6,000 pages and broke the build); the rest render on first visit.
export async function generateStaticParams() {
  return (await getDataset()).flatMap((l) => l.candidates.filter((c) => c.position <= 3).map((c) => ({ slug: l.slug, position: String(c.position) })));
}

async function load(params: PageProps<"/[lang]/lists/[slug]/[position]">["params"]) {
  const { slug, position } = await params;
  const list = await getList(slug);
  const c = list?.candidates.find((x) => x.position === Number(position));
  return list && c ? { list, c } : null;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/lists/[slug]/[position]">): Promise<Metadata> {
  const data = await load(params);
  if (!data) return {};
  const t = await getMessages(m);
  return pageMeta({
    path: `/lists/${data.list.slug}/${data.c.position}`,
    title: t.title(data.c.display_name, data.c.position, data.list.name),
    description: leadBio(data.c.bio, 160) ?? t.description(data.c.display_name, data.c.position, data.list.name),
  });
}

export default async function CandidatePage({ params }: PageProps<"/[lang]/lists/[slug]/[position]">) {
  const intl = await getIntl();
  const [t, mk] = await Promise.all([getMessages(m), getMessages(mkMessages)]);
  const data = await load(params);
  if (!data) notFound();
  const { list, c } = data;
  const prev = list.candidates.find((x) => x.position === c.position - 1);
  const next = list.candidates.find((x) => x.position === c.position + 1);
  const k = c.knesset;

  const card = "rounded-[2rem] bg-mist p-5 sm:p-6";
  const lang = await getLocale();

  return (
    <View>
      <JsonLd
        data={{
          "@type": "Person",
          name: c.display_name,
          url: SITE_URL + localeUrl(lang, `/lists/${list.slug}/${c.position}`),
          ...(c.image_url ? { image: c.image_url } : {}),
          ...(c.bio ? { description: leadBio(c.bio, 300) } : {}),
          ...(c.wiki_url && !c.wiki_guessed ? { sameAs: [c.wiki_url] } : {}),
          memberOf: { "@type": "Organization", name: list.name, url: SITE_URL + localeUrl(lang, `/lists/${list.slug}`) },
        }}
      />
      <ViewHead
        title={c.display_name}
        back={{ href: `/lists/${list.slug}`, label: list.name }}
        lead={<Avatar name={c.display_name} src={c.image_url} color={list.color} size={80} />}
        hint={`${t.hint(c.position, list.name)}${k ? ` · ${mkLabelT(mk, k)}` : ""}`}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        <section className={card}>
          <h2 className="title text-2xl">{t.background}</h2>
          {c.bio ? (
            <>
              <p className="mt-3 max-w-[38rem] text-lg leading-relaxed text-pretty">{c.bio}</p>
              <p className="mt-4 text-base text-ink-2">
                {t.from}{" "}
                <a href={c.wiki_url!} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline">
                  {t.wikipedia} ↗
                </a>{" "}
                · CC BY-SA 4.0
                {c.wiki_guessed && ` · ${t.wikiGuessed}`}
              </p>
            </>
          ) : (
            <p className="mt-3 text-lg text-ink-2">{t.noInfo(c.display_name)}</p>
          )}
          {c.image_url && c.image_page && (
            <p className="mt-4 border-t border-ink/10 pt-3 text-base text-ink-2">
              {t.photo}{" "}
              <a href={c.image_page} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                {t.commons}
              </a>
              {c.image_artist && ` · ${c.image_artist}`}
              {c.image_license && ` · ${c.image_license}`}
            </p>
          )}
        </section>

        {k && (
          <section className={card}>
            <h2 className="title text-2xl">{t.inKnesset}</h2>
            <dl className="mt-4 grid grid-cols-3 gap-4">
              <Fact value={k.terms.length} label={k.terms.length === 1 ? t.knessetOne(k.terms[0]) : t.knessetMany(hebrewKnessets(k.terms))} />
              <Fact value={k.bills_initiated.toLocaleString(intl)} label={t.bills} />
              <Fact value={k.roles.length} label={t.roles} />
            </dl>
            {k.roles.length > 0 && (
              <div className="mt-4 border-t border-ink/10">
                <AccRow title={t.rolesHeading} meta={k.roles.length}>
                  <ol className="space-y-3">
                    {k.roles
                      .slice()
                      .reverse()
                      .map((r, i) => (
                        <li key={i} className="flex items-baseline gap-3">
                          <span className="w-24 shrink-0 text-base text-ink-2 tabular-nums">
                            {r.start.slice(0, 4)}–{r.end ? r.end.slice(0, 4) : t.today}
                          </span>
                          <span>
                            <span className="font-medium">{r.role}</span>
                            {r.detail && <span className="text-ink-2"> · {r.detail}</span>}
                          </span>
                        </li>
                      ))}
                  </ol>
                </AccRow>
              </div>
            )}
            <p className="mt-3 text-base text-ink-2">
              {t.from}{" "}
              <a href={k.url} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline">
                {t.knessetSite} ↗
              </a>
            </p>
          </section>
        )}
      </div>

      <nav className="mt-6 grid max-w-xl grid-cols-2 gap-4 border-t border-line pt-5">
        {next ? <Neighbor href={`/lists/${list.slug}/${next.position}`} label={t.next(next.position)} name={next.display_name} /> : <span />}
        {prev ? <Neighbor href={`/lists/${list.slug}/${prev.position}`} label={t.prev(prev.position)} name={prev.display_name} end /> : <span />}
      </nav>
    </View>
  );
}

function Fact({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div>
      <dd className="serif text-5xl tabular-nums">{value}</dd>
      <dt className="mt-1 text-base text-ink-2">{label}</dt>
    </div>
  );
}

function Neighbor({ href, label, name, end }: { href: string; label: string; name: string; end?: boolean }) {
  return (
    <Link href={href} className={`group ${end ? "text-end" : ""}`}>
      <span className="block text-base text-ink-2">{label}</span>
      <span className="block text-xl font-medium underline-offset-4 group-hover:underline">{name}</span>
    </Link>
  );
}
