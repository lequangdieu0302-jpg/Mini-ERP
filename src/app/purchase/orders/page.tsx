'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { 
  ShoppingCart, Search, Check, Calendar, ArrowLeftRight,
  TrendingUp, Users, CheckSquare
} from 'lucide-react';
import { PurchaseOrder } from '@/types/erp';

export default function PurchaseOrders() {
  const { vendors, t } = useERP();
  
  // Local mutable state for demonstration interaction!
  const [orders, setOrders] = useState<PurchaseOrder[]>([
    { id: 'po1', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', vendor_id: 'v1', date: '2026-06-12', status: 'purchase', amount_total: 8500, created_at: '2026-06-12T12:00:00Z' },
    { id: 'po2', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', vendor_id: 'v2', date: '2026-06-14', status: 'draft', amount_total: 2200, created_at: '2026-06-14T09:00:00Z' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const handleConfirm = (id: string) => {
    setOrders(prev =>
      prev.map(ord => ord.id === id ? { ...ord, status: 'purchase' } : ord)
    );
  };

  const filteredOrders = orders.filter(ord => {
    const ven = vendors.find(v => v.id === ord.vendor_id);
    return (ven && ven.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
           ord.status.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <PermissionGuard module="purchase">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto min-h-screen text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-555 tracking-tight">{t("RFQ & Purchase Orders (PO)")}</h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t("Track Request for Quotations (RFQs), verify bids, and release purchase orders.")}</p>
        </div>

        {/* Search */}
        <div className="relative w-48">
          <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
          <input 
            type="text" 
            placeholder={t("Search orders...")} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="saas-input pl-8"
          />
        </div>
      </div>

      {/* Table grid */}
      <div className="saas-card overflow-hidden">
        <table className="saas-table">
          <thead>
            <tr>
              <th>{t("PO Reference")}</th>
              <th>{t("Order Date")}</th>
              <th>{t("Vendor Partner")}</th>
              <th>{t("Status")}</th>
              <th className="text-right">{t("Total Amount")}</th>
              <th className="text-right">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((ord) => {
              const ven = vendors.find(v => v.id === ord.vendor_id);
              return (
                <tr key={ord.id}>
                  <td className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <ShoppingCart className="h-4 w-4 text-zinc-400 dark:text-zinc-550 shrink-0" />
                    <span className="font-mono">PO-{ord.id.toUpperCase()}</span>
                  </td>
                  <td suppressHydrationWarning className="font-medium text-zinc-500">
                    {new Date(ord.date).toLocaleDateString()}
                  </td>
                  <td className="font-semibold text-zinc-750 dark:text-zinc-350">
                    {ven?.name || 'Unknown Vendor'}
                  </td>
                  <td>
                    {ord.status === 'draft' ? (
                      <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-zinc-100 text-zinc-650 dark:bg-zinc-800/50 dark:text-zinc-400">
                        {t("RFQ Draft")}
                      </span>
                    ) : (
                      <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-250/20 dark:border-indigo-900/30">
                        {t("PO Confirmed")}
                      </span>
                    )}
                  </td>
                  <td suppressHydrationWarning className="text-right font-bold text-zinc-900 dark:text-zinc-200">
                    ${ord.amount_total.toLocaleString()}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {ord.status === 'draft' ? (
                        <button
                          onClick={() => handleConfirm(ord.id)}
                          className="saas-button-primary h-7 text-[11px] px-2.5"
                        >
                          {t("Confirm Order")}
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> {t("Stocks Received")}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
    </PermissionGuard>
  );
}

