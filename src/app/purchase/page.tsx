'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { 
  Plus, ShoppingBag, Check, Search, Calendar, 
  User, CheckSquare, Clock, ShieldAlert, X
} from 'lucide-react';
import { PurchaseRequest } from '@/types/erp';

export default function PurchaseRequests() {
  const { purchaseRequests, createPurchaseRequest, users, t } = useERP();
  
  const [isAdding, setIsAdding] = useState(false);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    createPurchaseRequest({ notes });
    setNotes('');
    setIsAdding(false);
  };

  const filteredRequests = purchaseRequests.filter(pr => 
    pr.notes && pr.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PermissionGuard module="purchase">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto min-h-screen text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-550 tracking-tight">{t("Purchase Requests (PR)")}</h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t("Submit material demands for project tasks. Requires approval before RFQ generation.")}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative w-48">
            <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
            <input 
              type="text" 
              placeholder={t("Search request logs...")} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="saas-input pl-8"
            />
          </div>

          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="saas-button-primary flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> {t("New Request")}
          </button>
        </div>
      </div>

      {/* Add Request Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="saas-card p-6 space-y-5 max-w-xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t("Draft Material Purchase Request")}</h3>
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-zinc-400 hover:text-zinc-650"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("Specify materials requested & quantity *")}</label>
            <textarea
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("e.g. Need 40 metric tons of steel rebar 16mm and 500 bags of portland cement for foundation concrete casting next week.")}
              className="saas-input h-auto py-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="saas-button-secondary"
            >
              {t("Cancel")}
            </button>
            <button 
              type="submit"
              className="saas-button-primary flex items-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5" /> {t("Submit for Approval")}
            </button>
          </div>
        </form>
      )}

      {/* Requests list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequests.map((pr) => {
          const reqUser = users.find(u => u.id === pr.requested_by);
          return (
            <div key={pr.id} className="saas-card p-5 space-y-4 hover:border-zinc-350 dark:hover:border-zinc-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-zinc-450 dark:text-zinc-550 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  <span suppressHydrationWarning>{new Date(pr.date).toLocaleDateString()}</span>
                </div>

                {pr.status === 'draft' ? (
                  <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-zinc-100 text-zinc-650 dark:bg-zinc-800/50 dark:text-zinc-400 border border-zinc-200/20">
                    {t("Draft")}
                  </span>
                ) : pr.status === 'to_approve' ? (
                  <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-250/20 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900/30 animate-pulse">
                    {t("Pending Approval")}
                  </span>
                ) : pr.status === 'approved' ? (
                  <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-250/20 dark:bg-emerald-955/20 dark:text-emerald-400 dark:border-emerald-900/30">
                    {t("Approved")}
                  </span>
                ) : (
                  <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-250/20 dark:bg-rose-955/20 dark:text-rose-400">
                    {t("Rejected")}
                  </span>
                )}
              </div>

              <div className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                {pr.notes}
              </div>

              <div className="pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-550">
                <div className="flex items-center gap-1.5">
                  {reqUser?.avatar_url && (
                    <img src={reqUser.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                  )}
                  <span>{t("Requested by:")} <strong>{reqUser?.full_name || t('Requester')}</strong></span>
                </div>
                <span className="font-mono">PR-{pr.id.substring(0, 5).toUpperCase()}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
    </PermissionGuard>
  );
}

