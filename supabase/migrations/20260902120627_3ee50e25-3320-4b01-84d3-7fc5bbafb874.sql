CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = off) AS
SELECT id, username, avatar_url, created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;