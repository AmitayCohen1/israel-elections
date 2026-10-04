const FALLBACK = "#3b3b44";

export function listColor(color: string | null | undefined) {
  if (!color) return FALLBACK;
  if (/^#[0-9a-f]{3}$/i.test(color)) return "#" + [...color.slice(1)].map((c) => c + c).join("");
  return color;
}

/** Readable text colour (ink or white) for a background. */
export function onColor(color: string | null | undefined) {
  const hex = listColor(color).slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.45 ? "#0f0f12" : "#ffffff";
}

/** A very light tint of the list colour for large surfaces. */
export function tint(color: string | null | undefined, alpha = 0.1) {
  const hex = listColor(color);
  const a = Math.round(alpha * 255).toString(16).padStart(2, "0");
  return hex + a;
}
