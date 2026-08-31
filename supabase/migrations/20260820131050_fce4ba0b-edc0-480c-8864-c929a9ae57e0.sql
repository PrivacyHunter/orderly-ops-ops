CREATE TABLE IF NOT EXISTS public.instagram_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    status TEXT NOT NULL,
    message TEXT,
    posts_synced INTEGER DEFAULT 0,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

GRANT SELECT ON public.instagram_sync_logs TO authenticated;
GRANT ALL ON public.instagram_sync_logs TO service_role;

ALTER TABLE public.instagram_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs"
ON public.instagram_sync_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

ALTER TABLE public.instagram_settings ADD COLUMN IF NOT EXISTS auto_publish BOOLEAN DEFAULT true;
ALTER TABLE public.instagram_settings ADD COLUMN IF NOT EXISTS last_sync_status TEXT;
ALTER TABLE public.instagram_settings ADD COLUMN IF NOT EXISTS last_sync_error TEXT;
