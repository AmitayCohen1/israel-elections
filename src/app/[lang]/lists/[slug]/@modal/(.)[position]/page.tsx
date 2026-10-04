import { notFound } from "next/navigation";
import { getMessages } from "@/i18n";
import { getDataset, getList } from "@/lib/data";
import { mkLabelT, mkMessages } from "@/components/candidate-messages";
import { Avatar } from "@/components/avatar";
import { CandidateProfile } from "@/components/candidate-profile";
import { Modal } from "@/components/modal";
import { m } from "../../[position]/messages";

// The same top-of-slate set the full pages prerender; the rest render on first open.
export async function generateStaticParams() {
  return (await getDataset()).flatMap((l) => l.candidates.filter((c) => c.position <= 3).map((c) => ({ slug: l.slug, position: String(c.position) })));
}

/** A candidate opened from their party's page: the same profile as their own page, as a popup over the party. A direct visit or a refresh gets the full page. */
export default async function CandidateModal({ params }: PageProps<"/[lang]/lists/[slug]/[position]">) {
  const { slug, position } = await params;
  const [t, mk] = await Promise.all([getMessages(m), getMessages(mkMessages)]);
  const list = await getList(slug);
  const c = list?.candidates.find((x) => x.position === Number(position));
  if (!list || !c) notFound();
  const k = c.knesset;
  return (
    <Modal label={c.display_name}>
      <header className="mb-6 flex items-center gap-4 pe-12">
        <Avatar name={c.display_name} src={c.image_url} color={list.color} size={96} />
        <div className="min-w-0">
          <h2 className="title text-3xl text-balance sm:text-4xl">{c.display_name}</h2>
          <p className="mt-1.5 text-lg text-ink-2">
            {t.hint(c.position, list.name)}
            {k ? ` · ${mkLabelT(mk, k)}` : ""}
          </p>
        </div>
      </header>
      <CandidateProfile list={list} c={c} replace />
    </Modal>
  );
}
