
-- Restore table-level SELECT on watchlist so PostgREST upsert works.
-- RLS "Users can view their own watchlist" still limits rows to the owner.
REVOKE SELECT ON public.watchlist FROM authenticated;
GRANT SELECT ON public.watchlist TO authenticated;

-- The "reviewed rows" cross-user SELECT policy is no longer needed because
-- the aggregate/community views below run with owner privileges. Removing it
-- prevents other users from ever reading rating/notes/user_id directly from
-- the base table.
DROP POLICY IF EXISTS "Authenticated can view reviewed watchlist rows" ON public.watchlist;

-- Recreate the two anonymized/aggregated views. Without security_invoker they
-- execute with the view owner's privileges, bypassing base-table RLS. They
-- intentionally do NOT project user_id, so nothing sensitive is exposed.
DROP VIEW IF EXISTS public.drama_aggregate_ratings;
DROP VIEW IF EXISTS public.community_feed;

CREATE VIEW public.drama_aggregate_ratings AS
SELECT
  drama_id,
  ROUND(AVG(rating), 1) AS avg_rating,
  COUNT(rating) AS rating_count
FROM public.watchlist
WHERE rating IS NOT NULL
GROUP BY drama_id;

CREATE VIEW public.community_feed AS
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

GRANT SELECT ON public.drama_aggregate_ratings TO anon, authenticated;
GRANT SELECT ON public.community_feed TO anon, authenticated;
