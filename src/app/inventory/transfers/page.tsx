'use client';

import React, { useState, useEffect } from 'react';
import { PermissionGuard } from '@/components/permission-guard';
import { useERP } from '@/context/erp-context';
import { useWMSState } from '@/hooks/use-wms-state';
import { createClient } from '@/utils/supabase/client';
import ProductAutocomplete from '@/components/wms/product-autocomplete';
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
    warehouses,
    addTransfer,
    addProduct,
    updateProduct,
    addTransaction
  } = useWMSState();

  // Paginated List State
  const [transfersList, setTransfersList] = useState<any[]>([]);
  const [totalTransfersCount, setTotalTransfersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

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

  const itemsPerPage = 10;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchTransfers = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('stock_transfers')
        .select('*, source:warehouses!source_warehouse_id(name), dest:warehouses!dest_warehouse_id(name), lines:stock_transfer_lines(*, product:products(name, sku))', { count: 'exact' });

      if (selectedStatus !== 'All') {
        query = query.eq('status', selectedStatus.toLowerCase().replace(' ', '_'));
      }

      if (searchTerm.trim()) {
        query = query.or(`transfer_no.ilike.%${searchTerm.trim()}%,notes.ilike.%${searchTerm.trim()}%`);
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const mapped = (data || []).map((t: any) => ({
        id: t.id,
        company_id: t.company_id,
        transfer_no: t.transfer_no,
        source_warehouse_id: t.source_warehouse_id,
        source_warehouse_name: t.source ? t.source.name : 'Source Depot',
        dest_warehouse_id: t.dest_warehouse_id,
        dest_warehouse_name: t.dest ? t.dest.name : 'Dest Depot',
        date: t.date,
        status: t.status,
        notes: t.notes,
        created_by: t.created_by,
        created_at: t.created_at,
        lines: (t.lines || []).map((l: any) => ({
          id: l.id,
          transfer_id: l.transfer_id,
          product_id: l.product_id,
          product_name: l.product ? l.product.name : 'Unknown Product',
          sku: l.product ? l.product.sku : '',
          qty: Number(l.qty) || 0
        }))
      }));

      setTransfersList(mapped);
      setTotalTransfersCount(count || 0);
    } catch (err) {
      console.error('Error fetching stock transfers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [searchTerm, selectedStatus, currentPage]);

  const handleProductSelect = (index: number, prod: Product | null) => {
    const updated = [...lineItems];
    if (!prod) {
      updated[index] = {
        product_id: '',
        product_name: '',
        sku: '',
        qty: updated[index].qty
      };
    } else {
      updated[index] = {
        ...updated[index],
        product_id: prod.id,
        product_name: prod.name,
        sku: prod.sku || ''
      };
    }
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

  const handleCreateTransfer = async (e: React.FormEvent) => {
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

    try {
      const supabase = createClient();

      // Check stock availability in source warehouse
      let insufficient = false;
      let warningStr = '';
      
      for (const item of lineItems) {
        const { data: prod } = await supabase
          .from('products')
          .select('name, sku, current_qty')
          .eq('id', item.product_id)
          .single();

        if (prod && Number(prod.current_qty) < item.qty) {
          insufficient = true;
          warningStr += `[${prod.sku}] ${t('has only')} ${prod.current_qty}. `;
        }
      }

      if (insufficient) {
        if (!confirm(`${warningStr}\n\n${t('Proceed with creating draft anyway?')}`)) {
          return;
        }
      }

      const { count } = await supabase
        .from('stock_transfers')
        .select('*', { count: 'exact', head: true });

      const nextSeq = (count || 0) + 1;
      const transferNo = `TRF-${new Date().getFullYear()}-${String(nextSeq).padStart(4, '0')}`;

      // Insert transfer request using context mutation
      const success = await addTransfer({
        transfer_no: transferNo,
        source_warehouse_id: formSourceWhId,
        dest_warehouse_id: formDestWhId,
        date: formDate,
        status: 'pending',
        notes: formNotes || undefined,
        lines: lineItems
      });

      if (success) {
        setCreateModalOpen(false);
        showToast(t('Inter-Warehouse Transfer request created!'));
        fetchTransfers();
      } else {
        showToast(t('Failed to create transfer request.'));
      }
    } catch (err) {
      console.error(err);
      showToast(t('Error creating transfer.'));
    }
  };

  // Workflow Action 1: Ship/Dispatch (Pending -> In Transit)
  const handleShip = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('stock_transfers')
        .update({ status: 'in_transit' })
        .eq('id', id);

      if (error) throw error;
      showToast(t('Transfer is now In Transit. Materials dispatched.'));
      fetchTransfers();
    } catch (e) {
      console.error(e);
      showToast(t('Failed to dispatch transfer.'));
    }
  };

  // Workflow Action 2: Complete (In Transit -> Completed)
  const handleComplete = async (id: string) => {
    const trf = transfersList.find(t => t.id === id);
    if (!trf) return;

    try {
      const supabase = createClient();

      // Verify source stock one last time
      let insufficient = false;
      let stockSummary = '';
      
      for (const line of trf.lines) {
        const { data: prod } = await supabase
          .from('products')
          .select('name, current_qty')
          .eq('id', line.product_id)
          .single();

        const avail = prod ? Number(prod.current_qty) || 0 : 0;
        if (avail < line.qty) {
          insufficient = true;
          stockSummary += `\n- ${prod ? prod.name : 'Product'} (${t('Req:')} ${line.qty} | ${t('Avail:')} ${avail})`;
        }
      }

      if (insufficient) {
        alert(`${t('Cannot complete transfer. Insufficient stock:')}${stockSummary}`);
        return;
      }

      // Reassign stocks in database
      for (const line of trf.lines) {
        // Fetch source product details
        const { data: prod } = await supabase
          .from('products')
          .select('*')
          .eq('id', line.product_id)
          .single();

        if (!prod) throw new Error(`Source product ${line.product_id} not found.`);

        const prevSrcQty = Number(prod.current_qty) || 0;
        const postSrcQty = prevSrcQty - line.qty;

        // 1. Deduct from source warehouse product
        await updateProduct(line.product_id, { current_qty: postSrcQty });

        // Write Stock-Out Transaction for source warehouse
        await addTransaction({
          company_id: trf.company_id,
          product_id: line.product_id,
          action: 'transfer',
          reference_no: trf.transfer_no,
          warehouse_id: trf.source_warehouse_id,
          qty_before: prevSrcQty,
          qty_change: -line.qty,
          qty_after: postSrcQty,
          value_change: -line.qty * (Number(prod.cost_price) || 0),
          notes: trf.notes || `Transfer dispatch to ${trf.dest_warehouse_name}`
        });

        // 2. Add to destination warehouse product (match by SKU)
        const { data: destProd } = await supabase
          .from('products')
          .select('*')
          .eq('sku', prod.sku)
          .eq('warehouse_id', trf.dest_warehouse_id)
          .maybeSingle();

        if (destProd) {
          const prevDestQty = Number(destProd.current_qty) || 0;
          const postDestQty = prevDestQty + line.qty;

          await updateProduct(destProd.id, { current_qty: postDestQty });

          // Write Stock-In Transaction for destination warehouse
          await addTransaction({
            company_id: trf.company_id,
            product_id: destProd.id,
            action: 'transfer',
            reference_no: trf.transfer_no,
            warehouse_id: trf.dest_warehouse_id,
            qty_before: prevDestQty,
            qty_change: line.qty,
            qty_after: postDestQty,
            value_change: line.qty * (Number(destProd.cost_price) || 0),
            notes: trf.notes || `Received transfer from ${trf.source_warehouse_name}`
          });
        } else {
          // Create new product record for destination warehouse
          const newDestProduct: Product = {
            id: `p-trf-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            company_id: trf.company_id,
            name: prod.name,
            sku: prod.sku,
            barcode: prod.barcode,
            description: prod.description,
            category_id: prod.category_id,
            uom_id: prod.uom_id,
            sale_price: Number(prod.sale_price) || 0,
            cost_price: Number(prod.cost_price) || 0,
            is_material: prod.is_material,
            min_qty: Number(prod.min_qty) || 0,
            max_qty: prod.max_qty ? Number(prod.max_qty) : undefined,
            current_qty: line.qty,
            warehouse_id: trf.dest_warehouse_id,
            location: 'A-01-01',
            manufacturer: prod.manufacturer,
            status: 'active',
            created_at: new Date().toISOString()
          };

          await addProduct(newDestProduct);

          // Write Stock-In Transaction for destination warehouse (New SKU assignment)
          await addTransaction({
            company_id: trf.company_id,
            product_id: newDestProduct.id,
            action: 'transfer',
            reference_no: trf.transfer_no,
            warehouse_id: trf.dest_warehouse_id,
            qty_before: 0,
            qty_change: line.qty,
            qty_after: line.qty,
            value_change: line.qty * (Number(prod.cost_price) || 0),
            notes: trf.notes || `Received transfer from ${trf.source_warehouse_name} (New SKU assignment)`
          });
        }
      }

      // Update transfer status
      const { error: rErr } = await supabase
        .from('stock_transfers')
        .update({ status: 'completed' })
        .eq('id', id);

      if (rErr) throw rErr;

      showToast(t('Stock Transfer completed! Quantities reassigned.'));
      fetchTransfers();
    } catch (e) {
      console.error('Error completing stock transfer:', e);
      showToast(t('Error completing transfer.'));
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('stock_transfers')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      showToast(t('Transfer cancelled.'));
      fetchTransfers();
    } catch (e) {
      console.error(e);
      showToast(t('Failed to cancel transfer.'));
    }
  };

  const totalPages = Math.ceil(totalTransfersCount / itemsPerPage);

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
            <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-55 tracking-tight">
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
                onClick={() => {
                  setSelectedStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors uppercase tracking-wider text-[9px] ${selectedStatus === status ? 'bg-zinc-955 text-white dark:bg-white dark:text-zinc-950' : 'bg-transparent text-zinc-500 hover:bg-zinc-200/40 dark:hover:bg-zinc-800'}`}
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-zinc-450 bg-zinc-50/10 dark:bg-zinc-900/5 font-bold">
                      {t('Loading...')}
                    </td>
                  </tr>
                ) : transfersList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-zinc-450 bg-zinc-50/10 dark:bg-zinc-900/5">
                      {t('No transfer logs found.')}
                    </td>
                  </tr>
                ) : (
                  transfersList.map((tr) => {
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
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/40 dark:border-blue-800/40 rounded font-bold transition-colors"
                                >
                                  <CornerRightDown className="h-3 w-3 rotate-270" />
                                  {t('Ship Cargo')}
                                </button>
                              )}
                              {tr.status === 'in_transit' && (
                                <button
                                  onClick={() => handleComplete(tr.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-450 border border-emerald-200/40 dark:border-emerald-800/40 rounded font-bold transition-colors"
                                >
                                  <Check className="h-3 w-3" />
                                  {t('Acknowledge Receipt')}
                                </button>
                              )}
                              {(tr.status === 'pending' || tr.status === 'in_transit') && (
                                <button
                                  onClick={() => handleCancel(tr.id)}
                                  className="p-1 hover:bg-red-50 dark:hover:bg-red-955/20 text-red-500 rounded"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded table details */}
                        {isExpanded && (
                          <tr className="bg-zinc-50/20 dark:bg-zinc-900/5">
                            <td colSpan={9} className="py-4 px-8 border-t border-b border-zinc-200/50 dark:border-zinc-850/50">
                              <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{t('Transferred items list')}</h4>
                                <div className="border border-zinc-200/40 dark:border-zinc-850 rounded-lg overflow-hidden">
                                  <table className="w-full text-left text-[10px] border-collapse bg-white dark:bg-zinc-950">
                                    <thead>
                                      <tr className="bg-zinc-50 dark:bg-zinc-900 font-bold border-b border-zinc-200/40 dark:border-zinc-850 text-zinc-450 dark:text-zinc-550">
                                        <th className="py-2 px-3">{t('SKU')}</th>
                                        <th className="py-2 px-3">{t('Material')}</th>
                                        <th className="py-2 px-3 text-right font-mono">{t('Qty Transferred')}</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-150/40 dark:divide-zinc-850/30">
                                      {tr.lines.map((l: any) => (
                                        <tr key={l.id}>
                                          <td className="py-2 px-3 font-mono font-bold text-zinc-850 dark:text-zinc-200">{l.sku}</td>
                                          <td className="py-2 px-3 text-zinc-700 dark:text-zinc-350">{l.product_name}</td>
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

          {/* Pagination buttons */}
          {!isLoading && totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-zinc-200/50 dark:border-zinc-800">
              <span className="text-zinc-450 font-medium">
                {t('Showing page')} <strong>{currentPage}</strong> {t('of')} <strong>{totalPages}</strong> ({transfersList.length} {t('transfers')})
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
            <div className="bg-white dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-850 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-up">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/60 dark:border-zinc-850">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                  {t('New Inter-Warehouse Stock Transfer')}
                </h3>
                <button onClick={() => setCreateModalOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-450 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateTransfer} className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* Meta Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200/30 dark:border-zinc-850/50">
                  
                  {/* Source Warehouse */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Source Depot *')}</label>
                    <select
                      required
                      value={formSourceWhId}
                      onChange={(e) => setFormSourceWhId(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none font-bold text-zinc-850 dark:text-zinc-200"
                    >
                      <option value="">{t('Select Source...')}</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dest Warehouse */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Destination Depot *')}</label>
                    <select
                      required
                      value={formDestWhId}
                      onChange={(e) => setFormDestWhId(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none font-bold text-zinc-850 dark:text-zinc-200"
                    >
                      <option value="">{t('Select Destination...')}</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Transfer date */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Shipment Date')}</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 outline-none text-zinc-855 dark:text-zinc-200 font-mono"
                    />
                  </div>

                </div>

                {/* Line items spreadsheet */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">{t('Transfer Lines')}</h4>
                    <button
                      type="button"
                      onClick={addLine}
                      className="px-2.5 py-1 text-[9px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded font-bold border border-zinc-200/50 dark:border-zinc-850 cursor-pointer"
                    >
                      + {t('Add Item')}
                    </button>
                  </div>

                  <div className="border border-zinc-200/60 dark:border-zinc-850 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900 font-bold border-b border-zinc-200/60 dark:border-zinc-850 text-zinc-450 dark:text-zinc-500">
                          <th className="py-2.5 px-3 w-[450px]">{t('Select Material SKU (Matches Source Warehouse stock)')}</th>
                          <th className="py-2.5 px-3 w-[150px] font-mono">{t('Qty to Transfer')}</th>
                          <th className="py-2.5 px-3 w-[40px]"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-250/20 dark:divide-zinc-850/45">
                        {lineItems.map((item, idx) => (
                          <tr key={idx} className="bg-white dark:bg-zinc-955">
                            <td className="py-2 px-3 align-middle">
                              <ProductAutocomplete
                                warehouseId={formSourceWhId || undefined}
                                onSelect={(prod) => handleProductSelect(idx, prod)}
                                excludeIds={lineItems.map(l => l.product_id).filter(id => id !== item.product_id)}
                                placeholder={t('Search source depot materials...')}
                                initialProductId={item.product_id || undefined}
                              />
                            </td>
                            <td className="py-2 px-3 align-middle">
                              <input
                                type="number"
                                required
                                min="1"
                                value={item.qty}
                                onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded px-2 py-1 outline-none font-mono text-[10px]"
                              />
                            </td>
                            <td className="py-2 px-3 text-center align-middle">
                              <button
                                type="button"
                                disabled={lineItems.length === 1}
                                onClick={() => removeLine(idx)}
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

                {/* Notes remarks */}
                <div className="space-y-1 pt-3">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Logistics notes')}</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder={t('Enter tracking numbers, driver info, vehicle plates...')}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none resize-none text-[10px]"
                  />
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
                    {t('Request Transfer')}
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
