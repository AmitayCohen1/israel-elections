import { defineMessages } from "@/i18n/messages";
import { arCount, ruPlural } from "./plural";

const arWord = (n: number, f: [string, string, string, string]) => {
  const r = n % 100;
  return n === 1 ? f[0] : n === 2 ? f[1] : r >= 3 && r <= 10 ? f[2] : f[3];
};
const AR_DAY: [string, string, string, string] = ["يوم", "يومان", "أيام", "يومًا"];
const AR_HOUR: [string, string, string, string] = ["ساعة", "ساعتان", "ساعات", "ساعةً"];
const AR_MIN: [string, string, string, string] = ["دقيقة", "دقيقتان", "دقائق", "دقيقةً"];
const AR_SEC: [string, string, string, string] = ["ثانية", "ثانيتان", "ثوانٍ", "ثانيةً"];

/** Units of time, as a bare word that agrees with n (`dayWord`) or with the number in front of it (`days`). */
export const time = defineMessages(
  {
    dayWord: (n: number) => (n === 1 ? "יום" : "ימים"),
    hourWord: (n: number) => (n === 1 ? "שעה" : "שעות"),
    minWord: (n: number) => (n === 1 ? "דקה" : "דקות"),
    secWord: (n: number) => (n === 1 ? "שנייה" : "שניות"),
    days: (n: number) => (n === 1 ? "יום" : n === 2 ? "יומיים" : `${n} ימים`),
    hours: (n: number) => (n === 1 ? "שעה" : n === 2 ? "שעתיים" : `${n} שעות`),
    mins: (n: number) => (n === 1 ? "דקה" : n === 2 ? "שתי דקות" : `${n} דקות`),
  },
  {
    en: {
      dayWord: (n: number) => (n === 1 ? "day" : "days"),
      hourWord: (n: number) => (n === 1 ? "hour" : "hours"),
      minWord: (n: number) => (n === 1 ? "minute" : "minutes"),
      secWord: (n: number) => (n === 1 ? "second" : "seconds"),
      days: (n: number) => `${n} ${n === 1 ? "day" : "days"}`,
      hours: (n: number) => `${n} ${n === 1 ? "hour" : "hours"}`,
      mins: (n: number) => `${n} ${n === 1 ? "minute" : "minutes"}`,
    },
    ar: {
      dayWord: (n: number) => arWord(n, AR_DAY),
      hourWord: (n: number) => arWord(n, AR_HOUR),
      minWord: (n: number) => arWord(n, AR_MIN),
      secWord: (n: number) => arWord(n, AR_SEC),
      days: (n: number) => arCount(n, AR_DAY),
      hours: (n: number) => arCount(n, AR_HOUR),
      mins: (n: number) => arCount(n, AR_MIN),
    },
    ru: {
      dayWord: (n: number) => ruPlural(n, "день", "дня", "дней"),
      hourWord: (n: number) => ruPlural(n, "час", "часа", "часов"),
      minWord: (n: number) => ruPlural(n, "минута", "минуты", "минут"),
      secWord: (n: number) => ruPlural(n, "секунда", "секунды", "секунд"),
      days: (n: number) => `${n} ${ruPlural(n, "день", "дня", "дней")}`,
      hours: (n: number) => `${n} ${ruPlural(n, "час", "часа", "часов")}`,
      mins: (n: number) => `${n} ${ruPlural(n, "минута", "минуты", "минут")}`,
    },
    am: {
      dayWord: (n: number) => (n === 1 ? "ቀን" : "ቀናት"),
      hourWord: (n: number) => (n === 1 ? "ሰዓት" : "ሰዓታት"),
      minWord: (n: number) => (n === 1 ? "ደቂቃ" : "ደቂቃዎች"),
      secWord: (n: number) => (n === 1 ? "ሰከንድ" : "ሰከንዶች"),
      days: (n: number) => `${n} ${n === 1 ? "ቀን" : "ቀናት"}`,
      hours: (n: number) => `${n} ${n === 1 ? "ሰዓት" : "ሰዓታት"}`,
      mins: (n: number) => `${n} ${n === 1 ? "ደቂቃ" : "ደቂቃዎች"}`,
    },
  },
);
