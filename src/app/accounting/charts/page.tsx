'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { BookOpen, Search, CheckCircle2 } from 'lucide-react';

export default function ChartOfAccounts() {
  const { accounts, t } = useERP();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.code.includes(searchTerm)
  );

  return (
    <PermissionGuard module="accounting">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="pb-6 border-b border-zinc-200/60 dark:border-zinc-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t("Chart of Accounts")}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t("Define bookkeeping catalog mappings for Double-Entry Journal statements.")}</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400 dark:text-zinc-550" />
          <input 
            type="text" 
            placeholder={t("Search account codes or names...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="saas-input pl-9"
          />
        </div>
      </div>

      {/* Table catalog */}
      <div className="saas-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left">{t("Account Code")}</th>
                <th className="px-4 py-3 text-left">{t("Account Name")}</th>
                <th className="px-4 py-3 text-left">{t("Classification Type")}</th>
                <th className="px-4 py-3 text-right">{t("Accounting Status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/40 text-zinc-650 dark:text-zinc-350">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-455 dark:text-zinc-500">
                    {t("No accounts found matching your search.")}
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id}>
                    <td className="px-4 py-3.5 font-mono font-semibold text-zinc-905 dark:text-zinc-200">
                      {acc.code}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-zinc-850 dark:text-zinc-150">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-zinc-400 dark:text-zinc-550 shrink-0" />
                        <span>{t(acc.name)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 capitalize text-zinc-505 dark:text-zinc-450 font-medium">
                      {t(acc.type)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {acc.active && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-800/20">
                          <CheckCircle2 className="h-3 w-3 text-emerald-555" /> {t("Active Ledger")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
    </PermissionGuard>
  );
}
