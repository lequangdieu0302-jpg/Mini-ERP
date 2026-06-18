-- Patches for WMS Performance Optimization
-- This script adds database indexes and aggregation views to support up to 1 million rows.

-- 0. Add missing columns to products table if they don't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS max_qty NUMERIC(12, 3);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS location VARCHAR(100);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 1. Create B-Tree indexes for fast paginated retrieval, search, and sorting
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products (sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products (barcode);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);
CREATE INDEX IF NOT EXISTS idx_products_warehouse ON public.products (warehouse_id);


-- 2. Create B-Tree indexes for transactional tables
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created ON public.inventory_transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product ON public.inventory_transactions (product_id);

CREATE INDEX IF NOT EXISTS idx_stock_receipts_date ON public.stock_receipts (date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_receipt_lines_receipt ON public.stock_receipt_lines (receipt_id);
CREATE INDEX IF NOT EXISTS idx_stock_receipt_lines_product ON public.stock_receipt_lines (product_id);

CREATE INDEX IF NOT EXISTS idx_stock_issues_date ON public.stock_issues (date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_issue_lines_issue ON public.stock_issue_lines (issue_id);
CREATE INDEX IF NOT EXISTS idx_stock_issue_lines_product ON public.stock_issue_lines (product_id);

CREATE INDEX IF NOT EXISTS idx_stock_transfers_date ON public.stock_transfers (date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_transfer_lines_transfer ON public.stock_transfer_lines (transfer_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfer_lines_product ON public.stock_transfer_lines (product_id);

CREATE INDEX IF NOT EXISTS idx_stock_counts_date ON public.stock_counts (date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_count_lines_count ON public.stock_count_lines (count_id);
CREATE INDEX IF NOT EXISTS idx_stock_count_lines_product ON public.stock_count_lines (product_id);

CREATE INDEX IF NOT EXISTS idx_batch_lots_product ON public.batch_lots (product_id);
CREATE INDEX IF NOT EXISTS idx_batch_lots_expiry ON public.batch_lots (expiry_date);

-- 3. Create Warehouse Stock Summary View
CREATE OR REPLACE VIEW public.warehouse_stock_summaries AS
SELECT 
  w.id AS warehouse_id,
  w.name AS warehouse_name,
  w.code AS warehouse_code,
  COUNT(DISTINCT p.id) AS sku_count,
  COALESCE(SUM(p.current_qty), 0) AS total_qty,
  COALESCE(SUM(p.current_qty * p.cost_price), 0) AS total_value
FROM public.warehouses w
LEFT JOIN public.products p ON p.warehouse_id = w.id
GROUP BY w.id, w.name, w.code;

-- 4. Create WMS Dashboard Stats View
CREATE OR REPLACE VIEW public.inventory_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM public.products) AS total_skus,
  (SELECT COALESCE(SUM(current_qty * cost_price), 0) FROM public.products) AS total_value,
  (SELECT COUNT(*) FROM public.products WHERE current_qty < min_qty) AS low_stock_count,
  (SELECT COUNT(*) FROM public.products WHERE max_qty IS NOT NULL AND current_qty > max_qty) AS slow_moving_count,
  (
    SELECT COALESCE(SUM(l.qty), 0) 
    FROM public.stock_receipts r
    JOIN public.stock_receipt_lines l ON l.receipt_id = r.id
    WHERE r.date = CURRENT_DATE
  ) AS received_today;

-- 5. Create Product Category Valuations View
CREATE OR REPLACE VIEW public.product_category_valuations AS
SELECT 
  pc.name AS name,
  COUNT(p.id) AS qty,
  COALESCE(SUM(p.current_qty * p.cost_price), 0) AS value
FROM public.products p
LEFT JOIN public.product_categories pc ON p.category_id = pc.id
GROUP BY pc.name;

-- 6. Create Products Below Min Qty View
CREATE OR REPLACE VIEW public.products_below_min_qty AS
SELECT 
  p.*,
  u.name AS uom,
  pc.name AS category_name
FROM public.products p
LEFT JOIN public.uom u ON p.uom_id = u.id
LEFT JOIN public.product_categories pc ON p.category_id = pc.id
WHERE p.current_qty < p.min_qty;


-- 7. Grant read permissions on views to authenticated users
GRANT SELECT ON public.warehouse_stock_summaries TO authenticated;
GRANT SELECT ON public.inventory_dashboard_stats TO authenticated;
GRANT SELECT ON public.product_category_valuations TO authenticated;
GRANT SELECT ON public.products_below_min_qty TO authenticated;

GRANT SELECT ON public.warehouse_stock_summaries TO anon;
GRANT SELECT ON public.inventory_dashboard_stats TO anon;
GRANT SELECT ON public.product_category_valuations TO anon;
GRANT SELECT ON public.products_below_min_qty TO anon;
