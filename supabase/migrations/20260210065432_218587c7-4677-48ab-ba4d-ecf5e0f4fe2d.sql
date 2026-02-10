-- Drop existing SELECT policy on comments
DROP POLICY IF EXISTS "Approved comments viewable by everyone" ON public.comments;

-- Recreate: public can see approved comments, but user_id is not filtered here
-- since column-level security isn't available in Postgres RLS.
-- Instead, we'll set user_id to NULL for public-facing queries via a view.

-- Create a public-safe view that hides user_id for unauthenticated access
CREATE OR REPLACE VIEW public.public_comments AS
SELECT id, article_id, author_name, content, created_at, status
FROM public.comments
WHERE status = 'approved';

-- Re-add the original policy (still needed for authenticated users)
CREATE POLICY "Approved comments viewable by everyone"
  ON public.comments FOR SELECT
  USING (
    (status = 'approved') OR 
    (auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR 
      has_role(auth.uid(), 'admin') OR 
      has_role(auth.uid(), 'editor')
    ))
  );