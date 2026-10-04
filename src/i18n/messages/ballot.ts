import { defineMessages } from "@/i18n/messages";

/** The spoken name of a ballot slip, shared by the slip itself (client) and the list mark (server). */
export const ballot = defineMessages(
  { slip: (letters: string) => `פתק ${letters}` },
  {
    en: { slip: (letters: string) => `Ballot slip ${letters}` },
    ar: { slip: (letters: string) => `ورقة الاقتراع ${letters}` },
    ru: { slip: (letters: string) => `Бюллетень ${letters}` },
    am: { slip: (letters: string) => `የድምጽ መስጫ ወረቀት ${letters}` },
  },
);
