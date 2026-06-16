// TypeScript interfaces for Construction ERP

export type ERPUserRole =
  | 'Super Admin'
  | 'Company Admin'
  | 'Project Manager'
  | 'Sales'
  | 'Purchasing'
  | 'Warehouse Staff'
  | 'Site Engineer'
  | 'HR'
  | 'Accountant'
  | 'Employee';

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  currency: string;
  settings?: Record<string, any>;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  current_company_id?: string;
  created_at: string;
}

export interface UserCompany {
  id: string;
  user_id: string;
  company_id: string;
  role: ERPUserRole;
  created_at: string;
}

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  is_company: boolean;
  parent_id?: string;
  credit_limit: number;
  created_at: string;
}

export interface CRMLead {
  id: string;
  company_id: string;
  name: string;
  customer_id?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  status: 'new' | 'qualified' | 'proposition' | 'won' | 'lost';
  expected_revenue: number;
  probability: number;
  priority: number; // 1-3
  next_activity?: string;
  next_activity_date?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface ContactHistory {
  id: string;
  customer_id: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  summary: string;
  details?: string;
  performed_by?: string;
  created_at: string;
}

export interface ProductCategory {
  id: string;
  company_id: string;
  name: string;
  parent_id?: string;
  created_at: string;
}

export interface Uom {
  id: string;
  name: string;
  category: string;
  created_at: string;
}

export interface Product {
  id: string;
  company_id: string;
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  uom_id?: string;
  uom?: string;
  sale_price: number;
  cost_price: number;
  is_material: boolean;
  min_qty: number;
  max_qty?: number;
  current_qty: number;
  warehouse_id?: string;
  location?: string;
  manufacturer?: string;
  supplier_id?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  image_url?: string;
  created_at: string;
}

export type WarehouseType = 'raw_materials' | 'finished_goods' | 'tools' | 'defective' | 'quarantine';

export interface Warehouse {
  id: string;
  company_id: string;
  name: string;
  code: string;
  address?: string;
  type?: WarehouseType;
  manager_id?: string;
  manager_name?: string;
  status?: 'active' | 'inactive';
  created_at: string;
}

export interface StockMove {
  id: string;
  company_id: string;
  product_id: string;
  source_warehouse_id?: string;
  dest_warehouse_id?: string;
  qty: number;
  type: 'incoming' | 'outgoing' | 'transfer' | 'adjustment';
  reference?: string;
  created_by?: string;
  created_at: string;
}

export interface SalesOrder {
  id: string;
  company_id: string;
  customer_id?: string;
  order_date: string;
  status: 'draft' | 'sent' | 'sale' | 'done' | 'cancel';
  amount_untaxed: number;
  amount_tax: number;
  amount_total: number;
  created_by?: string;
  created_at: string;
}

export interface SalesOrderLine {
  id: string;
  order_id: string;
  product_id?: string;
  qty: number;
  price_unit: number;
  discount: number;
  amount: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  company_id: string;
  sales_order_id?: string;
  customer_id?: string;
  number: string;
  date: string;
  due_date: string;
  status: 'draft' | 'posted' | 'paid' | 'cancel';
  amount_total: number;
  created_at: string;
}

export interface Payment {
  id: string;
  company_id: string;
  invoice_id?: string;
  date: string;
  method: 'cash' | 'bank' | 'check';
  amount: number;
  reference?: string;
  created_at: string;
}

export interface Vendor {
  id: string;
  company_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  performance_rating: number;
  created_at: string;
}

export interface PurchaseRequest {
  id: string;
  company_id: string;
  requested_by?: string;
  date: string;
  status: 'draft' | 'to_approve' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  company_id: string;
  request_id?: string;
  vendor_id?: string;
  date: string;
  status: 'draft' | 'sent' | 'purchase' | 'done' | 'cancel';
  amount_total: number;
  approved_by?: string;
  created_at: string;
}

export interface Project {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget: number;
  actual_cost: number;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  manager_id?: string;
  progress: number;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  assignee_id?: string;
  start_date?: string;
  due_date?: string;
  hours_estimate: number;
  hours_spent: number;
  created_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  due_date: string;
  status: 'pending' | 'achieved';
  progress: number;
  created_at: string;
}

export interface SiteSurvey {
  id: string;
  project_id: string;
  surveyor_id?: string;
  survey_date: string;
  location_lat?: number;
  location_lng?: number;
  notes?: string;
  signature_url?: string;
  drawing_url?: string;
  photo_urls?: string[];
  created_at: string;
}

export interface FieldService {
  id: string;
  company_id: string;
  assignee_id?: string;
  customer_id?: string;
  date: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  report_details?: string;
  before_photo_url?: string;
  after_photo_url?: string;
  created_at: string;
}

export interface Department {
  id: string;
  company_id: string;
  name: string;
  manager_id?: string;
  created_at: string;
}

export interface Employee {
  id: string;
  company_id: string;
  user_id?: string;
  department_id?: string;
  position: string;
  hire_date: string;
  salary?: number;
  active: boolean;
  created_at: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  date: string;
  check_in: string;
  check_out?: string;
  gps_in: string;
  gps_out?: string;
  address_in?: string;
  address_out?: string;
  photo_in?: string;
  photo_out?: string;
  device_in?: string;
  device_out?: string;
  status: 'on_time' | 'late' | 'early_out' | 'absent' | 'out_of_area';
  shift_id: string;
  overtime_hours: number;
}

export interface Timesheet {
  id: string;
  employee_id: string;
  date: string;
  project_id?: string;
  task_id?: string;
  hours: number;
  description?: string;
  status: 'draft' | 'submitted' | 'approved';
  created_at: string;
}

export interface ChartOfAccount {
  id: string;
  company_id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  active: boolean;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  company_id: string;
  date: string;
  ref?: string;
  state: 'draft' | 'posted';
  created_at: string;
}

export interface JournalItem {
  id: string;
  entry_id: string;
  account_id?: string;
  debit: number;
  credit: number;
  partner_id?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  company_id: string;
  employee_id: string;
  date: string;
  category: 'travel' | 'meals' | 'tools' | 'fuel' | 'other';
  description?: string;
  amount: number;
  receipt_url?: string;
  status: 'draft' | 'to_approve' | 'approved' | 'paid';
  approved_by?: string;
  created_at: string;
}

export interface Approval {
  id: string;
  company_id: string;
  type: 'purchase' | 'material_request' | 'leave' | 'overtime' | 'expense';
  document_id: string;
  step: number;
  approver_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  created_at: string;
}

export interface Folder {
  id: string;
  company_id: string;
  name: string;
  parent_id?: string;
  created_at: string;
}

export interface Document {
  id: string;
  company_id: string;
  name: string;
  folder_id?: string;
  file_url: string;
  size: number;
  file_type: 'pdf' | 'dwg' | 'png' | 'doc';
  version: number;
  project_id?: string;
  created_by?: string;
  created_at: string;
}

// ─── Warehouse Management System Types ───────────────────────────────────────

export type ReceiptType = 'purchase' | 'return' | 'production' | 'adjustment';
export type IssueType = 'sales' | 'production' | 'internal' | 'return_supplier' | 'adjustment';
export type TransferStatus = 'pending' | 'in_transit' | 'completed' | 'cancelled';
export type DocStatus = 'draft' | 'approved' | 'completed' | 'cancelled';
export type CostMethod = 'FIFO' | 'FEFO' | 'LIFO' | 'AVG';

export interface StockReceiptLine {
  id: string;
  receipt_id: string;
  product_id: string;
  product_name?: string;
  sku?: string;
  qty: number;
  unit_price: number;
  amount: number;
  batch_no?: string;
  serial_no?: string;
  location?: string;
}

export interface StockReceipt {
  id: string;
  company_id: string;
  receipt_no: string;
  receipt_type: ReceiptType;
  warehouse_id: string;
  warehouse_name?: string;
  supplier_id?: string;
  supplier_name?: string;
  date: string;
  status: DocStatus;
  notes?: string;
  total_amount: number;
  lines: StockReceiptLine[];
  created_by?: string;
  created_at: string;
}

export interface StockIssueLine {
  id: string;
  issue_id: string;
  product_id: string;
  product_name?: string;
  sku?: string;
  qty_requested: number;
  qty_issued: number;
  unit_price: number;
  amount: number;
  batch_no?: string;
  serial_no?: string;
}

export interface StockIssue {
  id: string;
  company_id: string;
  issue_no: string;
  issue_type: IssueType;
  warehouse_id: string;
  warehouse_name?: string;
  customer_id?: string;
  customer_name?: string;
  department?: string;
  date: string;
  status: DocStatus;
  cost_method: CostMethod;
  notes?: string;
  total_amount: number;
  lines: StockIssueLine[];
  created_by?: string;
  created_at: string;
}

export interface StockTransferLine {
  id: string;
  transfer_id: string;
  product_id: string;
  product_name?: string;
  sku?: string;
  qty: number;
}

export interface StockTransfer {
  id: string;
  company_id: string;
  transfer_no: string;
  source_warehouse_id: string;
  source_warehouse_name?: string;
  dest_warehouse_id: string;
  dest_warehouse_name?: string;
  date: string;
  status: TransferStatus;
  notes?: string;
  lines: StockTransferLine[];
  created_by?: string;
  created_at: string;
}

export interface StockCountLine {
  id: string;
  count_id: string;
  product_id: string;
  product_name?: string;
  sku?: string;
  system_qty: number;
  actual_qty: number;
  difference: number;
  value_difference: number;
  reason?: string;
}

export interface StockCount {
  id: string;
  company_id: string;
  count_no: string;
  warehouse_id: string;
  warehouse_name?: string;
  scope: 'full' | 'zone' | 'category';
  scope_filter?: string;
  date: string;
  status: DocStatus;
  notes?: string;
  lines: StockCountLine[];
  created_by?: string;
  created_at: string;
}

export interface BatchLot {
  id: string;
  company_id: string;
  product_id: string;
  product_name?: string;
  batch_no?: string;
  serial_no?: string;
  manufacture_date?: string;
  expiry_date?: string;
  supplier_id?: string;
  supplier_name?: string;
  warehouse_id?: string;
  qty: number;
  status: 'available' | 'reserved' | 'expired' | 'consumed';
  created_at: string;
}

export type TxnAction = 'stock_in' | 'stock_out' | 'transfer' | 'adjustment' | 'count';

export interface InventoryTransaction {
  id: string;
  company_id: string;
  product_id: string;
  product_name?: string;
  sku?: string;
  action: TxnAction;
  reference_no: string;
  warehouse_id?: string;
  warehouse_name?: string;
  qty_before: number;
  qty_change: number;
  qty_after: number;
  value_change: number;
  performed_by?: string;
  performer_name?: string;
  notes?: string;
  created_at: string;
}
