/**
 * Knesset seat allocation (Elections Law §81–81A): 3.25% threshold, "המודד" (votes per seat),
 * then remaining seats by Bader–Ofer (D'Hondt), with surplus-agreement pairs treated as one list
 * for the remainder and split between them afterwards.
 */
export const SEATS = 120;
export const THRESHOLD = 0.0325;

export type Party = { id: string; votes: number };
export type Allocation = {
  threshold: number;
  passed: string[];
  quota: number;
  initial: Record<string, number>;
  final: Record<string, number>;
  /** seats won in the remainder stage, in order, for explanation */
  remainderOrder: string[];
};

function dhondt(votes: Record<string, number>, seats: Record<string, number>, toGive: number, order?: string[]) {
  const s = { ...seats };
  for (let i = 0; i < toGive; i++) {
    let best: string | null = null;
    let bestQ = -1;
    for (const [id, v] of Object.entries(votes)) {
      const q = v / (s[id] + 1);
      if (q > bestQ) {
        bestQ = q;
        best = id;
      }
    }
    if (!best) break;
    s[best] += 1;
    order?.push(best);
  }
  return s;
}

export function allocate(parties: Party[], surplus: [string, string][] = []): Allocation {
  const total = parties.reduce((n, p) => n + p.votes, 0);
  const threshold = total * THRESHOLD;
  const passing = parties.filter((p) => p.votes >= threshold);
  const passed = passing.map((p) => p.id);
  const quota = passing.reduce((n, p) => n + p.votes, 0) / SEATS;

  const initial: Record<string, number> = {};
  for (const p of passing) initial[p.id] = Math.floor(p.votes / quota);
  const remaining = SEATS - Object.values(initial).reduce((a, b) => a + b, 0);

  // Group surplus pairs (both lists must have passed).
  const groupOf: Record<string, string> = Object.fromEntries(passed.map((id) => [id, id]));
  for (const [a, b] of surplus) {
    if (passed.includes(a) && passed.includes(b)) groupOf[b] = groupOf[a] = `${a}+${b}`;
  }
  const gVotes: Record<string, number> = {};
  const gSeats: Record<string, number> = {};
  for (const p of passing) {
    const g = groupOf[p.id];
    gVotes[g] = (gVotes[g] ?? 0) + p.votes;
    gSeats[g] = (gSeats[g] ?? 0) + initial[p.id];
  }
  const order: string[] = [];
  const gFinal = dhondt(gVotes, gSeats, remaining, order);

  const final: Record<string, number> = { ...initial };
  for (const [g, seats] of Object.entries(gFinal)) {
    const members = passing.filter((p) => groupOf[p.id] === g);
    if (members.length === 1) {
      final[members[0].id] = seats;
      continue;
    }
    // Split the pair's seats between its members, same method.
    const pairQuota = gVotes[g] / seats;
    const split: Record<string, number> = {};
    for (const m of members) split[m.id] = Math.floor(m.votes / pairQuota);
    const left = seats - Object.values(split).reduce((a, b) => a + b, 0);
    const done = dhondt(Object.fromEntries(members.map((m) => [m.id, m.votes])), split, left);
    Object.assign(final, done);
  }
  for (const p of parties) final[p.id] ??= 0;

  return { threshold, passed, quota, initial, final, remainderOrder: order };
}
