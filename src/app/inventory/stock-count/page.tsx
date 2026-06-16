'use client';

import React, { useState } from 'react';
import { PermissionGuard } from '@/components/permission-guard';
import { useERP } from '@/context/erp-context';
import { useWMSState } from '@/hooks/use-wms-state';
import { StockCount, StockCountLine, Product } from '@/types/erp';
import { MATERIAL_CATEGORIES } from '@/data/wms-seed';
import {
  Search, Plus, Check, Play, X, ChevronDown, ChevronUp,
  Info, Calendar, ClipboardCheck, Barcode, AlertTriangle, Hammer
} from 'lucide-react';

export default function StockCounts() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { t } = useERP();
  const {
    products, saveProducts,
    warehouses,
    counts, saveCounts,
    transactions, saveTransactions
  } = useWMSState();

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

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Populate count lines automatically when warehouse/scope changes
  const handlePopulateLines = (warehouseId: string, scope: 'full' | 'zone' | 'category', scopeFilter: string) => {
    if (!warehouseId) {
      setFormLines([]);
      return;
    }

    // Filter products in that warehouse
    let filtered = products.filter(p => p.warehouse_id === warehouseId);

    if (scope === 'category' && scopeFilter) {
      filtered = filtered.filter(p => p.category_name === scopeFilter);
    } else if (scope === 'zone' && scopeFilter) {
      filtered = filtered.filter(p => p.location && p.location.startsWith(scopeFilter));
    }

    const lines = filtered.map(p => ({
      product_id: p.id,
      product_name: p.name,
      sku: p.sku,
      system_qty: p.current_qty,
      actual_qty: p.current_qty, // defaults to match, user edits differences
      difference: 0,
      value_difference: 0,
      reason: ''
    }));

    setFormLines(lines);
  };

  const handleActualQtyChange = (index: number, actual: number) => {
    const lines = [...formLines];
    const system = lines[index].system_qty;
    const diff = actual - system;
    
    // find cost price
    const prod = products.find(p => p.id === lines[index].product_id);
    const cost = prod ? prod.cost_price : 0;

    lines[index] = {
      ...lines[index],
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

  const handleCreateCount = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formWarehouseId) {
      showToast(t('Warehouse selection is required.'));
      return;
    }

    if (formLines.length === 0) {
      showToast(t('No products found matching the criteria in this warehouse.'));
      return;
    }

    const wh = warehouses.find(w => w.id === formWarehouseId);

    const newCount: StockCount = {
      id: `sc-${Date.now()}`,
      company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1',
      count_no: `CNT-${new Date().getFullYear()}-${String(counts.length + 1).padStart(4, '0')}`,
      warehouse_id: formWarehouseId,
      warehouse_name: wh ? wh.name : 'Depot',
      scope: formScope,
      scope_filter: formScopeFilter || undefined,
      date: formDate,
      status: 'draft',
      notes: formNotes || undefined,
      lines: formLines.map((line, idx) => ({
        ...line,
        id: `scl-${Date.now()}-${idx}`,
        count_id: `sc-${Date.now()}`
      })),
      created_by: 'u5',
      created_at: new Date().toISOString()
    };

    saveCounts([newCount, ...counts]);
    setCreateModalOpen(false);
    showToast(t('Inventory audit sheet created successfully (Draft).'));
  };

  // Workflow Action 1: Approve (Draft -> Approved)
  const handleApprove = (id: string) => {
    const updated = counts.map(c => {
      if (c.id === id) return { ...c, status: 'approved' as const };
      return c;
    });
    saveCounts(updated);
    showToast(t('Audit sheet approved. Adjustments ready to be applied.'));
  };

  // Workflow Action 2: Apply Adjustments (Approved -> Completed)
  // CRITICAL: Actually overrides product inventory values and logs audit trials!
  const handleApplyAdjustments = (id: string) => {
    const count = counts.find(c => c.id === id);
    if (!count) return;

    const updatedProducts = [...products];
    const newTxns = [...transactions];

    count.lines.forEach(line => {
      const prodIdx = updatedProducts.findIndex(p => p.id === line.product_id);
      if (prodIdx !== -1 && line.difference !== 0) {
        const prevQty = updatedProducts[prodIdx].current_qty;
        const postQty = line.actual_qty;

        // update stock qty
        updatedProducts[prodIdx] = {
          ...updatedProducts[prodIdx],
          current_qty: postQty
        };

        // write transaction log
        newTxns.unshift({
          id: `tx-cnt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          company_id: count.company_id,
          product_id: line.product_id,
          product_name: line.product_name,
          sku: line.sku,
          action: 'count',
          reference_no: count.count_no,
          warehouse_id: count.warehouse_id,
          warehouse_name: count.warehouse_name,
          qty_before: prevQty,
          qty_change: line.difference,
          qty_after: postQty,
          value_change: line.value_difference,
          performed_by: 'u5',
          performer_name: 'Charlie Stock',
          notes: line.reason || `Inventory count reconciliation`,
          created_at: new Date().toISOString()
        });
      }
    });

    saveProducts(updatedProducts);
    saveTransactions(newTxns);

    const updatedCounts = counts.map(c => {
      if (c.id === id) return { ...c, status: 'completed' as const };
      return c;
    });
    saveCounts(updatedCounts);
    showToast(t('Adjustments applied. Inventory balances re-aligned.'));
  };

  // Sum line calculations
  const totalSystemQty = formLines.reduce((sum, l) => sum + l.system_qty, 0);
  const totalActualQty = formLines.reduce((sum, l) => sum + l.actual_qty, 0);
  const totalDiffQty = formLines.reduce((sum, l) => sum + l.difference, 0);
  const totalValDiff = formLines.reduce((sum, l) => sum + l.value_difference, 0);

  // Filter
  const filteredCounts = counts.filter(c => {
    const matchesSearch = c.count_no.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (!mounted) return null;

  return (
    <PermissionGuard module="inventory">
      <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto min-h-screen text-xs select-none">
        
        {/* Toast alerts */}
        {toastMsg && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-zinc-955 dark:bg-white text-white dark:text-zinc-950 rounded-lg shadow-xl font-bold border border-zinc-800 dark:border-zinc-200 animate-slide-up flex items-center gap-2">
            <Info className="h-4 w-4 text-emerald-500" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              {t('Inventory Audit Counts & Reconciliation')}
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-455 mt-1">
              {t('Perform cycle stock counts, register material shrinkage, and apply ledger book reconciliations.')}
            </p>
          </div>

          <div>
            <button 
              onClick={() => {
                setFormLines([]);
                setFormNotes('');
                setFormWarehouseId(warehouses[0]?.id || '');
                setFormScope('full');
                setFormScopeFilter('');
                handlePopulateLines(warehouses[0]?.id || '', 'full', '');
                setCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 rounded-lg font-bold transition-opacity"
            >
              <Plus className="h-4 w-4" />
              {t('New Stock Count Sheet')}
            </button>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-850">
          <div className="text-[10px] font-bold text-zinc-550">
            {counts.length} {t('Sheets registered')}
          </div>

          {/* Search */}
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder={t('Search by count sheet no...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-md pl-8 pr-3 py-1.5 outline-none text-zinc-855 dark:text-zinc-200"
            />
          </div>
        </div>

        {/* Audit Sheets List */}
        <div className="saas-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-450 dark:text-zinc-550 border-b border-zinc-250/20 dark:border-zinc-800/50 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-6"></th>
                  <th className="py-3 px-3">{t('Count No')}</th>
                  <th className="py-3 px-3">{t('Audited Depot')}</th>
                  <th className="py-3 px-3">{t('Scope')}</th>
                  <th className="py-3 px-3 font-mono">{t('Audit Date')}</th>
                  <th className="py-3 px-3 text-right font-mono">{t('Reconciliation Val')}</th>
                  <th className="py-3 px-3 text-center">{t('Status')}</th>
                  <th className="py-3 px-4 text-right">{t('Workflow Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-850/40">
                {filteredCounts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-zinc-450 bg-zinc-50/10 dark:bg-zinc-900/5">
                      {t('No stock counts found.')}
                    </td>
                  </tr>
                ) : (
                  filteredCounts.map((sheet) => {
                    const isExpanded = expandedCountId === sheet.id;

                    // Calculate net value difference
                    const netValDiff = sheet.lines.reduce((sum, l) => sum + l.value_difference, 0);

                    // Status style
                    let statusColor = 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-450';
                    if (sheet.status === 'approved') statusColor = 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400';
                    else if (sheet.status === 'completed') statusColor = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';

                    return (
                      <React.Fragment key={sheet.id}>
                        <tr 
                          onClick={() => setExpandedCountId(isExpanded ? null : sheet.id)}
                          className={`hover:bg-zinc-50/30 dark:hover:bg-zinc-900/15 transition-colors cursor-pointer ${isExpanded ? 'bg-zinc-50/20 dark:bg-zinc-900/5' : ''}`}
                        >
                          <td className="py-3.5 px-4">
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-zinc-850 dark:text-zinc-50">{sheet.count_no}</td>
                          <td className="py-3.5 px-3 font-bold text-zinc-805 dark:text-zinc-200">{sheet.warehouse_name}</td>
                          <td className="py-3.5 px-3 uppercase tracking-wider text-[8.5px] font-bold">
                            <span className="inline-block bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded">
                              {sheet.scope} {sheet.scope_filter ? `(${sheet.scope_filter})` : ''}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-zinc-500">{sheet.date}</td>
                          <td className={`py-3.5 px-3 text-right font-mono font-bold ${netValDiff < 0 ? 'text-red-500' : netValDiff > 0 ? 'text-emerald-500' : 'text-zinc-600 dark:text-zinc-400'}`}>
                            {netValDiff > 0 ? `+$${netValDiff.toLocaleString()}` : netValDiff < 0 ? `-$${Math.abs(netValDiff).toLocaleString()}` : '$0.00'}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${statusColor}`}>
                              {sheet.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {sheet.status === 'draft' && (
                                <button
                                  onClick={() => handleApprove(sheet.id)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/40 dark:border-blue-800/40 rounded font-bold"
                                >
                                  <Check className="h-3 w-3" />
                                  {t('Approve')}
                                </button>
                              )}
                              {sheet.status === 'approved' && (
                                <button
                                  onClick={() => handleApplyAdjustments(sheet.id)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-450 border border-emerald-200/40 dark:border-emerald-800/40 rounded font-bold"
                                >
                                  <Hammer className="h-3 w-3" />
                                  {t('Apply Reconciliation')}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Detail line lists */}
                        {isExpanded && (
                          <tr className="bg-zinc-50/20 dark:bg-zinc-900/5">
                            <td colSpan={8} className="py-4 px-8 border-t border-b border-zinc-200/50 dark:border-zinc-850/50">
                              <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{t('Audited Line Items')}</h4>
                                <div className="border border-zinc-200/40 dark:border-zinc-850 rounded-lg overflow-hidden">
                                  <table className="w-full text-left text-[10px] border-collapse bg-white dark:bg-zinc-955">
                                    <thead>
                                      <tr className="bg-zinc-50 dark:bg-zinc-900 font-bold border-b border-zinc-200/40 dark:border-zinc-850 text-zinc-450 dark:text-zinc-500">
                                        <th className="py-2 px-3">{t('SKU')}</th>
                                        <th className="py-2 px-3">{t('Material')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('System Qty')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Actual Counted')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Discrepancy')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Value Impact')}</th>
                                        <th className="py-2 px-3">{t('Discrepancy Reason')}</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-150/40 dark:divide-zinc-850/30">
                                      {sheet.lines.map((l) => {
                                        let rowBg = 'bg-white dark:bg-zinc-955';
                                        let textStyle = 'text-zinc-800 dark:text-zinc-350 font-bold';
                                        if (l.difference < 0) {
                                          rowBg = 'bg-red-50/10 dark:bg-red-950/5';
                                          textStyle = 'text-red-500 font-bold';
                                        } else if (l.difference > 0) {
                                          rowBg = 'bg-emerald-50/10 dark:bg-emerald-950/5';
                                          textStyle = 'text-emerald-500 font-bold';
                                        }

                                        return (
                                          <tr key={l.id} className={rowBg}>
                                            <td className="py-2 px-3 font-mono font-bold text-zinc-800 dark:text-zinc-200">{l.sku}</td>
                                            <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">{l.product_name}</td>
                                            <td className="py-2 px-3 text-right font-mono text-zinc-450">{l.system_qty}</td>
                                            <td className="py-2 px-3 text-right font-mono font-bold text-zinc-800 dark:text-zinc-200">{l.actual_qty}</td>
                                            <td className={`py-2 px-3 text-right font-mono ${textStyle}`}>
                                              {l.difference > 0 ? `+${l.difference}` : l.difference}
                                            </td>
                                            <td className={`py-2 px-3 text-right font-mono font-bold ${textStyle}`}>
                                              {l.value_difference > 0 ? `+$${l.value_difference.toFixed(2)}` : l.value_difference < 0 ? `-$${Math.abs(l.value_difference).toFixed(2)}` : '$0.00'}
                                            </td>
                                            <td className="py-2 px-3 text-zinc-550 italic">{l.reason || '—'}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                                {sheet.notes && (
                                  <p className="text-[10px] text-zinc-500 dark:text-zinc-450 italic pl-1">
                                    <strong>{t('Notes:')}</strong> {sheet.notes}
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
        </div>

        {/* Modal Form for Create */}
        {createModalOpen && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-850 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-up">
              
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/60 dark:border-zinc-850">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                  {t('New Audit stock Count Sheet')}
                </h3>
                <button onClick={() => setCreateModalOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-450">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateCount} className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* Meta details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200/30 dark:border-zinc-855/50">
                  
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
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none font-bold text-zinc-855 dark:text-zinc-200"
                    >
                      <option value="">{t('Select Warehouse...')}</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Audit scope */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Count Scope')}</label>
                    <select
                      value={formScope}
                      onChange={(e) => {
                        const nextScope = e.target.value as any;
                        setFormScope(nextScope);
                        setFormScopeFilter('');
                        handlePopulateLines(formWarehouseId, nextScope, '');
                      }}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none font-bold text-zinc-850 dark:text-zinc-200"
                    >
                      <option value="full">{t('Full Warehouse')}</option>
                      <option value="category">{t('By Category')}</option>
                      <option value="zone">{t('By Location Bin Zone')}</option>
                    </select>
                  </div>

                  {/* Scope filter input/select */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Scope Filter Value')}</label>
                    {formScope === 'category' ? (
                      <select
                        value={formScopeFilter}
                        onChange={(e) => {
                          setFormScopeFilter(e.target.value);
                          handlePopulateLines(formWarehouseId, formScope, e.target.value);
                        }}
                        className="w-full bg-white dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none font-bold text-zinc-850 dark:text-zinc-200"
                      >
                        <option value="">{t('Select Category...')}</option>
                        {MATERIAL_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={formScope === 'zone' ? 'e.g. A-01' : 'No filter'}
                        disabled={formScope === 'full'}
                        value={formScopeFilter}
                        onChange={(e) => {
                          setFormScopeFilter(e.target.value);
                          handlePopulateLines(formWarehouseId, formScope, e.target.value);
                        }}
                        className="w-full bg-white dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none text-zinc-850 dark:text-zinc-200"
                      />
                    )}
                  </div>

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
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">{t('Count items spreadsheet')}</h4>
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
                          formLines.map((line, idx) => {
                            let textStyle = 'text-zinc-700 dark:text-zinc-400';
                            if (line.difference < 0) textStyle = 'text-red-500 font-bold';
                            else if (line.difference > 0) textStyle = 'text-emerald-500 font-bold';

                            return (
                              <tr key={idx} className="bg-white dark:bg-zinc-955">
                                <td className="py-2 px-3 font-mono font-bold text-zinc-800 dark:text-zinc-200">{line.sku}</td>
                                <td className="py-2 px-3 text-zinc-800 dark:text-zinc-350">{line.product_name}</td>
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

                {/* Audit sheet notes & totals */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Remarks / Notes')}</label>
                    <textarea
                      rows={2}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder={t('Enter auditing terms, weather details, inspection standard reference number...')}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none resize-none"
                    />
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-850 rounded-lg p-4 font-mono text-[10px] space-y-2 flex flex-col justify-center">
                    <div className="flex justify-between">
                      <span className="text-zinc-400 dark:text-zinc-500">{t('Total System:')}</span>
                      <span className="font-bold text-zinc-855 dark:text-zinc-200">{totalSystemQty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 dark:text-zinc-500">{t('Total Actual:')}</span>
                      <span className="font-bold text-zinc-855 dark:text-zinc-200">{totalActualQty}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-1.5 font-bold">
                      <span className="text-zinc-450 dark:text-zinc-400">{t('Net Qty Impact:')}</span>
                      <span className={totalDiffQty < 0 ? 'text-red-500' : 'text-emerald-500'}>{totalDiffQty > 0 ? `+${totalDiffQty}` : totalDiffQty}</span>
                    </div>
                    <div className="flex justify-between font-black">
                      <span className="text-zinc-450 dark:text-zinc-400">{t('Net Value Impact:')}</span>
                      <span className={totalValDiff < 0 ? 'text-red-500 font-extrabold' : 'text-emerald-500 font-extrabold'}>
                        {totalValDiff > 0 ? `+$${totalValDiff.toLocaleString()}` : totalValDiff < 0 ? `-$${Math.abs(totalValDiff).toLocaleString()}` : '$0.00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200/50 dark:border-zinc-850">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-zinc-650 dark:text-zinc-350 font-bold transition-colors"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-95 rounded-lg font-bold transition-opacity"
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
