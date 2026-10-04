import type { Metadata } from "next";
import { getDataset } from "@/lib/data";
import { TOPICS, type TopicKey } from "@/lib/topics";
import { TopicIllustration } from "@/components/illustration";
import { compareRows } from "@/components/topic-panels";
import { Tabs } from "@/components/tabs";
import { PickerCheckboxMenu, PickerPills, PickerSentence, PickerShuffle } from "./options";

export const metadata: Metadata = { title: "Dev preview · list picker options", robots: { index: false } };

const KEYS: TopicKey[] = ["economy", "security", "religion_state", "education", "welfare_health"];

const OPTIONS = [
  { id: "c", title: "Sentence", note: "A sentence with the blanks filled by plain dropdowns: 'I'm torn between … and …'." },
  { id: "j", title: "Checkbox menu", note: "New. The classic filter dropdown: one button, a panel with a search box and a checkbox per list. Picks show as removable tags." },
  { id: "k", title: "Pills", note: "New. Every list as a small text pill, a filter box to narrow them. Compact, no faces." },
  { id: "i", title: "Shuffle", note: "Press for a new pair, lock the one you want to keep." },
];

export default async function PickerDesigns() {
  const lists = await getDataset();
  const rows = compareRows(lists, KEYS);
  const topics = KEYS.map((key) => ({ key, label: TOPICS[key].label, icon: <TopicIllustration topic={key} className="!w-16" /> }));
  const RENDER: Record<string, React.ReactNode> = {
    c: <PickerSentence rows={rows} topics={topics} />,
    j: <PickerCheckboxMenu rows={rows} topics={topics} />,
    k: <PickerPills rows={rows} topics={topics} />,
    i: <PickerShuffle rows={rows} topics={topics} />,
  };
  return (
    <div className="pb-24">
      <p className="mx-auto mt-8 max-w-3xl px-4 text-center text-sm text-muted">Real data. Every option picks the lists and feeds the same full comparison.</p>
      <div className="mx-auto mt-6 max-w-[80rem] px-4">
        <Tabs
          tabs={OPTIONS.map((o) => ({ id: o.id, label: `${o.id.toUpperCase()} · ${o.title}` }))}
          panels={OPTIONS.map((o) => (
            <div key={o.id}>
              <p className="mx-auto max-w-2xl pb-10 text-center text-base leading-relaxed text-ink-2">{o.note}</p>
              {RENDER[o.id]}
            </div>
          ))}
        />
      </div>
    </div>
  );
}
