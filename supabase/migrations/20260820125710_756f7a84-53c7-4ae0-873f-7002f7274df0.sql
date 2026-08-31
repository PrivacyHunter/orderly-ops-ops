DO $$
BEGIN
    -- Add columns to customization_videos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customization_videos' AND column_name = 'caption_style') THEN
        ALTER TABLE public.customization_videos ADD COLUMN caption_style JSONB DEFAULT '{"fontSize": "text-sm", "color": "#ffffff", "position": "bottom"}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customization_videos' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE public.customization_videos ADD COLUMN thumbnail_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customization_videos' AND column_name = 'process_type') THEN
        ALTER TABLE public.customization_videos ADD COLUMN process_type TEXT DEFAULT 'general';
    END IF;
END $$;

-- Create Instagram Settings
CREATE TABLE IF NOT EXISTS public.instagram_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    access_token TEXT,
    instagram_user_id TEXT,
    username TEXT,
    is_connected BOOLEAN DEFAULT false,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Instagram Posts cache
CREATE TABLE IF NOT EXISTS public.instagram_posts (
    id TEXT PRIMARY KEY,
    media_type TEXT,
    media_url TEXT,
    permalink TEXT,
    caption TEXT,
    thumbnail_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE,
    is_visible BOOLEAN DEFAULT true,
    page_target TEXT DEFAULT 'home',
    category_target TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RBAC Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.instagram_settings TO authenticated;
GRANT ALL ON public.instagram_settings TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.instagram_posts TO authenticated;
GRANT SELECT ON public.instagram_posts TO anon;
GRANT ALL ON public.instagram_posts TO service_role;

-- RLS
ALTER TABLE public.instagram_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid errors if they exist
DROP POLICY IF EXISTS "Admins can manage instagram settings" ON public.instagram_settings;
DROP POLICY IF EXISTS "Public can read visible posts" ON public.instagram_posts;
DROP POLICY IF EXISTS "Admins can manage posts" ON public.instagram_posts;

CREATE POLICY "Admins can manage instagram settings"
ON public.instagram_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

CREATE POLICY "Public can read visible posts"
ON public.instagram_posts
FOR SELECT
TO anon, authenticated
USING (is_visible = true);

CREATE POLICY "Admins can manage posts"
ON public.instagram_posts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));
