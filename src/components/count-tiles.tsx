import { getMessages } from "@/i18n";
import { defineMessages } from "@/i18n/messages";
import { TileFigure } from "@/components/tile";

const m = defineMessages(
  {
    thresholdLead: "אחוז החסימה.",
    thresholdText: "מפלגה שקיבלה פחות מ-3.25% מהקולות לא נכנסת לכנסת. בפועל, כארבעה מנדטים.",
    seatsLead: "120 מושבים, 61 לרוב.",
    seatsText: "מחלקים את קולות המפלגות שעברו ב-120. התוצאה היא ״המודד״: כמה קולות שווה מנדט אחד.",
  },
  {
    en: {
      thresholdLead: "The electoral threshold.",
      thresholdText: "A party that gets less than 3.25% of the votes does not enter the Knesset. In practice, that is about four seats.",
      seatsLead: "120 seats, 61 for a majority.",
      seatsText: "The votes of the parties that passed are divided by 120. The result is the “quota”: how many votes one seat is worth.",
    },
    ar: {
      thresholdLead: "نسبة الحسم.",
      thresholdText: "الحزب الذي ينال أقل من 3.25% من الأصوات لا يدخل الكنيست. عمليًا، هذا نحو أربعة مقاعد.",
      seatsLead: "120 مقعدًا، و61 للأغلبية.",
      seatsText: "تُقسَم أصوات الأحزاب التي تجاوزت النسبة على 120. والناتج هو «المقسوم الانتخابي»: كم صوتًا يساوي مقعدًا واحدًا.",
    },
    ru: {
      thresholdLead: "Электоральный барьер.",
      thresholdText: "Партия, получившая менее 3,25% голосов, в Кнессет не попадает. На практике это около четырёх мандатов.",
      seatsLead: "120 мест, 61 — большинство.",
      seatsText: "Голоса прошедших партий делятся на 120. Результат — «квота»: сколько голосов стоит один мандат.",
    },
    am: {
      thresholdLead: "የማለፊያ ገደብ።",
      thresholdText: "ከድምጹ ከ3.25% በታች ያገኘ ፓርቲ ወደ ክኔሴት አይገባም። በተግባር ይህ ወደ አራት መቀመጫዎች ነው።",
      seatsLead: "120 መቀመጫዎች፣ ለአብላጫው 61።",
      seatsText: "ያለፉት ፓርቲዎች ድምጾች ለ120 ይካፈላሉ። ውጤቱም «ማካፈያው» ነው፤ አንድ መቀመጫ ስንት ድምጽ እንደሚያወጣ።",
    },
  },
);

/** The threshold and the 120 seats, as two guide tiles; the dots fill in as the tile scrolls into view. */
export async function CountTiles() {
  const t = await getMessages(m);
  return (
    <div className="grid gap-x-4 gap-y-20 md:grid-cols-2">
      <TileFigure className="bg-accent" lead={t.thresholdLead} text={t.thresholdText}>
        <p className="serif text-[clamp(4.5rem,9vw,9.5rem)] text-white" dir="ltr">
          3.25%
        </p>
      </TileFigure>
      <TileFigure className="bg-tile" lead={t.seatsLead} text={t.seatsText}>
        <div className="seats-grid grid grid-cols-15 gap-2 sm:gap-2.5">
          {Array.from({ length: 120 }, (_, i) => (
            <span key={i} style={{ "--i": i } as React.CSSProperties} className={`seat size-3 rounded-full sm:size-4 ${i < 61 ? "bg-ink" : "bg-ink/15"}`} />
          ))}
        </div>
      </TileFigure>
    </div>
  );
}
