CREATE TABLE IF NOT EXISTS public.hero_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  title1 text NOT NULL,
  title2 text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  accent text NOT NULL DEFAULT 'primary',
  cta_label text NOT NULL DEFAULT 'Shop Now',
  cta_url text NOT NULL DEFAULT '/sportswear',
  secondary_label text NOT NULL DEFAULT 'Custom Order',
  secondary_url text NOT NULL DEFAULT '/contact',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  draft_data jsonb,
  published_at timestamptz,
  scheduled_publish_at timestamptz
);

GRANT SELECT ON public.hero_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_banners TO authenticated;
GRANT ALL ON public.hero_banners TO service_role;
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published banners"
ON public.hero_banners FOR SELECT
USING (is_active = true AND status = 'published');

CREATE POLICY "Staff can manage banners"
ON public.hero_banners FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

CREATE TABLE IF NOT EXISTS public.publish_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  target_type text NOT NULL CHECK (target_type IN ('product', 'banner')),
  target_id uuid NOT NULL,
  publish_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'cancelled', 'failed')),
  created_by uuid,
  notes text,
  error text,
  published_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.publish_jobs TO authenticated;
GRANT ALL ON public.publish_jobs TO service_role;
ALTER TABLE public.publish_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage publish jobs"
ON public.publish_jobs FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS draft_data jsonb,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS scheduled_publish_at timestamptz;

CREATE OR REPLACE FUNCTION public.set_content_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_hero_banners_updated_at ON public.hero_banners;
CREATE TRIGGER set_hero_banners_updated_at
BEFORE UPDATE ON public.hero_banners
FOR EACH ROW EXECUTE FUNCTION public.set_content_updated_at();

DROP TRIGGER IF EXISTS set_publish_jobs_updated_at ON public.publish_jobs;
CREATE TRIGGER set_publish_jobs_updated_at
BEFORE UPDATE ON public.publish_jobs
FOR EACH ROW EXECUTE FUNCTION public.set_content_updated_at();

INSERT INTO public.hero_banners (title1, title2, subtitle, image_url, accent, cta_label, cta_url, secondary_label, secondary_url, sort_order, is_active, status, published_at)
VALUES
('Unleash Your', 'Ambition', 'Premium Custom Gear', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop', 'primary', 'Shop Now', '/sportswear', 'Custom Order', '/contact', 10, true, 'published', now()),
('Precision', 'Performance', 'Elite Manufacturing', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop', 'primary', 'Shop Now', '/sportswear', 'Custom Order', '/contact', 20, true, 'published', now()),
('One Team', 'One Identity', 'Team Uniforms', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2076&auto=format&fit=crop', 'white', 'Shop Now', '/sportswear', 'Custom Order', '/contact', 30, true, 'published', now()),
('Infinite', 'Design', 'Sublimation Specialists', 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=2070&auto=format&fit=crop', 'primary', 'Shop Now', '/sportswear', 'Custom Order', '/contact', 40, true, 'published', now()),
('Fit For', 'Greatness', 'Activewear Revolution', 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=2062&auto=format&fit=crop', 'primary', 'Shop Now', '/sportswear', 'Custom Order', '/contact', 50, true, 'published', now()),
('Global', 'Performance', 'Worldwide Shipping', 'https://images.unsplash.com/photo-1461896704690-474cb88d599a?q=80&w=2070&auto=format&fit=crop', 'white', 'Shop Now', '/sportswear', 'Custom Order', '/contact', 60, true, 'published', now())
ON CONFLICT DO NOTHING;