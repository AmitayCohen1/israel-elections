# למי להצביע? — Design Protocol

The site is a reading instrument. **The text is the product**; everything else serves it.
Tone: governmental-like — calm, institutional, trustworthy. Never busy, never loud, never a metaphor.

## Structure: a dashboard, not a landing page
- A fixed app: the page never scrolls, the content scrolls inside its own area. The **sidebar is the card** (grey, attached to the screen edge and the bottom, 98% of the height so it starts just below the top, rounded only at the top corner that faces the content, `rounded-se-[2rem]`, the top one): logo, the one search, the views (סקירה, נושאים, ראשי רשימות, רשימות, איך מצביעים), a divider, then sources, official links, contact. The sidebar is wide by default (`w-[20rem]`, `text-xl` items). The **content is simply the page**: white, no panel, no frame, and **centred** in the space beside the sidebar (reading pages in a centred column, wide pages up to `max-w-[88rem]`). On phones: a slim top bar (logo + search) and a bottom tab bar. Config in `src/lib/nav.ts`, chrome in `src/components/shell.tsx`.
- `/` is the overview: a classic big start-aligned serif title with the **split-flap countdown** (`FlapCountdown`) at the end of the header row, then four cards on a grid that fills the screen, with no card mostly air at any height: the people card is only as tall as its content, the guide takes the rest of its column and its clip grows to fit, and the positions card shows as many parties as fit whole. **Every card has its title at the top right (with what is inside under it) and a round way in at the top left.** Grey, and no colour except the guide, which is a **gate, not a summary** (`GuideGate`: the name, one line, a button, and just the looping voting video beside them; one link to the guide page). The two things that matter most, per the user: **(1) positions, led by the category** — (left, tall, `TopicStage`): a proper card title (עמדות), then all eight categories as a row of small tiles, each with its painted object and name, the one in view framed; under it a few parties respond with a **verbatim quote** (on a side rule; our summary only as a fallback), **standing still so they can be read**; after ~9s the whole card turns to the next category (the row picks one; each lap shows the next parties; a line at the bottom states how many parties wrote on the category and links to all of them, so a sample is never mistaken for the whole). A wall that scrolled while you read was rejected as confusing; **(2) the people** — *אנשים* (right, top): the card is led by **one person at a time, properly** (`PersonStrip`: a small portrait, the name large, the party, and the opening line or two of their biography, sliding sideways to the next) to show that we have real information on each, and right under it the **list of people stands still** while the highlight walks along it: back and forward buttons at the ends, or pick a face; left alone it steps forward by itself. No drifting marquee. The overview shows *that we have it*, not all of it. Under them, the guide. Show real detail, trimmed to clean excerpts. Under the people card, stacked in the same column, sit two **gates** of one shape (`Gate`: the name in serif, one line and a button at the start side, centred; one visual at the other side): **מפלגות** (grey, three overlapping tilted party cards: ballot slip, name, candidate count; a different three per visit. No party logos yet: none are in the data) and **המדריך** (cream, the looping voting clip). The positions rows arrive like a departures board (`board-in`: each flips down a beat after the one before) and then stand still. Every view is its own route (`/topics`, `/people`, `/lists`) with shareable URLs.
- A view opens with `ViewHead`: small `.title` heading at the start side, one line of hint. Browsing is index rows, one line each, opening in place in a single column; nothing reflows when a row opens.
- Less is more: no decorative charts, rings or chrome. Every card shows real data from the site.
- The first long landing page is kept at `/old`, the first dashboard overview at `/archive`. Next: compare mode (2–4 lists side by side on one topic).

## Surfaces
- Page: white (`--paper`). Ink: `#000c1f`. Accent (links/CTAs/hover): `#002664`. No other hues.
- Grey canvas `mist` (`#f2f2f0`; tiles are `#f5f5f4`). Use the token, never the hex, radius `2.75rem`–`3rem`: the one "component background". Used for the hero and for a full-width quiet section. White cards (`bg-paper`) sit on grey; grey tiles (`bg-tile`) sit on white. Never grey-on-white borders *and* shadows together.
- Shadows are paper-weight only: low opacity (≤0.3), tight negative spread, e.g. `0_14px_30px_-24px rgb(0 12 31/0.25)`. If a shadow is noticeable, it's too strong.
- Soft edges on moving content: the 12-stop eased scrim in the surface's own grey + at most `backdrop-blur-[1.5px]` on a thin strip. Never a hard 2-stop gradient, never a heavy blur band.

## Type
- Display: Frank Ruhl (`.serif`) for page titles and hero only. One huge thing per screen.
- `.title` (sans, medium) for row/section titles. Body: system sans.
- Content pages: title `clamp(3rem,5.2vw,5.5rem)` max — content pages are not heroes.
- Reading text: `max-w-3xl` measure, `text-lg`–`text-xl`, `leading-relaxed`. Quotes: blockquote with a 2px side rule, `text-ink-2`.
- Hierarchy inside an item: our neutral line (medium) → the quote (ink-2) → source link (sm, accent). Never more than 3 levels.

## Recurring components (reuse, don't reinvent)
- **Index row**: `border-b border-line`, generous `py`, title grows on the start side, meta small+muted at the end, optional circle affordance. Used for lists, sources, links, interviews.
- **AccRow**: the collapsible index row (+ turns into ×). Rows sharing `name` close each other. Default collapsed.
- **One flow, no tabs**: a content page is a single top-to-bottom read — `title` section headings, secondary material collapsed (AccRow / details), never hidden behind tabs.
- **Video card**: `aspect-video rounded-2xl bg-tile` — real thumbnail + LTR play button when we have one (YouTube), otherwise the outlet's name set quietly in the tile; title + outlet as text below. Never an embedded iframe.
- **Ballot slip**: paper look — `.slip` gradient, 3px color hairline at top, `ring-ink/10`, sharp-ish corners. The only place a list's color appears at full strength.
- **Tile figure**: pastel tile + painted illustration, for the how-to content only.

## Icons
- Line icons only, from `src/components/topic-icon.tsx`: 24px grid, stroke 1.8, round caps, `currentColor`, sitting in a `size-11 rounded-2xl bg-tile` square at `text-ink/75`. **No emoji in UI.**
- Painted illustrations (`/media/illustrations`) are section-level accents, one per page header at most.

## Motion
- Continuous and slow (drift/rise, 85s+), always pauses on hover, always `prefers-reduced-motion` aware.
- Motion is for ambience (the hero stream) — information is never only in motion.
- Scroll-driven, CSS only (`animation-timeline: view()`, see globals.css): the card deck on the landing page (`card-stack.tsx`: the section pins and each card flips up while the previous settles behind it), the timeline rail drawing down, the 120 seat dots filling in. Always as progressive enhancement: wrapped in `@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`; everywhere else the final state is simply shown (the deck becomes a plain list).
- Time-based content (countdown, calendar, timeline) reads dates from `src/lib/election.ts` only, and works in Israel time.

## Wording
- Say **מפלגות**, not רשימות, wherever a visitor reads about the parties. רשימה is kept only for the slate of candidates itself (רשימות המועמדים, מי ברשימה, מקום ברשימת X, המפלגות ברשימה) and the official timeline milestones.

## Conduct (editorial, non-negotiable)
- Same template and depth for every list; official CEC order, never polls or ranking.
- Every position: neutral one-liner + exact quote + source link. "לא מצאנו" is stated, not hidden.
- RTL-first; logical properties only (`ps/pe/ms/me`, `start/end`) — Arabic/English mirroring must be free.
- Hebrew content lives in data, not components, wherever possible (future en/ar/ru/am).
