import { Ballot } from "@/components/ballot";
import { partyLogo } from "@/lib/logos";

const BOX = { xs: "h-9 w-12 p-1", sm: "h-14 w-16 p-1.5", md: "h-28 w-32 p-1.5" } as const;

/**
 * A party's mark: its logo where we have one, on white, with the logo's own proportions; otherwise its ballot slip.
 * (Logos are plain <img>: most are SVG, which next/image does not serve.)
 */
export function PartyMark({ slug, letters, color, size = "sm", className = "" }: { slug: string; letters: string; color: string | null; size?: "xs" | "sm" | "md"; className?: string }) {
  const logo = partyLogo(slug);
  if (!logo) return <Ballot letters={letters} color={color} size={size} className={className} />;
  return (
    <span className={`grid shrink-0 place-items-center rounded-xl bg-paper ring-1 ring-ink/10 ${BOX[size]} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo.src} alt={`לוגו`} className="size-full object-contain" />
    </span>
  );
}
