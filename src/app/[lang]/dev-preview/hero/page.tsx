import type { Metadata } from "next";
import { getDataset } from "@/lib/data";
import { TOPICS } from "@/lib/topics";
import { SearchBox } from "@/components/search-box";
import { OptionVoices, type Voice } from "./voices";
import { OptionBento, OptionFan, OptionFeed, OptionOrbit, OptionWall, type Mixed } from "@/components/showcase";
import { buildShowcase } from "@/lib/showcase";
import { HeroList } from "@/components/hero/list";
import { HeroWheel } from "@/components/hero/bundles";
import { HeroRow } from "@/components/hero/row";
import { HeroFocus, HeroRegister } from "@/components/hero/focus";
import { HeroPicker } from "@/components/hero/picker";
import { HeroCard } from "@/components/hero/card";
import { HeroColumns } from "@/components/hero/columns";
import { HeroTopics, HeroSentence, HeroCentre, HeroSequence, HeroStrip, HeroStage, type StancesByTopic } from "@/components/hero/topics";
import { HeroCard2, HeroStream, HeroIndex } from "@/components/hero/side";
import { HeroToss, HeroChat, HeroThread, HeroNotes } from "@/components/hero/toss";
import { HeroBoard, HeroLine, HeroFlip, HeroRoller } from "@/components/hero/motion";
import { snippet } from "@/lib/showcase";
import { TOPIC_KEYS } from "@/lib/topics";

export const metadata: Metadata = { title: "Dev preview · hero options", robots: { index: false } };

const OPTIONS = [
  { id: "a", title: "Fan", note: "A full hand of seven cards in an arc: people, lists and positions together. A card lifts when you point at it." },
  { id: "b", title: "Wall", note: "Three tilted columns of mixed cards drifting in opposite directions. The most volume; it holds still on hover." },
  { id: "c", title: "Orbit", note: "Thirty-six candidates circling the total on three rings, turning slowly. Faces only, very calm." },
  { id: "d", title: "Bento", note: "A tidy grid that shows each kind of thing once: a person, a position, a list, the numbers, the topics." },
  { id: "e", title: "Feed", note: "Who said what, scrolling past like a conversation: the list's face, the topic, and its position." },
  { id: "f", title: "Voices", note: "A stack of photographs, one per list. The one on top speaks: its position arrives word by word. Arrows step through." },
  { id: "g", title: "List", note: "A grey panel with one white card, and all 38 lists passing slowly through it: slip, name, three small faces." },
  { id: "h", title: "Wheel", note: "Party bundles (name, lead candidate large, next three small). The words in the middle; every party on one huge wheel turning up from below." },
  { id: "i", title: "Row", note: "Party bundles, as quiet as possible: one still row of five parties on a hairline under the words. One party changes every few seconds." },
  { id: "j", title: "Focus", note: "The quietest: one party at a time on the grey panel — lead candidate large, name, the next three — turning to the next on its own." },
  { id: "k", title: "Register", note: "The words centred, then exactly three parties set wide apart on white with hairlines between, like an official register. One changes at a time." },
  { id: "l", title: "Picker", note: "J as an iPhone-style picker wheel: one big horizontal card in focus, the parties above and below tilted in 3D and blurred, turning on its own." },
  { id: "m", title: "Card", note: "The words centred over one soft grey card holding the crowd: even rows of portraits drifting very slowly, the search floating on top." },
  { id: "n", title: "Columns", note: "The picker's card without the turn-taking: two columns of party cards, one moving up and one moving down, without end." },
  { id: "o", title: "Topics", note: "The words centred, a row of topics under them, and under that the topic's answer from five parties side by side. The topic turns on its own; picking one holds it." },
  { id: "p", title: "Sentence", note: "One sentence in the middle, \"what do the parties say about ___\", with the topic as the huge word, and the parties under it as index rows." },
  { id: "q", title: "Centre", note: "The topic is the middle of the picture, a big white disc, and the parties stand either side of it with what they say. Picking a topic swaps the sides." },
  { id: "r", title: "Sequence", note: "Compact. A topic arrives with its painted object, then four parties say their piece one after another, then the next topic." },
  { id: "s", title: "Strip", note: "The same sequence on one centred line: object and topic name on top, six parties in two compact columns." },
  { id: "t", title: "Stage", note: "The topic's painted object in the middle, the parties speaking either side of it in turn." },
  { id: "u", title: "Card", note: "Words on the right, as in N. On the left one white card: a topic arrives with its painted object, four parties say their piece in turn, then the next topic." },
  { id: "v", title: "Stream", note: "Words on the right. On the left one endless rising column: a topic with its object, what each party says about it, then the next topic, through all eight." },
  { id: "w", title: "Index", note: "Words on the right. On the left the eight topics as an index list with their painted objects; the open one lists what the parties say and moves down on its own." },
  { id: "x", title: "Toss", note: "On white, so our paintings sit clean. The topic is thrown up from below and lands tilted; each party's card is thrown in after it; then the lot is tossed away upward and the next topic arrives." },
  { id: "y", title: "Chat", note: "A group conversation. Our side asks about a topic, the lists answer one by one after a moment of typing, and older messages slide away." },
  { id: "z", title: "Thread", note: "Both: the topic card is thrown up and lands; the lists reply beneath it as chat bubbles; then everything is thrown away for the next topic." },
  { id: "aa", title: "Notes", note: "The topic card is thrown into the middle; then each list's sticky note is thrown on top of it, one after another, landing crooked over the corners. Then it all goes up and away." },
  { id: "ab", title: "Board", note: "A departures board. A navy header with the topic, then a row per list flipping down into place one after another; then the rows flip away and the next topic flips in." },
  { id: "ac", title: "Line", note: "A washing line with cards pegged to it. Each swings in from above and settles: the topic first, then the lists. Then they swing back up." },
  { id: "ad", title: "Flip", note: "Cards lie face down showing only their ballot letters, then turn over one by one to show what each list says. Then they turn back for the next topic." },
  { id: "ae", title: "Roller", note: "Nothing but type. The topic's word rolls into place beside its painted object and the lists speak under it one at a time, their line typed out as they go." },
];

function Shell({ id, title, note, counts, children }: { id: string; title: string; note: string; counts: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-line">
      <div className="mx-auto flex max-w-[87rem] items-baseline gap-5 px-5 pt-14 sm:px-10" dir="ltr">
        <span className="serif text-6xl uppercase">{id}</span>
        <div>
          <p className="text-xl font-medium">{title}</p>
          <p className="text-ink-2">{note}</p>
        </div>
      </div>
      <div className="mx-auto grid max-w-[87rem] items-center gap-14 overflow-x-clip px-5 py-14 sm:px-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <p className="text-lg text-ink-2">עוד 25 ימים לבחירות · 27 באוקטובר 2026</p>
          <h1 className="serif mt-6 text-[clamp(4.25rem,8.2vw,9rem)] leading-[0.95]">מי בכלל רץ?</h1>
          <p className="mt-8 max-w-xl text-2xl leading-snug text-ink-2">כל הרשימות והמועמדים לכנסת ה-26, במקום אחד.</p>
          <div className="mt-10 max-w-[38rem]">
            <SearchBox size="lg" />
          </div>
          <p className="mt-5 text-ink-2">{counts}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

export default async function HeroPreview() {
  const lists = await getDataset();
  const main = lists.filter((l) => l.tier === "main");
  const candidates = lists.reduce((n, l) => n + l.candidates.length, 0);
  const nPositions = lists.reduce((n, l) => n + (l.platform?.positions.length ?? 0), 0);
  const counts = `${lists.length} רשימות · ${candidates.toLocaleString("he-IL")} מועמדים · ${nPositions} עמדות עם מקור`;

  const { people, positions, listCards } = buildShowcase(main);
  const voices: Voice[] = main.flatMap((l, i) => {
    const leader = l.candidates[0];
    const all = l.platform?.positions ?? [];
    const p = all[(i + 1) % Math.max(all.length, 1)];
    return leader?.image_url && p ? [{ href: `/lists/${l.slug}#positions`, img: leader.image_url, leader: leader.display_name, list: l.name, letters: l.letters, topic: TOPICS[p.topic].label, point: p.point }] : [];
  });

  // Interleave the three kinds so any slice of the deck is mixed.
  const mixed: Mixed[] = [];
  for (let i = 0; i < 15; i++) {
    if (people[i]) mixed.push({ kind: "person", ...people[i] });
    if (positions[i]) mixed.push({ kind: "position", ...positions[i] });
    if (listCards[i]) mixed.push({ kind: "list", ...listCards[(i + 7) % listCards.length] });
  }

  // The main lists first (alphabetical within each tier, as everywhere), then the rest.
  const listRows = [...main, ...lists.filter((l) => l.tier !== "main")].map((l) => ({ slug: l.slug, name: l.name, letters: l.letters, count: l.candidates.length, faces: l.candidates.slice(0, 4).map((c) => ({ name: c.display_name, img: c.image_url })) }));
  // Per topic: what each main list says, in a few words (lists with nothing on that topic are left out).
  const stances = Object.fromEntries(
    TOPIC_KEYS.map((k) => [
      k,
      lists.flatMap((l) => {
        const p = l.platform?.positions.find((x) => x.topic === k);
        return p ? [{ slug: l.slug, name: l.name, letters: l.letters, count: l.candidates.length, face: l.candidates[0] ? { name: l.candidates[0].display_name, img: l.candidates[0].image_url } : null, text: snippet(p.point, 12) }] : [];
      }),
    ]),
  ) as StancesByTopic;

  // Whole heroes with their own layout; these do not sit in the shared shell.
  const panels: Record<string, React.ReactNode> = {
    g: <HeroList lists={listRows} counts={counts} />,
    h: <HeroWheel lists={listRows} counts={counts} />,
    i: <HeroRow lists={listRows} counts={counts} />,
    j: <HeroFocus lists={listRows} counts={counts} />,
    k: <HeroRegister lists={listRows} counts={counts} />,
    l: <HeroPicker lists={listRows} counts={counts} />,
    m: <HeroCard people={people} counts={counts} />,
    n: <HeroColumns lists={listRows} counts={counts} />,
    o: <HeroTopics stances={stances} counts={counts} />,
    p: <HeroSentence stances={stances} counts={counts} />,
    q: <HeroCentre stances={stances} counts={counts} />,
    r: <HeroSequence stances={stances} counts={counts} />,
    s: <HeroStrip stances={stances} counts={counts} />,
    t: <HeroStage stances={stances} counts={counts} />,
    u: <HeroCard2 stances={stances} counts={counts} />,
    v: <HeroStream stances={stances} counts={counts} />,
    w: <HeroIndex stances={stances} counts={counts} />,
    x: <HeroToss stances={stances} counts={counts} />,
    y: <HeroChat stances={stances} counts={counts} />,
    z: <HeroThread stances={stances} counts={counts} />,
    aa: <HeroNotes stances={stances} counts={counts} />,
    ab: <HeroBoard stances={stances} counts={counts} />,
    ac: <HeroLine stances={stances} counts={counts} />,
    ad: <HeroFlip stances={stances} counts={counts} />,
    ae: <HeroRoller stances={stances} counts={counts} />,
  };

  const visuals: Record<string, React.ReactNode> = {
    a: <OptionFan cards={[mixed[0], mixed[4], mixed[8], mixed[3], mixed[7], mixed[11], mixed[6]].filter(Boolean)} />,
    b: <OptionWall cards={mixed} />,
    c: <OptionOrbit people={people} total={candidates} />,
    d: (
      <OptionBento
        person={people[1]}
        position={positions[2]}
        list={listCards[3]}
        extra={[people[4], people[5]]}
        stats={[
          { n: String(lists.length), label: "רשימות" },
          { n: candidates.toLocaleString("he-IL"), label: "מועמדים" },
        ]}
      />
    ),
    e: <OptionFeed positions={positions} />,
    f: <OptionVoices voices={voices} />,
  };

  return (
    <>
      <nav className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 gap-1 rounded-full bg-ink p-1.5 text-white shadow-xl" dir="ltr">
        {OPTIONS.map((o) => (
          <a key={o.id} href={`#${o.id}`} className="grid size-10 place-items-center rounded-full text-lg font-bold uppercase transition hover:bg-white hover:text-ink">
            {o.id}
          </a>
        ))}
      </nav>
      {OPTIONS.map((o) =>
        panels[o.id] ? (
          <section key={o.id} id={o.id} className="scroll-mt-20 border-b border-line pb-6">
            <div className="mx-auto flex max-w-[87rem] items-baseline gap-5 px-5 pt-14 pb-10 sm:px-10" dir="ltr">
              <span className="serif text-6xl uppercase">{o.id}</span>
              <div>
                <p className="text-xl font-medium">{o.title}</p>
                <p className="text-ink-2">{o.note}</p>
              </div>
            </div>
            {panels[o.id]}
          </section>
        ) : (
          <Shell key={o.id} {...o} counts={counts}>
            {visuals[o.id]}
          </Shell>
        ),
      )}
    </>
  );
}
