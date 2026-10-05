"use client";

import { useEffect, useState } from "react";
import { useLocale, useMessages } from "@/i18n/link";
import { LOCALE_INFO } from "@/i18n/config";
import { m } from "@/i18n/messages/games";
import { Sheet } from "@/components/game-stage";

/**
 * The games' share cards, drawn in the browser on a canvas: the browser shapes Hebrew, Arabic and Ge'ez right to left and
 * uses the site's own fonts, which a server-side image renderer cannot. 1080×1350, the portrait size feeds and stories take.
 */

export const W = 1080;
export const H = 1350;

const C = { canvas: "#f2f2f0", paper: "#ffffff", ink: "#000c1f", ink2: "rgba(0,12,31,0.62)", line: "#d6d4cc", flag: "#0038b8", green: "#1f7a52", greenBg: "#e3f3eb" };

export type CardFace = { name: string; face: string | null; color: string };

/** The page's two type voices, read off the page so the card matches it. */
function fonts() {
  const probe = document.createElement("span");
  probe.className = "serif";
  document.body.appendChild(probe);
  const serif = getComputedStyle(probe).fontFamily;
  probe.remove();
  return { serif, sans: getComputedStyle(document.body).fontFamily };
}

/** A face through the site's own image optimiser, so the canvas stays same-origin and can be exported. */
function loadFace(src: string | null): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((done) => {
    const img = new Image();
    img.onload = () => done(img);
    img.onerror = () => done(null);
    img.src = `/_next/image?url=${encodeURIComponent(src)}&w=384&q=75`;
  });
}

export async function loadFaces(people: CardFace[]) {
  return Promise.all(people.map((p) => loadFace(p.face)));
}

/** A blank card: the canvas grey, the site's name at the top, its address at the foot. */
export async function startCard(dir: "rtl" | "ltr", brand: string) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const f = fonts();
  ctx.direction = dir;
  ctx.fillStyle = C.canvas;
  ctx.fillRect(0, 0, W, H);
  // the brand at the top, the address at the foot
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = C.ink2;
  ctx.font = `400 44px ${f.serif}`;
  ctx.fillText(brand, W / 2, 120);
  ctx.font = `400 32px ${f.sans}`;
  ctx.fillText(window.location.host, W / 2, H - 55);
  return { canvas, ctx, f };
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** A face in a circle with a ring in its party's colour; initials on the colour when there is no photo. */
export function drawFace(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, p: CardFace, cx: number, cy: number, r: number, sans: string, ring = 8) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r + ring, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
  ctx.fillStyle = C.paper;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  if (img) {
    // cover, anchored at the top like the site's avatars
    const s = Math.max((2 * r) / img.width, (2 * r) / img.height);
    ctx.drawImage(img, cx - (img.width * s) / 2, cy - r, img.width * s, img.height * s);
  } else {
    ctx.fillStyle = p.color;
    ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    ctx.fillStyle = C.paper;
    ctx.font = `500 ${Math.round(r * 0.7)}px ${sans}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.name.replace(/["'׳״]/g, "").slice(0, 2), cx, cy);
  }
  ctx.restore();
}

/** Text shrunk until it fits the width. */
export function fitText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, size: number, weight: number, family: string) {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px ${family}`;
    s -= 2;
  } while (ctx.measureText(text).width > maxW && s > 18);
  ctx.fillText(text, x, y);
}

export const COLORS = C;

/**
 * The share sheet: the card as drawn, then the ways out — the phone's own share (with the image), the image to save, the
 * social networks with the link, and the link itself.
 */
export function ShareSheet({ open, onClose, draw, url, text, file }: { open: boolean; onClose: () => void; draw: () => Promise<HTMLCanvasElement>; url: string; text: string; file: string }) {
  const t = useMessages(m).share;
  const [blob, setBlob] = useState<Blob | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    let gone = false;
    let made: string | null = null;
    draw()
      .then((c) => new Promise<Blob | null>((done) => c.toBlob(done, "image/png")))
      .then((b) => {
        if (gone || !b) return;
        made = URL.createObjectURL(b);
        setBlob(b);
        setSrc(made);
      });
    return () => {
      gone = true;
      if (made) URL.revokeObjectURL(made);
      setBlob(null);
      setSrc(null);
    };
    // Drawn once per opening, from the state at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pngFile = blob ? new File([blob], `${file}.png`, { type: "image/png" }) : null;
  const canNative = typeof navigator !== "undefined" && !!navigator.share && (!pngFile || navigator.canShare?.({ files: [pngFile] }));
  const enc = encodeURIComponent;
  const links = [
    { name: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${url}`)}`, bg: "#25d366" },
    { name: "X", href: `https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}`, bg: "#000000" },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, bg: "#1877f2" },
    { name: "Telegram", href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`, bg: "#229ed9" },
  ];

  return (
    <Sheet open={open} onClose={onClose} title={t.title} closeLabel={t.close}>
      <div className="mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl bg-mist shadow-[0_20px_50px_-24px_rgb(0_12_31/0.45)]">
        {/* eslint-disable-next-line @next/next/no-img-element -- a blob made on this page, nothing to optimise */}
        {src ? <img src={src} alt={text} className="h-full w-full object-cover" /> : <div className="h-full w-full animate-pulse bg-mist-deep" />}
      </div>
      <div className="mt-6 grid gap-2">
        {canNative && pngFile && (
          <button
            type="button"
            onClick={() => navigator.share({ files: [pngFile], text, url }).catch(() => {})}
            className="rounded-full bg-ink px-6 py-3.5 text-lg font-medium text-paper transition hover:bg-accent"
          >
            {t.native}
          </button>
        )}
        {src && (
          <a href={src} download={`${file}.png`} className="rounded-full bg-mist px-6 py-3.5 text-center text-lg transition hover:bg-mist-deep">
            {t.download}
          </a>
        )}
      </div>
      <p className="mt-6 text-lg text-ink-2">{t.orLink}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {links.map((l) => (
          <a key={l.name} href={l.href} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-lg font-medium text-white transition hover:opacity-90" style={{ background: l.bg }}>
            {l.name}
          </a>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          navigator.clipboard?.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          })
        }
        className="mt-2 w-full rounded-full border border-line-strong px-6 py-3 text-lg transition hover:border-ink"
      >
        {copied ? t.copied : t.copy}
      </button>
      <p className="mt-4 text-base text-ink-2">{t.note}</p>
    </Sheet>
  );
}

/** The reading direction of the current language, for the canvas. */
export function useDir() {
  return LOCALE_INFO[useLocale()].dir;
}
