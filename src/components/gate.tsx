import Link from "@/i18n/link";
import { Arrow } from "@/components/arrow";

/**
 * A gate: one link into a section. The words (the name, one line, a text link) and one living visual, nothing to read
 * through. On wide screens the words sit at the start side and the visual at the other; a `stack` gate, and every gate on
 * a phone, puts the visual under the words. On a phone the visual is left out, so a gate is a compact block to tap.
 */
export function Gate({ href, title, line, cta, tone = "bg-mist hover:bg-mist-deep", stack = false, className = "", children }: { href: string; title: string; line: string; cta: string; tone?: string; stack?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={`group relative flex flex-col justify-between gap-5 overflow-hidden rounded-3xl p-5 transition sm:min-h-[9rem] sm:rounded-[2rem] sm:p-6 lg:min-h-0 ${stack ? "" : "sm:flex-row sm:items-center"} ${tone} ${className}`}>
      <span className="flex min-w-0 flex-col">
        <span className="serif block text-[clamp(1.9rem,2.4vw,2.5rem)] leading-none">{title}</span>
        <span className="mt-2 block text-lg leading-snug text-ink-2 text-pretty">{line}</span>
        <span className="mt-3 inline-flex w-fit items-center gap-1.5 text-base font-medium underline-offset-4 group-hover:underline">
          {cta} <Arrow />
        </span>
      </span>
      <span className={`flex min-h-0 shrink-0 items-center justify-center py-1 max-sm:hidden ${stack ? "" : "sm:h-full sm:max-w-[55%]"}`}>{children}</span>
    </Link>
  );
}
