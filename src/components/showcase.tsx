import Image from "next/image";
import Link from "@/i18n/link";

export type PersonData = { href: string; name: string; img: string; slot: number; list: string; letters: string };
export type PositionData = { href: string; topic: string; point: string; list: string; letters: string; img: string | null };
export type ListData = { href: string; name: string; letters: string; faces: (string | null)[]; count: number };
export type Mixed = ({ kind: "person" } & PersonData) | ({ kind: "position" } & PositionData) | ({ kind: "list" } & ListData);

const CARD = "block rounded-[1.5rem] border border-line bg-card p-3 text-right shadow-[0_24px_50px_-34px_rgb(0_12_31/0.5)]";

function Tag({ letters }: { letters: string }) {
  return <span className="slip shrink-0 rounded-[4px] border border-line-strong px-1.5 py-0.5 font-ballot text-xs leading-none font-black text-ink">{letters}</span>;
}

function PersonBody({ p, fill = false }: { p: PersonData; fill?: boolean }) {
  return (
    <div dir="rtl" className={fill ? "flex h-full flex-col" : ""}>
      <div className={`relative overflow-hidden rounded-[1.05rem] bg-tile ${fill ? "flex-1" : "aspect-[4/5]"}`}>
        <Image src={p.img} alt={p.name} fill sizes="240px" className="object-cover object-top" />
      </div>
      <div className="px-1 pt-3 pb-1">
        <p className="title truncate text-xl">{p.name}</p>
        <p className="mt-1.5 flex items-center gap-2 text-sm text-ink-2">
          <Tag letters={p.letters} />
          <span className="truncate">
            מקום {p.slot} · {p.list}
          </span>
        </p>
      </div>
    </div>
  );
}

/** A face, a topic, and a few words of what the list says. The lead-in "הרשימה" is dropped; the list is named above. */
function PositionBody({ p, fill = false, clamp = "line-clamp-3" }: { p: PositionData; fill?: boolean; clamp?: string }) {
  const text = p.point.replace(/^הרשימה\s+/, "");
  return (
    <div dir="rtl" className={fill ? "flex h-full flex-col" : ""}>
      <div className={`relative overflow-hidden rounded-[1.05rem] bg-tile ${fill ? "flex-1" : "aspect-[4/3]"}`}>
        {p.img ? (
          <Image src={p.img} alt="" fill sizes="260px" className="object-cover object-[50%_18%]" />
        ) : (
          <span className="grid size-full place-items-center font-ballot text-5xl font-black text-ink/25">{p.letters}</span>
        )}
        <span className="absolute top-2.5 right-2.5 rounded-full bg-card/95 px-2.5 py-1 text-xs font-medium shadow-sm">{p.topic}</span>
      </div>
      <div className="px-1 pt-3 pb-1">
        <p className="text-sm font-medium text-ink-2">{p.list}</p>
        <p className={`serif mt-1 text-[1.2rem] leading-[1.22] ${clamp}`}>{text}</p>
      </div>
    </div>
  );
}

function ListBody({ l, fill = false }: { l: ListData; fill?: boolean }) {
  return (
    <div dir="rtl" className={fill ? "flex h-full flex-col" : ""}>
      <div className={`grid place-items-center rounded-[1.05rem] bg-tile ${fill ? "flex-1" : "h-32"}`}>
        <span className="slip grid h-24 w-[4.75rem] place-items-center rounded-lg border border-line-strong font-ballot text-4xl leading-none font-black shadow-[0_12px_24px_-16px_rgb(0_12_31/0.5)]">{l.letters}</span>
      </div>
      <div className="px-1 pt-3 pb-1">
        <p className="title truncate text-xl">{l.name}</p>
        <div className="mt-1.5 flex items-center gap-2.5 text-sm text-ink-2">
          <span className="flex -space-x-2 space-x-reverse">
            {l.faces.map((f, i) =>
              f ? <Image key={i} src={f} alt="" width={24} height={24} className="size-6 rounded-full object-cover object-top ring-2 ring-card" /> : <span key={i} className="size-6 rounded-full bg-tile ring-2 ring-card" />,
            )}
          </span>
          {l.count} מועמדים
        </div>
      </div>
    </div>
  );
}

function Body({ card, fill }: { card: Mixed; fill?: boolean }) {
  if (card.kind === "person") return <PersonBody p={card} fill={fill} />;
  if (card.kind === "position") return <PositionBody p={card} fill={fill} clamp={fill ? "line-clamp-2" : "line-clamp-3"} />;
  return <ListBody l={card} fill={fill} />;
}

/* ─────────────── A. Fan: a full hand of cards, all in view ─────────────── */
export function OptionFan({ cards }: { cards: Mixed[] }) {
  const hand = cards.slice(0, 7);
  const mid = (hand.length - 1) / 2;
  return (
    <div className="relative mx-auto h-[30rem] w-full max-w-[44rem]" dir="ltr">
      {hand.map((card, i) => (
        <Link
          key={card.kind + card.href}
          href={card.href}
          className={`${CARD} absolute top-[9%] left-1/2 h-[18rem] w-[12.5rem] origin-[50%_135%] transition-transform duration-300 ease-out hover:z-50 hover:[--lift:-2.25rem]`}
          style={{ transform: `translateX(-50%) rotate(${(i - mid) * 13}deg) translateY(var(--lift, 0rem))`, zIndex: 10 - Math.abs(i - mid) }}
        >
          <Body card={card} fill />
        </Link>
      ))}
    </div>
  );
}

/* ─────────────── B. Wall: three tilted columns drifting ─────────────── */
export function OptionWall({ cards }: { cards: Mixed[] }) {
  const columns = [0, 1, 2].map((c) => cards.filter((_, i) => i % 3 === c));
  return (
    <div
      className="hero-wall relative h-[42rem] overflow-hidden [mask-composite:intersect] [mask-image:linear-gradient(180deg,transparent_0%,black_14%,black_86%,transparent_100%),linear-gradient(90deg,transparent_0%,black_10%,black_90%,transparent_100%)]"
      dir="ltr"
    >
      <div className="absolute inset-x-0 -top-40 flex origin-top -rotate-[8deg] justify-center gap-5">
        {columns.map((col, c) => (
          <div key={c} className="w-[15rem] shrink-0">
            <div className={`rise flex flex-col ${c % 2 ? "rise-reverse" : ""}`} style={{ ["--rise-duration" as string]: `${110 + c * 25}s` }}>
              {[0, 1].map((copy) => (
                <div key={copy} className="flex flex-col gap-5 pb-5" aria-hidden={copy === 1}>
                  {col.map((card) => (
                    <Link key={card.kind + card.href} href={card.href} tabIndex={copy ? -1 : undefined} className={`${CARD} transition duration-300 hover:-translate-y-1`}>
                      <Body card={card} />
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── C. Orbit: faces circling the number ─────────────── */
export function OptionOrbit({ people, total }: { people: PersonData[]; total: number }) {
  const rings = [
    { r: 7.75, n: 8, size: 56, dur: 80 },
    { r: 12.5, n: 12, size: 50, dur: 120 },
    { r: 17.25, n: 16, size: 44, dur: 160 },
  ];
  let used = 0;
  return (
    <div className="relative mx-auto size-[38rem] max-w-full" dir="ltr">
      {rings.map((ring, k) => {
        const slice = people.slice(used, used + ring.n);
        used += ring.n;
        return (
          <div key={k} className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 rounded-full border border-line" style={{ width: `${ring.r * 2}rem`, height: `${ring.r * 2}rem`, transform: "translate(-50%,-50%)" }} />
            <div className={`orbit absolute inset-0 ${k % 2 ? "[animation-direction:reverse]" : ""}`} style={{ ["--orbit-duration" as string]: `${ring.dur}s` }}>
              {slice.map((p, i) => (
                <div
                  key={p.href}
                  className="absolute top-1/2 left-1/2"
                  style={{ transform: `rotate(${(360 / slice.length) * i}deg) translateX(${ring.r}rem) rotate(${-(360 / slice.length) * i}deg)`, marginLeft: -ring.size / 2, marginTop: -ring.size / 2 }}
                >
                  <Link
                    href={p.href}
                    title={`${p.name} · ${p.list}`}
                    className={`orbit-counter block overflow-hidden rounded-full shadow-[0_10px_24px_-12px_rgb(0_12_31/0.5)] ring-[3px] ring-paper ${k % 2 ? "[animation-direction:normal]" : ""}`}
                    style={{ width: ring.size, height: ring.size, ["--orbit-duration" as string]: `${ring.dur}s` }}
                  >
                    <Image src={p.img} alt={p.name} width={ring.size} height={ring.size} className="size-full object-cover object-top" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <div className="absolute top-1/2 left-1/2 grid size-[9.5rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-center text-white" dir="rtl">
        <div>
          <p className="serif text-5xl">{total.toLocaleString("he-IL")}</p>
          <p className="mt-1 text-sm text-white/70">מועמדים</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── D. Bento: everything at once, in a tidy grid ─────────────── */
export function OptionBento({ person, position, list, extra, stats }: { person: PersonData; position: PositionData; list: ListData; extra: PersonData[]; stats: { n: string; label: string }[] }) {
  const tile = "overflow-hidden rounded-[1.75rem] transition duration-300 hover:-translate-y-1";
  return (
    <div className="mx-auto grid aspect-square w-full max-w-[38rem] grid-cols-4 grid-rows-4 gap-3">
      <Link href={person.href} className={`${tile} relative col-span-2 row-span-2 bg-tile`}>
        <Image src={person.img} alt={person.name} fill sizes="320px" className="object-cover object-top" />
        <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgb(0_12_31/0.8)_100%)]" />
        <span className="absolute inset-x-5 bottom-4 text-white">
          <span className="title block text-2xl">{person.name}</span>
          <span className="text-sm text-white/75">
            מקום {person.slot} · {person.list}
          </span>
        </span>
      </Link>
      <Link href={position.href} className={`${tile} col-span-2 row-span-2 flex flex-col bg-ink p-5 text-white`}>
        <span className="text-sm text-white/60">{position.topic}</span>
        <span className="serif mt-3 line-clamp-6 text-[1.45rem] leading-[1.2]">{position.point}</span>
        <span className="mt-auto flex items-center gap-2.5 pt-3 text-sm">
          {position.img && <Image src={position.img} alt="" width={28} height={28} className="size-7 rounded-full object-cover object-top" />}
          {position.list}
        </span>
      </Link>
      <Link href={list.href} className={`${tile} col-span-2 flex items-center gap-4 border border-line bg-card p-4`}>
        <span className="slip grid h-20 w-16 shrink-0 place-items-center rounded-lg border border-line-strong font-ballot text-3xl leading-none font-black">{list.letters}</span>
        <span className="min-w-0">
          <span className="title block truncate text-2xl">{list.name}</span>
          <span className="mt-1.5 flex -space-x-2 space-x-reverse">
            {list.faces.map((f, i) => (f ? <Image key={i} src={f} alt="" width={28} height={28} className="size-7 rounded-full object-cover object-top ring-2 ring-card" /> : null))}
          </span>
        </span>
      </Link>
      {stats.slice(0, 2).map((s) => (
        <div key={s.label} className={`${tile} grid place-items-center bg-tile text-center`}>
          <div>
            <p className="serif text-4xl">{s.n}</p>
            <p className="text-sm text-ink-2">{s.label}</p>
          </div>
        </div>
      ))}
      {extra.slice(0, 2).map((p) => (
        <Link key={p.href} href={p.href} className={`${tile} relative bg-tile`} title={p.name}>
          <Image src={p.img} alt={p.name} fill sizes="160px" className="object-cover object-top" />
        </Link>
      ))}
      <div className={`${tile} col-span-2 flex flex-wrap content-center gap-2 bg-[#e6ecf7] p-4`}>
        {["ביטחון", "כלכלה", "דיור", "דת ומדינה", "משפט", "חינוך"].map((t) => (
          <span key={t} className="rounded-full bg-card px-3 py-1 text-sm font-medium">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── E. Feed: who said what, scrolling by ─────────────── */
export function OptionFeed({ positions }: { positions: PositionData[] }) {
  return (
    <div className="hero-wall relative mx-auto h-[38rem] w-full max-w-[32rem] overflow-hidden [mask-image:linear-gradient(180deg,transparent_0%,black_14%,black_86%,transparent_100%)]">
      <div className="rise" style={{ ["--rise-duration" as string]: "70s" }}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex flex-col gap-5 pb-5" aria-hidden={copy === 1}>
            {positions.map((p) => (
              <Link key={p.href + p.topic} href={p.href} tabIndex={copy ? -1 : undefined} className="group flex items-start gap-3.5">
                {p.img ? (
                  <Image src={p.img} alt="" width={52} height={52} className="size-13 shrink-0 rounded-full object-cover object-top shadow-md" />
                ) : (
                  <span className="slip grid size-13 shrink-0 place-items-center rounded-full border border-line-strong font-ballot text-lg font-black">{p.letters}</span>
                )}
                <div className="min-w-0 flex-1 rounded-[1.5rem] rounded-tr-md border border-line bg-card p-4 shadow-[0_20px_44px_-32px_rgb(0_12_31/0.5)] transition group-hover:-translate-y-0.5">
                  <p className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{p.list}</span>
                    <span className="text-ink-2">· {p.topic}</span>
                  </p>
                  <p className="mt-1.5 line-clamp-3 text-[1.05rem] leading-snug">{p.point}</p>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
