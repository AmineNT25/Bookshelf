-- Run in the Supabase SQL Editor.
-- Idempotent — creates the profiles table if absent, then adds any missing columns.
-- Safe to run even if 004_profiles_rls.sql was already applied.

CREATE TABLE IF NOT EXISTS profiles (
  id         TEXT PRIMARY KEY,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name  TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email      TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username   TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio        TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- RLS (safe to re-enable / re-add)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid()::text = id);

-- Storage bucket (no-op if already exists)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars_upload_own"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_read_public" ON storage.objects;

CREATE POLICY "avatars_upload_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_read_public" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');
