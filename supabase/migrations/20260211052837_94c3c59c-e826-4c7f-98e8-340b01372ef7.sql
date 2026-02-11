
-- Create a public view for scientific articles that excludes sensitive fields
CREATE OR REPLACE VIEW public.public_scientific_articles
WITH (security_invoker=on) AS
SELECT 
  id, title, title_en, slug, abstract, abstract_en,
  content, content_en, author_name, author_credentials,
  co_authors, keywords, references_list, doi, pdf_url,
  category_id, status, views_count, created_at, updated_at
FROM public.scientific_articles
WHERE status = 'published';

-- Drop the old permissive SELECT policy
DROP POLICY IF EXISTS "Published sci articles viewable by everyone" ON public.scientific_articles;

-- Recreate SELECT policy: unauthenticated get NO direct table access,
-- authenticated authors/admins/editors can still see their own or all
CREATE POLICY "Published sci articles viewable by everyone"
  ON public.scientific_articles FOR SELECT
  USING (
    (auth.uid() IS NOT NULL) AND (
      created_by = auth.uid()
      OR has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'editor'::app_role)
    )
  );
