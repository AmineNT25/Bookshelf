-- Run once in the Supabase SQL Editor.
-- Creates the profiles table, enables RLS, and sets up the avatars storage bucket.
--
-- NOTE: This app uses next-auth (not Supabase Auth), so auth.uid() in the RLS
-- policies will not match next-auth session IDs. The API routes use the service
-- role key and bypass RLS. These policies protect against direct anon-key access.

CREATE TABLE IF NOT EXISTS profiles (
  id          TEXT PRIMARY KEY,
  first_name  TEXT,
  last_name   TEXT,
  email       TEXT,
  username    TEXT UNIQUE,
  bio         TEXT,
  avatar_url  TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all"  ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON profiles;

CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid()::text = id);

-- Storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars_upload_own"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_read_public"  ON storage.objects;

CREATE POLICY "avatars_upload_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_read_public" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');
