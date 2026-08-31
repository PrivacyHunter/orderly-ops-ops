DROP POLICY IF EXISTS "Anyone can view their own quote by tracking_id" ON public.quotes;
REVOKE SELECT ON public.quotes FROM anon;