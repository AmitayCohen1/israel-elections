import Link from "@/i18n/link";
import { Arrow } from "@/components/arrow";

/**
 * A gate: one link into a section. The words sit at the start side, centred top to bottom (the name, one line, a text link);
 * one visual sits at the other side (under the words on a phone). Nothing to read through. A `slim` gate shares its row with
 * another on wide screens, so there it is only the words.
 */
export function Gate({ href, title, line, cta, tone = "bg-mist hover:bg-mist-deep", slim = false, className = "", children }: { href: string; title: string; line: string; cta: string; tone?: string; slim?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={`group relative flex min-h-[9rem] flex-col justify-between gap-4 overflow-hidden rounded-[2rem] px-6 py-5 transition sm:flex-row sm:items-center sm:gap-5 sm:py-4 lg:min-h-0 ${tone} ${className}`}>
      <span className="flex min-w-0 flex-col">
        <span className="serif block text-[clamp(1.9rem,2.4vw,2.5rem)] leading-none">{title}</span>
        <span className="mt-1.5 block text-base text-ink-2 text-pretty">{line}</span>
        <span className="mt-2.5 inline-flex w-fit items-center gap-1.5 text-base font-medium underline-offset-4 group-hover:underline">
          {cta} <Arrow />
        </span>
      </span>
      <span className={`flex min-h-0 shrink-0 items-center justify-center py-1 sm:h-full sm:max-w-[55%] ${slim ? "lg:hidden" : ""}`}>{children}</span>
    </Link>
  );
}
