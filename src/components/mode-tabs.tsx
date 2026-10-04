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
    <nav className="scrollbar-none -mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <span className="inline-flex gap-1 rounded-full bg-mist p-1">
        {group.map((x) => {
          const on = x.href === path;
          return (
            <Link key={x.href} href={x.href} aria-current={on ? "page" : undefined} className={`rounded-full px-3 py-2 text-base whitespace-nowrap sm:px-4 sm:text-lg transition ${on ? "title bg-paper shadow-[0_8px_18px_-14px_rgb(0_12_31/0.4)]" : "text-ink-2 hover:text-ink"}`}>
              {nav[x.key]}
            </Link>
          );
        })}
      </span>
    </nav>
  );
}
