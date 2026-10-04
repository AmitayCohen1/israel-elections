import { Chevron } from "@/components/chevron";

/** A quiet row that opens. Rows sharing a `name` close each other. */
export function AccRow({
  name,
  title,
  sub,
  meta,
  lead,
  open,
  children,
}: {
  name?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  meta?: React.ReactNode;
  lead?: React.ReactNode;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details name={name} open={open} className="group border-b border-line">
      <summary className="flex cursor-pointer items-center gap-4 py-4">
        {lead}
        <span className="flex-1">
          <span className="title block text-xl">{title}</span>
          {sub && <span className="mt-1 block text-base text-ink-2">{sub}</span>}
        </span>
        {meta && <span className="shrink-0 text-base text-ink-2">{meta}</span>}
        <Chevron className="size-8 bg-tile" />
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}

/** Same row, nothing to open. */
export function AccEmpty({ title, lead, note }: { title: React.ReactNode; lead?: React.ReactNode; note: string }) {
  return (
    <div className="flex items-center gap-4 border-b border-line py-4 opacity-45">
      {lead}
      <span className="title flex-1 text-xl">{title}</span>
      <span className="shrink-0 text-base">{note}</span>
    </div>
  );
}
