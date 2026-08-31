DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active published products"
ON public.products FOR SELECT
USING (is_active = true AND status = 'published');

DROP POLICY IF EXISTS "Staff can manage products" ON public.products;
CREATE POLICY "Permitted staff can manage products"
ON public.products FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'developer')
  OR EXISTS (
    SELECT 1 FROM public.admin_permissions ap
    WHERE ap.user_id = auth.uid() AND ap.permission = 'products'
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'developer')
  OR EXISTS (
    SELECT 1 FROM public.admin_permissions ap
    WHERE ap.user_id = auth.uid() AND ap.permission = 'products'
  )
);

DROP POLICY IF EXISTS "Staff can manage banners" ON public.hero_banners;
CREATE POLICY "Permitted staff can manage banners"
ON public.hero_banners FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'developer')
  OR EXISTS (
    SELECT 1 FROM public.admin_permissions ap
    WHERE ap.user_id = auth.uid() AND ap.permission = 'content'
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'developer')
  OR EXISTS (
    SELECT 1 FROM public.admin_permissions ap
    WHERE ap.user_id = auth.uid() AND ap.permission = 'content'
  )
);

DROP POLICY IF EXISTS "Staff can manage page content" ON public.page_content;
CREATE POLICY "Permitted staff can manage page content"
ON public.page_content FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'developer')
  OR EXISTS (
    SELECT 1 FROM public.admin_permissions ap
    WHERE ap.user_id = auth.uid() AND ap.permission = 'content'
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'developer')
  OR EXISTS (
    SELECT 1 FROM public.admin_permissions ap
    WHERE ap.user_id = auth.uid() AND ap.permission = 'content'
  )
);

DROP POLICY IF EXISTS "Admins/Devs can manage site settings" ON public.site_settings;
CREATE POLICY "Permitted staff can manage site settings"
ON public.site_settings FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'developer')
  OR EXISTS (
    SELECT 1 FROM public.admin_permissions ap
    WHERE ap.user_id = auth.uid() AND ap.permission = 'settings'
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'developer')
  OR EXISTS (
    SELECT 1 FROM public.admin_permissions ap
    WHERE ap.user_id = auth.uid() AND ap.permission = 'settings'
  )
);

DROP POLICY IF EXISTS "Staff can manage publish jobs" ON public.publish_jobs;
CREATE POLICY "Permitted staff can manage publish jobs"
ON public.publish_jobs FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'developer')
  OR EXISTS (
    SELECT 1 FROM public.admin_permissions ap
    WHERE ap.user_id = auth.uid() AND ap.permission IN ('products', 'content')
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'owner')
  OR public.has_role(auth.uid(), 'developer')
  OR EXISTS (
    SELECT 1 FROM public.admin_permissions ap
    WHERE ap.user_id = auth.uid() AND ap.permission IN ('products', 'content')
  )
);