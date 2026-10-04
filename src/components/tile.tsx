/**
 * america.gov's inner-page unit: a large quiet tile holding one object, and under it a single
 * caption line — a dark lead followed by grey text.
 */
export function Tile({ children, className = "bg-tile", compact = false }: { children: React.ReactNode; className?: string; compact?: boolean }) {
  return <div className={`relative grid place-items-center overflow-hidden ${compact ? "aspect-[4/3] rounded-[2.25rem] lg:aspect-square" : "aspect-[3/2] rounded-[3rem] sm:rounded-[4.3rem]"} ${className}`}>{children}</div>;
}

/** `compact` is for pages that set several tiles side by side and want each section to fit one screen. */
export function TileFigure({ lead, text, children, className, compact = false }: { lead: string; text: string; children: React.ReactNode; className?: string; compact?: boolean }) {
  return (
    <figure>
      <Tile className={className} compact={compact}>
        {children}
      </Tile>
      <figcaption className={compact ? "mt-4 max-w-[36rem] px-3 text-lg leading-snug" : "mt-7 max-w-[36rem] px-6 text-[1.3rem] leading-snug sm:px-8"}>
        <span className="text-ink">{lead}</span> <span className="text-ink-2">{text}</span>
      </figcaption>
    </figure>
  );
}

/** Section title: serif, set at the edge of the column. */
export function SectionTitle({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return <h2 className={compact ? "title pt-12 pb-5 text-2xl sm:pt-14 sm:text-3xl" : "serif pt-40 pb-14 text-5xl sm:pt-56 sm:text-[4rem]"}>{children}</h2>;
}
