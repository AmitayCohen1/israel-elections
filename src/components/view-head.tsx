import { Children, isValidElement } from "react";
import Link from "@/i18n/link";
import { Arrow } from "@/components/arrow";

/**
 * Every dashboard view sits in the same frame: one gutter, one top edge, and the content centred in the space beside the sidebar.
 * `read` keeps text-led pages to a comfortable column; the default fills the screen up to a wide cap.
 * On desktop the view's `ViewHead` stays put and only what is under it scrolls; on phones the whole view scrolls as one.
 */
export function View({ children, width = "full" }: { children: React.ReactNode; width?: "full" | "read" | "form" }) {
  const max = width === "read" ? "max-w-4xl" : width === "form" ? "max-w-2xl" : "max-w-[88rem]";
  const all = Children.toArray(children);
  const head = all.find((c) => isValidElement(c) && c.type === ViewHead);
  const body = all.filter((c) => c !== head);
  return (
    <div className="lg:flex lg:h-full lg:flex-col">
      {head && (
        <div className="shrink-0 px-4 pt-6 sm:px-8 lg:pt-8">
          <div className={`mx-auto ${max}`}>{head}</div>
        </div>
      )}
      <div className={`px-4 pb-16 sm:px-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pb-12 ${head ? "" : "pt-6 lg:pt-8"}`}>
        <div className={`mx-auto ${max}`}>{body}</div>
      </div>
    </div>
  );
}

/** A view's title: small, to the start side, one line saying what to do here. `back` is the way up, `lead` a small mark before the title, `children` the facts or actions at the end. */
export function ViewHead({ title, hint, back, lead, children }: { title: string; hint?: string; back?: { href: string; label: string }; lead?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="mb-6 lg:mb-8">
      {back && (
        <Link href={back.href} className="mb-3 inline-block text-base text-ink-2 underline-offset-4 hover:text-ink hover:underline">
          <Arrow>→</Arrow> {back.label}
        </Link>
      )}
      <div className="flex items-center gap-4">
        {lead}
        <div className="min-w-0">
          <h1 className="title text-3xl text-balance sm:text-4xl">{title}</h1>
          {hint && <p className="mt-1.5 max-w-2xl text-lg text-ink-2">{hint}</p>}
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}
