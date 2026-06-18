'use client';

import React, { useState, useEffect } from 'react';
import { PermissionGuard } from '@/components/permission-guard';
import { useERP } from '@/context/erp-context';
import { useWMSState } from '@/hooks/use-wms-state';
import { createClient } from '@/utils/supabase/client';
import ProductAutocomplete from '@/components/wms/product-autocomplete';
import { StockIssue, StockIssueLine, Product } from '@/types/erp';
import {
  Search, Plus, Check, Play, X, Eye, FileText, ChevronDown, ChevronUp,
  PackageMinus, Info, Calendar, ArrowRight, Barcode, AlertOctagon
} from 'lucide-react';

export default function StockOutModule() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { t } = useERP();
  const {
    warehouses,
    addIssue,
    updateProduct,
    addTransaction
  } = useWMSState();

  // Paginated List State
  const [issuesList, setIssuesList] = useState<any[]>([]);
  const [totalIssuesCount, setTotalIssuesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  // Form Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Issue Fields
  const [formType, setFormType] = useState<'sales' | 'production' | 'internal' | 'return_supplier' | 'adjustment'>('production');
  const [formWarehouseId, setFormWarehouseId] = useState('');
  const [formCustomerDept, setFormCustomerDept] = useState('');
  const [formCostMethod, setFormCostMethod] = useState<'FIFO' | 'FEFO' | 'LIFO' | 'AVG'>('FIFO');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');

  // Line items state
  const [lineItems, setLineItems] = useState<Omit<StockIssueLine, 'id' | 'issue_id'>[]>([
    { product_id: '', product_name: '', sku: '', qty_requested: 1, qty_issued: 1, unit_price: 0, amount: 0, batch_no: '' }
  ]);

  const itemsPerPage = 10;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('stock_issues')
        .select('*, warehouse:warehouses(name), customer:customers(name), lines:stock_issue_lines(*, product:products(name, sku, current_qty))', { count: 'exact' });

      if (selectedType !== 'All') {
        query = query.eq('issue_type', selectedType.toLowerCase().replace(' ', '_'));
      }

      if (searchTerm.trim()) {
        query = query.or(`issue_no.ilike.%${searchTerm.trim()}%,notes.ilike.%${searchTerm.trim()}%,department.ilike.%${searchTerm.trim()}%`);
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const mapped = (data || []).map((i: any) => ({
        id: i.id,
        company_id: i.company_id,
        issue_no: i.issue_no,
        issue_type: i.issue_type,
        warehouse_id: i.warehouse_id,
        warehouse_name: i.warehouse ? i.warehouse.name : 'Depot',
        customer_id: i.customer_id,
        customer_name: i.department || (i.customer ? i.customer.name : ''),
        date: i.date,
        status: i.status,
        cost_method: i.cost_method,
        total_amount: Number(i.total_amount) || 0,
        notes: i.notes,
        created_by: i.created_by,
        created_at: i.created_at,
        lines: (i.lines || []).map((l: any) => ({
          id: l.id,
          issue_id: l.issue_id,
          product_id: l.product_id,
          product_name: l.product ? l.product.name : 'Unknown Material',
          sku: l.product ? l.product.sku : '',
          qty_requested: Number(l.qty_requested) || 0,
          qty_issued: Number(l.qty_issued) || 0,
          unit_price: Number(l.unit_price) || 0,
          amount: Number(l.amount) || 0,
          batch_no: l.batch_no || '',
          avail_qty: l.product ? Number(l.product.current_qty) || 0 : 0
        }))
      }));

      setIssuesList(mapped);
      setTotalIssuesCount(count || 0);
    } catch (err) {
      console.error('Error fetching stock issues:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [searchTerm, selectedType, currentPage]);

  const handleProductSelect = (index: number, prod: Product | null) => {
    const updated = [...lineItems];
    if (!prod) {
      updated[index] = {
        product_id: '',
        product_name: '',
        sku: '',
        qty_requested: updated[index].qty_requested,
        qty_issued: updated[index].qty_issued,
        unit_price: 0,
        amount: 0,
        batch_no: ''
      };
    } else {
      const price = prod.sale_price || prod.cost_price || 0;
      updated[index] = {
        ...updated[index],
        product_id: prod.id,
        product_name: prod.name,
        sku: prod.sku || '',
        unit_price: price,
        amount: price * updated[index].qty_issued
      };
    }
    setLineItems(updated);
  };

  const handleQtyRequestedChange = (index: number, qty: number) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      qty_requested: qty
    };
    setLineItems(updated);
  };

  const handleQtyIssuedChange = (index: number, qty: number) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      qty_issued: qty,
      amount: updated[index].unit_price * qty
    };
    setLineItems(updated);
  };

  const handlePriceChange = (index: number, price: number) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      unit_price: price,
      amount: price * updated[index].qty_issued
    };
    setLineItems(updated);
  };

  const handleLineFieldChange = (index: number, field: string, val: string) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      [field]: val
    };
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { product_id: '', product_name: '', sku: '', qty_requested: 1, qty_issued: 1, unit_price: 0, amount: 0, batch_no: '' }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Calculate totals
  const issueTotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

  // Submit Issue Draft
  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formWarehouseId) {
      showToast(t('Please select a source warehouse.'));
      return;
    }

    const invalidLine = lineItems.find(item => !item.product_id || item.qty_issued <= 0);
    if (invalidLine) {
      showToast(t('All line items must have a selected product and qty > 0.'));
      return;
    }

    try {
      const supabase = createClient();

      // Check stock availability
      let hasStockIssue = false;
      let warningMsg = '';

      for (const item of lineItems) {
        const { data: prod } = await supabase
          .from('products')
          .select('name, sku, current_qty')
          .eq('id', item.product_id)
          .single();

        if (prod && Number(prod.current_qty) < item.qty_issued) {
          hasStockIssue = true;
          warningMsg += `[${prod.sku}] ${t('has only')} ${prod.current_qty} ${t('available')}. `;
        }
      }

      if (hasStockIssue) {
        if (!confirm(`${warningMsg}\n\n${t('Proceed with creating draft anyway?')}`)) {
          return;
        }
      }

      const { count } = await supabase
        .from('stock_issues')
        .select('*', { count: 'exact', head: true });

      const nextSeq = (count || 0) + 1;
      const issueNo = `GIN-${new Date().getFullYear()}-${String(nextSeq).padStart(4, '0')}`;

      // Insert issue using context
      const success = await addIssue({
        issue_no: issueNo,
        issue_type: formType,
        warehouse_id: formWarehouseId,
        department: formCustomerDept || undefined,
        date: formDate,
        status: 'draft',
        cost_method: formCostMethod,
        total_amount: issueTotal,
        notes: formNotes || undefined,
        lines: lineItems
      });

      if (success) {
        setCreateModalOpen(false);
        showToast(t('Goods Issue Draft Slip Created!'));
        fetchIssues();
      } else {
        showToast(t('Failed to create goods issue.'));
      }
    } catch (err) {
      console.error(err);
      showToast(t('Error creating goods issue.'));
    }
  };

  // Status Action 1: Approve (Draft -> Approved)
  const handleApprove = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('stock_issues')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
      showToast(t('Stock-Out slip approved. Ready for loading dispatcher.'));
      fetchIssues();
    } catch (e) {
      console.error(e);
      showToast(t('Failed to approve stock-out.'));
    }
  };

  // Status Action 2: Complete (Approved -> Completed)
  const handleComplete = async (id: string) => {
    const issue = issuesList.find(i => i.id === id);
    if (!issue) return;

    try {
      const supabase = createClient();

      // Verify stock availability one last time before execution
      let insufficientStock = false;
      let stockSummary = '';
      
      for (const line of issue.lines) {
        const { data: prod } = await supabase
          .from('products')
          .select('name, current_qty')
          .eq('id', line.product_id)
          .single();

        const avail = prod ? Number(prod.current_qty) || 0 : 0;
        if (avail < line.qty_issued) {
          insufficientStock = true;
          stockSummary += `\n- ${prod ? prod.name : 'Product'} (${t('Req:')} ${line.qty_issued} | ${t('Avail:')} ${avail})`;
        }
      }

      if (insufficientStock) {
        alert(`${t('Cannot complete. Insufficient stock for:')}${stockSummary}`);
        return;
      }

      // 1. Update Product Quantities & write transactions
      for (const line of issue.lines) {
        const { data: prodData } = await supabase
          .from('products')
          .select('current_qty, cost_price')
          .eq('id', line.product_id)
          .single();

        const prevQty = prodData ? Number(prodData.current_qty) || 0 : 0;
        const costPrice = prodData ? Number(prodData.cost_price) || 0 : 0;
        const postQty = prevQty - line.qty_issued;

        // Update product current_qty
        const success = await updateProduct(line.product_id, { current_qty: postQty });
        if (!success) throw new Error(`Failed to update quantity for product: ${line.product_id}`);

        // Create transaction log entry
        const txnSuccess = await addTransaction({
          company_id: issue.company_id,
          product_id: line.product_id,
          action: 'stock_out',
          reference_no: issue.issue_no,
          warehouse_id: issue.warehouse_id,
          qty_before: prevQty,
          qty_change: -line.qty_issued,
          qty_after: postQty,
          value_change: -line.qty_issued * costPrice,
          notes: issue.notes || `Stock issue completion`
        });
        if (!txnSuccess) throw new Error(`Failed to create transaction log for product: ${line.product_id}`);

        // Deduct from Batch/Lots if matched batch
        if (line.batch_no) {
          const { data: batchData } = await supabase
            .from('batch_lots')
            .select('id, qty')
            .eq('batch_no', line.batch_no)
            .eq('product_id', line.product_id)
            .limit(1)
            .maybeSingle();

          if (batchData) {
            const batchPrev = Number(batchData.qty) || 0;
            const batchPost = Math.max(batchPrev - line.qty_issued, 0);
            await supabase
              .from('batch_lots')
              .update({
                qty: batchPost,
                status: batchPost === 0 ? 'consumed' : 'available'
              })
              .eq('id', batchData.id);
          }
        }
      }

      // 2. Update status
      const { error: rErr } = await supabase
        .from('stock_issues')
        .update({ status: 'completed' })
        .eq('id', id);

      if (rErr) throw rErr;

      showToast(t('Stock-Out Slip Completed! Inventory balances deducted.'));
      fetchIssues();
    } catch (e) {
      console.error('Error completing stock issue:', e);
      showToast(t('Error completing stock issue.'));
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('stock_issues')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      showToast(t('Issue slip cancelled.'));
      fetchIssues();
    } catch (e) {
      console.error(e);
      showToast(t('Failed to cancel issue slip.'));
    }
  };

  const totalPages = Math.ceil(totalIssuesCount / itemsPerPage);

  if (!mounted) return null;

  return (
    <PermissionGuard module="inventory">
      <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto min-h-screen text-xs select-none">
        
        {/* Toast alerts */}
        {toastMsg && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-955 rounded-lg shadow-xl font-bold border border-zinc-800 dark:border-zinc-200 animate-slide-up flex items-center gap-2">
            <Info className="h-4 w-4 text-emerald-500" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Title and Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              {t('Goods Issue Notes (Stock-Out)')}
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-450 mt-1">
              {t('Manage material issues for projects, sales orders, internal consumption, and supplier returns.')}
            </p>
          </div>

          <div>
            <button 
              onClick={() => {
                setLineItems([{ product_id: '', product_name: '', sku: '', qty_requested: 1, qty_issued: 1, unit_price: 0, amount: 0, batch_no: '' }]);
                setFormCustomerDept('');
                setFormNotes('');
                setFormWarehouseId(warehouses[0]?.id || '');
                setCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 rounded-lg font-bold transition-opacity"
            >
              <Plus className="h-4 w-4" />
              {t('Create Stock-Out Slip')}
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-850">
          
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {['All', 'Sales', 'Production', 'Internal', 'Return Supplier', 'Adjustment'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors uppercase tracking-wider text-[9px] ${selectedType === type ? 'bg-zinc-955 text-white dark:bg-white dark:text-zinc-950' : 'bg-transparent text-zinc-500 hover:bg-zinc-200/40 dark:hover:bg-zinc-800'}`}
              >
                {t(type)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder={t('Search by issue code, recipient...')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-md pl-8 pr-3 py-1.5 outline-none text-zinc-850 dark:text-zinc-200"
            />
          </div>

        </div>

        {/* Issues Table */}
        <div className="saas-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-450 dark:text-zinc-550 border-b border-zinc-250/20 dark:border-zinc-800/50 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-6"></th>
                  <th className="py-3 px-3">{t('Issue No')}</th>
                  <th className="py-3 px-3">{t('Type')}</th>
                  <th className="py-3 px-3">{t('Source Depot')}</th>
                  <th className="py-3 px-3">{t('Recipient / Dept')}</th>
                  <th className="py-3 px-3 font-mono">{t('Date')}</th>
                  <th className="py-3 px-3 text-right font-mono">{t('Total Cost')}</th>
                  <th className="py-3 px-3 text-center">{t('Status')}</th>
                  <th className="py-3 px-4 text-right">{t('Workflow Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-850/40">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-zinc-450 bg-zinc-50/10 dark:bg-zinc-900/5 font-bold">
                      {t('Loading...')}
                    </td>
                  </tr>
                ) : issuesList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-zinc-450 bg-zinc-50/10 dark:bg-zinc-900/5">
                      {t('No issues found.')}
                    </td>
                  </tr>
                ) : (
                  issuesList.map((i) => {
                    const isExpanded = expandedIssue === i.id;

                    // Color code status badge
                    let statusColor = 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-450';
                    if (i.status === 'approved') statusColor = 'bg-blue-50 text-blue-600 dark:bg-blue-950/25 dark:text-blue-400';
                    else if (i.status === 'completed') statusColor = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/25 dark:text-emerald-400';
                    else if (i.status === 'cancelled') statusColor = 'bg-rose-50 text-rose-600 dark:bg-rose-950/25 dark:text-rose-450';

                    return (
                      <React.Fragment key={i.id}>
                        <tr 
                          onClick={() => setExpandedIssue(isExpanded ? null : i.id)}
                          className={`hover:bg-zinc-50/30 dark:hover:bg-zinc-900/15 transition-colors cursor-pointer ${isExpanded ? 'bg-zinc-50/20 dark:bg-zinc-900/5' : ''}`}
                        >
                          <td className="py-3.5 px-4">
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-zinc-800 dark:text-zinc-100">{i.issue_no}</td>
                          <td className="py-3.5 px-3">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400">
                              {i.issue_type}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-bold text-zinc-800 dark:text-zinc-250">{i.warehouse_name}</td>
                          <td className="py-3.5 px-3 text-zinc-650 dark:text-zinc-400">{i.customer_name || '—'}</td>
                          <td className="py-3.5 px-3 font-mono text-zinc-500">{i.date}</td>
                          <td className="py-3.5 px-3 text-right font-mono font-bold text-zinc-800 dark:text-zinc-150">${i.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="py-3.5 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${statusColor}`}>
                              {i.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {i.status === 'draft' && (
                                <button
                                  onClick={() => handleApprove(i.id)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/40 dark:border-blue-800/40 rounded font-bold"
                                >
                                  <Check className="h-3 w-3" />
                                  {t('Approve')}
                                </button>
                              )}
                              {i.status === 'approved' && (
                                <button
                                  onClick={() => handleComplete(i.id)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-450 border border-emerald-200/40 dark:border-emerald-800/40 rounded font-bold"
                                >
                                  <PackageMinus className="h-3 w-3" />
                                  {t('Complete')}
                                </button>
                              )}
                              {(i.status === 'draft' || i.status === 'approved') && (
                                <button
                                  onClick={() => handleCancel(i.id)}
                                  className="p-1 hover:bg-red-50 dark:hover:bg-red-955/20 text-red-500 rounded"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded details */}
                        {isExpanded && (
                          <tr className="bg-zinc-50/20 dark:bg-zinc-900/5">
                            <td colSpan={9} className="py-4 px-8 border-t border-b border-zinc-200/50 dark:border-zinc-850/50">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{t('Stock-Out Line Details')}</h4>
                                  <span className="font-mono text-[9px] text-zinc-400">Valuation: {i.cost_method}</span>
                                </div>
                                <div className="border border-zinc-200/40 dark:border-zinc-850 rounded-lg overflow-hidden">
                                  <table className="w-full text-left text-[10px] border-collapse bg-white dark:bg-zinc-955">
                                    <thead>
                                      <tr className="bg-zinc-50 dark:bg-zinc-900 font-bold border-b border-zinc-200/40 dark:border-zinc-850 text-zinc-450 dark:text-zinc-550">
                                        <th className="py-2 px-3">{t('SKU')}</th>
                                        <th className="py-2 px-3">{t('Material')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Qty Requested')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Qty Issued')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Unit Cost')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Total Cost')}</th>
                                        <th className="py-2 px-3 font-mono">{t('Matched Batch')}</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-150/40 dark:divide-zinc-850/30">
                                      {i.lines.map((l: any) => (
                                        <tr key={l.id}>
                                          <td className="py-2 px-3 font-mono font-bold text-zinc-850 dark:text-zinc-200">{l.sku}</td>
                                          <td className="py-2 px-3 text-zinc-700 dark:text-zinc-350">{l.product_name}</td>
                                          <td className="py-2 px-3 text-right font-mono">{l.qty_requested}</td>
                                          <td className="py-2 px-3 text-right font-mono font-bold">{l.qty_issued}</td>
                                          <td className="py-2 px-3 text-right font-mono">${l.unit_price.toFixed(2)}</td>
                                          <td className="py-2 px-3 text-right font-mono font-bold text-zinc-850 dark:text-zinc-150">${l.amount.toFixed(2)}</td>
                                          <td className="py-2 px-3 font-mono text-zinc-450">{l.batch_no || 'Auto (FIFO)'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                {i.notes && (
                                  <p className="text-[10px] text-zinc-500 dark:text-zinc-450 italic pl-1">
                                    <strong>{t('Notes:')}</strong> {i.notes}
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
                {t('Showing page')} <strong>{currentPage}</strong> {t('of')} <strong>{totalPages}</strong> ({issuesList.length} {t('issues')})
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
                  {t('New Goods Issue Note (Draft)')}
                </h3>
                <button onClick={() => setCreateModalOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-450 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateIssue} className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* Meta details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200/30 dark:border-zinc-855/50">
                  
                  {/* Issue type */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Issue Purpose')}</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none font-bold text-zinc-850 dark:text-zinc-205"
                    >
                      <option value="production">{t('Project Dispatch')}</option>
                      <option value="sales">{t('Customer Sales')}</option>
                      <option value="internal">{t('Internal Expense')}</option>
                      <option value="return_supplier">{t('Supplier Return')}</option>
                      <option value="adjustment">{t('Inventory Adjustment')}</option>
                    </select>
                  </div>

                  {/* Target warehouse */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Source Depot *')}</label>
                    <select
                      required
                      value={formWarehouseId}
                      onChange={(e) => setFormWarehouseId(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none font-bold text-zinc-855 dark:text-zinc-200"
                    >
                      <option value="">{t('Select Warehouse...')}</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Customer / Dept */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Recipient / Customer / Dept')}</label>
                    <input
                      type="text"
                      placeholder="e.g. Brooklyn Bridge Rehab"
                      value={formCustomerDept}
                      onChange={(e) => setFormCustomerDept(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none text-zinc-855 dark:text-zinc-200"
                    />
                  </div>

                  {/* Cost method */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Cost Valuation Method')}</label>
                    <select
                      value={formCostMethod}
                      onChange={(e) => setFormCostMethod(e.target.value as any)}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none text-zinc-850 dark:text-zinc-200 font-mono font-bold"
                    >
                      <option value="FIFO">FIFO (First In First Out)</option>
                      <option value="LIFO">LIFO (Last In First Out)</option>
                      <option value="AVG">AVG (Average Cost)</option>
                      <option value="FEFO">FEFO (First Expired First Out)</option>
                    </select>
                  </div>

                  {/* Date picker */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Issue Date')}</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none text-zinc-855 dark:text-zinc-200 font-mono"
                    />
                  </div>

                </div>

                {/* Line Items section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">{t('Stock-Out Line Items')}</h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addLineItem}
                        className="px-2.5 py-1 text-[9px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded font-bold border border-zinc-200/50 dark:border-zinc-850 cursor-pointer"
                      >
                        + {t('Add Material')}
                      </button>
                    </div>
                  </div>

                  <div className="border border-zinc-200/60 dark:border-zinc-855 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900 font-bold border-b border-zinc-200/60 dark:border-zinc-850 text-zinc-450 dark:text-zinc-500">
                          <th className="py-2.5 px-3 w-[280px]">{t('Select Material SKU')}</th>
                          <th className="py-2.5 px-3 w-[80px] font-mono">{t('Qty Req')}</th>
                          <th className="py-2.5 px-3 w-[80px] font-mono">{t('Qty Issue')}</th>
                          <th className="py-2.5 px-3 w-[100px] font-mono">{t('Unit Price ($)')}</th>
                          <th className="py-2.5 px-3 w-[100px] font-mono text-right">{t('Amount ($)')}</th>
                          <th className="py-2.5 px-3 w-[110px] font-mono">{t('Batch Lot (Opt)')}</th>
                          <th className="py-2.5 px-3 w-[40px]"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-250/20 dark:divide-zinc-850/45">
                        {lineItems.map((item, idx) => (
                          <tr key={idx} className="bg-white dark:bg-zinc-955">
                            <td className="py-2.5 px-3 align-middle">
                              <ProductAutocomplete
                                warehouseId={formWarehouseId || undefined}
                                onSelect={(prod) => handleProductSelect(idx, prod)}
                                excludeIds={lineItems.map(l => l.product_id).filter(id => id !== item.product_id)}
                                placeholder={t('Search material by name, SKU...')}
                                initialProductId={item.product_id || undefined}
                              />
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <input
                                type="number"
                                required
                                min="1"
                                value={item.qty_requested}
                                onChange={(e) => handleQtyRequestedChange(idx, Number(e.target.value))}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded px-2 py-1 outline-none font-mono text-[10px]"
                              />
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <input
                                type="number"
                                required
                                min="1"
                                value={item.qty_issued}
                                onChange={(e) => handleQtyIssuedChange(idx, Number(e.target.value))}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded px-2 py-1 outline-none font-mono text-[10px]"
                              />
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded px-2 py-1 outline-none font-mono text-[10px]"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-800 dark:text-zinc-100 align-middle">
                              ${item.amount.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 align-middle">
                              <input
                                type="text"
                                placeholder="LOT-XXX"
                                value={item.batch_no}
                                onChange={(e) => handleLineFieldChange(idx, 'batch_no', e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded px-2 py-1 outline-none font-mono text-[10px]"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center align-middle">
                              <button
                                type="button"
                                disabled={lineItems.length === 1}
                                onClick={() => removeLineItem(idx)}
                                className="text-red-500 disabled:opacity-30 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 rounded cursor-pointer"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Remarks / Notes')}</label>
                    <textarea
                      rows={2}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder={t('Enter release notes, references, etc...')}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none resize-none text-[10px]"
                    />
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-850 rounded-lg p-4 flex flex-col justify-center items-end">
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Cumulative Total Cost')}</span>
                    <span className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-mono mt-1">
                      ${issueTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
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
                    className="px-4 py-2 bg-zinc-955 dark:bg-white text-white dark:text-zinc-950 hover:opacity-95 rounded-lg font-bold transition-opacity cursor-pointer"
                  >
                    {t('Save Issue Draft')}
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
