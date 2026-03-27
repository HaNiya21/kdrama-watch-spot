CREATE OR REPLACE FUNCTION public.get_drama_aggregate_ratings()
RETURNS TABLE (
  drama_id text,
  avg_rating numeric,
  rating_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    drama_id,
    ROUND(AVG(rating), 1) as avg_rating,
    COUNT(rating) as rating_count
  FROM public.watchlist
  WHERE rating IS NOT NULL
  GROUP BY drama_id;
$$;