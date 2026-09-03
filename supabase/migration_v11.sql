-- Migration v11: tell chat request kinds apart.
--
-- Text, photo and voice cost very different amounts per message, so they get
-- very different allowances: text stays generous and hourly, while photo and
-- voice are capped per day. Counting them in one undifferentiated bucket
-- would either starve text or leave media wide open.

ALTER TABLE chat_requests
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'text'
  CHECK (kind IN ('text', 'photo', 'voice'));

-- The media check counts a whole day per kind, so the index leads with kind.
CREATE INDEX IF NOT EXISTS idx_chat_requests_kind_ip_time
  ON chat_requests (kind, ip_address, created_at DESC);
