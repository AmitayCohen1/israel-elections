import Link from "@/i18n/link";
import { getLocale } from "@/i18n";
import { Arrow } from "@/components/arrow";
import type { Candidate } from "@/lib/data";
import { mkLabel, shortBio } from "@/lib/text";
import { Avatar } from "./avatar";

/** One person, one line: slot, face, name, a few words. */
export async function CandidateRow({ c, color }: { c: Candidate; color: string | null }) {
  const sub = c.knesset ? mkLabel(c.knesset, await getLocale()) : shortBio(c.bio, 60);
  return (
    <li>
      <Link href={`/lists/${c.list_slug}/${c.position}`} className="group flex items-center gap-4 border-b border-line py-4 sm:gap-6">
        <span className="serif w-10 shrink-0 text-center text-3xl text-muted tabular-nums">{c.position}</span>
        <Avatar name={c.display_name} src={c.image_url} color={color} size={56} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xl font-medium">{c.display_name}</span>
          {sub && <span className="block truncate text-base text-muted">{sub}</span>}
        </span>
        <span aria-hidden className="text-xl text-muted transition ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 group-hover:text-ink">
          <Arrow>←</Arrow>
        </span>
      </Link>
    </li>
  );
}
