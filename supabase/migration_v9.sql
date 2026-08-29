-- Migration v9: moderated public feedback
--
-- Feedback is submitted by visitors and was admin-read-only. The landing page
-- now shows it, so it needs public read — but only for rows an admin has
-- approved, otherwise anything submitted would appear on the homepage at once.

ALTER TABLE feedback ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_feedback_approved
  ON feedback (approved, created_at DESC);

-- Policies are OR'd, so this adds anonymous read of approved rows only.
-- Unapproved rows stay visible to the admin alone.
DROP POLICY IF EXISTS "Public read approved" ON feedback;
CREATE POLICY "Public read approved" ON feedback FOR SELECT
  USING (approved = TRUE OR public.is_admin());
