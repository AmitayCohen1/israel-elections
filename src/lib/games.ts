import "server-only";
import { loadAxes } from "@/lib/axes";
import { getDataset } from "@/lib/data";
import { listColor } from "@/lib/color";
import type { Locale } from "@/i18n/config";
import type { QAxis, QParty } from "@/lib/match";

/** The position map reshaped per party, for the quiz, the coalition builder and the closeness map. */
export async function loadMatchData(locale?: Locale): Promise<{ axes: QAxis[]; parties: QParty[] }> {
  const [raw, lists] = await Promise.all([loadAxes(), getDataset(locale)]);
  const axes: QAxis[] = raw.map((a) => ({ id: a.id, topic: a.topic, short: a.short, question: a.question, ordered: a.ordered, scale: a.scale }));
  const parties: QParty[] = lists
    // The main lists first, each group in ballot order: wherever only some parties fit, the main ones are the ones shown.
    .sort((a, b) => (a.tier === b.tier ? a.cec_order - b.cec_order : a.tier === "main" ? -1 : 1))
    .map((l) => {
      const p: QParty = { slug: l.slug, name: l.name, color: listColor(l.color), face: l.candidates[0]?.image_url ?? null, tier: l.tier, levels: {}, quotes: {} };
      for (const ax of raw) {
        const cell = ax.cells.find((c) => c.slug === l.slug);
        if (!cell) continue;
        p.levels[ax.id] = cell.level;
        p.quotes[ax.id] = { quote: cell.quote, source_url: cell.source_url };
      }
      return p;
    });
  return { axes, parties };
}
