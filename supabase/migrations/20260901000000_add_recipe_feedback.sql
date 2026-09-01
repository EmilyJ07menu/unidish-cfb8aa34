-- Create recipe_feedback table to store user preferences
CREATE TABLE public.recipe_feedback (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('like', 'dislike')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_feedback TO authenticated;
GRANT ALL ON public.recipe_feedback TO service_role;

ALTER TABLE public.recipe_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback" ON public.recipe_feedback
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own feedback" ON public.recipe_feedback
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own feedback" ON public.recipe_feedback
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER recipe_feedback_set_updated_at
BEFORE UPDATE ON public.recipe_feedback
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Create index for faster queries
CREATE INDEX idx_recipe_feedback_user_id ON public.recipe_feedback(user_id);
CREATE INDEX idx_recipe_feedback_recipe_id ON public.recipe_feedback(recipe_id);
