"use client";

import { useEffect, useRef, useState } from "react";

/** True while the reader is scrolling down the page, false again the moment they scroll up or are back at the top. */
export function useScrolledDown() {
  const [down, setDown] = useState(false);
  const last = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - last.current;
      if (y < 80 || dy < -6) setDown(false);
      else if (dy > 6) setDown(true);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return down;
}

/** A sticky bar that slides away while you read downwards and comes back the moment you scroll up (or tab into it). */
export function HideOnScroll({ className, children }: { className?: string; children: React.ReactNode }) {
  const [shown, setShown] = useState(false);
  const down = useScrolledDown();
  const hidden = down && !shown;
  return (
    <header onFocusCapture={() => setShown(true)} onBlurCapture={() => setShown(false)} className={`${className ?? ""} transition-transform duration-300 motion-reduce:transition-none ${hidden ? "-translate-y-full" : ""}`}>
      {children}
    </header>
  );
}
