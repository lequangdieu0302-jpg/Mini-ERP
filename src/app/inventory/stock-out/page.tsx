'use client';

import React, { useState } from 'react';
import { PermissionGuard } from '@/components/permission-guard';
import { useERP } from '@/context/erp-context';
import { useWMSState } from '@/hooks/use-wms-state';
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
    products, saveProducts,
    warehouses,
    issues, saveIssues,
    transactions, saveTransactions,
    batches, saveBatches
  } = useWMSState();

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

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Helper: auto-fill product data
  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      product_id: prod.id,
      product_name: prod.name,
      sku: prod.sku,
      unit_price: prod.sale_price || prod.cost_price, // sell price if sold, else cost
      amount: (prod.sale_price || prod.cost_price) * updated[index].qty_issued
    };
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
  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formWarehouseId) {
      showToast(t('Please select a source warehouse.'));
      return;
    }

    // Validate lines and check inventory availability
    let hasStockIssue = false;
    let warningMsg = '';

    const invalidLine = lineItems.find(item => !item.product_id || item.qty_issued <= 0);
    if (invalidLine) {
      showToast(t('All line items must have a selected product and qty > 0.'));
      return;
    }

    lineItems.forEach(item => {
      const prod = products.find(p => p.id === item.product_id);
      if (prod && prod.current_qty < item.qty_issued) {
        hasStockIssue = true;
        warningMsg += `[${prod.sku}] ${t('has only')} ${prod.current_qty} ${prod.uom} ${t('available')}. `;
      }
    });

    if (hasStockIssue) {
      if (!confirm(`${warningMsg}\n\n${t('Proceed with creating draft anyway?')}`)) {
        return;
      }
    }

    const wh = warehouses.find(w => w.id === formWarehouseId);

    const newIssue: StockIssue = {
      id: `si-${Date.now()}`,
      company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1',
      issue_no: `GIN-${new Date().getFullYear()}-${String(issues.length + 1).padStart(4, '0')}`,
      issue_type: formType,
      warehouse_id: formWarehouseId,
      warehouse_name: wh ? wh.name : 'Depot',
      customer_name: formCustomerDept || undefined,
      date: formDate,
      status: 'draft',
      cost_method: formCostMethod,
      total_amount: issueTotal,
      notes: formNotes || undefined,
      lines: lineItems.map((item, idx) => ({
        ...item,
        id: `sil-${Date.now()}-${idx}`,
        issue_id: `si-${Date.now()}`
      })),
      created_by: 'u5',
      created_at: new Date().toISOString()
    };

    saveIssues([newIssue, ...issues]);
    setCreateModalOpen(false);
    showToast(t('Goods Issue Draft Slip Created!'));
  };

  // Status Action 1: Approve (Draft -> Approved)
  const handleApprove = (id: string) => {
    const updated = issues.map(i => {
      if (i.id === id) return { ...i, status: 'approved' as const };
      return i;
    });
    saveIssues(updated);
    showToast(t('Stock-Out slip approved. Ready for loading dispatcher.'));
  };

  // Status Action 2: Complete (Approved -> Completed)
  // CRITICAL: Deducts inventory, logs audit trails, updates batch statuses!
  const handleComplete = (id: string) => {
    const issue = issues.find(i => i.id === id);
    if (!issue) return;

    // Verify stock availability one last time before execution
    let insufficientStock = false;
    let stockSummary = '';
    issue.lines.forEach(line => {
      const prod = products.find(p => p.id === line.product_id);
      if (prod && prod.current_qty < line.qty_issued) {
        insufficientStock = true;
        stockSummary += `\n- ${prod.name} (${t('Req:')} ${line.qty_issued} | ${t('Avail:')} ${prod.current_qty})`;
      }
    });

    if (insufficientStock) {
      alert(`${t('Cannot complete. Insufficient stock for:')}${stockSummary}`);
      return;
    }

    // 1. Update Product Quantities & write transactions
    const updatedProducts = [...products];
    const newTxns = [...transactions];
    const newBatches = [...batches];

    issue.lines.forEach(line => {
      const prodIdx = updatedProducts.findIndex(p => p.id === line.product_id);
      if (prodIdx !== -1) {
        const prevQty = updatedProducts[prodIdx].current_qty;
        const subQty = line.qty_issued;
        const postQty = prevQty - subQty;

        // Set new qty
        updatedProducts[prodIdx] = {
          ...updatedProducts[prodIdx],
          current_qty: postQty
        };

        // Create transaction log entry
        newTxns.unshift({
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          company_id: issue.company_id,
          product_id: line.product_id,
          product_name: line.product_name,
          sku: line.sku,
          action: 'stock_out',
          reference_no: issue.issue_no,
          warehouse_id: issue.warehouse_id,
          warehouse_name: issue.warehouse_name,
          qty_before: prevQty,
          qty_change: -subQty,
          qty_after: postQty,
          value_change: -subQty * (updatedProducts[prodIdx].cost_price || 0),
          performed_by: 'u5',
          performer_name: 'Charlie Stock',
          notes: issue.notes || `Stock issue completion`,
          created_at: new Date().toISOString()
        });

        // Deduct from Batch/Lots if matched batch
        if (line.batch_no) {
          const batchIdx = newBatches.findIndex(b => b.batch_no === line.batch_no && b.product_id === line.product_id);
          if (batchIdx !== -1) {
            const batchPrev = newBatches[batchIdx].qty;
            const batchPost = Math.max(batchPrev - subQty, 0);
            newBatches[batchIdx] = {
              ...newBatches[batchIdx],
              qty: batchPost,
              status: batchPost === 0 ? 'consumed' : 'available'
            };
          }
        }
      }
    });

    // 2. Save States
    saveProducts(updatedProducts);
    saveTransactions(newTxns);
    saveBatches(newBatches);

    // Update issue status
    const updatedIssues = issues.map(i => {
      if (i.id === id) return { ...i, status: 'completed' as const };
      return i;
    });
    saveIssues(updatedIssues);
    showToast(t('Stock-Out Slip Completed! Inventory balances deducted.'));
  };

  const handleCancel = (id: string) => {
    const updated = issues.map(i => {
      if (i.id === id) return { ...i, status: 'cancelled' as const };
      return i;
    });
    saveIssues(updated);
    showToast(t('Issue slip cancelled.'));
  };

  // Filter logic
  const filteredIssues = issues.filter(i => {
    const matchesSearch = i.issue_no.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (i.customer_name && i.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'All' || i.issue_type === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

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

        {/* Title and Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              {t('Goods Issue Notes (Stock-Out)')}
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-450 mt-1">
              {t('Approve internal job requests, sales order dispatches, and material scrap issues.')}
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
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors uppercase tracking-wider text-[9px] ${selectedType === type ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'bg-transparent text-zinc-500 hover:bg-zinc-200/40 dark:hover:bg-zinc-800'}`}
              >
                {t(type.replace('Return ', 'Rtn '))}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder={t('Search by issue code, customer/dept...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-md pl-8 pr-3 py-1.5 outline-none text-zinc-855 dark:text-zinc-200"
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
                  <th className="py-3 px-3">{t('Customer / Department')}</th>
                  <th className="py-3 px-3 font-mono">{t('Date')}</th>
                  <th className="py-3 px-3 text-center">{t('Costing')}</th>
                  <th className="py-3 px-3 text-right font-mono">{t('Total cost')}</th>
                  <th className="py-3 px-3 text-center">{t('Status')}</th>
                  <th className="py-3 px-4 text-right">{t('Workflow Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-850/40">
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-zinc-450 bg-zinc-50/10 dark:bg-zinc-900/5">
                      {t('No issue notes found.')}
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((i) => {
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
                          <td className="py-3.5 px-3 font-mono font-bold text-zinc-805 dark:text-zinc-100">{i.issue_no}</td>
                          <td className="py-3.5 px-3">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400">
                              {i.issue_type}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-bold text-zinc-800 dark:text-zinc-250">{i.warehouse_name}</td>
                          <td className="py-3.5 px-3 text-zinc-650 dark:text-zinc-400">{i.customer_name || '—'}</td>
                          <td className="py-3.5 px-3 font-mono text-zinc-500">{i.date}</td>
                          <td className="py-3.5 px-3 text-center">
                            <span className="inline-block px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-[8px] font-mono font-bold">
                              {i.cost_method}
                            </span>
                          </td>
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
                                  {t('Issue Stock')}
                                </button>
                              )}
                              {(i.status === 'draft' || i.status === 'approved') && (
                                <button
                                  onClick={() => handleCancel(i.id)}
                                  className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded details section */}
                        {isExpanded && (
                          <tr className="bg-zinc-50/20 dark:bg-zinc-900/5">
                            <td colSpan={10} className="py-4 px-8 border-t border-b border-zinc-200/50 dark:border-zinc-850/50">
                              <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{t('Issue Line Details')}</h4>
                                <div className="border border-zinc-200/40 dark:border-zinc-850 rounded-lg overflow-hidden">
                                  <table className="w-full text-left text-[10px] border-collapse bg-white dark:bg-zinc-955">
                                    <thead>
                                      <tr className="bg-zinc-50 dark:bg-zinc-900 font-bold border-b border-zinc-200/40 dark:border-zinc-850 text-zinc-450 dark:text-zinc-500">
                                        <th className="py-2 px-3">{t('SKU')}</th>
                                        <th className="py-2 px-3">{t('Material')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Requested')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Issued Qty')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Unit Cost')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Total Amount')}</th>
                                        <th className="py-2 px-3 font-mono">{t('Batch Lot No')}</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-150/40 dark:divide-zinc-850/30">
                                      {i.lines.map((l) => (
                                        <tr key={l.id}>
                                          <td className="py-2 px-3 font-mono font-bold text-zinc-800 dark:text-zinc-200">{l.sku}</td>
                                          <td className="py-2 px-3 text-zinc-700 dark:text-zinc-350">{l.product_name}</td>
                                          <td className="py-2 px-3 text-right font-mono">{l.qty_requested}</td>
                                          <td className="py-2 px-3 text-right font-mono font-bold">{l.qty_issued}</td>
                                          <td className="py-2 px-3 text-right font-mono">${l.unit_price.toFixed(2)}</td>
                                          <td className="py-2 px-3 text-right font-mono font-bold text-zinc-850 dark:text-zinc-150">${l.amount.toFixed(2)}</td>
                                          <td className="py-2 px-3 font-mono text-zinc-450">{l.batch_no || '—'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                {i.notes && (
                                  <p className="text-[10px] text-zinc-500 dark:text-zinc-455 italic pl-1">
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
        </div>

        {/* Modal Form for Create */}
        {createModalOpen && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-850 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-up">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/60 dark:border-zinc-850">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                  {t('New Goods Issue Note (Draft)')}
                </h3>
                <button onClick={() => setCreateModalOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-450">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateIssue} className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* Meta details */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200/30 dark:border-zinc-855/50">
                  
                  {/* Issue type */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Issue Type')}</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none font-bold text-zinc-850 dark:text-zinc-200"
                    >
                      <option value="production">{t('Project Production')}</option>
                      <option value="sales">{t('Sales Dispatch')}</option>
                      <option value="internal">{t('Internal Consumption')}</option>
                      <option value="return_supplier">{t('Supplier Return')}</option>
                      <option value="adjustment">{t('Direct Write-Off / Scrap')}</option>
                    </select>
                  </div>

                  {/* Source warehouse */}
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
                    <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Stock-Out Line Items')}</h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => showToast(t('Barcode scanner UI placeholder clicked.'))}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[9px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded font-bold border border-zinc-200/50 dark:border-zinc-850"
                      >
                        <Barcode className="h-3 w-3 text-zinc-500" />
                        {t('Scan Barcode')}
                      </button>
                      <button
                        type="button"
                        onClick={addLineItem}
                        className="px-2.5 py-1 text-[9px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded font-bold border border-zinc-200/50 dark:border-zinc-850"
                      >
                        + {t('Add Material')}
                      </button>
                    </div>
                  </div>

                  <div className="border border-zinc-200/60 dark:border-zinc-855 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900 font-bold border-b border-zinc-200/60 dark:border-zinc-850 text-zinc-450 dark:text-zinc-500">
                          <th className="py-2.5 px-3 w-[250px]">{t('Select Material SKU')}</th>
                          <th className="py-2.5 px-3 w-[100px] font-mono">{t('Qty Req')}</th>
                          <th className="py-2.5 px-3 w-[100px] font-mono">{t('Qty Issue')}</th>
                          <th className="py-2.5 px-3 w-[110px] font-mono">{t('Unit Price ($)')}</th>
                          <th className="py-2.5 px-3 w-[120px] font-mono text-right">{t('Amount ($)')}</th>
                          <th className="py-2.5 px-3 w-[120px] font-mono">{t('Batch Lot (Opt)')}</th>
                          <th className="py-2.5 px-3 w-[40px]"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-250/20 dark:divide-zinc-850/45">
                        {lineItems.map((item, idx) => {
                          const prod = products.find(p => p.id === item.product_id);
                          const availStock = prod ? prod.current_qty : 0;
                          const hasDeficit = availStock < item.qty_issued;

                          return (
                            <tr key={idx} className="bg-white dark:bg-zinc-955">
                              <td className="py-2.5 px-3">
                                <select
                                  required
                                  value={item.product_id}
                                  onChange={(e) => handleProductChange(idx, e.target.value)}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded px-2 py-1 outline-none text-zinc-805 dark:text-zinc-200 font-bold"
                                >
                                  <option value="">{t('Select Product...')}</option>
                                  {products.map(p => (
                                    <option key={p.id} value={p.id}>[{p.sku}] {p.name} ({p.current_qty} avail)</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  required
                                  min="1"
                                  value={item.qty_requested}
                                  onChange={(e) => handleQtyRequestedChange(idx, Number(e.target.value))}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded px-2 py-1 outline-none font-mono"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="space-y-0.5">
                                  <input
                                    type="number"
                                    required
                                    min="1"
                                    value={item.qty_issued}
                                    onChange={(e) => handleQtyIssuedChange(idx, Number(e.target.value))}
                                    className={`w-full bg-zinc-50 dark:bg-zinc-900 border rounded px-2 py-1 outline-none font-mono ${hasDeficit ? 'border-red-500 text-red-550' : 'border-zinc-250 dark:border-zinc-800'}`}
                                  />
                                  {hasDeficit && prod && (
                                    <span className="text-[7.5px] text-red-500 font-semibold block">{t('Deficit by')} {item.qty_issued - availStock}</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  required
                                  min="0"
                                  step="0.01"
                                  value={item.unit_price}
                                  onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded px-2 py-1 outline-none font-mono"
                                />
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-800 dark:text-zinc-150">
                                ${item.amount.toFixed(2)}
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  placeholder="LOT-XXX"
                                  value={item.batch_no}
                                  onChange={(e) => handleLineFieldChange(idx, 'batch_no', e.target.value)}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded px-2 py-1 outline-none font-mono"
                                />
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  disabled={lineItems.length === 1}
                                  onClick={() => removeLineItem(idx)}
                                  className="text-red-500 disabled:opacity-30 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 rounded"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Stock-Out Remarks / Notes')}</label>
                    <textarea
                      rows={2}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder={t('Enter references to Sales Orders, department requisitions, scrap reasons...')}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none resize-none"
                    />
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-850 rounded-lg p-4 flex flex-col justify-center items-end">
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Cumulative Outbound Value')}</span>
                    <span className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-mono mt-1">
                      ${issueTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200/50 dark:border-zinc-855">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-zinc-650 dark:text-zinc-350 font-bold transition-colors"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-955 hover:opacity-95 rounded-lg font-bold transition-opacity"
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
