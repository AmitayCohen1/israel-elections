"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const IDLE = 60_000; // No input for a minute and the time stops counting.
const TICK = 5_000;
const BEAT = 60_000;

const id = () => (crypto.randomUUID?.() ?? `${Date.now()}${Math.random()}`).replace(/-/g, "").slice(0, 20);
const clip = (s: string | null | undefined, max = 80) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

function send(body: object) {
  const json = JSON.stringify(body);
  if (!navigator.sendBeacon?.("/api/track", json)) fetch("/api/track", { method: "POST", body: json, keepalive: true }).catch(() => {});
}

/** One per tab, in sessionStorage: no cookie, gone when the tab closes. */
let memo = "";
function session() {
  if (memo) return memo;
  try {
    memo = sessionStorage.getItem("t_s") ?? "";
    if (!memo) sessionStorage.setItem("t_s", (memo = id()));
  } catch {
    memo = id();
  }
  return memo;
}

const root = () => document.querySelector<HTMLElement>("[data-scroll-root]");

/** Where a click landed, in words: data-track wins, then the accessible name, then the text. */
function describe(target: EventTarget | null) {
  const el = (target as Element | null)?.closest?.("[data-track], a[href], button, [role=tab]");
  if (!el) return null;
  const label = clip(el.getAttribute("data-track") ?? el.getAttribute("aria-label") ?? el.textContent);
  if (el.getAttribute("role") === "tab") return { kind: "tab", label };
  if (el instanceof HTMLAnchorElement) {
    const url = new URL(el.href, location.href);
    if (url.origin !== location.origin) return { kind: "outbound", label: clip(url.hostname + url.pathname, 120) };
    return { kind: "link", label: label || clip(url.pathname) };
  }
  return { kind: "button", label };
}

/** Page views, engaged time, scroll depth, and clicks, reported to /api/track. Renders nothing. */
export function Track() {
  const path = usePathname();

  // Clicks and searches, for the whole session.
  useEffect(() => {
    let lastSearch = "";
    const event = (kind: string, label: string) => label && send({ type: "event", kind, label, path: location.pathname, session: session() });
    const click = (e: MouseEvent) => {
      const d = describe(e.target);
      if (d) event(d.kind, d.label);
    };
    const search = (e: Event) => {
      const el = e.target as HTMLInputElement;
      if (el?.type !== "search" || (e instanceof KeyboardEvent && e.key !== "Enter")) return;
      const q = clip(el.value).toLowerCase();
      if (q && q !== lastSearch) event("search", (lastSearch = q));
    };
    document.addEventListener("click", click, { capture: true, passive: true });
    document.addEventListener("change", search, true);
    document.addEventListener("keydown", search, true);
    return () => {
      document.removeEventListener("click", click, true);
      document.removeEventListener("change", search, true);
      document.removeEventListener("keydown", search, true);
    };
  }, []);

  // One view per path: counted on arrival, then topped up with time and depth until the reader leaves.
  useEffect(() => {
    const view = id();
    let ms = 0;
    let scroll = 0;
    let active = Date.now();
    let sent = "";

    send({ type: "view", view, path, referrer: document.referrer, session: session() });

    const depth = () => {
      const el = root();
      const [top, height, visible] = el ? [el.scrollTop, el.scrollHeight, el.clientHeight] : [scrollY, document.documentElement.scrollHeight, innerHeight];
      scroll = Math.max(scroll, height <= visible ? 100 : Math.round(((top + visible) / height) * 100));
    };
    const report = () => {
      if (`${ms}|${scroll}` === sent) return;
      sent = `${ms}|${scroll}`;
      send({ type: "engage", view, ms, scroll });
    };
    const touch = () => (active = Date.now());
    const hidden = () => document.visibilityState === "hidden" && report();
    const scrolled = () => {
      touch();
      depth();
    };

    depth();
    const tick = setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - active < IDLE) ms += TICK;
    }, TICK);
    const beat = setInterval(report, BEAT);
    const target = root() ?? window;
    target.addEventListener("scroll", scrolled, { passive: true });
    for (const t of ["pointerdown", "keydown", "mousemove"]) window.addEventListener(t, touch, { passive: true });
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", report);

    return () => {
      clearInterval(tick);
      clearInterval(beat);
      report();
      target.removeEventListener("scroll", scrolled);
      for (const t of ["pointerdown", "keydown", "mousemove"]) window.removeEventListener(t, touch);
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", report);
    };
  }, [path]);

  return null;
}
