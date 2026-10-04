import Image from "next/image";
import Link from "@/i18n/link";
import { Avatar } from "@/components/avatar";

export type WallQuote = {
  id: string;
  href: string;
  party: string;
  topic: string;
  /** The topic's painted object: the image path. */
  art: string;
  text: string;
  face: { name: string; src: string | null; color: string | null };
};

/**
 * What the parties say, as a wall that keeps rising: one quote after another across all the topics, each with the face,
 * the party and the topic it is about. Large type, so only a few are on screen at once. The set is doubled so the loop has
 * no seam; hovering holds it, and with reduced motion it stands still.
 */
export function QuoteWall({ quotes }: { quotes: WallQuote[] }) {
  return (
    <div className="marquee-wall relative h-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]">
      <ul style={{ animationDuration: `${quotes.length * 7}s` }} className="marquee-y grid gap-3">
        {[...quotes, ...quotes].map((q, i) => (
          <li key={`${q.id}-${i}`} aria-hidden={i >= quotes.length}>
            <Link href={q.href} tabIndex={i >= quotes.length ? -1 : 0} className="block rounded-[1.5rem] bg-paper p-5">
              <span className="flex items-center gap-3">
                <Avatar name={q.face.name} src={q.face.src} color={q.face.color} size={48} />
                <span className="title flex-1 text-lg leading-tight">{q.party}</span>
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-mist py-1 ps-1.5 pe-3 text-base">
                  <Image src={q.art} alt="" width={48} height={48} className="size-6 object-contain mix-blend-multiply" />
                  {q.topic}
                </span>
              </span>
              <span className="mt-3 line-clamp-4 block text-xl leading-snug text-pretty">{q.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
