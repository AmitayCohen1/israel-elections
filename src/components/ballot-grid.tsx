import Link from "@/i18n/link";
import type { List } from "@/lib/data";
import { Ballot } from "./ballot";

/** The lists as the objects voters know: the slips. Nothing else on the tile. */
export function BallotGrid({ lists }: { lists: List[] }) {
  return (
    <ul className="grid grid-cols-3 gap-x-4 gap-y-12 sm:grid-cols-5 sm:gap-y-16">
      {lists.map((l) => (
        <li key={l.slug}>
          <Link href={`/lists/${l.slug}`} className="group flex flex-col items-center gap-4 text-center">
            <Ballot
              letters={l.letters}
              color={l.color}
              size="md"
              className="transition duration-300 group-hover:-translate-y-2 group-hover:-rotate-2 sm:h-44 sm:w-34 sm:rounded-xl sm:text-6xl"
            />
            <span className="text-base leading-tight font-medium text-balance sm:text-lg">{l.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
