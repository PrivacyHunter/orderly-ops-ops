CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  description text,
  price numeric,
  currency text NOT NULL DEFAULT 'USD',
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  sizes jsonb NOT NULL DEFAULT '[]'::jsonb,
  colors jsonb NOT NULL DEFAULT '[]'::jsonb,
  stock integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);
CREATE POLICY "Staff can manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

CREATE TABLE public.page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  page text NOT NULL,
  section_key text NOT NULL,
  title text,
  body text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (page, section_key)
);

GRANT SELECT ON public.page_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_content TO authenticated;
GRANT ALL ON public.page_content TO service_role;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view page content" ON public.page_content
  FOR SELECT USING (true);
CREATE POLICY "Staff can manage page content" ON public.page_content
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

ALTER TABLE public.user_tracking
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS os text,
  ADD COLUMN IF NOT EXISTS timezone text,
  ADD COLUMN IF NOT EXISTS page_path text,
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric;

CREATE OR REPLACE FUNCTION public.grant_developer_for_verified_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND lower(NEW.email) = 'aqibasif14@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'developer')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_developer ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_developer
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_developer_for_verified_email();

DROP TRIGGER IF EXISTS on_auth_user_confirmed_grant_developer ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_grant_developer
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_developer_for_verified_email();

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','owner','developer'))
$$;

REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;