'use client';

import React from 'react';
import { useERP } from '@/context/erp-context';
import { usePermission } from '@/hooks/use-permission';
import Link from 'next/link';
import { 
  Target, TrendingUp, ShoppingBag, Archive, Briefcase, 
  ClipboardList, Map, Users, Clock, Calendar, BookOpen, 
  Receipt, CheckSquare, BarChart3, FolderSync, FileText,
  ArrowRight, Sparkles
} from 'lucide-react';

interface AppItem {
  name: string;
  desc: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface AppGroup {
  label: string;
  color: string;
  iconBg: string;
  items: AppItem[];
}

const APP_GROUPS: AppGroup[] = [
  {
    label: 'Sales & CRM',
    color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-200/40 dark:border-emerald-900/30',
    iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    items: [
      { name: 'CRM Pipeline', desc: 'Leads & opportunities tracking', href: '/crm', icon: Target },
      { name: 'Quotations', desc: 'Sales orders & billing', href: '/sales', icon: TrendingUp },
      { name: 'Invoices', desc: 'Invoice register & payments', href: '/sales/invoices', icon: FileText },
      { name: 'Customers', desc: 'Client directory', href: '/crm/customers', icon: Users },
    ],
  },
  {
    label: 'Operations & Supply Chain',
    color: 'from-amber-500/10 to-amber-500/5 border-amber-200/40 dark:border-amber-900/30',
    iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    items: [
      { name: 'Purchasing', desc: 'Purchase requests & POs', href: '/purchase', icon: ShoppingBag },
      { name: 'Inventory', desc: 'Stock levels & materials', href: '/inventory', icon: Archive },
      { name: 'Warehouses', desc: 'Warehouse management', href: '/inventory/warehouses', icon: FolderSync },
    ],
  },
  {
    label: 'Project Management',
    color: 'from-blue-500/10 to-blue-500/5 border-blue-200/40 dark:border-blue-900/30',
    iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    items: [
      { name: 'Projects', desc: 'Gantt charts & milestones', href: '/project', icon: Briefcase },
      { name: 'Tasks Board', desc: 'Kanban task management', href: '/project/tasks', icon: CheckSquare },
      { name: 'Site Survey', desc: 'GPS, drawings & photos', href: '/site-survey', icon: ClipboardList },
      { name: 'Field Service', desc: 'Dispatch & work logs', href: '/field-service', icon: Map },
    ],
  },
  {
    label: 'Human Resources',
    color: 'from-pink-500/10 to-pink-500/5 border-pink-200/40 dark:border-pink-900/30',
    iconBg: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400',
    items: [
      { name: 'Workforce', desc: 'Employee profiles & HR', href: '/workforce', icon: Users },
      { name: 'Timesheets', desc: 'Labor hours tracking', href: '/timesheet', icon: Calendar },
      { name: 'Attendance', desc: 'Clock in / clock out', href: '/attendance', icon: Clock },
    ],
  },
  {
    label: 'Finance & Accounting',
    color: 'from-teal-500/10 to-teal-500/5 border-teal-200/40 dark:border-teal-900/30',
    iconBg: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400',
    items: [
      { name: 'Accounting', desc: 'General ledger & P&L', href: '/accounting', icon: BookOpen },
      { name: 'Expenses', desc: 'Claims & receipt upload', href: '/expense', icon: Receipt },
      { name: 'Approvals', desc: 'Verify all requests', href: '/approvals', icon: CheckSquare },
    ],
  },
  {
    label: 'Reports & System',
    color: 'from-violet-500/10 to-violet-500/5 border-violet-200/40 dark:border-violet-900/30',
    iconBg: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
    items: [
      { name: 'Dashboard', desc: 'KPIs & analytics overview', href: '/dashboard', icon: BarChart3 },
      { name: 'Documents', desc: 'Files, contracts & drawings', href: '/documents', icon: FolderSync },
    ],
  },
];

export default function Home() {
  const { companies, activeCompanyId, activeRole, currentUser, t } = useERP();
  const { canAccessRoute } = usePermission();
  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0];

  // Filter groups by permission
  const visibleGroups = APP_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => canAccessRoute(item.href)),
  })).filter(group => group.items.length > 0);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-4 md:p-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{t('Command Center')}</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
          {t('Welcome back')}, {currentUser.full_name}
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {t('Role')}: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{t(activeRole)}</span>
          <span className="mx-2 text-zinc-300 dark:text-zinc-700">•</span>
          {visibleGroups.reduce((sum, g) => sum + g.items.length, 0)} {t('modules available')}
        </p>
      </div>

      {/* Module groups */}
      <div className="space-y-6">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            {/* Group header */}
            <h2 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 px-1">
              {t(group.label)}
            </h2>

            {/* Group items grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3 rounded-xl border bg-gradient-to-br p-3.5 transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${group.color}`}
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${group.iconBg}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {t(item.name)}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5 truncate">
                        {t(item.desc)}
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
