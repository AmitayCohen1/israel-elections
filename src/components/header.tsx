"use client";

import Link from "@/i18n/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useDict } from "@/i18n/provider";
import { SearchBox } from "./search-box";

export function Logo() {
  const { ui } = useDict();
  return (
    <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label={ui.homeAria}>
      <Image src="/media/illustrations/ballot-box.png" alt="" width={96} height={96} priority className="size-9 shrink-0 mix-blend-multiply" />
      <span className="serif truncate py-1 text-[1.6rem]">{ui.brand}</span>
    </Link>
  );
}

/** Phones only: the name, and a round button that turns the bar into the one search. On wide screens both live in the sidebar. */
export function Header() {
  const { ui } = useDict();
  const path = usePathname();
  // Remembers the page the search was opened on, so moving to another page puts the name back.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const searching = openOn === path;
  const round = "grid size-11 shrink-0 place-items-center rounded-full bg-mist transition hover:bg-mist-deep";
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 px-4 lg:hidden">
      {searching ? (
        <>
          <div className="min-w-0 flex-1">
            <SearchBox size="sm" autoFocus />
          </div>
          <button type="button" aria-label={ui.close} onClick={() => setOpenOn(null)} className={round}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className="size-5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </>
      ) : (
        <>
          <Logo />
          <button type="button" aria-label={ui.searchAria} onClick={() => setOpenOn(path)} className={`ms-auto ${round}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-5">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4 4" />
            </svg>
          </button>
        </>
      )}
    </header>
  );
}
