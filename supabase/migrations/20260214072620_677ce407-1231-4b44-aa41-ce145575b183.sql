
-- Create the increment_article_views function
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE articles SET views_count = COALESCE(views_count, 0) + 1 WHERE id = article_id;
END;
$$;
