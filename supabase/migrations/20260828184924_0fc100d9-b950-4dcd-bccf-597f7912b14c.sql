DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='r' AND n.nspname='public'
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t.relname);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t.relname);
  END LOOP;
END $$;

GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.hero_banners TO anon;
GRANT SELECT ON public.page_content TO anon;
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.customization_videos TO anon;
GRANT SELECT ON public.instagram_posts TO anon;

GRANT INSERT ON public.inquiries TO anon;
GRANT INSERT ON public.quotes TO anon;
GRANT INSERT, SELECT, UPDATE ON public.newsletter_subscribers TO anon;
GRANT INSERT ON public.user_tracking TO anon;
GRANT INSERT ON public.video_engagement TO anon;