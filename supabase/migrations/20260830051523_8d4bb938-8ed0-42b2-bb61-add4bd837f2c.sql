CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issuer text NOT NULL DEFAULT '',
  issue_date text NOT NULL DEFAULT '',
  details text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.certificates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active certificates are public" ON public.certificates
FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Staff can read all certificates" ON public.certificates
FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert certificates" ON public.certificates
FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update certificates" ON public.certificates
FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete certificates" ON public.certificates
FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TRIGGER set_certificates_updated_at BEFORE UPDATE ON public.certificates
FOR EACH ROW EXECUTE FUNCTION public.set_content_updated_at();

INSERT INTO public.certificates (title, issuer, issue_date, details, sort_order) VALUES
('ISO 9001:2015', 'Quality Management System', '2024', 'Certified quality management across design, production and export.', 10),
('Chamber of Commerce', 'Sialkot Chamber of Commerce & Industry', '2024', 'Registered exporter and member in good standing.', 20),
('OEKO-TEX Standard 100', 'OEKO-TEX', '2024', 'Tested for harmful substances in every component of the garment.', 30),
('Fair Labor Compliance', 'Independent Social Audit', '2024', 'Verified safe working conditions and fair labour practices.', 40);