-- PostgreSQL database schema for Construction & Contracting ERP (Odoo-Style)
-- Designed for Supabase with Row Level Security (RLS)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ================================================
-- 1. COMPANIES & USERS CORE
-- ================================================

create table if not exists companies (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    logo_url text,
    address text,
    phone text,
    email text,
    tax_id text,
    currency text default 'USD',
    settings jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists users_profile (
    id uuid primary key, -- References auth.users(id)
    email text not null,
    full_name text not null,
    avatar_url text,
    current_company_id uuid references companies(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists user_companies (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users_profile(id) on delete cascade not null,
    company_id uuid references companies(id) on delete cascade not null,
    role text not null, -- 'Super Admin', 'Company Admin', 'Project Manager', 'Sales', 'Purchasing', 'Warehouse Staff', 'Site Engineer', 'HR', 'Accountant', 'Employee'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, company_id)
);

-- ================================================
-- 2. CRM MODULE
-- ================================================

create table if not exists customers (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    name text not null,
    email text,
    phone text,
    address text,
    is_company boolean default false,
    parent_id uuid references customers(id) on delete set null,
    credit_limit numeric(15, 2) default 0.00,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists crm_leads (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    name text not null, -- Title of opportunity
    customer_id uuid references customers(id) on delete set null,
    contact_name text,
    email text,
    phone text,
    status text default 'new', -- 'new', 'qualified', 'proposition', 'won', 'lost'
    expected_revenue numeric(15, 2) default 0.00,
    probability numeric(5, 2) default 0.00,
    priority integer default 1, -- 1-3 stars
    next_activity text,
    next_activity_date date,
    notes text,
    created_by uuid references users_profile(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists contact_history (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid references customers(id) on delete cascade not null,
    type text not null, -- 'email', 'call', 'meeting', 'note'
    summary text not null,
    details text,
    performed_by uuid references users_profile(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ================================================
-- 3. PRODUCTS & INVENTORY MODULE
-- ================================================

create table if not exists product_categories (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    name text not null,
    parent_id uuid references product_categories(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists uom (
    id uuid primary key default gen_random_uuid(),
    name text not null, -- 'm', 'm2', 'm3', 'kg', 'pcs', 'tons'
    category text not null, -- 'length', 'area', 'volume', 'weight', 'unit'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists products (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    name text not null,
    sku text,
    barcode text,
    description text,
    category_id uuid references product_categories(id) on delete set null,
    uom_id uuid references uom(id) on delete set null,
    sale_price numeric(15, 2) default 0.00,
    cost_price numeric(15, 2) default 0.00,
    is_material boolean default true, -- true for construction sand, rebar, etc. false for service/machinery rental
    min_qty numeric(12, 2) default 0.00,
    current_qty numeric(12, 2) default 0.00,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists warehouses (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    name text not null,
    code text not null,
    address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists stock_moves (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    product_id uuid references products(id) on delete cascade not null,
    source_warehouse_id uuid references warehouses(id) on delete set null,
    dest_warehouse_id uuid references warehouses(id) on delete set null,
    qty numeric(12, 2) not null,
    type text not null, -- 'incoming', 'outgoing', 'transfer', 'adjustment'
    reference text, -- e.g. PO-001, SO-005, ADJ-002
    created_by uuid references users_profile(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ================================================
-- 4. SALES MODULE
-- ================================================

create table if not exists sales_orders (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    customer_id uuid references customers(id) on delete set null,
    order_date timestamp with time zone default timezone('utc'::text, now()) not null,
    status text default 'draft', -- 'draft', 'sent', 'sale', 'done', 'cancel'
    amount_untaxed numeric(15, 2) default 0.00,
    amount_tax numeric(15, 2) default 0.00,
    amount_total numeric(15, 2) default 0.00,
    created_by uuid references users_profile(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists sales_order_lines (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references sales_orders(id) on delete cascade not null,
    product_id uuid references products(id) on delete set null,
    qty numeric(12, 2) not null,
    price_unit numeric(15, 2) not null,
    discount numeric(5, 2) default 0.00, -- percent
    amount numeric(15, 2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists invoices (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    sales_order_id uuid references sales_orders(id) on delete set null,
    customer_id uuid references customers(id) on delete set null,
    number text not null, -- INV/2026/0001
    date date not null,
    due_date date not null,
    status text default 'draft', -- 'draft', 'posted', 'paid', 'cancel'
    amount_total numeric(15, 2) default 0.00,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists payments (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    invoice_id uuid references invoices(id) on delete set null,
    date date not null,
    method text not null, -- 'cash', 'bank', 'check'
    amount numeric(15, 2) not null,
    reference text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ================================================
-- 5. PURCHASE MODULE
-- ================================================

create table if not exists vendors (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    name text not null,
    email text,
    phone text,
    address text,
    performance_rating numeric(3, 2) default 5.00, -- 1.0 to 5.0 scale
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists purchase_requests (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    requested_by uuid references users_profile(id) on delete set null,
    date date default current_date not null,
    status text default 'draft', -- 'draft', 'to_approve', 'approved', 'rejected'
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists purchase_orders (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    request_id uuid references purchase_requests(id) on delete set null,
    vendor_id uuid references vendors(id) on delete set null,
    date date default current_date not null,
    status text default 'draft', -- 'draft', 'sent', 'purchase', 'done', 'cancel'
    amount_total numeric(15, 2) default 0.00,
    approved_by uuid references users_profile(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ================================================
-- 6. PROJECT MANAGEMENT MODULE
-- ================================================

create table if not exists projects (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    name text not null,
    description text,
    start_date date,
    end_date date,
    budget numeric(15, 2) default 0.00,
    actual_cost numeric(15, 2) default 0.00,
    status text default 'planning', -- 'planning', 'active', 'paused', 'completed', 'cancelled'
    manager_id uuid references users_profile(id) on delete set null,
    progress numeric(5, 2) default 0.00,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists tasks (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade not null,
    name text not null,
    description text,
    priority text default 'medium', -- 'low', 'medium', 'high'
    status text default 'todo', -- 'todo', 'in_progress', 'review', 'done'
    assignee_id uuid references users_profile(id) on delete set null,
    start_date date,
    due_date date,
    hours_estimate numeric(6, 2) default 0.00,
    hours_spent numeric(6, 2) default 0.00,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists milestones (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade not null,
    name text not null,
    due_date date not null,
    status text default 'pending', -- 'pending', 'achieved'
    progress numeric(5, 2) default 0.00,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ================================================
-- 7. CONSTRUCTION SITE SURVEY & FIELD SERVICE
-- ================================================

create table if not exists site_surveys (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade not null,
    surveyor_id uuid references users_profile(id) on delete set null,
    survey_date date default current_date not null,
    location_lat double precision,
    location_lng double precision,
    notes text,
    signature_url text, -- customer digital signature stored in storage bucket
    drawing_url text, -- drawing upload
    photo_urls text[] default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists field_services (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    assignee_id uuid references users_profile(id) on delete set null,
    customer_id uuid references customers(id) on delete set null,
    date date default current_date not null,
    status text default 'assigned', -- 'assigned', 'in_progress', 'completed', 'cancelled'
    notes text,
    report_details text,
    before_photo_url text,
    after_photo_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ================================================
-- 8. WORKFORCE, ATTENDANCE & TIMESHEETS
-- ================================================

create table if not exists departments (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    name text not null,
    manager_id uuid references users_profile(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists employees (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    user_id uuid references users_profile(id) on delete set null,
    department_id uuid references departments(id) on delete set null,
    position text not null,
    hire_date date not null,
    salary numeric(15, 2),
    active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists attendance (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid references employees(id) on delete cascade not null,
    date date default current_date not null,
    clock_in timestamp with time zone not null,
    clock_out timestamp with time zone,
    gps_in text, -- 'lat, lng'
    gps_out text,
    photo_in_url text,
    photo_out_url text,
    verified_by_face boolean default false,
    overtime_hours numeric(4, 2) default 0.00,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists timesheets (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid references employees(id) on delete cascade not null,
    date date default current_date not null,
    project_id uuid references projects(id) on delete set null,
    task_id uuid references tasks(id) on delete set null,
    hours numeric(4, 2) not null,
    description text,
    status text default 'draft', -- 'draft', 'submitted', 'approved'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ================================================
-- 9. ACCOUNTING & EXPENSES MODULE
-- ================================================

create table if not exists chart_of_accounts (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    code text not null, -- '1010', '2010', etc.
    name text not null,
    type text not null, -- 'asset', 'liability', 'equity', 'income', 'expense'
    active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(company_id, code)
);

create table if not exists journal_entries (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    date date not null,
    ref text, -- e.g. "INV-2026-0001"
    state text default 'draft', -- 'draft', 'posted'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists journal_items (
    id uuid primary key default gen_random_uuid(),
    entry_id uuid references journal_entries(id) on delete cascade not null,
    account_id uuid references chart_of_accounts(id) on delete set null,
    debit numeric(15, 2) default 0.00,
    credit numeric(15, 2) default 0.00,
    partner_id uuid references customers(id) on delete set null, -- generic customer/vendor
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists expenses (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    employee_id uuid references employees(id) on delete cascade not null,
    date date default current_date not null,
    category text not null, -- 'travel', 'meals', 'tools', 'fuel', 'other'
    description text,
    amount numeric(15, 2) not null,
    receipt_url text,
    status text default 'draft', -- 'draft', 'to_approve', 'approved', 'paid'
    approved_by uuid references users_profile(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ================================================
-- 10. APPROVALS WORKFLOW
-- ================================================

create table if not exists approvals (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    type text not null, -- 'purchase', 'material_request', 'leave', 'overtime', 'expense'
    document_id uuid not null, -- points to tables like purchase_orders, expenses, etc.
    step integer default 1,
    approver_id uuid references users_profile(id) on delete set null,
    status text default 'pending', -- 'pending', 'approved', 'rejected'
    comment text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ================================================
-- 11. DOCUMENT MANAGEMENT
-- ================================================

create table if not exists folders (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    name text not null,
    parent_id uuid references folders(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists documents (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade not null,
    name text not null,
    folder_id uuid references folders(id) on delete set null,
    file_url text not null,
    size integer not null, -- bytes
    file_type text not null, -- 'pdf', 'dwg', 'png', 'doc'
    version integer default 1,
    project_id uuid references projects(id) on delete set null,
    created_by uuid references users_profile(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
alter table companies enable row level security;
alter table users_profile enable row level security;
alter table user_companies enable row level security;
alter table customers enable row level security;
alter table crm_leads enable row level security;
alter table contact_history enable row level security;
alter table product_categories enable row level security;
alter table products enable row level security;
alter table warehouses enable row level security;
alter table stock_moves enable row level security;
alter table sales_orders enable row level security;
alter table sales_order_lines enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;
alter table vendors enable row level security;
alter table purchase_requests enable row level security;
alter table purchase_orders enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table milestones enable row level security;
alter table site_surveys enable row level security;
alter table field_services enable row level security;
alter table departments enable row level security;
alter table employees enable row level security;
alter table attendance enable row level security;
alter table timesheets enable row level security;
alter table chart_of_accounts enable row level security;
alter table journal_entries enable row level security;
alter table journal_items enable row level security;
alter table expenses enable row level security;
alter table approvals enable row level security;
alter table folders enable row level security;
alter table documents enable row level security;

-- Basic policy logic:
-- Users can read, insert, update, delete records associated with the company they are mapped to.
-- Example policies:

create policy "Users can view profiles of their companies"
    on users_profile for select
    using (true);

create policy "Users can update their own profile"
    on users_profile for update
    using (auth.uid() = id);

create policy "Company dynamic check"
    on companies for select
    using (
        exists (
            select 1 from user_companies 
            where user_companies.user_id = auth.uid() 
            and user_companies.company_id = id
        )
    );

create policy "CRM Leads dynamic access"
    on crm_leads for all
    using (
        exists (
            select 1 from user_companies 
            where user_companies.user_id = auth.uid() 
            and user_companies.company_id = company_id
        )
    );

create policy "Customers access control"
    on customers for all
    using (
        exists (
            select 1 from user_companies 
            where user_companies.user_id = auth.uid() 
            and user_companies.company_id = company_id
        )
    );

create policy "Projects company access"
    on projects for all
    using (
        exists (
            select 1 from user_companies 
            where user_companies.user_id = auth.uid() 
            and user_companies.company_id = company_id
        )
    );

create policy "Invoices access policy"
    on invoices for all
    using (
        exists (
            select 1 from user_companies 
            where user_companies.user_id = auth.uid() 
            and user_companies.company_id = company_id
        )
    );

create policy "Warehouse stock control"
    on warehouses for all
    using (
        exists (
            select 1 from user_companies 
            where user_companies.user_id = auth.uid() 
            and user_companies.company_id = company_id
        )
    );

-- ================================================
-- 11. AUTH USER PROFILE SYNCHRONIZATION TRIGGER
-- ================================================

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

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================
-- 12. USER COMPANIES RLS POLICIES
-- ================================================

create policy "Users can view user companies mappings"
    on user_companies for select
    to authenticated
    using (true);

create policy "Users can insert their own company mappings"
    on user_companies for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own company mappings"
    on user_companies for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own company mappings"
    on user_companies for delete
    to authenticated
    using (auth.uid() = user_id);

-- Employees access control
drop policy if exists "Employees company access" on employees;
create policy "Employees company access"
    on employees for select
    to authenticated
    using (
        company_id in (
            select company_id from user_companies where user_id = auth.uid()
        )
    );

drop policy if exists "Users can create their own employee record" on employees;
create policy "Users can create their own employee record"
    on employees for insert
    to authenticated
    with check (
        user_id = auth.uid()
        and company_id in (select company_id from user_companies where user_id = auth.uid())
    );

drop policy if exists "Admins can manage employees" on employees;
create policy "Admins can manage employees"
    on employees for all
    to authenticated
    using (
        exists (
            select 1 from user_companies
            where user_id = auth.uid()
            and company_id = employees.company_id
            and role in ('Super Admin', 'Company Admin', 'HR')
        )
    );

drop policy if exists "Employees can update own record" on employees;
create policy "Employees can update own record"
    on employees for update
    to authenticated
    using (user_id = auth.uid());

-- =============================================================================
-- 13. ADVANCED PAYROLL & TIME ATTENDANCE TABLES
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
  operator_user varchar(255) not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  action varchar(100) not null,
  details text
);

-- Performance Optimization Indexes
create index if not exists idx_payroll_attendance_employee on public.payroll_attendance_logs(employee_id);
create index if not exists idx_payroll_attendance_date on public.payroll_attendance_logs(date);
create index if not exists idx_leave_requests_employee on public.leave_requests(employee_id);
create index if not exists idx_overtime_requests_employee on public.overtime_requests(employee_id);
create index if not exists idx_payslips_employee on public.payslips(employee_id);
create index if not exists idx_payslips_month on public.payslips(month);

-- Enable RLS
alter table public.payroll_shifts enable row level security;
alter table public.attendance_locations enable row level security;
alter table public.payroll_attendance_logs enable row level security;
alter table public.leave_requests enable row level security;
alter table public.overtime_requests enable row level security;
alter table public.attendance_adjustments enable row level security;
alter table public.payslips enable row level security;
alter table public.email_logs enable row level security;
alter table public.payroll_audit_logs enable row level security;

-- RLS Policies

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

-- Seed Data
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


