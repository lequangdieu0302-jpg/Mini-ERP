-- =============================================================================
-- STEP 3: FIX RLS POLICIES (RESOLVING COLUMN NAME RESOLUTION BUGS)
-- Run this script in the Supabase Dashboard SQL Editor!
-- =============================================================================

-- ─── 1. FIX COMPANIES RLS ───────────────────────────────────────────────────
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Company dynamic check" ON public.companies;
DROP POLICY IF EXISTS "Companies viewable by all authenticated users" ON public.companies;

CREATE POLICY "Companies viewable by all authenticated users"
  ON public.companies FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can update company details" ON public.companies;
CREATE POLICY "Admins can update company details"
  ON public.companies FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid() AND uc.role IN ('Super Admin', 'Company Admin')
    )
  );

-- ─── 2. FIX PRODUCTS & CATEGORIES RLS ───────────────────────────────────────
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products company access" ON public.products;

CREATE POLICY "Products company access"
  ON public.products FOR ALL TO authenticated
  USING (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  );

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Product categories company access" ON public.product_categories;

CREATE POLICY "Product categories company access"
  ON public.product_categories FOR ALL TO authenticated
  USING (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  );

-- ─── 3. FIX UOM RLS ─────────────────────────────────────────────────────────
ALTER TABLE public.uom ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "UOM viewable by all authenticated users" ON public.uom;

CREATE POLICY "UOM viewable by all authenticated users"
  ON public.uom FOR SELECT TO authenticated
  USING (true);

-- ─── 4. FIX WAREHOUSES RLS ──────────────────────────────────────────────────
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Warehouse stock control" ON public.warehouses;

CREATE POLICY "Warehouse stock control"
  ON public.warehouses FOR ALL TO authenticated
  USING (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  );

-- ─── 5. FIX STOCK TRANSFERS RLS ─────────────────────────────────────────────
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock transfers company access" ON public.stock_transfers;

CREATE POLICY "Stock transfers company access"
  ON public.stock_transfers FOR ALL TO authenticated
  USING (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  );

ALTER TABLE public.stock_transfer_lines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock transfer lines access" ON public.stock_transfer_lines;

CREATE POLICY "Stock transfer lines access"
  ON public.stock_transfer_lines FOR ALL TO authenticated
  USING (
    transfer_id IN (
      SELECT st.id FROM public.stock_transfers st
    )
  )
  WITH CHECK (
    transfer_id IN (
      SELECT st.id FROM public.stock_transfers st
    )
  );

-- ─── 6. FIX STOCK RECEIPTS RLS ──────────────────────────────────────────────
ALTER TABLE public.stock_receipts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock receipts company access" ON public.stock_receipts;

CREATE POLICY "Stock receipts company access"
  ON public.stock_receipts FOR ALL TO authenticated
  USING (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  );

ALTER TABLE public.stock_receipt_lines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock receipt lines access" ON public.stock_receipt_lines;

CREATE POLICY "Stock receipt lines access"
  ON public.stock_receipt_lines FOR ALL TO authenticated
  USING (
    receipt_id IN (
      SELECT sr.id FROM public.stock_receipts sr
    )
  )
  WITH CHECK (
    receipt_id IN (
      SELECT sr.id FROM public.stock_receipts sr
    )
  );

-- ─── 7. FIX STOCK ISSUES RLS ────────────────────────────────────────────────
ALTER TABLE public.stock_issues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock issues company access" ON public.stock_issues;

CREATE POLICY "Stock issues company access"
  ON public.stock_issues FOR ALL TO authenticated
  USING (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  );

ALTER TABLE public.stock_issue_lines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock issue lines access" ON public.stock_issue_lines;

CREATE POLICY "Stock issue lines access"
  ON public.stock_issue_lines FOR ALL TO authenticated
  USING (
    issue_id IN (
      SELECT si.id FROM public.stock_issues si
    )
  )
  WITH CHECK (
    issue_id IN (
      SELECT si.id FROM public.stock_issues si
    )
  );

-- ─── 8. FIX STOCK COUNTS RLS ────────────────────────────────────────────────
ALTER TABLE public.stock_counts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock counts company access" ON public.stock_counts;

CREATE POLICY "Stock counts company access"
  ON public.stock_counts FOR ALL TO authenticated
  USING (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  );

ALTER TABLE public.stock_count_lines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock count lines access" ON public.stock_count_lines;

CREATE POLICY "Stock count lines access"
  ON public.stock_count_lines FOR ALL TO authenticated
  USING (
    count_id IN (
      SELECT sc.id FROM public.stock_counts sc
    )
  )
  WITH CHECK (
    count_id IN (
      SELECT sc.id FROM public.stock_counts sc
    )
  );

-- ─── 9. FIX BATCH LOTS, TRANSACTIONS & MOVES RLS ────────────────────────────
ALTER TABLE public.batch_lots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Batch lots company access" ON public.batch_lots;

CREATE POLICY "Batch lots company access"
  ON public.batch_lots FOR ALL TO authenticated
  USING (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  );

ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Inventory transactions company access" ON public.inventory_transactions;

CREATE POLICY "Inventory transactions company access"
  ON public.inventory_transactions FOR ALL TO authenticated
  USING (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  );

ALTER TABLE public.stock_moves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stock moves company access" ON public.stock_moves;

CREATE POLICY "Stock moves company access"
  ON public.stock_moves FOR ALL TO authenticated
  USING (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  );

-- ─── 10. FIX VENDORS RLS ────────────────────────────────────────────────────
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vendors company access" ON public.vendors;

CREATE POLICY "Vendors company access"
  ON public.vendors FOR ALL TO authenticated
  USING (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = auth.uid()
    )
  );

-- ─── 11. SEED DEFAULT UOM & PRODUCTS IF MISSING ────────────────────────────
-- Ensure the default company exists in the database
INSERT INTO public.companies (id, name, logo_url, address, phone, email, tax_id, currency) VALUES
('c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Công ty Cổ phần Xây dựng Dieule', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=100&q=80', '100 Đường Khuất Duy Tiến, Thanh Xuân, Hà Nội', '024-555-0100', 'info@dieuleconstruction.com.vn', 'MST-010998811', 'VND')
ON CONFLICT (id) DO NOTHING;

-- Seed default units of measure
INSERT INTO public.uom (id, name, category) VALUES
('b0b0b0b0-1111-1111-1111-111111111111', 'Mét', 'length'),
('b0b0b0b0-2222-2222-2222-222222222222', 'Mét vuông', 'area'),
('b0b0b0b0-3333-3333-3333-333333333333', 'Mét khối', 'volume'),
('b0b0b0b0-4444-4444-4444-444444444444', 'Kg', 'weight'),
('b0b0b0b0-5555-5555-5555-555555555555', 'Tấn', 'weight'),
('b0b0b0b0-6666-6666-6666-666666666666', 'Cái/Chiếc', 'unit')
ON CONFLICT (id) DO NOTHING;

-- Seed default categories
INSERT INTO public.product_categories (id, company_id, name) VALUES
('c0c0c0c0-1111-1111-1111-111111111111', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Nguyên vật liệu thô'),
('c0c0c0c0-2222-2222-2222-222222222222', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Thép kết cấu'),
('c0c0c0c0-3333-3333-3333-333333333333', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Dịch vụ thi công')
ON CONFLICT (id) DO NOTHING;

-- Seed default products
INSERT INTO public.products (id, company_id, name, sku, barcode, description, category_id, uom_id, sale_price, cost_price, is_material, min_qty, current_qty, image_url) VALUES
('da0da0da-1111-1111-1111-111111111111', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Portland Cement Grade 42.5', 'CEM-PORT-42', '885002010111', 'Standard Portland cement for general construction.', 'c0c0c0c0-1111-1111-1111-111111111111', 'b0b0b0b0-4444-4444-4444-444444444444', 95000.00, 78000.00, true, 1000.00, 2500.00, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=150&q=80'),
('da0da0da-2222-2222-2222-222222222222', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Deformed Steel Rebar 16mm', 'ST-REB-16', '885002010222', 'High strength deformed carbon steel rebar.', 'c0c0c0c0-2222-2222-2222-222222222222', 'b0b0b0b0-5555-5555-5555-555555555555', 16500000.00, 14800000.00, true, 20.00, 45.00, 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=150&q=80'),
('da0da0da-3333-3333-3333-333333333333', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Cát vàng đổ bê tông', 'SND-COARSE', '885002010333', 'Cát sông hạt thô, sạch, chuyên dụng cho trộn bê tông mác cao.', 'c0c0c0c0-1111-1111-1111-111111111111', 'b0b0b0b0-3333-3333-3333-333333333333', 380000.00, 250000.00, true, 200.00, 150.00, null)
ON CONFLICT (id) DO NOTHING;
