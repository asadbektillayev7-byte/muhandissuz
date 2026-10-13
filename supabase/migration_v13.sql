-- Article editor: optional Russian translations, scheduled visibility, image storage.
-- Run in the Supabase SQL editor. Safe to run more than once.
-- Existing article bodies/slugs and the authentication function are unchanged.
BEGIN;

ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS department_leader text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS editor text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS translator text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS researcher text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_description_uz text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_description_en text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS og_image_url text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS title_ru text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS body_ru jsonb;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS excerpt_ru text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_description_ru text;
-- English remains optional when a schema was initialized before migration v4.
ALTER TABLE public.articles ALTER COLUMN title_en DROP NOT NULL;

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.articles TO anon, authenticated;
DROP POLICY IF EXISTS "Public read" ON public.articles;
CREATE POLICY "Public read" ON public.articles FOR SELECT
  USING (
    (published = true AND published_date <= now())
    OR public.is_admin()
  );
-- Existing "Admin all" policy and is_admin() remain in force. Missing Uzbek
-- content is a publish-time editor validation; legacy articles stay readable.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images', 'article-images', true, 8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read article-images" ON storage.objects;
CREATE POLICY "Public read article-images" ON storage.objects FOR SELECT
  USING (bucket_id = 'article-images');
DROP POLICY IF EXISTS "Admin upload article-images" ON storage.objects;
CREATE POLICY "Admin upload article-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'article-images' AND public.is_admin());
DROP POLICY IF EXISTS "Admin update article-images" ON storage.objects;
CREATE POLICY "Admin update article-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'article-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'article-images' AND public.is_admin());
DROP POLICY IF EXISTS "Admin delete article-images" ON storage.objects;
CREATE POLICY "Admin delete article-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'article-images' AND public.is_admin());

NOTIFY pgrst, 'reload schema';
COMMIT;
