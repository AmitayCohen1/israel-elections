/** A direction glyph written for right-to-left reading (← forward, ↖ up and out) that mirrors itself in left-to-right languages. */
export function Arrow({ children = "←", className = "" }: { children?: string; className?: string }) {
  return (
    <span aria-hidden className={`inline-block ltr:-scale-x-100 ${className}`}>
      {children}
    </span>
  );
}
