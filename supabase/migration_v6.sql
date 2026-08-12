-- Migration v6: Quiz questions
-- Answer options live in a jsonb array so a question can have 2-6 choices
-- without needing a second table. correct_index points into that array.
CREATE TABLE IF NOT EXISTS quiz_questions (
  id              BIGSERIAL PRIMARY KEY,
  category_id     BIGINT REFERENCES categories (id) ON DELETE CASCADE,
  question_uz     TEXT NOT NULL,
  question_en     TEXT,
  image_url       TEXT,
  options_uz      JSONB NOT NULL DEFAULT '[]'::jsonb,
  options_en      JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_index   INTEGER NOT NULL DEFAULT 0,
  explanation_uz  TEXT,
  explanation_en  TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_category
  ON quiz_questions (category_id, sort_order);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read" ON quiz_questions;
CREATE POLICY "Public read" ON quiz_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin all" ON quiz_questions;
CREATE POLICY "Admin all" ON quiz_questions FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());
