import Image from "next/image";
import Link from "@/i18n/link";
import { getDataset } from "@/lib/data";
import { TOPICS, TOPIC_KEYS } from "@/lib/topics";
import { topicItems } from "@/components/topic-panels";
import { leaderEntry } from "@/lib/leaders";
import { faces } from "@/lib/faces";
import { Card } from "@/components/card";
import { Avatar } from "@/components/avatar";
import { GuideGate } from "@/components/guide-gate";
import { TopicChat } from "@/components/topic-chat";
import { QuoteWall } from "@/components/quote-wall";
import { TopicStage } from "@/components/topic-stage";
import { PersonStrip } from "@/components/person-strip";
import { DeckFeature, Directory, Mosaic, PersonFile, RoundTable, Spotlight, TopicCarousel, Versus } from "./variants";

/** A labelled frame for one option; every option is drawn at the size the card has on the dashboard. */
function Option({ k, title, note, children, tall = true }: { k: string; title: string; note: string; children: React.ReactNode; tall?: boolean }) {
  return (
    <section>
      <h3 className="mb-2 flex items-baseline gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-ink text-base text-white">{k}</span>
        <span className="title text-lg">{title}</span>
        <span className="text-base text-ink-2">{note}</span>
      </h3>
      <div className={tall ? "h-[34rem]" : "h-[19rem]"}>{children}</div>
    </section>
  );
}

function Group({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <div className="mt-16">
      <h2 className="serif text-4xl">{title}</h2>
      <p className="mt-1 mb-6 text-lg text-ink-2">{note}</p>
      <div className="grid gap-8 xl:grid-cols-2">{children}</div>
    </div>
  );
}

const take = (text: string, max = 150) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  return stop > max * 0.5 ? cut.slice(0, stop + 1) : cut.slice(0, cut.lastIndexOf(" ")) + "…";
};

/** Four options for each of the overview's three cards, on real data. */
export default async function CardOptions() {
  const lists = await getDataset();
  const sorted = [...lists].sort((a, b) => a.cec_order - b.cec_order);
  const byList = new Map(lists.map((l) => [l.slug, l]));
  const candidates = lists.reduce((n, l) => n + l.candidates.length, 0);

  const chatTopics = TOPIC_KEYS.map((key) => ({
    key,
    label: TOPICS[key].label,
    art: `/media/illustrations/topics/${key}.png`,
    rows: topicItems(sorted, key)
      .filter((r) => r.gist)
      .map((r) => {
        const l = byList.get(r.id);
        const lead = l?.candidates[0];
        return { id: r.id, name: r.name, text: take(l?.platform?.topic_digests?.[key] ?? (r.gist as string)), face: { name: lead?.display_name ?? r.name, src: lead?.image_url ?? null, color: l?.color ?? null } };
      }),
  }));
  const wallQuotes = [0, 4].flatMap((n) =>
    chatTopics.map((t, k) => {
      const r = t.rows[(k * 3 + n) % t.rows.length];
      return { id: `${t.key}-${r.id}`, href: `/topics#${t.key}:${r.id}`, party: r.name, topic: t.label, art: t.art, text: r.text, face: r.face };
    }),
  );

  const entries = await Promise.all(sorted.filter((l) => l.tier === "main").map(leaderEntry));
  const strip = entries
    .map((e) => ({ e, p: e.people[0] }))
    .filter(({ p }) => p.facts.length >= 2)
    .slice(0, 8)
    .map(({ e, p }) => ({ slug: e.slug, name: p.name, party: e.listName, color: e.color, img: p.img, headline: p.line, facts: p.facts.slice(0, 3).map((f) => ({ label: f.label, value: take(f.value, 60) })) }));
  const deckFaces = faces(lists, 13, 9).map((f) => ({ src: f.src, name: f.name }));
  const mosaic = faces(lists, 24, 2).map((f) => ({ src: f.src, name: f.name, list: f.list, sub: f.sub }));
  const mainLists = sorted.filter((l) => l.tier === "main");

  return (
    <div className="p-6 pb-24 sm:p-10">
      <h1 className="serif text-5xl">אפשרויות לכרטיסי הסקירה</h1>
      <p className="mt-2 text-xl text-ink-2">שמונה גרסאות לעמדות, שמונה לאנשים ושלוש למדריך. נתונים אמיתיים, בגודל שהם מקבלים בלוח.</p>

      <Group title="עמדות המפלגות" note="קטגוריה קופצת, ומה כל מפלגה חושבת עליה.">
        <Option k="A" title="צ'אט" note="שאלה, הקלדה, ארבע מפלגות עונות, ושוב.">
          <Card className="h-full" title="עמדות המפלגות" note="8 נושאים" href="/topics">
            <TopicChat topics={chatTopics} />
          </Card>
        </Option>
        <Option k="B" title="קרוסלה" note="נושא אחד גדול עם האיור שלו, שלוש מפלגות מתחתיו, גולש הצידה.">
          <Card className="h-full" title="עמדות המפלגות" note="8 נושאים" href="/topics">
            <TopicCarousel topics={chatTopics} />
          </Card>
        </Option>
        <Option k="C" title="שולחן עגול" note="הנושא באמצע, מנהיגי המפלגות סביבו, וכל אחד בתורו מדבר.">
          <Card className="h-full" title="עמדות המפלגות" note="8 נושאים" href="/topics">
            <RoundTable topics={chatTopics} />
          </Card>
        </Option>
        <Option k="D" title="קיר ציטוטים" note="ציטוטים בכל הנושאים עולים למעלה בלי הפסקה; כל אחד עם הפנים והנושא.">
          <Card className="h-full" title="עמדות המפלגות" note="8 נושאים" href="/topics">
            <QuoteWall quotes={wallQuotes} />
          </Card>
        </Option>
        <Option k="E" title="מי ענה על מה" note="שמונה שורות: הנושא עם האיור שלו, והפנים של כל המפלגות שכתבו עליו. בלי תנועה.">
          <Card className="h-full" title="עמדות המפלגות" note="8 נושאים" href="/topics">
            <ul className="grid h-full content-between">
              {chatTopics.map((t) => (
                <li key={t.key}>
                  <Link href={`/topics#${t.key}`} className="flex items-center gap-3 rounded-2xl px-1 py-1 hover:bg-paper/70">
                    <Image src={t.art} alt="" width={96} height={96} className="size-11 shrink-0 object-contain mix-blend-multiply" />
                    <span className="title w-16 shrink-0 text-lg">{t.label}</span>
                    <span className="flex min-w-0 flex-1" dir="ltr">
                      {t.rows.slice(0, 9).map((r, k) => (
                        <span key={r.id} title={r.name} className={`block shrink-0 overflow-hidden rounded-full ring-2 ring-mist ${k ? "-ml-2" : ""}`}>
                          <Avatar name={r.face.name} src={r.face.src} color={r.face.color} size={32} />
                        </span>
                      ))}
                    </span>
                    <span className="shrink-0 text-base text-ink-2 tabular-nums">{t.rows.length} מפלגות</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </Option>
        <Option k="F" title="זרקור" note="ציטוט אחד גדול בסריף, של מפלגה אחת על נושא אחד; הנושאים כשורת מילים מעליו.">
          <Card className="h-full" title="עמדות המפלגות" note="8 נושאים" href="/topics">
            <Spotlight topics={chatTopics} />
          </Card>
        </Option>
        <Option k="G" title="זו מול זו" note="נושא אחד, שתי מפלגות זו לצד זו. הזוג מתחלף, ואז הנושא.">
          <Card className="h-full" title="עמדות המפלגות" note="8 נושאים" href="/topics">
            <Versus topics={chatTopics} />
          </Card>
        </Option>
        <Option k="H" title="אינדקס" note="שמונה שורות שקטות: נושא, ומשפט אחד של מפלגה אחת. בלי תנועה, כמו שאר האתר.">
          <Card className="h-full" title="עמדות המפלגות" note="8 נושאים" href="/topics">
            <ul className="grid h-full content-between divide-y divide-ink/10 border-t border-ink/10">
              {chatTopics.map((t, k) => {
                const r = t.rows[k % t.rows.length];
                return (
                  <li key={t.key}>
                    <Link href={`/topics#${t.key}`} className="flex items-baseline gap-4 py-2 hover:bg-paper/60">
                      <span className="title w-16 shrink-0 text-lg">{t.label}</span>
                      <span className="line-clamp-1 min-w-0 flex-1 text-base text-ink-2">
                        <span className="text-ink">{r.name}:</span> {r.text}
                      </span>
                      <span className="shrink-0 text-base text-ink-2 tabular-nums">+{t.rows.length - 1}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        </Option>
        <Option k="I" title="הקטגוריה היא הכותרת" note="בסקירה עכשיו: הכותרת היא הנושא עם האיור שלו, שלוש מפלגות עונות ועומדות במקום, ואז הנושא הבא.">
          <TopicStage className="h-full" topics={chatTopics} />
        </Option>
      </Group>

      <Group title="אנשים" note="הרבה פנים, ושיש מידע על כל אחד.">
        <Option k="A" title="אדם + רשימה" note="בסקירה עכשיו: אדם אחד בגדול, ומתחתיו רשימה שעומדת במקום; ההדגשה זזה קדימה ואחורה.">
          <Card className="h-full" title="אנשים" note={`${candidates.toLocaleString("he-IL")} מועמדים, ולכל אחד עמוד`} href="/people">
            <PersonStrip people={strip} />
          </Card>
        </Option>
        <Option k="B" title="חבילה" note="שורה ארוכה של פנים חופפות, ומתחתיה כרטיס אחד עם העובדות.">
          <Card className="h-full" title="אנשים" note={`${candidates.toLocaleString("he-IL")} מועמדים`} href="/people">
            <DeckFeature faces={deckFaces} people={strip} />
          </Card>
        </Option>
        <Option k="C" title="מדריך" note="רשת פנים עם שמות; אחד נדלק כל כמה שניות ומתחתיה מה שיש עליו.">
          <Card className="h-full" title="אנשים" note={`${candidates.toLocaleString("he-IL")} מועמדים`} href="/people">
            <Directory people={strip} />
          </Card>
        </Option>
        <Option k="D" title="טיקר אנכי" note="שורות של אנשים עולות בלי הפסקה: פנים, שם, מפלגה ועובדה אחת.">
          <Card className="h-full" title="אנשים" note={`${candidates.toLocaleString("he-IL")} מועמדים`} href="/people">
            <div className="marquee-wall relative h-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]">
              <ul className="marquee-y grid gap-2">
                {[...strip, ...strip].map((p, i) => (
                  <li key={`${p.slug}-${i}`} aria-hidden={i >= strip.length} className="flex items-center gap-3 rounded-2xl bg-paper p-3">
                    <Avatar name={p.name} src={p.img} color={p.color} size={52} />
                    <span className="min-w-0">
                      <span className="block truncate">
                        <span className="title text-lg">{p.name}</span>
                        <span className="text-base text-ink-2"> · {p.party}</span>
                      </span>
                      <span className="block truncate text-base text-ink-2">{p.facts[0]?.value}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </Option>
        <Option k="E" title="מוזאיקה" note="רשת צפופה של פנים שממלאת את הכרטיס; אחד מואר בכל פעם, ושורה מתחת אומרת מי זה.">
          <Card className="h-full" title="אנשים" note={`${candidates.toLocaleString("he-IL")} מועמדים`} href="/people">
            <Mosaic faces={mosaic} />
          </Card>
        </Option>
        <Option k="F" title="תיק" note="דיוקן אחד גדול, ולצדו רשימת סימון של מה שיש לנו עליו. שורת פנים קטנות לבחירה.">
          <Card className="h-full" title="אנשים" note="מה אנחנו יודעים על כל אחד" href="/people">
            <PersonFile people={strip} />
          </Card>
        </Option>
        <Option k="G" title="לפי מפלגה" note="שורה לכל מפלגה: השם, חמשת הראשונים שלה, וכמה מועמדים יש לה. בלי תנועה.">
          <Card className="h-full" title="אנשים" note={`${candidates.toLocaleString("he-IL")} מועמדים ב-${lists.length} מפלגות`} href="/people">
            <ul className="grid h-full content-between divide-y divide-ink/10 border-t border-ink/10">
              {mainLists.slice(0, 8).map((l) => (
                <li key={l.slug}>
                  <Link href={`/lists/${l.slug}`} className="flex items-center gap-3 py-1.5 hover:bg-paper/60">
                    <span className="title w-36 shrink-0 truncate text-base">{l.name}</span>
                    <span className="flex flex-1" dir="ltr">
                      {l.candidates.slice(0, 5).map((c, k) => (
                        <span key={c.position} title={c.display_name} className={`block overflow-hidden rounded-full ring-2 ring-mist ${k ? "-ml-2" : ""}`}>
                          <Avatar name={c.display_name} src={c.image_url} color={l.color} size={36} />
                        </span>
                      ))}
                    </span>
                    <span className="shrink-0 text-base text-ink-2 tabular-nums">{l.candidates.length} מועמדים</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </Option>
        <Option k="H" title="אינדקס עם תגיות" note="שורות שקטות: אדם, מפלגה, ותגיות של סוגי המידע שיש לנו עליו. בלי תנועה.">
          <Card className="h-full" title="אנשים" note="מה אנחנו יודעים על כל אחד" href="/people">
            <ul className="grid h-full content-between divide-y divide-ink/10 border-t border-ink/10">
              {strip.slice(0, 7).map((p) => (
                <li key={p.slug}>
                  <Link href={`/lists/${p.slug}/1`} className="flex items-center gap-3 py-2 hover:bg-paper/60">
                    <Avatar name={p.name} src={p.img} color={p.color} size={40} />
                    <span className="w-32 shrink-0">
                      <span className="title block truncate text-base leading-tight">{p.name}</span>
                      <span className="block truncate text-base text-ink-2">{p.party}</span>
                    </span>
                    <span className="flex min-w-0 flex-1 flex-wrap justify-end gap-1.5">
                      {p.facts.map((f, k) => (
                        <span key={k} className="rounded-full bg-paper px-2.5 py-0.5 text-base text-ink-2">
                          {f.label}
                        </span>
                      ))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </Option>
      </Group>

      <Group title="המדריך" note="שער, לא סיכום: קישור אחד יפה לעמוד המדריך. בלי תוכן לקרוא.">
        <Option tall={false} k="A" title="מצויר" note="בסקירה עכשיו: השם, שורה אחת, כפתור, והסרטון של הפתק והקלפי.">
          <GuideGate className="h-full" />
        </Option>
        <Option tall={false} k="B" title="כחול" note="אותו שער על כחול, בלי איור: הכרטיס שבולט מכל השאר.">
          <GuideGate look="blue" className="h-full" />
        </Option>
        <Option tall={false} k="C" title="שורה שקטה" note="הכי פשוט: שורה אפורה אחת עם חץ. משאיר יותר מקום לשני הכרטיסים האחרים.">
          <GuideGate look="quiet" />
        </Option>
      </Group>

      <p className="mt-16 text-ink-2">
        <Link href="/" className="underline underline-offset-4">
          חזרה לסקירה
        </Link>
      </p>
    </div>
  );
}
