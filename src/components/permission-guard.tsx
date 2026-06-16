'use client';

import React from 'react';
import { usePermission } from '@/hooks/use-permission';
import { AppModule, AppAction } from '@/lib/permissions';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// ─── Access Denied Page ───────────────────────────────────────────────────────
export function AccessDenied({ module }: { module?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/30 flex items-center justify-center mb-6">
        <ShieldAlert className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
        Access Restricted
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
        You don&apos;t have permission to access{module ? ` the <strong>${module}</strong> module` : ' this page'}.
        Contact your administrator to request access.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-4 py-2 text-sm font-semibold hover:opacity-90 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}

// ─── Route-level Permission Guard ─────────────────────────────────────────────
interface PermissionGuardProps {
  module: AppModule;
  action?: AppAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  module,
  action = 'view',
  children,
  fallback,
}: PermissionGuardProps) {
  const { can } = usePermission();

  if (!can(action, module)) {
    return fallback ? <>{fallback}</> : <AccessDenied module={module} />;
  }

  return <>{children}</>;
}

// ─── Inline action guard — hide buttons/elements ─────────────────────────────
interface ActionGuardProps {
  module: AppModule;
  action: AppAction;
  children: React.ReactNode;
}

export function ActionGuard({ module, action, children }: ActionGuardProps) {
  const { can } = usePermission();
  if (!can(action, module)) return null;
  return <>{children}</>;
}

// ─── Role badge component ─────────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  'Super Admin':     'bg-violet-100 text-violet-700 border-violet-200/50 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/30',
  'Company Admin':   'bg-indigo-100 text-indigo-700 border-indigo-200/50 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/30',
  'Project Manager': 'bg-blue-100 text-blue-700 border-blue-200/50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30',
  'Sales':           'bg-emerald-100 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30',
  'Purchasing':      'bg-amber-100 text-amber-700 border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30',
  'Warehouse Staff': 'bg-orange-100 text-orange-700 border-orange-200/50 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/30',
  'Site Engineer':   'bg-cyan-100 text-cyan-700 border-cyan-200/50 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-900/30',
  'HR':              'bg-pink-100 text-pink-700 border-pink-200/50 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-900/30',
  'Accountant':      'bg-teal-100 text-teal-700 border-teal-200/50 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/30',
  'Employee':        'bg-zinc-100 text-zinc-600 border-zinc-200/50 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/30',
};

export function RoleBadge({ role }: { role: string }) {
  const colorClass = ROLE_COLORS[role] || ROLE_COLORS['Employee'];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
      <ShieldAlert className="h-2.5 w-2.5" />
      {role}
    </span>
  );
}
