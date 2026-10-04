import Image from "next/image";
import Link from "@/i18n/link";
import { getDataset } from "@/lib/data";
import { TOPICS, TOPIC_KEYS } from "@/lib/topics";
import { topicItems } from "@/components/topic-panels";
import { ListMark } from "@/components/list-card";
import { faces } from "@/lib/faces";
import Home from "../../page";
import { Split } from "./split";

const TILE = "group flex min-h-[15rem] flex-col rounded-[2rem] bg-mist p-6 transition hover:bg-mist-deep";

function Label({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <h2 className="mt-14 mb-4 flex items-baseline gap-3">
      <span className="grid size-9 place-items-center rounded-full bg-ink text-white">{k}</span>
      <span className="title text-2xl">{children}</span>
    </h2>
  );
}

/** Three practical overview layouts side by side, on real data. Pick one. */
export default async function OverviewOptions() {
  const lists = await getDataset();
  const sorted = [...lists].sort((a, b) => a.cec_order - b.cec_order);
  const main = sorted.filter((l) => l.tier === "main");
  const candidates = lists.reduce((n, l) => n + l.candidates.length, 0);
  const people = faces(main, 6, 4);
  const first = topicItems(sorted, "economy").find((r) => r.gist);
  const positions = TOPIC_KEYS.reduce((n, k) => n + topicItems(sorted, k).length, 0);
  const topics = TOPIC_KEYS.map((key) => ({
    key,
    label: TOPICS[key].label,
    art: <Image src={`/media/illustrations/topics/${key}.png`} alt="" width={120} height={120} className="w-full mix-blend-multiply" />,
    rows: topicItems(sorted, key).map((r) => ({ id: r.id, name: r.name, gist: r.gist, mark: r.mark })),
  }));

  return (
    <div className="p-6 pb-24 sm:p-10">
      <h1 className="serif text-5xl">אפשרויות לסקירה</h1>
      <p className="mt-2 text-xl text-ink-2">שלוש דרכים פרקטיות. כולן עם נתונים אמיתיים.</p>

      <Label k="A">ארבע אריחים: מספר, ודוגמה אחת בכל אחד</Label>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/lists" className={TILE}>
          <span className="text-base text-ink-2">רשימות</span>
          <span className="title mt-1 text-6xl leading-none tabular-nums">{lists.length}</span>
          <span className="mt-auto flex items-center gap-2 pt-5">
            {main.slice(0, 6).map((l) => (
              <ListMark key={l.slug} list={l} size={40} />
            ))}
            <span className="ms-1 text-sm text-ink-2">ועוד {lists.length - 6}</span>
          </span>
        </Link>
        <Link href="/people" className={TILE}>
          <span className="text-base text-ink-2">אנשים</span>
          <span className="title mt-1 text-6xl leading-none tabular-nums">{candidates.toLocaleString("he-IL")}</span>
          <span className="mt-auto flex -space-x-3 space-x-reverse pt-5">
            {people.map((f) => (
              <span key={f.href} className="relative block size-14 overflow-hidden rounded-full ring-4 ring-mist">
                <Image src={f.src} alt="" fill sizes="56px" className="object-cover object-top" />
              </span>
            ))}
          </span>
        </Link>
        <Link href="/topics" className={TILE}>
          <span className="text-base text-ink-2">עמדות</span>
          <span className="title mt-1 text-6xl leading-none tabular-nums">{positions}</span>
          {first && (
            <span className="mt-auto block pt-5">
              <span className="block text-sm text-ink-2">{first.name} · כלכלה</span>
              <span className="mt-1 line-clamp-2 block text-lg leading-snug">{first.gist}</span>
            </span>
          )}
        </Link>
        <Link href="/how-it-works" className={`${TILE} !bg-accent text-white hover:!bg-ink`}>
          <span className="text-base text-white/70">איך מצביעים</span>
          <span className="title mt-1 text-6xl leading-none tabular-nums">120</span>
          <span className="mt-auto flex flex-wrap gap-2 pt-5 text-base">
            {["בוחרים פתק", "מעטפה", "קלפי"].map((t, i) => (
              <span key={t} className="rounded-full bg-white/10 px-3 py-1">
                {i + 1} · {t}
              </span>
            ))}
          </span>
        </Link>
      </div>

      <Label k="B">נושאים בצד, ומה הרשימות אמרו בנושא שנבחר</Label>
      <Split topics={topics} />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Link href="/lists" className="flex items-center justify-between rounded-2xl bg-mist px-5 py-3 text-lg transition hover:bg-mist-deep">
          <span className="title">רשימות</span>
          <span className="text-ink-2 tabular-nums">{lists.length}</span>
        </Link>
        <Link href="/people" className="flex items-center justify-between rounded-2xl bg-mist px-5 py-3 text-lg transition hover:bg-mist-deep">
          <span className="title">אנשים</span>
          <span className="text-ink-2 tabular-nums">{candidates.toLocaleString("he-IL")}</span>
        </Link>
        <Link href="/how-it-works" className="flex items-center justify-between rounded-2xl bg-accent px-5 py-3 text-lg text-white transition hover:bg-ink">
          <span className="title">איך מצביעים</span>
          <span aria-hidden>←</span>
        </Link>
      </div>

      <Label k="C">מה שיש עכשיו</Label>
      <div className="-mx-6 overflow-hidden rounded-[2rem] border border-line sm:-mx-10">
        <div className="pointer-events-none origin-top-start scale-[0.8]">
          <Home />
        </div>
      </div>
    </div>
  );
}
