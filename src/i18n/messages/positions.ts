import { defineMessages } from "@/i18n/messages";

/** Shared labels distinguish source quotations from our editorial summaries. */
export const positionLabels = defineMessages(
  { quote: "ציטוט מהמקור", summary: "תקציר שלנו", source: "למקור המלא" },
  {
    en: { quote: "Source quote", summary: "Our summary", source: "View the full source" },
    ar: { quote: "اقتباس من المصدر", summary: "ملخصنا", source: "إلى المصدر الكامل" },
    ru: { quote: "Цитата из источника", summary: "Наше краткое изложение", source: "Полный источник" },
    am: { quote: "ከምንጩ የተወሰደ ጥቅስ", summary: "የእኛ ማጠቃለያ", source: "ወደ ሙሉው ምንጭ" },
  },
);
