'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { 
  Plus, Receipt, Check, Search, Calendar, 
  Trash2, DollarSign, FileImage, ShieldAlert, X
} from 'lucide-react';
import { Expense } from '@/types/erp';

export default function Expenses() {
  const { expenses, addExpense, t } = useERP();
  
  const [isAdding, setIsAdding] = useState(false);
  const [category, setCategory] = useState<'travel' | 'meals' | 'tools' | 'fuel' | 'other'>('tools');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [receiptName, setReceiptName] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    addExpense({
      category,
      amount: Number(amount),
      description: desc,
      receipt_url: receiptName || 'receipt-scanned.jpg'
    });

    // Reset
    setCategory('tools');
    setAmount('');
    setDesc('');
    setReceiptName('');
    setIsAdding(false);
  };

  const filteredExpenses = expenses.filter(exp => 
    exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PermissionGuard module="expense">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="pb-6 border-b border-zinc-200/60 dark:border-zinc-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t("Expense Claims & Receipts")}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t("Submit petty cash reimbursements, purchase receipts and claim audits.")}</p>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="saas-button-primary inline-flex items-center gap-1.5 self-start md:self-auto"
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span>{isAdding ? t('Close Builder') : t('File Expense Claim')}</span>
        </button>
      </div>

      {/* Add Expense Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="saas-card p-6 space-y-5 max-w-xl animate-in slide-in-from-top-4 duration-200">
          <h3 className="text-sm font-semibold text-zinc-850 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-900 pb-3">
            {t("Draft Expense Statement")}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("Claim Category *")}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="saas-input appearance-none bg-no-repeat bg-right pr-8 bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200/80 dark:border-zinc-800/80 text-zinc-800 dark:text-zinc-200"
              >
                <option value="tools">{t("Construction Tools & Gear")}</option>
                <option value="travel">{t("Travel & Client Lodging")}</option>
                <option value="fuel">{t("Fuel & Truck Refills")}</option>
                <option value="meals">{t("Catering & Site Meals")}</option>
                <option value="other">{t("General Miscellaneous")}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("Total Claim Amount ($) *")}</label>
              <input 
                type="number" 
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t("Total sum claimed")}
                className="saas-input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("Purchase Description *")}</label>
            <input 
              type="text" 
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. Purchased masonry drills at Home Depot Queens depot"
              className="saas-input"
            />
          </div>

          {/* Receipt Upload area */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("Scan & Upload Receipt")}</label>
            <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50/30 dark:bg-zinc-900/10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-50/60 dark:hover:bg-zinc-900/20 transition-all">
              <FileImage className="h-8 w-8 text-zinc-400 dark:text-zinc-550 mb-2" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {receiptName ? `${t("Selected: ")}${receiptName}` : t("Click to scan or upload receipt image")}
              </span>
              {/* Simulator trigger */}
              {!receiptName && (
                <button
                  type="button"
                  onClick={() => setReceiptName('receipt-homedepot-scan.jpg')}
                  className="mt-2 text-xs font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-650 transition-colors"
                >
                  {t("Simulate Camera Scan")}
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-850">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="saas-button-secondary px-5"
            >
              {t("Cancel")}
            </button>
            <button 
              type="submit"
              className="saas-button-primary bg-indigo-600 hover:bg-indigo-505 text-white px-5"
            >
              <Check className="h-4 w-4" /> {t("Submit Claim")}
            </button>
          </div>
        </form>
      )}

      {/* Toolbar */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400 dark:text-zinc-555" />
          <input 
            type="text" 
            placeholder={t("Search claims...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="saas-input pl-9"
          />
        </div>
      </div>

      {/* Grid List */}
      {filteredExpenses.length === 0 ? (
        <div className="saas-card p-12 text-center flex flex-col items-center justify-center">
          <Receipt className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
          <p className="text-xs font-medium text-zinc-400">{t("No expense claims match your search filters.")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExpenses.map((exp) => {
            const mappedCategories: Record<string, string> = {
              'tools': 'Construction Tools & Gear',
              'travel': 'Travel & Client Lodging',
              'fuel': 'Fuel & Truck Refills',
              'meals': 'Catering & Site Meals',
              'other': 'General Miscellaneous'
            };
            const visualCategory = mappedCategories[exp.category] || exp.category;

            return (
              <div key={exp.id} className="saas-card p-5 flex flex-col justify-between gap-4">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-450 dark:text-zinc-500 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    <span suppressHydrationWarning>{new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  {exp.status === 'draft' ? (
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/40 dark:border-zinc-700/20">
                      {t("Draft")}
                    </span>
                  ) : exp.status === 'to_approve' ? (
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 animate-pulse">
                      {t("Review Pending")}
                    </span>
                  ) : exp.status === 'approved' ? (
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-450 dark:border-emerald-900/20">
                      {t("Approved")}
                    </span>
                  ) : (
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-955/20 dark:text-rose-455 dark:border-rose-900/20">
                      {t("Rejected")}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-zinc-850 dark:text-zinc-155 leading-relaxed">{exp.description}</h4>
                  <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-bold block uppercase tracking-wider mt-1">
                    {t("Category:")} {t(visualCategory)}
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-150 dark:border-zinc-855 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-0.5 text-zinc-900 font-semibold dark:text-white">
                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-450 shrink-0" />
                    <span className="font-mono text-sm">{exp.amount.toFixed(2)}</span>
                  </div>
                  <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium">
                    {t("Receipt:")} <span className="font-mono text-zinc-750 dark:text-zinc-350">{exp.receipt_url}</span>
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
    </PermissionGuard>
  );
}
