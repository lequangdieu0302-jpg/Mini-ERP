
-- =============================================================================
-- PART 1: CORE DB TRIGGERS, USER PROFILES, AND COMPANY ROLES
-- =============================================================================
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


-- =============================================================================
-- PART 2: ADVANCED PAYROLL & TIME ATTENDANCE SCHEMA
-- =============================================================================
-- =============================================================================
-- 1. CREATE ENUM TYPES SAFELY
-- =============================================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'attendance_status') then
    create type public.attendance_status as enum ('on_time', 'late', 'early_out', 'absent', 'out_of_area');
  end if;
  if not exists (select 1 from pg_type where typname = 'leave_type') then
    create type public.leave_type as enum ('annual', 'sick', 'unpaid', 'personal', 'maternity');
  end if;
  if not exists (select 1 from pg_type where typname = 'ot_category') then
    create type public.ot_category as enum ('weekday', 'sunday', 'holiday');
  end if;
  if not exists (select 1 from pg_type where typname = 'payslip_status') then
    create type public.payslip_status as enum ('draft', 'locked', 'sent');
  end if;
  if not exists (select 1 from pg_type where typname = 'email_status') then
    create type public.email_status as enum ('success', 'failed');
  end if;
  if not exists (select 1 from pg_type where typname = 'approval_status') then
    create type public.approval_status as enum ('pending', 'approved', 'rejected');
  end if;
end;
$$;

-- =============================================================================
-- 2. CREATE PAYROLL & TIME ATTENDANCE TABLES
-- =============================================================================

-- Shift Policies Table
create table if not exists public.payroll_shifts (
  id text primary key, -- 'sh1', 'sh2', etc. to match frontend IDs
  name varchar(100) not null,
  start_time time not null,
  end_time time not null,
  break_minutes int not null default 60,
  grace_minutes int not null default 15,
  ot_rate numeric(3, 2) not null default 1.50
);

-- Geofencing Allowed Locations Table
create table if not exists public.attendance_locations (
  id text primary key, -- 'loc1', 'loc2', etc. to match frontend IDs
  name varchar(255) not null,
  lat numeric(9, 6) not null,
  lng numeric(9, 6) not null,
  radius numeric(6, 2) not null default 100.00,
  active boolean not null default true
);

-- Biometric Timeclock Punches Table
create table if not exists public.payroll_attendance_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  employee_name varchar(255) not null,
  department varchar(255) not null,
  date date not null default current_date,
  check_in timestamp with time zone not null,
  check_out timestamp with time zone,
  gps_in varchar(100) not null,
  gps_out varchar(100),
  address_in text,
  address_out text,
  photo_in text, -- holds base64 file data or image link
  photo_out text,
  device_in varchar(255),
  device_out varchar(255),
  status public.attendance_status not null default 'on_time',
  shift_id text not null references public.payroll_shifts(id) on delete restrict,
  overtime_hours numeric(4, 2) default 0.00
);

-- Leave Vacation Requests Table
create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  employee_name varchar(255) not null,
  department varchar(255) not null,
  type public.leave_type not null,
  start_date date not null,
  end_date date not null,
  reason text not null,
  status public.approval_status not null default 'pending',
  approved_by varchar(255),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Overtime Requests Table
create table if not exists public.overtime_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  employee_name varchar(255) not null,
  department varchar(255) not null,
  date date not null,
  hours numeric(4, 2) not null check (hours > 0),
  type public.ot_category not null,
  reason text not null,
  status public.approval_status not null default 'pending',
  approved_by varchar(255),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Time Correction Adjustments Table
create table if not exists public.attendance_adjustments (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  employee_name varchar(255) not null,
  department varchar(255) not null,
  date date not null,
  requested_check_in time,
  requested_check_out time,
  reason text not null,
  proof_url text,
  status public.approval_status not null default 'pending',
  approved_by varchar(255),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Automated Monthly Payslips Table
create table if not exists public.payslips (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  employee_name varchar(255) not null,
  email varchar(255) not null,
  department varchar(255) not null,
  month varchar(7) not null, -- YYYY-MM
  base_salary numeric(15, 2) not null default 0.00,
  workdays numeric(4, 1) not null default 0.0,
  ot_hours numeric(5, 2) not null default 0.00,
  ot_pay numeric(15, 2) not null default 0.00,
  allowance numeric(15, 2) not null default 0.00,
  bonus numeric(15, 2) not null default 0.00,
  deductions numeric(15, 2) not null default 0.00,
  insurance numeric(15, 2) not null default 0.00,
  tax numeric(15, 2) not null default 0.00,
  net_pay numeric(15, 2) not null default 0.00,
  status public.payslip_status not null default 'draft',
  last_sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(employee_id, month)
);

-- Payslip Email Logs Timeline Table
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  employee_name varchar(255) not null,
  email varchar(255) not null,
  month varchar(7) not null,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status public.email_status not null default 'success',
  error_message text
);

-- Payroll Audit Trails Table
create table if not exists public.payroll_audit_logs (
  id uuid primary key default gen_random_uuid(),
  operator_user varchar(255) not null, -- e.g. 'Emily HR'
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  action varchar(100) not null, -- 'LOCK_PAYROLL'
  details text
);

-- =============================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS) & GENERAL ACCESS POLICIES
-- =============================================================================

-- Enable RLS on core tables (just in case)
alter table public.departments enable row level security;
alter table public.employees enable row level security;

-- Policies for Departments
drop policy if exists "Departments are viewable by all authenticated users" on public.departments;
create policy "Departments are viewable by all authenticated users"
  on public.departments for select to authenticated using (true);

drop policy if exists "HR and Admins can manage departments" on public.departments;
create policy "HR and Admins can manage departments"
  on public.departments for all to authenticated
  using (exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR')));

-- Policies for Employees
drop policy if exists "Employees are viewable by all authenticated users" on public.employees;
create policy "Employees are viewable by all authenticated users"
  on public.employees for select to authenticated using (true);

drop policy if exists "Users can create their own employee record" on public.employees;
create policy "Users can create their own employee record"
  on public.employees for insert to authenticated
  with check (user_id = auth.uid() and company_id in (select company_id from public.user_companies where user_id = auth.uid()));

drop policy if exists "Employees can update own record" on public.employees;
create policy "Employees can update own record"
  on public.employees for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "HR and Admins can manage employees" on public.employees;
create policy "HR and Admins can manage employees"
  on public.employees for all to authenticated
  using (exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR')));


-- Enable RLS on new payroll tables
alter table public.payroll_shifts enable row level security;
alter table public.attendance_locations enable row level security;
alter table public.payroll_attendance_logs enable row level security;
alter table public.leave_requests enable row level security;
alter table public.overtime_requests enable row level security;
alter table public.attendance_adjustments enable row level security;
alter table public.payslips enable row level security;
alter table public.email_logs enable row level security;
alter table public.payroll_audit_logs enable row level security;

-- =============================================================================
-- 4. CREATE RLS POLICIES FOR PAYROLL TABLES
-- =============================================================================

-- Shifts
drop policy if exists "Shifts are viewable by all authenticated users" on public.payroll_shifts;
create policy "Shifts are viewable by all authenticated users"
  on public.payroll_shifts for select to authenticated using (true);

drop policy if exists "Admins and HR can manage shifts" on public.payroll_shifts;
create policy "Admins and HR can manage shifts"
  on public.payroll_shifts for all to authenticated
  using (exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR')));

-- Locations
drop policy if exists "Locations are viewable by all authenticated users" on public.attendance_locations;
create policy "Locations are viewable by all authenticated users"
  on public.attendance_locations for select to authenticated using (true);

drop policy if exists "Admins and HR can manage locations" on public.attendance_locations;
create policy "Admins and HR can manage locations"
  on public.attendance_locations for all to authenticated
  using (exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR')));

-- Attendance Logs
drop policy if exists "Employees can view own attendance logs" on public.payroll_attendance_logs;
create policy "Employees can view own attendance logs"
  on public.payroll_attendance_logs for select to authenticated
  using (
    employee_id in (select id from public.employees where user_id = auth.uid())
    or exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR'))
  );

drop policy if exists "Employees can insert own attendance logs" on public.payroll_attendance_logs;
create policy "Employees can insert own attendance logs"
  on public.payroll_attendance_logs for insert to authenticated
  with check (
    employee_id in (select id from public.employees where user_id = auth.uid())
  );

drop policy if exists "Employees and HR can update own attendance logs" on public.payroll_attendance_logs;
create policy "Employees and HR can update own attendance logs"
  on public.payroll_attendance_logs for update to authenticated
  using (
    employee_id in (select id from public.employees where user_id = auth.uid())
    or exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR'))
  );

-- Leave Requests
drop policy if exists "Users can view own leave requests" on public.leave_requests;
create policy "Users can view own leave requests"
  on public.leave_requests for select to authenticated
  using (
    employee_id in (select id from public.employees where user_id = auth.uid())
    or exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR', 'Project Manager'))
  );

drop policy if exists "Users can insert own leave requests" on public.leave_requests;
create policy "Users can insert own leave requests"
  on public.leave_requests for insert to authenticated
  with check (
    employee_id in (select id from public.employees where user_id = auth.uid())
  );

drop policy if exists "Users and managers can update leave requests" on public.leave_requests;
create policy "Users and managers can update leave requests"
  on public.leave_requests for update to authenticated
  using (
    employee_id in (select id from public.employees where user_id = auth.uid())
    or exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR', 'Project Manager'))
  )
  with check (
    employee_id in (select id from public.employees where user_id = auth.uid())
    or exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR', 'Project Manager'))
  );

-- Overtime Requests
drop policy if exists "Users can view own overtime requests" on public.overtime_requests;
create policy "Users can view own overtime requests"
  on public.overtime_requests for select to authenticated
  using (
    employee_id in (select id from public.employees where user_id = auth.uid())
    or exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR', 'Project Manager'))
  );

drop policy if exists "Users can insert own overtime requests" on public.overtime_requests;
create policy "Users can insert own overtime requests"
  on public.overtime_requests for insert to authenticated
  with check (
    employee_id in (select id from public.employees where user_id = auth.uid())
  );

drop policy if exists "Users and managers can update overtime requests" on public.overtime_requests;
create policy "Users and managers can update overtime requests"
  on public.overtime_requests for update to authenticated
  using (
    employee_id in (select id from public.employees where user_id = auth.uid())
    or exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR', 'Project Manager'))
  )
  with check (
    employee_id in (select id from public.employees where user_id = auth.uid())
    or exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR', 'Project Manager'))
  );

-- Adjustments
drop policy if exists "Users can view own adjustments" on public.attendance_adjustments;
create policy "Users can view own adjustments"
  on public.attendance_adjustments for select to authenticated
  using (
    employee_id in (select id from public.employees where user_id = auth.uid())
    or exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR'))
  );

drop policy if exists "Users can insert own adjustments" on public.attendance_adjustments;
create policy "Users can insert own adjustments"
  on public.attendance_adjustments for insert to authenticated
  with check (
    employee_id in (select id from public.employees where user_id = auth.uid())
  );

drop policy if exists "HR and Admins can update adjustments" on public.attendance_adjustments;
create policy "HR and Admins can update adjustments"
  on public.attendance_adjustments for update to authenticated
  using (
    employee_id in (select id from public.employees where user_id = auth.uid())
    or exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR'))
  )
  with check (
    employee_id in (select id from public.employees where user_id = auth.uid())
    or exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR'))
  );

-- Payslips
drop policy if exists "Users can view own payslips" on public.payslips;
create policy "Users can view own payslips"
  on public.payslips for select to authenticated
  using (
    (employee_id in (select id from public.employees where user_id = auth.uid()) and status in ('locked', 'sent'))
    or exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR', 'Accountant'))
  );

drop policy if exists "HR, Admin, and Accountant can manage payslips" on public.payslips;
create policy "HR, Admin, and Accountant can manage payslips"
  on public.payslips for all to authenticated
  using (
    exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR', 'Accountant'))
  );

-- Email Logs
drop policy if exists "HR and Admins can manage email logs" on public.email_logs;
create policy "HR and Admins can manage email logs"
  on public.email_logs for all to authenticated
  using (
    exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR'))
  );

-- Audit Logs
drop policy if exists "HR and Admins can manage audit logs" on public.payroll_audit_logs;
create policy "HR and Admins can manage audit logs"
  on public.payroll_audit_logs for all to authenticated
  using (
    exists (select 1 from public.user_companies where user_id = auth.uid() and role in ('Super Admin', 'Company Admin', 'HR'))
  );

-- =============================================================================
-- 5. SEED INITIAL SHIFTS AND LOCATIONS
-- =============================================================================
insert into public.payroll_shifts (id, name, start_time, end_time, break_minutes, grace_minutes, ot_rate) values
('sh1', 'Ca hành chính văn phòng', '08:00:00', '17:00:00', 60, 15, 1.50),
('sh2', 'Ca sáng nhà máy', '06:00:00', '14:00:00', 30, 10, 1.50),
('sh3', 'Ca chiều nhà máy', '14:00:00', '22:00:00', 30, 10, 1.50),
('sh4', 'Ca đêm nhà máy', '22:00:00', '06:00:00', 45, 10, 2.00)
on conflict (id) do nothing;

insert into public.attendance_locations (id, name, lat, lng, radius, active) values
('loc1', 'Văn phòng trụ sở chính Hà Nội (Landmark 72)', 21.016700, 105.783800, 150.00, true),
('loc2', 'Tổng kho Logistics Long Biên', 21.036600, 105.894800, 300.00, true),
('loc3', 'Nhà máy chế tạo cơ khí Bình Dương (VSIP I)', 10.932200, 106.702500, 200.00, true)
on conflict (id) do nothing;

