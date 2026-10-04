"use client";

import { useMessages } from "@/i18n/link";
import { ballot } from "@/i18n/messages/ballot";
import { listColor } from "@/lib/color";

/** A ballot slip (פתק): the letters voters actually see in the booth. */
export function Ballot({
  letters,
  color,
  size = "md",
  className = "",
}: {
  letters: string;
  color: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const t = useMessages(ballot);
  const dims = {
    xs: "h-9 w-7 text-sm rounded-[0.25rem]",
    sm: "h-14 w-11 text-xl rounded-[0.3rem]",
    md: "h-28 w-22 text-4xl rounded-[0.45rem]",
    lg: "h-44 w-34 text-6xl rounded-[0.55rem]",
  }[size];
  return (
    <span
      className={`slip relative grid shrink-0 place-items-center overflow-hidden ring-1 ring-ink/10 shadow-[0_1px_1px_rgb(0_12_31/0.05),0_12px_22px_-16px_rgb(0_12_31/0.3)] ${dims} ${className}`}
      aria-label={t.slip(letters)}
    >
      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: listColor(color) }} />
      <span className="font-ballot font-black leading-none tracking-tight text-ink">{letters}</span>
    </span>
  );
}
