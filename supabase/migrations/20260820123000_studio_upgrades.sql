-- Add captions and analytics to customization_videos
ALTER TABLE public.customization_videos 
ADD COLUMN IF NOT EXISTS captions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS total_plays INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_time_watched INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_pauses INTEGER DEFAULT 0;

-- Update RLS for customization_videos
DROP POLICY IF EXISTS "Public can read customization videos" ON public.customization_videos;
DROP POLICY IF EXISTS "Admins can manage customization videos" ON public.customization_videos;

CREATE POLICY "Public can read published customization videos"
ON public.customization_videos
FOR SELECT
TO public
USING (is_published = true);

CREATE POLICY "Staff can read all customization videos"
ON public.customization_videos
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

CREATE POLICY "Staff can manage customization videos"
ON public.customization_videos
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

-- Track engagement table
CREATE TABLE IF NOT EXISTS public.video_engagement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES public.customization_videos(id) ON DELETE CASCADE,
    visitor_id TEXT,
    action TEXT NOT NULL,
    value INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT ON public.video_engagement TO anon, authenticated;
GRANT ALL ON public.video_engagement TO service_role;

ALTER TABLE public.video_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert engagement logs"
ON public.video_engagement
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Staff can view engagement logs"
ON public.video_engagement
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));
