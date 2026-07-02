
-- 1. Restrict profiles SELECT to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 2. Remove broad watchlist read access; owners still have "Users can view their own watchlist"
DROP POLICY IF EXISTS "Anyone can view rated or reviewed entries" ON public.watchlist;

-- 3. Provide safe community feed via SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.get_community_feed(_limit int DEFAULT 50)
RETURNS TABLE (
  id uuid,
  drama_id text,
  rating numeric,
  notes text,
  status text,
  updated_at timestamptz,
  display_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 4. Lock down execute privileges on all SECURITY DEFINER functions
-- handle_new_user is only invoked by the auth.users trigger; nobody should call it
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- get_drama_aggregate_ratings and get_community_feed should be for signed-in users only
REVOKE ALL ON FUNCTION public.get_drama_aggregate_ratings() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_drama_aggregate_ratings() TO authenticated;

REVOKE ALL ON FUNCTION public.get_community_feed(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_community_feed(int) TO authenticated;

-- update_updated_at_column is a trigger helper; revoke direct execute
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
