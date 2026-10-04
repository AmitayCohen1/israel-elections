"use client";

import Image from "next/image";
import Link, { useMessages } from "@/i18n/link";
import { defineMessages } from "@/i18n/messages";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/avatar";

export type ChatTopic = {
  key: string;
  label: string;
  /** The painted object for the topic: the image path. */
  art: string;
  /** The parties that wrote on it, each with its leader's face and its own words, trimmed. */
  rows: { id: string; name: string; text: string; /** True when `text` is the party's own words, verbatim. */ quoted?: boolean; face: { name: string; src: string | null; color: string | null } }[];
};

const m = defineMessages(
  {
    sub: "מה כל מפלגה חושבת על זה",
    ask: (topic: string) => `מה עמדתכם בנושא ${topic}?`,
    typing: "מקלידה…",
  },
  {
    en: { sub: "What each party thinks about it", ask: (topic: string) => `What is your position on ${topic}?`, typing: "Typing…" },
    ar: { sub: "ماذا يرى كل حزب في هذا", ask: (topic: string) => `ما موقفكم من ${topic}؟`, typing: "تكتب…" },
    ru: { sub: "Что об этом думает каждая партия", ask: (topic: string) => `Какова ваша позиция по теме «${topic}»?`, typing: "Печатает…" },
    am: { sub: "እያንዳንዱ ፓርቲ ስለዚህ ምን ያስባል", ask: (topic: string) => `በ${topic} ላይ ያላችሁ አቋም ምንድን ነው?`, typing: "እየጻፈ ነው…" },
  },
);

const REPLIES = 4;
const VISIBLE = 5;

/** Message g of an endless chat: a question on a topic, then four parties answering it; then the next topic, lap after lap. */
function message(topics: ChatTopic[], g: number) {
  const size = REPLIES + 1;
  const e = Math.floor(g / size);
  const p = g % size;
  const t = topics[e % topics.length];
  const lap = Math.floor(e / topics.length);
  if (p === 0) return { kind: "q" as const, g, t };
  return { kind: "r" as const, g, t, r: t.rows[(lap * REPLIES + p - 1) % t.rows.length] };
}

/**
 * Category first: a topic pops up (its painted object and name), and the parties answer one after another, each in its own
 * words, as a chat that never stops. Older messages slide up and fade at the top. It holds while the pointer is over it, and
 * with reduced motion it just shows a few messages.
 */
export function TopicChat({ topics }: { topics: ChatTopic[] }) {
  const t = useMessages(m);
  const [count, setCount] = useState(3);
  const [typing, setTyping] = useState(false);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (held || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    let n = count;
    const step = () => {
      const next = message(topics, n);
      const add = () => {
        setTyping(false);
        n += 1;
        setCount(n);
        timer = setTimeout(step, next.kind === "q" ? 1500 : 2300);
      };
      if (next.kind === "r") {
        setTyping(true);
        timer = setTimeout(add, 1000);
      } else add();
    };
    timer = setTimeout(step, 1500);
    return () => clearTimeout(timer);
    // `count` is read once when the loop starts; the loop then keeps its own counter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [held, topics]);

  const shown = Array.from({ length: Math.min(VISIBLE, count) }, (_, i) => message(topics, count - Math.min(VISIBLE, count) + i));
  const upcoming = message(topics, count);
  const current = message(topics, count - 1).t;

  return (
    <div onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} className="flex h-full min-h-0 flex-col">
      <Link key={current.key} href={`/topics#${current.key}`} className="card-in flex shrink-0 items-center gap-4 border-b border-ink/10 pb-3">
        <span className="relative size-16 shrink-0">
          <Image src={current.art} alt="" fill sizes="64px" loading="eager" className="object-contain mix-blend-multiply [mask-image:radial-gradient(closest-side,black_70%,transparent_100%)]" />
        </span>
        <span>
          <span className="serif block text-4xl leading-none">{current.label}</span>
          <span className="text-base text-ink-2">{t.sub}</span>
        </span>
      </Link>

      <div className="mt-3 flex min-h-0 flex-1 flex-col justify-end gap-2.5 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%)]">
        {shown.map((m) => (
          <div key={m.g} className="chat-grow grid">
            <div className="min-h-0 overflow-hidden">
              {m.kind === "q" ? (
                <div className="flex pt-2">
                  <Link href={`/topics#${m.t.key}`} className="ms-auto rounded-2xl rounded-ee-md bg-ink px-5 py-2.5 text-lg text-white">
                    {t.ask(m.t.label)}
                  </Link>
                </div>
              ) : (
                <Link href={`/topics#${m.t.key}:${m.r.id}`} className="flex items-end gap-2.5">
                  <Avatar name={m.r.face.name} src={m.r.face.src} color={m.r.face.color} size={38} />
                  <span className="max-w-[30rem] rounded-2xl rounded-es-md bg-paper px-4 py-2.5">
                    <span className="title block text-sm text-ink-2">{m.r.name}</span>
                    <span className="line-clamp-3 block text-base leading-snug text-pretty">{m.r.text}</span>
                  </span>
                </Link>
              )}
            </div>
          </div>
        ))}
        {typing && upcoming.kind === "r" && (
          <div className="chat-grow grid">
            <div className="flex min-h-0 items-end gap-2.5 overflow-hidden">
              <Avatar name={upcoming.r.face.name} src={upcoming.r.face.src} color={upcoming.r.face.color} size={38} />
              <span className="flex items-center gap-1 rounded-2xl rounded-es-md bg-paper px-4 py-3.5" aria-label={t.typing}>
                <span className="size-2 animate-bounce rounded-full bg-ink/35" />
                <span className="size-2 animate-bounce rounded-full bg-ink/35 [animation-delay:150ms]" />
                <span className="size-2 animate-bounce rounded-full bg-ink/35 [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
