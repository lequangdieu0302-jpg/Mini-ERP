'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React from 'react';
import { useERP } from '@/context/erp-context';
import { 
  DollarSign, Briefcase, Archive, Users, 
  ArrowUpRight, ArrowDownRight, Activity, AlertTriangle
} from 'lucide-react';

export default function Dashboard() {
  const { projects, products, invoices, employees, t } = useERP();

  // Calculations
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.amount_total, 0);
  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
  const totalActual = projects.reduce((acc, p) => acc + p.actual_cost, 0);
  
  const totalMaterialsValue = products.reduce((acc, prod) => acc + (prod.current_qty * prod.cost_price), 0);
  const activeStaff = employees.length;

  return (
    <PermissionGuard module="dashboard">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t('Executive Dashboard')}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t('Real-time metrics, project schedules, and cash flow distributions.')}</p>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{t('System Active')}</span>
        </div>
      </div>

      {/* Modern KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue */}
        <div className="saas-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">{t('Invoiced Revenue')}</span>
            <div className="h-7 w-7 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/60 flex items-center justify-center text-zinc-400 dark:text-zinc-550">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-450 font-bold">
              <ArrowUpRight className="h-3 w-3" />
              <span>{t('+18.2% vs last month')}</span>
            </div>
          </div>
        </div>

        {/* Project spent */}
        <div className="saas-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">{t('Active CapEx Cost')}</span>
            <div className="h-7 w-7 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/60 flex items-center justify-center text-zinc-400 dark:text-zinc-550">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">${totalActual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <p suppressHydrationWarning className="text-[11px] text-zinc-450 dark:text-zinc-500 font-medium">
              {t('Of')} ${totalBudget.toLocaleString()} ({totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0}% {t('used')})
            </p>
          </div>
        </div>

        {/* Inventory holdings */}
        <div className="saas-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">{t('Assets Valuation')}</span>
            <div className="h-7 w-7 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/60 flex items-center justify-center text-zinc-400 dark:text-zinc-550">
              <Archive className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">${totalMaterialsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <div className="flex items-center gap-1 text-[11px] text-rose-550 dark:text-rose-450 font-bold">
              <ArrowDownRight className="h-3 w-3" />
              <span>{t('-2.4% holding cost')}</span>
            </div>
          </div>
        </div>

        {/* Staff */}
        <div className="saas-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">{t('Workforce Size')}</span>
            <div className="h-7 w-7 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/60 flex items-center justify-center text-zinc-400 dark:text-zinc-550">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{activeStaff} {t('Staff Members')}</span>
            <p className="text-[11px] text-zinc-450 dark:text-zinc-500 font-medium">{t('Active across 2 departments')}</p>
          </div>
        </div>

      </div>

      {/* Visual Analytics graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Projects overview */}
        <div className="saas-card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-zinc-850 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-900 pb-3">
            {t('Active Projects Progress')}
          </h3>
          
          <div className="space-y-5">
            {projects.map((proj) => (
              <div key={proj.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">{proj.name}</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-bold font-mono">{proj.progress}%</span>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200/40 dark:border-zinc-800/40">
                  <div 
                    className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 rounded-full" 
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-450 dark:text-zinc-500">
                  <span suppressHydrationWarning>{t('Actual:')} ${proj.actual_cost.toLocaleString()}</span>
                  <span suppressHydrationWarning>{t('Budget:')} ${proj.budget.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost allocation (Stripe-style SVG metrics line chart) */}
        <div className="saas-card p-6 space-y-6">
          <h3 className="text-sm font-semibold text-zinc-855 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-900 pb-3">
            {t('Operational Cost Allocation')}
          </h3>
          
          <div className="space-y-6">
            {/* Visual SVG line trend chart */}
            <div className="h-32 w-full bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden relative p-3">
              <svg className="h-full w-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                {/* Grid guidelines */}
                <line x1="0" y1="10" x2="100" y2="10" stroke="currentColor" strokeWidth="0.15" className="text-zinc-200 dark:text-zinc-800" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="0.15" className="text-zinc-200 dark:text-zinc-800" />
                
                {/* Smooth graph line */}
                <path 
                  d="M0,25 Q15,10 30,18 T60,8 T90,12 T100,5" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  className="text-indigo-600 dark:text-indigo-400"
                />
                
                {/* Area fill */}
                <path 
                  d="M0,25 Q15,10 30,18 T60,8 T90,12 T100,5 L100,30 L0,30 Z" 
                  fill="url(#c-grad)" 
                  className="text-indigo-600 dark:text-indigo-400"
                  opacity="0.08"
                />
                
                <defs>
                  <linearGradient id="c-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute top-3 left-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('CapEx Variance Index')}</div>
            </div>

            {/* Distribution metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">{t('Direct Materials')}</span>
                <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200 font-mono">50%</span>
              </div>
              <div className="space-y-1 border-x border-zinc-200/50 dark:border-zinc-800/50">
                <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">{t('Labor Payroll')}</span>
                <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200 font-mono">30%</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">{t('Asset Overheads')}</span>
                <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200 font-mono">20%</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
    </PermissionGuard>
  );
}
