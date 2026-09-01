CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id)
);
GRANT SELECT, INSERT, DELETE ON public.friendships TO authenticated;
GRANT SELECT ON public.friendships TO anon;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Friendships are viewable by everyone" ON public.friendships FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.friendships FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.friendships FOR DELETE TO authenticated USING (auth.uid() = follower_id);

CREATE TABLE public.shared_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  title TEXT NOT NULL,
  image TEXT,
  price NUMERIC,
  minutes INTEGER,
  serves INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, recipe_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_recipes TO authenticated;
GRANT SELECT ON public.shared_recipes TO anon;
GRANT ALL ON public.shared_recipes TO service_role;
ALTER TABLE public.shared_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shared recipes are viewable by everyone" ON public.shared_recipes FOR SELECT USING (true);
CREATE POLICY "Users can share their own recipes" ON public.shared_recipes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shared recipes" ON public.shared_recipes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shared recipes" ON public.shared_recipes FOR DELETE TO authenticated USING (auth.uid() = user_id);