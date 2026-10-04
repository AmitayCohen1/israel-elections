"use client";

import NextLink from "next/link";
import { useContext, type ComponentProps } from "react";
import { DEFAULT_LOCALE } from "./config";
import { LangCtx } from "./provider";

/** The current language, handed down by the layout (reading it from the URL here would keep every page that links anywhere from prerendering). Client components only. */
export function useLocale() {
  return useContext(LangCtx) ?? DEFAULT_LOCALE;
}

/** Puts the language in front of a path: "/lists" becomes "/en/lists". Anything that is not an absolute path is left alone. */
export function localePath(lang: string, href: string) {
  return href.startsWith("/") && !href.startsWith("//") ? `/${lang}${href === "/" ? "" : href}` : href;
}

/** next/link that keeps the visitor in their language. */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const lang = useLocale();
  return <NextLink href={typeof href === "string" ? localePath(lang, href) : href} {...props} />;
}

/** Client: the component's strings in the current language. */
export function useMessages<T>(m: Record<"he" | "en" | "ar" | "ru" | "am", T>): T {
  return m[useLocale()];
}
