-- 1. Roles
create type public.app_role as enum ('owner', 'admin', 'developer', 'user');

create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role public.app_role not null default 'user',
    unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

create policy "Users can view their own roles" on public.user_roles
for select to authenticated using (auth.uid() = user_id);

create policy "Owners and developers can manage user roles" on public.user_roles
for all to authenticated
using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'developer'))
with check (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'developer'));

create policy "Staff can view roles" on public.user_roles
for select to authenticated
using (public.has_role(auth.uid(), 'owner') or public.has_role(auth.uid(), 'developer') or public.has_role(auth.uid(), 'admin'));

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','owner','developer'))
$$;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;

-- 2. Profiles
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text,
    full_name text,
    avatar_url text,
    updated_at timestamptz default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users can view all profiles" on public.profiles for select to authenticated using (true);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Inquiries / quotes / orders / tracking / settings
create table public.inquiries (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz default now(),
    name text not null, email text not null, message text,
    type text not null, status text not null default 'pending'
);
grant insert on public.inquiries to anon, authenticated;
grant select, update, delete on public.inquiries to authenticated;
grant all on public.inquiries to service_role;
alter table public.inquiries enable row level security;
create policy "Anyone can insert inquiries" on public.inquiries for insert with check (true);
create policy "Admins/Devs can manage inquiries" on public.inquiries for all to authenticated
using (public.is_staff(auth.uid()));

create table public.quotes (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz default now(),
    name text not null, email text not null, sport_type text,
    quantity integer, design_mockup_url text,
    status text not null default 'pending',
    tracking_id text unique default substr(md5(random()::text), 1, 8)
);
grant insert on public.quotes to anon, authenticated;
grant select, update, delete on public.quotes to authenticated;
grant all on public.quotes to service_role;
alter table public.quotes enable row level security;
create policy "Anyone can insert quotes" on public.quotes for insert with check (true);
create policy "Admins/Devs can manage quotes" on public.quotes for all to authenticated
using (public.is_staff(auth.uid()));

create table public.orders (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz default now(),
    user_id uuid references auth.users(id),
    email text not null,
    total_amount numeric(10,2) not null,
    stripe_payment_intent_id text unique,
    status text not null default 'pending'
);
grant select on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Users can view their own orders" on public.orders for select to authenticated using (auth.uid() = user_id);
create policy "Admins/Devs can manage orders" on public.orders for all to authenticated using (public.is_staff(auth.uid()));

create table public.user_tracking (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz default now(),
    user_id uuid references auth.users(id),
    ip text, country text, city text, browser text, device text, location_json jsonb,
    postal_code text, region text, os text, timezone text, page_path text,
    latitude numeric, longitude numeric
);
grant insert on public.user_tracking to anon, authenticated;
grant select on public.user_tracking to authenticated;
grant all on public.user_tracking to service_role;
alter table public.user_tracking enable row level security;
create policy "Anyone can insert tracking" on public.user_tracking for insert with check (true);
create policy "Admins/Devs can view tracking" on public.user_tracking for select to authenticated using (public.is_staff(auth.uid()));

create table public.site_settings (
    id uuid primary key default gen_random_uuid(),
    key text unique not null, value text, updated_at timestamptz default now()
);
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "Anyone can view site settings" on public.site_settings for select using (true);

-- 4. Admin permissions
CREATE TABLE public.admin_permissions (
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
CREATE POLICY "Users can read their own permissions" ON public.admin_permissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners and developers can read all permissions" ON public.admin_permissions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));
CREATE POLICY "Owners and developers can grant permissions" ON public.admin_permissions FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));
CREATE POLICY "Owners and developers can revoke permissions" ON public.admin_permissions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'developer'));

CREATE POLICY "Permitted staff can manage site settings" ON public.site_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'developer')
  OR EXISTS (SELECT 1 FROM public.admin_permissions ap WHERE ap.user_id = auth.uid() AND ap.permission = 'settings'))
WITH CHECK (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'developer')
  OR EXISTS (SELECT 1 FROM public.admin_permissions ap WHERE ap.user_id = auth.uid() AND ap.permission = 'settings'));

-- 5. Products + page content
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
  sort_order integer NOT NULL DEFAULT 0,
  cover_image text,
  draft_data jsonb,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published','scheduled')),
  published_at timestamptz,
  scheduled_publish_at timestamptz
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT TO anon, authenticated
USING (is_active = true AND status = 'published');
CREATE POLICY "Permitted staff can manage products" ON public.products FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'developer')
  OR EXISTS (SELECT 1 FROM public.admin_permissions ap WHERE ap.user_id = auth.uid() AND ap.permission = 'products'))
WITH CHECK (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'developer')
  OR EXISTS (SELECT 1 FROM public.admin_permissions ap WHERE ap.user_id = auth.uid() AND ap.permission = 'products'));

CREATE TABLE public.page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  page text NOT NULL,
  section_key text NOT NULL,
  title text, body text, image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (page, section_key)
);
GRANT SELECT ON public.page_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_content TO authenticated;
GRANT ALL ON public.page_content TO service_role;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view page content" ON public.page_content FOR SELECT USING (true);
CREATE POLICY "Permitted staff can manage page content" ON public.page_content FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'developer')
  OR EXISTS (SELECT 1 FROM public.admin_permissions ap WHERE ap.user_id = auth.uid() AND ap.permission = 'content'))
WITH CHECK (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'developer')
  OR EXISTS (SELECT 1 FROM public.admin_permissions ap WHERE ap.user_id = auth.uid() AND ap.permission = 'content'));

-- 6. Developer auto-grant
CREATE OR REPLACE FUNCTION public.grant_developer_for_verified_email()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND lower(NEW.email) = 'aqibasif14@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'developer')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.grant_developer_for_verified_email() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.grant_developer_for_verified_email() FROM anon;
REVOKE EXECUTE ON FUNCTION public.grant_developer_for_verified_email() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.grant_developer_for_verified_email() TO service_role;

CREATE TRIGGER on_auth_user_created_grant_developer
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.grant_developer_for_verified_email();

CREATE TRIGGER on_auth_user_confirmed_grant_developer
AFTER UPDATE OF email_confirmed_at ON auth.users FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_developer_for_verified_email();

-- 7. Logs / theme / reports
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    action_type TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

CREATE TABLE public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient TEXT NOT NULL, subject TEXT NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    status TEXT NOT NULL, error TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT ON public.email_logs TO authenticated;
GRANT ALL ON public.email_logs TO service_role;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view email logs" ON public.email_logs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.theme_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, config JSONB NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT false
);
GRANT SELECT, INSERT, UPDATE ON public.theme_versions TO authenticated;
GRANT ALL ON public.theme_versions TO service_role;
ALTER TABLE public.theme_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage theme versions" ON public.theme_versions FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.scheduled_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, frequency TEXT NOT NULL, recipient_email TEXT NOT NULL,
    columns JSONB NOT NULL, date_range_type TEXT NOT NULL,
    format TEXT DEFAULT 'pdf', last_sent_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_reports TO authenticated;
GRANT ALL ON public.scheduled_reports TO service_role;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage scheduled reports" ON public.scheduled_reports FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- 8. Studio videos
CREATE TABLE public.customization_videos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL, description text,
    video_url text NOT NULL, thumbnail_url text,
    display_order integer DEFAULT 0,
    is_published boolean DEFAULT true,
    captions JSONB DEFAULT '[]'::jsonb,
    captions_url text, captions_raw text,
    caption_style JSONB DEFAULT '{"fontSize": "text-sm", "color": "#ffffff", "position": "bottom"}'::jsonb,
    process_type TEXT DEFAULT 'general',
    total_plays INTEGER DEFAULT 0,
    total_time_watched INTEGER DEFAULT 0,
    total_pauses INTEGER DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.customization_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customization_videos TO authenticated;
GRANT ALL ON public.customization_videos TO service_role;
ALTER TABLE public.customization_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published videos" ON public.customization_videos FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Staff can manage customization videos" ON public.customization_videos FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

INSERT INTO public.customization_videos (title, description, video_url, display_order) VALUES
('Vibrant Sublimation', 'Our high-definition sublimation process fuses ink directly into the fibers, ensuring colors that never fade, crack, or peel.', 'https://player.vimeo.com/external/494163967.hd.mp4?s=97e1694f410c538749a5893a7e4362b667232e01&profile_id=175', 1),
('Precision Heat Transfer', 'Utilizing industrial-grade vinyl and 3D silicone transfers, we deliver sharp, professional logos and player numbers.', 'https://player.vimeo.com/external/494164100.hd.mp4?s=1d5440a40d5884d5930e1c3a6b57904797686b2d&profile_id=175', 2),
('Advanced Bed Operator', 'Our automated bed operating systems ensure perfect fabric alignment and cutting precision.', 'https://player.vimeo.com/external/434045526.sd.mp4?s=c27dbcc6a7604051065961d9006450682022830e&profile_id=165', 3),
('Premium Embroidery', 'Traditional craftsmanship meets modern technology with high-stitch-density crests and text.', 'https://player.vimeo.com/external/394333068.sd.mp4?s=78465d336a992634d101037303f26ca4c5520e7d&profile_id=165', 4);

CREATE TABLE public.video_engagement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES public.customization_videos(id) ON DELETE CASCADE,
    visitor_id TEXT, action TEXT NOT NULL, value INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT ON public.video_engagement TO anon, authenticated;
GRANT ALL ON public.video_engagement TO service_role;
ALTER TABLE public.video_engagement ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert engagement logs" ON public.video_engagement FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff can view engagement logs" ON public.video_engagement FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

create or replace function public.increment_video_stat(vid_id uuid, col text, val integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  execute format('update public.customization_videos set %I = %I + $1 where id = $2', col, col) using val, vid_id;
end;
$$;
REVOKE EXECUTE ON FUNCTION public.increment_video_stat(uuid, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_video_stat(uuid, text, integer) TO anon, authenticated, service_role;

-- 9. Instagram
CREATE TABLE public.instagram_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    access_token TEXT, instagram_user_id TEXT, username TEXT,
    is_connected BOOLEAN DEFAULT false, last_sync TIMESTAMPTZ,
    last_sync_status TEXT DEFAULT 'success', last_sync_error TEXT,
    auto_publish BOOLEAN DEFAULT true,
    webhook_verify_token text, token_expires_at timestamptz,
    caption_language text DEFAULT 'en',
    oauth_state text, oauth_state_expires_at timestamptz,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.instagram_settings TO authenticated;
GRANT ALL ON public.instagram_settings TO service_role;
ALTER TABLE public.instagram_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage instagram settings" ON public.instagram_settings FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.instagram_posts (
    id TEXT PRIMARY KEY,
    media_type TEXT, media_url TEXT, permalink TEXT, caption TEXT, thumbnail_url TEXT,
    timestamp TIMESTAMPTZ, is_visible BOOLEAN DEFAULT true,
    page_target TEXT DEFAULT 'home', category_target TEXT,
    source text DEFAULT 'sync', media_hash text,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT ON public.instagram_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.instagram_posts TO authenticated;
GRANT ALL ON public.instagram_posts TO service_role;
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX instagram_posts_media_hash_key ON public.instagram_posts (media_hash) WHERE media_hash IS NOT NULL;
CREATE POLICY "Public can read visible posts" ON public.instagram_posts FOR SELECT TO anon, authenticated USING (is_visible = true);
CREATE POLICY "Admins can manage posts" ON public.instagram_posts FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.instagram_sync_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    status text NOT NULL, message text, posts_synced integer DEFAULT 0,
    media_id text, payload jsonb DEFAULT '{}'::jsonb,
    error_code text, recommended_action text, resolved boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
GRANT SELECT, INSERT, UPDATE ON public.instagram_sync_logs TO authenticated;
GRANT ALL ON public.instagram_sync_logs TO service_role;
ALTER TABLE public.instagram_sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view instagram logs" ON public.instagram_sync_logs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert sync logs" ON public.instagram_sync_logs FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update sync logs" ON public.instagram_sync_logs FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

-- 10. Newsletter
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  email_status text NOT NULL DEFAULT 'pending',
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_subscribers_email_key UNIQUE (email),
  CONSTRAINT newsletter_subscribers_status_check CHECK (status IN ('active', 'unsubscribed')),
  CONSTRAINT newsletter_subscribers_email_status_check CHECK (email_status IN ('pending', 'sent', 'failed'))
);
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors can subscribe" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (status = 'active');
CREATE POLICY "Staff can view newsletter subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update newsletter subscribers" ON public.newsletter_subscribers FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete newsletter subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.set_content_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
REVOKE EXECUTE ON FUNCTION public.set_content_updated_at() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_content_updated_at() TO service_role;

CREATE TRIGGER set_newsletter_subscriber_updated_at
BEFORE UPDATE ON public.newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION public.set_content_updated_at();

-- 11. Hero banners + publish jobs
CREATE TABLE public.hero_banners (
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
CREATE POLICY "Anyone can view published banners" ON public.hero_banners FOR SELECT TO anon, authenticated
USING (is_active = true AND status = 'published');
CREATE POLICY "Permitted staff can manage banners" ON public.hero_banners FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'developer')
  OR EXISTS (SELECT 1 FROM public.admin_permissions ap WHERE ap.user_id = auth.uid() AND ap.permission IN ('content','banners')))
WITH CHECK (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'developer')
  OR EXISTS (SELECT 1 FROM public.admin_permissions ap WHERE ap.user_id = auth.uid() AND ap.permission IN ('content','banners')));

CREATE TRIGGER set_hero_banners_updated_at
BEFORE UPDATE ON public.hero_banners FOR EACH ROW EXECUTE FUNCTION public.set_content_updated_at();

CREATE TABLE public.publish_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  target_type text NOT NULL CHECK (target_type IN ('product', 'banner')),
  target_id uuid NOT NULL,
  publish_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'cancelled', 'failed')),
  created_by uuid, notes text, error text, published_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publish_jobs TO authenticated;
GRANT ALL ON public.publish_jobs TO service_role;
ALTER TABLE public.publish_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitted staff can manage publish jobs" ON public.publish_jobs FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'developer')
  OR EXISTS (SELECT 1 FROM public.admin_permissions ap WHERE ap.user_id = auth.uid() AND ap.permission IN ('products','content')))
WITH CHECK (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'developer')
  OR EXISTS (SELECT 1 FROM public.admin_permissions ap WHERE ap.user_id = auth.uid() AND ap.permission IN ('products','content')));

CREATE TRIGGER set_publish_jobs_updated_at
BEFORE UPDATE ON public.publish_jobs FOR EACH ROW EXECUTE FUNCTION public.set_content_updated_at();

INSERT INTO public.hero_banners (title1, title2, subtitle, image_url, accent, cta_label, cta_url, secondary_label, secondary_url, sort_order, is_active, status, published_at)
VALUES
('Unleash Your', 'Ambition', 'Premium Custom Gear', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop', 'primary', 'Shop Now', '/sportswear', 'Custom Order', '/contact', 10, true, 'published', now()),
('Precision', 'Performance', 'Elite Manufacturing', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop', 'primary', 'Shop Now', '/sportswear', 'Custom Order', '/contact', 20, true, 'published', now()),
('One Team', 'One Identity', 'Team Uniforms', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2076&auto=format&fit=crop', 'white', 'Shop Now', '/sportswear', 'Custom Order', '/contact', 30, true, 'published', now()),
('Infinite', 'Design', 'Sublimation Specialists', 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=2070&auto=format&fit=crop', 'primary', 'Shop Now', '/sportswear', 'Custom Order', '/contact', 40, true, 'published', now()),
('Fit For', 'Greatness', 'Activewear Revolution', 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=2062&auto=format&fit=crop', 'primary', 'Shop Now', '/sportswear', 'Custom Order', '/contact', 50, true, 'published', now()),
('Global', 'Performance', 'Worldwide Shipping', 'https://images.unsplash.com/photo-1461896704690-474cb88d599a?q=80&w=2070&auto=format&fit=crop', 'white', 'Shop Now', '/sportswear', 'Custom Order', '/contact', 60, true, 'published', now());

-- 12. Storage object policies (buckets created separately)
CREATE POLICY "Public can view media" ON storage.objects
FOR SELECT USING (bucket_id IN ('site-media','studio-assets'));

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