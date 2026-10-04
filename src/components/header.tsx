"use client";

import Link from "@/i18n/link";
import Image from "next/image";
import { useDict } from "@/i18n/provider";
import { SearchBox } from "./search-box";

export function Logo() {
  const { ui } = useDict();
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={ui.homeAria}>
      <Image src="/media/illustrations/ballot-box.png" alt="" width={96} height={96} priority className="size-9 mix-blend-multiply" />
      <span className="serif text-[1.6rem]">{ui.brand}</span>
    </Link>
  );
}

/** Phones only: the name and the one search. On wide screens both live at the top of the sidebar. */
export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 px-4 lg:hidden">
      <Logo />
      <div className="min-w-0 flex-1">
        <SearchBox size="sm" />
      </div>
    </header>
  );
}
