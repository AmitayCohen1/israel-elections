# Brief: who are the people at the top of each list

You are helping build the "people" section of an Israeli elections site (election day 27 Oct 2026). Project root: /Users/amitaycohen/Desktop/israel-elections.

TASK: for each list slug assigned to you, take the candidates at positions 1 to 5 and write a short, factual, neutral profile of each: what they did in their life before this list, and which public roles they held.

Where to look first (already in the project):
- data/lists.json: each list has `candidates` (position, official_name, display_name, bio, ...).
- data/candidates_enriched.json: keys like "<slug>:<position>" with Hebrew Wikipedia matches (title, url, bio). A match made by name only may be a DIFFERENT person with the same name. If the Wikipedia article does not clearly describe the same person (check age, profession, list), do not use it.
- data/sources.json: the list's official website and notes.
Then the web: he.wikipedia.org, the Knesset (knesset.gov.il / main.knesset.gov.il, member pages), the list's official site and the person's official pages, and for career facts only if nothing better exists, a major news outlet.

Write for each person (Hebrew):
- "headline": ONE line, up to 14 words, what they did in life. Examples: "אלוף במילואים, ראש הממשלה לשעבר", "עורכת דין, חברת כנסת מ-2019", "מייסד חברת הייטק, ראש עיר לשעבר". Facts only. No adjectives that praise or criticise ("מוערך", "שנוי במחלוקת", "כושל").
- "facts": 2 to 4 items, each {"label": one of "רקע מקצועי" | "תפקידים ציבוריים" | "שירות צבאי ולאומי" | "השכלה" | "כנסת", "value": short Hebrew phrase with years where known, "source_url": the page you read it on}.
- Time-sensitive claims (current role) must carry a year ("חבר כנסת מ-2019").

RULES (important):
- Never invent or guess. A fact goes in only if you read it on the page you cite. If you cannot find anything reliable about a person, set "headline": null, "facts": [], and say why in "notes".
- Same standard for every person on every list: same fields, same neutral tone, whether famous or not. Do not skip people you consider unimportant.
- Do not include criminal allegations, indictments or controversies. Only verifiable career facts. (Factual public roles like "ראש ממשלה" are fine.)
- Do not copy text from Wikipedia: paraphrase in your own short Hebrew.
- Minors or private details: nothing about family, health or religion unless it is a public role.

OUTPUT: one file per slug at data/people/<slug>.json, UTF-8, exactly:
{
  "slug": "<slug>",
  "researched_at": "2026-10-04",
  "people": [
    {"position": 1, "name": "<display_name>", "headline": "..." | null,
     "facts": [{"label": "...", "value": "...", "source_url": "https://..."}],
     "confidence": "high" | "medium" | "low",
     "notes": "what you tried / why unsure"}
  ]
}
Use the Write tool. When done, reply with a table: slug | people with a headline (of 5) | anything unresolved. Under 30 lines.
