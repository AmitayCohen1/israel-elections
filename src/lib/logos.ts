import logos from "../../data/logos.json";

export type PartyLogo = { src: string; file: string; page: string; license: string; artist: string | null };

/** A party's own logo, where we have a correct one under a free licence (from Wikimedia Commons); otherwise null and the ballot slip stands in. */
export function partyLogo(slug: string): PartyLogo | null {
  return (logos as Record<string, PartyLogo>)[slug] ?? null;
}
