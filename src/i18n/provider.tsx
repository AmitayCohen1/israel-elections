"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "./dictionaries/he";
import type { Locale } from "./config";

const Ctx = createContext<Dictionary | null>(null);
export const LangCtx = createContext<Locale | null>(null);

/** Hands the current language and its dictionary to client components. */
export function DictionaryProvider({ lang, dict, children }: { lang: Locale; dict: Dictionary; children: React.ReactNode }) {
  return (
    <LangCtx value={lang}>
      <Ctx value={dict}>{children}</Ctx>
    </LangCtx>
  );
}

export function useDict() {
  const d = useContext(Ctx);
  if (!d) throw new Error("useDict outside DictionaryProvider");
  return d;
}
