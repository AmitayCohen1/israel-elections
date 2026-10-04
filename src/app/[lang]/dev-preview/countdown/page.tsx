import type { Metadata } from "next";
import { CountdownDial, CountdownDots, CountdownFlap, CountdownMonument, CountdownSentence } from "./variants";

export const metadata: Metadata = { title: "Dev preview · countdown options", robots: { index: false } };

const OPTIONS = [
  { id: "a", title: "Split-flap", note: "A quiet station-clock flap board: pale tiles on a soft frame, navy numerals; the old digit's top half falls and the new one's bottom half swings down to land.", el: <CountdownFlap /> },
  { id: "b", title: "Watch face", note: "Sixty ticks light up with the seconds, the inner ring keeps the minutes, and the days sit in the middle.", el: <CountdownDial /> },
  { id: "c", title: "Every day a dot", note: "One dot for each day of the campaign, from the Knesset dissolving to election day: the days gone are filled, today breathes, the last ring is the vote.", el: <CountdownDots /> },
  { id: "d", title: "Monument", note: "The days as an outlined numeral too big for its frame, with the clock set across it in a dark pill.", el: <CountdownMonument /> },
  { id: "e", title: "Sentence", note: "Not a clock at all: one sentence in the serif, the numbers marked by a highlighter that draws itself in.", el: <CountdownSentence /> },
];

export default function CountdownPreview() {
  return (
    <div className="mx-auto max-w-[72rem] px-5 pb-24 sm:px-10">
      <header className="pt-12 pb-10 text-center">
        <p className="text-base tracking-wide text-muted">פנימי · לא מפורסם באתר</p>
        <h1 className="serif mt-5 text-5xl sm:text-6xl">Countdown options</h1>
      </header>
      <div className="flex flex-col gap-8">
        {OPTIONS.map((o) => (
          <section key={o.id}>
            <div className="flex items-baseline gap-5 pb-4" dir="ltr">
              <span className="serif text-5xl uppercase">{o.id}</span>
              <div>
                <p className="text-xl font-medium">{o.title}</p>
                <p className="text-ink-2">{o.note}</p>
              </div>
            </div>
            <div className="rounded-[2.75rem] bg-mist px-8 py-14 sm:px-16">
              <h2 className="serif mb-8 text-[clamp(2.4rem,4vw,4rem)] leading-[0.95]">למי לעזאזל להצביע?</h2>
              {o.el}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
