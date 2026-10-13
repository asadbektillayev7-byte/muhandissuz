-- Migration v12: linked videos, public content visibility and hackathon photos.
-- Run this in the Supabase SQL editor after the previous migrations.
-- This file is idempotent. It does not change the existing admin identity.

BEGIN;

ALTER TABLE public.hackathons
  ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE public.student_projects
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS date_range_start TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.student_projects'::regclass
      AND conname = 'student_projects_status_check'
  ) THEN
    ALTER TABLE public.student_projects
      ADD CONSTRAINT student_projects_status_check
      CHECK (status IS NULL OR status IN ('upcoming', 'ongoing', 'past'));
  END IF;
END;
$$;

-- Older hackathon forms had only a Cover Image URL field. Move recognizable
-- video links out of that field without overwriting an existing video link.
-- Other cover values remain untouched. Drive videos need a cover upload when
-- their next edit is saved; this repair keeps the existing entry visible now.
UPDATE public.hackathons
SET video_url = btrim(cover_image_url), cover_image_url = NULL
WHERE NULLIF(btrim(video_url), '') IS NULL
  AND (
    btrim(cover_image_url) ~* '^https://(www\.|m\.)?youtube\.com/(watch/?\?([^#]*&)?v=[A-Za-z0-9_-]{11}([&#].*)?|(shorts|embed)/[A-Za-z0-9_-]{11}/?([?#].*)?)$'
    OR btrim(cover_image_url) ~* '^https://(www\.)?youtu\.be/[A-Za-z0-9_-]{11}/?([?#].*)?$'
    OR btrim(cover_image_url) ~* '^https://drive\.google\.com/(file/d/[A-Za-z0-9_-]{10,200}/(view|preview)/?([?#].*)?|open/?\?([^#]*&)?id=[A-Za-z0-9_-]{10,200}([&#].*)?)$'
  );

-- Public lists include all statuses and all available translations. These
-- SELECT-only policies do not grant any anonymous write permission.
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.hackathons, public.student_projects TO anon, authenticated;
-- The gallery RPC locks its parent with FOR UPDATE. RLS still restricts that
-- privilege to the existing admin write policy from migration_v2.sql.
GRANT UPDATE ON public.hackathons TO authenticated;

DROP POLICY IF EXISTS "Public content read" ON public.hackathons;
CREATE POLICY "Public content read" ON public.hackathons
  FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS "Public content read" ON public.student_projects;
CREATE POLICY "Public content read" ON public.student_projects
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE TABLE IF NOT EXISTS public.hackathon_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id BIGINT NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hackathon_photos_order
  ON public.hackathon_photos (hackathon_id, position, created_at, id);

ALTER TABLE public.hackathon_photos ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.hackathon_photos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.hackathon_photos TO authenticated;

DROP POLICY IF EXISTS "Public photos read" ON public.hackathon_photos;
CREATE POLICY "Public photos read" ON public.hackathon_photos
  FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS "Admin photos write" ON public.hackathon_photos;
CREATE POLICY "Admin photos write" ON public.hackathon_photos
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Both covers/ and photos/ are stored in this public-read bucket. The path
-- does not bypass authorization: every write requires the existing admin.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hackathon-photos', 'hackathon-photos', TRUE, 8388608,
  ARRAY['image/jpeg', 'image/webp', 'image/png']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public hackathon images read" ON storage.objects;
CREATE POLICY "Public hackathon images read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'hackathon-photos');

DROP POLICY IF EXISTS "Admin hackathon images upload" ON storage.objects;
CREATE POLICY "Admin hackathon images upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'hackathon-photos' AND public.is_admin());

DROP POLICY IF EXISTS "Admin hackathon images update" ON storage.objects;
CREATE POLICY "Admin hackathon images update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'hackathon-photos' AND public.is_admin())
  WITH CHECK (bucket_id = 'hackathon-photos' AND public.is_admin());

DROP POLICY IF EXISTS "Admin hackathon images delete" ON storage.objects;
CREATE POLICY "Admin hackathon images delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'hackathon-photos' AND public.is_admin());

-- Replace one gallery atomically: failed inserts roll back the deletion.
-- Existing UUIDs and creation dates are retained. Array order becomes the
-- position, so duplicate or user-supplied positions cannot reorder the gallery.
CREATE OR REPLACE FUNCTION public.replace_hackathon_photos(
  p_hackathon_id BIGINT,
  p_photos JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_photo JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Faqat administrator rasmlarni saqlashi mumkin. / Only the admin can save photos.'
      USING ERRCODE = '42501';
  END IF;

  IF p_photos IS NULL OR jsonb_typeof(p_photos) <> 'array' THEN
    RAISE EXCEPTION 'Rasmlar ro''yxati noto''g''ri. / Invalid photo list.'
      USING ERRCODE = '22023';
  END IF;

  -- Serialize saves for this parent and confirm it exists before replacing.
  PERFORM id FROM public.hackathons WHERE id = p_hackathon_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Hakaton topilmadi. / Hackathon not found.'
      USING ERRCODE = '23503';
  END IF;

  FOR v_photo IN SELECT value FROM jsonb_array_elements(p_photos) LOOP
    IF jsonb_typeof(v_photo) <> 'object'
      OR NULLIF(btrim(v_photo->>'url'), '') IS NULL
      OR (v_photo->>'url') !~ '^https://'
      OR length(COALESCE(v_photo->>'caption', '')) > 240 THEN
      RAISE EXCEPTION 'Rasm manzili yoki izohi noto''g''ri. / Invalid photo URL or caption (maximum 240 characters).'
        USING ERRCODE = '22023';
    END IF;

    IF NULLIF(v_photo->>'id', '') IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.hackathon_photos
      WHERE id = (v_photo->>'id')::UUID AND hackathon_id <> p_hackathon_id
    ) THEN
      RAISE EXCEPTION 'Bu rasm boshqa hakatonga tegishli. / This photo belongs to another hackathon.'
        USING ERRCODE = '22023';
    END IF;
  END LOOP;

  -- Keep original creation timestamps in the payload before deleting rows.
  SELECT COALESCE(jsonb_agg(
    entry.value || jsonb_build_object(
      'created_at', COALESCE(existing.created_at, NOW())
    ) ORDER BY entry.ordinality
  ), '[]'::JSONB)
  INTO p_photos
  FROM jsonb_array_elements(p_photos) WITH ORDINALITY AS entry(value, ordinality)
  LEFT JOIN public.hackathon_photos AS existing
    ON existing.id = NULLIF(entry.value->>'id', '')::UUID
    AND existing.hackathon_id = p_hackathon_id;

  DELETE FROM public.hackathon_photos WHERE hackathon_id = p_hackathon_id;

  INSERT INTO public.hackathon_photos (id, hackathon_id, url, caption, position, created_at)
  SELECT
    COALESCE(NULLIF(entry.value->>'id', '')::UUID, gen_random_uuid()),
    p_hackathon_id,
    btrim(entry.value->>'url'),
    NULLIF(btrim(entry.value->>'caption'), ''),
    (entry.ordinality - 1)::INTEGER,
    (entry.value->>'created_at')::TIMESTAMPTZ
  FROM jsonb_array_elements(p_photos) WITH ORDINALITY AS entry(value, ordinality);
END;
$$;

REVOKE ALL ON FUNCTION public.replace_hackathon_photos(BIGINT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.replace_hackathon_photos(BIGINT, JSONB) FROM anon;
GRANT EXECUTE ON FUNCTION public.replace_hackathon_photos(BIGINT, JSONB) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
