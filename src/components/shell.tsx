"use client";

import Link from "@/i18n/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/header";
import { SearchBox } from "@/components/search-box";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useDict } from "@/i18n/provider";
import { MORE, VIEWS, isActive, stripLocale } from "@/lib/nav";

const PATHS: Record<string, React.ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </>
  ),
  about: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  links: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  contact: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 8l8 6 8-6" />
    </>
  ),
  home: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  topics: <path d="M4 6h16M4 12h16M4 18h9" />,
  map: (
    <>
      <path d="M4 12h16" />
      <circle cx="7" cy="12" r="2" />
      <circle cx="14" cy="12" r="2" />
      <circle cx="18" cy="12" r="2" />
    </>
  ),
  people: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-4 3-6 7-6s7 2 7 6" />
    </>
  ),
  lists: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="19" cy="12" r="1.4" />
    </>
  ),
  vote: (
    <>
      <rect x="4" y="14" width="16" height="6" rx="1.5" />
      <path d="M9 4h6v7H9zM9 17h6" />
    </>
  ),
};

function Icon({ id, small = false }: { id: string; small?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`shrink-0 ${small ? "size-5" : "size-6"}`}>
      {PATHS[id]}
    </svg>
  );
}

/** Desktop: the sidebar, a grey panel attached to the screen edge and the bottom, 98% of the height (so it starts just below the top), rounded only at the top corner that faces the content. The name and language on top, the views, the quieter links, then search at the bottom. */
export function Rail() {
  const path = stripLocale(usePathname());
  const { nav, ui } = useDict();
  const item = (on: boolean) => `flex items-center gap-3.5 rounded-2xl px-4 py-3 text-xl transition ${on ? "title bg-paper shadow-[0_10px_24px_-18px_rgb(0_12_31/0.3)]" : "text-ink-2 hover:bg-paper/60 hover:text-ink"}`;
  return (
    <aside className="hidden w-[20rem] shrink-0 lg:flex lg:items-end">
      <div className="flex h-[98%] w-full flex-col overflow-y-auto rounded-se-[2rem] bg-mist px-5 pt-7 pb-5">
      <div className="px-1">
        <Logo />
      </div>
      <LocaleSwitcher variant="menu" className="mt-5" />
      <nav aria-label={ui.viewsAria} className="mt-6 grid gap-1">
        {VIEWS.map((v) => {
          const on = isActive(path, v.match);
          return (
            <Link key={v.id} href={v.href} aria-current={on ? "page" : undefined} className={item(on)}>
              <Icon id={v.id} />
              {nav[v.key]}
            </Link>
          );
        })}
      </nav>
      <div className="mx-3 my-4 border-t border-ink/10" />
      <nav aria-label={ui.moreAria} className="grid gap-1">
        {MORE.map((l) => (
          <Link key={l.id} href={l.href} aria-current={path === l.href ? "page" : undefined} className={item(path === l.href)}>
            <Icon id={l.id} />
            {nav[l.key]}
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-6">
        <SearchBox size="sm" openUp />
      </div>
      </div>
    </aside>
  );
}

// Phones: the bar holds four views; the others, the quieter links and the languages open from "more".
const BAR = ["home", "topics", "people", "lists"];

/** Phones: the views as a bar along the bottom, the last entry opening a sheet with everything else. Labels stay full size, so the bar keeps to five. */
export function TabBar() {
  const full = usePathname();
  const path = stripLocale(full);
  const { nav, ui } = useDict();
  // Remembers the page the sheet was opened on, so following a link closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === full;
  const bar = VIEWS.filter((v) => BAR.includes(v.id));
  const rest = [...VIEWS.filter((v) => !BAR.includes(v.id)).map((v) => ({ ...v, on: isActive(path, v.match) })), ...MORE.map((l) => ({ ...l, on: path === l.href }))];
  const inRest = rest.some((r) => r.on);
  const tab = (on: boolean) => `flex min-w-0 flex-col items-center gap-0.5 px-0.5 py-2 text-center text-base leading-tight ${on ? "title text-ink" : "text-ink-2"}`;
  return (
    <div
      className="relative z-40 shrink-0 lg:hidden"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpenOn(null);
      }}
    >
      {open && (
        <>
          <button type="button" aria-label={ui.close} onClick={() => setOpenOn(null)} className="fixed inset-0 bg-ink/30" />
          <div id="more-sheet" className="menu-pop absolute inset-x-0 bottom-full max-h-[75dvh] overflow-y-auto rounded-t-[2rem] bg-paper px-4 pt-5 pb-4 shadow-[0_-24px_60px_-30px_rgb(0_12_31/0.5)]">
            <nav aria-label={ui.moreAria} className="grid gap-1">
              {rest.map((r) => (
                <Link key={r.id} href={r.href} aria-current={r.on ? "page" : undefined} className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 text-xl ${r.on ? "title bg-mist" : "text-ink-2"}`}>
                  <Icon id={r.id} />
                  {nav[r.key]}
                </Link>
              ))}
            </nav>
            <div className="mx-3 my-3 border-t border-line" />
            <LocaleSwitcher className="gap-x-5 gap-y-2 px-4 py-2 text-lg" />
          </div>
        </>
      )}
      <nav aria-label={ui.viewsAria} className="relative grid grid-cols-5 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)]">
        {bar.map((v) => {
          const on = !open && isActive(path, v.match);
          return (
            <Link key={v.id} href={v.href} aria-current={on ? "page" : undefined} onClick={() => setOpenOn(null)} className={tab(on)}>
              <Icon id={v.id} />
              {nav[v.key]}
            </Link>
          );
        })}
        <button type="button" aria-expanded={open} aria-controls="more-sheet" onClick={() => setOpenOn(open ? null : full)} className={tab(open || inRest)}>
          <Icon id="more" />
          {ui.moreAria}
        </button>
      </nav>
    </div>
  );
}
