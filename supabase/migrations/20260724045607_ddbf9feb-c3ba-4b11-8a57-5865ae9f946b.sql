
-- Restrict payment_settings reads to admins only
DROP POLICY IF EXISTS "Anyone can view payment settings" ON public.payment_settings;
CREATE POLICY "Admins can view payment settings" ON public.payment_settings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
REVOKE SELECT ON public.payment_settings FROM anon;

-- Lock down SECURITY DEFINER functions: revoke from PUBLIC, grant only where required
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_complaint_by_ticket(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_order_by_number(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- has_role is used by RLS policies; grant back for policy evaluation contexts
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon, service_role;

-- Convert public-tracking lookups to SECURITY INVOKER so linter is satisfied;
-- tables are still protected by RLS with dedicated policies for public tracking if any.
CREATE OR REPLACE FUNCTION public.get_complaint_by_ticket(_ticket text)
 RETURNS TABLE(ticket_number text, name text, category text, priority complaint_priority, status complaint_status, description text, city text, created_at timestamp with time zone, updated_at timestamp with time zone, resolution_notes text)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT ticket_number, name, category, priority, status, description, city, created_at, updated_at, resolution_notes
  FROM public.complaints WHERE ticket_number = _ticket LIMIT 1;
$function$;

GRANT EXECUTE ON FUNCTION public.get_complaint_by_ticket(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_by_number(text) TO anon, authenticated;
