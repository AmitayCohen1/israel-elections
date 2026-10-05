"use client";

import { useEffect } from "react";

/**
 * The games' frame: one grey canvas under the top bar, exactly the height of the window, so a game is played, not scrolled.
 * Details that do not fit open in a `Sheet` over it.
 */
export function Stage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  // The page itself holds still while a game is open: back to the top, no scrolling past the stage to the footer.
  useEffect(() => {
    window.scrollTo(0, 0);
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "clip"; // clip, not hidden: nothing can scroll it, not even a focus jump
    return () => {
      html.style.overflow = before;
    };
  }, []);
  return (
    <div className="stage p-2 sm:p-3">
      <div className={`game relative h-full overflow-hidden rounded-[1.75rem] bg-mist text-ink ${className}`}>{children}</div>
    </div>
  );
}

/** A panel sliding in from the end side over the stage, Escape or the shade closes it. */
export function Sheet({ open, onClose, title, children, closeLabel }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; closeLabel: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-30" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label={closeLabel} onClick={onClose} className="shade-in absolute inset-0 bg-ink/25 backdrop-blur-[2px]" />
      <section className="sheet-in absolute inset-y-2 end-2 flex w-[min(40rem,calc(100%-1rem))] flex-col overflow-hidden rounded-[1.5rem] bg-paper text-ink shadow-2xl">
        <header className="flex items-center gap-4 border-b border-line px-6 py-4">
          <h2 className="title flex-1 text-2xl">{title}</h2>
          <button type="button" onClick={onClose} aria-label={closeLabel} className="grid size-11 place-items-center rounded-full bg-mist text-lg transition hover:bg-mist-deep">
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </section>
    </div>
  );
}
