import type { TopicKey } from "@/lib/topics";

/**
 * One icon per topic, all drawn the same way: 24px grid, 1.8 stroke, round caps,
 * currentColor. Quiet line drawings, not emoji — the protocol is in DESIGN.md.
 */
const PATHS: Record<TopicKey, React.ReactNode> = {
  security: <path d="M12 3l7 2.8v5.4c0 4.4-2.9 7.4-7 9.3-4.1-1.9-7-4.9-7-9.3V5.8L12 3z" />,
  economy: (
    <>
      <rect x="3" y="7" width="18" height="11" rx="2" />
      <circle cx="12" cy="12.5" r="2.6" />
      <path d="M6.5 10.2v.01M17.5 14.8v.01" />
    </>
  ),
  religion_state: (
    <>
      <path d="M12 4.2l4.3 7H7.7l4.3-7z" />
      <path d="M12 19.8l4.3-7H7.7l4.3 7z" />
    </>
  ),
  judiciary: (
    <>
      <path d="M12 4.5v15M8.5 19.5h7M5.5 7h13" />
      <path d="M5.5 7l-2.4 5.2a2.9 2.9 0 005.8 0L6.5 7M18.5 7l-2.4 5.2a2.9 2.9 0 005.8 0L19.5 7" />
    </>
  ),
  housing: (
    <>
      <path d="M3.5 11L12 4.2 20.5 11" />
      <path d="M5.8 9.4V19.8h12.4V9.4" />
      <path d="M10 19.8v-5h4v5" />
    </>
  ),
  education: (
    <>
      <path d="M2.5 9.3L12 4.8l9.5 4.5L12 13.8 2.5 9.3z" />
      <path d="M6.3 11.5v4.2c0 1.4 2.6 2.8 5.7 2.8s5.7-1.4 5.7-2.8v-4.2M21.5 9.3v4.9" />
    </>
  ),
  welfare_health: (
    <>
      <path d="M12 19.8S4.6 15.4 3.2 10.9C2.3 7.9 4.5 5 7.4 5 9.8 5 12 7.2 12 7.2S14.2 5 16.6 5c2.9 0 5.1 2.9 4.2 5.9-1.4 4.5-8.8 8.9-8.8 8.9z" />
      <path d="M7 12h3l1.2-2.4 1.6 4 1.2-1.6h3" />
    </>
  ),
  governance: (
    <>
      <path d="M4 20h16M5.2 16.8h13.6" />
      <path d="M6.3 9.5v7.3M10.2 9.5v7.3M13.8 9.5v7.3M17.7 9.5v7.3" />
      <path d="M3.8 9.5h16.4L12 3.8 3.8 9.5z" />
    </>
  ),
};

export function TopicIcon({ topic, className = "size-5" }: { topic: TopicKey; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {PATHS[topic]}
    </svg>
  );
}
