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
import { Chevron } from "@/components/chevron";

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

  const lang = await getLocale();
  const [lead, rest] = splitBio(c.bio);
  // The newest roles are on the page; the rest open on request, so the view fits one screen.
  const roles = k ? k.roles.slice().reverse() : [];
  const quiet = "underline underline-offset-4 hover:text-ink";

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
        lead={<Avatar name={c.display_name} src={c.image_url} color={list.color} size={96} priority />}
        hint={`${t.hint(c.position, list.name)}${k ? ` · ${mkLabelT(mk, k)}` : ""}`}
      />

      {/* No panels: the background as large reading text, the Knesset record as plain rows beside it. */}
      <div className={`grid gap-x-16 gap-y-10 lg:items-start ${k ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]" : ""}`}>
        <section className="max-w-[44rem]">
          {lead ? (
            <>
              <p className="text-xl leading-relaxed text-pretty lg:text-2xl lg:leading-relaxed">{lead}</p>
              {rest && (
                <details className="group mt-2">
                  <summary className={more}>
                    {t.readMore}
                    <Chevron className="size-8 bg-tile" />
                  </summary>
                  <p className="pt-2 text-xl leading-relaxed text-pretty text-ink-2">{rest}</p>
                </details>
              )}
              <p className="mt-5 text-base text-muted">
                {t.from}{" "}
                <a href={c.wiki_url!} target="_blank" rel="noreferrer" className={quiet}>
                  {t.wikipedia} ↗
                </a>{" "}
                · CC BY-SA 4.0
                {c.image_url && c.image_page && (
                  <>
                    {" · "}
                    {t.photo}{" "}
                    <a href={c.image_page} target="_blank" rel="noreferrer" className={quiet}>
                      {t.commons}
                    </a>
                    {c.image_artist && ` · ${c.image_artist}`}
                    {c.image_license && ` · ${c.image_license}`}
                  </>
                )}
              </p>
              {c.wiki_guessed && <p className="mt-1 text-base text-muted">{t.wikiGuessed}</p>}
            </>
          ) : (
            <p className="text-xl text-ink-2 lg:text-2xl">{t.noInfo(c.display_name)}</p>
          )}
        </section>

        {k && (
          <section>
            <h2 className="title text-2xl">{t.inKnesset}</h2>
            <dl className="mt-3 border-t border-line">
              <Fact value={k.terms.length} label={k.terms.length === 1 ? t.knessetOne(k.terms[0]) : t.knessetMany(hebrewKnessets(k.terms))} />
              <Fact value={k.bills_initiated.toLocaleString(intl)} label={t.bills} />
              <Fact value={k.roles.length} label={t.roles} />
            </dl>
            {roles.length > 0 && (
              <>
                <ol className="mt-5 space-y-3">
                  {roles.slice(0, SHOWN).map((r, i) => (
                    <Role key={i} years={`${r.start.slice(0, 4)}–${r.end ? r.end.slice(0, 4) : t.today}`} role={r.role} detail={r.detail} />
                  ))}
                </ol>
                {roles.length > SHOWN && (
                  <details className="group mt-2">
                    <summary className={more}>
                      {t.allRoles(roles.length)}
                      <Chevron className="size-8 bg-tile" />
                    </summary>
                    <ol className="space-y-3 pt-2">
                      {roles.slice(SHOWN).map((r, i) => (
                        <Role key={i} years={`${r.start.slice(0, 4)}–${r.end ? r.end.slice(0, 4) : t.today}`} role={r.role} detail={r.detail} />
                      ))}
                    </ol>
                  </details>
                )}
              </>
            )}
            <p className="mt-5 text-base text-muted">
              {t.from}{" "}
              <a href={k.url} target="_blank" rel="noreferrer" className={quiet}>
                {t.knessetSite} ↗
              </a>
            </p>
          </section>
        )}
      </div>

      <nav className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-4">
        {next ? <Neighbor href={`/lists/${list.slug}/${next.position}`} label={t.next(next.position)} name={next.display_name} /> : <span />}
        {prev ? <Neighbor href={`/lists/${list.slug}/${prev.position}`} label={t.prev(prev.position)} name={prev.display_name} end /> : <span />}
      </nav>
    </View>
  );
}

const SHOWN = 4;
const more = "flex w-fit cursor-pointer items-center gap-3 py-2 text-lg font-medium text-accent";

/** The opening sentences of the background, and whatever follows them. */
function splitBio(bio: string | null, max = 380): [string | null, string | null] {
  const s = leadBio(bio, Infinity);
  if (!s || s.length <= max) return [s, null];
  const ends = [...s.matchAll(/[.።]\s/g)].map((x) => x.index + 1);
  const stop = ends.findLast((e) => e <= max && e > max * 0.4) ?? ends.find((e) => e > max);
  return stop ? [s.slice(0, stop), s.slice(stop).trim()] : [s, null];
}

function Fact({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3 text-xl">
      <dt className="text-ink-2">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function Role({ years, role, detail }: { years: string; role: string; detail: string | null }) {
  return (
    <li className="flex items-baseline gap-4 text-lg">
      <span className="w-28 shrink-0 text-muted tabular-nums">{years}</span>
      <span>
        <span className="font-medium">{role}</span>
        {detail && <span className="text-ink-2"> · {detail}</span>}
      </span>
    </li>
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
