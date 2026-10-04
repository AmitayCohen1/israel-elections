"use client";

import { useEffect, useState } from "react";
import Link from "@/i18n/link";
import { Avatar } from "@/components/avatar";
import { Arrow } from "@/components/arrow";
import { TopicMenu } from "@/app/[lang]/dev-preview/map/options";

export type LeadAxis = {
  id: string;
  short: string;
  question: string;
  stops: { level: number; short: string; parties: { slug: string; name: string; color: string; face: string | null }[] }[];
  /** How many parties have no documented position on this question. */
  uncoded: number;
};

/**
 * The overview's lead: one question from the position map, as the real line. The stops are the possible answers and every
 * party that wrote on it stands at its stop, as a face. It is the map itself in small, not a door to it: you can read where
 * everyone stands right here; pressing a party (or the arrow) opens the full map on this question, where the quotes are.
 * The topic in the title is a dropdown, as on the map itself. Which question shows first is drawn afresh on every visit, and
 * then it stands still until another is picked. The map exists in Hebrew only, for now.
 */
export function MapLead({ axes, className = "" }: { axes: LeadAxis[]; className?: string }) {
  const [id, setId] = useState(axes[0].id);
  useEffect(() => {
    // Randomness exists only in the browser: the server always renders the same HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(axes[Math.floor(Math.random() * axes.length)].id);
  }, [axes]);
  const axis = axes.find((a) => a.id === id) ?? axes[0];
  const href = `/map#${axis.id}`;
  const cols = { gridTemplateColumns: `repeat(${axis.stops.length}, minmax(0, 1fr))` };
  const faces = (stop: LeadAxis["stops"][number], wrap: string) => (
    <ul className={`flex flex-wrap gap-1.5 ${wrap}`}>
      {stop.parties.map((p) => (
        <li key={p.slug}>
          <Link href={href} title={p.name} aria-label={`${p.name}: ${stop.short}`} className="block rounded-full ring-2 ring-paper transition hover:-translate-y-0.5 hover:ring-ink">
            <Avatar name={p.name} src={p.face} color={p.color} size={44} />
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <section className={`flex flex-col rounded-[2rem] bg-mist p-6 ${className}`}>
      <div className="flex shrink-0 items-start justify-between gap-3">
        <div className="min-w-0">
          {/* The question is one sentence; the topic in it is the control. */}
          <h2 className="title flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-2xl leading-tight">
            מה עמדת המפלגות בנושא
            <TopicMenu axes={axes} value={axis.id} onChange={setId} idle="bg-paper hover:bg-mist-deep" />
          </h2>
          <p className="mt-1.5 text-base text-ink-2 text-pretty">{axis.question} כל מפלגה עומדת ליד התשובה שלה.</p>
        </div>
        <Link href={href} aria-label={`מפת עמדות: ${axis.short}`} className="grid size-10 shrink-0 place-items-center rounded-full bg-paper hover:bg-ink hover:text-white">
          <Arrow>↖</Arrow>
        </Link>
      </div>

      {/* Phones and tablets: the line runs top to bottom, each stop with its parties beside it. */}
      <ol key={`v${axis.id}`} className="swap-in relative mt-5 border-s-4 border-ink ps-5 lg:hidden">
        {axis.stops.map((s) => (
          <li key={s.level} className="relative pb-5 last:pb-0">
            <span aria-hidden className="absolute -start-[1.95rem] top-1 size-5 rounded-full border-4 border-mist bg-ink" />
            <p className="text-lg leading-tight font-medium">{s.short}</p>
            {faces(s, "mt-2")}
          </li>
        ))}
      </ol>

      {/* Wide screens: one line across, the parties standing on their stop and its name under it. */}
      <div key={`h${axis.id}`} className="swap-in mt-4 hidden lg:block">
        <div className="grid items-end gap-4" style={cols}>
          {axis.stops.map((s) => (
            <div key={s.level} className="pb-2.5">
              {faces(s, "justify-center")}
            </div>
          ))}
        </div>
        <div className="relative">
          <div aria-hidden className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink" />
          <div className="relative grid gap-4" style={cols}>
            {axis.stops.map((s) => (
              <span key={s.level} aria-hidden className="mx-auto size-5 rounded-full border-4 border-mist bg-ink" />
            ))}
          </div>
        </div>
        <div className="mt-2 grid items-start gap-4" style={cols}>
          {axis.stops.map((s) => (
            <p key={s.level} className="text-center text-lg leading-tight font-medium">
              {s.short}
            </p>
          ))}
        </div>
      </div>

      {/* Says out loud who is missing, and where the words behind each place are. */}
      <Link href={href} className="mt-4 block shrink-0 text-base text-ink-2 underline-offset-4 hover:text-ink hover:underline lg:mt-3">
        {axis.uncoded > 0 && `ל־${axis.uncoded} מפלגות אין עמדה מתועדת בשאלה הזו · `}
        <span className="title text-ink">לציטוטים ולכל השאלות</span> <Arrow />
      </Link>
    </section>
  );
}
