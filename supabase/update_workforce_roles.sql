-- 1. SECURE THE EMPLOYEES TABLE
-- Enable RLS
alter table public.employees enable row level security;

-- Drop existing select policy if any
drop policy if exists "Users can view profiles of their companies" on public.employees;
drop policy if exists "Users can view employees of their company" on public.employees;
drop policy if exists "Select employees policy" on public.employees;
drop policy if exists "Manage employees policy" on public.employees;
drop policy if exists "Admins can view all employees" on public.employees;
drop policy if exists "Admins can manage employees" on public.employees;

-- Allow select: Employees can view their own file, and Super Admin/Company Admin can view all
create policy "Select employees policy"
  on public.employees for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.user_companies
      where user_companies.user_id = auth.uid()
      and user_companies.role in ('Super Admin', 'Company Admin')
    )
  );

-- Allow all other actions (insert, update, delete): only for Super Admin and Company Admin
create policy "Manage employees policy"
  on public.employees for all to authenticated
  using (
    exists (
      select 1 from public.user_companies
      where user_companies.user_id = auth.uid()
      and user_companies.role in ('Super Admin', 'Company Admin')
    )
  );


-- 2. SECURE THE USER COMPANIES TABLE
-- Enable RLS
alter table public.user_companies enable row level security;

-- Drop existing policies
drop policy if exists "Users can insert their own company mappings" on public.user_companies;
drop policy if exists "Users can update their own company mappings" on public.user_companies;
drop policy if exists "Users can delete their own company mappings" on public.user_companies;
drop policy if exists "Insert company mappings policy" on public.user_companies;
drop policy if exists "Update company mappings policy" on public.user_companies;
drop policy if exists "Delete company mappings policy" on public.user_companies;

-- Allow select: Any authenticated user can view mappings (needed for role lookups)
-- Note: The existing select policy is "Users can view user companies mappings"

-- Secure Insert: Users can only insert their own company mapping if role is 'Employee', OR if they are Super Admin/Company Admin
create policy "Insert company mappings policy"
  on public.user_companies for insert to authenticated
  with check (
    (auth.uid() = user_id and role = 'Employee')
    or exists (
      select 1 from public.user_companies
      where user_companies.user_id = auth.uid()
      and user_companies.role in ('Super Admin', 'Company Admin')
    )
  );

-- Secure Update: Only Super Admin and Company Admin can update roles
create policy "Update company mappings policy"
  on public.user_companies for update to authenticated
  using (
    exists (
      select 1 from public.user_companies
      where user_companies.user_id = auth.uid()
      and user_companies.role in ('Super Admin', 'Company Admin')
    )
  )
  with check (
    exists (
      select 1 from public.user_companies
      where user_companies.user_id = auth.uid()
      and user_companies.role in ('Super Admin', 'Company Admin')
    )
  );

-- Secure Delete: Only Super Admin and Company Admin can delete company mappings
create policy "Delete company mappings policy"
  on public.user_companies for delete to authenticated
  using (
    exists (
      select 1 from public.user_companies
      where user_companies.user_id = auth.uid()
      and user_companies.role in ('Super Admin', 'Company Admin')
    )
  );
