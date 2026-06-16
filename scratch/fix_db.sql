-- 1. Trigger function to sync auth.users to public.users_profile
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.users_profile (id, email, full_name, avatar_url, current_company_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Nguyễn Văn Trị'),
    new.raw_user_meta_data->>'avatar_url',
    'c8b671a8-ff69-42b7-a37a-77c86f7881c1'::uuid -- default company
  );
  return new;
end;
$$;

-- 2. Trigger to execute the function on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Sync existing auth users to users_profile (if any registered before this trigger)
insert into public.users_profile (id, email, full_name, avatar_url, current_company_id)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'full_name', 'Nguyễn Văn Trị') as full_name,
  raw_user_meta_data->>'avatar_url' as avatar_url,
  'c8b671a8-ff69-42b7-a37a-77c86f7881c1'::uuid as current_company_id
from auth.users
on conflict (id) do update 
set 
  email = excluded.email,
  full_name = case when users_profile.full_name = 'Super Admin User' then excluded.full_name else users_profile.full_name end;

-- 4. Enable RLS policies for user_companies
alter table public.user_companies enable row level security;

drop policy if exists "Users can view user companies mappings" on public.user_companies;
create policy "Users can view user companies mappings"
    on public.user_companies for select
    to authenticated
    using (true);

drop policy if exists "Users can insert their own company mappings" on public.user_companies;
create policy "Users can insert their own company mappings"
    on public.user_companies for insert
    to authenticated
    with check (auth.uid() = user_id);

drop policy if exists "Users can update their own company mappings" on public.user_companies;
create policy "Users can update their own company mappings"
    on public.user_companies for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own company mappings" on public.user_companies;
create policy "Users can delete their own company mappings"
    on public.user_companies for delete
    to authenticated
    using (auth.uid() = user_id);

-- 5. Map existing auth users to the default company as Super Admin if they don't have a mapping
insert into public.user_companies (user_id, company_id, role)
select 
  id, 
  'c8b671a8-ff69-42b7-a37a-77c86f7881c1'::uuid as company_id,
  'Super Admin' as role
from auth.users
on conflict (user_id, company_id) do nothing;
