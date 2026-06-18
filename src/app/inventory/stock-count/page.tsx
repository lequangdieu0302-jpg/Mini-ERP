'use client';

import React, { useState, useEffect } from 'react';
import { PermissionGuard } from '@/components/permission-guard';
import { useERP } from '@/context/erp-context';
import { useWMSState } from '@/hooks/use-wms-state';
import { createClient } from '@/utils/supabase/client';
import { StockCount, StockCountLine, Product } from '@/types/erp';
import { MATERIAL_CATEGORIES } from '@/data/wms-seed';
import {
  Search, Plus, Check, Play, X, ChevronDown, ChevronUp,
  Info, Calendar, ClipboardCheck, Barcode, AlertTriangle
} from 'lucide-react';

export default function StockCounts() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { t } = useERP();
  const {
    warehouses,
    addCount,
    updateProduct,
    addTransaction,
    categories
  } = useWMSState();

  // Paginated List State
  const [countsList, setCountsList] = useState<any[]>([]);
  const [totalCountsCount, setTotalCountsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCountId, setExpandedCountId] = useState<string | null>(null);

  // Modals & Toasts
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Count Fields
  const [formWarehouseId, setFormWarehouseId] = useState('');
  const [formScope, setFormScope] = useState<'full' | 'zone' | 'category'>('full');
  const [formScopeFilter, setFormScopeFilter] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');
  
  // Count lines for creation
  const [formLines, setFormLines] = useState<Omit<StockCountLine, 'id' | 'count_id'>[]>([]);

  const itemsPerPage = 10;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchCounts = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('stock_counts')
        .select('*, warehouse:warehouses(name), lines:stock_count_lines(*, product:products(name, sku))', { count: 'exact' });

      if (searchTerm.trim()) {
        query = query.or(`count_no.ilike.%${searchTerm.trim()}%,notes.ilike.%${searchTerm.trim()}%`);
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const mapped = (data || []).map((c: any) => ({
        id: c.id,
        company_id: c.company_id,
        count_no: c.count_no,
        warehouse_id: c.warehouse_id,
        warehouse_name: c.warehouse ? c.warehouse.name : 'Depot',
        scope: c.scope,
        scope_filter: c.scope_filter,
        date: c.date,
        status: c.status,
        notes: c.notes,
        created_by: c.created_by,
        created_at: c.created_at,
        lines: (c.lines || []).map((l: any) => ({
          id: l.id,
          count_id: l.count_id,
          product_id: l.product_id,
          product_name: l.product ? l.product.name : 'Unknown Material',
          sku: l.product ? l.product.sku : '',
          system_qty: Number(l.system_qty) || 0,
          actual_qty: Number(l.actual_qty) || 0,
          difference: Number(l.difference) || 0,
          value_difference: Number(l.value_difference) || 0,
          reason: l.reason || ''
        }))
      }));

      setCountsList(mapped);
      setTotalCountsCount(count || 0);
    } catch (err) {
      console.error('Error fetching stock counts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [searchTerm, currentPage]);

  // Populate count lines automatically when warehouse/scope changes
  const handlePopulateLines = async (warehouseId: string, scope: 'full' | 'zone' | 'category', scopeFilter: string) => {
    if (!warehouseId) {
      setFormLines([]);
      return;
    }

    try {
      const supabase = createClient();
      let query = supabase
        .from('products')
        .select('id, name, sku, current_qty, cost_price')
        .eq('warehouse_id', warehouseId)
        .eq('status', 'active');

      if (scope === 'category' && scopeFilter) {
        const cat = categories.find(c => c.name === scopeFilter);
        if (cat) {
          query = query.eq('category_id', cat.id);
        } else {
          query = query.eq('category_id', scopeFilter);
        }
      } else if (scope === 'zone' && scopeFilter) {
        query = query.like('location', `${scopeFilter}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const lines = (data || []).map(p => ({
        product_id: p.id,
        product_name: p.name,
        sku: p.sku || '',
        system_qty: Number(p.current_qty) || 0,
        actual_qty: Number(p.current_qty) || 0, // defaults to match, user edits differences
        difference: 0,
        value_difference: 0,
        reason: '',
        cost_price: Number(p.cost_price) || 0
      }));

      setFormLines(lines);
    } catch (err) {
      console.error('Error populating count lines:', err);
      showToast(t('Error loading warehouse items.'));
    }
  };

  const handleActualQtyChange = (index: number, actual: number) => {
    const lines = [...formLines];
    const line = lines[index] as any;
    const system = line.system_qty;
    const diff = actual - system;
    const cost = line.cost_price || 0;

    lines[index] = {
      ...line,
      actual_qty: actual,
      difference: diff,
      value_difference: diff * cost
    };
    setFormLines(lines);
  };

  const handleReasonChange = (index: number, reason: string) => {
    const lines = [...formLines];
    lines[index] = {
      ...lines[index],
      reason
    };
    setFormLines(lines);
  };

  const handleCreateCount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formWarehouseId) {
      showToast(t('Warehouse selection is required.'));
      return;
    }

    if (formLines.length === 0) {
      showToast(t('No products found matching the criteria in this warehouse.'));
      return;
    }

    try {
      const supabase = createClient();
      const { count } = await supabase
        .from('stock_counts')
        .select('*', { count: 'exact', head: true });

      const nextSeq = (count || 0) + 1;
      const countNo = `CNT-${new Date().getFullYear()}-${String(nextSeq).padStart(4, '0')}`;

      // Insert Count using context mutation
      const success = await addCount({
        count_no: countNo,
        warehouse_id: formWarehouseId,
        scope: formScope,
        scope_filter: formScopeFilter || undefined,
        date: formDate,
        status: 'draft',
        notes: formNotes || undefined,
        lines: formLines
      });

      if (success) {
        setCreateModalOpen(false);
        showToast(t('Inventory audit sheet created successfully (Draft).'));
        fetchCounts();
      } else {
        showToast(t('Failed to create count.'));
      }
    } catch (err) {
      console.error(err);
      showToast(t('Error creating count sheet.'));
    }
  };

  // Workflow Action 1: Approve (Draft -> Approved)
  const handleApprove = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('stock_counts')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
      showToast(t('Audit sheet approved. Adjustments ready to be applied.'));
      fetchCounts();
    } catch (e) {
      console.error(e);
      showToast(t('Failed to approve count.'));
    }
  };

  // Workflow Action 2: Apply Adjustments (Approved -> Completed)
  const handleApplyAdjustments = async (id: string) => {
    const count = countsList.find(c => c.id === id);
    if (!count) return;

    try {
      const supabase = createClient();

      for (const line of count.lines) {
        if (line.difference !== 0) {
          const { data: prodData } = await supabase
            .from('products')
            .select('current_qty, cost_price')
            .eq('id', line.product_id)
            .single();

          const prevQty = prodData ? Number(prodData.current_qty) || 0 : 0;
          const cost = prodData ? Number(prodData.cost_price) || 0 : 0;
          const postQty = line.actual_qty;

          // update stock qty
          await updateProduct(line.product_id, { current_qty: postQty });

          // write transaction log
          await addTransaction({
            company_id: count.company_id,
            product_id: line.product_id,
            action: 'count',
            reference_no: count.count_no,
            warehouse_id: count.warehouse_id,
            qty_before: prevQty,
            qty_change: line.difference,
            qty_after: postQty,
            value_change: line.difference * cost,
            notes: line.reason || `Inventory count reconciliation`
          });
        }
      }

      const { error } = await supabase
        .from('stock_counts')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;

      showToast(t('Adjustments applied. Inventory balances re-aligned.'));
      fetchCounts();
    } catch (e) {
      console.error('Error applying adjustments:', e);
      showToast(t('Error applying adjustments.'));
    }
  };

  // Sum line calculations for creation form
  const totalSystemQty = formLines.reduce((sum, l) => sum + l.system_qty, 0);
  const totalActualQty = formLines.reduce((sum, l) => sum + l.actual_qty, 0);
  const totalDiffQty = formLines.reduce((sum, l) => sum + l.difference, 0);
  const totalValDiff = formLines.reduce((sum, l) => sum + l.value_difference, 0);

  const totalPages = Math.ceil(totalCountsCount / itemsPerPage);

  if (!mounted) return null;

  return (
    <PermissionGuard module="inventory">
      <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto min-h-screen text-xs select-none">
        
        {/* Toast alerts */}
        {toastMsg && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-lg shadow-xl font-bold border border-zinc-800 dark:border-zinc-200 animate-slide-up flex items-center gap-2">
            <Info className="h-4 w-4 text-emerald-500" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              {t('Physical Inventory Audits')}
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-450 mt-1">
              {t('Perform full or category-based physical counts, calculate variance value, and reconcile database stock.')}
            </p>
          </div>

          <div>
            <button 
              onClick={() => {
                setFormLines([]);
                setFormNotes('');
                setFormScope('full');
                setFormScopeFilter('');
                setFormWarehouseId(warehouses[0]?.id || '');
                // Initial populate
                handlePopulateLines(warehouses[0]?.id || '', 'full', '');
                setCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-955 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 rounded-lg font-bold transition-opacity"
            >
              <Plus className="h-4 w-4" />
              {t('New Inventory Count')}
            </button>
          </div>
        </div>

        {/* Search toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-850">
          <div className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
            {t('Audit Reports History')}
          </div>

          {/* Search */}
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder={t('Search count register no...')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-md pl-8 pr-3 py-1.5 outline-none text-zinc-855 dark:text-zinc-200"
            />
          </div>
        </div>

        {/* Audits Table */}
        <div className="saas-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-450 dark:text-zinc-550 border-b border-zinc-250/20 dark:border-zinc-800/50 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-6"></th>
                  <th className="py-3 px-3">{t('Audit No')}</th>
                  <th className="py-3 px-3">{t('Warehouse Depot')}</th>
                  <th className="py-3 px-3">{t('Scope')}</th>
                  <th className="py-3 px-3 font-mono">{t('Date')}</th>
                  <th className="py-3 px-3 text-center">{t('Items Audited')}</th>
                  <th className="py-3 px-3 text-center">{t('Status')}</th>
                  <th className="py-3 px-4 text-right">{t('Reconciliation Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-850/40">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-zinc-450 bg-zinc-50/10 dark:bg-zinc-900/5 font-bold">
                      {t('Loading...')}
                    </td>
                  </tr>
                ) : countsList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-zinc-450 bg-zinc-50/10 dark:bg-zinc-900/5">
                      {t('No inventory counts found.')}
                    </td>
                  </tr>
                ) : (
                  countsList.map((c) => {
                    const isExpanded = expandedCountId === c.id;

                    // Color code status badge
                    let statusColor = 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-450';
                    if (c.status === 'approved') statusColor = 'bg-blue-50 text-blue-600 dark:bg-blue-950/25 dark:text-blue-400';
                    else if (c.status === 'completed') statusColor = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/25 dark:text-emerald-400';

                    // Calculate total differences inside lines
                    const diffSum = c.lines.reduce((sum: number, l: any) => sum + Math.abs(l.difference), 0);
                    const valDiffSum = c.lines.reduce((sum: number, l: any) => sum + l.value_difference, 0);

                    return (
                      <React.Fragment key={c.id}>
                        <tr 
                          onClick={() => setExpandedCountId(isExpanded ? null : c.id)}
                          className={`hover:bg-zinc-50/30 dark:hover:bg-zinc-900/15 transition-colors cursor-pointer ${isExpanded ? 'bg-zinc-50/20 dark:bg-zinc-900/5' : ''}`}
                        >
                          <td className="py-3.5 px-4">
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-zinc-850 dark:text-zinc-50">{c.count_no}</td>
                          <td className="py-3.5 px-3 font-bold text-zinc-800 dark:text-zinc-200">{c.warehouse_name}</td>
                          <td className="py-3.5 px-3 capitalize">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400">
                              {c.scope} {c.scope_filter ? `(${c.scope_filter})` : ''}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-zinc-505">{c.date}</td>
                          <td className="py-3.5 px-3 text-center font-mono font-bold">{c.lines.length}</td>
                          <td className="py-3.5 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${statusColor}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {c.status === 'draft' && (
                                <button
                                  onClick={() => handleApprove(c.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/40 dark:border-blue-800/40 rounded font-bold transition-colors cursor-pointer"
                                >
                                  <Check className="h-3 w-3" />
                                  {t('Approve Count')}
                                </button>
                              )}
                              {c.status === 'approved' && (
                                <button
                                  onClick={() => handleApplyAdjustments(c.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-450 border border-emerald-200/40 dark:border-emerald-800/40 rounded font-bold transition-colors cursor-pointer"
                                >
                                  <ClipboardCheck className="h-3 w-3" />
                                  {t('Apply Reconciliation')}
                                </button>
                              )}
                              {c.status === 'completed' && (
                                <span className="text-[10px] text-zinc-400 font-bold pr-2">
                                  {t('Reconciled')}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded items list */}
                        {isExpanded && (
                          <tr className="bg-zinc-50/20 dark:bg-zinc-900/5">
                            <td colSpan={8} className="py-4 px-8 border-t border-b border-zinc-200/50 dark:border-zinc-850/50">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{t('Reconciliation Spreadsheet details')}</h4>
                                  <div className="flex gap-4 font-mono text-[9px] text-zinc-500">
                                    <span>{t('Total Variance Qty:')} <strong className="text-zinc-700 dark:text-zinc-300 font-mono">{diffSum}</strong></span>
                                    <span>{t('Net Value Impact:')} <strong className={valDiffSum < 0 ? 'text-red-500' : valDiffSum > 0 ? 'text-emerald-500' : 'text-zinc-700 dark:text-zinc-300'}>${valDiffSum.toFixed(2)}</strong></span>
                                  </div>
                                </div>
                                <div className="border border-zinc-200/40 dark:border-zinc-850 rounded-lg overflow-hidden">
                                  <table className="w-full text-left text-[10px] border-collapse bg-white dark:bg-zinc-950">
                                    <thead>
                                      <tr className="bg-zinc-50 dark:bg-zinc-900 font-bold border-b border-zinc-200/40 dark:border-zinc-850 text-zinc-450 dark:text-zinc-550">
                                        <th className="py-2 px-3">{t('SKU')}</th>
                                        <th className="py-2 px-3">{t('Material')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Book Qty')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Counted Qty')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Variance')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Value Impact')}</th>
                                        <th className="py-2 px-3">{t('Remarks')}</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-150/40 dark:divide-zinc-850/30">
                                      {c.lines.map((l: any) => {
                                        let textStyle = 'text-zinc-700 dark:text-zinc-400';
                                        if (l.difference < 0) textStyle = 'text-red-500 font-semibold';
                                        else if (l.difference > 0) textStyle = 'text-emerald-500 font-semibold';

                                        return (
                                          <tr key={l.id}>
                                            <td className="py-2 px-3 font-mono font-bold text-zinc-850 dark:text-zinc-200">{l.sku}</td>
                                            <td className="py-2 px-3 text-zinc-700 dark:text-zinc-350">{l.product_name}</td>
                                            <td className="py-2 px-3 text-right font-mono">{l.system_qty}</td>
                                            <td className="py-2 px-3 text-right font-mono font-bold">{l.actual_qty}</td>
                                            <td className={`py-2 px-3 text-right font-mono ${textStyle}`}>
                                              {l.difference > 0 ? `+${l.difference}` : l.difference}
                                            </td>
                                            <td className={`py-2 px-3 text-right font-mono ${textStyle}`}>
                                              ${l.value_difference.toFixed(2)}
                                            </td>
                                            <td className="py-2 px-3 text-zinc-500 italic">{l.reason || '—'}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                                {c.notes && (
                                  <p className="text-[10px] text-zinc-500 dark:text-zinc-450 italic pl-1">
                                    <strong>{t('Notes:')}</strong> {c.notes}
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination buttons */}
          {!isLoading && totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-zinc-200/50 dark:border-zinc-800">
              <span className="text-zinc-450 font-medium">
                {t('Showing page')} <strong>{currentPage}</strong> {t('of')} <strong>{totalPages}</strong> ({countsList.length} {t('records')})
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-450 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  {t('Previous')}
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-450 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  {t('Next')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Form for Create */}
        {createModalOpen && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-850 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-up">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/60 dark:border-zinc-850">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                  {t('New Physical Stock Count Sheet')}
                </h3>
                <button onClick={() => setCreateModalOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-455 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateCount} className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* Meta Fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200/30 dark:border-zinc-850/50">
                  
                  {/* Target depot */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Audited Depot *')}</label>
                    <select
                      required
                      value={formWarehouseId}
                      onChange={(e) => {
                        setFormWarehouseId(e.target.value);
                        handlePopulateLines(e.target.value, formScope, formScopeFilter);
                      }}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none font-bold text-zinc-850 dark:text-zinc-200"
                    >
                      <option value="">{t('Select Warehouse...')}</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Audit Scope */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Audit Scope')}</label>
                    <select
                      value={formScope}
                      onChange={(e) => {
                        const nextScope = e.target.value as any;
                        setFormScope(nextScope);
                        handlePopulateLines(formWarehouseId, nextScope, '');
                        setFormScopeFilter('');
                      }}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none font-bold text-zinc-850 dark:text-zinc-200"
                    >
                      <option value="full">{t('Full Yard Audit')}</option>
                      <option value="category">{t('By Material Category')}</option>
                      <option value="zone">{t('By Bin Location Prefix')}</option>
                    </select>
                  </div>

                  {/* Scope filter input/select */}
                  {formScope === 'category' && (
                    <div className="space-y-1 animate-scale-up">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Material Category')}</label>
                      <select
                        value={formScopeFilter}
                        onChange={(e) => {
                          setFormScopeFilter(e.target.value);
                          handlePopulateLines(formWarehouseId, formScope, e.target.value);
                        }}
                        className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none font-bold text-zinc-850 dark:text-zinc-200"
                      >
                        <option value="">{t('Select Category...')}</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formScope === 'zone' && (
                    <div className="space-y-1 animate-scale-up">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Bin Location prefix')}</label>
                      <input
                        type="text"
                        placeholder="e.g. A-01"
                        value={formScopeFilter}
                        onChange={(e) => {
                          setFormScopeFilter(e.target.value);
                          handlePopulateLines(formWarehouseId, formScope, e.target.value);
                        }}
                        className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none text-zinc-855 dark:text-zinc-200 font-mono font-bold"
                      />
                    </div>
                  )}

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Audit Date')}</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none text-zinc-855 dark:text-zinc-200 font-mono"
                    />
                  </div>

                </div>

                {/* Populate line items list */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">{t('Count items spreadsheet')}</h4>
                  <div className="border border-zinc-200/60 dark:border-zinc-850 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900 font-bold border-b border-zinc-200/60 dark:border-zinc-850 text-zinc-450 dark:text-zinc-500">
                          <th className="py-2 px-3">{t('SKU')}</th>
                          <th className="py-2 px-3">{t('Material')}</th>
                          <th className="py-2 px-3 text-right font-mono">{t('System Book Qty')}</th>
                          <th className="py-2 px-3 w-[120px] font-mono">{t('Actual Qty counted *')}</th>
                          <th className="py-2 px-3 text-right font-mono">{t('Discrepancy')}</th>
                          <th className="py-2 px-3 text-right font-mono">{t('Value Impact')}</th>
                          <th className="py-2 px-3 w-[180px]">{t('Reconciliation Remarks')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-250/20 dark:divide-zinc-850/45">
                        {formLines.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-6 text-zinc-450 bg-white dark:bg-zinc-955 font-medium">
                              {t('No materials loaded. Please select warehouse and scope.')}
                            </td>
                          </tr>
                        ) : (
                          formLines.map((line: any, idx) => {
                            let textStyle = 'text-zinc-700 dark:text-zinc-400';
                            if (line.difference < 0) textStyle = 'text-red-500 font-bold';
                            else if (line.difference > 0) textStyle = 'text-emerald-500 font-bold';

                            return (
                              <tr key={idx} className="bg-white dark:bg-zinc-955">
                                <td className="py-2 px-3 font-mono font-bold text-zinc-800 dark:text-zinc-200">{line.sku}</td>
                                <td className="py-2 px-3 text-zinc-850 dark:text-zinc-350">{line.product_name}</td>
                                <td className="py-2 px-3 text-right font-mono text-zinc-450">{line.system_qty}</td>
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    required
                                    min="0"
                                    value={line.actual_qty}
                                    onChange={(e) => handleActualQtyChange(idx, Number(e.target.value))}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded px-2 py-1 outline-none font-mono"
                                  />
                                </td>
                                <td className={`py-2 px-3 text-right font-mono ${textStyle}`}>
                                  {line.difference > 0 ? `+${line.difference}` : line.difference}
                                </td>
                                <td className={`py-2 px-3 text-right font-mono ${textStyle}`}>
                                  ${line.value_difference.toFixed(2)}
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    placeholder={t('Reason for discrepancy...')}
                                    value={line.reason}
                                    onChange={(e) => handleReasonChange(idx, e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded px-2 py-1 outline-none"
                                  />
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Audit summary metrics & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
                  
                  {/* Notes input */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Audit Remarks / Notes')}</label>
                    <textarea
                      rows={3}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder={t('Enter auditing inspector names, weather conditions, external supervisor notes...')}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none resize-none text-[10px]"
                    />
                  </div>

                  {/* Summary card */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-850 rounded-lg p-4 space-y-2 text-right">
                    <div className="flex justify-between items-center text-[8.5px] font-bold text-zinc-400 uppercase tracking-wider">
                      <span>{t('Variance Volume:')}</span>
                      <span className="font-mono">{totalDiffQty > 0 ? `+${totalDiffQty}` : totalDiffQty}</span>
                    </div>
                    <div className="flex justify-between items-center text-[8.5px] font-bold text-zinc-400 uppercase tracking-wider">
                      <span>{t('Reconciled Qty:')}</span>
                      <span className="font-mono">{totalActualQty}</span>
                    </div>
                    <hr className="border-zinc-200 dark:border-zinc-800" />
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Net Valuation Impact')}</span>
                      <span className={`text-lg font-black tracking-tight font-mono mt-0.5 ${totalValDiff < 0 ? 'text-red-500' : totalValDiff > 0 ? 'text-emerald-500' : 'text-zinc-900 dark:text-zinc-50'}`}>
                        ${totalValDiff.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200/50 dark:border-zinc-850">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-zinc-650 dark:text-zinc-350 font-bold transition-colors cursor-pointer"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-95 rounded-lg font-bold transition-opacity cursor-pointer"
                  >
                    {t('Save Count Sheet')}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </PermissionGuard>
  );
}
