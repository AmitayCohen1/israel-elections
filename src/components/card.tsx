import Link from "@/i18n/link";
import { getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { Arrow } from "@/components/arrow";

const m = defineMessages(
  { all: (title: string) => `${title}: הכול` },
  {
    en: { all: (title: string) => `${title}: see all` },
    ar: { all: (title: string) => `${title}: عرض الكل` },
    ru: { all: (title: string) => `${title}: всё` },
    am: { all: (title: string) => `${title}፦ ሁሉንም ይመልከቱ` },
  },
);

/**
 * One anatomy for every card on the overview: the title at the top right with what is inside under it, a round way in at
 * the top left, and one plain thing underneath. Grey, except where `tone` says otherwise (the guide).
 */
export async function Card({ title, note, href, tone = "bg-mist", className = "", children }: { title: string; note: string; href: string; tone?: string; className?: string; children: React.ReactNode }) {
  const t = await getMessages(m);
  return (
    <section className={`flex min-h-[19rem] flex-col overflow-hidden rounded-[2rem] p-6 lg:min-h-0 ${tone} ${className}`}>
      <div className="flex shrink-0 items-start justify-between gap-3">
        <div>
          <h2 className="title text-2xl leading-tight">{title}</h2>
          <p className="mt-0.5 text-base text-ink-2">{note}</p>
        </div>
        <Link href={href} aria-label={t.all(title)} className="grid size-10 shrink-0 place-items-center rounded-full bg-paper hover:bg-ink hover:text-white">
          <Arrow>↖</Arrow>
        </Link>
      </div>
      <div className="mt-4 min-h-0 flex-1">{children}</div>
    </section>
  );
}
