import { getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";

const m = defineMessages(
  { label: "דגל ישראל" },
  { en: { label: "Flag of Israel" }, ar: { label: "علم إسرائيل" }, ru: { label: "Флаг Израиля" }, am: { label: "የእስራኤል ባንዲራ" } },
);

/** The flag of Israel, drawn to its 8:11 proportions. */
export async function Flag({ className = "" }: { className?: string }) {
  const t = await getMessages(m);
  return (
    <svg viewBox="0 0 220 160" className={className} role="img" aria-label={t.label}>
      <rect width="220" height="160" fill="#fff" />
      <rect y="15" width="220" height="25" fill="#0038b8" />
      <rect y="120" width="220" height="25" fill="#0038b8" />
      <g fill="none" stroke="#0038b8" strokeWidth="5.5">
        <path d="M110 49 136.85 95.5H83.15Z" />
        <path d="M110 111 136.85 64.5H83.15Z" />
      </g>
    </svg>
  );
}
