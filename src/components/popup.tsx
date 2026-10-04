"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocale, localePath } from "@/i18n/link";
import { useDict } from "@/i18n/provider";

/** A popup that is already on the page, closed, with its content rendered inside. `PopupLink` with the same id opens it; the button, Escape or a click outside closes it. */
export function Popup({ id, children }: { id: string; children: React.ReactNode }) {
  const { ui } = useDict();
  return (
    <dialog
      id={id}
      aria-labelledby={`${id}-title`}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      className="m-auto max-h-[90dvh] w-[min(68rem,calc(100vw-2rem))] max-w-none overflow-y-auto rounded-[2rem] bg-paper text-ink shadow-[0_30px_80px_-30px_rgb(0_12_31/0.45)] backdrop:bg-ink/30"
    >
      <div className="relative p-6 sm:p-10">
        <button type="button" aria-label={ui.close} onClick={(e) => e.currentTarget.closest("dialog")?.close()} className="absolute end-5 top-5 grid size-11 place-items-center rounded-full bg-mist transition hover:bg-mist-deep">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className="size-5">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {children}
      </div>
    </dialog>
  );
}

/** A link that opens the popup with id `popup` when this page has one, and otherwise (or with a modifier key) goes to `href` like any link. */
export function PopupLink({ popup, href, ...props }: { popup: string; href: string } & Omit<ComponentProps<typeof NextLink>, "href">) {
  const lang = useLocale();
  return (
    <NextLink
      href={localePath(lang, href)}
      {...props}
      onClick={(e) => {
        const target = document.getElementById(popup);
        if (!(target instanceof HTMLDialogElement) || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        document.querySelector<HTMLDialogElement>("dialog[open]")?.close();
        target.showModal();
      }}
    />
  );
}
