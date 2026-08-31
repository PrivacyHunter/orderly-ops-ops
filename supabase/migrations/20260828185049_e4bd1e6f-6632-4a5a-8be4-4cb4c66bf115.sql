DROP POLICY IF EXISTS "Public read site media" ON storage.objects;
CREATE POLICY "Public read site media" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('site-media','studio-assets'));