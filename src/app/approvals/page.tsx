'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { 
  CheckSquare, Check, X, Search, Calendar, 
  MessageSquare, User, Tag, ShieldAlert
} from 'lucide-react';
import { Approval } from '@/types/erp';

export default function Approvals() {
  const { approvals, updateApproval, purchaseRequests, expenses, users, t } = useERP();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Comment drawer/dialog state
  const [selectedAppr, setSelectedAppr] = useState<Approval | null>(null);
  const [comment, setComment] = useState('');
  const [rejectMode, setRejectMode] = useState(false);

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    updateApproval(id, status, comment);
    setSelectedAppr(null);
    setComment('');
  };

  const getDocDetails = (appr: Approval) => {
    if (appr.type === 'expense') {
      const exp = expenses.find(e => e.id === appr.document_id);
      return exp ? `${t("Expense Claim")}: "${exp.description}" ${t("for")} $${exp.amount}` : t('Expense Claim Details');
    } else if (appr.type === 'material_request') {
      const pr = purchaseRequests.find(p => p.id === appr.document_id);
      return pr ? `${t("Material Request")}: "${pr.notes}"` : t('Material Purchase Details');
    }
    return t('Document details');
  };

  const getRequesterName = (appr: Approval) => {
    let uid = '';
    if (appr.type === 'expense') {
      const exp = expenses.find(e => e.id === appr.document_id);
      uid = 'u6'; // Dave Engineer (emp1 user)
    } else if (appr.type === 'material_request') {
      const pr = purchaseRequests.find(p => p.id === appr.document_id);
      uid = pr?.requested_by || '';
    }
    const u = users.find(usr => usr.id === uid);
    return u ? u.full_name : t('Team Member');
  };

  const filteredApprovals = approvals.filter(appr => 
    appr.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appr.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PermissionGuard module="approvals">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="pb-6 border-b border-zinc-200/60 dark:border-zinc-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t("Enterprise Approvals")}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t("Approve or reject purchase orders, leave requests, overtime approvals, and expense statements.")}</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400 dark:text-zinc-550" />
          <input 
            type="text" 
            placeholder={t("Filter by status or type...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="saas-input pl-9"
          />
        </div>
      </div>

      {/* Grid list of approval files */}
      {filteredApprovals.length === 0 ? (
        <div className="saas-card p-12 text-center flex flex-col items-center justify-center">
          <CheckSquare className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
          <p className="text-xs font-medium text-zinc-400">{t("No approvals pending your review.")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredApprovals.map((appr) => {
            const requester = getRequesterName(appr);
            const details = getDocDetails(appr);

            return (
              <div key={appr.id} className="saas-card p-6 flex flex-col justify-between gap-4">
                
                <div className="flex justify-between items-start gap-3">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center rounded-md bg-indigo-50/65 px-2.5 py-0.5 text-[10px] font-bold text-indigo-750 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-800/20 uppercase tracking-wider">
                      {t(appr.type.replace('_', ' '))}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-450 dark:text-zinc-505 font-semibold">
                      <Calendar className="h-3.5 w-3.5" />
                      <span suppressHydrationWarning>{t("Submitted: ")}{new Date(appr.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {appr.status === 'pending' ? (
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-705 border border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 animate-pulse">
                      {t("Pending")}
                    </span>
                  ) : appr.status === 'approved' ? (
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-450 dark:border-emerald-900/20">
                      {t("Approved")}
                    </span>
                  ) : (
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-955/20 dark:text-rose-400 dark:border-rose-900/20">
                      {t("Rejected")}
                    </span>
                  )}
                </div>

                {/* Scope details */}
                <div className="text-xs text-zinc-700 dark:text-zinc-300 font-medium bg-zinc-50/50 dark:bg-zinc-900/20 p-4 rounded-xl border border-zinc-200/30 dark:border-zinc-800/10 leading-relaxed">
                  {details}
                </div>

                {appr.comment && (
                  <p className="text-[11px] text-zinc-450 dark:text-zinc-500 italic flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-zinc-400 shrink-0" /> 
                    <span>{t("Comments: ")}&ldquo;{appr.comment}&rdquo;</span>
                  </p>
                )}

                {/* Action operations and Requester info */}
                <div className="pt-4 border-t border-zinc-150 dark:border-zinc-850 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-450 dark:text-zinc-500 font-medium">
                    <User className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{t("Requester: ")}<strong className="text-zinc-700 dark:text-zinc-300">{requester}</strong></span>
                  </div>

                  {appr.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedAppr(appr); setRejectMode(true); }}
                        className="h-8 rounded-lg bg-zinc-50 hover:bg-rose-50 border border-zinc-250 dark:bg-zinc-900 dark:hover:bg-rose-950/20 text-zinc-700 dark:text-zinc-350 dark:border-zinc-800 dark:hover:border-rose-900 hover:text-rose-600 dark:hover:text-rose-400 px-3 font-medium flex items-center gap-1 text-[11px] transition-all cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" /> {t("Reject")}
                      </button>
                      <button
                        onClick={() => { setSelectedAppr(appr); setRejectMode(false); }}
                        className="h-8 rounded-lg bg-indigo-600 hover:bg-indigo-505 text-white px-3 font-medium flex items-center gap-1 text-[11px] transition-all cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" /> {t("Approve")}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRMATION DRAWERS MODAL */}
      {selectedAppr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200/80 bg-white p-6 shadow-2xl dark:border-zinc-800/80 dark:bg-zinc-950 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-900 pb-2">
              {rejectMode ? t('Reject Approval Claim') : t('Approve Claim Statement')}
            </h3>
            
            <div className="text-xs space-y-3">
              <div className="space-y-1.5">
                <label className="font-medium text-zinc-500 dark:text-zinc-400">{t("Approval Comments / Audit remarks")}</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t("Specify review remarks...")}
                  className="w-full rounded-lg border border-zinc-200 p-2.5 outline-none focus:border-indigo-500 dark:border-zinc-850 dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setSelectedAppr(null)}
                className="saas-button-secondary px-4 h-9"
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                onClick={() => handleAction(selectedAppr.id, rejectMode ? 'rejected' : 'approved')}
                className={`saas-button-primary px-5 h-9 ${rejectMode ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
              >
                {rejectMode ? t('Reject') : t('Approve')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </PermissionGuard>
  );
}
