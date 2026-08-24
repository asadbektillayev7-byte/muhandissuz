-- Migration v7: real quiz entities
--
-- Before this, a "quiz" was just a category and questions hung off category_id.
-- Now a quiz is its own row: it owns its questions, carries its own metadata,
-- and links to the articles it was written from so "Based on X Muhandiss
-- articles" can be counted honestly rather than hardcoded.

CREATE TABLE IF NOT EXISTS quizzes (
  id               BIGSERIAL PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE,
  category_id      BIGINT REFERENCES categories (id) ON DELETE SET NULL,
  -- Uzbek is the authoring language, English is optional and falls back.
  title_uz         TEXT NOT NULL,
  title_en         TEXT,
  description_uz   TEXT,
  description_en   TEXT,
  difficulty       TEXT NOT NULL DEFAULT 'easy'
                     CHECK (difficulty IN ('easy', 'medium', 'hard')),
  duration_minutes INTEGER,
  thumbnail_url    TEXT,
  -- Quizzes are bilingual; the visitor's locale picks the language shown.
  language_mode    TEXT NOT NULL DEFAULT 'bilingual'
                     CHECK (language_mode IN ('bilingual', 'en', 'uz')),
  published        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_category  ON quizzes (category_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_published ON quizzes (published, created_at DESC);

-- Questions now belong to a quiz, not to a category.
-- quiz_questions is empty, so this needs no data migration.
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS quiz_id BIGINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quiz_questions_quiz_id_fkey'
  ) THEN
    ALTER TABLE quiz_questions
      ADD CONSTRAINT quiz_questions_quiz_id_fkey
      FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE quiz_questions ALTER COLUMN quiz_id SET NOT NULL;
ALTER TABLE quiz_questions DROP COLUMN IF EXISTS category_id;

DROP INDEX IF EXISTS idx_quiz_questions_category;
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions (quiz_id, sort_order);

-- Which articles a quiz was built from.
CREATE TABLE IF NOT EXISTS quiz_articles (
  quiz_id    BIGINT NOT NULL REFERENCES quizzes (id)  ON DELETE CASCADE,
  article_id BIGINT NOT NULL REFERENCES articles (id) ON DELETE CASCADE,
  PRIMARY KEY (quiz_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_articles_article ON quiz_articles (article_id);

-- RLS, matching the rest of the schema: public reads published rows, the
-- admin account does everything.
ALTER TABLE quizzes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read" ON quizzes;
CREATE POLICY "Public read" ON quizzes FOR SELECT
  USING (published = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Admin all" ON quizzes;
CREATE POLICY "Admin all" ON quizzes FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public read" ON quiz_articles;
CREATE POLICY "Public read" ON quiz_articles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin all" ON quiz_articles;
CREATE POLICY "Admin all" ON quiz_articles FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());
