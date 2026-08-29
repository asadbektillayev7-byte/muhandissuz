-- Migration v8: curated featured quiz
--
-- The /quiz hero previously showed whichever quiz was newest. It now shows
-- the one an admin marks as featured, falling back to newest when none is.

ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

-- Only one quiz may be featured. The admin action clears the previous one
-- before setting the new one; this index is the safety net if anything ever
-- writes the column directly.
DROP INDEX IF EXISTS idx_quizzes_single_featured;
CREATE UNIQUE INDEX idx_quizzes_single_featured ON quizzes ((TRUE)) WHERE featured;

-- Hero ordering: featured first, then newest.
CREATE INDEX IF NOT EXISTS idx_quizzes_featured_created
  ON quizzes (featured DESC, created_at DESC);
