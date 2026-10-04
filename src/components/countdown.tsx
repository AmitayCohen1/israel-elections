"use client";

import { useSyncExternalStore } from "react";
import { useMessages } from "@/i18n/link";
import { m } from "@/i18n/messages/countdown";
import { time } from "@/i18n/messages/time";

const OPEN = new Date("2026-10-27T07:00:00+02:00").getTime();
const CLOSE = new Date("2026-10-27T22:00:00+02:00").getTime();

function subscribe(cb: () => void) {
  const id = setInterval(cb, 60_000);
  return () => clearInterval(id);
}

function daysLeft() {
  const now = Date.now();
  if (now >= CLOSE) return -1;
  if (now >= OPEN) return 0;
  return Math.ceil((OPEN - now) / 86_400_000);
}

/** Plain text, e.g. "25 days to the election". Falls back to the date before hydration. */
export function DaysLeft() {
  const t = useMessages(m);
  const tm = useMessages(time);
  const days = useSyncExternalStore(subscribe, daysLeft, () => null);
  if (days === null) return <>{t.fallback}</>;
  if (days < 0) return <>{t.closed}</>;
  if (days === 0) return <>{t.today}</>;
  return <>{days === 1 ? t.tomorrow : t.daysLeft(tm.days(days))}</>;
}
