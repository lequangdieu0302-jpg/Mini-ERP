-- =============================================================================
-- STEP 1: CREATE WMS TABLES (IF THEY DO NOT EXIST)
-- Run this script first!
-- =============================================================================

-- Stock Goods Receipt Table (Stock In)
CREATE TABLE IF NOT EXISTS public.stock_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  receipt_no VARCHAR(100) NOT NULL UNIQUE,
  receipt_type TEXT NOT NULL, -- 'purchase', 'return', 'production', 'adjustment'
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'approved', 'completed', 'cancelled'
  notes TEXT,
  total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  created_by UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Stock Goods Receipt Lines Table
CREATE TABLE IF NOT EXISTS public.stock_receipt_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES public.stock_receipts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  qty NUMERIC(12, 3) NOT NULL CHECK (qty > 0),
  unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  batch_no VARCHAR(100),
  serial_no VARCHAR(100),
  location VARCHAR(100)
);

-- Stock Goods Issue Table (Stock Out)
CREATE TABLE IF NOT EXISTS public.stock_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  issue_no VARCHAR(100) NOT NULL UNIQUE,
  issue_type TEXT NOT NULL, -- 'sales', 'production', 'internal', 'return_supplier', 'adjustment'
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  department VARCHAR(100),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'approved', 'completed', 'cancelled'
  cost_method TEXT NOT NULL DEFAULT 'FIFO', -- 'FIFO', 'FEFO', 'LIFO', 'AVG'
  notes TEXT,
  total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  created_by UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Stock Goods Issue Lines Table
CREATE TABLE IF NOT EXISTS public.stock_issue_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.stock_issues(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  qty_requested NUMERIC(12, 3) NOT NULL CHECK (qty_requested > 0),
  qty_issued NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
  unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  batch_no VARCHAR(100),
  serial_no VARCHAR(100)
);

-- Stock Internal Warehouse Transfer Table
CREATE TABLE IF NOT EXISTS public.stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  transfer_no VARCHAR(100) NOT NULL UNIQUE,
  source_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  dest_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_transit', 'completed', 'cancelled'
  notes TEXT,
  created_by UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Stock Internal Warehouse Transfer Lines Table
CREATE TABLE IF NOT EXISTS public.stock_transfer_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES public.stock_transfers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  qty NUMERIC(12, 3) NOT NULL CHECK (qty > 0)
);

-- Stock Inventory Count Register Table
CREATE TABLE IF NOT EXISTS public.stock_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  count_no VARCHAR(100) NOT NULL UNIQUE,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  scope VARCHAR(20) NOT NULL,
  scope_filter VARCHAR(255),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'approved', 'completed', 'cancelled'
  notes TEXT,
  created_by UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Stock Inventory Count Register Lines Table
CREATE TABLE IF NOT EXISTS public.stock_count_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  count_id UUID NOT NULL REFERENCES public.stock_counts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  system_qty NUMERIC(12, 3) NOT NULL,
  actual_qty NUMERIC(12, 3) NOT NULL,
  difference NUMERIC(12, 3) NOT NULL,
  value_difference NUMERIC(15, 2) NOT NULL,
  reason TEXT
);

-- Stock Batches & Serial Tracking Table
CREATE TABLE IF NOT EXISTS public.batch_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  batch_no VARCHAR(100),
  serial_no VARCHAR(100),
  manufacture_date DATE,
  expiry_date DATE,
  supplier_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  qty NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'reserved', 'expired', 'consumed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- WMS Consolidated Transactions Ledger
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'stock_in', 'stock_out', 'transfer', 'adjustment', 'count'
  reference_no VARCHAR(100) NOT NULL,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  qty_before NUMERIC(12, 3) NOT NULL,
  qty_change NUMERIC(12, 3) NOT NULL,
  qty_after NUMERIC(12, 3) NOT NULL,
  value_change NUMERIC(15, 2) NOT NULL,
  performed_by UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
