DROP VIEW IF EXISTS public.public_profiles;

CREATE OR REPLACE FUNCTION public.search_profiles(_query text, _limit int DEFAULT 20)
RETURNS TABLE (id uuid, username text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.avatar_url
  FROM public.profiles p
  WHERE p.username IS NOT NULL
    AND (_query = '' OR p.username ILIKE '%' || _query || '%')
  ORDER BY p.username
  LIMIT LEAST(COALESCE(_limit, 20), 50)
$$;

CREATE OR REPLACE FUNCTION public.get_public_profiles(_ids uuid[])
RETURNS TABLE (id uuid, username text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.avatar_url
  FROM public.profiles p
  WHERE p.id = ANY(_ids)
$$;

GRANT EXECUTE ON FUNCTION public.search_profiles(text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO authenticated;