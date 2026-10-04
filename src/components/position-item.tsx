import type { Position } from "@/lib/data";
import { getDictionary, getIntl, getMessages } from "@/i18n";
import { positionLabels } from "@/i18n/messages/positions";

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** The original quote first, then where it was said, then our neutral wording of it. */
export async function PositionItem({ p }: { p: Position }) {
  const [dict, intl, t] = await Promise.all([getDictionary(), getIntl(), getMessages(positionLabels)]);
  const types: Record<string, string> = dict.sourceTypes;
  return (
    <li>
      <blockquote className="border-s-2 border-ink/20 ps-4 text-xl leading-snug">”{p.quote}“</blockquote>
      <a href={p.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-base text-accent underline-offset-4 hover:underline">
        {t.source} · {p.source_type && `${types[p.source_type] ?? p.source_type} · `}
        {p.source_title || host(p.source_url)}
        {p.source_date && ` · ${new Date(p.source_date).toLocaleDateString(intl)}`} ↗
      </a>
      <p className="mt-3 text-base leading-snug text-ink-2">
        <span className="text-base font-semibold text-muted">{t.summary}: </span>
        {p.point}
      </p>
    </li>
  );
}
