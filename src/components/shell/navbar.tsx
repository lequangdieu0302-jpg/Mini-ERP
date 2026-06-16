'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useERP } from '@/context/erp-context';
import { usePermission } from '@/hooks/use-permission';
import { 
  Bell, Search, Globe, ChevronDown, Check, ShieldAlert,
  Building2, User, Moon, Sun, LogOut,
  Target, TrendingUp, ShoppingBag, Archive, Briefcase,
  ClipboardList, Map, Users, Clock, Calendar, BookOpen,
  Receipt, CheckSquare, BarChart3, FolderSync, FileText
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Company } from '@/types/erp';

// ─── Nav Group Definitions ───────────────────────────────────────────────────
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  desc: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Sales',
    items: [
      { name: 'CRM Pipeline', href: '/crm', icon: Target, desc: 'Leads & opportunities' },
      { name: 'Quotations', href: '/sales', icon: TrendingUp, desc: 'Sales orders & billing' },
      { name: 'Invoices', href: '/sales/invoices', icon: FileText, desc: 'Invoice register' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Purchasing', href: '/purchase', icon: ShoppingBag, desc: 'Purchase requests & POs' },
      { name: 'Inventory', href: '/inventory', icon: Archive, desc: 'Stock & warehouses' },
    ],
  },
  {
    label: 'Projects',
    items: [
      { name: 'Project Hub', href: '/project', icon: Briefcase, desc: 'Gantt & milestones' },
      { name: 'Tasks Board', href: '/project/tasks', icon: CheckSquare, desc: 'Kanban tasks' },
      { name: 'Site Survey', href: '/site-survey', icon: ClipboardList, desc: 'GPS & drawings' },
      { name: 'Field Service', href: '/field-service', icon: Map, desc: 'Dispatch & logs' },
    ],
  },
  {
    label: 'HR',
    items: [
      { name: 'Workforce', href: '/workforce', icon: Users, desc: 'Employee profiles' },
      { name: 'Timesheets', href: '/timesheet', icon: Calendar, desc: 'Labor hours log' },
      { name: 'Attendance', href: '/attendance', icon: Clock, desc: 'Clock in/out' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { name: 'Accounting', href: '/accounting', icon: BookOpen, desc: 'Ledger & P&L' },
      { name: 'Expenses', href: '/expense', icon: Receipt, desc: 'Claims & receipts' },
      { name: 'Approvals', href: '/approvals', icon: CheckSquare, desc: 'Verify requests' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: BarChart3, desc: 'KPIs & analytics' },
      { name: 'Documents', href: '/documents', icon: FolderSync, desc: 'Files & contracts' },
    ],
  },
];

export default function Navbar() {
  const supabase = createClient();
  const { 
    companies, activeCompanyId, setActiveCompanyId, 
    users, currentUser, setCurrentUser,
    activeRole, language, setLanguage, t,
    updateAvatarUrl
  } = useERP();
  const { canAccessRoute } = usePermission();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isOnline, setIsOnline] = useState(true);
  const [notificationsCount, setNotificationsCount] = useState(2);
  const [darkMode, setDarkMode] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert(t("Photo is too large. Please select an image under 1.5MB."));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await updateAvatarUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const isDark = document.documentElement.classList.contains('dark') || 
                   localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpenGroup(null);
    setCompanyDropdownOpen(false);
    setRoleDropdownOpen(false);
  }, [pathname]);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const activeCompany = (companies.find(c => c.id === activeCompanyId) || companies[0] || { name: 'Apex' }) as Company;

  // Filter nav groups by permission
  const visibleGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => canAccessRoute(item.href)),
  })).filter(group => group.items.length > 0);

  // Check if a group contains the active route
  const isGroupActive = (group: NavGroup) =>
    group.items.some(item => pathname.startsWith(item.href));

  return (
    <header ref={navRef} className="sticky top-0 z-40 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80 transition-colors duration-200">
      {/* ── Top bar ── */}
      <div className="flex h-12 items-center justify-between px-3 md:px-5">
        {/* Left: Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-md bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 font-black text-sm">
              A
            </div>
            <span className="hidden sm:block text-xs font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              apex<span className="text-zinc-400 dark:text-zinc-600">.erp</span>
            </span>
          </Link>
        </div>

        {/* Center: Nav Groups (desktop) */}
        <nav className="hidden md:flex items-center gap-0.5 mx-4">
          {visibleGroups.map((group) => {
            const active = isGroupActive(group);
            const isOpen = openGroup === group.label;

            return (
              <div key={group.label} className="relative">
                <button
                  onClick={() => setOpenGroup(isOpen ? null : group.label)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150 cursor-pointer ${
                    active
                      ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800/60'
                      : isOpen
                        ? 'text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/40'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/30'
                  }`}
                >
                  {t(group.label)}
                  <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {isOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-56 rounded-xl border border-zinc-200/80 bg-white p-1.5 shadow-xl dark:border-zinc-800/80 dark:bg-zinc-950 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-2.5 py-1.5 text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                      {t(group.label)}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const itemActive = pathname === item.href || pathname.startsWith(item.href + '/');
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 rounded-lg px-2.5 py-2 transition-all duration-100 ${
                            itemActive
                              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                          }`}
                        >
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                            itemActive
                              ? 'bg-white/20 dark:bg-zinc-950/20'
                              : 'bg-zinc-100 dark:bg-zinc-800/60'
                          }`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold">{t(item.name)}</div>
                            <div className={`text-[9px] mt-0.5 truncate ${
                              itemActive ? 'text-white/60 dark:text-zinc-950/60' : 'text-zinc-400 dark:text-zinc-500'
                            }`}>{t(item.desc)}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          {/* Offline */}
          {!isOnline && (
            <div className="flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-700 border border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50">
              <ShieldAlert className="h-3 w-3" />
              <span className="hidden sm:inline">offline</span>
            </div>
          )}

          {/* Language */}
          <button 
            onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
            className="flex h-8 px-2 items-center justify-center gap-1 rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 font-medium text-[10px] cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="uppercase">{language}</span>
          </button>

          {/* Theme */}
          <button 
            onClick={toggleDarkMode}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Company — hidden mobile */}
          <div className="relative hidden sm:block">
            <button 
              onClick={() => { setCompanyDropdownOpen(!companyDropdownOpen); setRoleDropdownOpen(false); setOpenGroup(null); }}
              className="flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2 text-[11px] font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/80 cursor-pointer"
            >
              <Building2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span className="hidden md:inline truncate max-w-[80px]">{activeCompany.name.split(' ')[0]}</span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>
            {companyDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-52 rounded-lg border border-zinc-200 bg-white p-1 shadow-md dark:border-zinc-800 dark:bg-zinc-950 z-50">
                <div className="px-2.5 py-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                  {t("Switch Organization")}
                </div>
                {companies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setActiveCompanyId(c.id); setCompanyDropdownOpen(false); router.refresh(); }}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-xs text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
                  >
                    <span className="truncate">{c.name}</span>
                    {c.id === activeCompanyId && <Check className="h-3.5 w-3.5 text-indigo-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="relative">
            <button 
              onClick={() => { setRoleDropdownOpen(!roleDropdownOpen); setCompanyDropdownOpen(false); setOpenGroup(null); }}
              className="flex h-8 items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50/50 px-2 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-900/30 dark:bg-indigo-950/30 dark:text-indigo-400 cursor-pointer"
            >
              <img src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} alt="" className="h-5 w-5 rounded-full object-cover shrink-0" />
              <span className="hidden lg:inline max-w-[80px] truncate">{currentUser.full_name.split(' ').pop()}</span>
              <span className="hidden sm:inline bg-indigo-100 dark:bg-indigo-950 px-1.5 py-0.5 rounded text-[9px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wide">
                {activeRole.replace(' ', '').slice(0, 6)}
              </span>
            </button>
            {roleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-md dark:border-zinc-800 dark:bg-zinc-950 z-50">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="flex items-center gap-2.5 px-2.5 py-2 border-b border-zinc-100 dark:border-zinc-900 pb-2.5 mb-1.5">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group cursor-pointer shrink-0"
                  >
                    <img src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} alt="" className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 group-hover:opacity-75 transition" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45 rounded-full opacity-0 group-hover:opacity-100 transition">
                      <span className="text-[7px] text-white font-bold uppercase tracking-wider">UP</span>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">{currentUser.full_name}</span>
                    <span className="text-[10px] text-zinc-400 truncate">{currentUser.email}</span>
                  </div>
                </div>
                <div className="px-2.5 py-1 text-[9px] font-bold text-indigo-500 uppercase tracking-wider mb-1">
                  Vai trò: {t(activeRole)}
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-indigo-650 hover:bg-indigo-50/50 dark:text-indigo-400 dark:hover:bg-zinc-900/50 cursor-pointer font-bold mb-1.5"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Cập nhật ảnh đại diện</span>
                </button>
                
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setRoleDropdownOpen(false);
                    router.push('/login');
                    router.refresh();
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-red-650 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer font-bold mt-1 border-t border-zinc-100 dark:border-zinc-900 pt-2"
                >
                  <LogOut className="h-3.5 w-3.5 shrink-0" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button 
            onClick={() => setNotificationsCount(0)}
            className="relative flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {notificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-zinc-950" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile nav tabs (scrollable horizontal) ── */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto px-3 pb-2 -mt-0.5 scrollbar-none">
        {visibleGroups.map((group) => {
          const active = isGroupActive(group);
          const isOpen = openGroup === group.label;
          return (
            <button
              key={group.label}
              onClick={() => setOpenGroup(isOpen ? null : group.label)}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition cursor-pointer ${
                active
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {t(group.label)}
              <ChevronDown className={`h-2.5 w-2.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          );
        })}
      </div>

      {/* ── Mobile dropdown overlay ── */}
      {openGroup && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-white dark:bg-zinc-950 border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-lg z-50 p-3">
          <div className="grid grid-cols-2 gap-2">
            {visibleGroups
              .find(g => g.label === openGroup)
              ?.items.map((item) => {
                const Icon = item.icon;
                const itemActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition ${
                      itemActive
                        ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                        : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold truncate">{t(item.name)}</div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      )}
    </header>
  );
}
