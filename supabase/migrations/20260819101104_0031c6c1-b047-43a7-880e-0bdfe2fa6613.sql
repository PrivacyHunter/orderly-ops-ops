-- Revoke public execution of has_role to satisfy linter, 
-- but we actually need it for RLS. 
-- The linter warns about it because it's in public schema.
-- We will keep it but be explicit about permissions.

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Policies for user_roles
create policy "Users can view their own roles" on public.user_roles
for select to authenticated
using (auth.uid() = user_id);

create policy "Admins/Devs can manage user roles" on public.user_roles
for all to authenticated
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'developer') or public.has_role(auth.uid(), 'owner'));

-- Add a profiles table for better user management
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text,
    full_name text,
    avatar_url text,
    updated_at timestamp with time zone default now()
);

grant select on public.profiles to authenticated;
grant update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "Users can view all profiles" on public.profiles for select to authenticated using (true);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
