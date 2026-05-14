-- Enable RLS on books and reading_goals tables.
--
-- NOTE: This app uses next-auth (not Supabase Auth), so the service role key
-- used by API routes bypasses these policies entirely. The policies here guard
-- against anyone who obtains the anon key and tries to read or write data
-- directly without going through the API. The primary isolation enforcement
-- is the .eq("user_id", userId) filter added to every API route.

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "books_select_own"  ON books;
DROP POLICY IF EXISTS "books_insert_own"  ON books;
DROP POLICY IF EXISTS "books_update_own"  ON books;
DROP POLICY IF EXISTS "books_delete_own"  ON books;

CREATE POLICY "books_select_own" ON books
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "books_insert_own" ON books
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "books_update_own" ON books
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "books_delete_own" ON books
  FOR DELETE USING (auth.uid()::text = user_id);


ALTER TABLE reading_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "goals_select_own"  ON reading_goals;
DROP POLICY IF EXISTS "goals_insert_own"  ON reading_goals;
DROP POLICY IF EXISTS "goals_update_own"  ON reading_goals;
DROP POLICY IF EXISTS "goals_delete_own"  ON reading_goals;

CREATE POLICY "goals_select_own" ON reading_goals
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "goals_insert_own" ON reading_goals
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "goals_update_own" ON reading_goals
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "goals_delete_own" ON reading_goals
  FOR DELETE USING (auth.uid()::text = user_id);
