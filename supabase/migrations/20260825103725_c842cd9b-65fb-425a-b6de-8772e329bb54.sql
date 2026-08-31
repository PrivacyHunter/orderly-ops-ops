ALTER TABLE public.instagram_settings
  ADD COLUMN IF NOT EXISTS oauth_state text,
  ADD COLUMN IF NOT EXISTS oauth_state_expires_at timestamptz;

REVOKE EXECUTE ON FUNCTION public.set_newsletter_subscriber_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_newsletter_subscriber_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_newsletter_subscriber_updated_at() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.set_newsletter_subscriber_updated_at() TO service_role;