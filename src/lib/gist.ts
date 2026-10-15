import type { List } from "./data";
import type { TopicKey } from "./topics";
import { excerpt } from "./quotes";

/** A party's line on a topic, short enough for one glance: the editors' gist, else the first position's summary. Null when it said nothing on it. */
export function topicGist(list: List, key: TopicKey): string | null {
  const title = list.platform?.topic_titles?.[key];
  if (title) return title;
  const first = list.platform?.positions.find((p) => p.topic === key);
  return first ? excerpt(first.point || first.quote, 120) : null;
}

/** How many of the topics a party has a position on. */
export const topicCount = (list: List) => new Set(list.platform?.positions.map((p) => p.topic)).size;
