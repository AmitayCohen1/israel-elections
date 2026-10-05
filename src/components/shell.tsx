"use client";

import Link from "@/i18n/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { SearchBox } from "@/components/search-box";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useDict } from "@/i18n/provider";
import { MORE, VIEWS, isActive, stripLocale } from "@/lib/nav";
import { useScrolledDown } from "@/components/hide-on-scroll";
import { DaysLeft } from "@/components/countdown";

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
  quiz: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" />
    </>
  ),
  coalition: (
    <>
      <path d="M3.5 18a8.5 8.5 0 0 1 17 0" />
      <path d="M7.5 18a4.5 4.5 0 0 1 9 0" />
    </>
  ),
  closeness: (
    <>
      <circle cx="7" cy="8" r="2.2" />
      <circle cx="10.5" cy="11" r="2.2" />
      <circle cx="17" cy="16" r="2.2" />
    </>
  ),
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

/** The views and, under a rule, the quieter links: the same list in the desktop sidebar and in the phone drawer. */
function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const path = stripLocale(usePathname());
  const { nav, ui } = useDict();
  const item = (on: boolean) => `flex items-center gap-3.5 rounded-2xl px-4 py-3 text-xl transition ${on ? "title bg-paper shadow-[0_10px_24px_-18px_rgb(0_12_31/0.3)]" : "text-ink-2 hover:bg-paper/60 hover:text-ink"}`;
  return (
    <>
      <nav aria-label={ui.viewsAria} className="mt-6 grid gap-1">
        {VIEWS.map((v) => {
          const on = isActive(path, v.match);
          return (
            <Link key={v.id} href={v.href} aria-current={on ? "page" : undefined} onClick={onNavigate} className={item(on)}>
              <Icon id={v.id} />
              {nav[v.key]}
            </Link>
          );
        })}
      </nav>
      <div className="mx-3 my-4 border-t border-ink/10" />
      <nav aria-label={ui.moreAria} className="grid gap-1">
        {MORE.map((l) => (
          <Link key={l.id} href={l.href} aria-current={path === l.href ? "page" : undefined} onClick={onNavigate} className={item(path === l.href)}>
            <Icon id={l.id} />
            {nav[l.key]}
          </Link>
        ))}
      </nav>
    </>
  );
}

/** The days to the election as one quiet line, a live dot before it; it leads to how to vote. */
function Countdown({ className = "" }: { className?: string }) {
  return (
    <Link href="/how-it-works" className={`items-center gap-2 text-base whitespace-nowrap text-ink-2 transition hover:text-ink ${className}`}>
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-accent" />
      <DaysLeft />
    </Link>
  );
}

/**
 * Wide screens: the classic top bar. The name on the start side, the views in a row (the current one underlined where the
 * bar meets the page), then search and language at the end. It slides away while the page is scrolled down, so each
 * section has the whole screen, and comes back the moment the page is scrolled up; search opens as a band just below it.
 */
export function TopBar() {
  const { nav, ui } = useDict();
  const path = usePathname();
  const [searchOn, setSearchOn] = useState<string | null>(null);
  const searching = searchOn === path;
  // Out of the way while reading down; never while its search is open or something in it has the keyboard.
  const down = useScrolledDown();
  const [held, setHeld] = useState(false);
  const away = down && !searching && !held;
  return (
    <header onFocusCapture={() => setHeld(true)} onBlurCapture={() => setHeld(false)} className={`sticky top-0 z-40 hidden border-b border-line bg-paper/90 backdrop-blur-md transition-transform duration-300 motion-reduce:transition-none xl:block ${away ? "-translate-y-full" : ""}`}>
      <div className="mx-auto flex h-20 max-w-[88rem] items-center gap-10 px-8">
        <Logo />
        <nav aria-label={ui.viewsAria} className="flex h-full items-center gap-1">
          {VIEWS.filter((v) => v.id !== "home").map((v) => {
            const on = isActive(path, v.match);
            return (
              <Link
                key={v.id}
                href={v.href}
                aria-current={on ? "page" : undefined}
                className={`relative rounded-full px-4 py-2 text-lg whitespace-nowrap transition ${on ? "font-medium text-ink after:absolute after:inset-x-4 after:-bottom-[1.3rem] after:h-0.5 after:rounded-full after:bg-ink" : "text-ink-2 hover:bg-mist hover:text-ink"}`}
              >
                {nav[v.key]}
              </Link>
            );
          })}
        </nav>
        <div className="ms-auto flex items-center gap-3">
          <Countdown className="me-3 flex" />
          <button
            type="button"
            aria-label={ui.searchAria}
            aria-expanded={searching}
            onClick={() => setSearchOn(searching ? null : path)}
            className={`grid size-11 place-items-center rounded-full transition ${searching ? "bg-ink text-paper" : "bg-mist hover:bg-mist-deep"}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-5">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4 4" />
            </svg>
          </button>
          <LocaleSwitcher variant="menu" className="w-40" />
        </div>
      </div>
      {searching && (
        <div
          className="border-t border-line bg-paper"
          onKeyDown={(e) => {
            if (e.key === "Escape") setSearchOn(null);
          }}
        >
          <div className="mx-auto max-w-2xl px-8 py-5">
            <SearchBox size="md" autoFocus />
          </div>
        </div>
      )}
    </header>
  );
}

/**
 * Phones and narrower screens: a slim top bar with the menu button, the name and a search button. The menu opens the same sidebar as a drawer
 * from the start edge (name, language, views, quieter links); the search button turns the bar into the one search.
 * Like the wide bar, it slides away while the page is scrolled down and comes back on the way up.
 */
export function Header() {
  const { ui } = useDict();
  const path = usePathname();
  // Each remembers the page it was opened on, so moving to another page closes it.
  const [menuOn, setMenuOn] = useState<string | null>(null);
  const [searchOn, setSearchOn] = useState<string | null>(null);
  const menu = menuOn === path;
  const searching = searchOn === path;
  const round = "grid size-11 shrink-0 place-items-center rounded-full bg-mist transition hover:bg-mist-deep";
  const cross = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className="size-5">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
  const away = useScrolledDown() && !menu && !searching;
  return (
    <>
    <header className={`sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 bg-paper/90 px-4 backdrop-blur-md transition-transform duration-300 motion-reduce:transition-none xl:hidden ${away ? "-translate-y-full" : ""}`}>
      {searching ? (
        <>
          <div className="min-w-0 flex-1">
            <SearchBox size="sm" autoFocus />
          </div>
          <button type="button" aria-label={ui.close} onClick={() => setSearchOn(null)} className={round}>
            {cross}
          </button>
        </>
      ) : (
        <>
          <button type="button" aria-label={ui.menu} aria-expanded={menu} aria-controls="drawer" onClick={() => setMenuOn(path)} className={round}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className="size-5">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <Logo />
          <Countdown className="ms-auto hidden sm:flex" />
          <button type="button" aria-label={ui.searchAria} onClick={() => setSearchOn(path)} className={`ms-auto sm:ms-0 ${round}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-5">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4 4" />
            </svg>
          </button>
        </>
      )}
    </header>

      {/* Outside the bar: a bar with a backdrop blur, or one that is sliding away, would trap a fixed child inside itself. */}
      {menu && (
        <div
          id="drawer"
          role="dialog"
          aria-modal="true"
          aria-label={ui.menu}
          className="fixed inset-0 z-50"
          onKeyDown={(e) => {
            if (e.key === "Escape") setMenuOn(null);
          }}
        >
          <button type="button" aria-label={ui.close} onClick={() => setMenuOn(null)} className="drawer-shade absolute inset-0 bg-ink/30" />
          <div className="drawer-in absolute inset-y-0 start-0 flex w-[20rem] max-w-[86vw] flex-col overflow-y-auto rounded-e-[2rem] bg-mist px-5 pt-2.5 pb-5">
            <div className="flex items-center justify-between gap-3 ps-1">
              <Logo />
              <button type="button" autoFocus aria-label={ui.close} onClick={() => setMenuOn(null)} className="grid size-11 shrink-0 place-items-center rounded-full bg-paper">
                {cross}
              </button>
            </div>
            <LocaleSwitcher variant="menu" className="mt-4" />
            <NavLinks onNavigate={() => setMenuOn(null)} />
          </div>
        </div>
      )}
    </>
  );
}
