import Link from "@/i18n/link";
import { LocaleSwitcher } from "./locale-switcher";
import { Logo } from "./header";
import { MORE, VIEWS } from "@/lib/nav";
import type { Dictionary } from "@/i18n";

export function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-[72rem] flex-col gap-12 px-5 py-16 sm:px-10 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-ink-2">{dict.ui.blurb}</p>
        </div>
        <nav className="grid grid-cols-2 gap-x-16 gap-y-3 text-lg">
          {[...VIEWS, ...MORE].map((l) => (
            <Link key={l.href} href={l.href} className="underline-offset-4 hover:underline">
              {dict.nav[l.key]}
            </Link>
          ))}
        </nav>
      </div>
      <LocaleSwitcher className="mx-auto max-w-[72rem] px-5 pb-10 sm:px-10" />
    </footer>
  );
}
