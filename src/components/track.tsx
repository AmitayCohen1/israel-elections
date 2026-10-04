"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Reports each page view to /api/track. Renders nothing. */
export function Track() {
  const path = usePathname();
  useEffect(() => {
    const body = JSON.stringify({ path, referrer: document.referrer });
    if (!navigator.sendBeacon?.("/api/track", body)) fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
  }, [path]);
  return null;
}
