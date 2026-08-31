
-- Audit logs extension
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS action_type TEXT; -- 'theme', 'role', 'export', 'backup', 'template'
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Theme Versions for rollback
CREATE TABLE IF NOT EXISTS public.theme_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    config JSONB NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT false
);

GRANT SELECT, INSERT, UPDATE ON public.theme_versions TO authenticated;
GRANT ALL ON public.theme_versions TO service_role;
ALTER TABLE public.theme_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage theme versions" ON public.theme_versions
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

-- Scheduled Reports
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    recipient_email TEXT NOT NULL,
    columns JSONB NOT NULL,
    date_range_type TEXT NOT NULL, -- 'last_24h', 'last_7d', 'last_30d'
    format TEXT DEFAULT 'pdf', -- 'pdf', 'csv'
    last_sent_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_reports TO authenticated;
GRANT ALL ON public.scheduled_reports TO service_role;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage scheduled reports" ON public.scheduled_reports
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));
