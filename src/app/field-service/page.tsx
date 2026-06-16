'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { 
  Plus, Check, Search, Calendar, MapPin, Camera, 
  Trash, ArrowLeftRight, Settings, Users, X
} from 'lucide-react';
import { FieldService } from '@/types/erp';

export default function FieldServices() {
  const { customers, users, t } = useERP();
  
  // Local mutable logs state
  const [visits, setVisits] = useState<FieldService[]>([
    { id: 'fs1', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', assignee_id: 'u6', customer_id: 'd2', date: '2026-06-13', status: 'completed', report_details: 'Inspected structural wall anchors. Before-after tests verify 100% capacity loading.', created_at: '2026-06-13T10:00:00Z' },
    { id: 'fs2', company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', assignee_id: 'u6', customer_id: 'd1', date: '2026-06-14', status: 'in_progress', report_details: 'Drilling rebar slots for anchor dowels.', created_at: '2026-06-14T09:00:00Z' }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [selectedCustId, setSelectedCustId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustId) return;

    const newVisit: FieldService = {
      id: `fs-${Date.now()}`,
      company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1',
      customer_id: selectedCustId,
      assignee_id: assigneeId || undefined,
      date: new Date().toISOString().split('T')[0],
      status: 'assigned',
      notes,
      report_details: '',
      created_at: new Date().toISOString()
    };

    setVisits((prev) => [newVisit, ...prev]);
    setSelectedCustId('');
    setAssigneeId('');
    setNotes('');
    setIsAdding(false);
  };

  const handleStatusChange = (id: string, status: FieldService['status']) => {
    setVisits(prev =>
      prev.map(v => v.id === id ? { ...v, status } : v)
    );
  };

  const filteredVisits = visits.filter(v => {
    const cust = customers.find(c => c.id === v.customer_id);
    return (cust && cust.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
           v.status.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <PermissionGuard module="project">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto min-h-screen text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{t('Field Services & Visits')}</h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t('Track mobile site calls, dispatch engineering specialists, and document visit photo logs.')}</p>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="saas-button-primary flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" /> {t('Schedule Visit')}
        </button>
      </div>

      {/* Add Visit Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="saas-card p-6 space-y-5 max-w-2xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Schedule Technician Visit')}</h3>
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-zinc-400 hover:text-zinc-650"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Target Client *')}</label>
              <select
                required
                value={selectedCustId}
                onChange={(e) => setSelectedCustId(e.target.value)}
                className="saas-input"
              >
                <option value="">{t('-- Choose Customer --')}</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Assign Technician')}</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="saas-input"
              >
                <option value="">{t('-- Choose Employee --')}</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Visit Objectives / Directions')}</label>
            <textarea 
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('e.g. Inspect crack widening on second pillar column...')}
              className="saas-input h-auto py-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="saas-button-secondary"
            >
              {t('Cancel')}
            </button>
            <button 
              type="submit"
              className="saas-button-primary"
            >
              {t('Confirm Visit')}
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative w-48">
        <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-550" />
        <input 
          type="text" 
          placeholder={t('Search site visits...')} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="saas-input pl-8"
        />
      </div>

      {/* Grid of visit lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVisits.map((visit) => {
          const cust = customers.find(c => c.id === visit.customer_id);
          const tech = users.find(u => u.id === visit.assignee_id);
          
          return (
            <div key={visit.id} className="saas-card p-5 space-y-4 hover:border-zinc-350 dark:hover:border-zinc-700">
              
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-100">
                    {cust?.name || t('Inspection Call')}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-550">
                    <Calendar className="h-3.5 w-3.5" />
                    <span suppressHydrationWarning>{t('Scheduled:')} {new Date(visit.date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status selector select */}
                <select
                  value={visit.status}
                  onChange={(e) => handleStatusChange(visit.id, e.target.value as any)}
                  className="saas-input h-7 py-0 px-2 w-auto font-bold text-[10px]"
                >
                  <option value="assigned">{t('Assigned')}</option>
                  <option value="in_progress">{t('In Progress')}</option>
                  <option value="completed">{t('Completed')}</option>
                  <option value="cancelled">{t('Cancelled')}</option>
                </select>
              </div>

              {visit.notes && (
                <p className="text-[10px] text-zinc-650 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-200/10 dark:border-zinc-850/50 leading-normal">
                  <strong>{t('Task Notes')}</strong>: {visit.notes}
                </p>
              )}

              {visit.report_details && (
                <div className="space-y-1 text-[10px]">
                  <h4 className="font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Visit Report Log')}</h4>
                  <p className="leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-200/10 dark:border-zinc-850/50">{visit.report_details}</p>
                </div>
              )}

              {/* Photo Evidence simulator */}
              <div className="pt-3 border-t border-zinc-200/50 dark:border-zinc-850 flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
                <div className="flex items-center gap-1.5">
                  {tech && (
                    <img src={tech.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover border border-zinc-200/50 dark:border-zinc-800" />
                  )}
                  <span>{t('Technician:')} <strong>{tech?.full_name || t('Unassigned')}</strong></span>
                </div>

                <div className="flex gap-1.5 items-center font-bold text-indigo-500 hover:text-indigo-600 cursor-pointer">
                  <Camera className="h-3.5 w-3.5" /> {t('Photo evidence')}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
    </PermissionGuard>
  );
}

