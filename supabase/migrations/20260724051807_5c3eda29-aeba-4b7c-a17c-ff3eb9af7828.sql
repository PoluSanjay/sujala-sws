
-- Convert has_role to SECURITY INVOKER (users can read their own role rows via RLS,
-- and policies invoke has_role(auth.uid(), ...) which only reads the caller's own rows).
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Lock down execute on remaining SECURITY DEFINER function (handle_new_user is only
-- invoked by the on_auth_user_created trigger and must not be callable from the API).
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
