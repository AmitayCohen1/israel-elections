"use client";

import Link from "@/i18n/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useDict } from "@/i18n/provider";
import { VIEWS, isActive } from "@/lib/nav";
import { DaysLeft } from "@/components/countdown";

/**
 * One plain bar on every screen: the name, the four places, the days left and the language. On a phone the four places drop
 * to a second row of equal parts, so all of them are always one tap away. Everything else lives in the footer.
 */
export function Header() {
  const { nav, navShort, ui } = useDict();
  const path = usePathname();
  const links = (phone: boolean) =>
    VIEWS.map((v) => {
      const on = isActive(path, v.match);
      return (
        <Link
          key={v.id}
          href={v.href}
          aria-current={on ? "page" : undefined}
          className={
            phone
              ? `flex flex-1 items-center justify-center border-b-2 px-1 py-2.5 text-center text-base leading-tight ${on ? "border-ink font-semibold text-ink" : "border-transparent text-ink-2"}`
              : `rounded-lg px-3 py-2 text-lg whitespace-nowrap transition ${on ? "bg-mist font-semibold text-ink" : "text-ink-2 hover:bg-mist hover:text-ink"}`
          }
        >
          {phone ? navShort[v.key] : nav[v.key]}
        </Link>
      );
    });
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-8">
        <Logo />
        <nav aria-label={ui.viewsAria} className="hidden items-center gap-1 lg:flex">
          {links(false)}
        </nav>
        <div className="ms-auto flex shrink-0 items-center gap-4">
          <Link href="/how-it-works" className="hidden text-base whitespace-nowrap text-ink-2 hover:text-ink md:block">
            <DaysLeft />
          </Link>
          <LocaleSwitcher variant="menu" className="sm:w-36" />
        </div>
      </div>
      <nav aria-label={ui.viewsAria} className="flex border-t border-line px-2 lg:hidden">
        {links(true)}
      </nav>
    </header>
  );
}
