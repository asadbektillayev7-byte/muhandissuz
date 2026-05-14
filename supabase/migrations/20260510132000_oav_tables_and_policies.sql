-- OAV albums table
CREATE TABLE IF NOT EXISTS public.oav_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  cover_url TEXT,
  album_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.oav_albums ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "OAV albums viewable by everyone" ON public.oav_albums;
CREATE POLICY "OAV albums viewable by everyone"
  ON public.oav_albums FOR SELECT
  USING (is_active = true OR (auth.uid() IS NOT NULL AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'))));

DROP POLICY IF EXISTS "Admins/editors can manage OAV albums" ON public.oav_albums;
CREATE POLICY "Admins/editors can manage OAV albums"
  ON public.oav_albums FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- OAV videos table
CREATE TABLE IF NOT EXISTS public.oav_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  event_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.oav_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "OAV videos viewable by everyone" ON public.oav_videos;
CREATE POLICY "OAV videos viewable by everyone"
  ON public.oav_videos FOR SELECT
  USING (is_active = true OR (auth.uid() IS NOT NULL AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'))));

DROP POLICY IF EXISTS "Admins/editors can manage OAV videos" ON public.oav_videos;
CREATE POLICY "Admins/editors can manage OAV videos"
  ON public.oav_videos FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- Add updated_at triggers for new tables
DROP TRIGGER IF EXISTS update_oav_albums_updated_at ON public.oav_albums;
CREATE TRIGGER update_oav_albums_updated_at
BEFORE UPDATE ON public.oav_albums
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_oav_videos_updated_at ON public.oav_videos;
CREATE TRIGGER update_oav_videos_updated_at
BEFORE UPDATE ON public.oav_videos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
