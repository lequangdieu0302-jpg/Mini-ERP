'use client';

import React, { useState, useEffect } from 'react';
import { PermissionGuard } from '@/components/permission-guard';
import { useERP } from '@/context/erp-context';
import { useWMSState } from '@/hooks/use-wms-state';
import { createClient } from '@/utils/supabase/client';
import { InventoryTransaction } from '@/types/erp';
import {
  Search, ArrowDownCircle, ArrowUpCircle, RefreshCw, Wrench, ClipboardList,
  Calendar, User, AlertCircle, Filter, FileSpreadsheet
} from 'lucide-react';

export default function TransactionAuditTrail() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { t } = useERP();

  // Local State
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Toast notice
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const itemsPerPage = 10;

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      let query = supabase.from('inventory_transactions').select('*, product:products(*), warehouse:warehouses(*), performer:users_profile(full_name)', { count: 'exact' });

      if (selectedAction !== 'All') {
        query = query.eq('action', selectedAction.toLowerCase().replace(' ', '_'));
      }

      if (fromDate) {
        query = query.gte('created_at', `${fromDate}T00:00:00Z`);
      }

      if (toDate) {
        query = query.lte('created_at', `${toDate}T23:59:59Z`);
      }

      if (searchTerm.trim()) {
        query = query.or(`reference_no.ilike.%${searchTerm.trim()}%,notes.ilike.%${searchTerm.trim()}%`);
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
        product_id: t.product_id,
        product_name: t.product ? t.product.name : 'Unknown Material',
        sku: t.product ? t.product.sku : '',
        action: t.action,
        reference_no: t.reference_no,
        warehouse_id: t.warehouse_id,
        warehouse_name: t.warehouse ? t.warehouse.name : 'Unknown Depot',
        qty_before: Number(t.qty_before) || 0,
        qty_change: Number(t.qty_change) || 0,
        qty_after: Number(t.qty_after) || 0,
        value_change: Number(t.value_change) || 0,
        performer_name: t.performer ? t.performer.full_name : 'Charlie Stock',
        notes: t.notes,
        created_at: t.created_at
      }));

      setTransactionsList(mapped);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [searchTerm, selectedAction, fromDate, toDate, currentPage]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const displayedTxns = transactionsList;

  if (!mounted) return null;

  return (
    <PermissionGuard module="inventory">
      <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto min-h-screen text-xs select-none">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              {t('Inventory Transaction Audit Trail Ledger')}
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-450 mt-1">
              {t('Immutable historical log of all material arrivals, warehouse transfers, issues, and audit counts.')}
            </p>
          </div>

          <div>
            <button 
              onClick={() => showToast(t('Exporting full ledger audit trial...'))}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-955 hover:opacity-90 rounded-lg font-bold transition-opacity"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {t('Export Audit Ledger')}
            </button>
          </div>
        </div>

        {/* Toolbar Filters */}
        <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200/50 dark:border-zinc-850">
          <div className="flex flex-col lg:flex-row gap-3">
            
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder={t('Search by material SKU, performer, reference slip code...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-md pl-8 pr-3 py-2 outline-none text-zinc-850 dark:text-zinc-200"
              />
            </div>

            {/* Date range picker */}
            <div className="flex flex-wrap items-center gap-2 font-mono">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Dates From:')}</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 outline-none text-zinc-800 dark:text-zinc-200"
              />
              <span className="text-zinc-400 font-bold">{t('to')}</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 outline-none text-zinc-800 dark:text-zinc-200"
              />
              {(fromDate || toDate) && (
                <button
                  type="button"
                  onClick={() => { setFromDate(''); setToDate(''); }}
                  className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-red-500 font-bold text-[9px]"
                >
                  {t('Clear')}
                </button>
              )}
            </div>

          </div>

          {/* Action pills */}
          <div className="flex flex-wrap gap-1 border-t border-zinc-200/50 dark:border-zinc-850/60 pt-3">
            {['All', 'Stock In', 'Stock Out', 'Transfer', 'Adjustment', 'Count'].map((act) => (
              <button
                key={act}
                onClick={() => setSelectedAction(act)}
                className={`px-3 py-1 rounded font-bold transition-all text-[9px] uppercase tracking-wider ${selectedAction === act ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-955' : 'bg-transparent text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800'}`}
              >
                {t(act)}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Table View */}
        <div className="saas-card p-5 relative">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-450 dark:text-zinc-500 border-b border-zinc-250/30 dark:border-zinc-850 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-mono">{t('Timestamp')}</th>
                  <th className="py-2.5 px-3">{t('Audit Action')}</th>
                  <th className="py-2.5 px-3">{t('Ref Slip')}</th>
                  <th className="py-2.5 px-3">{t('Material SKU')}</th>
                  <th className="py-2.5 px-3">{t('Audit Depot')}</th>
                  <th className="py-2.5 px-3 text-right font-mono">{t('Qty Before')}</th>
                  <th className="py-2.5 px-3 text-right font-mono">{t('Delta Change')}</th>
                  <th className="py-2.5 px-3 text-right font-mono">{t('Qty After')}</th>
                  <th className="py-2.5 px-3 text-right font-mono">{t('Value Impact')}</th>
                  <th className="py-2.5 px-3">{t('Performed By')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-zinc-450 font-medium">
                      {t('Loading transaction logs...')}
                    </td>
                  </tr>
                ) : displayedTxns.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-zinc-450 font-medium bg-zinc-50/10 dark:bg-zinc-950/10">
                      {t('No transaction logs recorded matching filter rules.')}
                    </td>
                  </tr>
                ) : (
                  displayedTxns.map((tx, idx) => {
                    // Action formatting
                    let actionIcon = <RefreshCw className="h-3.5 w-3.5" />;
                    let actionColor = 'text-zinc-650 bg-zinc-50 dark:text-zinc-400 dark:bg-zinc-900';

                    if (tx.action === 'stock_in') {
                      actionIcon = <ArrowDownCircle className="h-3.5 w-3.5" />;
                      actionColor = 'text-emerald-500 bg-emerald-50 dark:text-emerald-450 dark:bg-emerald-950/20';
                    } else if (tx.action === 'stock_out') {
                      actionIcon = <ArrowUpCircle className="h-3.5 w-3.5" />;
                      actionColor = 'text-rose-500 bg-rose-50 dark:text-rose-455 dark:bg-rose-950/20';
                    } else if (tx.action === 'transfer') {
                      actionIcon = <RefreshCw className="h-3.5 w-3.5" />;
                      actionColor = 'text-blue-500 bg-blue-50 dark:text-blue-450 dark:bg-blue-950/20';
                    } else if (tx.action === 'adjustment') {
                      actionIcon = <Wrench className="h-3.5 w-3.5" />;
                      actionColor = 'text-amber-500 bg-amber-50 dark:text-amber-450 dark:bg-amber-950/20';
                    } else if (tx.action === 'count') {
                      actionIcon = <ClipboardList className="h-3.5 w-3.5" />;
                      actionColor = 'text-violet-500 bg-violet-50 dark:text-violet-450 dark:bg-violet-950/20';
                    }

                    // Date formatting
                    const timeStr = tx.created_at ? new Date(tx.created_at).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
                    }) : '';

                    // Qty colors
                    const isPositive = tx.qty_change > 0;
                    const isNegative = tx.qty_change < 0;

                    return (
                      <tr key={tx.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/15 border-b border-zinc-150/30 dark:border-zinc-850/30 last:border-b-0">
                        <td className="py-3 px-3 font-mono text-zinc-400 dark:text-zinc-500 whitespace-nowrap">{timeStr}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider ${actionColor}`}>
                            {actionIcon}
                            {tx.action.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-zinc-750 dark:text-zinc-300">{tx.reference_no}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[150px]">{tx.product_name}</div>
                          <span className="font-mono text-[8px] text-zinc-450 font-bold block mt-0.5">SKU: {tx.sku}</span>
                        </td>
                        <td className="py-3 px-3 text-zinc-650 dark:text-zinc-350 font-semibold">{tx.warehouse_name}</td>
                        <td className="py-3 px-3 text-right font-mono text-zinc-500">{tx.qty_before}</td>
                        <td className={`py-3 px-3 text-right font-mono font-black ${isPositive ? 'text-emerald-500' : isNegative ? 'text-rose-500' : 'text-zinc-600'}`}>
                          {isPositive ? `+${tx.qty_change}` : tx.qty_change}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-zinc-800 dark:text-zinc-150">{tx.qty_after}</td>
                        <td className={`py-3 px-3 text-right font-mono font-bold ${tx.value_change > 0 ? 'text-emerald-500' : tx.value_change < 0 ? 'text-rose-500' : 'text-zinc-650'}`}>
                          {tx.value_change > 0 ? `+$${tx.value_change.toLocaleString()}` : tx.value_change < 0 ? `-$${Math.abs(tx.value_change).toLocaleString()}` : '$0.00'}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-zinc-400" />
                            <span className="font-semibold text-zinc-650 dark:text-zinc-400">{tx.performer_name || 'Charlie Stock'}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination buttons */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-zinc-200/50 dark:border-zinc-800 mt-4">
              <span className="text-zinc-450 font-medium">
                {t('Showing page')} <strong>{currentPage}</strong> {t('of')} <strong>{totalPages}</strong> ({totalCount} {t('logs')})
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-450 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  {t('Previous')}
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-450 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  {t('Next')}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </PermissionGuard>
  );
}
