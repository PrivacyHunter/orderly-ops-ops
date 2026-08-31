-- Create bucket for studio assets (videos and thumbnails)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('studio-assets', 'studio-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for studio-assets
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'studio-assets');
CREATE POLICY "Staff Upload" ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'studio-assets' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer')));
CREATE POLICY "Staff Delete" ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'studio-assets' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer')));
