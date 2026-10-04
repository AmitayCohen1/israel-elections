import { Children, isValidElement } from "react";
import Link from "@/i18n/link";
import { Arrow } from "@/components/arrow";
import { ModeTabs } from "@/components/mode-tabs";

/**
 * Every page sits in the same frame: one column of one width, the page head, then the content. Nothing spreads to the screen's
 * edges. `wide` gives the interactive tools a little more room; `read` narrows it to a reading measure for text-led pages,
 * `form` further for a form.
 * A page that is one mode of a view gets that view's tabs above its title.
 */
export function View({ children, width = "full" }: { children: React.ReactNode; width?: "full" | "wide" | "read" | "form" }) {
  const max = width === "read" ? "max-w-3xl" : width === "form" ? "max-w-2xl" : width === "wide" ? "max-w-7xl" : "max-w-6xl";
  const all = Children.toArray(children);
  const head = all.find((c) => isValidElement(c) && c.type === ViewHead);
  const body = all.filter((c) => c !== head);
  return (
    <div>
      {head && (
        <div className="px-4 pt-6 sm:px-8 lg:pt-10">
          <div className={`mx-auto ${max}`}>
            <ModeTabs />
            {head}
          </div>
        </div>
      )}
      <div className={`px-4 pb-16 sm:px-8 ${head ? "" : "pt-6 lg:pt-10"}`}>
        <div className={`mx-auto ${max}`}>{body}</div>
      </div>
    </div>
  );
}

/**
 * A page's head: the title in the serif at a reading size (content pages are not heroes), one line under it saying what is
 * here, and a hairline closing it off from the content. `back` is the way up, `lead` a mark before the title (a party's logo),
 * `children` the facts or actions under the line.
 */
export function ViewHead({ title, hint, back, lead, children }: { title: string; hint?: string; back?: { href: string; label: string }; lead?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="mb-8 border-b border-line pb-6 lg:mb-10">
      {back && (
        <Link href={back.href} className="mb-3 inline-block text-base text-ink-2 underline-offset-4 hover:text-ink hover:underline">
          <Arrow>→</Arrow> {back.label}
        </Link>
      )}
      <div className="flex items-center gap-4">
        {lead}
        <h1 className="serif text-4xl leading-tight text-balance sm:text-5xl">{title}</h1>
      </div>
      {hint && <p className="mt-2 max-w-2xl text-lg leading-snug text-ink-2 text-pretty sm:text-xl">{hint}</p>}
      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}
