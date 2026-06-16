'use client';

import React, { useState } from 'react';
import { PermissionGuard } from '@/components/permission-guard';
import { useERP } from '@/context/erp-context';
import { useWMSState } from '@/hooks/use-wms-state';
import { BatchLot } from '@/types/erp';
import {
  Search, ShieldAlert, Calendar, AlertTriangle, Info,
  ChevronDown, ChevronUp, History, Package, ClipboardCheck
} from 'lucide-react';

export default function BatchSerialTracking() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { t } = useERP();
  const { batches, products, warehouses, receipts, issues } = useWMSState();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  // Expiry date checker reference date: 2026-06-15
  const refDate = new Date('2026-06-15');
  const ninetyDaysFromRef = new Date('2026-09-13');

  // Filter batches
  const filteredBatches = batches.filter(b => {
    const matchesSearch = (b.batch_no && b.batch_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (b.serial_no && b.serial_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (b.product_name && b.product_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (!mounted) return null;

  return (
    <PermissionGuard module="inventory">
      <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto min-h-screen text-xs select-none">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-550 tracking-tight">
              {t('Batch/Lot & Serial Number Tracking Control')}
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-450 mt-1">
              {t('Track individual product batches, expiration dates, shelf life warnings, and serial number history.')}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-850">
          
          {/* Status buttons */}
          <div className="flex gap-1 overflow-x-auto">
            {['All', 'Available', 'Reserved', 'Expired', 'Consumed'].map((status) => (
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
              placeholder={t('Search by batch, serial, product...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-md pl-8 pr-3 py-1.5 outline-none text-zinc-855 dark:text-zinc-200"
            />
          </div>

        </div>

        {/* Data Table */}
        <div className="saas-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-450 dark:text-zinc-550 border-b border-zinc-250/20 dark:border-zinc-800/50 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-6"></th>
                  <th className="py-3 px-3">{t('Batch / Lot No')}</th>
                  <th className="py-3 px-3">{t('Serial No')}</th>
                  <th className="py-3 px-3">{t('Audited Material SKU')}</th>
                  <th className="py-3 px-3 font-mono">{t('Mfg Date')}</th>
                  <th className="py-3 px-3 font-mono">{t('Expiry Date')}</th>
                  <th className="py-3 px-3">{t('Depot')}</th>
                  <th className="py-3 px-3 text-right font-mono">{t('On Hand Qty')}</th>
                  <th className="py-3 px-3 text-center">{t('Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-850/40">
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-zinc-450 bg-zinc-50/10 dark:bg-zinc-900/5">
                      {t('No active batch or serial logs found.')}
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((b) => {
                    const isExpanded = expandedBatchId === b.id;
                    const warehouse = warehouses.find(w => w.id === b.warehouse_id);

                    // Expiry alert checks
                    let expTextClass = 'text-zinc-700 dark:text-zinc-300';
                    let isExpired = false;
                    let isNearExpiry = false;

                    if (b.expiry_date) {
                      const exp = new Date(b.expiry_date);
                      if (exp < refDate) {
                        isExpired = true;
                        expTextClass = 'text-red-500 font-extrabold flex items-center gap-1';
                      } else if (exp <= ninetyDaysFromRef) {
                        isNearExpiry = true;
                        expTextClass = 'text-amber-500 font-bold flex items-center gap-1';
                      }
                    }

                    // Status style
                    let statusColor = 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-450';
                    if (b.status === 'available') statusColor = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
                    else if (b.status === 'reserved') statusColor = 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400';
                    else if (b.status === 'expired') statusColor = 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-455';
                    else if (b.status === 'consumed') statusColor = 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';

                    // Find transaction logs referencing this batch
                    const matchedReceipts = receipts.filter(r => r.lines.some(l => l.batch_no === b.batch_no));
                    const matchedIssues = issues.filter(i => i.lines.some(l => l.batch_no === b.batch_no));

                    return (
                      <React.Fragment key={b.id}>
                        <tr 
                          onClick={() => setExpandedBatchId(isExpanded ? null : b.id)}
                          className={`hover:bg-zinc-50/30 dark:hover:bg-zinc-900/15 transition-colors cursor-pointer ${isExpanded ? 'bg-zinc-50/20 dark:bg-zinc-900/5' : ''}`}
                        >
                          <td className="py-3.5 px-4">
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-zinc-450" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-450" />}
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-zinc-850 dark:text-zinc-50">{b.batch_no || '—'}</td>
                          <td className="py-3.5 px-3 font-mono text-zinc-650 dark:text-zinc-350">{b.serial_no || '—'}</td>
                          <td className="py-3.5 px-3 font-bold text-zinc-805 dark:text-zinc-200">
                            <div>{b.product_name}</div>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-zinc-500">{b.manufacture_date || '—'}</td>
                          <td className="py-3.5 px-3 font-mono">
                            <span className={expTextClass}>
                              {isExpired && <AlertTriangle className="h-3.5 w-3.5 animate-pulse text-red-500" />}
                              {isNearExpiry && <Info className="h-3.5 w-3.5 text-amber-500" />}
                              {b.expiry_date || '—'}
                              {isExpired && <span className="text-[7.5px] uppercase tracking-wide block font-extrabold ml-1">({t('Expired')})</span>}
                              {isNearExpiry && <span className="text-[7.5px] uppercase tracking-wide block font-bold ml-1">({t('< 90d')})</span>}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-zinc-700 dark:text-zinc-300 font-semibold">{warehouse ? warehouse.name : t('Dry Storage')}</td>
                          <td className="py-3.5 px-3 text-right font-mono font-bold text-zinc-800 dark:text-zinc-200">{b.qty}</td>
                          <td className="py-3.5 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${statusColor}`}>
                              {t(b.status)}
                            </span>
                          </td>
                        </tr>

                        {/* Expandable traceability section */}
                        {isExpanded && (
                          <tr className="bg-zinc-50/20 dark:bg-zinc-900/5">
                            <td colSpan={9} className="py-4 px-8 border-t border-b border-zinc-200/50 dark:border-zinc-850/50">
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{t('Material Traceability Chain Ledger')}</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  
                                  {/* Receipt log */}
                                  <div className="space-y-2">
                                    <h5 className="font-bold text-zinc-700 dark:text-zinc-350 flex items-center gap-1.5">
                                      <Package className="h-4 w-4 text-emerald-500" />
                                      {t('Inbound Sourcing History')}
                                    </h5>
                                    {matchedReceipts.length === 0 ? (
                                      <p className="text-[10px] text-zinc-450 italic">{t('No initial goods receipt note references found.')}</p>
                                    ) : (
                                      matchedReceipts.map(r => (
                                        <div key={r.id} className="p-2 border border-zinc-200/50 dark:border-zinc-850 bg-white dark:bg-zinc-955 rounded-lg space-y-1 font-mono text-[9px]">
                                          <div className="flex justify-between font-bold">
                                            <span className="text-zinc-800 dark:text-zinc-200">{r.receipt_no}</span>
                                            <span>{r.date}</span>
                                          </div>
                                          <div className="flex justify-between text-zinc-500">
                                            <span>Supplier: {r.supplier_name}</span>
                                            <span className="font-bold text-emerald-500">+{r.lines.find(l => l.batch_no === b.batch_no)?.qty} units</span>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>

                                  {/* Issue log */}
                                  <div className="space-y-2">
                                    <h5 className="font-bold text-zinc-700 dark:text-zinc-350 flex items-center gap-1.5">
                                      <History className="h-4 w-4 text-rose-500" />
                                      {t('Outbound Allocation History')}
                                    </h5>
                                    {matchedIssues.length === 0 ? (
                                      <p className="text-[10px] text-zinc-450 italic">{t('No stock-out or issue slips reference this batch.')}</p>
                                    ) : (
                                      matchedIssues.map(i => (
                                        <div key={i.id} className="p-2 border border-zinc-200/50 dark:border-zinc-850 bg-white dark:bg-zinc-955 rounded-lg space-y-1 font-mono text-[9px]">
                                          <div className="flex justify-between font-bold">
                                            <span className="text-zinc-800 dark:text-zinc-200">{i.issue_no}</span>
                                            <span>{i.date}</span>
                                          </div>
                                          <div className="flex justify-between text-zinc-500">
                                            <span>Customer/Dept: {i.customer_name}</span>
                                            <span className="font-bold text-rose-500">-{i.lines.find(l => l.batch_no === b.batch_no)?.qty_issued} units</span>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>

                                </div>
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

      </div>
    </PermissionGuard>
  );
}
