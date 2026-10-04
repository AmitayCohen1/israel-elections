/** A passage cut short at a word, never mid-word, and always marked with an ellipsis so it never reads as the whole. */
export function excerpt(text: string, max = 140) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.\-–—]+$/, "") + "…";
}

/** The one-line face of a position: the party's own first quote, in quotation marks, cut at a word. Our summary is only the fallback. */
export function quoteGist(positions: { quote: string; point: string }[], max = 140) {
  const q = positions.find((p) => p.quote?.trim());
  if (!q) return positions[0]?.point ?? null;
  const text = excerpt(q.quote, max);
  // The marks follow the quote's own language: Hebrew closes the pair the other way round.
  return /\p{Script=Hebrew}/u.test(text) ? `”${text}“` : `“${text}”`;
}
