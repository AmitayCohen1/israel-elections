import Image from "next/image";

export type HeroFace = { name: string; img: string | null };
/** `point` is one line the list itself wrote (about `topic`), or a short description when it published nothing on the topics. */
export type HeroListItem = { slug: string; name: string; letters: string; count: number; faces: HeroFace[]; topic?: string; point?: string };

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

/** A candidate's photo, or their initials when there is no free photo. The className sets size, shape and colours. */
export function Face({ f, sizes, className }: { f: HeroFace; sizes: string; className: string }) {
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden font-medium ${className}`}>
      {f.img ? <Image src={f.img} alt="" fill sizes={sizes} className="object-cover object-top" /> : initials(f.name)}
    </span>
  );
}

export function Slip({ letters, className }: { letters: string; className: string }) {
  return (
    <span className={`slip grid shrink-0 place-items-center border border-line-strong font-ballot leading-none font-black text-ink ${className}`}>
      <span className={letters.length > 2 ? "text-[0.7em]" : ""}>{letters}</span>
    </span>
  );
}

/**
 * The lead candidate of a list, large. A list with no free photo of its lead candidate
 * shows its ballot letters in the same place instead.
 */
export function Lead({ l, sizes, className }: { l: HeroListItem; sizes: string; className: string }) {
  const lead = l.faces[0];
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden ${className}`}>
      {lead?.img ? <Image src={lead.img} alt="" fill sizes={sizes} className="object-cover object-top" /> : <span className="font-ballot text-[2.2em] leading-none font-black text-ink">{l.letters}</span>}
    </span>
  );
}
