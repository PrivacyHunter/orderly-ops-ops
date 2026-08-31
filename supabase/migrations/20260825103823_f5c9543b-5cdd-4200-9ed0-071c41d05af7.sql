REVOKE EXECUTE ON FUNCTION public.grant_developer_for_verified_email() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.grant_developer_for_verified_email() FROM anon;
REVOKE EXECUTE ON FUNCTION public.grant_developer_for_verified_email() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.grant_developer_for_verified_email() TO service_role;

REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;