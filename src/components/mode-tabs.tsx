"use client";

import { usePathname } from "next/navigation";
import Link from "@/i18n/link";
import { useDict } from "@/i18n/provider";
import { MODES, stripLocale } from "@/lib/nav";

/** On a page that is one mode of a view (the map, by topic, who is close to whom; the parties, their leaders): the view's modes as tabs. Nothing on any other page. */
export function ModeTabs() {
  const path = stripLocale(usePathname());
  const { nav } = useDict();
  const group = MODES.find((g) => g.some((x) => x.href === path));
  if (!group) return null;
  return (
    // A phone gets the modes as equal parts of one full-width control, so none of them hides off the edge.
    <nav className="mb-5">
      <span className="flex w-full gap-1 rounded-2xl bg-mist p-1 sm:inline-flex sm:w-auto sm:rounded-full">
        {group.map((x) => {
          const on = x.href === path;
          return (
            <Link key={x.href} href={x.href} aria-current={on ? "page" : undefined} className={`flex flex-1 items-center justify-center rounded-xl px-2 py-2 text-center text-base leading-tight transition sm:flex-none sm:rounded-full sm:px-4 sm:text-lg sm:whitespace-nowrap ${on ? "title bg-paper shadow-[0_8px_18px_-14px_rgb(0_12_31/0.4)]" : "text-ink-2 hover:text-ink"}`}>
              {nav[x.key]}
            </Link>
          );
        })}
      </span>
    </nav>
  );
}
