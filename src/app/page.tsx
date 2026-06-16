'use client';

import React from 'react';
import { useERP } from '@/context/erp-context';
import { usePermission } from '@/hooks/use-permission';
import Link from 'next/link';
import { 
  Target, TrendingUp, ShoppingBag, Archive, Briefcase, 
  ClipboardList, Map, Users, Clock, Calendar, BookOpen, 
  Receipt, CheckSquare, BarChart3, FolderSync, FileText,
  ArrowRight, Sparkles, Shield, Building2, Grid
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
  const { companies, activeCompanyId, activeRole, currentUser, language, t } = useERP();
  const { canAccessRoute } = usePermission();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0] || { name: 'Dieule ERP' };

  // Filter groups by permission
  const visibleGroups = APP_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => canAccessRoute(item.href)),
  })).filter(group => group.items.length > 0);

  if (!mounted) {
    return (
      <div 
        className="relative min-h-[calc(100vh-3rem)] bg-cover bg-center bg-no-repeat flex flex-col"
        style={{ backgroundImage: "url('/homepage-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-white/90 dark:bg-zinc-950/94 backdrop-blur-[2px] transition-colors duration-250" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.1),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none" />
      </div>
    );
  }

  return (
    <div 
      className="relative min-h-[calc(100vh-3rem)] bg-cover bg-center bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/homepage-bg.jpg')" }}
    >
      {/* High-contrast backdrop overlay */}
      <div className="absolute inset-0 bg-white/90 dark:bg-zinc-950/94 backdrop-blur-[2px] transition-colors duration-250" />
      
      {/* Subtle radial gradient overlay for premium lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.1),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.06),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_bottom_right,rgba(124,58,237,0.1),transparent_50%)] pointer-events-none" />

      {/* Main Content container */}
      <div className="relative z-10 p-6 md:p-10 max-w-6xl mx-auto w-full flex-1 space-y-8 animate-in fade-in duration-300">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="space-y-3">
            {/* Command center active badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 border border-blue-500/15 dark:border-blue-400/15">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest">{t('Command Center')}</span>
            </div>

            {/* Main Greeting */}
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Welcome, <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">{currentUser.full_name}</span>
            </h1>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Role Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 dark:bg-zinc-900/40 dark:border-zinc-800/50 text-[10px] font-semibold text-slate-700 dark:text-zinc-300 shadow-sm">
                <Shield className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                <span>{t('Role')}: <span className="font-bold text-slate-950 dark:text-white">{t(activeRole)}</span></span>
              </div>

              {/* Company Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 dark:bg-zinc-900/40 dark:border-zinc-800/50 text-[10px] font-semibold text-slate-700 dark:text-zinc-300 shadow-sm">
                <Building2 className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                <span className="truncate max-w-[150px]">{activeCompany.name}</span>
              </div>

              {/* Modules Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 dark:bg-zinc-900/40 dark:border-zinc-800/50 text-[10px] font-semibold text-slate-700 dark:text-zinc-300 shadow-sm">
                <Grid className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                <span><span className="font-bold text-slate-950 dark:text-white">{visibleGroups.reduce((sum, g) => sum + g.items.length, 0)}</span> {t('modules available')}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Date & Time Card */}
          <div className="hidden md:flex items-center gap-3 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-slate-200/60 dark:border-zinc-800/80 rounded-xl p-3 shadow-sm shrink-0 self-end">
            <div className="h-8.5 w-8.5 rounded-lg bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('Today')}</div>
              <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
                {new Date().toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Module groups */}
        <div className="space-y-8">
          {visibleGroups.map((group) => (
            <div key={group.label} className="space-y-3">
              {/* Group header */}
              <h2 className="text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest px-1">
                {t(group.label)}
              </h2>

              {/* Group items grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group relative flex items-center gap-2.5 sm:gap-3.5 rounded-xl border border-slate-200/80 bg-white/90 dark:border-zinc-800/80 dark:bg-zinc-900/90 p-2.5 sm:p-3.5 transition-all duration-200 hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                    >
                      <div className={`h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 rounded-lg flex items-center justify-center shrink-0 ${group.iconBg} shadow-sm`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] sm:text-xs font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {t(item.name)}
                        </div>
                        <div className="hidden sm:block text-[10px] text-slate-500 dark:text-zinc-400 mt-1 leading-snug">
                          {t(item.desc)}
                        </div>
                      </div>
                      <ArrowRight className="hidden sm:block h-3.5 w-3.5 text-slate-400 dark:text-zinc-650 opacity-0 group-hover:opacity-100 transition-all shrink-0 translate-x-[-4px] group-hover:translate-x-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
