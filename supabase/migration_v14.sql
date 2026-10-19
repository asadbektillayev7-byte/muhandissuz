-- New quizzes start as drafts. Existing published quizzes stay unchanged.
-- The legacy difficulty column remains for database/backward compatibility;
-- it is no longer used by the application.
BEGIN;

ALTER TABLE public.quizzes ALTER COLUMN published SET DEFAULT false;

-- Draft questions and source links must be private too, not only their quiz.
-- Existing admin write policies remain intact.
DROP POLICY IF EXISTS "Public read" ON public.quiz_questions;
CREATE POLICY "Public read" ON public.quiz_questions FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.published = true
    )
  );

DROP POLICY IF EXISTS "Public read" ON public.quiz_articles;
CREATE POLICY "Public read" ON public.quiz_articles FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = quiz_articles.quiz_id AND quizzes.published = true
    )
  );

COMMIT;
