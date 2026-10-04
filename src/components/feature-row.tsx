import Link from "@/i18n/link";

/** One squircle picture, one title, one sentence, one link — america.gov's 448 / 308 proportions. */
export function FeatureRow({ title, body, href, cta, media }: { title: React.ReactNode; body: string; href: string; cta: string; media: React.ReactNode }) {
  return (
    <Link href={href} className="reveal group mx-auto grid max-w-[28rem] items-center gap-10 md:max-w-none md:grid-cols-[28rem_19.25rem] md:justify-center md:gap-[8.5rem]">
      <div className="squircle aspect-square overflow-hidden">{media}</div>
      <div>
        <h2 className="title text-[2.5rem]">{title}</h2>
        <p className="mt-6 text-ink-2">{body}</p>
        <span className="mt-8 inline-block text-base font-bold underline-offset-4 group-hover:underline">{cta}</span>
      </div>
    </Link>
  );
}
