
-- Fix: SECURITY DEFINER functions executable by signed-in users.
-- Replace RPCs with views that expose only safe columns, and revoke EXECUTE from client roles.

REVOKE EXECUTE ON FUNCTION public.get_drama_aggregate_ratings() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_drama_aggregate_ratings() FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.get_community_feed(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_community_feed(integer) FROM anon, authenticated;

DROP VIEW IF EXISTS public.drama_aggregate_ratings;
CREATE VIEW public.drama_aggregate_ratings
WITH (security_invoker = false) AS
SELECT
  drama_id,
  ROUND(AVG(rating), 1) AS avg_rating,
  COUNT(rating) AS rating_count
FROM public.watchlist
WHERE rating IS NOT NULL
GROUP BY drama_id;

GRANT SELECT ON public.drama_aggregate_ratings TO anon, authenticated;

DROP VIEW IF EXISTS public.community_feed;
CREATE VIEW public.community_feed
WITH (security_invoker = false) AS
SELECT
  w.id,
  w.drama_id,
  w.rating,
  w.notes,
  w.status,
  w.updated_at,
  p.display_name
FROM public.watchlist w
LEFT JOIN public.profiles p ON p.user_id = w.user_id
WHERE w.rating IS NOT NULL OR w.notes IS NOT NULL;

GRANT SELECT ON public.community_feed TO authenticated;
