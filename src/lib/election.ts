/** The election calendar, shared by the countdown, the October calendar and the timeline. */

import { defineMessages } from "@/i18n/messages";

export const ELECTION_DAY = "2026-10-27";

/** Polls open 07:00 Israel time; clocks are on winter time (UTC+2) by then. */
export const POLLS_OPEN = "2026-10-27T07:00:00+02:00";

export const EVENTS = [
  { date: "2026-07-17", id: "dissolve" },
  { date: "2026-09-08", id: "submit" },
  { date: "2026-09-27", id: "approve" },
  { date: "2026-10-13", id: "broadcasts" },
  { date: "2026-10-15", id: "abroad" },
  { date: ELECTION_DAY, id: "election" },
  { date: "2026-11-04", id: "results" },
  { date: "2026-11-18", id: "appeal" },
] as const;

export type EventId = (typeof EVENTS)[number]["id"];

/** The title and one line for each calendar event, in every language. */
export const eventText = defineMessages(
  {
    dissolve: { title: "פיזור הכנסת ה-25", text: "הכנסת מסיימת את כהונתה ויוצאת למערכת בחירות." },
    submit: { title: "הגשת הרשימות", text: "המועד האחרון להגשת רשימות המועמדים לוועדת הבחירות המרכזית." },
    approve: { title: "אישור הרשימות", text: "ועדת הבחירות מאשרת 38 רשימות ואת אותיות הפתקים." },
    broadcasts: { title: "שידורי התעמולה", text: "מתחילים 14 ימי תעמולת בחירות בטלוויזיה וברדיו." },
    abroad: { title: "הצבעה בנציגויות בחו״ל", text: "דיפלומטים ושליחי המדינה מצביעים בנציגויות ישראל בעולם." },
    election: { title: "יום הבחירות", text: "רוב הקלפיות פתוחות 07:00–22:00. יום שבתון." },
    results: { title: "התוצאות הרשמיות", text: "ועדת הבחירות מפרסמת את התוצאות הסופיות." },
    appeal: { title: "מועד אחרון לערעור", text: "מפלגות שהתמודדו יכולות לערער על התוצאות עד היום הזה." },
  },
  {
    en: {
      dissolve: { title: "Dissolution of the 25th Knesset", text: "The Knesset ends its term and heads into an election campaign." },
      submit: { title: "Submitting the lists", text: "The last day to submit candidate lists to the Central Elections Committee." },
      approve: { title: "Approving the lists", text: "The Elections Committee approves 38 lists and their ballot letters." },
      broadcasts: { title: "Campaign broadcasts", text: "14 days of election campaign broadcasts begin on television and radio." },
      abroad: { title: "Voting at missions abroad", text: "Diplomats and state emissaries vote at Israel's missions around the world." },
      election: { title: "Election day", text: "Most polling stations are open 07:00–22:00. A public holiday." },
      results: { title: "Official results", text: "The Elections Committee publishes the final results." },
      appeal: { title: "Appeal deadline", text: "Parties that ran can appeal the results until this day." },
    },
    ar: {
      dissolve: { title: "حلّ الكنيست الـ25", text: "ينهي الكنيست ولايته ويدخل في حملة انتخابية." },
      submit: { title: "تقديم القوائم", text: "آخر موعد لتقديم قوائم المرشحين إلى لجنة الانتخابات المركزية." },
      approve: { title: "المصادقة على القوائم", text: "تصادق لجنة الانتخابات على 38 قائمة وعلى حروف أوراق الاقتراع." },
      broadcasts: { title: "بثّ الدعاية الانتخابية", text: "تبدأ 14 يومًا من الدعاية الانتخابية في التلفزيون والإذاعة." },
      abroad: { title: "التصويت في البعثات في الخارج", text: "يصوّت الدبلوماسيون ومبعوثو الدولة في بعثات إسرائيل حول العالم." },
      election: { title: "يوم الانتخابات", text: "معظم مراكز الاقتراع مفتوحة من 07:00 حتى 22:00. يوم عطلة رسمية." },
      results: { title: "النتائج الرسمية", text: "تنشر لجنة الانتخابات النتائج النهائية." },
      appeal: { title: "آخر موعد للاستئناف", text: "يحق للأحزاب التي خاضت الانتخابات الاستئناف على النتائج حتى هذا اليوم." },
    },
    ru: {
      dissolve: { title: "Роспуск Кнессета 25-го созыва", text: "Кнессет завершает работу и уходит на предвыборную кампанию." },
      submit: { title: "Подача списков", text: "Последний срок подачи списков кандидатов в Центральную избирательную комиссию." },
      approve: { title: "Утверждение списков", text: "Избирательная комиссия утверждает 38 списков и буквенные обозначения на бюллетенях." },
      broadcasts: { title: "Агитационные эфиры", text: "Начинаются 14 дней предвыборной агитации на телевидении и радио." },
      abroad: { title: "Голосование в представительствах за рубежом", text: "Дипломаты и государственные посланники голосуют в представительствах Израиля по всему миру." },
      election: { title: "День выборов", text: "Большинство участков открыто с 07:00 до 22:00. Выходной день." },
      results: { title: "Официальные результаты", text: "Избирательная комиссия публикует окончательные результаты." },
      appeal: { title: "Крайний срок для обжалования", text: "Участвовавшие в выборах партии могут оспорить результаты до этого дня." },
    },
    am: {
      dissolve: { title: "የ25ኛው ክኔሴት መበተን", text: "ክኔሴቱ የሥራ ዘመኑን አጠናቅቆ ወደ ምርጫ ዘመቻ ይገባል።" },
      submit: { title: "ዝርዝሮችን ማስገባት", text: "የእጩ ዝርዝሮችን ለማዕከላዊ ምርጫ ኮሚቴ ለማስገባት የመጨረሻው ቀን።" },
      approve: { title: "ዝርዝሮችን ማጽደቅ", text: "የምርጫ ኮሚቴው 38 ዝርዝሮችንና የምርጫ ወረቀት ፊደላትን ያጸድቃል።" },
      broadcasts: { title: "የምርጫ ዘመቻ ስርጭቶች", text: "ለ14 ቀናት የሚቆይ የምርጫ ዘመቻ በቴሌቪዥንና በሬዲዮ ይጀምራል።" },
      abroad: { title: "በውጭ አገር ተወካይ ጽሕፈት ቤቶች ድምፅ መስጠት", text: "ዲፕሎማቶችና የመንግሥት ተወካዮች በእስራኤል የውጭ አገር ተወካይ ጽሕፈት ቤቶች ድምፅ ይሰጣሉ።" },
      election: { title: "የምርጫ ቀን", text: "አብዛኞቹ የምርጫ ጣቢያዎች ከ07:00 እስከ 22:00 ክፍት ናቸው። የዕረፍት ቀን ነው።" },
      results: { title: "ይፋዊ ውጤት", text: "የምርጫ ኮሚቴው የመጨረሻውን ውጤት ያትማል።" },
      appeal: { title: "የይግባኝ የመጨረሻ ቀን", text: "የተወዳደሩ ፓርቲዎች እስከዚህ ቀን ድረስ በውጤቱ ላይ ይግባኝ ማለት ይችላሉ።" },
    },
  },
);

export const MS_DAY = 86_400_000;

/** Today's date in Israel as YYYY-MM-DD, for a given instant. */
export const israelDate = (ms: number) => new Date(ms).toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });

/** Whole-day index of a YYYY-MM-DD string, so two dates can be subtracted. */
export const dayIndex = (iso: string) => Date.parse(iso) / MS_DAY;
