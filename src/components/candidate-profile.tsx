import { getIntl, getMessages } from "@/i18n";
import Link from "@/i18n/link";
import type { Candidate, List } from "@/lib/data";
import { hebrewKnessets, leadBio } from "@/lib/text";
import { Chevron } from "@/components/chevron";
import { PopupLink } from "@/components/popup";
import { m } from "@/app/[lang]/lists/[slug]/[position]/messages";

/**
 * One candidate under their name: the background as large reading text, the Knesset record as plain rows beside it, then the neighbours on the slate.
 * Shared by the candidate's own page and the popup on the party page; in the popup, stepping to a neighbour opens that neighbour's popup when the page has one.
 */
export async function CandidateProfile({ list, c, popup }: { list: List; c: Candidate; popup?: boolean }) {
  const [intl, t] = await Promise.all([getIntl(), getMessages(m)]);
  const prev = list.candidates.find((x) => x.position === c.position - 1);
  const next = list.candidates.find((x) => x.position === c.position + 1);
  const k = c.knesset;
  const [lead, rest] = splitBio(c.bio);
  // The newest roles are on the page; the rest open on request, so the view fits one screen.
  const roles = k ? k.roles.slice().reverse() : [];
  // A role that began and ended in the same year shows that year once.
  const years = (r: { start: string; end: string | null }) => {
    const [a, b] = [r.start.slice(0, 4), r.end ? r.end.slice(0, 4) : t.today];
    return a === b ? a : `${a}–${b}`;
  };
  const quiet = "underline underline-offset-4 hover:text-ink";

  return (
    <>
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
                    <Role key={i} years={years(r)} role={r.role} detail={r.detail} />
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
                        <Role key={i} years={years(r)} role={r.role} detail={r.detail} />
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
        {next ? <Neighbor popup={popup ? popupId(next.position) : undefined} href={`/lists/${list.slug}/${next.position}`} label={t.next(next.position)} name={next.display_name} /> : <span />}
        {prev ? <Neighbor popup={popup ? popupId(prev.position) : undefined} href={`/lists/${list.slug}/${prev.position}`} label={t.prev(prev.position)} name={prev.display_name} end /> : <span />}
      </nav>
    </>
  );
}

/** The shape of a candidate while they load: the face, the name and a few lines of text. */
export function CandidateSkeleton() {
  const bar = "rounded-full bg-mist";
  return (
    <div aria-hidden className="animate-pulse">
      <div className="mb-8 flex items-center gap-4">
        <div className="size-24 shrink-0 rounded-full bg-mist" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className={`${bar} h-8 w-56 max-w-full`} />
          <div className={`${bar} h-5 w-72 max-w-full`} />
        </div>
      </div>
      <div className="max-w-[44rem] space-y-4">
        {["w-full", "w-11/12", "w-full", "w-10/12", "w-7/12"].map((w, i) => (
          <div key={i} className={`${bar} h-6 ${w}`} />
        ))}
      </div>
    </div>
  );
}

/** The id of a candidate's popup on their party's page. */
export const popupId = (position: number) => `candidate-${position}`;

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

function Neighbor({ href, label, name, end, popup }: { href: string; label: string; name: string; end?: boolean; popup?: string }) {
  const cls = `group ${end ? "text-end" : ""}`;
  const body = (
    <>
      <span className="block text-base text-ink-2">{label}</span>
      <span className="block text-xl font-medium underline-offset-4 group-hover:underline">{name}</span>
    </>
  );
  return popup ? (
    <PopupLink popup={popup} href={href} className={cls}>
      {body}
    </PopupLink>
  ) : (
    <Link href={href} className={cls}>
      {body}
    </Link>
  );
}
