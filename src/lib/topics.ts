import type { Dictionary } from "@/i18n/dictionaries/he";

/** Keys and emoji are fixed; `label` is the Hebrew default. In any other language read the label from the dictionary with `topicLabel`. */
export const TOPICS = {
  security: { label: "ביטחון", emoji: "🛡️" },
  economy: { label: "כלכלה", emoji: "💸" },
  religion_state: { label: "דת", emoji: "🕍" },
  judiciary: { label: "משפט", emoji: "⚖️" },
  housing: { label: "דיור", emoji: "🏠" },
  education: { label: "חינוך", emoji: "🎓" },
  welfare_health: { label: "רווחה", emoji: "🩺" },
  governance: { label: "שלטון", emoji: "🏛️" },
} as const;

export type TopicKey = keyof typeof TOPICS;
export const TOPIC_KEYS = Object.keys(TOPICS) as TopicKey[];

export const SOURCE_TYPES: Record<string, string> = {
  platform: "מצע רשמי",
  party_site: "אתר המפלגה",
  official_statement: "הודעה רשמית",
  interview: "ראיון",
  news_report: "דיווח בתקשורת",
};

/** The topic's name in the dictionary's language. */
export const topicLabel = (dict: Pick<Dictionary, "topics">, key: TopicKey) => dict.topics[key];

/** A source type ("platform", "interview"...) in the dictionary's language; an unknown type is shown as it is. */
export const sourceTypeLabel = (dict: Pick<Dictionary, "sourceTypes">, type: string) => (dict.sourceTypes as Record<string, string>)[type] ?? type;
