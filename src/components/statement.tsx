"use client";

import { useEffect, useRef } from "react";

/**
 * One big sentence whose words (and inline chips) sharpen from a blur as it scrolls through
 * the viewport. Strings are split into words; any other node counts as one item.
 */
export function Statement({ parts, className = "" }: { parts: React.ReactNode[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const items = parts.flatMap((p) => (typeof p === "string" ? p.split(" ").filter(Boolean) : [p]));

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 as the sentence enters at 85% of the viewport; 1 once its end passes the middle.
      const t = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      el.style.setProperty("--p", String(Math.min(1, Math.max(0, t)) * (items.length + 1)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items.length]);

  return (
    // Fully lit until the script takes over, so it reads without JavaScript too.
    <p ref={ref} className={className} style={{ ["--p" as string]: 999 }}>
      {items.map((item, i) => (
        <span key={i} className="word" style={{ ["--i" as string]: i }}>
          {item}{" "}
        </span>
      ))}
    </p>
  );
}
