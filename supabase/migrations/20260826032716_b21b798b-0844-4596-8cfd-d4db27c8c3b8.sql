CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission text NOT NULL,
  granted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_permissions TO authenticated;
GRANT ALL ON public.admin_permissions TO service_role;

ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own permissions"
ON public.admin_permissions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Owners and developers can read all permissions"
ON public.admin_permissions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

CREATE POLICY "Owners and developers can grant permissions"
ON public.admin_permissions FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

CREATE POLICY "Owners and developers can revoke permissions"
ON public.admin_permissions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));