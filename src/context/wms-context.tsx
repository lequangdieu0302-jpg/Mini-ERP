'use client';

import React, { createContext, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useERP } from '@/context/erp-context';
import {
  Product, Warehouse, StockReceipt, StockIssue, StockTransfer,
  StockCount, BatchLot, InventoryTransaction
} from '@/types/erp';
import { WMS_WAREHOUSES } from '@/data/wms-seed';

// ─── UUID Helper Functions ───────────────────────────────────────────────────
const generateUUID = (): string => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const ensureUUID = (id: string): string => {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return generateUUID();
};

interface WMSContextType {
  // Global Static or Small Tables
  warehouses: Warehouse[];
  saveWarehouses: (newWH: Warehouse[]) => Promise<void>;
  categories: any[];

  // Placeholders for large tables to prevent initial compile errors
  products: Product[];
  receipts: StockReceipt[];
  issues: StockIssue[];
  transfers: StockTransfer[];
  counts: StockCount[];
  batches: BatchLot[];
  transactions: InventoryTransaction[];

  // Server-side Mutations
  addProduct: (p: Product) => Promise<boolean>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  addReceipt: (rec: any) => Promise<boolean>;
  addIssue: (iss: any) => Promise<boolean>;
  addTransfer: (trf: any) => Promise<boolean>;
  addCount: (cnt: any) => Promise<boolean>;
  addBatch: (b: BatchLot) => Promise<boolean>;
  addTransaction: (txn: Omit<InventoryTransaction, 'id' | 'created_at'>) => Promise<boolean>;
}

export const WMSContext = createContext<WMSContextType | undefined>(undefined);

export const WMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = createClient();
  const { currentUser, activeCompanyId } = useERP();
  const companyId = activeCompanyId || 'c8b671a8-ff69-42b7-a37a-77c86f7881c1';

  // We only keep warehouses in global context since it is small
  const [warehouses, setWarehouses] = useState<Warehouse[]>(WMS_WAREHOUSES);
  const [categories, setCategories] = useState<any[]>([]);

  // Load warehouses and categories from Supabase on mount/company change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parseSafeArray = (key: string, fallback: any[]) => {
      try {
        const localVal = localStorage.getItem(key);
        if (localVal) {
          const parsed = JSON.parse(localVal);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch(e) {
        console.warn('localStorage is not accessible:', e);
      }
      return fallback;
    };

    setWarehouses(parseSafeArray('wms_warehouses', WMS_WAREHOUSES));

    const loadWarehouses = async () => {
      try {
        const { data: whsData } = await supabase.from('warehouses').select('*');
        if (whsData && whsData.length > 0) {
          setWarehouses(whsData);
        }
      } catch (err) {
        console.error('Error loading Supabase warehouses:', err);
      }
    };

    const loadCategories = async () => {
      try {
        const { data: catData } = await supabase.from('product_categories').select('*');
        if (catData && catData.length > 0) {
          setCategories(catData);
        } else {
          // If no categories in database, seed default ones to avoid empty state
          const defaultCats = [
            { id: 'c0c0c0c0-1111-1111-1111-111111111111', company_id: companyId, name: 'Cement & Binder' },
            { id: 'c0c0c0c0-2222-2222-2222-222222222222', company_id: companyId, name: 'Steel' },
            { id: 'c0c0c0c0-3333-3333-3333-333333333333', company_id: companyId, name: 'Aggregate' },
            { id: 'c0c0c0c0-4444-4444-4444-444444444444', company_id: companyId, name: 'Wood & Timber' },
            { id: 'c0c0c0c0-5555-5555-5555-555555555555', company_id: companyId, name: 'Plumbing' },
            { id: 'c0c0c0c0-6666-6666-6666-666666666666', company_id: companyId, name: 'Electrical' },
            { id: 'c0c0c0c0-7777-7777-7777-777777777777', company_id: companyId, name: 'Waterproofing' },
            { id: 'c0c0c0c0-8888-8888-8888-888888888888', company_id: companyId, name: 'Paint & Coating' },
            { id: 'c0c0c0c0-9999-9999-9999-999999999999', company_id: companyId, name: 'Tiles' },
            { id: 'c0c0c0c0-aaaa-aaaa-aaaa-aaaaaaaaaaaa', company_id: companyId, name: 'Hardware' },
            { id: 'c0c0c0c0-bbbb-bbbb-bbbb-bbbbbbbbbbbb', company_id: companyId, name: 'Safety' },
            { id: 'c0c0c0c0-cccc-cccc-cccc-cccccccccccc', company_id: companyId, name: 'Welding' },
            { id: 'c0c0c0c0-dddd-dddd-dddd-dddddddddddd', company_id: companyId, name: 'Doors & Windows' },
            { id: 'c0c0c0c0-eeee-eeee-eeee-eeeeeeeeeeee', company_id: companyId, name: 'Scaffolding' }
          ];
          await supabase.from('product_categories').insert(defaultCats);
          setCategories(defaultCats);
        }
      } catch (err) {
        console.error('Error loading product categories:', err);
      }
    };

    loadWarehouses();
    loadCategories();
  }, [activeCompanyId]);

  const saveWarehouses = async (newWH: Warehouse[]) => {
    const sanitized = newWH.map(w => ({
      ...w,
      id: ensureUUID(w.id)
    }));
    setWarehouses(sanitized);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('wms_warehouses', JSON.stringify(sanitized));
      }
      for (const w of sanitized) {
        const dbWh = {
          id: w.id,
          company_id: w.company_id || companyId,
          name: w.name,
          code: w.code,
          address: w.address || null,
          type: w.type || 'raw_materials',
          manager_id: currentUser?.id || null,
          status: w.status || 'active',
          created_at: w.created_at || new Date().toISOString()
        };
        await supabase.from('warehouses').upsert(dbWh);
      }
    } catch(e) {
      console.error('Error in saveWarehouses:', e);
    }
  };

  // ─── SERVER-SIDE MUTATIONS ─────────────────────────────────────────────────

  // Helper mapping functions for Database compatibility
  const getCategoryId = (name?: string) => {
    if (!name) return null;
    const cat = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    return cat ? cat.id : null;
  };

  const getUomId = (uomName?: string) => {
    if (!uomName) return null;
    const lower = uomName.toLowerCase();
    if (lower.includes('mét khối') || lower.includes('m³')) return 'b0b0b0b0-3333-3333-3333-333333333333';
    if (lower.includes('tấn') || lower.includes('ton')) return 'b0b0b0b0-5555-5555-5555-555555555555';
    if (lower.includes('kg') || lower.includes('kilogram')) return 'b0b0b0b0-4444-4444-4444-444444444444';
    if (lower.includes('mét vuông') || lower.includes('m²')) return 'b0b0b0b0-2222-2222-2222-222222222222';
    if (lower.includes('mét') || lower.includes('m')) return 'b0b0b0b0-1111-1111-1111-111111111111';
    return 'b0b0b0b0-6666-6666-6666-666666666666'; // Default to Pieces/Units
  };

  const addProduct = async (p: Product): Promise<boolean> => {
    try {
      const dbProd = {
        id: ensureUUID(p.id),
        company_id: p.company_id || companyId,
        name: p.name,
        sku: p.sku || null,
        barcode: p.barcode || null,
        description: p.description || null,
        sale_price: Number(p.sale_price) || 0,
        cost_price: Number(p.cost_price) || 0,
        is_material: p.is_material !== undefined ? p.is_material : true,
        min_qty: Number(p.min_qty) || 0,
        max_qty: p.max_qty !== undefined ? Number(p.max_qty) : null,
        current_qty: Number(p.current_qty) || 0,
        warehouse_id: p.warehouse_id || null,
        location: p.location || null,
        manufacturer: p.manufacturer || null,
        status: p.status || 'active',
        image_url: p.image_url || null,
        created_at: p.created_at || new Date().toISOString(),
        category_id: p.category_id || getCategoryId(p.category_name),
        uom_id: p.uom_id || getUomId(p.uom)
      };
      const { error } = await supabase.from('products').insert(dbProd);
      if (error) throw error;
      return true;
    } catch(e) {
      console.error('Error in addProduct:', e);
      return false;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
    try {
      const dbUpdates: any = { ...updates };
      
      if (updates.category_name) {
        dbUpdates.category_id = getCategoryId(updates.category_name);
      }
      if (updates.uom) {
        dbUpdates.uom_id = getUomId(updates.uom);
      }
      
      // Clean up fields that do not exist on the database products table
      delete dbUpdates.category_name;
      delete dbUpdates.uom;
      
      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch(e) {
      console.error('Error in updateProduct:', e);
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch(e) {
      console.error('Error in deleteProduct:', e);
      return false;
    }
  };

  const addReceipt = async (rec: any): Promise<boolean> => {
    try {
      const recId = rec.id || generateUUID();
      const dbRec = {
        id: recId,
        company_id: rec.company_id || companyId,
        receipt_no: rec.receipt_no,
        receipt_type: rec.receipt_type,
        warehouse_id: rec.warehouse_id,
        supplier_id: rec.supplier_id || null,
        date: rec.date,
        status: rec.status,
        notes: rec.notes || null,
        total_amount: Number(rec.total_amount) || 0,
        created_by: currentUser?.id || null,
        created_at: rec.created_at || new Date().toISOString()
      };
      
      const { error: rErr } = await supabase.from('stock_receipts').insert(dbRec);
      if (rErr) throw rErr;

      if (rec.lines && rec.lines.length > 0) {
        const dbLines = rec.lines.map((line: any) => ({
          id: line.id || generateUUID(),
          receipt_id: recId,
          product_id: line.product_id,
          qty: Number(line.qty) || 0,
          unit_price: Number(line.unit_price) || 0,
          amount: Number(line.amount) || 0,
          batch_no: line.batch_no || null,
          serial_no: line.serial_no || null,
          location: line.location || null
        }));
        const { error: lErr } = await supabase.from('stock_receipt_lines').insert(dbLines);
        if (lErr) throw lErr;
      }
      return true;
    } catch(e) {
      console.error('Error in addReceipt:', e);
      return false;
    }
  };

  const addIssue = async (iss: any): Promise<boolean> => {
    try {
      const issId = iss.id || generateUUID();
      const dbIss = {
        id: issId,
        company_id: iss.company_id || companyId,
        issue_no: iss.issue_no,
        issue_type: iss.issue_type,
        warehouse_id: iss.warehouse_id,
        customer_id: iss.customer_id || null,
        department: iss.department || null,
        date: iss.date,
        status: iss.status,
        cost_method: iss.cost_method || 'FIFO',
        notes: iss.notes || null,
        total_amount: Number(iss.total_amount) || 0,
        created_by: currentUser?.id || null,
        created_at: iss.created_at || new Date().toISOString()
      };

      const { error: iErr } = await supabase.from('stock_issues').insert(dbIss);
      if (iErr) throw iErr;

      if (iss.lines && iss.lines.length > 0) {
        const dbLines = iss.lines.map((line: any) => ({
          id: line.id || generateUUID(),
          issue_id: issId,
          product_id: line.product_id,
          qty_requested: Number(line.qty_requested) || 0,
          qty_issued: Number(line.qty_issued) || 0,
          unit_price: Number(line.unit_price) || 0,
          amount: Number(line.amount) || 0,
          batch_no: line.batch_no || null,
          serial_no: line.serial_no || null
        }));
        const { error: lErr } = await supabase.from('stock_issue_lines').insert(dbLines);
        if (lErr) throw lErr;
      }
      return true;
    } catch(e) {
      console.error('Error in addIssue:', e);
      return false;
    }
  };

  const addTransfer = async (trf: any): Promise<boolean> => {
    try {
      const trfId = trf.id || generateUUID();
      const dbTrf = {
        id: trfId,
        company_id: trf.company_id || companyId,
        transfer_no: trf.transfer_no,
        source_warehouse_id: trf.source_warehouse_id,
        dest_warehouse_id: trf.dest_warehouse_id,
        date: trf.date,
        status: trf.status,
        notes: trf.notes || null,
        created_by: currentUser?.id || null,
        created_at: trf.created_at || new Date().toISOString()
      };

      const { error: tErr } = await supabase.from('stock_transfers').insert(dbTrf);
      if (tErr) throw tErr;

      if (trf.lines && trf.lines.length > 0) {
        const dbLines = trf.lines.map((line: any) => ({
          id: line.id || generateUUID(),
          transfer_id: trfId,
          product_id: line.product_id,
          qty: Number(line.qty) || 0
        }));
        const { error: lErr } = await supabase.from('stock_transfer_lines').insert(dbLines);
        if (lErr) throw lErr;
      }
      return true;
    } catch(e) {
      console.error('Error in addTransfer:', e);
      return false;
    }
  };

  const addCount = async (cnt: any): Promise<boolean> => {
    try {
      const cntId = cnt.id || generateUUID();
      const dbCnt = {
        id: cntId,
        company_id: cnt.company_id || companyId,
        count_no: cnt.count_no,
        warehouse_id: cnt.warehouse_id,
        scope: cnt.scope,
        scope_filter: cnt.scope_filter || null,
        date: cnt.date,
        status: cnt.status,
        notes: cnt.notes || null,
        created_by: currentUser?.id || null,
        created_at: cnt.created_at || new Date().toISOString()
      };

      const { error: cErr } = await supabase.from('stock_counts').insert(dbCnt);
      if (cErr) throw cErr;

      if (cnt.lines && cnt.lines.length > 0) {
        const dbLines = cnt.lines.map((line: any) => ({
          id: line.id || generateUUID(),
          count_id: cntId,
          product_id: line.product_id,
          system_qty: Number(line.system_qty) || 0,
          actual_qty: Number(line.actual_qty) || 0,
          difference: Number(line.difference) || 0,
          value_difference: Number(line.value_difference) || 0,
          reason: line.reason || null
        }));
        const { error: lErr } = await supabase.from('stock_count_lines').insert(dbLines);
        if (lErr) throw lErr;
      }
      return true;
    } catch(e) {
      console.error('Error in addCount:', e);
      return false;
    }
  };

  const addBatch = async (b: BatchLot): Promise<boolean> => {
    try {
      const dbBatch = {
        id: ensureUUID(b.id),
        company_id: b.company_id || companyId,
        product_id: b.product_id,
        batch_no: b.batch_no || null,
        serial_no: b.serial_no || null,
        manufacture_date: b.manufacture_date || null,
        expiry_date: b.expiry_date || null,
        supplier_id: b.supplier_id || null,
        warehouse_id: b.warehouse_id || null,
        qty: Number(b.qty) || 0,
        status: b.status || 'available',
        created_at: b.created_at || new Date().toISOString()
      };
      const { error } = await supabase.from('batch_lots').insert(dbBatch);
      if (error) throw error;
      return true;
    } catch(e) {
      console.error('Error in addBatch:', e);
      return false;
    }
  };

  const addTransaction = async (txn: Omit<InventoryTransaction, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      const dbTx = {
        id: generateUUID(),
        company_id: txn.company_id || companyId,
        product_id: txn.product_id,
        action: txn.action,
        reference_no: txn.reference_no,
        warehouse_id: txn.warehouse_id || null,
        qty_before: Number(txn.qty_before) || 0,
        qty_change: Number(txn.qty_change) || 0,
        qty_after: Number(txn.qty_after) || 0,
        value_change: Number(txn.value_change) || 0,
        performed_by: currentUser?.id || null,
        notes: txn.notes || null,
        created_at: new Date().toISOString()
      };
      const { error } = await supabase.from('inventory_transactions').insert(dbTx);
      if (error) throw error;
      return true;
    } catch(e) {
      console.error('Error in addTransaction:', e);
      return false;
    }
  };

  return (
    <WMSContext.Provider
      value={{
        warehouses,
        saveWarehouses,
        categories,

        // Empty array placeholders to avoid initial compile errors
        products: [],
        receipts: [],
        issues: [],
        transfers: [],
        counts: [],
        batches: [],
        transactions: [],

        // Server-side mutations
        addProduct,
        updateProduct,
        deleteProduct,
        addReceipt,
        addIssue,
        addTransfer,
        addCount,
        addBatch,
        addTransaction
      }}
    >
      {children}
    </WMSContext.Provider>
  );
};
