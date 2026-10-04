/** The accordion arrow for a <details> row: points down while closed and turns up when its group opens. */
export function Chevron({ className = "size-8 bg-tile" }: { className?: string }) {
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-full transition ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-[45%] transition-transform duration-200 group-open:rotate-180">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}
