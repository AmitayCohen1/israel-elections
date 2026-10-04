/** Russian: 1 / 2–4 / 5+ (with 11–14 taking the last form). */
export function ruPlural(n: number, one: string, few: string, many: string) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  return a > 10 && a < 20 ? many : b === 1 ? one : b >= 2 && b <= 4 ? few : many;
}

/** Arabic forms: [one, two, 3–10, 11+]. A bare noun for 1 and 2, otherwise the number and the noun. */
export function arCount(n: number, forms: [string, string, string, string], shown = String(n)) {
  if (n === 1) return forms[0];
  if (n === 2) return forms[1];
  const r = n % 100;
  return `${shown} ${r >= 3 && r <= 10 ? forms[2] : forms[3]}`;
}
