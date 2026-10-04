/** A line hourglass (24px grid, stroke 1.8, round caps) that turns over every few seconds. */
export function Hourglass({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`hourglass ${className}`}>
      <path d="M6 3h12M6 21h12" />
      <path d="M7.5 3c0 4.2 2.6 6 4.5 9-1.9 3-4.5 4.8-4.5 9M16.5 3c0 4.2-2.6 6-4.5 9 1.9 3 4.5 4.8 4.5 9" />
      <path d="M9.6 19.2h4.8" />
      <path d="M12 12v3" className="hourglass-sand" />
    </svg>
  );
}
