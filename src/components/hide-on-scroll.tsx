"use client";

import { useEffect, useRef, useState } from "react";

/** A sticky bar that slides away while you read downwards and comes back the moment you scroll up (or tab into it). */
export function HideOnScroll({ className, children }: { className?: string; children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - last.current;
      if (y < 80 || dy < -6) setHidden(false);
      else if (dy > 6) setHidden(true);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header onFocusCapture={() => setHidden(false)} className={`${className ?? ""} transition-transform duration-300 motion-reduce:transition-none ${hidden ? "-translate-y-full" : ""}`}>
      {children}
    </header>
  );
}
