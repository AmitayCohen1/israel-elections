-- Applied to Neon project "israel-elections". Re-runnable.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS lists (
  slug text PRIMARY KEY,
  name text NOT NULL,
  name_en text NOT NULL,
  official_name text NOT NULL,
  letters text NOT NULL,
  color text,
  tier text NOT NULL CHECK (tier IN ('main','other')),
  parties text[] NOT NULL DEFAULT '{}',
  background text[] NOT NULL DEFAULT '{}',
  cec_url text,
  slate_source text NOT NULL,
  candidate_count int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidates (
  id serial PRIMARY KEY,
  list_slug text NOT NULL REFERENCES lists(slug) ON DELETE CASCADE,
  position int NOT NULL,
  official_name text NOT NULL,
  display_name text NOT NULL,
  bio text,
  wiki_title text,
  wiki_url text,
  wikidata text,
  wiki_guessed boolean NOT NULL DEFAULT false,
  image_url text,
  image_page text,
  image_license text,
  image_artist text,
  knesset jsonb,
  UNIQUE (list_slug, position)
);
CREATE INDEX IF NOT EXISTS candidates_name_trgm ON candidates USING gin ((display_name || ' ' || official_name) gin_trgm_ops);

CREATE TABLE IF NOT EXISTS list_platforms (
  list_slug text PRIMARY KEY REFERENCES lists(slug) ON DELETE CASCADE,
  platform_doc jsonb,
  self_description jsonb,
  topics_without_position text[] NOT NULL DEFAULT '{}',
  researched_at date,
  notes text
);

CREATE TABLE IF NOT EXISTS platform_positions (
  id serial PRIMARY KEY,
  list_slug text NOT NULL REFERENCES lists(slug) ON DELETE CASCADE,
  topic text NOT NULL CHECK (topic IN ('security','economy','religion_state','judiciary','housing','education','welfare_health','governance')),
  point text NOT NULL,
  quote text NOT NULL,
  source_url text NOT NULL,
  source_title text,
  source_type text,
  source_date date
);
CREATE INDEX IF NOT EXISTS platform_positions_list ON platform_positions (list_slug, topic);

-- Translations of database text (Hebrew is the base, stored on the entity itself).
-- entity: 'lists' | 'candidates' | 'platform_positions' | 'list_platforms' | 'people' | 'knesset'  (key schema: src/lib/translation-keys.ts)
-- entity_id: the row's key — lists.slug, candidates 'slug:position', platform_positions.id
-- field: the column translated (name, bio, point, quote, ...). status says how far a row can be trusted.
CREATE TABLE IF NOT EXISTS translations (
  entity text NOT NULL,
  entity_id text NOT NULL,
  field text NOT NULL,
  locale text NOT NULL CHECK (locale IN ('en','ar','ru','am')),
  value text NOT NULL,
  status text NOT NULL DEFAULT 'machine' CHECK (status IN ('machine','reviewed','native')),
  src_hash text, -- md5(Hebrew source)[0:12] the value was made from; a mismatch means stale (see src/lib/translation-keys.ts)
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entity, entity_id, field, locale)
);
CREATE INDEX IF NOT EXISTS translations_locale ON translations (locale, entity);
ALTER TABLE translations ADD COLUMN IF NOT EXISTS src_hash text;

-- First-party, cookieless page views for /admin analytics. visitor is a daily-salted hash, never an address.
CREATE TABLE IF NOT EXISTS page_views (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  path text NOT NULL,
  lang text,
  referrer text,
  country text,
  device text,
  visitor text NOT NULL
);
CREATE INDEX IF NOT EXISTS page_views_created ON page_views (created_at DESC);
