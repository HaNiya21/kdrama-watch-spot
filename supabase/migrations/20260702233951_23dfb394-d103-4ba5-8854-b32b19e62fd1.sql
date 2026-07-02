
-- Allow public read of watchlist rows that users have chosen to share (rating or notes present)
CREATE POLICY "Public can view shared watchlist entries"
ON public.watchlist
FOR SELECT
USING (rating IS NOT NULL OR notes IS NOT NULL);

-- Switch community/aggregate functions to SECURITY INVOKER so they respect RLS
CREATE OR REPLACE FUNCTION public.get_drama_aggregate_ratings()
 RETURNS TABLE(drama_id text, avg_rating numeric, rating_count bigint)
 LANGUAGE sql
 STABLE SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT 
    drama_id,
    ROUND(AVG(rating), 1) as avg_rating,
    COUNT(rating) as rating_count
  FROM public.watchlist
  WHERE rating IS NOT NULL
  GROUP BY drama_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_community_feed(_limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, drama_id text, rating numeric, notes text, status text, updated_at timestamp with time zone, display_name text)
 LANGUAGE sql
 STABLE SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
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
  WHERE w.rating IS NOT NULL OR w.notes IS NOT NULL
  ORDER BY w.updated_at DESC
  LIMIT LEAST(COALESCE(_limit, 50), 100);
$function$;
