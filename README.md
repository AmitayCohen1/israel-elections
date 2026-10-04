# למי להצביע? — Israel 2026 election candidate directory

Every list and every candidate running for the 26th Knesset (27 Oct 2026): ballot letters, full slates in official order, short bios with photos, Knesset records, and each list's positions with verbatim quotes and source links.

Next.js 16 (App Router, Cache Components) · Tailwind 4 · Neon Postgres.

## Run

```bash
npm install
npm run dev            # needs DATABASE_URL in .env.local
```

## Data pipeline

All data lives in `data/` as JSON and is loaded into Neon by `scripts/seed.mjs`. The site reads the whole dataset in one cached call (`src/lib/data.ts`, tag `dataset`).

| Step | Script | Source | Output |
|---|---|---|---|
| 1. Slates | `scripts/build_lists.py` | CEC slates (`scripts/raw/cec_small.txt`, read from gov.il), Knesset TV slate summary, Hebrew Wikipedia (letters, colours, article links) | `data/lists.json` |
| 2. Enrichment | `scripts/enrich.py` | Hebrew Wikipedia intro + Wikimedia Commons photo (free licences only), Knesset OData (terms, roles, factions, bills) | `data/candidates_enriched.json` |
| 3. Positions | researched by hand/agents, one file per list | party platforms, official sites, statements, interviews, news | `data/platforms/<slug>.json` (format: `data/platforms/SCHEMA.md`) |
| 4. Load | `node --env-file=.env.local scripts/seed.mjs` | the files above | Neon, then POSTs `/api/revalidate` |

Name matching notes:
- Official CEC names are surname-first and formal ("כהן אליהו"); Wikipedia uses display names ("אלי כהן"). `match_wiki` matches on shared name tokens near the same slot.
- Knesset matches require an exact `<LastName> <FirstName>` and service since the 12th Knesset.
- Guessed Wikipedia matches are flagged on the candidate page. Known namesakes go in `REJECT` in `scripts/enrich.py`.

## Env

```
DATABASE_URL=...          # Neon pooled connection string
REVALIDATE_SECRET=...     # protects POST /api/revalidate
REVALIDATE_URL=...        # optional: seed.mjs calls it after loading
```

## Editorial rules

Same template for every list · alphabetical order, no polls/forecasts · every position = neutral paraphrase + verbatim quote + exact source URL · "no documented position" is shown rather than inferred.
