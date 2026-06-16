'use client';

import React, { useState } from 'react';
import { PermissionGuard } from '@/components/permission-guard';
import { useERP } from '@/context/erp-context';
import { useWMSState } from '@/hooks/use-wms-state';
import { StockTransfer, StockTransferLine, Product } from '@/types/erp';
import {
  Search, Plus, Check, Play, X, ChevronDown, ChevronUp,
  ArrowRight, Info, Calendar, ClipboardCheck, CornerRightDown
} from 'lucide-react';

export default function StockTransfers() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { t } = useERP();
  const {
    products, saveProducts,
    warehouses,
    transfers, saveTransfers,
    transactions, saveTransactions
  } = useWMSState();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [expandedTransferId, setExpandedTransferId] = useState<string | null>(null);

  // Modals & Toasts
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Transfer Fields
  const [formSourceWhId, setFormSourceWhId] = useState('');
  const [formDestWhId, setFormDestWhId] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');
  const [lineItems, setLineItems] = useState<Omit<StockTransferLine, 'id' | 'transfer_id'>[]>([
    { product_id: '', product_name: '', sku: '', qty: 1 }
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      product_id: prod.id,
      product_name: prod.name,
      sku: prod.sku
    };
    setLineItems(updated);
  };

  const handleQtyChange = (index: number, qty: number) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      qty: qty
    };
    setLineItems(updated);
  };

  const addLine = () => {
    setLineItems([...lineItems, { product_id: '', product_name: '', sku: '', qty: 1 }]);
  };

  const removeLine = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formSourceWhId || !formDestWhId) {
      showToast(t('Source and Destination Warehouses are required.'));
      return;
    }

    if (formSourceWhId === formDestWhId) {
      showToast(t('Source and Destination Warehouses cannot be the same.'));
      return;
    }

    const invalidLine = lineItems.find(item => !item.product_id || item.qty <= 0);
    if (invalidLine) {
      showToast(t('All lines must have a selected product and qty > 0.'));
      return;
    }

    // Check stock availability in source warehouse
    let insufficient = false;
    let warningStr = '';
    lineItems.forEach(item => {
      // Find source product
      const prod = products.find(p => p.id === item.product_id);
      if (prod && prod.current_qty < item.qty) {
        insufficient = true;
        warningStr += `[${prod.sku}] ${t('has only')} ${prod.current_qty} ${prod.uom}. `;
      }
    });

    if (insufficient) {
      if (!confirm(`${warningStr}\n\n${t('Proceed with creating draft anyway?')}`)) {
        return;
      }
    }

    const srcWh = warehouses.find(w => w.id === formSourceWhId);
    const destWh = warehouses.find(w => w.id === formDestWhId);

    const newTransfer: StockTransfer = {
      id: `st-${Date.now()}`,
      company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1',
      transfer_no: `TRF-${new Date().getFullYear()}-${String(transfers.length + 1).padStart(4, '0')}`,
      source_warehouse_id: formSourceWhId,
      source_warehouse_name: srcWh ? srcWh.name : 'Source Depot',
      dest_warehouse_id: formDestWhId,
      dest_warehouse_name: destWh ? destWh.name : 'Dest Depot',
      date: formDate,
      status: 'pending',
      notes: formNotes || undefined,
      lines: lineItems.map((item, idx) => ({
        ...item,
        id: `stl-${Date.now()}-${idx}`,
        transfer_id: `st-${Date.now()}`
      })),
      created_by: 'u5',
      created_at: new Date().toISOString()
    };

    saveTransfers([newTransfer, ...transfers]);
    setCreateModalOpen(false);
    showToast(t('Inter-Warehouse Transfer request created!'));
  };

  // Workflow Action 1: Ship/Dispatch (Pending -> In Transit)
  const handleShip = (id: string) => {
    const updated = transfers.map(t => {
      if (t.id === id) return { ...t, status: 'in_transit' as const };
      return t;
    });
    saveTransfers(updated);
    showToast(t('Transfer is now In Transit. Materials dispatched.'));
  };

  // Workflow Action 2: Complete (In Transit -> Completed)
  // Deducts source stock, increases dest stock, logs audit trail
  const handleComplete = (id: string) => {
    const trf = transfers.find(t => t.id === id);
    if (!trf) return;

    // Verify source stock one last time
    let insufficient = false;
    let stockSummary = '';
    trf.lines.forEach(line => {
      const prod = products.find(p => p.id === line.product_id);
      if (prod && prod.current_qty < line.qty) {
        insufficient = true;
        stockSummary += `\n- ${prod.name} (${t('Req:')} ${line.qty} | ${t('Avail:')} ${prod.current_qty})`;
      }
    });

    if (insufficient) {
      alert(`${t('Cannot complete transfer. Insufficient stock:')}${stockSummary}`);
      return;
    }

    const updatedProducts = [...products];
    const newTxns = [...transactions];

    trf.lines.forEach(line => {
      // 1. Deduct from source product
      const srcIdx = updatedProducts.findIndex(p => p.id === line.product_id);
      if (srcIdx !== -1) {
        const srcProd = updatedProducts[srcIdx];
        const prevSrcQty = srcProd.current_qty;
        const postSrcQty = prevSrcQty - line.qty;

        updatedProducts[srcIdx] = {
          ...srcProd,
          current_qty: postSrcQty
        };

        // Write Stock-Out Transaction for source warehouse
        newTxns.unshift({
          id: `tx-trf-src-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          company_id: trf.company_id,
          product_id: line.product_id,
          product_name: line.product_name,
          sku: line.sku,
          action: 'transfer',
          reference_no: trf.transfer_no,
          warehouse_id: trf.source_warehouse_id,
          warehouse_name: trf.source_warehouse_name,
          qty_before: prevSrcQty,
          qty_change: -line.qty,
          qty_after: postSrcQty,
          value_change: -line.qty * srcProd.cost_price,
          performed_by: 'u5',
          performer_name: 'Charlie Stock',
          notes: trf.notes || `Transfer dispatch to ${trf.dest_warehouse_name}`,
          created_at: new Date().toISOString()
        });

        // 2. Add to destination product
        // Check if destination warehouse already has a product with this SKU
        const destIdx = updatedProducts.findIndex(p => p.sku === srcProd.sku && p.warehouse_id === trf.dest_warehouse_id);
        if (destIdx !== -1) {
          const destProd = updatedProducts[destIdx];
          const prevDestQty = destProd.current_qty;
          const postDestQty = prevDestQty + line.qty;

          updatedProducts[destIdx] = {
            ...destProd,
            current_qty: postDestQty
          };

          // Write Stock-In Transaction for destination warehouse
          newTxns.unshift({
            id: `tx-trf-dst-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            company_id: trf.company_id,
            product_id: destProd.id,
            product_name: destProd.name,
            sku: destProd.sku,
            action: 'transfer',
            reference_no: trf.transfer_no,
            warehouse_id: trf.dest_warehouse_id,
            warehouse_name: trf.dest_warehouse_name,
            qty_before: prevDestQty,
            qty_change: line.qty,
            qty_after: postDestQty,
            value_change: line.qty * destProd.cost_price,
            performed_by: 'u5',
            performer_name: 'Charlie Stock',
            notes: trf.notes || `Received transfer from ${trf.source_warehouse_name}`,
            created_at: new Date().toISOString()
          });
        } else {
          // Create new product entry for destination warehouse
          const newDestProdId = `p-trf-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          const newDestProduct: Product = {
            ...srcProd,
            id: newDestProdId,
            warehouse_id: trf.dest_warehouse_id,
            location: 'A-01-01', // default starting location
            current_qty: line.qty,
            created_at: new Date().toISOString()
          };

          updatedProducts.push(newDestProduct);

          // Write Stock-In Transaction for destination warehouse
          newTxns.unshift({
            id: `tx-trf-dst-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            company_id: trf.company_id,
            product_id: newDestProdId,
            product_name: srcProd.name,
            sku: srcProd.sku,
            action: 'transfer',
            reference_no: trf.transfer_no,
            warehouse_id: trf.dest_warehouse_id,
            warehouse_name: trf.dest_warehouse_name,
            qty_before: 0,
            qty_change: line.qty,
            qty_after: line.qty,
            value_change: line.qty * srcProd.cost_price,
            performed_by: 'u5',
            performer_name: 'Charlie Stock',
            notes: trf.notes || `Received transfer from ${trf.source_warehouse_name} (New SKU assignment)`,
            created_at: new Date().toISOString()
          });
        }
      }
    });

    saveProducts(updatedProducts);
    saveTransactions(newTxns);

    // Update status
    const updatedTransfers = transfers.map(t => {
      if (t.id === id) return { ...t, status: 'completed' as const };
      return t;
    });
    saveTransfers(updatedTransfers);
    showToast(t('Stock Transfer completed! Quantities reassigned.'));
  };

  const handleCancel = (id: string) => {
    const updated = transfers.map(t => {
      if (t.id === id) return { ...t, status: 'cancelled' as const };
      return t;
    });
    saveTransfers(updated);
    showToast(t('Transfer cancelled.'));
  };

  // Filter
  const filteredTransfers = transfers.filter(t => {
    const matchesSearch = t.transfer_no.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.source_warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.dest_warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus.toLowerCase().replace(' ', '_');
    return matchesSearch && matchesStatus;
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
              {t('Inter-Warehouse Material Transfers')}
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-450 mt-1">
              {t('Coordinate material shipments between stockyards and job depots with in-transit tracking.')}
            </p>
          </div>

          <div>
            <button 
              onClick={() => {
                setLineItems([{ product_id: '', product_name: '', sku: '', qty: 1 }]);
                setFormNotes('');
                setFormSourceWhId(warehouses[0]?.id || '');
                setFormDestWhId(warehouses[1]?.id || '');
                setCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 rounded-lg font-bold transition-opacity"
            >
              <Plus className="h-4 w-4" />
              {t('Create Transfer Request')}
            </button>
          </div>
        </div>

        {/* Filter toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-850">
          
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {['All', 'Pending', 'In Transit', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors uppercase tracking-wider text-[9px] ${selectedStatus === status ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'bg-transparent text-zinc-500 hover:bg-zinc-200/40 dark:hover:bg-zinc-800'}`}
              >
                {t(status)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder={t('Search by transfer no, yard...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-md pl-8 pr-3 py-1.5 outline-none text-zinc-855 dark:text-zinc-200"
            />
          </div>

        </div>

        {/* Transfers table */}
        <div className="saas-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-450 dark:text-zinc-550 border-b border-zinc-250/20 dark:border-zinc-800/50 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-6"></th>
                  <th className="py-3 px-3">{t('Transfer No')}</th>
                  <th className="py-3 px-3">{t('Source Depot')}</th>
                  <th className="py-3 px-3"></th>
                  <th className="py-3 px-3">{t('Destination Depot')}</th>
                  <th className="py-3 px-3 font-mono">{t('Date')}</th>
                  <th className="py-3 px-3 text-center">{t('SKUs Count')}</th>
                  <th className="py-3 px-3 text-center">{t('Status')}</th>
                  <th className="py-3 px-4 text-right">{t('Workflow Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-850/40">
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-zinc-450 bg-zinc-50/10 dark:bg-zinc-900/5">
                      {t('No transfer logs found.')}
                    </td>
                  </tr>
                ) : (
                  filteredTransfers.map((tr) => {
                    const isExpanded = expandedTransferId === tr.id;

                    // Color code status
                    let statusColor = 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-450';
                    if (tr.status === 'pending') statusColor = 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400';
                    else if (tr.status === 'in_transit') statusColor = 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400';
                    else if (tr.status === 'completed') statusColor = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
                    else if (tr.status === 'cancelled') statusColor = 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-455';

                    return (
                      <React.Fragment key={tr.id}>
                        <tr 
                          onClick={() => setExpandedTransferId(isExpanded ? null : tr.id)}
                          className={`hover:bg-zinc-50/30 dark:hover:bg-zinc-900/15 transition-colors cursor-pointer ${isExpanded ? 'bg-zinc-50/20 dark:bg-zinc-900/5' : ''}`}
                        >
                          <td className="py-3.5 px-4">
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-zinc-850 dark:text-zinc-50">{tr.transfer_no}</td>
                          <td className="py-3.5 px-3 font-bold text-zinc-800 dark:text-zinc-200">{tr.source_warehouse_name}</td>
                          <td className="py-3.5 px-3 text-center">
                            <ArrowRight className="h-4 w-4 text-zinc-400 mx-auto" />
                          </td>
                          <td className="py-3.5 px-3 font-bold text-zinc-800 dark:text-zinc-200">{tr.dest_warehouse_name}</td>
                          <td className="py-3.5 px-3 font-mono text-zinc-500">{tr.date}</td>
                          <td className="py-3.5 px-3 text-center font-mono font-bold">{tr.lines.length}</td>
                          <td className="py-3.5 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${statusColor}`}>
                              {tr.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {tr.status === 'pending' && (
                                <button
                                  onClick={() => handleShip(tr.id)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/40 dark:border-blue-800/40 rounded font-bold"
                                >
                                  <Play className="h-3 w-3" />
                                  {t('Ship Goods')}
                                </button>
                              )}
                              {tr.status === 'in_transit' && (
                                <button
                                  onClick={() => handleComplete(tr.id)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-450 border border-emerald-200/40 dark:border-emerald-800/40 rounded font-bold"
                                >
                                  <ClipboardCheck className="h-3 w-3" />
                                  {t('Receive Goods')}
                                </button>
                              )}
                              {(tr.status === 'pending' || tr.status === 'in_transit') && (
                                <button
                                  onClick={() => handleCancel(tr.id)}
                                  className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded font-bold"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Line details */}
                        {isExpanded && (
                          <tr className="bg-zinc-50/20 dark:bg-zinc-900/5">
                            <td colSpan={9} className="py-4 px-8 border-t border-b border-zinc-200/50 dark:border-zinc-850/50">
                              <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{t('Transferred Items List')}</h4>
                                <div className="border border-zinc-200/40 dark:border-zinc-850 rounded-lg overflow-hidden max-w-xl">
                                  <table className="w-full text-left text-[10px] border-collapse bg-white dark:bg-zinc-955">
                                    <thead>
                                      <tr className="bg-zinc-50 dark:bg-zinc-900 font-bold border-b border-zinc-200/40 dark:border-zinc-850 text-zinc-450 dark:text-zinc-500">
                                        <th className="py-2 px-3">{t('SKU')}</th>
                                        <th className="py-2 px-3">{t('Material')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Transfer Qty')}</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-150/40 dark:divide-zinc-850/30">
                                      {tr.lines.map((l) => (
                                        <tr key={l.id}>
                                          <td className="py-2 px-3 font-mono font-bold text-zinc-800 dark:text-zinc-200">{l.sku}</td>
                                          <td className="py-2 px-3 text-zinc-750 dark:text-zinc-350">{l.product_name}</td>
                                          <td className="py-2 px-3 text-right font-mono font-bold">{l.qty}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                {tr.notes && (
                                  <p className="text-[10px] text-zinc-500 dark:text-zinc-450 italic pl-1">
                                    <strong>{t('Notes:')}</strong> {tr.notes}
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
            <div className="bg-white dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-850 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-up">
              
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/60 dark:border-zinc-850">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-550">
                  {t('Request Inter-Warehouse Stock Transfer')}
                </h3>
                <button onClick={() => setCreateModalOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-455">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateTransfer} className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* Meta properties */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200/30 dark:border-zinc-855/50">
                  
                  {/* Source */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Source Warehouse Depot *')}</label>
                    <select
                      required
                      value={formSourceWhId}
                      onChange={(e) => setFormSourceWhId(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none font-bold text-zinc-855 dark:text-zinc-200"
                    >
                      <option value="">{t('Select Source...')}</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Destination */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Destination Depot *')}</label>
                    <select
                      required
                      value={formDestWhId}
                      onChange={(e) => setFormDestWhId(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none font-bold text-zinc-855 dark:text-zinc-200"
                    >
                      <option value="">{t('Select Destination...')}</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Transfer Shipment Date')}</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-205 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none text-zinc-850 dark:text-zinc-200 font-mono"
                    />
                  </div>

                </div>

                {/* Line Items */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Items to Transfer')}</h4>
                    <button
                      type="button"
                      onClick={addLine}
                      className="px-2.5 py-1 text-[9px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded font-bold border border-zinc-200/50 dark:border-zinc-850"
                    >
                      + {t('Add SKU')}
                    </button>
                  </div>

                  <div className="border border-zinc-200/60 dark:border-zinc-850 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900 font-bold border-b border-zinc-200/60 dark:border-zinc-850 text-zinc-450 dark:text-zinc-500">
                          <th className="py-2 px-3">{t('Select Material SKU (Matches Source Warehouse stock)')}</th>
                          <th className="py-2 px-3 w-[150px] font-mono">{t('Quantity to Transfer')}</th>
                          <th className="py-2 px-3 w-[40px]"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-250/20 dark:divide-zinc-850/45">
                        {lineItems.map((item, idx) => {
                          // Filter products matching source warehouse to make selecting clean
                          const filteredSourceProducts = formSourceWhId 
                            ? products.filter(p => p.warehouse_id === formSourceWhId)
                            : products;

                          return (
                            <tr key={idx} className="bg-white dark:bg-zinc-955">
                              <td className="py-2 px-3">
                                <select
                                  required
                                  value={item.product_id}
                                  onChange={(e) => handleProductChange(idx, e.target.value)}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded px-2 py-1 outline-none font-bold text-zinc-800 dark:text-zinc-200"
                                >
                                  <option value="">{t('Select Material...')}</option>
                                  {filteredSourceProducts.map(p => (
                                    <option key={p.id} value={p.id}>[{p.sku}] {p.name} ({p.current_qty} {p.uom} available)</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  required
                                  min="1"
                                  value={item.qty}
                                  onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded px-2 py-1 outline-none font-mono"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  disabled={lineItems.length === 1}
                                  onClick={() => removeLine(idx)}
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

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Transfer Reason / Remarks')}</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder={t('Enter logical details, carrier company, driver references, etc...')}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none resize-none"
                  />
                </div>

                {/* Footer Buttons */}
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
                    {t('Save Transfer Request')}
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
