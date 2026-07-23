-- Create tables for Muhandiss.uz
-- Run this in Supabase SQL Editor

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name_uz TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color TEXT,
  icon TEXT,
  description_uz TEXT,
  description_en TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Authors
CREATE TABLE IF NOT EXISTS authors (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  bio_uz TEXT,
  bio_en TEXT,
  photo_url TEXT,
  role TEXT NOT NULL DEFAULT 'author' CHECK (role IN ('author', 'translator', 'both')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles
CREATE TABLE IF NOT EXISTS articles (
  id BIGSERIAL PRIMARY KEY,
  title_uz TEXT NOT NULL,
  title_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  body_uz JSONB,
  body_en JSONB,
  excerpt_uz TEXT,
  excerpt_en TEXT,
  cover_image_url TEXT,
  original_language TEXT NOT NULL DEFAULT 'uz' CHECK (original_language IN ('uz', 'en')),
  author_id BIGINT REFERENCES authors(id) ON DELETE SET NULL,
  translator_id BIGINT REFERENCES authors(id) ON DELETE SET NULL,
  published_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tags JSONB DEFAULT '[]'::jsonb,
  related_hackathon_id BIGINT,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media
CREATE TABLE IF NOT EXISTS media (
  id BIGSERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt_uz TEXT,
  alt_en TEXT,
  mime_type TEXT,
  filesize BIGINT,
  width INT,
  height INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hackathons
CREATE TABLE IF NOT EXISTS hackathons (
  id BIGSERIAL PRIMARY KEY,
  title_uz TEXT NOT NULL,
  title_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary_uz TEXT,
  summary_en TEXT,
  date_range_start TIMESTAMPTZ NOT NULL,
  date_range_end TIMESTAMPTZ,
  cover_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'past')),
  build_log JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hackathons <-> Mentors join table
CREATE TABLE IF NOT EXISTS hackathon_mentors (
  hackathon_id BIGINT NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  mentor_id BIGINT NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  PRIMARY KEY (hackathon_id, mentor_id)
);

-- Student Projects
CREATE TABLE IF NOT EXISTS student_projects (
  id BIGSERIAL PRIMARY KEY,
  title_uz TEXT NOT NULL,
  title_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description_uz JSONB,
  description_en JSONB,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  student_names JSONB DEFAULT '[]'::jsonb,
  age_group TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  model3d_url TEXT,
  hackathon_id BIGINT REFERENCES hackathons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hackathons <-> Projects join table
CREATE TABLE IF NOT EXISTS hackathon_projects (
  hackathon_id BIGINT NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES student_projects(id) ON DELETE CASCADE,
  PRIMARY KEY (hackathon_id, project_id)
);

-- Mentors
CREATE TABLE IF NOT EXISTS mentors (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title_uz TEXT,
  title_en TEXT,
  bio_uz TEXT,
  bio_en TEXT,
  photo_url TEXT,
  contact JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentors <-> Categories join table
CREATE TABLE IF NOT EXISTS mentor_disciplines (
  mentor_id BIGINT NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (mentor_id, category_id)
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role_uz TEXT NOT NULL,
  role_en TEXT NOT NULL,
  photo_url TEXT,
  bio_uz TEXT,
  bio_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partners
CREATE TABLE IF NOT EXISTS partners (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback
CREATE TABLE IF NOT EXISTS feedback (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role_uz TEXT,
  role_en TEXT,
  quote_uz TEXT NOT NULL,
  quote_en TEXT NOT NULL,
  rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Glossary Terms
CREATE TABLE IF NOT EXISTS glossary_terms (
  id BIGSERIAL PRIMARY KEY,
  term_uz TEXT NOT NULL,
  term_en TEXT NOT NULL,
  definition_uz TEXT NOT NULL,
  definition_en TEXT NOT NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings (single row)
CREATE TABLE IF NOT EXISTS site_settings (
  id BIGSERIAL PRIMARY KEY,
  mission_statement_uz TEXT,
  mission_statement_en TEXT,
  contact_email TEXT,
  social_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default site settings row
INSERT INTO site_settings (id, mission_statement_uz, mission_statement_en)
VALUES (1, '', '')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies: all tables public read, admin-only write
CREATE POLICY "Public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read" ON authors FOR SELECT USING (true);
CREATE POLICY "Public read" ON articles FOR SELECT USING (true);
CREATE POLICY "Public read" ON media FOR SELECT USING (true);
CREATE POLICY "Public read" ON hackathons FOR SELECT USING (true);
CREATE POLICY "Public read" ON student_projects FOR SELECT USING (true);
CREATE POLICY "Public read" ON mentors FOR SELECT USING (true);
CREATE POLICY "Public read" ON team_members FOR SELECT USING (true);
CREATE POLICY "Public read" ON partners FOR SELECT USING (true);
CREATE POLICY "Public read" ON feedback FOR SELECT USING (true);
CREATE POLICY "Public read" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Public read" ON glossary_terms FOR SELECT USING (true);
CREATE POLICY "Public read" ON site_settings FOR SELECT USING (true);
