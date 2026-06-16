'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  Briefcase, FileText, CheckSquare, Settings, 
  ShoppingBag, FolderSync, Archive, Target, 
  TrendingUp, ShoppingCart, Map, ClipboardList, 
  Clock, Calendar, BookOpen, Receipt, ChevronLeft, ChevronRight,
  X, Menu, Layers, PackagePlus, PackageMinus, ArrowLeftRight,
  BadgeAlert, History, BarChart3
} from 'lucide-react';
import { useERP } from '@/context/erp-context';
import { usePermission } from '@/hooks/use-permission';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const MENU_CONFIGS: Record<string, { title: string; items: SidebarItem[] }> = {
  crm: {
    title: 'CRM Pipeline',
    items: [
      { name: 'Opportunities', href: '/crm', icon: Target },
      { name: 'Customers Directory', href: '/crm/customers', icon: FileText },
    ]
  },
  sales: {
    title: 'Sales & Billing',
    items: [
      { name: 'Quotations', href: '/sales', icon: TrendingUp },
      { name: 'Invoices Register', href: '/sales/invoices', icon: FileText },
    ]
  },
  purchase: {
    title: 'Purchasing',
    items: [
      { name: 'Purchase Requests', href: '/purchase', icon: ShoppingBag },
      { name: 'RFQ & Orders', href: '/purchase/orders', icon: ShoppingCart },
      { name: 'Supplier Ratings', href: '/purchase/vendors', icon: Settings },
    ]
  },
  inventory: {
    title: 'Inventory Ops',
    items: [
      { name: 'WMS Dashboard', href: '/inventory', icon: Archive },
      { name: 'Material Catalog', href: '/inventory/materials', icon: Layers },
      { name: 'Goods Receipt', href: '/inventory/stock-in', icon: PackagePlus },
      { name: 'Goods Issue', href: '/inventory/stock-out', icon: PackageMinus },
      { name: 'Stock Transfer', href: '/inventory/transfers', icon: ArrowLeftRight },
      { name: 'Stock Count', href: '/inventory/stock-count', icon: ClipboardList },
      { name: 'Batch & Serial', href: '/inventory/batch-serial', icon: BadgeAlert },
      { name: 'Transaction Logs', href: '/inventory/transactions', icon: History },
      { name: 'Reports Center', href: '/inventory/reports', icon: BarChart3 },
      { name: 'Barcode Scan', href: '/inventory/scan', icon: Settings },
    ]
  },
  project: {
    title: 'Projects Hub',
    items: [
      { name: 'Gantt Overview', href: '/project', icon: Briefcase },
      { name: 'Kanban Tasks', href: '/project/tasks', icon: CheckSquare },
      { name: 'Site Surveys', href: '/site-survey', icon: ClipboardList },
      { name: 'Field Service', href: '/field-service', icon: Map },
    ]
  },
  workforce: {
    title: 'Personnel Ops',
    items: [
      { name: 'Employees Files', href: '/workforce', icon: FileText },
      { name: 'Attendance & Payroll', href: '/payroll', icon: Clock },
    ]
  },
  accounting: {
    title: 'Ledgers & Ledger',
    items: [
      { name: 'General Ledger', href: '/accounting', icon: BookOpen },
      { name: 'Chart of Accounts', href: '/accounting/charts', icon: Settings },
      { name: 'Expense Statements', href: '/expense', icon: Receipt },
      { name: 'Approvals Panel', href: '/approvals', icon: CheckSquare },
    ]
  }
};

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, activeRole } = useERP();
  const { canAccessRoute } = usePermission();
  const isHRorAdmin = ['Super Admin', 'Company Admin', 'HR'].includes(activeRole);
  const getSubItemsForPayroll = () => {
    if (isHRorAdmin) {
      return [
        { id: 'dashboard', name: 'Dashboard', href: '/payroll?tab=dashboard' },
        { id: 'logs', name: 'Attendance Logs', href: '/payroll?tab=logs' },
        { id: 'locations', name: 'Geofence Locations', href: '/payroll?tab=locations' },
        { id: 'shifts', name: 'Shift Policies', href: '/payroll?tab=shifts' },
        { id: 'leaves', name: 'Leaves Approval', href: '/payroll?tab=leaves' },
        { id: 'ot', name: 'OT Approval', href: '/payroll?tab=ot' },
        { id: 'adjustments', name: 'Adjustments', href: '/payroll?tab=adjustments' },
        { id: 'timesheet', name: 'Monthly Timesheet', href: '/payroll?tab=timesheet' },
        { id: 'calculations', name: 'Calculations Grid', href: '/payroll?tab=calculations' },
        { id: 'delivery', name: 'Payslip Delivery', href: '/payroll?tab=delivery' },
        { id: 'reports', name: 'Reports Hub', href: '/payroll?tab=reports' },
        { id: 'audit', name: 'Audit Trail', href: '/payroll?tab=audit' }
      ];
    } else {
      return [
        { id: 'timeclock', name: 'Biometric Time Clock', href: '/payroll?tab=timeclock' },
        { id: 'history', name: 'My Timesheets', href: '/payroll?tab=history' },
        { id: 'payslips', name: 'My Payslips', href: '/payroll?tab=payslips' },
        { id: 'requests', name: 'Submit Requests', href: '/payroll?tab=requests' },
        { id: 'settings', name: 'Account Settings', href: '/payroll?tab=settings' }
      ];
    }
  };

  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="hidden md:block py-4 pl-4 shrink-0 w-56">
        <aside className="relative glass-panel rounded-2xl flex flex-col h-[calc(100vh-5.5rem)] w-56" />
      </div>
    );
  }

  const currentTab = searchParams.get('tab') || (isHRorAdmin ? 'dashboard' : 'timeclock');

  const getActiveModuleKey = () => {
    const segment = pathname.split('/')[1];
    if (!segment) return null;
    if (['crm'].includes(segment)) return 'crm';
    if (['sales'].includes(segment)) return 'sales';
    if (['purchase'].includes(segment)) return 'purchase';
    if (['inventory'].includes(segment)) return 'inventory';
    if (['project', 'site-survey', 'field-service'].includes(segment)) return 'project';
    if (['workforce', 'timesheet', 'attendance', 'payroll'].includes(segment)) return 'workforce';
    if (['accounting', 'expense', 'approvals'].includes(segment)) return 'accounting';
    return null;
  };

  const moduleKey = getActiveModuleKey();
  if (!moduleKey) return null;

  const menu = MENU_CONFIGS[moduleKey];
  // Filter items by role permission
  const visibleItems = menu.items.filter((item) => canAccessRoute(item.href));

  return (
    <>
      {/* ── DESKTOP SIDEBAR (hidden on mobile) ── */}
      <div className="hidden md:block py-4 pl-4 shrink-0 transition-all duration-300">
        <aside
          className={`relative glass-panel rounded-2xl flex flex-col h-[calc(100vh-5.5rem)] shadow-sm border border-zinc-200/50 dark:border-zinc-800/40 transition-all duration-300 ${collapsed ? 'w-15' : 'w-56'}`}
        >
          {!collapsed && (
            <div className="flex h-12 items-center px-4.5 border-b border-zinc-200/40 dark:border-zinc-800/40">
              <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                {t(menu.title)}
              </span>
            </div>
          )}

          <nav className="flex-1 space-y-1 p-2">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const isPayroll = item.href === '/payroll';
              return (
                <div key={item.href} className="space-y-0.5">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3.5 rounded-xl px-3 py-2 text-xs font-semibold transition duration-150 ${
                      isActive
                        ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                        : 'text-zinc-500 hover:bg-zinc-150 hover:text-zinc-800 dark:text-zinc-455 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-100'
                    }`}
                    title={t(item.name)}
                  >
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? '' : 'text-zinc-400/80 dark:text-zinc-500'}`} />
                    {!collapsed && <span className="truncate">{t(item.name)}</span>}
                  </Link>

                  {isPayroll && !collapsed && pathname.startsWith('/payroll') && (
                    <div className="ml-6 pl-2.5 border-l border-zinc-200 dark:border-zinc-800 space-y-0.5 mt-0.5 animate-in slide-in-from-top-1 duration-150">
                      {getSubItemsForPayroll().map(sub => {
                        const isSubActive = currentTab === sub.id;
                        return (
                          <Link
                            key={sub.id}
                            href={sub.href}
                            className={`block py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                              isSubActive
                                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white'
                                : 'text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200'
                            }`}
                          >
                            {t(sub.name)}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute bottom-4 -right-3 flex h-6.5 w-6.5 items-center justify-center rounded-full border border-zinc-250 bg-white shadow-md text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 transition cursor-pointer"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </aside>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-200/60 dark:border-zinc-800/60 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-1">
          {visibleItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-150 min-w-0 flex-1 ${
                  isActive
                    ? 'text-zinc-900 dark:text-white'
                    : 'text-zinc-400 dark:text-zinc-600'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-150 ${isActive ? 'bg-zinc-950 dark:bg-white' : ''}`}>
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white dark:text-zinc-950' : ''}`} />
                </div>
                <span className="text-[9px] font-semibold truncate w-full text-center leading-none mt-0.5">
                  {t(item.name).split(' ')[0]}
                </span>
              </Link>
            );
          })}

          {/* More button if items > 4 */}
          {visibleItems.length > 4 && (
            <button
              onClick={() => setMobileOpen(true)}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-zinc-400 dark:text-zinc-600 flex-1"
            >
              <div className="p-1.5 rounded-lg">
                <Menu className="h-4.5 w-4.5" />
              </div>
              <span className="text-[9px] font-semibold">More</span>
            </button>
          )}
        </div>
      </div>

      {/* ── MOBILE SLIDE-UP SHEET (More items) ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 rounded-t-2xl p-4 pb-8 border-t border-zinc-200/50 dark:border-zinc-800/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t(menu.title)}</span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4 text-zinc-400" />
              </button>
            </div>
            <nav className="space-y-1">
              {visibleItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const isPayroll = item.href === '/payroll';
                return (
                  <div key={item.href} className="space-y-1">
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (!isPayroll) setMobileOpen(false);
                      }}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition duration-150 ${
                        isActive
                          ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                          : 'text-zinc-650 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{t(item.name)}</span>
                    </Link>

                    {isPayroll && pathname.startsWith('/payroll') && (
                      <div className="ml-6 pl-2.5 border-l border-zinc-200 dark:border-zinc-800 space-y-1 mt-1">
                        {getSubItemsForPayroll().map(sub => {
                          const isSubActive = currentTab === sub.id;
                          return (
                            <Link
                              key={sub.id}
                              href={sub.href}
                              onClick={() => setMobileOpen(false)}
                              className={`block py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                                isSubActive
                                  ? 'bg-zinc-150 text-zinc-900 dark:bg-zinc-900 dark:text-white'
                                  : 'text-zinc-550 hover:text-zinc-850 dark:text-zinc-400 dark:hover:text-zinc-200'
                              }`}
                            >
                              {t(sub.name)}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
