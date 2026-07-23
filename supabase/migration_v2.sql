-- Migration v2: Hardening, RLS refinement, rate limiting, SEO fields, storage policies
-- Run this AFTER the base migration (migration.sql) if already applied

-- 1. Admin authorization function (used by all RLS policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND email = 'asadbektillayev7@gmail.com'
  )
$$;

-- 2. Login rate limiting table
CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts (ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts (attempted_at DESC);

-- 3. SEO fields on articles
ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_description_uz TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_description_en TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles (published);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles (slug);
CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles (published_date DESC);

-- 5. Update RLS: articles — public sees only published=true, admin sees all
DROP POLICY IF EXISTS "Public read" ON articles;
CREATE POLICY "Public read" ON articles FOR SELECT
  USING (published = true OR public.is_admin());

-- 6. Feedback: public can insert, only admin can read/delete
DROP POLICY IF EXISTS "Public read" ON feedback;
CREATE POLICY "Admin read" ON feedback FOR SELECT USING (public.is_admin());
CREATE POLICY "Public insert" ON feedback FOR INSERT WITH CHECK (true);

-- 7. Admin full-access policies on all content tables
DO $$
DECLARE
  tables text[] := ARRAY['categories', 'authors', 'media', 'hackathons', 'student_projects', 'mentors', 'team_members', 'partners', 'testimonials', 'glossary_terms', 'site_settings'];
  t text;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admin all" ON %I', t);
    EXECUTE format('CREATE POLICY "Admin all" ON %I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())', t);
  END LOOP;
END;
$$;

DROP POLICY IF EXISTS "Admin all" ON articles;
CREATE POLICY "Admin all" ON articles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin all" ON feedback;
CREATE POLICY "Admin all" ON feedback FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. Storage bucket policies for the media bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read" ON storage.objects;
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin delete" ON storage.objects;
CREATE POLICY "Admin delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND public.is_admin());
