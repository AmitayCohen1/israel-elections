"use client";

import Link, { localePath, useLocale } from "@/i18n/link";
import { useDict } from "@/i18n/provider";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SearchEntry } from "@/lib/data";
import { match, prepare, type Prepared } from "@/lib/search";
import { Avatar } from "./avatar";
import { Ballot } from "./ballot";

const SUGGESTIONS = 6;

// One fetch of the compact index per visit, shared by every SearchBox on the page.
const indexPromises = new Map<string, Promise<Prepared[]>>();
const loadIndex = (lang: string) => {
  let p = indexPromises.get(lang);
  if (!p) {
    p = fetch(`/api/search-index?lang=${lang}`)
      .then((r) => r.json() as Promise<SearchEntry[]>)
      .then(prepare)
      .catch((e) => {
        indexPromises.delete(lang);
        throw e;
      });
    indexPromises.set(lang, p);
  }
  return p;
};

/** The one primary action. `lg` is the hero size: 96px tall on desktop, as on america.gov. */
export function SearchBox({ size = "md", openUp = false, autoFocus = false }: { size?: "sm" | "md" | "lg"; openUp?: boolean; autoFocus?: boolean }) {
  const router = useRouter();
  const lang = useLocale();
  const { ui } = useDict();
  const formRef = useRef<HTMLFormElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<Prepared[] | null>(null);
  // The popup is portaled to <body> and fixed, so no overflow-hidden ancestor can clip it.
  const [box, setBox] = useState<{ left: number; width: number; top: number; up: number } | null>(null);
  const lg = size === "lg";
  const sm = size === "sm";

  const results = useMemo(() => (index ? match(index, q) : []), [index, q]);
  const shown = results.slice(0, SUGGESTIONS);
  const popup = open && q.trim() !== "" && shown.length > 0;

  useEffect(() => {
    if (!popup) return;
    const update = () => {
      const r = formRef.current?.getBoundingClientRect();
      if (r) setBox({ left: r.left + 8, width: r.width - 16, top: r.bottom + 12, up: window.innerHeight - r.top + 12 });
    };
    update();
    window.addEventListener("scroll", update, { passive: true, capture: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, { capture: true });
      window.removeEventListener("resize", update);
    };
  }, [popup]);

  return (
    <form
      ref={formRef}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(localePath(lang, `/search?q=${encodeURIComponent(q.trim())}`));
      }}
      onFocus={() => {
        setOpen(true);
        loadIndex(lang).then(setIndex, () => {});
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
      className={`relative w-full rounded-full border border-ink/15 bg-card ${sm ? "" : "shadow-[0_18px_50px_-24px_rgb(10_12_27/0.45)]"} transition focus-within:border-ink`}
    >
      <input
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          if (!index) loadIndex(lang).then(setIndex, () => {});
        }}
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder={sm ? ui.searchShort : ui.searchLong}
        aria-label={ui.searchAria}
        className={`w-full rounded-full bg-transparent outline-none placeholder:text-muted ${lg ? "h-16 pr-7 pl-20 text-lg sm:h-24 sm:pr-11 sm:pl-28 sm:text-2xl" : sm ? "h-11 pr-5 pl-14 text-base" : "h-16 pr-7 pl-20 text-lg"}`}
      />
      <button
        type="submit"
        aria-label={ui.searchBtn}
        className={`absolute top-1/2 grid -translate-y-1/2 place-items-center rounded-full bg-accent text-white transition hover:bg-ink ${lg ? "left-3 size-11 sm:left-5 sm:size-14" : sm ? "left-1.5 size-8" : "left-3 size-11"}`}
      >
        <svg viewBox="0 0 24 24" className="size-5 sm:size-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
      </button>

      {popup &&
        box &&
        createPortal(
          <div
            // Keep focus in the input so onBlur doesn't close the popup before a click lands.
            onMouseDown={(e) => e.preventDefault()}
            style={{ left: box.left, width: box.width, ...(openUp ? { bottom: box.up } : { top: box.top }) }}
            className="fixed z-50 overflow-hidden rounded-[1.75rem] border border-ink/10 bg-card py-2 shadow-[0_24px_60px_-20px_rgb(10_12_27/0.5)]"
          >
            <ul>
              {shown.map((r) => (
                <li key={`${r.s}:${r.p}`}>
                  <Link href={`/lists/${r.s}/${r.p}`} onClick={() => setOpen(false)} className="flex items-center gap-3.5 px-5 py-2.5 transition hover:bg-tile/70">
                    <Avatar name={r.n} src={r.i} color={r.c} size={40} />
                    <span className="min-w-0 flex-1 text-start">
                      <span className="block truncate font-medium">{r.n}</span>
                      <span className="block truncate text-base text-muted">
                        מקום {r.p} ב{r.l}
                      </span>
                    </span>
                    <Ballot letters={r.t} color={r.c} size="sm" className="scale-75" />
                  </Link>
                </li>
              ))}
            </ul>
            {results.length > SUGGESTIONS && (
              <Link
                href={`/search?q=${encodeURIComponent(q.trim())}`}
                onClick={() => setOpen(false)}
                className="block px-5 py-2.5 text-center text-base font-medium text-accent transition hover:bg-tile/70"
              >
                כל {results.length} התוצאות
              </Link>
            )}
          </div>,
          document.body,
        )}
    </form>
  );
}
