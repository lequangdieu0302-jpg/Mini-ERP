'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { 
  Plus, Briefcase, Calendar, Check, Search, ChevronRight,
  TrendingUp, BarChart2, DollarSign, Clock, Users, X
} from 'lucide-react';
import { Project } from '@/types/erp';

// Months config for Gantt Chart columns
const GANTT_MONTHS = [
  { name: 'Apr 26', colSpan: 1 },
  { name: 'May 26', colSpan: 1 },
  { name: 'Jun 26', colSpan: 1 },
  { name: 'Jul 26', colSpan: 1 },
  { name: 'Aug 26', colSpan: 1 },
  { name: 'Sep 26', colSpan: 1 },
  { name: 'Oct 26', colSpan: 1 },
  { name: 'Nov 26', colSpan: 1 }
];

export default function Projects() {
  const { projects, createProject, users, t } = useERP();
  
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [desc, setDesc] = useState('');

  const [activeTab, setActiveTab] = useState<'list' | 'gantt'>('list');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    createProject({
      name,
      budget: Number(budget) || 0,
      start_date: startDate,
      end_date: endDate,
      description: desc
    });

    // Reset
    setName('');
    setBudget('');
    setStartDate('');
    setEndDate('');
    setDesc('');
    setIsAdding(false);
  };

  return (
    <PermissionGuard module="project">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto min-h-screen text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-550 tracking-tight">{t("Contracting Projects")}</h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t("Track project milestones, physical progress, and financial actual costs.")}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Tab */}
          <div className="flex items-center rounded-lg border border-zinc-200/50 bg-white p-1 dark:border-zinc-800/80 dark:bg-zinc-900/50">
            <button
              onClick={() => setActiveTab('list')}
              className={`rounded px-3 py-1 font-semibold transition text-[11px] ${activeTab === 'list' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              {t("List Overview")}
            </button>
            <button
              onClick={() => setActiveTab('gantt')}
              className={`rounded px-3 py-1 font-semibold transition text-[11px] ${activeTab === 'gantt' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              {t("Gantt Timeline")}
            </button>
          </div>

          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="saas-button-primary flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> {t("Start Project")}
          </button>
        </div>
      </div>

      {/* Add Project Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="saas-card p-6 space-y-5 max-w-2xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t("Initiate Construction Project")}</h3>
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
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("Project Title *")}</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Brooklyn Bridge Rehab"
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("Total Allocated Budget ($) *")}</label>
              <input 
                type="number" 
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Total budget cost"
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("Start Date *")}</label>
              <input 
                type="date" 
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("End Date *")}</label>
              <input 
                type="date" 
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="saas-input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("Scope of Work description")}</label>
            <textarea 
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={t("Define project deliverables and target objectives...")}
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
              className="saas-button-primary"
            >
              {t("Confirm Start")}
            </button>
          </div>
        </form>
      )}

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => {
            const manager = users.find(u => u.id === proj.manager_id);
            return (
              <div key={proj.id} className="saas-card p-5 space-y-4 hover:border-zinc-350 dark:hover:border-zinc-700">
                
                {/* Title */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-855 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-100 leading-snug">{proj.name}</h3>
                      <span suppressHydrationWarning className="text-[9px] text-zinc-400 dark:text-zinc-550 font-semibold block mt-0.5">
                        Start: {new Date(proj.start_date || '').toLocaleDateString()} | End: {new Date(proj.end_date || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="rounded px-2 py-0.5 text-[9px] font-bold bg-zinc-100 text-zinc-650 dark:bg-zinc-800/50 dark:text-zinc-400 border border-zinc-200/20 dark:border-zinc-800/30 uppercase">
                    {proj.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-bold">
                    <span className="text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t("Physical Completion")}</span>
                    <span className="text-indigo-550 dark:text-indigo-400 font-mono">{proj.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900/55 rounded-full overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50">
                    <div 
                      className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Costs breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-zinc-200/50 dark:border-zinc-850">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t("Allocated Budget")}</span>
                    <div className="font-bold text-zinc-800 dark:text-zinc-250" suppressHydrationWarning>${proj.budget.toLocaleString()}</div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t("Actual Cost Spent")}</span>
                    <div className="font-bold text-zinc-800 dark:text-zinc-250" suppressHydrationWarning>${proj.actual_cost.toLocaleString()}</div>
                  </div>
                </div>

                {/* Manager detail */}
                {manager && (
                  <div className="pt-3 border-t border-zinc-200/50 dark:border-zinc-850 flex items-center justify-between text-[9px] text-zinc-450 dark:text-zinc-550">
                    <div className="flex items-center gap-1.5">
                      <img src={manager.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                      <span>Manager: <strong>{manager.full_name}</strong></span>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        /* GANTT CHART TIMELINE GRAPHIC VISUAL SIMULATOR */
        <div className="saas-card p-5 space-y-6 overflow-x-auto min-w-[700px]">
          
          {/* Gantt Header grid */}
          <div className="grid grid-cols-12 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase text-center">
            <div className="col-span-4 text-left px-2">{t("Project Reference")}</div>
            <div className="col-span-8 grid grid-cols-8">
              {GANTT_MONTHS.map((m, idx) => (
                <div key={idx} className="border-r border-zinc-200/10 dark:border-zinc-850 last:border-r-0">
                  {m.name}
                </div>
              ))}
            </div>
          </div>

          {/* Gantt Rows */}
          <div className="space-y-6 py-2">
            {projects.map((proj) => {
              // Calculate horizontal span columns based on static date assumptions:
              // Apr 26 (col 1) -> Nov 26 (col 8)
              // Project 1 (Brooklyn): Start Apr -> End Oct. Columns 1 to 7.
              // Project 2 (LaGuardia): Start Jun -> End Nov. Columns 3 to 8.
              const gridStart = proj.id === 'proj1' ? 1 : 3;
              const gridSpan = proj.id === 'proj1' ? 7 : 6;
              const barClass = proj.id === 'proj1' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border border-zinc-800 dark:border-zinc-200' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-800';

              return (
                <div key={proj.id} className="grid grid-cols-12 items-center text-xs">
                  
                  {/* Left reference */}
                  <div className="col-span-4 flex flex-col px-2">
                    <span className="font-bold text-zinc-850 dark:text-zinc-100 truncate">{proj.name}</span>
                    <span className="text-[10px] text-zinc-450 mt-0.5" suppressHydrationWarning>Budget: ${proj.budget.toLocaleString()}</span>
                  </div>

                  {/* Gantt bar container */}
                  <div className="col-span-8 grid grid-cols-8 h-8 relative">
                    
                    {/* Background columns overlay */}
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <div key={idx} className="h-full border-r border-zinc-200/10 dark:border-zinc-850/30 last:border-r-0" />
                    ))}

                    {/* Timeline bar overlayed dynamically using CSS grid positioning */}
                    <div 
                      className={`absolute inset-y-1.5 rounded-full ${barClass} shadow-sm flex items-center px-4 font-bold text-[9px] uppercase tracking-wider justify-between`}
                      style={{
                        left: `${((gridStart - 1) / 8) * 100}%`,
                        width: `${(gridSpan / 8) * 100}%`
                      }}
                    >
                      <span className="truncate">{proj.progress}% Done</span>
                      <span>{proj.status}</span>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
    </PermissionGuard>
  );
}

