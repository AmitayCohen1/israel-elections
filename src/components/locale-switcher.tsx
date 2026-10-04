"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LOCALES, LOCALE_INFO } from "@/i18n/config";
import { useLocale } from "@/i18n/link";
import { useDict } from "@/i18n/provider";
import { stripLocale } from "@/lib/nav";

/** One link per language, each written in that language, staying on the same page. `menu` is a dropdown (top of the sidebar); `row` is a single inline line (the footer). */
export function LocaleSwitcher({ className = "", variant = "row" }: { className?: string; variant?: "row" | "menu" }) {
  const lang = useLocale();
  const rest = stripLocale(usePathname());
  const { ui } = useDict();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const href = (l: string) => `/${l}${rest === "/" ? "" : rest}`;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (variant === "row")
    return (
      <nav aria-label={ui.language} className={`flex flex-wrap gap-x-4 gap-y-1 text-base ${className}`}>
        {LOCALES.map((l) => (
          <NextLink
            key={l}
            href={href(l)}
            lang={l}
            hrefLang={l}
            aria-current={l === lang ? "true" : undefined}
            className={l === lang ? "title text-ink" : "text-ink-2 underline-offset-4 hover:text-ink hover:underline"}
          >
            {LOCALE_INFO[l].native}
          </NextLink>
        ))}
      </nav>
    );

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${ui.language}: ${LOCALE_INFO[lang].native}`}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center gap-3 rounded-full border border-ink/15 bg-card px-4 text-base transition hover:border-ink/40 focus-visible:border-ink"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-5 shrink-0 text-ink-2">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
        </svg>
        <span className="title flex-1 text-start">{LOCALE_INFO[lang].native}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`size-4 shrink-0 text-ink-2 transition ${open ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <nav
          aria-label={ui.language}
          className="absolute inset-x-0 top-full z-50 mt-2 grid gap-0.5 rounded-3xl border border-ink/10 bg-card p-1.5 shadow-[0_24px_60px_-20px_rgb(10_12_27/0.5)]"
        >
          {LOCALES.map((l) => {
            const on = l === lang;
            return (
              <NextLink
                key={l}
                href={href(l)}
                lang={l}
                hrefLang={l}
                aria-current={on ? "true" : undefined}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-2xl px-3.5 py-2 text-base transition ${on ? "title bg-mist text-ink" : "text-ink-2 hover:bg-mist/70 hover:text-ink"}`}
              >
                {LOCALE_INFO[l].native}
                <span lang="en" className="text-base uppercase tracking-wider text-ink-2/70">
                  {l}
                </span>
              </NextLink>
            );
          })}
        </nav>
      )}
    </div>
  );
}
