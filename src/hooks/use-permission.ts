'use client';

import { useERP } from '@/context/erp-context';
import {
  AppModule,
  AppAction,
  checkPermission,
  getAccessibleModules,
  getModuleFromRoute,
} from '@/lib/permissions';
import { usePathname } from 'next/navigation';

export function usePermission() {
  const { activeRole } = useERP();
  const pathname = usePathname();

  /** Check if current role can do an action on a module */
  const can = (action: AppAction, module: AppModule): boolean =>
    checkPermission(activeRole, action, module);

  /** Shorthand helpers */
  const canView   = (module: AppModule) => can('view',   module);
  const canCreate = (module: AppModule) => can('create', module);
  const canEdit   = (module: AppModule) => can('edit',   module);
  const canDelete = (module: AppModule) => can('delete', module);
  const canApprove = (module: AppModule) => can('approve', module);

  /** Get module from current route */
  const currentModule = (): AppModule | null => {
    const segment = pathname.split('/')[1] || '';
    return getModuleFromRoute(segment);
  };

  /** Check if user can access current page */
  const canAccessCurrentPage = (): boolean => {
    const mod = currentModule();
    if (!mod) return true; // dashboard/root always accessible
    return canView(mod);
  };

  /** List of all modules the current role can view */
  const accessibleModules = getAccessibleModules(activeRole);

  /** Check if a nav route is accessible */
  const canAccessRoute = (href: string): boolean => {
    const segment = href.split('/')[1] || '';
    const mod = getModuleFromRoute(segment);
    if (!mod) return true;
    return canView(mod);
  };

  return {
    role: activeRole,
    can,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canApprove,
    canAccessCurrentPage,
    canAccessRoute,
    accessibleModules,
    currentModule,
  };
}
