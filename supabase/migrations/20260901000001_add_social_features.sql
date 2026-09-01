-- Create friends/follows table for tracking friendships
CREATE TABLE public.friendships (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

GRANT SELECT, INSERT, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view friendships" ON public.friendships
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create friendships" ON public.friendships
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own friendships" ON public.friendships
  FOR DELETE TO authenticated USING (auth.uid() = follower_id);

CREATE INDEX idx_friendships_follower ON public.friendships(follower_id);
CREATE INDEX idx_friendships_following ON public.friendships(following_id);

-- Create shared_recipes table to track recipes shared by users
CREATE TABLE public.shared_recipes (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  title TEXT NOT NULL,
  image TEXT,
  price DECIMAL(10, 2),
  minutes INTEGER,
  serves INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_recipes TO authenticated;
GRANT ALL ON public.shared_recipes TO service_role;

ALTER TABLE public.shared_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared recipes" ON public.shared_recipes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own recipes" ON public.shared_recipes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recipes" ON public.shared_recipes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recipes" ON public.shared_recipes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER shared_recipes_set_updated_at
BEFORE UPDATE ON public.shared_recipes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_shared_recipes_user_id ON public.shared_recipes(user_id);
CREATE INDEX idx_shared_recipes_created_at ON public.shared_recipes(created_at DESC);
