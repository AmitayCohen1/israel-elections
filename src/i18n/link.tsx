"use client";

import NextLink from "next/link";
import { useParams } from "next/navigation";
import type { ComponentProps } from "react";
import { DEFAULT_LOCALE, hasLocale } from "./config";

/** The current language, from the URL. Client components only. */
export function useLocale() {
  const { lang } = useParams<{ lang?: string }>();
  return lang && hasLocale(lang) ? lang : DEFAULT_LOCALE;
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
