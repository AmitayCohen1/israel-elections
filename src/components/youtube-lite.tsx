"use client";

import Image from "next/image";
import { useState } from "react";
import { useMessages } from "@/i18n/link";
import { defineMessages } from "@/i18n/messages";

const m = defineMessages(
  { play: (title: string) => `ניגון: ${title}` },
  {
    en: { play: (title: string) => `Play: ${title}` },
    ar: { play: (title: string) => `تشغيل: ${title}` },
    ru: { play: (title: string) => `Воспроизвести: ${title}` },
    am: { play: (title: string) => `አጫውት፦ ${title}` },
  },
);

/** A YouTube video that costs nothing until you press play: a thumbnail first, the player (no cookies) after. */
export function YouTubeLite({ id, title, outlet }: { id: string; title: string; outlet: string }) {
  const t = useMessages(m);
  const [playing, setPlaying] = useState(false);
  return (
    <figure>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink/90">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} aria-label={t.play(title)} className="group absolute inset-0">
            <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill sizes="(min-width: 1024px) 22rem, 90vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
            <span aria-hidden className="absolute inset-0 grid place-items-center">
              <span className="grid size-14 place-items-center rounded-full bg-paper/95 pl-1 shadow-[0_10px_24px_-12px_rgb(0_12_31/0.55)] transition group-hover:bg-ink group-hover:text-paper">
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                  <path d="M8 5.5v13l11-6.5-11-6.5z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-2">
        <span className="block leading-snug font-medium text-pretty">{title}</span>
        <span className="block text-base text-ink-2">{outlet}</span>
      </figcaption>
    </figure>
  );
}
