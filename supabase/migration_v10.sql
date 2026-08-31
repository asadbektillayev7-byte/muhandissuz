-- Migration v10: rate limiting for the public chat widget.
--
-- The chat runs on the site's own Gemini key, so an unthrottled endpoint is a
-- way for anyone to spend the project's quota. One row per message, counted
-- per IP over a rolling window.
--
-- Deliberately not tied to a user: the chat is open to anonymous visitors.

CREATE TABLE IF NOT EXISTS chat_requests (
  id         BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_requests_ip_time
  ON chat_requests (ip_address, created_at DESC);

-- Only the service role touches this table; it is written from a server
-- action and never read by the browser.
ALTER TABLE chat_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No public access" ON chat_requests;
CREATE POLICY "No public access" ON chat_requests FOR SELECT USING (FALSE);
