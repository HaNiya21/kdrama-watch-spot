
-- Recreate views with security_invoker so caller RLS applies.
DROP VIEW IF EXISTS public.drama_aggregate_ratings;
DROP VIEW IF EXISTS public.community_feed;

-- Tighten watchlist column access: hide user_id from clients entirely.
REVOKE SELECT ON public.watchlist FROM authenticated;
GRANT SELECT (id, drama_id, status, current_episode, total_episodes, rating, notes, created_at, updated_at)
  ON public.watchlist TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.watchlist TO authenticated;

-- Allow signed-in users to read reviewed rows (needed for aggregate + community views).
DROP POLICY IF EXISTS "Authenticated can view reviewed watchlist rows" ON public.watchlist;
CREATE POLICY "Authenticated can view reviewed watchlist rows"
  ON public.watchlist
  FOR SELECT
  TO authenticated
  USING (rating IS NOT NULL OR notes IS NOT NULL);

CREATE VIEW public.drama_aggregate_ratings
WITH (security_invoker = true) AS
SELECT
  drama_id,
  ROUND(AVG(rating), 1) AS avg_rating,
  COUNT(rating) AS rating_count
FROM public.watchlist
WHERE rating IS NOT NULL
GROUP BY drama_id;

GRANT SELECT ON public.drama_aggregate_ratings TO authenticated;

CREATE VIEW public.community_feed
WITH (security_invoker = true) AS
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
