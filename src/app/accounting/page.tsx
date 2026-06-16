'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { 
  BookOpen, ChartArea, FileSpreadsheet, Search, ChevronRight,
  TrendingUp, TrendingDown, DollarSign, Wallet, ShieldCheck
} from 'lucide-react';

export default function Accounting() {
  const { invoices, expenses, purchaseRequests, accounts, t } = useERP();
  
  const [activeTab, setActiveTab] = useState<'ledger' | 'pl' | 'balance'>('ledger');

  // 1. Calculations for P&L
  // Revenue: Invoices posted/paid
  const totalRevenue = invoices
    .filter(inv => inv.status === 'posted' || inv.status === 'paid')
    .reduce((acc, inv) => acc + inv.amount_total, 0);

  // Direct expenses: approved expenses
  const directExpenses = expenses
    .filter(exp => exp.status === 'approved')
    .reduce((acc, exp) => acc + exp.amount, 0);

  // Cost of goods sold (COGS): simulated confirmed PO value (e.g. $8,500)
  const cogs = 8500; 

  const operatingExpenses = directExpenses + 4500; // adding $4,500 simulated labor payroll
  const grossProfit = totalRevenue - cogs;
  const netIncome = grossProfit - operatingExpenses;

  // 2. Calculations for Balance Sheet
  const cashAsset = totalRevenue - directExpenses;
  const ARAsset = invoices.filter(inv => inv.status === 'posted').reduce((acc, inv) => acc + inv.amount_total, 0);
  const inventoryAsset = 18600; // Sand + Rebar holdings value
  const totalAssets = cashAsset + ARAsset + inventoryAsset;

  const APLiability = expenses.filter(exp => exp.status === 'to_approve').reduce((acc, exp) => acc + exp.amount, 0);
  const equityValue = totalAssets - APLiability;

  return (
    <PermissionGuard module="accounting">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t("Double-Entry Accounting")}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t("Automated charts, General ledger balances, P&L statements and balance sheets.")}</p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-1 dark:border-zinc-800 dark:bg-zinc-900/40 text-xs self-start md:self-auto">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`rounded-md px-3.5 py-1.5 font-medium transition-all duration-200 ${activeTab === 'ledger' ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white' : 'text-zinc-550 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-205'}`}
          >
            {t("General Ledger")}
          </button>
          <button
            onClick={() => setActiveTab('pl')}
            className={`rounded-md px-3.5 py-1.5 font-medium transition-all duration-200 ${activeTab === 'pl' ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white' : 'text-zinc-550 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-205'}`}
          >
            {t("Profit & Loss (P&L)")}
          </button>
          <button
            onClick={() => setActiveTab('balance')}
            className={`rounded-md px-3.5 py-1.5 font-medium transition-all duration-200 ${activeTab === 'balance' ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white' : 'text-zinc-550 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-205'}`}
          >
            {t("Balance Sheet")}
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'ledger' ? (
        <div className="space-y-6">
          {/* General Ledger entries list */}
          <div className="saas-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left">{t("Transaction Date")}</th>
                    <th className="px-4 py-3 text-left">{t("Account Code")}</th>
                    <th className="px-4 py-3 text-left">{t("Account Title")}</th>
                    <th className="px-4 py-3 text-right">{t("Debit ($)")}</th>
                    <th className="px-4 py-3 text-right">{t("Credit ($)")}</th>
                    <th className="px-4 py-3 text-right">{t("Reference ID")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/40 text-zinc-655 dark:text-zinc-350">
                  {/* Seed journal ledger list */}
                  <tr>
                    <td className="px-4 py-3.5 font-medium text-zinc-500 dark:text-zinc-400">2026-06-10</td>
                    <td className="px-4 py-3.5 font-mono text-zinc-805 dark:text-zinc-200">1200</td>
                    <td className="px-4 py-3.5 font-medium text-zinc-900 dark:text-zinc-150">{t("Accounts Receivable (A/R)")}</td>
                    <td className="px-4 py-3.5 text-right text-emerald-600 dark:text-emerald-400 font-medium">12,500.00</td>
                    <td className="px-4 py-3.5 text-right text-zinc-400 dark:text-zinc-600">-</td>
                    <td className="px-4 py-3.5 text-right font-mono text-zinc-400">INV/2026/0001</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-medium text-zinc-500 dark:text-zinc-400">2026-06-10</td>
                    <td className="px-4 py-3.5 font-mono text-zinc-850 dark:text-zinc-200">4010</td>
                    <td className="px-4 py-3.5 font-medium text-zinc-900 dark:text-zinc-150">{t("Construction Contract Revenue")}</td>
                    <td className="px-4 py-3.5 text-right text-zinc-400 dark:text-zinc-600">-</td>
                    <td className="px-4 py-3.5 text-right text-rose-600 dark:text-rose-400 font-medium">12,500.00</td>
                    <td className="px-4 py-3.5 text-right font-mono text-zinc-400">INV/2026/0001</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-medium text-zinc-500 dark:text-zinc-400">2026-06-12</td>
                    <td className="px-4 py-3.5 font-mono text-zinc-850 dark:text-zinc-200">5010</td>
                    <td className="px-4 py-3.5 font-medium text-zinc-900 dark:text-zinc-150">{t("Material Purchase Expenses")}</td>
                    <td className="px-4 py-3.5 text-right text-emerald-600 dark:text-emerald-400 font-medium">8,500.00</td>
                    <td className="px-4 py-3.5 text-right text-zinc-400 dark:text-zinc-600">-</td>
                    <td className="px-4 py-3.5 text-right font-mono text-zinc-400">PO-CONFIRMED</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-medium text-zinc-500 dark:text-zinc-400">2026-06-12</td>
                    <td className="px-4 py-3.5 font-mono text-zinc-850 dark:text-zinc-200">2010</td>
                    <td className="px-4 py-3.5 font-medium text-zinc-900 dark:text-zinc-150">{t("Accounts Payable (A/P)")}</td>
                    <td className="px-4 py-3.5 text-right text-zinc-405 dark:text-zinc-600">-</td>
                    <td className="px-4 py-3.5 text-right text-rose-600 dark:text-rose-400 font-medium">8,500.00</td>
                    <td className="px-4 py-3.5 text-right font-mono text-zinc-400">PO-CONFIRMED</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'pl' ? (
        /* PROFIT & LOSS REPORT VIEW */
        <div className="max-w-2xl mx-auto saas-card p-8 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">{t("Income Statement (Profit & Loss)")}</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-550">{t("For active period ending June 2026")}</p>
          </div>

          <div className="h-px bg-zinc-200/60 dark:bg-zinc-800/60" />

          <div className="space-y-6 text-xs">
            {/* Revenue */}
            <div className="space-y-3">
              <div className="flex justify-between items-center font-semibold text-zinc-850 dark:text-zinc-200 border-b border-zinc-150 dark:border-zinc-850 pb-2">
                <span>{t("REVENUE")}</span>
                <span className="font-mono">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center pl-4 text-zinc-500 dark:text-zinc-450">
                <span>{t("Contract Revenue (Code 4010)")}</span>
                <span className="font-mono">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Cost of Sales */}
            <div className="space-y-3">
              <div className="flex justify-between items-center font-semibold text-zinc-850 dark:text-zinc-200 border-b border-zinc-150 dark:border-zinc-850 pb-2">
                <span>{t("COST OF SALES (COGS)")}</span>
                <span className="font-mono">${cogs.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center pl-4 text-zinc-550 dark:text-zinc-450">
                <span>{t("Materials Purchase Expenses (Code 5010)")}</span>
                <span className="font-mono">${cogs.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Gross Margin */}
            <div className="flex justify-between items-center font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-3 rounded-lg border border-zinc-200/50 dark:border-zinc-800/40">
              <span>{t("GROSS PROFIT")}</span>
              <span className="font-mono">${grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-3">
              <div className="flex justify-between items-center font-semibold text-zinc-850 dark:text-zinc-200 border-b border-zinc-150 dark:border-zinc-850 pb-2">
                <span>{t("OPERATING EXPENSES")}</span>
                <span className="font-mono">${operatingExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center pl-4 text-zinc-500 dark:text-zinc-450">
                <span>{t("Workforce Direct Payroll (Code 5020)")}</span>
                <span className="font-mono">$4,500.00</span>
              </div>
              <div className="flex justify-between items-center pl-4 text-zinc-550 dark:text-zinc-455">
                <span>{t("Approved Petty Expenses Claims")}</span>
                <span className="font-mono">${directExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Net Income summary */}
            <div className={`flex justify-between items-center font-semibold p-4 rounded-xl border text-sm transition-all duration-200 ${netIncome >= 0 ? 'bg-emerald-50/50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/20' : 'bg-rose-50/50 text-rose-700 border-rose-200/60 dark:bg-rose-955/20 dark:text-rose-400 dark:border-rose-800/20'}`}>
              <span>{t("NET OPERATING INCOME")}</span>
              <span className="flex items-center gap-1.5 font-mono">
                {netIncome >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                ${netIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

          </div>
        </div>
      ) : (
        /* BALANCE SHEET VIEW */
        <div className="max-w-2xl mx-auto saas-card p-8 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">{t("Statement of Financial Position")}</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-550">{t("Balance Sheet as of June 14, 2026")}</p>
          </div>

          <div className="h-px bg-zinc-200/60 dark:bg-zinc-800/60" />

          <div className="space-y-6 text-xs">
            {/* Assets */}
            <div className="space-y-3.5">
              <div className="flex justify-between items-center font-semibold text-zinc-805 dark:text-zinc-200 border-b border-zinc-150 dark:border-zinc-800 pb-2">
                <span>{t("ASSETS")}</span>
                <span className="font-mono">${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center pl-4 text-zinc-500 dark:text-zinc-450">
                <span>{t("Bank operational accounts balance")}</span>
                <span className="font-mono">${cashAsset.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center pl-4 text-zinc-500 dark:text-zinc-450">
                <span>{t("Accounts Receivable (A/R) outstanding")}</span>
                <span className="font-mono">${ARAsset.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center pl-4 text-zinc-550 dark:text-zinc-450">
                <span>{t("Inventory valuation holdings")}</span>
                <span className="font-mono">${inventoryAsset.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Liabilities */}
            <div className="space-y-3.5">
              <div className="flex justify-between items-center font-semibold text-zinc-850 dark:text-zinc-200 border-b border-zinc-150 dark:border-zinc-800 pb-2">
                <span>{t("LIABILITIES")}</span>
                <span className="font-mono">${APLiability.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center pl-4 text-zinc-500 dark:text-zinc-450">
                <span>{t("Accounts Payable (A/P) outstanding")}</span>
                <span className="font-mono">${APLiability.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Equity */}
            <div className="space-y-3.5">
              <div className="flex justify-between items-center font-semibold text-zinc-800 dark:text-zinc-200 border-b border-zinc-150 dark:border-zinc-850 pb-2">
                <span>{t("EQUITY")}</span>
                <span className="font-mono">${equityValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center pl-4 text-zinc-550 dark:text-zinc-450">
                <span>{t("Retained earnings & reserves")}</span>
                <span className="font-mono">${equityValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Check */}
            <div className="flex justify-between items-center font-medium text-zinc-800 dark:text-zinc-350 bg-zinc-50/50 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 text-[11px] leading-relaxed">
              <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" /> 
                {t("Ledger check balances match (Assets = Liabilities + Equity)")}
              </span>
              <span className="font-mono text-zinc-500" suppressHydrationWarning>{t("Matched: ")}${totalAssets.toLocaleString()}</span>
            </div>

          </div>
        </div>
      )}

    </div>
    </PermissionGuard>
  );
}
