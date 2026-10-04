/**
 * How close two answers are on the position map's questions: the arithmetic behind the quiz, the coalition builder and the
 * "who is close to whom" map. Pure, so the browser runs it live. Only coded answers count: a party with no coded answer on a
 * question is left out of that question, never guessed.
 */

export type QAxis = {
  id: string;
  /** the topic the question belongs to: security, economy, ... */
  topic: string;
  short: string;
  question: string;
  /** false when the answers are categories with no order between them */
  ordered: boolean;
  scale: { level: number; label: string; short: string }[];
};

export type QParty = {
  slug: string;
  name: string;
  color: string;
  face: string | null;
  tier: "main" | "other";
  /** axis id -> coded level */
  levels: Record<string, number>;
  /** axis id -> the quote the level rests on */
  quotes: Record<string, { quote: string; source_url: string }>;
};

/** 1 when the two answers are the same, 0 when they are at opposite ends; categories either match or not. */
export function agreement(axis: QAxis, a: number, b: number) {
  if (!axis.ordered) return a === b ? 1 : 0;
  return 1 - Math.abs(a - b) / (axis.scale.length - 1);
}

export type Answers = Record<string, { level: number; weight: number }>;

/** How well a party matches someone's answers: the weighted average agreement over the questions both answered, and on how many. */
export function score(axes: QAxis[], answers: Answers, party: QParty) {
  let sum = 0;
  let weights = 0;
  let overlap = 0;
  for (const ax of axes) {
    const a = answers[ax.id];
    const p = party.levels[ax.id];
    if (!a || p == null) continue;
    sum += agreement(ax, a.level, p) * a.weight;
    weights += a.weight;
    overlap++;
  }
  return { score: weights ? sum / weights : null, overlap };
}

/** Distance between two parties (0 = same answers, 1 = opposite) over the questions both are coded on, and how many that is. */
export function distance(axes: QAxis[], p: QParty, q: QParty) {
  let sum = 0;
  let shared = 0;
  for (const ax of axes) {
    const a = p.levels[ax.id];
    const b = q.levels[ax.id];
    if (a == null || b == null) continue;
    sum += 1 - agreement(ax, a, b);
    shared++;
  }
  return { d: shared ? sum / shared : null, shared };
}
