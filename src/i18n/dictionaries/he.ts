/** The base dictionary. Its shape is the index: every other language must have exactly these keys. */
export const he = {
  meta: {
    title: "למי להצביע? · בחירות 2026",
    titleTemplate: "%s · למי להצביע?",
    description: "כל המפלגות וכל המועמדים לכנסת ה-26 במקום אחד: מי ברשימה, באיזה מקום, מה הם אומרים — עם מקורות.",
  },
  ui: {
    brand: "למי להצביע?",
    homeAria: "למי להצביע? — דף הבית",
    blurb: "אתר עצמאי ולא מפלגתי. הנתונים מוועדת הבחירות המרכזית, מהכנסת ומוויקיפדיה.",
    viewsAria: "תצוגות",
    moreAria: "עוד",
    searchShort: "חיפוש מועמד",
    searchLong: "חפשו מועמד לפי שם",
    searchAria: "חיפוש מועמד לפי שם",
    searchBtn: "חיפוש",
    nfTitle: "העמוד לא נמצא",
    nfBody: "לא מצאנו את העמוד שחיפשתם.",
    nfCta: "לכל המפלגות",
    language: "שפה",
  },
  nav: {
    home: "סקירה",
    topics: "נושאים",
    map: "מפת עמדות",
    people: "ראשי מפלגות",
    lists: "מפלגות",
    vote: "מדריך הצבעה",
    about: "מקורות ושיטה",
    resources: "קישורים רשמיים",
    contact: "יצירת קשר",
  },
  topics: {
    security: "ביטחון",
    economy: "כלכלה",
    religion_state: "דת",
    judiciary: "משפט",
    housing: "דיור",
    education: "חינוך",
    welfare_health: "רווחה",
    governance: "שלטון",
  },
  sourceTypes: {
    platform: "מצע רשמי",
    party_site: "אתר המפלגה",
    official_statement: "הודעה רשמית",
    interview: "ראיון",
    news_report: "דיווח בתקשורת",
  },
};

export type Dictionary = typeof he;
