'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useERP } from '@/context/erp-context';
import { 
  Bell, Globe, ChevronDown, Check, ShieldAlert,
  Building2, User, Moon, Sun, LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Company } from '@/types/erp';

export default function Navbar() {
  const supabase = createClient();
  const { 
    companies, activeCompanyId, setActiveCompanyId, 
    users, currentUser, setCurrentUser,
    activeRole, language, setLanguage, t,
    updateAvatarUrl
  } = useERP();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isOnline, setIsOnline] = useState(true);
  const [notificationsCount, setNotificationsCount] = useState(2);
  const [darkMode, setDarkMode] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
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
        setCompanyDropdownOpen(false);
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
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



  return (
    <header ref={navRef} className="sticky top-0 z-40 w-full border-b border-slate-850 bg-slate-900 text-slate-100 dark:border-zinc-800/50 dark:bg-zinc-950 transition-colors duration-200 shadow-sm">
      {/* ── Top bar ── */}
      <div className="flex h-12 items-center justify-between px-3 md:px-5">
        {/* Left: Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-sm">
              D
            </div>
            <span className="hidden sm:block text-xs font-bold tracking-tight text-white">
              dieule<span className="text-slate-400 dark:text-zinc-600">.erp</span>
            </span>
          </Link>
        </div>



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
            className="flex h-8 px-2 items-center justify-center gap-1 rounded-md text-slate-300 transition hover:bg-slate-800 hover:text-white dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 font-medium text-[10px] cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            <span className="uppercase">{language}</span>
          </button>

          {/* Theme */}
          <button 
            onClick={toggleDarkMode}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 transition hover:bg-slate-800 hover:text-white dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-400" />}
          </button>

          {/* Company — hidden mobile */}
          <div className="relative hidden sm:block">
            <button 
              onClick={() => { setCompanyDropdownOpen(!companyDropdownOpen); setRoleDropdownOpen(false); }}
              className="flex h-8 items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/40 px-2 text-[11px] font-semibold text-slate-200 transition hover:bg-slate-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/80 cursor-pointer"
            >
              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="hidden md:inline truncate max-w-[80px]">{activeCompany.name.split(' ')[0]}</span>
              <ChevronDown className="h-3 w-3 text-slate-450" />
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
              onClick={() => { setRoleDropdownOpen(!roleDropdownOpen); setCompanyDropdownOpen(false); }}
              className="flex h-8 items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/40 px-2 text-[11px] font-semibold text-slate-200 transition hover:bg-slate-800 dark:border-indigo-900/30 dark:bg-indigo-950/30 dark:text-indigo-400 cursor-pointer"
            >
              <img src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} alt="" className="h-5 w-5 rounded-full object-cover shrink-0" />
              <span className="hidden lg:inline max-w-[80px] truncate">{currentUser.full_name.split(' ').pop()}</span>
              <span className="hidden sm:inline bg-slate-800 dark:bg-indigo-955 px-1.5 py-0.5 rounded text-[9px] text-slate-300 dark:text-indigo-400 font-bold uppercase tracking-wide">
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
            className="relative flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-slate-800 hover:text-white dark:text-zinc-400 dark:hover:bg-zinc-900 cursor-pointer"
          >
            <Bell className="h-4 w-4 text-slate-400" />
            {notificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-slate-900 dark:ring-zinc-950" />
            )}
          </button>
        </div>
      </div>


    </header>
  );
}
