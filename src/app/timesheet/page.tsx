'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { 
  Plus, Calendar, Check, Search, Trash2, Clock, 
  Briefcase, CheckCircle, FileText, BarChart3, X
} from 'lucide-react';
import { Timesheet } from '@/types/erp';

export default function Timesheets() {
  const { timesheets, addTimesheet, projects, tasks, employees, users, t } = useERP();
  
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProjId, setSelectedProjId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [hours, setHours] = useState('');
  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjId || !hours) return;

    addTimesheet({
      project_id: selectedProjId,
      task_id: selectedTaskId || undefined,
      hours: Number(hours),
      date: date || new Date().toISOString().split('T')[0],
      description: desc
    });

    // Reset
    setSelectedProjId('');
    setSelectedTaskId('');
    setHours('');
    setDate('');
    setDesc('');
    setIsAdding(false);
  };

  // Filter tasks based on selected project
  const projectTasks = tasks.filter(t => t.project_id === selectedProjId);

  // Total logged hours
  const totalLoggedHours = timesheets.reduce((acc, ts) => acc + ts.hours, 0);

  return (
    <PermissionGuard module="payroll">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto min-h-screen text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{t('Timesheets register')}</h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t('Log direct labor hours per project task. Used for actual cost calculations and HR audit.')}</p>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="saas-button-primary flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" /> {t('Log Work Hours')}
        </button>
      </div>

      {/* KPI Stats overview */}
      <div className="saas-card p-4 flex items-center gap-3 max-w-xs">
        <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
          <Clock className="h-4.5 w-4.5" />
        </div>
        <div>
          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider block">{t('Total Logged Hours')}</span>
          <div className="text-sm font-bold text-zinc-855 dark:text-zinc-205 font-mono">{totalLoggedHours} {t('Hrs')}</div>
        </div>
      </div>

      {/* Add Timesheet Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="saas-card p-6 space-y-5 max-w-2xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Log Timesheet Hours')}</h3>
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-zinc-400 hover:text-zinc-655"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Target Project *')}</label>
              <select
                required
                value={selectedProjId}
                onChange={(e) => { setSelectedProjId(e.target.value); setSelectedTaskId(''); }}
                className="saas-input"
              >
                <option value="">{t('-- Choose Project --')}</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Related Task')}</label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                disabled={!selectedProjId}
                className="saas-input disabled:opacity-50"
              >
                <option value="">{t('-- Choose Task --')}</option>
                {projectTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Hours spent *')}</label>
              <input 
                type="number" 
                required
                step="0.5"
                min="0.5"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. 8"
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Work Date')}</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="saas-input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Task Log Description')}</label>
            <input 
              type="text" 
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={t('e.g. Cleaned column concrete fragments, prepped anchors...')}
              className="saas-input"
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
              {t('Confirm Log')}
            </button>
          </div>
        </form>
      )}

      {/* Timesheets List Table */}
      <div className="saas-card overflow-hidden">
        <table className="saas-table">
          <thead>
            <tr>
              <th>{t('Log Date')}</th>
              <th>{t('Employee')}</th>
              <th>{t('Project / Task')}</th>
              <th>{t('Description')}</th>
              <th className="text-right">{t('Hours')}</th>
              <th className="text-right">{t('Status')}</th>
            </tr>
          </thead>
          <tbody>
            {timesheets.map((ts) => {
              const emp = employees.find(e => e.id === ts.employee_id);
              const u = emp ? users.find(usr => usr.id === emp.user_id) : null;
              const proj = projects.find(p => p.id === ts.project_id);
              const taskItem = tasks.find(tsk => tsk.id === ts.task_id);

              return (
                <tr key={ts.id}>
                  <td suppressHydrationWarning className="font-medium text-zinc-550">
                    {new Date(ts.date).toLocaleDateString()}
                  </td>
                  <td className="font-bold text-zinc-900 dark:text-white">
                    {u?.full_name || t('Staff Member')}
                  </td>
                  <td>
                    <div className="font-semibold text-zinc-755 dark:text-zinc-300">{proj?.name || t('General Project')}</div>
                    {taskItem && <div className="text-[9px] text-zinc-400 dark:text-zinc-600 mt-0.5">{taskItem.name}</div>}
                  </td>
                  <td className="italic text-zinc-550 max-w-[200px] truncate">
                    {ts.description}
                  </td>
                  <td className="text-right font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                    {ts.hours} {t('hrs')}
                  </td>
                  <td className="text-right">
                    <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-250/20 dark:border-emerald-900/30">
                      {t('Approved')}
                    </span>
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

