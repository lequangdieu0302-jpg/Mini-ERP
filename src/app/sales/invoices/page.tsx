'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { 
  FileText, Check, DollarSign, Search, ArrowLeftRight, 
  ChevronRight, Calendar, User, X
} from 'lucide-react';
import { Invoice } from '@/types/erp';

export default function Invoices() {
  const { invoices, customers, salesOrders, t } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Local mutable state for demonstration interaction!
  const [localInvoices, setLocalInvoices] = useState<Invoice[]>(invoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payMethod, setPayMethod] = useState<'cash' | 'bank' | 'check'>('bank');
  const [payAmount, setPayAmount] = useState('');

  // Sync state if context updates
  React.useEffect(() => {
    setLocalInvoices(invoices);
  }, [invoices]);

  const handlePost = (id: string) => {
    setLocalInvoices(prev => 
      prev.map(inv => inv.id === id ? { ...inv, status: 'posted' } : inv)
    );
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    setLocalInvoices(prev => 
      prev.map(inv => inv.id === selectedInvoice.id ? { ...inv, status: 'paid' } : inv)
    );
    setSelectedInvoice(null);
  };

  const filteredInvoices = localInvoices.filter(inv => {
    const cust = customers.find(c => c.id === inv.customer_id);
    return inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (cust && cust.name.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <PermissionGuard module="sales">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto min-h-screen text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{t("Customer Invoices")}</h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t("Manage accounts receivables, billing posts, and payments registration.")}</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-48">
          <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
          <input 
            type="text" 
            placeholder={t("Search invoices...")} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="saas-input pl-8"
          />
        </div>
      </div>

      {/* Table list */}
      <div className="saas-card overflow-hidden">
        <table className="saas-table">
          <thead>
            <tr>
              <th>{t("Invoice Number")}</th>
              <th>{t("Billing Date")}</th>
              <th>{t("Customer")}</th>
              <th>{t("Status")}</th>
              <th className="text-right">{t("Total Amount")}</th>
              <th className="text-right">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => {
              const cust = customers.find(c => c.id === inv.customer_id);
              return (
                <tr key={inv.id}>
                  <td className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-zinc-400 dark:text-zinc-550 shrink-0" />
                    {inv.number}
                  </td>
                  <td suppressHydrationWarning className="font-medium text-zinc-500">
                    {new Date(inv.date).toLocaleDateString()}
                  </td>
                  <td className="font-semibold text-zinc-750 dark:text-zinc-350">
                    {cust?.name || 'Unknown Partner'}
                  </td>
                  <td>
                    {inv.status === 'draft' ? (
                      <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-zinc-100 text-zinc-650 dark:bg-zinc-800/50 dark:text-zinc-400">
                        {t("Draft")}
                      </span>
                    ) : inv.status === 'posted' ? (
                      <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-955/20 dark:text-indigo-400 border border-indigo-250/20 dark:border-indigo-900/30 animate-pulse">
                        {t("Posted")}
                      </span>
                    ) : (
                      <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-955/20 dark:text-emerald-400 border border-emerald-250/20 dark:border-emerald-900/30">
                        {t("Paid")}
                      </span>
                    )}
                  </td>
                  <td suppressHydrationWarning className="text-right font-bold text-zinc-900 dark:text-zinc-200">
                    ${inv.amount_total.toLocaleString()}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {inv.status === 'draft' && (
                        <button
                          onClick={() => handlePost(inv.id)}
                          className="saas-button-primary h-7 text-[11px] px-2.5"
                        >
                          {t("Post Journal")}
                        </button>
                      )}
                      {inv.status === 'posted' && (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPayAmount(String(inv.amount_total));
                          }}
                          className="saas-button-primary bg-emerald-600 hover:bg-emerald-500 h-7 text-[11px] px-2.5"
                        >
                          {t("Register Payment")}
                        </button>
                      )}
                      {inv.status === 'paid' && (
                        <span className="text-[10px] text-zinc-400 font-medium">{t("Reconciled")}</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* REGISTER PAYMENT MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form 
            onSubmit={handlePayment}
            className="w-full max-w-sm saas-card p-6 space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                {t("Register Payment")}
              </h3>
              <button 
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="text-zinc-400 hover:text-zinc-650"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("Invoice Reference")}</label>
                <input 
                  type="text" 
                  disabled 
                  value={selectedInvoice.number}
                  className="saas-input bg-zinc-50 dark:bg-zinc-900/50 text-zinc-450 dark:text-zinc-550 border-dashed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("Payment Method *")}</label>
                <select
                  required
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="saas-input"
                >
                  <option value="bank">{t("Bank Wire Transfer Account")}</option>
                  <option value="cash">{t("Petty Cash Operational Account")}</option>
                  <option value="check">{t("Client Check Deposit")}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("Amount Paid ($) *")}</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="saas-input"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <button 
                type="button" 
                onClick={() => setSelectedInvoice(null)}
                className="saas-button-secondary"
              >
                {t("Cancel")}
              </button>
              <button 
                type="submit"
                className="saas-button-primary bg-emerald-600 hover:bg-emerald-500"
              >
                {t("Save Payment")}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
    </PermissionGuard>
  );
}

