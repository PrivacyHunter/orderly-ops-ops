-- Audit logs for theme changes
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'theme_export', 'theme_import', 'theme_rollback'
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view logs" ON public.audit_logs 
FOR SELECT TO authenticated 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

CREATE POLICY "Staff can insert logs" ON public.audit_logs 
FOR INSERT TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

-- Email logs for order confirmations
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    status TEXT NOT NULL, -- 'sent', 'failed'
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT ON public.email_logs TO authenticated;
GRANT ALL ON public.email_logs TO service_role;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view email logs" ON public.email_logs 
FOR SELECT TO authenticated 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

-- Update products table to include cover image and sort order
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='cover_image') THEN
        ALTER TABLE public.products ADD COLUMN cover_image TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sort_order') THEN
        ALTER TABLE public.products ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;
