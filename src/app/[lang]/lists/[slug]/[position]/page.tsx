import { getLocale, getMessages } from "@/i18n";
import type { Metadata } from "next";
import { SITE_URL, localeUrl, pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { notFound } from "next/navigation";
import { getDataset, getList } from "@/lib/data";
import { leadBio } from "@/lib/text";
import { mkLabelT, mkMessages } from "@/components/candidate-messages";
import { m } from "./messages";
import { Avatar } from "@/components/avatar";
import { View, ViewHead } from "@/components/view-head";
import { CandidateProfile } from "@/components/candidate-profile";

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
  const [t, mk] = await Promise.all([getMessages(m), getMessages(mkMessages)]);
  const data = await load(params);
  if (!data) notFound();
  const { list, c } = data;
  const k = c.knesset;

  const lang = await getLocale();

  return (
    <View width="wide">
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

      <CandidateProfile list={list} c={c} />
    </View>
  );
}
