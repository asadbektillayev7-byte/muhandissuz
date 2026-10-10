-- Add optional credit fields to articles
-- Run this in Supabase SQL Editor

ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS department_leader text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS editor text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS translator text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS researcher text;
