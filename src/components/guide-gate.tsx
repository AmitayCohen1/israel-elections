import { getDictionary, getMessages } from "@/i18n";
import Link from "@/i18n/link";
import { m } from "@/i18n/messages/guide-gate";
import { VoteClip } from "@/components/vote-clip";

/**
 * The gate to the guide: one link, nothing to read through. The name, one line on what is behind it, and a way in.
 * `painted` has the voting clip beside the words, and nothing else; `blue` is the words alone on navy;  `quiet` is a slim grey row. `stack` is the painted one for a narrow card: words, clip, button, top to bottom.
 */
export async function GuideGate({ look = "painted", stack = false, className = "" }: { look?: "painted" | "blue" | "quiet"; stack?: boolean; className?: string }) {
  const t = await getMessages(m);
  const dict = await getDictionary();
  const blue = look === "blue";
  if (look === "quiet")
    return (
      <Link href="/how-it-works" className={`group flex items-center gap-4 rounded-[2rem] bg-mist px-6 py-5 transition hover:bg-mist-deep ${className}`}>
        <span className="title text-2xl">{dict.nav.vote}</span>
        <span className="flex-1 text-lg text-ink-2">{t.hint}</span>
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-paper transition group-hover:bg-ink group-hover:text-white">
          <span className="inline-block rtl:-scale-x-100">↗</span>
        </span>
      </Link>
    );
  if (stack)
    return (
      <Link href="/how-it-works" className={`group relative flex min-h-[16rem] flex-col overflow-hidden rounded-[2rem] bg-cream p-6 transition hover:bg-[#f8f4de] lg:min-h-0 ${className}`}>
        <span className="title block text-2xl leading-tight">{dict.nav.vote}</span>
        <span className="mt-0.5 block text-base text-ink-2">{t.hint}</span>
        <span className="grid min-h-0 flex-1 place-items-center py-2">
          <VoteClip autoplay loop className="pointer-events-none h-full max-h-[11rem] min-h-0 w-auto object-contain" />
        </span>
        <span className="inline-flex h-10 w-fit shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-base font-medium text-white transition group-hover:bg-accent">
          {t.cta} <span aria-hidden className="inline-block rtl:-scale-x-100">→</span>
        </span>
      </Link>
    );
  return (
    <Link href="/how-it-works" className={`group relative flex min-h-[13rem] items-center justify-between gap-6 overflow-hidden rounded-[2rem] p-6 transition lg:min-h-0 ${blue ? "bg-accent text-white hover:bg-ink" : "bg-cream hover:bg-[#f8f4de]"} ${className}`}>
      <span className="flex h-full flex-col justify-between">
        <span>
          <span className="serif block text-[clamp(2.5rem,3.6vw,3.75rem)] leading-none">{dict.nav.vote}</span>
          <span className={`mt-2 block text-lg ${blue ? "text-white/70" : "text-ink-2"}`}>{t.hint}</span>
        </span>
        <span className={`mt-4 inline-flex h-11 w-fit items-center gap-2 rounded-full px-5 text-base font-medium transition ${blue ? "bg-white text-accent" : "bg-ink text-white group-hover:bg-accent"}`}>
          {t.cta} <span aria-hidden className="inline-block rtl:-scale-x-100">→</span>
        </span>
      </span>
      {!blue && <VoteClip autoplay loop className="pointer-events-none h-full max-h-[22rem] min-h-0 w-auto max-w-[55%] shrink object-contain" />}
    </Link>
  );
}
