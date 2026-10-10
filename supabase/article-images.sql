-- Article Images Storage Bucket and RLS Policies
-- Run this in Supabase SQL Editor

-- 1. Create public bucket 'article-images' if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Public read access: anyone can view article images
DROP POLICY IF EXISTS "Public read article-images" ON storage.objects;
CREATE POLICY "Public read article-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

-- 3. Admin upload access: only authenticated admins can upload
DROP POLICY IF EXISTS "Admin upload article-images" ON storage.objects;
CREATE POLICY "Admin upload article-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-images' AND public.is_admin());

-- 4. Admin delete access: only authenticated admins can delete
DROP POLICY IF EXISTS "Admin delete article-images" ON storage.objects;
CREATE POLICY "Admin delete article-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'article-images' AND public.is_admin());

-- 5. Admin update access: only authenticated admins can update
DROP POLICY IF EXISTS "Admin update article-images" ON storage.objects;
CREATE POLICY "Admin update article-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'article-images' AND public.is_admin())
WITH CHECK (bucket_id = 'article-images' AND public.is_admin());
