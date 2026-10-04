import { distance, type QAxis, type QParty } from "@/lib/match";

/** Over all questions, parties need this many coded ones to be placed, and a pair this many shared ones for its distance to count. A single topic has fewer questions, so there the bar is lower (see `layout`). */
export const MIN_CODED = 3;
const MIN_SHARED = 2;
const GAP = 0.11; // the least room between two faces, in the layout's [0, 1] units

export type SpacePoint = { slug: string; x: number; y: number; near: { slug: string; close: number; shared: number }[] };

/** A small deterministic random source, so the layout is the same on every build. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

/**
 * Lays the parties out on a plane so that the distances between them follow their distances on the position map's questions
 * as closely as possible (stress minimisation). Pairs that share too few questions pull on nothing. The axes of the
 * result mean nothing; it is centred, scaled to [0, 1] and turned so its longest spread runs across.
 */
export function layout(axes: QAxis[], parties: QParty[], { topic = false } = {}): SpacePoint[] {
  // One topic holds one or two questions: a single coded answer there is enough to place a party and to compare a pair.
  const minCoded = topic ? 1 : Math.min(MIN_CODED, axes.length);
  const minShared = topic ? 1 : Math.min(MIN_SHARED, axes.length);
  const ps = parties.filter((p) => axes.filter((a) => a.id in p.levels).length >= minCoded);
  if (ps.length < 2) return [];
  const n = ps.length;
  const D: number[][] = [];
  const W: number[][] = [];
  for (let i = 0; i < n; i++) {
    D.push([]);
    W.push([]);
    for (let j = 0; j < n; j++) {
      const r = distance(axes, ps[i], ps[j]);
      const ok = i !== j && r.d != null && r.shared >= minShared;
      D[i].push(ok ? r.d! : 0);
      W[i].push(ok ? r.shared / axes.length : 0);
    }
  }

  const stress = (X: number[][]) => {
    let s = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (W[i][j]) s += W[i][j] * (Math.hypot(X[i][0] - X[j][0], X[i][1] - X[j][1]) - D[i][j]) ** 2;
    return s;
  };

  let best: number[][] = [];
  let bestS = Infinity;
  for (let seed = 1; seed <= 12; seed++) {
    const r = rng(seed);
    const X = ps.map(() => [r() - 0.5, r() - 0.5]);
    for (let it = 0, lr = 0.08; it < 3000; it++, lr *= 0.9995) {
      const G = X.map(() => [0, 0]);
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          if (!W[i][j]) continue;
          const dx = X[i][0] - X[j][0];
          const dy = X[i][1] - X[j][1];
          const dist = Math.hypot(dx, dy) || 1e-6;
          const g = (W[i][j] * (dist - D[i][j])) / dist;
          G[i][0] += g * dx;
          G[i][1] += g * dy;
        }
      for (let i = 0; i < n; i++) {
        X[i][0] -= lr * G[i][0];
        X[i][1] -= lr * G[i][1];
      }
    }
    const s = stress(X);
    if (s < bestS) [bestS, best] = [s, X];
  }

  // Centre, turn the longest spread to run across, then fit into [0, 1] keeping proportions.
  const cx = best.reduce((a, p) => a + p[0], 0) / n;
  const cy = best.reduce((a, p) => a + p[1], 0) / n;
  let sxx = 0, syy = 0, sxy = 0;
  for (const [x, y] of best) {
    sxx += (x - cx) ** 2;
    syy += (y - cy) ** 2;
    sxy += (x - cx) * (y - cy);
  }
  const th = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const R = best.map(([x, y]) => [(x - cx) * Math.cos(th) + (y - cy) * Math.sin(th), -(x - cx) * Math.sin(th) + (y - cy) * Math.cos(th)]);
  const span = Math.max(...R.map((p) => Math.abs(p[0])), ...R.map((p) => Math.abs(p[1])), 1e-6);

  const P = R.map(([x, y]) => [0.5 + x / span / 2, 0.5 + y / span / 2]);

  // Parties with the same answers land on the same spot: push them apart until each face has room, so a shared answer
  // reads as a tight group. Ties break by a fixed nudge, so the result is the same every time.
  for (let it = 0; it < 200; it++) {
    let moved = false;
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const dx = P[j][0] - P[i][0];
        const dy = P[j][1] - P[i][1];
        const d = Math.hypot(dx, dy);
        if (d >= GAP) continue;
        // The direction to push along: apart along the line between them, or a fixed angle when they sit exactly on each other.
        const [ux, uy] = d > 1e-6 ? [dx / d, dy / d] : [Math.cos(1 + i * 2.4 + j), Math.sin(1 + i * 2.4 + j)];
        const push = (GAP - d) / 2;
        P[i][0] -= ux * push;
        P[i][1] -= uy * push;
        P[j][0] += ux * push;
        P[j][1] += uy * push;
        moved = true;
      }
    if (!moved) break;
  }

  return ps.map((p, i) => ({
    slug: p.slug,
    x: P[i][0],
    y: P[i][1],
    near: ps
      .map((q, j) => ({ slug: q.slug, close: 1 - D[i][j], shared: W[i][j] ? distance(axes, p, q).shared : 0 }))
      .filter((r) => r.slug !== p.slug && r.shared >= minShared)
      .sort((a, b) => b.close - a.close || b.shared - a.shared)
      .slice(0, 4),
  }));
}
