import type { Locale } from "./config";

type Widen<T> = T extends string ? string : T extends (...a: infer A) => infer R ? (...a: A) => Widen<R> : T extends object ? { [K in keyof T]: Widen<T[K]> } : T;

/**
 * Page-level strings. Write Hebrew first; the other four languages must have exactly the same keys
 * (a value can be a function for numbers and plurals). Server: `(await getLocale())`, client: `useLocale()`,
 * then `m[locale]`; or use `await getMessages(m)` / `useMessages(m)`.
 */
export function defineMessages<T extends object>(he: T, others: Record<Exclude<Locale, "he">, Widen<T>>): Record<Locale, Widen<T>> {
  return { he: he as Widen<T>, ...others };
}
