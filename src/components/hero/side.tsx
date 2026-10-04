"use client";

import Link from "@/i18n/link";
import { SearchBox } from "@/components/search-box";
import { DaysLeft } from "@/components/countdown";
import { TopicIllustration } from "@/components/illustration";
import { TOPICS, TOPIC_KEYS } from "@/lib/topics";
import { Lead } from "./face";
import { FairNote, useFair, useTopic, type Stance, type StancesByTopic } from "./topics";

/** Our content on the start side (right, in Hebrew): the words and the search. The topics live opposite. */
export function Words({ counts }: { counts: string }) {
  return (
    <div>
      <p className="text-lg text-ink-2">
        <DaysLeft /> · 27 באוקטובר 2026
      </p>
      <h1 className="serif mt-5 text-[clamp(3.4rem,6.2vw,7rem)] leading-[0.95] text-balance">למי לעזאזל להצביע?</h1>
      <p className="mt-6 max-w-lg text-2xl leading-snug text-ink-2">נושא אחרי נושא: מה כל רשימה אומרת עליו.</p>
      <div className="mt-9 max-w-[36rem]">
        <SearchBox size="lg" />
      </div>
      <p className="mt-5 text-ink-2">{counts}</p>
    </div>
  );
}

const CANVAS = "mx-auto grid max-w-[104rem] items-center gap-12 overflow-hidden rounded-[2.75rem] bg-mist px-6 py-12 sm:px-12 lg:grid-cols-2 lg:gap-10 lg:px-20 lg:py-14";

function Line({ s, i = 0, delay = false }: { s: Stance; i?: number; delay?: boolean }) {
  return (
    <Link href={`/lists/${s.slug}#positions`} style={delay ? { animationDelay: `${250 + i * 170}ms` } : undefined} className={`group flex items-start gap-3.5 ${delay ? "card-in" : ""}`}>
      <Lead l={{ ...s, faces: s.face ? [s.face] : [] }} sizes="48px" className="mt-0.5 size-10 shrink-0 rounded-full bg-tile text-base" />
      <span className="min-w-0 text-lg leading-snug">
        <span className="title underline-offset-4 group-hover:underline">{s.name}</span>
        <span className="block text-ink-2 text-pretty">{s.text}</span>
      </span>
    </Link>
  );
}

/**
 * U. Card: one white card on the grey, left of the words. The topic arrives with its painted
 * object, then four parties say their piece one after another, then the next topic.
 */
export function HeroCard2({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  const { topic, step, hover } = useTopic();
  const fair = useFair(stances);
  const say = fair.take(topic, 4, step);
  return (
    <section className="px-3 pb-10 sm:px-6">
      <div className={CANVAS}>
        <Words counts={counts} />
        <div className="mx-auto w-full max-w-[34rem] select-none" {...hover}>
          <div key={topic} className="rounded-[2.5rem] bg-paper p-7 shadow-[0_50px_90px_-60px_rgb(0_12_31/0.4)]">
            <div className="card-in flex items-center gap-4 border-b border-line pb-5">
              <TopicIllustration topic={topic} className="!mx-0 !w-24 shrink-0" />
              <div>
                <p className="text-ink-2">מה הרשימות אומרות על</p>
                <p className="serif text-5xl leading-none">{TOPICS[topic].label}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4">{say.map((s, i) => <Line key={s.slug} s={s} i={i} delay />)}</div>
          </div>
          <div aria-hidden className="mt-5 flex justify-center gap-1.5">
            {TOPIC_KEYS.map((k) => (
              <span key={k} className={`h-1.5 rounded-full transition-all ${k === topic ? "w-6 bg-ink" : "w-1.5 bg-ink/20"}`} />
            ))}
          </div>
          <FairNote shown={say.length} total={fair.total(topic)} className="mt-3" />
        </div>
      </div>
    </section>
  );
}

/**
 * V. Stream: the same thing as one endless column rising on the left: a topic with its painted
 * object, then what each party says about it, then the next topic, and so on through all eight.
 */
export function HeroStream({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  const fair = useFair(stances);
  return (
    <section className="px-3 pb-10 sm:px-6">
      <div className={`${CANVAS} lg:min-h-[calc(100svh-9.5rem)]`}>
        <Words counts={counts} />
        <div className="relative mx-auto h-[34rem] w-full max-w-[31rem] self-stretch lg:-my-14 lg:h-auto">
          {(["top", "bottom"] as const).map((side) => {
            const deg = side === "top" ? "180deg" : "0deg";
            return (
              <div key={side} aria-hidden className={`pointer-events-none absolute inset-x-0 z-10 h-32 ${side === "top" ? "top-0" : "bottom-0"}`}>
                <div className={`absolute inset-x-0 h-12 backdrop-blur-[1.5px] ${side === "top" ? "top-0" : "bottom-0"}`} style={{ maskImage: `linear-gradient(${deg}, black, rgb(0 0 0 / 0.3) 55%, transparent 100%)` }} />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(${deg}, rgb(242 242 240) 0%, rgb(242 242 240 / 0.738) 13%, rgb(242 242 240 / 0.541) 24%, rgb(242 242 240 / 0.382) 34%, rgb(242 242 240 / 0.278) 42.5%, rgb(242 242 240 / 0.194) 51%, rgb(242 242 240 / 0.126) 59.5%, rgb(242 242 240 / 0.075) 68.5%, rgb(242 242 240 / 0.042) 77%, rgb(242 242 240 / 0.021) 85%, rgb(242 242 240 / 0.008) 92.5%, transparent 100%)`,
                  }}
                />
              </div>
            );
          })}
          <div className="hero-wall absolute inset-0 overflow-hidden">
            <div className="rise flex flex-col" style={{ ["--rise-duration" as string]: "80s" }}>
              {[0, 1].map((copy) => (
                <div key={copy} aria-hidden={copy === 1} className="flex flex-col gap-10 pb-10">
                  {TOPIC_KEYS.map((k) => (
                    <div key={k} className="flex flex-col gap-3">
                      <div className="flex items-center gap-4">
                        <TopicIllustration topic={k} className="!mx-0 !w-20 shrink-0" />
                        <p className="serif text-5xl leading-none">{TOPICS[k].label}</p>
                      </div>
                      {fair.take(k, 5, 0).map((s) => (
                        <div key={s.slug} className="rounded-[1.5rem] bg-paper p-4 shadow-[0_14px_30px_-24px_rgb(0_12_31/0.25)]">
                          <Line s={s} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * W. Index: the eight topics as an index list on the left, each with its painted object. The open
 * one lists what the parties say; it moves down to the next topic on its own.
 */
export function HeroIndex({ stances, counts }: { stances: StancesByTopic; counts: string }) {
  const { topic, step, hover } = useTopic(6000);
  const fair = useFair(stances);
  return (
    <section className="px-3 pb-10 sm:px-6">
      <div className={CANVAS}>
        <Words counts={counts} />
        <div className="mx-auto w-full max-w-[36rem] select-none rounded-[2.5rem] bg-paper px-6 py-3 shadow-[0_50px_90px_-60px_rgb(0_12_31/0.4)]" {...hover}>
          {TOPIC_KEYS.map((k) => {
            const open = k === topic;
            return (
              <div key={k} className="border-b border-line last:border-b-0">
                <div className="flex w-full items-center gap-4 py-2.5">
                  <TopicIllustration topic={k} className={`!mx-0 shrink-0 transition-all ${open ? "!w-16" : "!w-9"}`} />
                  <span className={`title flex-1 transition-all ${open ? "text-3xl" : "text-xl text-ink-2"}`}>{TOPICS[k].label}</span>
                </div>
                {open && (
                  <div key={k} className="grid gap-3.5 pb-5 ps-[4.75rem]">
                    {fair.take(k, 4, step).map((s, i) => (
                      <Line key={s.slug} s={s} i={i} delay />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
