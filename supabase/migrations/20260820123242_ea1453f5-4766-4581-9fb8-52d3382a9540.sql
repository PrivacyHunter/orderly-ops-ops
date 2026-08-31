
-- RE-CREATE customization_videos if missing
CREATE TABLE IF NOT EXISTS public.customization_videos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    video_url text NOT NULL,
    thumbnail_url text,
    display_order integer DEFAULT 0,
    is_published boolean DEFAULT true,
    captions JSONB DEFAULT '[]'::jsonb,
    total_plays INTEGER DEFAULT 0,
    total_time_watched INTEGER DEFAULT 0,
    total_pauses INTEGER DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add new caption columns
ALTER TABLE public.customization_videos 
ADD COLUMN IF NOT EXISTS captions_url text,
ADD COLUMN IF NOT EXISTS captions_raw text;

-- Grants
GRANT SELECT ON public.customization_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customization_videos TO authenticated;
GRANT ALL ON public.customization_videos TO service_role;

-- RLS
ALTER TABLE public.customization_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published videos" ON public.customization_videos;
CREATE POLICY "Public can view published videos"
ON public.customization_videos FOR SELECT
TO anon, authenticated
USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage all videos" ON public.customization_videos;
CREATE POLICY "Admins can manage all videos"
ON public.customization_videos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
