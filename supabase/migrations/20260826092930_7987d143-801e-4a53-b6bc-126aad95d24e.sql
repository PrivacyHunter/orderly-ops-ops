-- Staff-only write access to the media buckets
CREATE POLICY "Staff can upload media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('site-media','studio-assets') AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can update media" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id IN ('site-media','studio-assets') AND public.is_staff(auth.uid()))
WITH CHECK (bucket_id IN ('site-media','studio-assets') AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete media" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id IN ('site-media','studio-assets') AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can view media" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id IN ('site-media','studio-assets') AND public.is_staff(auth.uid()));

-- Public website may read published, active banner slides
DROP POLICY IF EXISTS "Anyone can view published banners" ON public.hero_banners;
CREATE POLICY "Anyone can view published banners" ON public.hero_banners
FOR SELECT TO anon, authenticated
USING (is_active = true AND status = 'published');

GRANT SELECT ON public.hero_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_banners TO authenticated;
GRANT ALL ON public.hero_banners TO service_role;

-- Public website may read active published products
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products" ON public.products
FOR SELECT TO anon, authenticated
USING (is_active = true AND status = 'published');

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;