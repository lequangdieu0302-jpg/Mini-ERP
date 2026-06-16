'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Company,
  UserProfile,
  Customer,
  CRMLead,
  Product,
  Warehouse,
  Project,
  Task,
  Milestone,
  SiteSurvey,
  Employee,
  Attendance,
  Timesheet,
  ChartOfAccount,
  Invoice,
  SalesOrder,
  SalesOrderLine,
  PurchaseRequest,
  PurchaseOrder,
  Vendor,
  Expense,
  Approval,
  Document,
  Folder,
  ERPUserRole,
  UserCompany,
} from '@/types/erp';
import { createClient } from '@/utils/supabase/client';

// Seed data definitions
const SEED_COMPANIES: Company[] = [
  {
    id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1',
    name: 'Apex Construction Ltd',
    logo_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=100&q=80',
    address: '100 Construction Blvd, New York, NY',
    phone: '+1-555-0100',
    email: 'info@apexconstruction.com',
    tax_id: 'TX-998811',
    currency: 'USD',
    created_at: '2026-06-14T12:00:00Z',
  },
  {
    id: 'c8b671a8-ff69-42b7-a37a-77c86f7882c2',
    name: 'Apex Material Suppliers',
    logo_url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=100&q=80',
    address: '250 Quarry Rd, Jersey City, NJ',
    phone: '+1-555-0200',
    email: 'sales@apexmaterials.com',
    tax_id: 'TX-998822',
    currency: 'USD',
    created_at: '2026-06-14T12:00:00Z',
  },
  {
    id: 'c8b671a8-ff69-42b7-a37a-77c86f7883c3',
    name: 'Summit Builders',
    logo_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=100&q=80',
    address: '50 Industrial Ave, Brooklyn, NY',
    phone: '+1-555-0300',
    email: 'contact@summitbuilders.com',
    tax_id: 'TX-998833',
    currency: 'USD',
    created_at: '2026-06-14T12:00:00Z',
  },
];

const SEED_USERS: UserProfile[] = [
  { id: 'u1', email: 'admin@apex.com', full_name: 'Super Admin User', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', current_company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', created_at: '2026-06-14T12:00:00Z' },
  { id: 'u2', email: 'john@apex.com', full_name: 'John PM', avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', current_company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', created_at: '2026-06-14T12:00:00Z' },
  { id: 'u3', email: 'alice@apex.com', full_name: 'Alice Sales', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', current_company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', created_at: '2026-06-14T12:00:00Z' },
  { id: 'u4', email: 'bob@apex.com', full_name: 'Bob Purchase', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', current_company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', created_at: '2026-06-14T12:00:00Z' },
  { id: 'u5', email: 'charlie@apex.com', full_name: 'Charlie Stock', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', current_company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', created_at: '2026-06-14T12:00:00Z' },
  { id: 'u6', email: 'dave@apex.com', full_name: 'Dave Engineer', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', current_company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', created_at: '2026-06-14T12:00:00Z' },
  { id: 'u7', email: 'emily@apex.com', full_name: 'Emily HR', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', current_company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', created_at: '2026-06-14T12:00:00Z' },
  { id: 'u8', email: 'frank@apex.com', full_name: 'Frank Accountant', avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', current_company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', created_at: '2026-06-14T12:00:00Z' },
];

const USER_ROLES: Record<string, ERPUserRole> = {
  u1: 'Super Admin',
  '00000000-0000-0000-0000-000000000001': 'Super Admin',
  u2: 'Project Manager',
  '00000000-0000-0000-0000-000000000002': 'Project Manager',
  u3: 'Sales',
  '00000000-0000-0000-0000-000000000003': 'Sales',
  u4: 'Purchasing',
  '00000000-0000-0000-0000-000000000004': 'Purchasing',
  u5: 'Warehouse Staff',
  '00000000-0000-0000-0000-000000000005': 'Warehouse Staff',
  u6: 'Site Engineer',
  '00000000-0000-0000-0000-000000000006': 'Site Engineer',
  u7: 'HR',
  '00000000-0000-0000-0000-000000000007': 'HR',
  u8: 'Accountant',
  '00000000-0000-0000-0000-000000000008': 'Accountant',
};

const SEED_CUSTOMERS: Customer[] = [
  { id: 'd1', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'Metropolitan Transit Authority', email: 'procurement@mta.info', phone: '+1-555-0199', address: '347 Madison Ave, New York, NY', is_company: true, credit_limit: 1000000, created_at: '2026-06-14T12:00:00Z' },
  { id: 'd2', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'Empire Realty Corp', email: 'billing@empirerealty.com', phone: '+1-555-0299', address: '350 5th Ave, New York, NY', is_company: true, credit_limit: 500000, created_at: '2026-06-14T12:00:00Z' },
  { id: 'd3', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'David Smith', email: 'david.smith@gmail.com', phone: '+1-555-0399', address: '12 Elm St, Queens, NY', is_company: false, credit_limit: 10000, created_at: '2026-06-14T12:00:00Z' },
];

const SEED_LEADS: CRMLead[] = [
  { id: 'l1', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'Hudson Yards Foundation Phase 3', customer_id: 'd2', contact_name: 'Markus Vance', email: 'mvance@empirerealty.com', phone: '+1-555-4011', status: 'proposition', expected_revenue: 850000, probability: 75, priority: 3, next_activity: 'Follow up email on quotation pricing', next_activity_date: '2026-06-18', notes: 'High priority foundation contract. Client looking for premium quality rebar and quick turnaround.', created_by: 'u3', created_at: '2026-06-12T10:00:00Z' },
  { id: 'l2', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'Queens Subway Line Repair', customer_id: 'd1', contact_name: 'Elena Rostova', email: 'erostova@mta.info', phone: '+1-555-4022', status: 'new', expected_revenue: 1200000, probability: 20, priority: 2, next_activity: 'Call procurement officer', next_activity_date: '2026-06-15', notes: 'Subway tunnel structural reinforcing bid.', created_by: 'u3', created_at: '2026-06-13T11:00:00Z' },
  { id: 'l3', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'Residential Driveway Concrete', customer_id: 'd3', contact_name: 'David Smith', email: 'david.smith@gmail.com', phone: '+1-555-0399', status: 'qualified', expected_revenue: 7500, probability: 50, priority: 1, next_activity: 'Send concrete price list', next_activity_date: '2026-06-16', notes: 'Small driveway repair job.', created_by: 'u3', created_at: '2026-06-14T09:00:00Z' },
];

const SEED_PRODUCTS: Product[] = [
  { id: 'p1', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'Portland Cement Grade 42.5', sku: 'CEM-PORT-42', barcode: '885002010111', description: 'Standard Portland cement for general construction applications.', sale_price: 12.50, cost_price: 8.00, is_material: true, min_qty: 1000, current_qty: 2500, image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=150&q=80', created_at: '2026-06-14T12:00:00Z' },
  { id: 'p2', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'Deformed Steel Rebar 16mm', sku: 'ST-REB-16', barcode: '885002010222', description: 'High strength deformed carbon steel rebar for concrete reinforcement.', sale_price: 850.00, cost_price: 680.00, is_material: true, min_qty: 20, current_qty: 45, image_url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=150&q=80', created_at: '2026-06-14T12:00:00Z' },
  { id: 'p3', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'Coarse River Sand', sku: 'SND-COARSE', barcode: '885002010333', description: 'Washed coarse river sand for mixing mortar and concrete.', sale_price: 45.00, cost_price: 28.00, is_material: true, min_qty: 200, current_qty: 150, image_url: 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=150&q=80', created_at: '2026-06-14T12:00:00Z' },
];

const SEED_WAREHOUSES: Warehouse[] = [
  { id: 'w1', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'Brooklyn Main Yard', code: 'BKL-01', address: '75 Creamer St, Brooklyn, NY', created_at: '2026-06-14T12:00:00Z' },
  { id: 'w2', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'Queens Supply Depot', code: 'QNS-02', address: '104th St, Corona, NY', created_at: '2026-06-14T12:00:00Z' },
];

const SEED_PROJECTS: Project[] = [
  { id: 'proj1', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'Brooklyn Bridge Park Pier 6 Rehab', description: 'Complete rehabilitation of pier concrete columns, deck structure, and public pathways.', start_date: '2026-04-01', end_date: '2026-10-31', budget: 450000, actual_cost: 120000, status: 'active', manager_id: 'u2', progress: 28, created_at: '2026-04-01T08:00:00Z' },
  { id: 'proj2', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'LaGuardia Hangar Structural Reinforcement', description: 'Installation of load bearing structural steel trusses and foundations.', start_date: '2026-06-01', end_date: '2027-02-28', budget: 1350000, actual_cost: 31000, status: 'active', manager_id: 'u2', progress: 8, created_at: '2026-06-01T09:00:00Z' },
];

const SEED_TASKS: Task[] = [
  { id: 't1', project_id: 'proj1', name: 'Site Survey & Mobilization', description: 'Coordinate transport of heavy gear, setup site fences, and initial concrete scanning.', priority: 'high', status: 'done', assignee_id: 'u6', start_date: '2026-04-01', due_date: '2026-04-15', hours_estimate: 80, hours_spent: 85, created_at: '2026-04-01T09:00:00Z' },
  { id: 't2', project_id: 'proj1', name: 'Concrete Pier Demolition & Cleaning', description: 'Jackhammering weak concrete from structural piles and sandblasting steel rebar.', priority: 'medium', status: 'in_progress', assignee_id: 'u6', start_date: '2026-04-16', due_date: '2026-06-30', hours_estimate: 250, hours_spent: 180, created_at: '2026-04-16T08:00:00Z' },
  { id: 't3', project_id: 'proj1', name: 'Rebar Replacement & Anchor Drilling', description: 'Replacing section losses on steel rebar and epoxy-grouting new dowel rods.', priority: 'high', status: 'todo', assignee_id: 'u6', start_date: '2026-07-01', due_date: '2026-08-30', hours_estimate: 180, hours_spent: 0, created_at: '2026-06-01T08:00:00Z' },
  { id: 't4', project_id: 'proj2', name: 'Excavate Foundation Footings', description: 'Exposing underground footings for steel truss anchorage pillars.', priority: 'medium', status: 'in_progress', assignee_id: 'u6', start_date: '2026-06-01', due_date: '2026-07-15', hours_estimate: 120, hours_spent: 75, created_at: '2026-06-01T10:00:00Z' },
];

const SEED_MILESTONES: Milestone[] = [
  { id: 'm1', project_id: 'proj1', name: 'Site clearance and mobilisations', due_date: '2026-04-15', status: 'achieved', progress: 100, created_at: '2026-04-01T08:00:00Z' },
  { id: 'm2', project_id: 'proj1', name: 'Concrete cleaning completion', due_date: '2026-06-30', status: 'pending', progress: 70, created_at: '2026-04-01T08:00:00Z' },
];

const SEED_SITE_SURVEYS: SiteSurvey[] = [
  { id: 'sv1', project_id: 'proj1', surveyor_id: 'u6', survey_date: '2026-04-05', location_lat: 40.7018, location_lng: -73.9968, notes: 'Pier columns exhibit 15% aggregate loss. Rebar exposure identified at low tide mark.', signature_url: 'signature-demo.png', drawing_url: 'sketch-demo.jpg', photo_urls: ['https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80'], created_at: '2026-04-05T14:00:00Z' }
];

const SEED_VENDORS: Vendor[] = [
  { id: 'v1', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'Allied Steel Fabricators', email: 'sales@alliedsteel.com', phone: '+1-555-9011', address: '12 Industry Way, Newark, NJ', performance_rating: 4.8, created_at: '2026-06-14T12:00:00Z' },
  { id: 'v2', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'Concrete Mixers Corp', email: 'logistics@concretecorp.com', phone: '+1-555-9022', address: '88 Dock St, Hoboken, NJ', performance_rating: 4.25, created_at: '2026-06-14T12:00:00Z' }
];

const SEED_EMPLOYEES: Employee[] = [
  { id: 'emp1', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', user_id: 'u6', department_id: 'dept1', position: 'Senior Structural Engineer', hire_date: '2024-01-15', salary: 9500, active: true, created_at: '2026-06-14T12:00:00Z' },
  { id: 'emp2', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', user_id: 'u8', department_id: 'dept2', position: 'Chief Financial Accountant', hire_date: '2023-11-01', salary: 8200, active: true, created_at: '2026-06-14T12:00:00Z' },
];

const SEED_ATTENDANCE: Attendance[] = [
  { id: 'att1', employee_id: 'emp1', employee_name: 'Nguyễn Văn A', department: 'Engineering', date: '2026-06-14', check_in: '2026-06-14T08:00:00Z', check_out: '2026-06-14T17:00:00Z', gps_in: '40.7018, -73.9968', gps_out: '40.7018, -73.9968', status: 'on_time', shift_id: 'sh1', overtime_hours: 1 }
];

const SEED_TIMESHEETS: Timesheet[] = [
  { id: 'ts1', employee_id: 'emp1', date: '2026-06-14', project_id: 'proj1', task_id: 't2', hours: 8, description: 'Supervised pier column cleaning, cleaned concrete fragments', status: 'approved', created_at: '2026-06-14T17:30:00Z' }
];

const SEED_ACCOUNTS: ChartOfAccount[] = [
  { id: 'a1', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', code: '1010', name: 'Bank Operational Account', type: 'asset', active: true, created_at: '2026-06-14T12:00:00Z' },
  { id: 'a2', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', code: '1200', name: 'Accounts Receivable (A/R)', type: 'asset', active: true, created_at: '2026-06-14T12:00:00Z' },
  { id: 'a3', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', code: '1400', name: 'Material Inventory Valuation', type: 'asset', active: true, created_at: '2026-06-14T12:00:00Z' },
  { id: 'a4', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', code: '2010', name: 'Accounts Payable (A/P)', type: 'liability', active: true, created_at: '2026-06-14T12:00:00Z' },
  { id: 'a5', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', code: '4010', name: 'Construction Contract Revenue', type: 'income', active: true, created_at: '2026-06-14T12:00:00Z' },
  { id: 'a6', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', code: '5010', name: 'Material Purchase Expenses', type: 'expense', active: true, created_at: '2026-06-14T12:00:00Z' },
];

const SEED_INVOICES: Invoice[] = [
  { id: 'inv1', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', sales_order_id: 'so1', customer_id: 'd2', number: 'INV/2026/0001', date: '2026-06-10', due_date: '2026-07-10', status: 'posted', amount_total: 12500, created_at: '2026-06-10T12:00:00Z' },
  { id: 'inv2', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', sales_order_id: 'so2', customer_id: 'd1', number: 'INV/2026/0002', date: '2026-06-14', due_date: '2026-07-14', status: 'draft', amount_total: 250000, created_at: '2026-06-14T10:00:00Z' },
];

const SEED_SALES_ORDERS: SalesOrder[] = [
  { id: 'so1', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', customer_id: 'd2', order_date: '2026-06-09T14:00:00Z', status: 'sale', amount_untaxed: 11500, amount_tax: 1000, amount_total: 12500, created_by: 'u3', created_at: '2026-06-09T14:00:00Z' }
];

const SEED_PURCHASE_REQUESTS: PurchaseRequest[] = [
  { id: 'pr1', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', requested_by: 'u6', date: '2026-06-12', status: 'approved', notes: 'Need 50 metric tons of steel rebar for LaGuardia hangar foundation.', created_at: '2026-06-12T09:00:00Z' },
  { id: 'pr2', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', requested_by: 'u6', date: '2026-06-14', status: 'to_approve', notes: 'Requesting emergency concrete mixer trucks for Tuesday morning pour.', created_at: '2026-06-14T11:00:00Z' },
];

const SEED_EXPENSES: Expense[] = [
  { id: 'exp1', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', employee_id: 'emp1', date: '2026-06-12', category: 'tools', description: 'Bought specialized masonry drills at Home Depot', amount: 320, receipt_url: 'receipt-hd.jpg', status: 'approved', approved_by: 'u2', created_at: '2026-06-12T16:00:00Z' },
  { id: 'exp2', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', employee_id: 'emp1', date: '2026-06-14', category: 'fuel', description: 'F-250 Site truck diesel refueling', amount: 85, receipt_url: 'receipt-shell.jpg', status: 'to_approve', created_at: '2026-06-14T14:00:00Z' },
];

const SEED_APPROVALS: Approval[] = [
  { id: 'appr1', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', type: 'expense', document_id: 'exp2', step: 1, approver_id: 'u2', status: 'pending', comment: '', created_at: '2026-06-14T14:05:00Z' },
  { id: 'appr2', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', type: 'material_request', document_id: 'pr2', step: 1, approver_id: 'u2', status: 'pending', comment: '', created_at: '2026-06-14T11:10:00Z' }
];

const SEED_DOCUMENTS: Document[] = [
  { id: 'doc1', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'Pier 6 Structural Inspection Report.pdf', file_url: 'docs/pier_6_inspection.pdf', size: 1048576, file_type: 'pdf', version: 1, project_id: 'proj1', created_by: 'u6', created_at: '2026-04-10T11:00:00Z' },
  { id: 'doc2', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'Truss Reinforcement Details Rev2.dwg', file_url: 'docs/truss_reinforcement_rev2.dwg', size: 5242880, file_type: 'dwg', version: 2, project_id: 'proj2', created_by: 'u6', created_at: '2026-06-05T09:30:00Z' },
  { id: 'doc3', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', name: 'LaGuardia Subcontracting Contract.pdf', file_url: 'docs/laguardia_contract.pdf', size: 2097152, file_type: 'pdf', version: 1, project_id: 'proj2', created_by: 'u1', created_at: '2026-05-28T10:00:00Z' },
];

// Context Type definition
interface ERPContextType {
  companies: Company[];
  users: UserProfile[];
  customers: Customer[];
  leads: CRMLead[];
  products: Product[];
  warehouses: Warehouse[];
  projects: Project[];
  tasks: Task[];
  milestones: Milestone[];
  siteSurveys: SiteSurvey[];
  vendors: Vendor[];
  employees: Employee[];
  attendance: Attendance[];
  timesheets: Timesheet[];
  accounts: ChartOfAccount[];
  invoices: Invoice[];
  salesOrders: SalesOrder[];
  purchaseRequests: PurchaseRequest[];
  expenses: Expense[];
  approvals: Approval[];
  documents: Document[];
  
  activeCompanyId: string;
  setActiveCompanyId: (id: string) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  activeRole: ERPUserRole;
  language: 'en' | 'vi';
  setLanguage: (lang: 'en' | 'vi') => void;
  t: (key: string) => string;
  userCompanies: UserCompany[];
  updateUserRole: (userId: string, role: ERPUserRole) => Promise<boolean>;
  updateAvatarUrl: (url: string) => Promise<boolean>;
  addEmployee: (emp: Partial<Employee>) => Promise<boolean>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<boolean>;

  // Actions
  addLead: (lead: Partial<CRMLead>) => void;
  updateLead: (id: string, updates: Partial<CRMLead>) => void;
  addCustomer: (cust: Partial<Customer>) => void;
  addProduct: (prod: Partial<Product>) => void;
  createSalesOrder: (so: Partial<SalesOrder>, lines: Partial<SalesOrderLine>[]) => void;
  createPurchaseRequest: (pr: Partial<PurchaseRequest>) => void;
  createProject: (proj: Partial<Project>) => void;
  addTask: (task: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  addSiteSurvey: (survey: Partial<SiteSurvey>) => void;
  clockIn: (employeeId: string, employeeName: string, department: string, shiftId: string, gps: string, address: string, photo: string, device: string, status: string) => void;
  clockOut: (attendanceId: string, gps: string, address: string, photo: string, device: string, overtimeHours: number) => void;
  addTimesheet: (ts: Partial<Timesheet>) => void;
  addExpense: (exp: Partial<Expense>) => void;
  updateApproval: (id: string, status: 'approved' | 'rejected', comment?: string) => void;
  addDocument: (doc: Partial<Document>) => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const EMPTY_USER: UserProfile = {
  id: '',
  email: '',
  full_name: '',
  avatar_url: '',
  current_company_id: '',
  created_at: '',
};

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = createClient();
  const [activeCompanyId, setActiveCompanyId] = useState('');
  const [currentUser, setCurrentUser] = useState<UserProfile>(EMPTY_USER);
  const [activeRole, setActiveRole] = useState<ERPUserRole>('Employee');

  // Load state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [siteSurveys, setSiteSurveys] = useState<SiteSurvey[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Load data from Supabase
  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        const { data: companiesData } = await supabase.from('companies').select('*');
        if (companiesData && companiesData.length > 0) setCompanies(companiesData);

        const { data: usersData } = await supabase.from('users_profile').select('*');
        if (usersData && usersData.length > 0) {
          setUsers(usersData);
          // Only set default user if currentUser is still empty (no logged-in session)
          if (!currentUser.id) {
            const defaultUser = usersData.find(u => u.email === 'admin@apex.com');
            if (defaultUser) setCurrentUser(defaultUser);
          }
        }

        const { data: userCompaniesData } = await supabase.from('user_companies').select('*');
        if (userCompaniesData && userCompaniesData.length > 0) setUserCompanies(userCompaniesData);

        const { data: customersData } = await supabase.from('customers').select('*');
        if (customersData && customersData.length > 0) setCustomers(customersData);

        const { data: leadsData } = await supabase.from('crm_leads').select('*');
        if (leadsData && leadsData.length > 0) setLeads(leadsData);

        const { data: productsData } = await supabase.from('products').select('*');
        if (productsData && productsData.length > 0) setProducts(productsData);

        const { data: warehousesData } = await supabase.from('warehouses').select('*');
        if (warehousesData && warehousesData.length > 0) setWarehouses(warehousesData);

        const { data: projectsData } = await supabase.from('projects').select('*');
        if (projectsData && projectsData.length > 0) setProjects(projectsData);

        const { data: tasksData } = await supabase.from('tasks').select('*');
        if (tasksData && tasksData.length > 0) setTasks(tasksData);

        const { data: milestonesData } = await supabase.from('milestones').select('*');
        if (milestonesData && milestonesData.length > 0) setMilestones(milestonesData);

        const { data: siteSurveysData } = await supabase.from('site_surveys').select('*');
        if (siteSurveysData && siteSurveysData.length > 0) setSiteSurveys(siteSurveysData);

        const { data: vendorsData } = await supabase.from('vendors').select('*');
        if (vendorsData && vendorsData.length > 0) setVendors(vendorsData);

        const { data: employeesData } = await supabase.from('employees').select('*');
        if (employeesData && employeesData.length > 0) setEmployees(employeesData);

        const { data: attendanceData } = await supabase.from('payroll_attendance_logs').select('*').order('check_in', { ascending: false });
        if (attendanceData && attendanceData.length > 0) setAttendance(attendanceData);

        const { data: timesheetsData } = await supabase.from('timesheets').select('*');
        if (timesheetsData && timesheetsData.length > 0) setTimesheets(timesheetsData);

        const { data: accountsData } = await supabase.from('chart_of_accounts').select('*');
        if (accountsData && accountsData.length > 0) setAccounts(accountsData);

        const { data: invoicesData } = await supabase.from('invoices').select('*');
        if (invoicesData && invoicesData.length > 0) setInvoices(invoicesData);

        const { data: salesOrdersData } = await supabase.from('sales_orders').select('*');
        if (salesOrdersData && salesOrdersData.length > 0) setSalesOrders(salesOrdersData);

        const { data: prData } = await supabase.from('purchase_requests').select('*');
        if (prData && prData.length > 0) setPurchaseRequests(prData);

        const { data: expensesData } = await supabase.from('expenses').select('*');
        if (expensesData && expensesData.length > 0) setExpenses(expensesData);

        const { data: approvalsData } = await supabase.from('approvals').select('*');
        if (approvalsData && approvalsData.length > 0) setApprovals(approvalsData);

        const { data: docsData } = await supabase.from('documents').select('*');
        if (docsData && docsData.length > 0) setDocuments(docsData);
      } catch (err) {
        console.error("Error loading data from Supabase:", err);
      }
    };
    fetchSupabaseData();
  }, [supabase, currentUser?.id]);

  // Listen to Auth State Changes and handle app foreground/visibility changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch users profile from Supabase
        const { data: profile } = await supabase
          .from('users_profile')
          .select('*')
          .eq('id', session.user.id)
          .single();

         if (profile) {
          setCurrentUser(profile);
          if (profile.current_company_id) {
            setActiveCompanyId(profile.current_company_id);
          }
          
          // Get role
          const companyId = profile.current_company_id || 'c8b671a8-ff69-42b7-a37a-77c86f7881c1';
          const { data: userComp } = await supabase
            .from('user_companies')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('company_id', companyId)
            .single();

          if (userComp) {
            setActiveRole(userComp.role as ERPUserRole);
          } else {
            // Auto-create user company mapping as Employee
            const { error: insertRoleErr } = await supabase
              .from('user_companies')
              .insert({
                user_id: session.user.id,
                company_id: companyId,
                role: 'Employee'
              });
            if (!insertRoleErr) {
              setActiveRole('Employee');
              const { data: ucData } = await supabase.from('user_companies').select('*');
              if (ucData) setUserCompanies(ucData);
            } else {
              console.error("Error auto-creating user_companies mapping:", insertRoleErr);
            }
          }

          // Auto-create employee record if it doesn't exist for this company
          const { data: existingEmp } = await supabase
            .from('employees')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('company_id', companyId)
            .maybeSingle();

          if (!existingEmp) {
            const { error: insertEmpErr } = await supabase.from('employees').insert({
              company_id: companyId,
              user_id: session.user.id,
              position: 'Nhân viên',
              hire_date: new Date().toISOString().split('T')[0],
              active: true,
            });
            if (insertEmpErr) {
              console.error("Error auto-creating employee record:", insertEmpErr);
            } else {
              // Re-fetch employees list so the new record is available
              const { data: empData } = await supabase.from('employees').select('*');
              if (empData && empData.length > 0) setEmployees(empData);
            }
          }
        }
      } else {
        // Fallback user / reset if logged out
        setCurrentUser(EMPTY_USER);
        setActiveRole('Employee');
      }
    });

    // Proactively refresh session when app comes to foreground or page is focused
    // to prevent suspended/expired tokens from failing database queries
    const handleVisibilityOrFocus = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        try {
          // getSession() automatically refreshes expired token using refresh token
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log("Supabase session refreshed on focus/visibility change.");
          }
        } catch (e) {
          console.warn("Failed to check/refresh session on focus:", e);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [supabase]);

  // Sync role when activeCompanyId or currentUser changes
  useEffect(() => {
    const updateRoleForCompany = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && activeCompanyId) {
        // Update user profile in public schema to track their active company
        await supabase
          .from('users_profile')
          .update({ current_company_id: activeCompanyId })
          .eq('id', session.user.id);

        // Fetch their role for the active company
        const { data: userComp } = await supabase
          .from('user_companies')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('company_id', activeCompanyId)
          .single();

        if (userComp) {
          setActiveRole(userComp.role as ERPUserRole);
        } else {
          // Auto-create role mapping as Employee for this company
          const { error: insertRoleErr } = await supabase
            .from('user_companies')
            .insert({
              user_id: session.user.id,
              company_id: activeCompanyId,
              role: 'Employee'
            });
          if (!insertRoleErr) {
            setActiveRole('Employee');
            const { data: ucData } = await supabase.from('user_companies').select('*');
            if (ucData) setUserCompanies(ucData);
          } else {
            setActiveRole('Employee');
          }
        }

        // Auto-create employee record for this active company if it doesn't exist
        const { data: existingEmp } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('company_id', activeCompanyId)
          .maybeSingle();

        if (!existingEmp) {
          const { error: insertEmpErr } = await supabase.from('employees').insert({
            company_id: activeCompanyId,
            user_id: session.user.id,
            position: 'Nhân viên',
            hire_date: new Date().toISOString().split('T')[0],
            active: true,
          });
          if (insertEmpErr) {
            console.error("Error auto-creating employee record:", insertEmpErr);
          } else {
            const { data: empData } = await supabase.from('employees').select('*');
            if (empData && empData.length > 0) setEmployees(empData);
          }
        }
      }
    };

    updateRoleForCompany();
  }, [activeCompanyId, currentUser.id, supabase]);

  // Actions implementation
  const addLead = (lead: Partial<CRMLead>) => {
    const newLead: CRMLead = {
      id: `l-${Date.now()}`,
      company_id: activeCompanyId,
      name: lead.name || 'Untitled Opportunity',
      status: lead.status || 'new',
      expected_revenue: Number(lead.expected_revenue) || 0,
      probability: Number(lead.probability) || 10,
      priority: lead.priority || 1,
      contact_name: lead.contact_name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      next_activity: lead.next_activity || '',
      next_activity_date: lead.next_activity_date || '',
      notes: lead.notes || '',
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
  };

  const updateLead = (id: string, updates: Partial<CRMLead>) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead))
    );
  };

  const addCustomer = (cust: Partial<Customer>) => {
    const newCust: Customer = {
      id: `d-${Date.now()}`,
      company_id: activeCompanyId,
      name: cust.name || 'Unnamed Client',
      email: cust.email || '',
      phone: cust.phone || '',
      address: cust.address || '',
      is_company: cust.is_company || false,
      credit_limit: cust.credit_limit || 0,
      created_at: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
  };

  const addProduct = (prod: Partial<Product>) => {
    const newProd: Product = {
      id: `p-${Date.now()}`,
      company_id: activeCompanyId,
      name: prod.name || 'Unnamed Product',
      sku: prod.sku || '',
      barcode: prod.barcode || '',
      description: prod.description || '',
      sale_price: Number(prod.sale_price) || 0,
      cost_price: Number(prod.cost_price) || 0,
      is_material: prod.is_material !== undefined ? prod.is_material : true,
      min_qty: Number(prod.min_qty) || 0,
      current_qty: Number(prod.current_qty) || 0,
      image_url: prod.image_url || 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=150&q=80',
      created_at: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
  };

  const updateUserRole = async (userId: string, role: ERPUserRole): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_companies')
        .upsert({
          user_id: userId,
          company_id: activeCompanyId,
          role
        }, {
          onConflict: 'user_id,company_id'
        });
      if (error) {
        console.error("Error updating user role:", error);
        return false;
      }
      setUserCompanies(prev => {
        const exists = prev.some(uc => uc.user_id === userId && uc.company_id === activeCompanyId);
        if (exists) {
          return prev.map(uc => uc.user_id === userId && uc.company_id === activeCompanyId ? { ...uc, role } : uc);
        } else {
          return [...prev, { id: `uc-${Date.now()}`, user_id: userId, company_id: activeCompanyId, role, created_at: new Date().toISOString() }];
        }
      });
      if (userId === currentUser.id) {
        setActiveRole(role);
      }
      return true;
    } catch (err) {
      console.error("Error in updateUserRole:", err);
      return false;
    }
  };

  const updateAvatarUrl = async (url: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('users_profile')
        .update({ avatar_url: url })
        .eq('id', currentUser.id);
      if (error) {
        console.error("Error updating avatar:", error);
        return false;
      }
      setCurrentUser(prev => ({ ...prev, avatar_url: url }));
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, avatar_url: url } : u));
      return true;
    } catch (err) {
      console.error("Error in updateAvatarUrl:", err);
      return false;
    }
  };

  const addEmployee = async (emp: Partial<Employee>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert({
          company_id: activeCompanyId,
          user_id: emp.user_id || null,
          position: emp.position || 'Nhân viên',
          hire_date: emp.hire_date || new Date().toISOString().split('T')[0],
          salary: emp.salary || null,
          department_id: emp.department_id || null,
          active: true,
        })
        .select();

      if (error) {
        console.error("Error adding employee:", error);
        return false;
      }

      if (data && data[0]) {
        setEmployees(prev => [data[0], ...prev]);
      }
      return true;
    } catch (err) {
      console.error("Error in addEmployee:", err);
      return false;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          position: updates.position,
          hire_date: updates.hire_date,
          salary: updates.salary,
          department_id: updates.department_id,
          active: updates.active,
        })
        .eq('id', id);

      if (error) {
        console.error("Error updating employee:", error);
        return false;
      }

      setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
      return true;
    } catch (err) {
      console.error("Error in updateEmployee:", err);
      return false;
    }
  };

  const createSalesOrder = (so: Partial<SalesOrder>, lines: Partial<SalesOrderLine>[]) => {
    const newSO: SalesOrder = {
      id: `so-${Date.now()}`,
      company_id: activeCompanyId,
      customer_id: so.customer_id,
      order_date: new Date().toISOString(),
      status: 'sale',
      amount_untaxed: so.amount_untaxed || 0,
      amount_tax: so.amount_tax || 0,
      amount_total: so.amount_total || 0,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
    };

    setSalesOrders((prev) => [newSO, ...prev]);

    // Automatically create draft invoice
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      company_id: activeCompanyId,
      sales_order_id: newSO.id,
      customer_id: newSO.customer_id,
      number: `INV/2026/${String(invoices.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      amount_total: newSO.amount_total,
      created_at: new Date().toISOString(),
    };
    setInvoices((prev) => [newInv, ...prev]);
  };

  const createPurchaseRequest = (pr: Partial<PurchaseRequest>) => {
    const newPR: PurchaseRequest = {
      id: `pr-${Date.now()}`,
      company_id: activeCompanyId,
      requested_by: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      status: 'to_approve',
      notes: pr.notes || '',
      created_at: new Date().toISOString(),
    };
    setPurchaseRequests((prev) => [newPR, ...prev]);

    // Create corresponding approval entry
    const newApproval: Approval = {
      id: `appr-${Date.now()}`,
      company_id: activeCompanyId,
      type: 'material_request',
      document_id: newPR.id,
      step: 1,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setApprovals((prev) => [newApproval, ...prev]);
  };

  const createProject = (proj: Partial<Project>) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      company_id: activeCompanyId,
      name: proj.name || 'New Construction Project',
      description: proj.description || '',
      start_date: proj.start_date || new Date().toISOString().split('T')[0],
      end_date: proj.end_date || '',
      budget: Number(proj.budget) || 0,
      actual_cost: 0,
      status: 'planning',
      manager_id: currentUser.id,
      progress: 0,
      created_at: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
  };

  const addTask = (task: Partial<Task>) => {
    const newTask: Task = {
      id: `t-${Date.now()}`,
      project_id: task.project_id || '',
      name: task.name || 'New Task',
      description: task.description || '',
      priority: task.priority || 'medium',
      status: 'todo',
      assignee_id: task.assignee_id || currentUser.id,
      start_date: task.start_date || new Date().toISOString().split('T')[0],
      due_date: task.due_date || '',
      hours_estimate: Number(task.hours_estimate) || 0,
      hours_spent: 0,
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status } : task))
    );
  };

  const addSiteSurvey = (survey: Partial<SiteSurvey>) => {
    const newSurvey: SiteSurvey = {
      id: `sv-${Date.now()}`,
      project_id: survey.project_id || '',
      surveyor_id: currentUser.id,
      survey_date: new Date().toISOString().split('T')[0],
      location_lat: survey.location_lat || 40.7128,
      location_lng: survey.location_lng || -74.0060,
      notes: survey.notes || '',
      signature_url: survey.signature_url || '',
      drawing_url: survey.drawing_url || '',
      photo_urls: survey.photo_urls || [],
      created_at: new Date().toISOString(),
    };
    setSiteSurveys((prev) => [newSurvey, ...prev]);
  };

  const clockIn = async (employeeId: string, employeeName: string, department: string, shiftId: string, gps: string, address: string, photo: string, device: string, status: string) => {
    const row = {
      employee_id: employeeId,
      employee_name: employeeName,
      department: department,
      date: new Date().toISOString().split('T')[0],
      check_in: new Date().toISOString(),
      gps_in: gps,
      address_in: address,
      photo_in: photo || null,
      device_in: device,
      status: status || 'on_time',
      shift_id: shiftId || 'sh1',
      overtime_hours: 0,
    };
    const { data, error } = await supabase.from('payroll_attendance_logs').insert(row).select().single();
    if (error) {
      console.error('Clock-in error:', error);
      return;
    }
    if (data) setAttendance((prev) => [data, ...prev]);
  };

  const clockOut = async (attendanceId: string, gps: string, address: string, photo: string, device: string, overtimeHours: number) => {
    const updates = {
      check_out: new Date().toISOString(),
      gps_out: gps,
      address_out: address,
      photo_out: photo || null,
      device_out: device,
      overtime_hours: overtimeHours || 0,
    };
    const { data, error } = await supabase.from('payroll_attendance_logs').update(updates).eq('id', attendanceId).select().single();
    if (error) {
      console.error('Clock-out error:', error);
      return;
    }
    if (data) {
      setAttendance((prev) => prev.map((att) => att.id === attendanceId ? data : att));
    }
  };

  const addTimesheet = (ts: Partial<Timesheet>) => {
    const employee = employees.find((e) => e.user_id === currentUser.id);
    const newTS: Timesheet = {
      id: `ts-${Date.now()}`,
      employee_id: employee?.id || 'emp1',
      date: ts.date || new Date().toISOString().split('T')[0],
      project_id: ts.project_id || '',
      task_id: ts.task_id || '',
      hours: Number(ts.hours) || 0,
      description: ts.description || '',
      status: 'submitted',
      created_at: new Date().toISOString(),
    };
    setTimesheets((prev) => [newTS, ...prev]);
  };

  const addExpense = (exp: Partial<Expense>) => {
    const employee = employees.find((e) => e.user_id === currentUser.id);
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      company_id: activeCompanyId,
      employee_id: employee?.id || 'emp1',
      date: new Date().toISOString().split('T')[0],
      category: exp.category || 'other',
      description: exp.description || '',
      amount: Number(exp.amount) || 0,
      receipt_url: exp.receipt_url || 'receipt-placeholder.jpg',
      status: 'to_approve',
      created_at: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);

    // Create approval record
    const newApproval: Approval = {
      id: `appr-${Date.now()}`,
      company_id: activeCompanyId,
      type: 'expense',
      document_id: newExp.id,
      step: 1,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setApprovals((prev) => [newApproval, ...prev]);
  };

  const updateApproval = (id: string, status: 'approved' | 'rejected', comment?: string) => {
    setApprovals((prev) =>
      prev.map((appr) =>
        appr.id === id
          ? { ...appr, status, comment, approver_id: currentUser.id }
          : appr
      )
    );

    // Update parent document status
    const appr = approvals.find((a) => a.id === id);
    if (!appr) return;

    if (appr.type === 'expense') {
      setExpenses((prev) =>
        prev.map((exp) =>
          exp.id === appr.document_id
            ? { ...exp, status: status === 'approved' ? 'approved' : 'draft', approved_by: currentUser.id }
            : exp
        )
      );
    } else if (appr.type === 'material_request') {
      setPurchaseRequests((prev) =>
        prev.map((pr) =>
          pr.id === appr.document_id
            ? { ...pr, status: status === 'approved' ? 'approved' : 'rejected' }
            : pr
        )
      );
    }
  };

  const addDocument = (doc: Partial<Document>) => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      company_id: activeCompanyId,
      name: doc.name || 'New Document.pdf',
      file_url: doc.file_url || 'docs/new-document.pdf',
      size: doc.size || 1024,
      file_type: doc.file_type || 'pdf',
      version: 1,
      project_id: doc.project_id,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const [language, setLanguage] = useState<'en' | 'vi'>('en');

  // Load language from localStorage if available
  useEffect(() => {
    const savedLang = localStorage.getItem('erp_language') as 'en' | 'vi';
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: 'en' | 'vi') => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('erp_language', lang);
    }
  };

  const translations: Record<'en' | 'vi', Record<string, string>> = {
    en: {},
    vi: {
      // ─── WMS Translations ──────────────────────────
      "Warehouse Operations Control Room": "Trung tâm Điều hành Kho hàng",
      "Real-time tracking of materials ledger, batch expiration cycles, and stock distribution.": "Theo dõi thời gian thực sổ kho vật tư, chu kỳ hết hạn lô hàng và phân phối tồn kho.",
      "System Live & Synchronized": "Hệ thống Trực tuyến & Đã đồng bộ",
      "Material Catalog": "Danh mục vật tư",
      "Goods Receipt (Stock-In)": "Nhập kho (GRN)",
      "Goods Issue (Stock-Out)": "Xuất kho (GIN)",
      "Inter-Warehouse Transfer": "Chuyển kho nội bộ",
      "Inventory Audit Count": "Kiểm kê tồn kho",
      "Batch Lot & Serials": "Số Lô & Serial",
      "Total Stock Value": "Tổng Giá Trị Tồn Kho",
      "Total SKUs Listed": "Tổng Số SKU",
      "Below Safety stock": "Dưới Tồn Kho Tối Thiểu",
      "Incoming Today": "Nhập Kho Trong Ngày",
      "Slow Moving SKUs": "Hàng Tồn Lâu Ngày",
      "Near Expiry": "Sắp Hết Hạn",
      "Across all active depots": "Trên tất cả kho bãi",
      "Unique part numbers": "Mã vật tư duy nhất",
      "Requires urgent PO order": "Yêu cầu đặt mua khẩn cấp",
      "Units received at yard": "Đơn vị đã nhận tại bãi",
      "Exceeding max capacity": "Vượt dung lượng tối đa",
      "Batches expiring < 90d": "Lô hàng hết hạn < 90 ngày",
      "Stock Inbound & Outbound Movement Ledger": "Nhật ký Biến động Nhập - Xuất Kho",
      "Daily cumulative volumes for the last 7 calendar days": "Sản lượng lũy kế hàng ngày trong 7 ngày qua",
      "Inbound": "Nhập kho",
      "Outbound": "Xuất kho",
      "Top 5 Capitalized Stocks": "Top 5 Vật tư Giá trị nhất",
      "Highest value on-hand (cost_price * qty)": "Giá trị tồn kho cao nhất (Giá vốn * Số lượng)",
      "Top 5 Fast-Moving Issued Materials": "Top 5 Vật tư Xuất nhiều nhất",
      "Total stock-out volume issued for works": "Tổng sản lượng xuất phục vụ công trình",
      "Safety Stock Level Breach Warning Room": "Cảnh báo Vi phạm Định mức Tồn kho An toàn",
      "Materials listed below are critically below designated safety margins.": "Các vật tư dưới đây đang ở mức dưới giới hạn an toàn.",
      "SKU": "SKU / Mã",
      "Material Description": "Mô tả vật tư",
      "Current": "Tồn hiện tại",
      "Safety Min": "Tối thiểu",
      "Status Ratio": "Tỷ lệ an toàn",
      "Audit Trail Timeline": "Nhật ký Lịch sử Giao dịch",
      "Recent transactions and stock adjustments": "Giao dịch và điều chỉnh tồn kho gần đây",
      "Qty Change:": "Thay đổi SL:",
      "View Detailed System Audit Trail": "Xem chi tiết nhật ký giao dịch",
      "Materials Ledger Catalog": "Danh mục Sổ kho Vật tư",
      "Maintain structural materials, item classification rules, costing values, and bin locations.": "Quản lý vật tư thi công, quy tắc phân loại, giá trị vốn và vị trí lưu kho.",
      "Export CSV": "Xuất file CSV",
      "Import Ledger": "Nhập sổ kho",
      "Add New SKU": "Thêm mã SKU mới",
      "Search by material name, SKU, or barcode...": "Tìm theo tên vật tư, mã SKU, mã vạch...",
      "All Statuses": "Tất cả trạng thái",
      "Active Only": "Chỉ hoạt động",
      "Inactive Only": "Chỉ ngừng hoạt động",
      "All Categories": "Tất cả danh mục",
      "SKU / Barcode": "Mã SKU / Mã vạch",
      "Material Name": "Tên vật tư",
      "Category": "Danh mục",
      "Depot / Bin Location": "Kho / Vị trí bin",
      "Cost Price": "Giá vốn",
      "Current Qty": "Tồn kho hiện tại",
      "Status": "Trạng thái",
      "Edit SKU Properties": "Sửa thuộc tính SKU",
      "Enroll New Material SKU": "Khai báo mã vật tư SKU mới",
      "Material SKU Name *": "Tên vật tư SKU *",
      "SKU Part Number *": "Mã SKU / Part Number *",
      "Material Group Category": "Nhóm danh mục vật tư",
      "Unit of Measure (UOM)": "Đơn vị tính (UOM)",
      "Assigned Default Yard / Depot": "Kho / Bãi mặc định",
      "Specific Bin / Location Code": "Vị trí lưu kho (Bin Code)",
      "Standard Unit Cost ($) *": "Giá vốn tiêu chuẩn ($) *",
      "Default List Sale Price ($)": "Giá bán niêm yết mặc định ($)",
      "Opening Stock Qty": "Tồn kho đầu kỳ",
      "Safety Stock Limit (Min Qty)": "Tồn kho tối thiểu (Min Qty)",
      "Maximum Capacity Qty": "Tồn kho tối đa (Max Qty)",
      "EAN / Barcode / QR String": "Chuỗi Barcode / QR Code",
      "Manufacturer / Brand Name": "Nhà sản xuất / Thương hiệu",
      "Ledger Status": "Trạng thái hoạt động",
      "SKU Description & Spec Sheets": "Mô tả SKU & Thông số kỹ thuật",
      "Save SKU record": "Lưu thông tin SKU",
      "Active": "Hoạt động",
      "Inactive": "Ngừng hoạt động",
      "Warehouse": "Kho hàng",
      "Unassigned": "Chưa phân bổ",
      "Goods Receipt Notes (Stock-In)": "Phiếu nhập kho (GRN)",
      "Manage incoming vendor PO arrivals, project material returns, and adjustment receipts.": "Quản lý hàng nhập từ nhà cung cấp, vật tư dư thừa công trình trả về và nhập điều chỉnh.",
      "Create Stock-In Slip": "Tạo phiếu nhập kho",
      "All": "Tất cả",
      "Purchase": "Nhập mua",
      "Return": "Trả lại",
      "Production": "Nhập sản xuất",
      "Adjustment": "Nhập điều chỉnh",
      "Search by receipt code, vendor...": "Tìm theo số phiếu, nhà cung cấp...",
      "Receipt No": "Số phiếu nhập",
      "Type": "Loại nhập",
      "Destination Depot": "Kho đích",
      "Vendor / Supplier": "Nhà cung cấp",
      "Date": "Ngày",
      "Total Cost": "Tổng giá vốn",
      "Workflow Actions": "Quy trình tác nghiệp",
      "Approve": "Phê duyệt",
      "Complete": "Hoàn thành",
      "Receipt Line Details": "Chi tiết hạng mục nhập kho",
      "Unit Cost": "Giá vốn đơn vị",
      "Batch Code": "Mã lô hàng",
      "Bin Location": "Vị trí bin",
      "New Goods Receipt Note (Draft)": "Tạo mới phiếu nhập kho (Bản nháp)",
      "Receipt Type": "Loại phiếu nhập",
      "Target Depot *": "Kho đích *",
      "Vendor / Supplier Name": "Tên nhà cung cấp",
      "Arrival Date": "Ngày nhập hàng",
      "Receipt Line Items": "Hạng mục nhập kho",
      "Add Material": "Thêm vật tư",
      "Select Material SKU": "Chọn vật tư SKU",
      "Qty": "Số lượng",
      "Unit Cost ($)": "Giá vốn ($)",
      "Amount ($)": "Thành tiền ($)",
      "Batch Lot No": "Số lô hàng",
      "Slips Remarks / Notes": "Ghi chú phiếu nhập",
      "Cumulative Total Cost": "Tổng chi phí tích lũy",
      "Save Receipt Draft": "Lưu phiếu nháp",
      "Goods Issue Notes (Stock-Out)": "Phiếu xuất kho (GIN)",
      "Approve internal job requests, sales order dispatches, and material scrap issues.": "Phê duyệt yêu cầu cấp vật tư công trường, xuất hàng bán và thanh lý phế liệu.",
      "Create Stock-Out Slip": "Tạo phiếu xuất kho",
      "Sales": "Xuất bán hàng",
      "Internal": "Tiêu dùng nội bộ",
      "Return Supplier": "Trả nhà cung cấp",
      "Search by issue code, customer/dept...": "Tìm theo số phiếu, khách hàng/phòng ban...",
      "Issue No": "Số phiếu xuất",
      "Source Depot": "Kho nguồn",
      "Customer / Department": "Khách hàng / Bộ phận",
      "Costing": "Cách tính giá",
      "Issue Line Details": "Chi tiết hạng mục xuất kho",
      "Requested": "Yêu cầu",
      "Issued Qty": "Thực xuất",
      "Unit Price": "Đơn giá",
      "New Goods Issue Note (Draft)": "Tạo mới phiếu xuất kho (Bản nháp)",
      "Issue Type": "Loại phiếu xuất",
      "Source Depot *": "Kho nguồn *",
      "Recipient / Customer / Dept": "Khách hàng / Bộ phận nhận",
      "Cost Valuation Method": "Phương pháp tính giá xuất",
      "Issue Date": "Ngày xuất kho",
      "Stock-Out Line Items": "Hạng mục xuất kho",
      "Scan Barcode": "Quét mã vạch",
      "Select Material SKU (Matches Source Warehouse stock)": "Chọn vật tư SKU (Từ kho nguồn)",
      "Qty Req": "Yêu cầu",
      "Qty Issue": "Thực xuất",
      "Unit Price ($)": "Đơn giá ($)",
      "Batch Lot (Opt)": "Lô hàng (Không bắt buộc)",
      "Stock-Out Remarks / Notes": "Ghi chú xuất kho",
      "Cumulative Outbound Value": "Tổng giá trị xuất kho",
      "Save Issue Draft": "Lưu phiếu nháp",
      "Multi-Warehouse Location Management": "Quản lý Vị trí Nhiều Kho",
      "Set up dry yards, cold storage rooms, defective isolation bays, and structural warehouses.": "Thiết lập kho bãi vật liệu, kho lạnh, khu biệt trữ lỗi hỏng và kho thành phẩm.",
      "Add Warehouse Depot": "Thêm kho chứa hàng",
      "SKUs Stocked": "Số SKU tồn",
      "Depot Valuation": "Giá trị kho",
      "Assigned Manager": "Thủ kho quản lý",
      "Physical Address / GPS Location": "Địa chỉ thực tế / Tọa độ GPS",
      "Operational Status": "Trạng thái hoạt động",
      "Edit Depot": "Sửa kho",
      "View stock breakdown": "Xem chi tiết tồn kho",
      "Hide stock list": "Ẩn chi tiết tồn",
      "Edit Depot Properties": "Sửa thuộc tính kho",
      "Enroll New Warehouse Depot": "Khai báo kho chứa hàng mới",
      "Warehouse Depot Name *": "Tên kho chứa hàng *",
      "Depot Code (Short) *": "Mã kho (Viết tắt) *",
      "Storage Type": "Loại kho",
      "Save Depot": "Lưu thông tin kho",
      "Inter-Warehouse Material Transfers": "Chuyển kho Vật tư Nội bộ",
      "Coordinate material shipments between stockyards and job depots with in-transit tracking.": "Điều phối luân chuyển vật tư giữa các bãi chứa và kho công trình, theo dõi lộ trình.",
      "Create Transfer Request": "Tạo yêu cầu chuyển kho",
      "Pending": "Chờ xử lý",
      "In Transit": "Đang vận chuyển",
      "Completed": "Đã hoàn thành",
      "Transfer No": "Số phiếu chuyển",
      "SKUs Count": "Số hạng mục",
      "Ship Goods": "Gửi hàng đi",
      "Receive Goods": "Nhận hàng vào",
      "Transferred Items List": "Danh sách vật tư luân chuyển",
      "Transfer Qty": "Số lượng chuyển",
      "Request Inter-Warehouse Stock Transfer": "Yêu cầu chuyển kho nội bộ",
      "Source Warehouse Depot *": "Kho nguồn *",
      "Destination Depot *": "Kho đích *",
      "Transfer Shipment Date": "Ngày chuyển hàng",
      "Items to Transfer": "Vật tư luân chuyển",
      "Transfer Reason / Remarks": "Lý do chuyển kho / Ghi chú",
      "Save Transfer Request": "Lưu yêu cầu",
      "Inventory Audit Counts & Reconciliation": "Kiểm kê Tồn kho & Đối chiếu",
      "Perform cycle stock counts, register material shrinkage, and apply ledger book reconciliations.": "Thực hiện đếm tồn kho định kỳ, ghi nhận hao hụt vật tư và điều chỉnh chênh lệch sổ sách.",
      "New Stock Count Sheet": "Tạo phiếu kiểm kê mới",
      "Sheets registered": "Phiếu đã lập",
      "Audited Depot": "Kho kiểm kê",
      "Scope": "Phạm vi",
      "Audit Date": "Ngày kiểm kê",
      "Reconciliation Val": "Chênh lệch giá trị",
      "Apply Reconciliation": "Điều chỉnh chênh lệch",
      "Audited Line Items": "Chi tiết hạng mục kiểm kê",
      "System Qty": "Tồn sổ sách",
      "Actual Counted": "Kiểm đếm thực tế",
      "Discrepancy": "Chênh lệch",
      "Value Impact": "Ảnh hưởng giá trị",
      "Discrepancy Reason": "Lý do chênh lệch",
      "New Audit stock Count Sheet": "Tạo mới phiếu kiểm kê tồn kho",
      "Audited Depot *": "Kho kiểm kê *",
      "Count Scope": "Phạm vi kiểm kê",
      "Scope Filter Value": "Giá trị lọc phạm vi",
      "Count items spreadsheet": "Bảng chi tiết kiểm đếm",
      "System Book Qty": "Số tồn sổ sách",
      "Actual Qty counted *": "Số kiểm đếm thực tế *",
      "Reconciliation Remarks": "Lý do điều chỉnh chênh lệch",
      "Reconciliation Remarks / Notes": "Ghi chú điều chỉnh",
      "Total System:": "Tổng tồn sổ sách:",
      "Total Actual:": "Tổng kiểm đếm:",
      "Net Qty Impact:": "Tổng chênh lệch SL:",
      "Net Value Impact:": "Tổng chênh lệch giá trị:",
      "Save Count Sheet": "Lưu phiếu kiểm kê",
      "Batch/Lot & Serial Number Tracking Control": "Kiểm soát Lô hàng (Batch/Lot) & Số Serial",
      "Track individual product batches, expiration dates, shelf life warnings, and serial number history.": "Theo dõi từng lô sản phẩm, ngày hết hạn, cảnh báo thời hạn sử dụng và lịch sử số serial.",
      "Batch / Lot No": "Số Lô hàng",
      "Serial No": "Số Serial",
      "Audited Material SKU": "Vật tư SKU",
      "Mfg Date": "Ngày sản xuất",
      "Expiry Date": "Ngày hết hạn",
      "On Hand Qty": "Số lượng tồn",
      "Material Traceability Chain Ledger": "Sổ nhật ký truy xuất nguồn gốc vật tư",
      "Inbound Sourcing History": "Lịch sử nhập kho ban đầu",
      "Outbound Allocation History": "Lịch sử cấp phát xuất kho",
      "Inventory Transaction Audit Trail Ledger": "Nhật ký Lịch sử Giao dịch Tồn kho",
      "Immutable historical log of all material arrivals, warehouse transfers, issues, and audit counts.": "Sổ nhật ký không thể sửa đổi ghi lại toàn bộ hoạt động nhập xuất, chuyển kho và kiểm kê.",
      "Export Audit Ledger": "Xuất nhật ký giao dịch",
      "Dates From:": "Từ ngày:",
      "to": "đến",
      "Clear": "Xóa lọc",
      "Timestamp": "Thời gian",
      "Audit Action": "Hoạt động",
      "Ref Slip": "Số phiếu tham chiếu",
      "Audit Depot": "Kho giao dịch",
      "Qty Before": "Tồn trước",
      "Delta Change": "Biến động (+/-)",
      "Qty After": "Tồn sau",
      "Inventory Reports Center": "Trung tâm Báo cáo Kho hàng",
      "Analyze financial valuations, stock turns, aging inventory assets, and safety stock reorder levels.": "Phân tích giá trị tồn kho tài chính, hệ số vòng quay, tuổi hàng tồn và cảnh báo điểm đặt hàng.",
      "Export Report Pack": "Xuất gói báo cáo",
      "Stock Valuation": "Giá trị tồn kho",
      "Asset Aging Analysis": "Phân tích tuổi tồn kho",
      "Stock Turnover Ratio": "Vòng quay hàng tồn kho",
      "Reorder Warnings": "Cảnh báo đặt hàng",
      "Valuation by Warehouse Depot": "Giá trị tồn kho theo kho",
      "Capital allocation across distinct physical warehouses": "Phân bổ vốn trên các kho bãi thực tế",
      "Valuation by Material Category": "Giá trị tồn kho theo nhóm vật tư",
      "Asset allocation by category group classifications": "Phân bổ tài sản theo nhóm danh mục phân loại",
      "Inventory Age Distribution Analysis": "Phân tích Phân phối Tuổi hàng Tồn",
      "Detect slow-moving, stale, or dead stock to optimize warehouse capital": "Phát hiện hàng tồn lâu ngày, ứ đọng để tối ưu hóa vốn kho",
      "Issues Vol (30d)": "Lượng xuất (30 ngày)",
      "Avg Inventory": "Tồn kho trung bình",
      "Turnover Ratio": "Tỷ lệ vòng quay",
      "Activity Classification": "Phân loại mức độ hoạt động",
      "Restocking Safety Threshold Warnings": "Cảnh báo Ngưỡng Tồn kho An toàn",
      "The following materials are currently running below safety buffer thresholds": "Các vật tư dưới đây đang dưới ngưỡng dự phòng an toàn",
      "On Hand stock": "Tồn kho hiện có",
      "Safety Minimum": "Tối thiểu an toàn",
      "Reorder Deficit": "Lượng thiếu hụt",
      "Suggested PO Action": "Khuyến nghị đặt mua PO",
      "Order": "Đặt mua",

      "WMS Dashboard": "Bảng Điều khiển WMS",
      "Goods Receipt": "Nhập kho (GRN)",
      "Goods Issue": "Xuất kho (GIN)",
      "Stock Transfer": "Chuyển kho",
      "Stock Count": "Kiểm kê kho",
      "Batch & Serial": "Lô & Serial",
      "Transaction Logs": "Lịch sử giao dịch",
      "Reports Center": "Báo cáo kho",
      "Barcode Scan": "Quét Barcode",

      // Suppliers & Vendor Board
      "Suppliers & Vendor Board": "Ban quản lý nhà cung cấp",
      "Evaluate vendor ratings, delivery lead times, and contract pricing catalogs.": "Đánh giá xếp hạng nhà cung cấp, thời gian giao hàng và danh mục giá hợp đồng.",
      "On-Time Delivery Rate": "Tỷ lệ giao hàng đúng hẹn",
      "Projected:": "Dự kiến:",
      "Excellent (98%)": "Xuất sắc (98%)",
      "Reliable (92%)": "Tin cậy (92%)",
      // Purchase Orders
      "RFQ & Purchase Orders (PO)": "Yêu cầu báo giá & Đơn hàng (PO)",
      "Track Request for Quotations (RFQs), verify bids, and release purchase orders.": "Theo dõi yêu cầu báo giá (RFQ), xác minh giá thầu và phát hành đơn mua hàng.",
      "Search orders...": "Tìm kiếm đơn hàng...",
      "PO Reference": "Mã đơn hàng PO",
      "Vendor Partner": "Đối tác nhà cung cấp",
      "RFQ Draft": "RFQ nháp",
      "PO Confirmed": "PO đã xác nhận",
      "Confirm Order": "Xác nhận đơn hàng",
      "Stocks Received": "Đã nhận hàng vào kho",
      // Purchase Requests
      "Purchase Requests (PR)": "Yêu cầu mua sắm (PR)",
      "Submit material demands for project tasks. Requires approval before RFQ generation.": "Gửi nhu cầu vật tư cho công việc dự án. Cần phê duyệt trước khi tạo RFQ.",
      "Search request logs...": "Tìm kiếm nhật ký yêu cầu...",
      "New Request": "Yêu cầu mới",
      "Draft Material Purchase Request": "Bản nháp yêu cầu mua vật tư",
      "Specify materials requested & quantity *": "Nêu chi tiết vật tư yêu cầu & số lượng *",
      "e.g. Need 40 metric tons of steel rebar 16mm and 500 bags of portland cement for foundation concrete casting next week.": "Ví dụ: Cần 40 tấn thép cốt bê tông 16mm và 500 bao xi măng portland để đổ bê tông móng tuần sau.",
      "Submit for Approval": "Gửi phê duyệt",
      "Pending Approval": "Chờ phê duyệt",
      "Requested by:": "Người yêu cầu:",
      "Requester": "Người yêu cầu",
      // Customer Invoices
      "Customer Invoices": "Hóa đơn khách hàng",
      "Manage accounts receivables, billing posts, and payments registration.": "Quản lý các khoản phải thu, định khoản hóa đơn và ghi nhận thanh toán.",
      "Search invoices...": "Tìm kiếm hóa đơn...",
      "Invoice Number": "Số hóa đơn",
      "Billing Date": "Ngày hóa đơn",
      "Total Amount": "Tổng số tiền",
      "Draft": "Nháp",
      "Posted": "Đã ghi sổ",
      "Paid": "Đã thanh toán",
      "Post Journal": "Ghi sổ kế toán",
      "Reconciled": "Đã đối chiếu",
      "Invoice Reference": "Tham chiếu hóa đơn",
      "Payment Method *": "Phương thức thanh toán *",
      "Bank Wire Transfer Account": "Tài khoản chuyển khoản ngân hàng",
      "Petty Cash Operational Account": "Tài khoản tiền mặt nhỏ",
      "Client Check Deposit": "Tiền gửi séc của khách hàng",
      "Amount Paid ($) *": "Số tiền thanh toán ($) *",
      "Save Payment": "Lưu thanh toán",
      // Sales Orders & Quotations
      "Sales Orders & Quotations": "Đơn hàng & Báo giá",
      "Generate contractor client quotes and track order delivery.": "Tạo báo giá khách hàng và theo dõi việc giao hàng.",
      "Create Quotation": "Tạo báo giá",
      "Draft New Quotation": "Soạn báo giá mới",
      "Select Customer *": "Chọn khách hàng *",
      "Line Items": "Hạng mục chi tiết",
      "-- Select Material --": "-- Chọn vật tư --",
      "Quantity": "Số lượng",
      "Discount%": "Chiết khấu%",
      "Add Line Item": "Thêm hạng mục",
      "Subtotal:": "Cộng tiền hàng:",
      "NY Tax (8.85%):": "Thuế NY (8.85%):",
      "Total:": "Tổng cộng:",
      "Confirm Sale Order": "Xác nhận đơn hàng",
      "Order Date": "Ngày đơn hàng",
      "Amount": "Số tiền",
      "Actions": "Thao tác",
      "Confirmed Sale": "Bán hàng đã xác nhận",
      "PDF Statement": "Báo cáo PDF",
      "Quotation Statement Viewer": "Xem báo giá chi tiết",
      "Print / Save PDF": "In / Lưu PDF",
      "Close": "Đóng",
      "ton": "tấn",
      "unit": "đơn vị",
      // CRM Pipeline
      "Opportunities Pipeline": "Kênh cơ hội kinh doanh",
      "Manage pipeline pipelines and sales opportunities.": "Quản lý cơ hội kinh doanh và kênh bán hàng.",
      "Search opportunities...": "Tìm kiếm cơ hội...",
      "New Opportunity": "Cơ hội mới",
      "Create New Opportunity": "Tạo cơ hội mới",
      "Opportunity Title *": "Tên cơ hội *",
      "Customer": "Khách hàng",
      "-- Choose Client --": "-- Chọn khách hàng --",
      "Contact Person": "Người liên hệ",
      "Email Address": "Địa chỉ email",
      "Phone": "Điện thoại",
      "Expected Revenue ($)": "Doanh thu dự kiến ($)",
      "Probability (%)": "Xác suất (%)",
      "Priority Stars": "Mức ưu tiên (Sao)",
      "1 Star": "1 Sao",
      "2 Stars": "2 Sao",
      "3 Stars": "3 Sao",
      "Opportunity Notes": "Ghi chú cơ hội",
      "Notes...": "Ghi chú...",
      "Save Opportunity": "Lưu cơ hội",
      "expected": "dự kiến",
      "No contact": "Không có liên hệ",
      "Won": "Thắng",
      "No leads listed.": "Không có cơ hội nào.",
      "New": "Mới",
      "Qualified": "Đạt yêu cầu",
      "Proposition": "Đề xuất",
      "Lost": "Thất bại",
      // Tasks Kanban Board
      "Tasks Kanban Board": "Bảng công việc Kanban",
      "Organize workflows and timelines for active team members.": "Tổ chức quy trình làm việc và tiến độ cho các thành viên.",
      "Add Task": "Thêm công việc",
      "Add Task to": "Thêm công việc vào",
      "Task Title *": "Tên công việc *",
      "-- Assign Employee --": "-- Phân công nhân viên --",
      "Task Priority": "Độ ưu tiên",
      "Low Priority": "Ưu tiên thấp",
      "Medium Priority": "Ưu tiên trung bình",
      "High Priority": "Ưu tiên cao",
      "Due Date": "Hạn chót",
      "Estimated Hours": "Số giờ ước tính",
      "Detailed Description": "Mô tả chi tiết",
      "Provide scope details, quality constraints, safety warnings...": "Cung cấp chi tiết phạm vi, ràng buộc chất lượng, cảnh báo an toàn...",
      "Save Task": "Lưu công việc",
      "Search task title...": "Tìm kiếm tên công việc...",
      // Contracting Projects
      "Contracting Projects": "Dự án thầu",
      "Track project milestones, physical progress, and financial actual costs.": "Theo dõi các mốc quan trọng, tiến độ thực tế và chi phí thực tế.",
      "List Overview": "Tổng quan danh sách",
      "Gantt Timeline": "Tiến độ Gantt",
      "Start Project": "Bắt đầu dự án",
      "Initiate Construction Project": "Khởi công dự án xây dựng",
      "Project Title *": "Tên dự án *",
      "Total Allocated Budget ($) *": "Tổng ngân sách phân bổ ($) *",
      "Start Date *": "Ngày bắt đầu *",
      "End Date *": "Ngày kết thúc *",
      "Scope of Work description": "Mô tả phạm vi công việc",
      "Define project deliverables and target objectives...": "Xác định các hạng mục bàn giao và mục tiêu dự án...",
      "Confirm Start": "Xác nhận bắt đầu",
      "Physical Completion": "Tiến độ hoàn thành",
      "Allocated Budget": "Ngân sách phân bổ",
      "Actual Cost Spent": "Chi phí thực tế",
      "Project Reference": "Tham chiếu dự án",
      // General & System
      "Command Center": "Trung tâm điều khiển",
      "Switch Organization": "Chuyển công ty",
      "Active Impersonation": "Đóng vai người dùng",
      "Search records...": "Tìm kiếm dữ liệu...",
      "System Active": "Hệ thống hoạt động",
      "Type a command or app title...": "Nhập lệnh hoặc tên ứng dụng...",
      "Open": "Mở",
      "No matching apps or commands. Try another keyword.": "Không tìm thấy ứng dụng hoặc lệnh phù hợp. Vui lòng thử từ khóa khác.",
      "↑↓ to navigate": "↑↓ để di chuyển",
      "↵ to select": "↵ để chọn",
      "Raycast Command Launcher": "Trình khởi chạy lệnh Raycast",
      "Switch to Vietnamese": "Chuyển sang tiếng Việt",
      "Chuyển sang tiếng Anh": "Switch to English",
      "Cancel": "Hủy",
      "Save File": "Lưu tài liệu",
      "General File": "Tài liệu chung",
      "Selected: ": "Đã chọn: ",
      "Matched: ": "Khớp: ",

      // Categories
      "Operations": "Vận hành",
      "HR": "Nhân sự",
      "Finance": "Tài chính",
      "System": "Hệ thống",

      // Module Titles & Descriptions
      "CRM Pipeline": "Kênh khách hàng CRM",
      "Track leads, opportunities and client communication": "Theo dõi cơ hội, khách hàng tiềm năng và liên hệ",
      
      "Sales & Billing": "Bán hàng & Hóa đơn",
      "Create quotations, process sales orders and invoices": "Tạo báo giá, xử lý đơn hàng bán và hóa đơn",
      
      "Purchasing": "Mua sắm vật tư",
      "Material purchase requests, RFQ bids and PO releases": "Yêu cầu mua sắm vật liệu, thầu RFQ và phát hành PO",
      
      "Inventory Ledger": "Sổ kho & Vật liệu",
      "Inventory Ops": "Hoạt động kho",
      "Track aggregates stocks, warehouses transfers, and alerts": "Theo dõi tồn kho, chuyển kho và cảnh báo",
      
      "Projects & Milestones": "Dự án & Tiến độ",
      "Projects Hub": "Trung tâm dự án",
      "Gantt schedule tracking, task kanban boards, and budgets": "Theo dõi tiến độ Gantt, bảng công việc và ngân sách",
      
      "Site Survey": "Khảo sát công trường",
      "Capture GPS tags, drawings sketchpads, and signatures": "Lấy tọa độ GPS, vẽ sơ đồ và ký nhận trực tiếp",
      
      "Field Service": "Dịch vụ hiện trường",
      "Technician visit dispatches, work logs and photos": "Điều phối kỹ thuật hiện trường, ghi nhận công việc và hình ảnh",
      
      "Workforce Directory": "Danh bạ nhân sự",
      "Personnel Ops": "Quản lý nhân sự",
      "HR profile folders, direct salaries and departments": "Hồ sơ nhân viên, lương thưởng và phòng ban",
      
      "Time Attendance": "Chấm công & Sinh trắc",
      "Biometric webcam clockings and GPS tags verification": "Chấm công bằng webcam sinh trắc và tọa độ GPS",
      
      "Timesheets Log": "Nhật ký công việc",
      "Record direct labor hours spent per project task": "Ghi nhận số giờ làm việc trực tiếp theo đầu việc dự án",
      
      "General Accounting": "Kế toán tổng hợp",
      "Ledgers & Ledger": "Sổ sách kế toán",
      "Profit & Loss statements, balance sheets, and ledgers": "Báo cáo lãi lỗ, bảng cân đối kế toán và sổ cái",
      
      "Expenses Claims": "Yêu cầu chi phí",
      "Reimbursement forms with receipt upload scans": "Tờ trình thanh toán chi phí và tải hóa đơn",
      
      "Document Browser": "Duyệt tài liệu & Bản vẽ",
      "CAD structural drawings directory and contracts files": "Thư mục bản vẽ kết cấu CAD và tệp hợp đồng",
      
      "Approvals Panel": "Bảng phê duyệt",
      "Verify leave requests, purchase orders and expense claims": "Duyệt yêu cầu nghỉ phép, đơn hàng và chi phí",
      
      "Executive Dashboard": "Báo cáo giám đốc",
      "Capital CapEx cost distributions and profitability KPI trends": "Báo cáo phân bổ chi phí CapEx và xu hướng KPI lợi nhuận",

      // Module sub-menus & Breadcrumbs (en/vi)
      "Opportunities": "Cơ hội kinh doanh",
      "Customers Directory": "Danh bạ khách hàng",
      "Quotations": "Báo giá",
      "Invoices Register": "Sổ hóa đơn",
      "Invoices Ledger": "Sổ hóa đơn",
      "Purchase Requests": "Yêu cầu mua sắm",
      "RFQ & Orders": "Yêu cầu báo giá & Đơn hàng",
      "Orders & RFQs": "Đơn hàng & RFQ",
      "Supplier Ratings": "Đánh giá NCC",
      "Suppliers Board": "Bảng nhà cung cấp",
      "Material Stock": "Kho vật liệu",
      "Warehouses": "Danh sách kho",
      "Warehouses Catalog": "Danh mục kho bãi",
      "Gantt Overview": "Tổng quan Gantt",
      "Kanban Tasks": "Công việc Kanban",
      "Tasks Kanban": "Bảng công việc Kanban",
      "Site Surveys": "Khảo sát thực địa",
      "Employees Files": "Hồ sơ nhân viên",
      "Chart of Accounts": "Hệ thống tài khoản",
      "Expense Statements": "Tờ trình chi phí",

      // Double-Entry Accounting Page
      "Double-Entry Accounting": "Kế toán kép",
      "Automated charts, General ledger balances, P&L statements and balance sheets.": "Tự động hóa sổ sách, báo cáo kết quả kinh doanh và bảng cân đối kế toán.",
      "General Ledger": "Sổ cái tổng hợp",
      "Profit & Loss (P&L)": "Báo cáo lãi lỗ (P&L)",
      "Balance Sheet": "Bảng cân đối kế toán",
      "Transaction Date": "Ngày giao dịch",
      "Account Code": "Mã tài khoản",
      "Account Title": "Tên tài khoản",
      "Debit ($)": "Nợ ($)",
      "Credit ($)": "Có ($)",
      "Reference ID": "Mã tham chiếu",
      "Income Statement (Profit & Loss)": "Báo cáo kết quả hoạt động kinh doanh",
      "For active period ending June 2026": "Cho kỳ kế toán kết thúc tháng 6 năm 2026",
      "REVENUE": "DOANH THU",
      "COST OF SALES (COGS)": "GIÁ VỐN HÀNG BÁN",
      "GROSS PROFIT": "LỢI NHUẬN GỘP",
      "OPERATING EXPENSES": "CHI PHÍ HOẠT ĐỘNG",
      "NET OPERATING INCOME": "LỢI NHUẬN THUẦN",
      "ASSETS": "TÀI SẢN",
      "LIABILITIES": "NỢ PHẢI TRẢ",
      "EQUITY": "VỐN CHỦ SỞ HỮU",
      "Statement of Financial Position": "Báo cáo tình hình tài chính",
      "Ledger check balances match (Assets = Liabilities + Equity)": "Số dư đối chiếu khớp (Tài sản = Nợ phải trả + Vốn chủ sở hữu)",
      "Contract Revenue (Code 4010)": "Doanh thu hợp đồng (Mã 4010)",
      "Materials Purchase Expenses (Code 5010)": "Chi phí mua sắm vật liệu (Mã 5010)",
      "Workforce Direct Payroll (Code 5020)": "Chi phí nhân công trực tiếp (Mã 5020)",
      "Approved Petty Expenses Claims": "Chi phí nhỏ đã duyệt",
      "Balance Sheet as of June 14, 2026": "Bảng cân đối kế toán tính đến 14/06/2026",
      "Bank operational accounts balance": "Số dư tài khoản ngân hàng hoạt động",
      "Accounts Receivable (A/R) outstanding": "Phải thu khách hàng (A/R) tồn đọng",
      "Inventory valuation holdings": "Giá trị hàng tồn kho nắm giữ",
      "Accounts Payable (A/P) outstanding": "Phải trả nhà cung cấp (A/P) tồn đọng",
      "Retained earnings & reserves": "Lợi nhuận giữ lại & các quỹ dự phòng",
      "Define bookkeeping catalog mappings for Double-Entry Journal statements.": "Định nghĩa danh mục tài khoản kế toán cho nhật ký kép.",
      "Search account codes or names...": "Tìm mã hoặc tên tài khoản...",
      "Classification Type": "Phân loại tài khoản",
      "Accounting Status": "Trạng thái sổ cái",
      "Active Ledger": "Sổ cái đang hoạt động",
      "No accounts found matching your search.": "Không tìm thấy tài khoản phù hợp.",

      // Shift Attendance Page
      "Duty Timeclock": "Bảng chấm công điện tử",
      "Live GPS Coordinates *": "Tọa độ GPS hiện tại *",
      "Get Location": "Lấy vị trí",
      "Webcam Biometric Face Scan": "Quét khuôn mặt sinh trắc học",
      "Verify & Clock In": "Xác thực & Chấm công vào",
      "Clock Out": "Chấm công ra",
      "Today's Attendance Register": "Nhật ký chấm công hôm nay",
      "Biometrics OK": "Sinh trắc học hợp lệ",
      "Clock In": "Vào ca",
      "Overtime Earned:": "Tăng ca tích lũy:",
      "Shift Attendance & Biometrics": "Chấm công Ca & Sinh trắc",
      "Clock in and out using live GPS coordinates and biometric webcam verification.": "Chấm công vào và ra bằng tọa độ GPS thực tế và xác thực khuôn mặt qua webcam.",
      "On Duty Since": "Đang làm việc từ",
      "Off Duty": "Đang nghỉ ca",
      "Retrieve current coordinates...": "Đang lấy tọa độ hiện tại...",
      "Verify Face": "Xác thực khuôn mặt",
      "Face Verified": "Xác thực thành công",
      "Camera Offline": "Camera ngoại tuyến",
      "Start Face Scan": "Quét khuôn mặt",
      "Must retrieve GPS location and verify face biometrics first.": "Cần lấy tọa độ GPS và xác thực khuôn mặt trước.",
      "No shift recordings found for today.": "Không có nhật ký chấm công hôm nay.",

      // Expense Claims & Receipts Page
      "Expense Claims & Receipts": "Yêu cầu chi phí & Hóa đơn",
      "Submit petty cash reimbursements, purchase receipts and claim audits.": "Gửi yêu cầu hoàn tiền mặt, biên lai mua hàng và duyệt chi.",
      "File Expense Claim": "Tạo yêu cầu chi phí",
      "Draft Expense Statement": "Tờ trình chi phí nháp",
      "Claim Category *": "Danh mục chi phí *",
      "Total Claim Amount ($) *": "Tổng tiền yêu cầu ($) *",
      "Purchase Description *": "Mô tả chi tiết mua hàng *",
      "Scan & Upload Receipt": "Quét & tải hóa đơn lên",
      "Submit Claim": "Gửi yêu cầu",
      "Search claims...": "Tìm kiếm yêu cầu...",
      "Review Pending": "Đang chờ duyệt",
      "Approved": "Đã duyệt",
      "Rejected": "Từ chối",
      "Close Builder": "Đóng trình tạo",
      "Click to scan or upload receipt image": "Nhấp để quét hoặc tải ảnh hóa đơn lên",
      "Simulate Camera Scan": "Mô phỏng quét camera",
      "No expense claims match your search filters.": "Không tìm thấy yêu cầu chi phí nào phù hợp.",
      "Category:": "Danh mục:",
      "Receipt:": "Biên lai:",
      "Construction Tools & Gear": "Dụng cụ & Thiết bị thi công",
      "Travel & Client Lodging": "Đi lại & Lưu trú khách hàng",
      "Fuel & Truck Refills": "Nhiên liệu & Đổ xăng xe tải",
      "Catering & Site Meals": "Suất ăn & Phục vụ công trường",
      "General Miscellaneous": "Chi phí tổng hợp khác",

      // Enterprise Approvals Page
      "Enterprise Approvals": "Phê duyệt doanh nghiệp",
      "Approve or reject purchase orders, leave requests, overtime approvals, and expense statements.": "Phê duyệt hoặc từ chối đơn mua hàng, nghỉ phép, tăng ca và chi phí.",
      "Filter by status or type...": "Lọc theo trạng thái hoặc loại...",
      "No approvals pending your review.": "Không có yêu cầu nào đang chờ bạn phê duyệt.",
      "Submitted: ": "Đã gửi: ",
      "Comments: ": "Ý kiến: ",
      "Requester: ": "Người yêu cầu: ",
      "Reject Approval Claim": "Từ chối phê duyệt yêu cầu",
      "Approve Claim Statement": "Phê duyệt tờ trình chi phí",
      "Approval Comments / Audit remarks": "Ý kiến phê duyệt / Ghi chú kiểm toán",
      "Specify review remarks...": "Nhập ý kiến đánh giá...",
      "Reject": "Từ chối",
      "Requester:": "Người yêu cầu:",
      "Comments:": "Ý kiến:",

      // Document Browser Page
      "Directories": "Thư mục tài liệu",
      "Virtual File Cabinets": "Tủ hồ sơ ảo",
      "Upload Document": "Tải tài liệu lên",
      "Search filenames...": "Tìm tên tệp...",
      "Revision: ": "Phiên bản: ",
      "Uploaded: ": "Đã tải lên: ",
      "Store sub-contracts, CAD structural drawings directory and contracts files.": "Lưu trữ hợp đồng phụ, thư mục bản vẽ kết cấu CAD và tệp hợp đồng.",
      "Upload Document Reference": "Tải lên tài liệu tham chiếu",
      "Document Title *": "Tên tài liệu *",
      "File Format Type": "Định dạng tệp",
      "Link to Project": "Liên kết với dự án",
      "Simulated File Size (KB)": "Dung lượng tệp giả lập (KB)",
      "No documents found in this directory. Click \"Upload Document\" to add files.": "Không tìm thấy tài liệu nào trong thư mục này. Nhấp vào \"Tải tài liệu lên\" để thêm tệp.",

      // AI Chat
      "Apex AI Assistant": "Trợ lý AI Apex",
      "Ask AI Assistant": "Hỏi Trợ lý AI",
      "Context-Aware Active": "AI Đang hoạt động",
      "Ask a question...": "Nhập câu hỏi...",
      "Project summary": "Tóm tắt dự án",
      "Material demand forecast": "Dự báo nhu cầu vật tư",
      "Check low stock levels": "Kiểm tra tồn kho thấp",

      // Executive Dashboard Page
      "Real-time metrics, project schedules, and cash flow distributions.": "Chỉ số thời gian thực, tiến độ dự án và phân bổ dòng tiền.",
      "Invoiced Revenue": "Doanh thu hóa đơn",
      "Active CapEx Cost": "Chi phí CapEx hoạt động",
      "Assets Valuation": "Định giá tài sản",
      "Workforce Size": "Quy mô nhân lực",
      "Active Projects Progress": "Tiến độ dự án hoạt động",
      "Operational Cost Allocation": "Phân bổ chi phí vận hành",
      "Actual:": "Thực tế:",
      "Budget:": "Ngân sách:",
      "CapEx Variance Index": "Chỉ số biến động CapEx",
      "Direct Materials": "Vật tư trực tiếp",
      "Labor Payroll": "Lương nhân công",
      "Asset Overheads": "Chi phí chung tài sản",

      // Customers Register Page
      "Customers Register": "Danh bạ khách hàng",
      "Manage directory details, address configurations, and contact histories.": "Quản lý thông tin chi tiết danh bạ, địa chỉ và lịch sử liên hệ.",
      "Search directory...": "Tìm kiếm danh bạ...",
      "Register Customer Profile": "Đăng ký hồ sơ khách hàng",
      "Customer / Company Name *": "Tên khách hàng / Công ty *",
      "e.g. Acme Contracting Corp": "Ví dụ: Tập đoàn Thầu Acme",
      "This client represents an Organization / Company": "Khách hàng này đại diện cho một Tổ chức / Công ty",
      "Corporate Organization": "Tổ chức doanh nghiệp",
      "Individual": "Cá nhân",
      "Limit:": "Hạn mức:",
      "Note on 2026-06-14: Client requested cement pricing list updates. Pipeline status synchronized.": "Ghi chú ngày 14/06/2026: Khách hàng yêu cầu cập nhật danh sách giá xi măng. Đồng bộ trạng thái kênh bán hàng.",

      // Dashboard Additional Mappings
      "+18.2% vs last month": "+18.2% so với tháng trước",
      "Of": "Trên",
      "used": "đã sử dụng",
      "-2.4% holding cost": "-2.4% chi phí lưu kho",
      "Staff Members": "Nhân viên",
      "Active across 2 departments": "Hoạt động trên 2 phòng ban",

      // Field Services Page
      "Field Services & Visits": "Dịch vụ hiện trường & Chuyến thăm",
      "Track mobile site calls, dispatch engineering specialists, and document visit photo logs.": "Theo dõi các cuộc gọi thực địa di động, điều phối chuyên gia kỹ thuật và tài liệu ảnh chuyến thăm.",
      "Schedule Technician Visit": "Lên lịch chuyến thăm của kỹ thuật viên",
      "Target Client *": "Khách hàng mục tiêu *",
      "Assign Technician": "Phân công kỹ thuật viên",
      "Visit Objectives / Directions": "Mục tiêu chuyến thăm / Chỉ dẫn",
      "e.g. Inspect crack widening on second pillar column...": "Ví dụ: Kiểm tra vết nứt lan rộng trên cột trụ thứ hai...",
      "Confirm Visit": "Xác nhận chuyến thăm",
      "Search site visits...": "Tìm kiếm chuyến thăm...",
      "Inspection Call": "Yêu cầu kiểm tra",
      "Scheduled:": "Lịch trình:",
      "Task Notes": "Ghi chú công việc",
      "Visit Report Log": "Nhật ký báo cáo chuyến thăm",
      "Technician:": "Kỹ thuật viên:",
      "Photo evidence": "Hình ảnh minh chứng",

      // Barcode Scanner Page
      "Barcode & QR Code Scanner": "Máy quét mã vạch & mã QR",
      "Simulate material check-ins using scanning hardware or camera scans.": "Mô phỏng nhập kho vật tư bằng phần cứng quét hoặc quét camera.",
      "Live Camera Simulator": "Bộ mô phỏng camera trực tiếp",
      "Scan Window Active": "Cửa sổ quét đang hoạt động",
      "MATERIAL SCAN SUCCESSFUL": "QUÉT VẬT TƯ THÀNH CÔNG",
      "Scan Another Item": "Quét mặt hàng khác",
      "Demo Barcode Shortcuts:": "Lối tắt mã vạch thử nghiệm:",
      "Scan Cement (885002010111)": "Quét xi măng (885002010111)",
      "Scan Rebar (885002010222)": "Quét cốt thép (885002010222)",
      "Scan Sand (885002010333)": "Quét cát (885002010333)",
      "Material Lookup Details": "Chi tiết tra cứu vật tư",
      "Enter barcode or SKU code manually...": "Nhập mã vạch hoặc mã SKU thủ công...",
      "Lookup": "Tra cứu",
      "No material item matched that barcode/SKU code.": "Không có vật tư nào khớp với mã vạch/mã SKU đó.",
      "Material Title:": "Tên vật tư:",
      "SKU Reference:": "Tham chiếu SKU:",
      "Stock Location:": "Vị trí kho:",
      "In Stock Quantity:": "Số lượng tồn kho:",
      "Brooklyn Main Yard": "Kho chính Brooklyn",
      "units": "đơn vị",
      "Description": "Mô tả",
      "No description listed.": "Không có mô tả.",

      // Warehouses Catalog Page
      "Warehouse Locations": "Địa điểm kho bãi",
      "Manage material distribution and safety storage yards.": "Quản lý phân phối vật tư và bãi lưu trữ an toàn.",
      "Code:": "Mã:",
      "No location address listed.": "Không có địa chỉ địa điểm nào được liệt kê.",
      "Stocks Breakdown": "Báo cáo tồn kho chi tiết",

      // Site Surveys Page
      "Construction Site Surveys": "Khảo sát công trường xây dựng",
      "Record topography notes, layout drawing updates, GPS tags and client sign-offs.": "Ghi lại các ghi chú địa hình, bản cập nhật bản vẽ mặt bằng, thẻ GPS và ký duyệt của khách hàng.",
      "Conduct New Survey": "Tiến hành khảo sát mới",
      "Draft Site Survey Details": "Soạn thảo chi tiết khảo sát công trường",
      "Target Project *": "Dự án mục tiêu *",
      "GPS Coordinates": "Tọa độ GPS",
      "Latitude": "Vĩ độ",
      "Longitude": "Kinh độ",
      "Reading GPS...": "Đang đọc GPS...",
      "Get Live GPS": "Lấy GPS trực tiếp",
      "Layout Drawing sketch": "Phác thảo bản vẽ mặt bằng",
      "Clear Sketch": "Xóa phác thảo",
      "Authorized Client Signature": "Chữ ký khách hàng ủy quyền",
      "Clear Signature": "Xóa chữ ký",
      "Observations / Survey Notes": "Quan sát / Ghi chú khảo sát",
      "Record structural defects, site access limitations, soil conditions...": "Ghi lại các khuyết tật kết cấu, hạn chế tiếp cận trang web, điều kiện đất đai...",
      "Save Report": "Lưu báo cáo",
      "General Project": "Dự án chung",
      "GPS:": "GPS:",
      "Survey sketch drawing": "Bản vẽ phác thảo khảo sát",
      "Client Sign-off": "Khách hàng ký duyệt",

      // Timesheets Page
      "Timesheets register": "Đăng ký bảng chấm công công việc",
      "Log direct labor hours per project task. Used for actual cost calculations and HR audit.": "Ghi nhận giờ công lao động trực tiếp theo đầu việc dự án. Được sử dụng để tính toán chi phí thực tế và kiểm toán nhân sự.",
      "Log Work Hours": "Ghi nhận giờ làm việc",
      "Total Logged Hours": "Tổng số giờ đã ghi nhận",
      "hrs": "giờ",
      "Hrs": "Giờ",
      "Log Timesheet Hours": "Ghi nhận giờ chấm công",
      "Hours spent *": "Số giờ đã làm *",
      "Work Date": "Ngày làm việc",
      "Task Log Description": "Mô tả nhật ký công việc",
      "e.g. Cleaned column concrete fragments, prepped anchors...": "Ví dụ: Dọn dẹp mảnh vụn bê tông cột, chuẩn bị neo...",
      "Confirm Log": "Xác nhận ghi nhận",
      "Log Date": "Ngày ghi nhận",
      "Hours": "Số giờ",

      // Workforce Page
      "Manage HR files, direct salaries, direct payroll classifications and profiles.": "Quản lý hồ sơ nhân sự, lương trực tiếp, phân loại bảng lương và hồ sơ.",
      "Register Employee": "Đăng ký nhân viên",
      "Register Staff Member": "Đăng ký thành viên nhân viên",
      "Full Name *": "Họ và tên *",
      "Position / Title *": "Chức vụ / Tiêu đề *",
      "e.g. Michael Jordan": "Ví dụ: Michael Jordan",
      "e.g. Masonry Foreman": "Ví dụ: Tổ trưởng xây dựng",
      "Monthly Direct Salary ($)": "Lương trực tiếp hàng tháng ($)",
      "Primary Department": "Phòng ban chính",
      "Engineering Operations": "Vận hành kỹ thuật",
      "Finance & Accounting": "Tài chính & Kế toán",
      "Save Profile": "Lưu hồ sơ",
      "Search personnel profiles...": "Tìm kiếm hồ sơ nhân sự...",
      "New Staff member": "Thành viên nhân viên mới",
      "Dept:": "Phòng ban:",
      "Hired:": "Ngày tuyển:",
      "Salary:": "Mức lương:",
      "Active Duty": "Đang làm việc",
      "Attendance & Payroll": "Chấm công & Tính lương",
      "Time Attendance & Payroll": "Chấm công & Tính lương",
      "Biometric Time Clock": "Chấm công Sinh trắc",
      "Face Liveness Detection": "Xác thực thực thể sống",
      "Shift Management": "Quản lý Ca làm việc",
      "Allowed Location Radius": "Bán kính Địa điểm cho phép",
      "Lock & Process Payroll": "Chốt & Tính lương",
      "Personal Income Tax": "Thuế thu nhập cá nhân",
      "Net Pay": "Thực nhận",
      "Deductions": "Khấu trừ",
      "Manager": "Quản lý",
      "Employee": "Nhân viên",
      "Admin": "Quản trị viên",
      "Attendance Logs": "Nhật ký chấm công",
      "Geofence Locations": "Địa điểm bán kính",
      "Shift Policies": "Chính sách ca làm",
      "Leaves Approval": "Duyệt nghỉ phép",
      "OT Approval": "Duyệt tăng ca",
      "Adjustments": "Điều chỉnh công",
      "Monthly Timesheet": "Bảng công tháng",
      "Calculations Grid": "Bảng tính lương",
      "Payslip Delivery": "Gửi phiếu lương",
      "Reports Hub": "Trung tâm báo cáo",
      "Audit Trail": "Lịch sử hệ thống",
      "My Timesheets": "Bảng công của tôi",
      "My Payslips": "Phiếu lương của tôi",
      "Submit Requests": "Gửi yêu cầu",
      "Account Settings": "Cài đặt tài khoản",
      "Time Clock": "Chấm công sinh trắc",
      "Name": "Tên",
      "Action": "Thao tác",
      "Face selfie uploaded and verified!": "Đã tải ảnh chụp và xác thực thành công!",
      "Or Select Location:": "Hoặc chọn địa điểm:",
      "Choose Active Office/Site": "Chọn văn phòng/công trường hoạt động",
      "Upload Selfie": "Tải ảnh lên",
      "Location added successfully!": "Thêm địa điểm thành công!",
      "Shift added successfully!": "Thêm ca làm việc thành công!",
      "Calculated payroll for month ": "Đã tính lương cho tháng ",
      "Locked payroll sheet for month ": "Đã chốt bảng lương cho tháng ",
      "Dispatched payslips emails to all locked employees.": "Đã gửi email phiếu lương cho tất cả nhân viên được chốt.",
      "Exported file successfully!": "Xuất file thành công!",
      "SuccessFactors Suite": "Bộ giải pháp SuccessFactors",
      "Payroll & Attendance": "Chấm công & Tính lương",
      "HR Payroll & Attendance Command Center": "Trung tâm Điều hành Chấm công & Tính lương",
      "Corporate dashboard for biometric lock registers, automated contract pay, and secure slips dispatch.": "Bảng điều khiển doanh nghiệp để ghi nhận chấm công sinh trắc, tính lương hợp đồng tự động và gửi phiếu lương bảo mật.",
      "Auto-Calculate Pay": "Tự động tính lương",
      "Daily Attendance Ratio (Last 7 Days)": "Tỷ lệ chấm công hàng ngày (7 ngày qua)",
      "On-Time": "Đúng giờ",
      "Late": "Đi trễ",
      "Absent": "Vắng mặt",
      "Payroll Cost By Department ($)": "Chi phí lương theo phòng ban ($)",
      "Attendance Logs Archive": "Kho lưu trữ nhật ký chấm công",
      "Search employee...": "Tìm kiếm nhân viên...",
      "All Departments": "Tất cả phòng ban",
      "Warehouse Operations": "Vận hành Kho",
      "Sales & Marketing": "Kinh doanh & Tiếp thị",
      "Department": "Phòng ban",
      "Check In": "Giờ vào",
      "Check Out": "Giờ ra",
      "Verification Details": "Chi tiết xác thực",
      "Register Check-in Location": "Đăng ký địa điểm chấm công",
      "Location Name *": "Tên địa điểm *",
      "Latitude *": "Vĩ độ *",
      "Longitude *": "Kinh độ *",
      "Allowed Radius (Meters) *": "Bán kính cho phép (Mét) *",
      "Create Location": "Tạo địa điểm",
      "Active Geofence Areas": "Khu vực địa giới hoạt động",
      "Coordinates": "Tọa độ",
      "Allowed Radius": "Bán kính cho phép",
      "Deleted location ": "Đã xóa địa điểm ",
      "Create Shift Policy": "Tạo chính sách ca làm",
      "Shift Name *": "Tên ca làm việc *",
      "Start Time *": "Giờ bắt đầu *",
      "End Time *": "Giờ kết thúc *",
      "Grace (Min)": "Thời gian ân hạn (Phút)",
      "Break (Min)": "Thời gian nghỉ (Phút)",
      "OT Rate": "Hệ số tăng ca",
      "Shift Configurations": "Cấu hình ca làm việc",
      "Time Window": "Khung thời gian",
      "Grace Period": "Thời gian ân hạn",
      "Break Duration": "Thời gian nghỉ",
      "OT Multiplier": "Hệ số tăng ca",
      "min": "phút",
      "Deleted shift ": "Đã xóa ca làm việc ",
      "Leave Requests Approvals": "Duyệt yêu cầu nghỉ phép",
      "Date Range": "Khoảng ngày",
      "Reason": "Lý do",
      "Decisions": "Quyết định",
      "Approved leave request!": "Đã duyệt yêu cầu nghỉ phép!",
      "Rejected leave request!": "Đã từ chối yêu cầu nghỉ phép!",
      "By": "Bởi",
      "Overtime Registration Approvals": "Duyệt đăng ký tăng ca",
      "OT Hours": "Giờ tăng ca",
      "OT Category": "Loại tăng ca",
      "Approved Overtime!": "Đã duyệt tăng ca!",
      "Rejected Overtime!": "Đã từ chối tăng ca!",
      "Attendance Adjustments Approvals": "Duyệt điều chỉnh chấm công",
      "Target Date": "Ngày điều chỉnh",
      "Requested Times": "Giờ yêu cầu",
      "Approved adjustment!": "Đã duyệt điều chỉnh công!",
      "Rejected adjustment!": "Đã từ chối điều chỉnh công!",
      "Monthly Timesheets Matrix": "Bảng tổng hợp công tháng",
      "Work Days": "Ngày công",
      "Total Hours": "Tổng giờ công",
      "Late Occurrences": "Số lần đi trễ",
      "Leaves Approved": "Nghỉ phép đã duyệt",
      "Bảng tính lương tự động": "Bảng tính lương tự động",
      "Calculated via dynamic formula: Base Salary + OT + Allowance + Bonus - Deductions - PIT - Ins = Net Pay.": "Tính toán theo công thức: Lương cơ bản + Tăng ca + Phụ cấp + Thưởng - Khấu trừ - Thuế TNCN - Bảo hiểm = Thực nhận.",
      "Lock payroll": "Chốt bảng lương",
      "Base Salary": "Lương cơ bản",
      "OT Pay": "Lương tăng ca",
      "Allowance": "Phụ cấp",
      "Bonus": "Thưởng",
      "Bảo hiểm": "Bảo hiểm",
      "Thuế": "Thuế",
      "No payroll data calculated yet. Click \"Auto-Calculate Pay\" at the top right to start.": "Chưa có dữ liệu bảng lương được tính. Bấm \"Tự động tính lương\" ở góc trên bên phải để bắt đầu.",
      "Bulk Deliver Payslips": "Gửi phiếu lương hàng loạt",
      "Locks payslips to \"sent\" status and dispatches secure PDF invoices to registered Supabase Auth emails.": "Chốt trạng thái phiếu lương thành \"Đã gửi\" và gửi file PDF bảo mật tới email đã đăng ký của nhân viên.",
      "Send Bulk Emails": "Gửi email hàng loạt",
      "Last Sent Timestamp": "Thời điểm gửi cuối cùng",
      "Sent payslip email to ": "Đã gửi email phiếu lương đến ",
      "Send Email": "Gửi Email",
      "Email Logs Tracker": "Theo dõi lịch sử gửi email",
      "Date Sent": "Ngày gửi",
      "Target Month": "Tháng áp dụng",
      "System Payroll Reports Center": "Trung tâm báo cáo lương hệ thống",
      "Generates analytical summary chart with direct employee metrics for the selected month.": "Tạo biểu đồ phân tích tóm tắt với các chỉ số nhân viên trực tiếp cho tháng được chọn.",
      "Audit Logs Timeline": "Nhật ký hoạt động hệ thống",
      "Operator": "Người thực hiện",
      "Action Key": "Hành động",
      "Action Details": "Chi tiết hành động",
      "Clocked in successfully!": "Điểm danh vào thành công!",
      "Clocked out successfully!": "Điểm danh ra thành công!",
      "Leave request submitted!": "Đã gửi yêu cầu nghỉ phép!",
      "Overtime request submitted!": "Đã gửi yêu cầu tăng ca!",
      "Adjustment request submitted!": "Đã gửi yêu cầu điều chỉnh công!",
      "Employee Self-Service": "Tự phục vụ của nhân viên (ESS)",
      "My Workday": "Ngày làm việc của tôi",
      "Welcome back": "Chào mừng trở lại",
      "Check in to active coordinates, submit time requests, or download monthly secure PDF payslips.": "Điểm danh tại tọa độ hoạt động, gửi các yêu cầu nghỉ phép/tăng ca, hoặc tải phiếu lương PDF bảo mật hàng tháng.",
      "Biometric Timeclock": "Đồng hồ chấm công sinh trắc",
      "GPS Coordinates *": "Tọa độ GPS *",
      "Retrieve coordinates...": "Đang lấy tọa độ...",
      "Reading...": "Đang đọc...",
      "Closest location:": "Địa điểm gần nhất:",
      "OUT OF GEOFENCE": "NGOÀI VÙNG ĐỊA GIỚI",
      "Scanning liveness...": "Đang quét thực thể sống...",
      "Biometric Face Verified": "Đã xác thực khuôn mặt sinh trắc",
      "Biometric Feed Offline": "Nguồn cấp sinh trắc ngoại tuyến",
      "All Shift Punches Completed Today!": "Đã hoàn thành các lượt chấm công hôm nay!",
      "Have a nice evening!": "Chúc bạn một buổi tối vui vẻ!",
      "Check-out & Record Hours": "Điểm danh ra & Ghi nhận giờ",
      "Verify Biometrics & Check-in": "Xác thực sinh trắc & Điểm danh vào",
      "Attendance History Overview": "Tổng quan lịch sử chấm công",
      "My Personal Timesheets Ledger": "Sổ nhật ký công cá nhân của tôi",
      "Shift Policy": "Ca làm việc",
      "Punches": "Lượt chấm công",
      "OT Earned": "Tăng ca tích lũy",
      "Location Gps": "GPS địa điểm",
      "Verification": "Xác thực",
      "Office Administrative": "Hành chính Văn phòng",
      "My Salary History & Payslips": "Lịch sử lương & Phiếu lương của tôi",
      "Overtime Pay": "Lương tăng ca",
      "Bonuses & Allowances": "Thưởng & Phụ cấp",
      "Deductions & Ins": "Khấu trừ & Bảo hiểm",
      "Employee Name:": "Tên nhân viên:",
      "Position Title:": "Chức vụ:",
      "Workday Period:": "Kỳ làm việc:",
      "Registered Email:": "Email đăng ký:",
      "Days Worked:": "Số ngày công:",
      "OT Logged:": "Tăng ca đã ghi nhận:",
      "Gross Earnings": "Tổng thu nhập gộp",
      "Deductions & Taxes": "Khấu trừ & Thuế",
      "Total Net Received:": "Tổng thực nhận:",
      "Downloaded PDF payslip successfully!": "Đã tải phiếu lương PDF thành công!",
      "Download secure PDF": "Tải PDF bảo mật",
      "Request Vacation / Off": "Yêu cầu nghỉ phép / Nghỉ việc",
      "Leave Category": "Loại nghỉ phép",
      "Annual Leave": "Nghỉ phép năm",
      "Sick Leave": "Nghỉ bệnh",
      "Personal Leave": "Việc riêng",
      "Unpaid Leave": "Nghỉ không lương",
      "Start Date": "Ngày bắt đầu",
      "End Date": "Ngày kết thúc",
      "Detailed Reason *": "Lý do chi tiết *",
      "Send Leave Request": "Gửi yêu cầu nghỉ phép",
      "Request Overtime Approval": "Yêu cầu duyệt tăng ca",
      "Date *": "Ngày *",
      "Hours spent": "Số giờ thực hiện",
      "Send Overtime Request": "Gửi yêu cầu tăng ca",
      "Request Time Correction": "Yêu cầu sửa giờ chấm công",
      "Corrected Check In": "Giờ vào điều chỉnh",
      "Corrected Check Out": "Giờ ra điều chỉnh",
      "Reason *": "Lý do *",
      "Send Correction Request": "Gửi yêu cầu điều chỉnh",
      "Employment Contract Profiles": "Hồ sơ hợp đồng lao động",
      "Position": "Chức vụ",
      "Contract Base Salary": "Lương cơ bản hợp đồng",
      "Update Security Passwords": "Cập nhật mật khẩu bảo mật",
      "Password updated successfully!": "Cập nhật mật khẩu thành công!",
      "Current Password *": "Mật khẩu hiện tại *",
      "New Password *": "Mật khẩu mới *",
      "Update password": "Cập nhật mật khẩu"
    }
  };

    const t = (key: string) => {
    if (language === 'vi' && translations.vi[key]) {
      return translations.vi[key];
    }
    return key;
  };

  // Filter lists by company
  const filteredCustomers = customers.filter((x) => x.company_id === activeCompanyId);
  const filteredLeads = leads.filter((x) => x.company_id === activeCompanyId);
  const filteredProducts = products.filter((x) => x.company_id === activeCompanyId);
  const filteredProjects = projects.filter((x) => x.company_id === activeCompanyId);
  const filteredVendors = vendors.filter((x) => x.company_id === activeCompanyId);
  const filteredEmployees = employees.filter((x) => x.company_id === activeCompanyId);
  const filteredAccounts = accounts.filter((x) => x.company_id === activeCompanyId);
  const filteredInvoices = invoices.filter((x) => x.company_id === activeCompanyId);
  const filteredSalesOrders = salesOrders.filter((x) => x.company_id === activeCompanyId);
  const filteredPurchaseRequests = purchaseRequests.filter((x) => x.company_id === activeCompanyId);
  const filteredExpenses = expenses.filter((x) => x.company_id === activeCompanyId);
  const filteredApprovals = approvals.filter((x) => x.company_id === activeCompanyId);
  const filteredDocuments = documents.filter((x) => x.company_id === activeCompanyId);

  return (
    <ERPContext.Provider
      value={{
        companies,
        users,
        customers: filteredCustomers,
        leads: filteredLeads,
        products: filteredProducts,
        warehouses,
        projects: filteredProjects,
        tasks,
        milestones,
        siteSurveys,
        vendors: filteredVendors,
        employees: filteredEmployees,
        attendance,
        timesheets,
        accounts: filteredAccounts,
        invoices: filteredInvoices,
        salesOrders: filteredSalesOrders,
        purchaseRequests: filteredPurchaseRequests,
        expenses: filteredExpenses,
        approvals: filteredApprovals,
        documents: filteredDocuments,
        
        userCompanies,
        updateUserRole,
        updateAvatarUrl,
        addEmployee,
        updateEmployee,
        
        activeCompanyId,
        setActiveCompanyId,
        currentUser,
        setCurrentUser,
        activeRole,
        language,
        setLanguage: handleSetLanguage,
        t,

        addLead,
        updateLead,
        addCustomer,
        addProduct,
        createSalesOrder,
        createPurchaseRequest,
        createProject,
        addTask,
        updateTaskStatus,
        addSiteSurvey,
        clockIn,
        clockOut,
        addTimesheet,
        addExpense,
        updateApproval,
        addDocument,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (context === undefined) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
