-- Fix the view to use security invoker instead of definer
DROP VIEW IF EXISTS public.public_comments;

CREATE OR REPLACE VIEW public.public_comments
WITH (security_invoker=on) AS
SELECT id, article_id, author_name, content, created_at, status
FROM public.comments
WHERE status = 'approved';