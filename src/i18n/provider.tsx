"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "./dictionaries/he";

const Ctx = createContext<Dictionary | null>(null);

/** Hands the current language's dictionary to client components. */
export function DictionaryProvider({ dict, children }: { dict: Dictionary; children: React.ReactNode }) {
  return <Ctx value={dict}>{children}</Ctx>;
}

export function useDict() {
  const d = useContext(Ctx);
  if (!d) throw new Error("useDict outside DictionaryProvider");
  return d;
}
