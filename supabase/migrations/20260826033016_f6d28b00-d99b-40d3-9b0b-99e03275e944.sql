DROP POLICY IF EXISTS "Admins/Devs can manage user roles" ON public.user_roles;

CREATE POLICY "Owners and developers can manage user roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'))
WITH CHECK (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

CREATE POLICY "Staff can view roles"
ON public.user_roles FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'developer')
  OR public.has_role(auth.uid(), 'admin')
);