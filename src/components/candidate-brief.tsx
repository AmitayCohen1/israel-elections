import Link from "@/i18n/link";
import { getMessages } from "@/i18n";
import type { Candidate } from "@/lib/data";
import { leadBio } from "@/lib/text";
import { Avatar } from "./avatar";
import { mkLabelT, mkMessages } from "./candidate-messages";

/** One person with the words first: slot, a small photo, name, role, and the opening of their background. */
export async function CandidateBrief({ c, color }: { c: Candidate; color: string | null }) {
  const mk = await getMessages(mkMessages);
  const bio = leadBio(c.bio);
  return (
    <li>
      <Link href={`/lists/${c.list_slug}/${c.position}`} className="group flex items-start gap-4 border-b border-line py-6 sm:gap-5">
        <span className="serif w-8 shrink-0 pt-1 text-center text-2xl text-muted tabular-nums">{c.position}</span>
        <Avatar name={c.display_name} src={c.image_url} color={color} size={64} className="shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block text-xl font-medium underline-offset-4 group-hover:underline">{c.display_name}</span>
          {c.knesset && <span className="block text-sm text-ink-2">{mkLabelT(mk, c.knesset)}</span>}
          {bio && <span className="mt-2 line-clamp-4 block text-base leading-relaxed text-pretty text-ink-2">{bio}</span>}
        </span>
      </Link>
    </li>
  );
}
