-- Run once in the Supabase SQL Editor.
-- Adds the two columns the new search-and-save flow needs.

ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_url   TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS description TEXT;
