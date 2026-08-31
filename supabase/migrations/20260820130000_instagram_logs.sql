-- Add logging and status tracking to instagram_settings
ALTER TABLE public.instagram_settings 
ADD COLUMN IF NOT EXISTS last_sync_status text DEFAULT 'success',
ADD COLUMN IF NOT EXISTS last_sync_error text,
ADD COLUMN IF NOT EXISTS auto_publish boolean DEFAULT true;

-- Create instagram_sync_logs table
CREATE TABLE IF NOT EXISTS public.instagram_sync_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    status text NOT NULL, -- 'success', 'error'
    message text,
    posts_synced integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- RLS for logs
ALTER TABLE public.instagram_sync_logs ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.instagram_sync_logs TO authenticated;
GRANT ALL ON public.instagram_sync_logs TO service_role;

CREATE POLICY "Staff can view instagram logs"
ON public.instagram_sync_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'developer') OR public.has_role(auth.uid(), 'moderator'));

