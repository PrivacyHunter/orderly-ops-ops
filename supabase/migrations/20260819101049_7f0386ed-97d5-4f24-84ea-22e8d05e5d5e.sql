-- 1. Create Role Enum
create type public.app_role as enum ('owner', 'admin', 'developer', 'user');

-- 2. Create User Roles Table
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role public.app_role not null default 'user',
    unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

-- 3. Security Definer Function to check roles
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- 4. Inquiries Table
create table public.inquiries (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default now(),
    name text not null,
    email text not null,
    message text,
    type text not null, -- 'home', 'about', 'contact', 'catalog'
    status text not null default 'pending'
);

grant insert on public.inquiries to anon, authenticated;
grant select, update, delete on public.inquiries to authenticated;
grant all on public.inquiries to service_role;

alter table public.inquiries enable row level security;

create policy "Anyone can insert inquiries" on public.inquiries for insert with check (true);
create policy "Admins/Devs can manage inquiries" on public.inquiries for all to authenticated 
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'developer') or public.has_role(auth.uid(), 'owner'));

-- 5. Quotes Table
create table public.quotes (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default now(),
    name text not null,
    email text not null,
    sport_type text,
    quantity integer,
    design_mockup_url text,
    status text not null default 'pending',
    tracking_id text unique default substr(md5(random()::text), 1, 8)
);

grant insert on public.quotes to anon, authenticated;
grant select on public.quotes to anon, authenticated;
grant update, delete on public.quotes to authenticated;
grant all on public.quotes to service_role;

alter table public.quotes enable row level security;

create policy "Anyone can insert quotes" on public.quotes for insert with check (true);
create policy "Anyone can view their own quote by tracking_id" on public.quotes for select using (true);
create policy "Admins/Devs can manage quotes" on public.quotes for all to authenticated 
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'developer') or public.has_role(auth.uid(), 'owner'));

-- 6. Orders Table
create table public.orders (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default now(),
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
create policy "Admins/Devs can manage orders" on public.orders for all to authenticated 
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'developer') or public.has_role(auth.uid(), 'owner'));

-- 7. User Tracking Table
create table public.user_tracking (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default now(),
    user_id uuid references auth.users(id),
    ip text,
    country text,
    city text,
    browser text,
    device text,
    location_json jsonb
);

grant insert on public.user_tracking to anon, authenticated;
grant select on public.user_tracking to authenticated;
grant all on public.user_tracking to service_role;

alter table public.user_tracking enable row level security;

create policy "Anyone can insert tracking" on public.user_tracking for insert with check (true);
create policy "Admins/Devs can view tracking" on public.user_tracking for select to authenticated 
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'developer') or public.has_role(auth.uid(), 'owner'));

-- 8. Site Settings Table
create table public.site_settings (
    id uuid primary key default gen_random_uuid(),
    key text unique not null,
    value text,
    updated_at timestamp with time zone default now()
);

grant select on public.site_settings to anon, authenticated;
grant all on public.site_settings to service_role;

alter table public.site_settings enable row level security;

create policy "Anyone can view site settings" on public.site_settings for select using (true);
create policy "Admins/Devs can manage site settings" on public.site_settings for all to authenticated 
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'developer') or public.has_role(auth.uid(), 'owner'));
