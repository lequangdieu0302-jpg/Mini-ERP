-- =============================================================================
-- STEP 2: SEED DATA AND ENABLE RLS POLICIES
-- Run this script SECOND, after Step 1 has completed successfully!
-- =============================================================================

-- ─── 1. SEED DEFAULT DATA ────────────────────────────────────────────────────

-- Seed Company
INSERT INTO public.companies (id, name, logo_url, address, phone, email, tax_id, currency) VALUES
('c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Công ty Cổ phần Xây dựng Dieule', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=100&q=80', '100 Đường Khuất Duy Tiến, Thanh Xuân, Hà Nội', '024-555-0100', 'info@dieuleconstruction.com.vn', 'MST-010998811', 'VND')
ON CONFLICT (id) DO NOTHING;

-- Seed Shifts & Locations
INSERT INTO public.payroll_shifts (id, name, start_time, end_time, break_minutes, grace_minutes, ot_rate) VALUES
('sh1', 'Ca hành chính văn phòng', '08:00:00', '17:00:00', 60, 15, 1.50),
('sh2', 'Ca sáng nhà máy', '06:00:00', '14:00:00', 30, 10, 1.50),
('sh3', 'Ca chiều nhà máy', '14:00:00', '22:00:00', 30, 10, 1.50),
('sh4', 'Ca đêm nhà máy', '22:00:00', '06:00:00', 45, 10, 2.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.attendance_locations (id, name, lat, lng, radius, active) VALUES
('loc1', 'Văn phòng trụ sở chính Hà Nội (Landmark 72)', 21.016700, 105.783800, 150.00, true),
('loc2', 'Tổng kho Logistics Long Biên', 21.036600, 105.894800, 300.00, true),
('loc3', 'Nhà máy chế tạo cơ khí Bình Dương (VSIP I)', 10.932200, 106.702500, 200.00, true)
ON CONFLICT (id) DO NOTHING;

-- Seed UOM
INSERT INTO public.uom (id, name, category) VALUES
('b0b0b0b0-1111-1111-1111-111111111111', 'Mét', 'length'),
('b0b0b0b0-2222-2222-2222-222222222222', 'Mét vuông', 'area'),
('b0b0b0b0-3333-3333-3333-333333333333', 'Mét khối', 'volume'),
('b0b0b0b0-4444-4444-4444-444444444444', 'Kg', 'weight'),
('b0b0b0b0-5555-5555-5555-555555555555', 'Tấn', 'weight'),
('b0b0b0b0-6666-6666-6666-666666666666', 'Cái/Chiếc', 'unit')
ON CONFLICT (id) DO NOTHING;

-- Seed Product Categories
INSERT INTO public.product_categories (id, company_id, name) VALUES
('c0c0c0c0-1111-1111-1111-111111111111', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Nguyên vật liệu thô'),
('c0c0c0c0-2222-2222-2222-222222222222', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Thép kết cấu'),
('c0c0c0c0-3333-3333-3333-333333333333', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Dịch vụ thi công')
ON CONFLICT (id) DO NOTHING;

-- Seed Warehouses
INSERT INTO public.warehouses (id, company_id, name, code, address) VALUES
('e0e0e0e0-1111-1111-1111-111111111111', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Bãi vật tư Cầu Giấy', 'CGY-01', 'Phường Dịch Vọng Hậu, Cầu Giấy, Hà Nội'),
('e0e0e0e0-2222-2222-2222-222222222222', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Kho trung chuyển Long Biên', 'LBN-02', 'Đường Nguyễn Văn Linh, Long Biên, Hà Nội')
ON CONFLICT (id) DO NOTHING;

-- Seed Products
INSERT INTO public.products (id, company_id, name, sku, barcode, description, category_id, uom_id, sale_price, cost_price, is_material, min_qty, current_qty, image_url) VALUES
('da0da0da-1111-1111-1111-111111111111', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Portland Cement Grade 42.5', 'CEM-PORT-42', '885002010111', 'Standard Portland cement for general construction.', 'c0c0c0c0-1111-1111-1111-111111111111', 'b0b0b0b0-4444-4444-4444-444444444444', 95000.00, 78000.00, true, 1000.00, 2500.00, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=150&q=80'),
('da0da0da-2222-2222-2222-222222222222', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Deformed Steel Rebar 16mm', 'ST-REB-16', '885002010222', 'High strength deformed carbon steel rebar.', 'c0c0c0c0-2222-2222-2222-222222222222', 'b0b0b0b0-5555-5555-5555-555555555555', 16500000.00, 14800000.00, true, 20.00, 45.00, 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=150&q=80'),
('da0da0da-3333-3333-3333-333333333333', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Cát vàng đổ bê tông', 'SND-COARSE', '885002010333', 'Cát sông hạt thô, sạch, chuyên dụng cho trộn bê tông mác cao.', 'c0c0c0c0-1111-1111-1111-111111111111', 'b0b0b0b0-3333-3333-3333-333333333333', 380000.00, 250000.00, true, 200.00, 150.00, null)
ON CONFLICT (id) DO NOTHING;

-- ─── 2. CONFIGURE ROW-LEVEL SECURITY (RLS) POLICIES ─────────────────────────

-- Companies RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Companies viewable by all authenticated users" ON public.companies;
CREATE POLICY "Companies viewable by all authenticated users"
  ON public.companies FOR SELECT TO authenticated
  USING (true);

-- UOM RLS
ALTER TABLE public.uom ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "UOM viewable by all authenticated users" ON public.uom;
CREATE POLICY "UOM viewable by all authenticated users"
  ON public.uom FOR SELECT TO authenticated
  USING (true);

-- Products RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products company access" ON public.products;
CREATE POLICY "Products company access"
  ON public.products FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.user_companies
      where user_companies.user_id = auth.uid()
      and user_companies.company_id = products.company_id
    )
  );

-- Categories RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Product categories company access" ON public.product_categories;
CREATE POLICY "Product categories company access"
  ON public.product_categories FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.user_companies
      where user_companies.user_id = auth.uid()
      and user_companies.company_id = product_categories.company_id
    )
  );

-- Stock Transfers RLS
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock transfers company access" ON public.stock_transfers;
CREATE POLICY "Stock transfers company access"
  ON public.stock_transfers FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.user_companies
      where user_companies.user_id = auth.uid()
      and user_companies.company_id = stock_transfers.company_id
    )
  );

-- Stock Transfer Lines RLS
ALTER TABLE public.stock_transfer_lines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock transfer lines access" ON public.stock_transfer_lines;
CREATE POLICY "Stock transfer lines access"
  ON public.stock_transfer_lines FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.stock_transfers
      where stock_transfers.id = transfer_id
    )
  );

-- Stock Receipts RLS
ALTER TABLE public.stock_receipts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock receipts company access" ON public.stock_receipts;
CREATE POLICY "Stock receipts company access"
  ON public.stock_receipts FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.user_companies
      where user_companies.user_id = auth.uid()
      and user_companies.company_id = stock_receipts.company_id
    )
  );

-- Stock Receipt Lines RLS
ALTER TABLE public.stock_receipt_lines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock receipt lines access" ON public.stock_receipt_lines;
CREATE POLICY "Stock receipt lines access"
  ON public.stock_receipt_lines FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.stock_receipts
      where stock_receipts.id = receipt_id
    )
  );

-- Stock Issues RLS
ALTER TABLE public.stock_issues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock issues company access" ON public.stock_issues;
CREATE POLICY "Stock issues company access"
  ON public.stock_issues FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.user_companies
      where user_companies.user_id = auth.uid()
      and user_companies.company_id = stock_issues.company_id
    )
  );

-- Stock Issue Lines RLS
ALTER TABLE public.stock_issue_lines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock issue lines access" ON public.stock_issue_lines;
CREATE POLICY "Stock issue lines access"
  ON public.stock_issue_lines FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.stock_issues
      where stock_issues.id = issue_id
    )
  );

-- Stock Counts RLS
ALTER TABLE public.stock_counts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock counts company access" ON public.stock_counts;
CREATE POLICY "Stock counts company access"
  ON public.stock_counts FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.user_companies
      where user_companies.user_id = auth.uid()
      and user_companies.company_id = stock_counts.company_id
    )
  );

-- Stock Count Lines RLS
ALTER TABLE public.stock_count_lines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock count lines access" ON public.stock_count_lines;
CREATE POLICY "Stock count lines access"
  ON public.stock_count_lines FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.stock_counts
      where stock_counts.id = count_id
    )
  );

-- Batch Lots RLS
ALTER TABLE public.batch_lots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Batch lots company access" ON public.batch_lots;
CREATE POLICY "Batch lots company access"
  ON public.batch_lots FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.user_companies
      where user_companies.user_id = auth.uid()
      and user_companies.company_id = batch_lots.company_id
    )
  );

-- Inventory Transactions RLS
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Inventory transactions company access" ON public.inventory_transactions;
CREATE POLICY "Inventory transactions company access"
  ON public.inventory_transactions FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.user_companies
      where user_companies.user_id = auth.uid()
      and user_companies.company_id = inventory_transactions.company_id
    )
  );

-- Stock Moves RLS
ALTER TABLE public.stock_moves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock moves company access" ON public.stock_moves;
CREATE POLICY "Stock moves company access"
  ON public.stock_moves FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.user_companies
      where user_companies.user_id = auth.uid()
      and user_companies.company_id = stock_moves.company_id
    )
  );

-- Vendors RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vendors company access" ON public.vendors;
CREATE POLICY "Vendors company access"
  ON public.vendors FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.user_companies
      where user_companies.user_id = auth.uid()
      and user_companies.company_id = vendors.company_id
    )
  );

-- Tasks & Milestones RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tasks access" ON public.tasks;
CREATE POLICY "Tasks access"
  ON public.tasks FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.projects
      where projects.id = project_id
    )
  );

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Milestones access" ON public.milestones;
CREATE POLICY "Milestones access"
  ON public.milestones FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.projects
      where projects.id = project_id
    )
  );

-- Timesheets RLS
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Timesheets access" ON public.timesheets;
CREATE POLICY "Timesheets access"
  ON public.timesheets FOR ALL TO authenticated
  USING (
    exists (
      select 1 from public.employees
      where employees.id = employee_id
    )
  );
