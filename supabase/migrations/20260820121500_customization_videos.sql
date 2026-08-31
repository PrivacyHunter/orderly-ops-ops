CREATE TABLE public.customization_videos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    video_url text NOT NULL,
    thumbnail_url text,
    display_order integer DEFAULT 0,
    is_published boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.customization_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customization_videos TO authenticated;
GRANT ALL ON public.customization_videos TO service_role;

ALTER TABLE public.customization_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published videos"
ON public.customization_videos FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE POLICY "Admins can manage all videos"
ON public.customization_videos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

-- Seed data for the customization page
INSERT INTO public.customization_videos (title, description, video_url, display_order)
VALUES 
('Vibrant Sublimation', 'Our high-definition sublimation process fuses ink directly into the fibers, ensuring colors that never fade, crack, or peel.', 'https://player.vimeo.com/external/494163967.hd.mp4?s=97e1694f410c538749a5893a7e4362b667232e01&profile_id=175', 1),
('Precision Heat Transfer', 'Utilizing industrial-grade vinyl and 3D silicone transfers, we deliver sharp, professional logos and player numbers.', 'https://player.vimeo.com/external/494164100.hd.mp4?s=1d5440a40d5884d5930e1c3a6b57904797686b2d&profile_id=175', 2),
('Advanced Bed Operator', 'Our automated bed operating systems ensure perfect fabric alignment and cutting precision.', 'https://player.vimeo.com/external/434045526.sd.mp4?s=c27dbcc6a7604051065961d9006450682022830e&profile_id=165', 3),
('Premium Embroidery', 'Traditional craftsmanship meets modern technology with high-stitch-density crests and text.', 'https://player.vimeo.com/external/394333068.sd.mp4?s=78465d336a992634d101037303f26ca4c5520e7d&profile_id=165', 4);
