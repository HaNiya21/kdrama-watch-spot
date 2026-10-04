CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('person','network')),
  target_id text NOT NULL,
  name text NOT NULL,
  image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, target_id)
);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own follows" ON public.follows FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own follows" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove own follows" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = user_id);