ALTER TABLE public.instagram_settings
  ADD COLUMN IF NOT EXISTS webhook_verify_token text,
  ADD COLUMN IF NOT EXISTS token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS caption_language text DEFAULT 'en';

ALTER TABLE public.instagram_posts
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'sync',
  ADD COLUMN IF NOT EXISTS media_hash text;

CREATE UNIQUE INDEX IF NOT EXISTS instagram_posts_media_hash_key ON public.instagram_posts (media_hash) WHERE media_hash IS NOT NULL;

ALTER TABLE public.instagram_sync_logs
  ADD COLUMN IF NOT EXISTS media_id text,
  ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS error_code text,
  ADD COLUMN IF NOT EXISTS recommended_action text,
  ADD COLUMN IF NOT EXISTS resolved boolean DEFAULT false;

GRANT SELECT, INSERT, UPDATE ON public.instagram_sync_logs TO authenticated;
GRANT ALL ON public.instagram_sync_logs TO service_role;
GRANT ALL ON public.instagram_posts TO service_role;
GRANT ALL ON public.instagram_settings TO service_role;

DROP POLICY IF EXISTS "Staff can insert sync logs" ON public.instagram_sync_logs;
CREATE POLICY "Staff can insert sync logs" ON public.instagram_sync_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can update sync logs" ON public.instagram_sync_logs;
CREATE POLICY "Staff can update sync logs" ON public.instagram_sync_logs
  FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()));