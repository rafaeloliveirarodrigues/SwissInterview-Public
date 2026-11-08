CREATE OR REPLACE FUNCTION public.find_confirmed_user_by_email(_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT u.id FROM auth.users u
  WHERE lower(u.email) = lower(_email)
    AND u.email_confirmed_at IS NOT NULL
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.find_confirmed_user_by_email(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.find_confirmed_user_by_email(text) TO service_role;