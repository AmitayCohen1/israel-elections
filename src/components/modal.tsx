"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDict } from "@/i18n/provider";

/** A popup over the current page for a route opened from it. Closing (the button, Escape, a click outside) goes back to the page underneath. */
export function Modal({ label, children }: { label: string; children: React.ReactNode }) {
  const router = useRouter();
  const { ui } = useDict();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!ref.current?.open) ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={() => router.back()}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      className="m-auto max-h-[90dvh] w-[min(68rem,calc(100vw-2rem))] max-w-none overflow-y-auto rounded-[2rem] bg-paper text-ink shadow-[0_30px_80px_-30px_rgb(0_12_31/0.45)] backdrop:bg-ink/30"
    >
      <div className="relative p-6 sm:p-10">
        <button type="button" aria-label={ui.close} onClick={() => ref.current?.close()} className="absolute end-5 top-5 grid size-11 place-items-center rounded-full bg-mist transition hover:bg-mist-deep">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className="size-5">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {children}
      </div>
    </dialog>
  );
}
