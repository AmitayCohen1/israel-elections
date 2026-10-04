# Platform research file format — one file per list: data/platforms/<slug>.json

{
  "slug": "likud",
  "platform_doc": { "url": "...", "title": "...", "published": "2026-09-01" } | null,
  "self_description": { "quote": "<verbatim Hebrew, max 30 words, how the list describes itself>", "source_url": "...", "source_title": "..." } | null,
  "positions": [
    {
      "topic": "security | economy | religion_state | judiciary | housing | education | welfare_health | governance",
      "point": "<neutral Hebrew paraphrase, max 25 words, written as 'הרשימה מציעה/תומכת/מתנגדת...'>",
      "quote": "<verbatim Hebrew from the source, max 40 words>",
      "source_url": "...",
      "source_title": "...",
      "source_type": "platform | party_site | official_statement | interview | news_report",
      "date": "YYYY-MM-DD or null"
    }
  ],
  "topics_without_position": ["housing", ...],
  "researched_at": "2026-10-02",
  "notes": "<anything a reviewer should double-check>"
}

Topics (Hebrew labels): security=ביטחון ומדיניות חוץ, economy=כלכלה ויוקר המחיה, religion_state=דת ומדינה,
judiciary=מערכת המשפט, housing=דיור, education=חינוך, welfare_health=רווחה ובריאות, governance=שלטון ודמוקרטיה
