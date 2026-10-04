import Image from "next/image";
import Link from "@/i18n/link";
import type { Candidate } from "@/lib/data";
import { listColor, onColor } from "@/lib/color";
import { getMessages } from "@/i18n";
import { shortBio } from "@/lib/text";
import { mkLabelT, mkMessages } from "./candidate-messages";

/** Picture first, words under it, no box. `featured` is the head of the list: four times the area. */
export async function CandidateCard({ c, color, featured = false }: { c: Candidate; color: string | null; featured?: boolean }) {
  const mk = await getMessages(mkMessages);
  const sub = c.knesset ? mkLabelT(mk, c.knesset) : shortBio(c.bio, featured ? 90 : 48);
  const initials = c.display_name
    .replace(/["'׳״]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <Link href={`/lists/${c.list_slug}/${c.position}`} className="reveal group flex h-full flex-col">
      <div className={`relative overflow-hidden bg-tile ${featured ? "aspect-[4/5] rounded-[2.5rem] sm:aspect-auto sm:flex-1" : "aspect-[4/5] rounded-[1.75rem]"}`}>
        {c.image_url ? (
          <Image
            src={c.image_url}
            alt={c.display_name}
            fill
            priority={featured}
            sizes={featured ? "(min-width: 1024px) 480px, 90vw" : "(min-width: 1024px) 230px, 45vw"}
            className="object-cover object-top transition duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <span className={`serif grid size-full place-items-center ${featured ? "text-9xl" : "text-6xl"}`} style={{ background: listColor(color), color: onColor(color) }}>
            {initials}
          </span>
        )}
        <span className={`serif absolute grid place-items-center rounded-full bg-card tabular-nums shadow-sm ${featured ? "top-5 end-5 size-14 text-3xl" : "top-3 end-3 size-10 text-xl"}`}>{c.position}</span>
      </div>
      <p className={`leading-tight font-medium ${featured ? "title mt-5 text-4xl" : "mt-4 text-xl"}`}>{c.display_name}</p>
      {sub && <p className={`mt-1 truncate text-ink-2 ${featured ? "text-xl" : "text-base"}`}>{sub}</p>}
    </Link>
  );
}
