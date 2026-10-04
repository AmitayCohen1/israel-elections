import type { Metadata } from "next";
import Link from "@/i18n/link";

export const metadata: Metadata = { title: "Dev preview", robots: { index: false } };

const PAGES = [
  { href: "/dev-preview/map", title: "Position map", note: "Each list placed on a named axis (security: the Palestinian question; religion: the Haredi draft). Every dot is a stored quote; lists with no documented position stay aside." },
  { href: "/dev-preview/cards", title: "Overview cards", note: "Options for the overview's three cards: eight for categories, eight for people, six for the guide as a doorway (contents, tiles, questions, timeline, calculator taste, blue)." },
  { href: "/dev-preview/topic", title: "Topic page", note: "Ways to read what every list wrote on one topic: cards, one line each, swipe, text only, reader, flip cards, voices, wall." },
  { href: "/dev-preview/drafts", title: "Draft review page", note: "Layouts for the page that shows a list's extracted positions: index, document, register, testimony, folders, gallery, digest and more." },
  { href: "/dev-preview/hero", title: "Hero", note: "The landing page's hero options." },
  { href: "/dev-preview/countdown", title: "Hero countdown", note: "Five ways to count down to the polls: split-flap, watch face, a dot per day, monument, sentence." },
  { href: "/dev-preview/picker", title: "List picker", note: "Ways to choose the lists you are torn between: sentence, checkbox menu, pills, shuffle." },
];

export default function DevPreview() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24">
      <header className="pt-12 pb-10 text-center">
        <p className="text-base tracking-wide text-muted">פנימי · לא מפורסם באתר</p>
        <h1 className="serif mt-5 text-5xl sm:text-6xl">Design options</h1>
      </header>
      <ul className="border-t border-line">
        {PAGES.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="group flex items-center gap-4 border-b border-line py-7" dir="ltr">
              <span className="flex-1">
                <span className="title block text-2xl">{p.title}</span>
                <span className="mt-1 block text-base text-ink-2">{p.note}</span>
              </span>
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-tile text-xl transition group-hover:bg-ink group-hover:text-paper">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
