-- Migration v4: Make English text optional (Uzbek is the authoring language)
-- articles.title_en is the only NOT NULL English column. Every English column
-- on media (alt_en, title_en, description_en, location_en) is already nullable.
ALTER TABLE articles ALTER COLUMN title_en DROP NOT NULL;
