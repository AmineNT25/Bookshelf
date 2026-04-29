-- Run once in the Supabase SQL Editor.
-- Idempotent — adds any column from the canonical books schema that's missing.
-- Safe to run even if 002_add_cover_description.sql was already applied.

ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_url   TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS genre       TEXT DEFAULT 'Fiction';
ALTER TABLE books ADD COLUMN IF NOT EXISTS progress    INTEGER DEFAULT 0;
ALTER TABLE books ADD COLUMN IF NOT EXISTS rating      INTEGER;
ALTER TABLE books ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ DEFAULT NOW();
