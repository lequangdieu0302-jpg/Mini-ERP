import { ERPUserRole } from '@/types/erp';

// ─── Modules & Actions ───────────────────────────────────────────────────────
export type AppModule =
  | 'dashboard'
  | 'crm'
  | 'sales'
  | 'purchase'
  | 'inventory'
  | 'project'
  | 'workforce'
  | 'accounting'
  | 'expense'
  | 'approvals'
  | 'documents'
  | 'payroll'
  | 'reports';

export type AppAction = 'view' | 'create' | 'edit' | 'delete' | 'approve';

// ─── Route → Module mapping ───────────────────────────────────────────────────
export const ROUTE_MODULE_MAP: Record<string, AppModule> = {
  '':             'dashboard',
  'dashboard':    'dashboard',
  'crm':          'crm',
  'sales':        'sales',
  'purchase':     'purchase',
  'inventory':    'inventory',
  'project':      'project',
  'site-survey':  'project',
  'field-service':'project',
  'workforce':    'workforce',
  'timesheet':    'workforce',
  'attendance':   'workforce',
  'accounting':   'accounting',
  'expense':      'expense',
  'approvals':    'approvals',
  'documents':    'documents',
  'payroll':      'payroll',
  'reports':      'reports',
};

// ─── Permission Matrix ────────────────────────────────────────────────────────
// Format: { module: actions[] }
type ModuleAccess = Partial<Record<AppModule, AppAction[]>>;
const ALL_ACTIONS: AppAction[] = ['view', 'create', 'edit', 'delete', 'approve'];
const READ_ONLY: AppAction[] = ['view'];
const READ_WRITE: AppAction[] = ['view', 'create', 'edit'];
const NO_DELETE: AppAction[] = ['view', 'create', 'edit', 'approve'];

const PERMISSIONS: Record<ERPUserRole, ModuleAccess> = {

  'Super Admin': {
    dashboard:  ALL_ACTIONS,
    crm:        ALL_ACTIONS,
    sales:      ALL_ACTIONS,
    purchase:   ALL_ACTIONS,
    inventory:  ALL_ACTIONS,
    project:    ALL_ACTIONS,
    workforce:  ALL_ACTIONS,
    accounting: ALL_ACTIONS,
    expense:    ALL_ACTIONS,
    approvals:  ALL_ACTIONS,
    documents:  ALL_ACTIONS,
    payroll:    ALL_ACTIONS,
    reports:    ALL_ACTIONS,
  },

  'Company Admin': {
    dashboard:  ALL_ACTIONS,
    crm:        ALL_ACTIONS,
    sales:      ALL_ACTIONS,
    purchase:   ALL_ACTIONS,
    inventory:  ALL_ACTIONS,
    project:    ALL_ACTIONS,
    workforce:  ALL_ACTIONS,
    accounting: ALL_ACTIONS,
    expense:    ALL_ACTIONS,
    approvals:  ALL_ACTIONS,
    documents:  ALL_ACTIONS,
    payroll:    ALL_ACTIONS,
    reports:    ALL_ACTIONS,
  },

  'Project Manager': {
    dashboard:  READ_ONLY,
    crm:        READ_ONLY,
    project:    ALL_ACTIONS,
    inventory:  READ_ONLY,
    expense:    READ_WRITE,
    documents:  READ_WRITE,
    payroll:    READ_ONLY,
    reports:    READ_ONLY,
  },

  'Sales': {
    dashboard:  READ_ONLY,
    crm:        ALL_ACTIONS,
    sales:      ALL_ACTIONS,
    documents:  READ_WRITE,
    payroll:    READ_ONLY,
    reports:    READ_ONLY,
  },

  'Purchasing': {
    dashboard:  READ_ONLY,
    purchase:   ALL_ACTIONS,
    inventory:  READ_ONLY,
    expense:    READ_WRITE,
    documents:  READ_WRITE,
    payroll:    READ_ONLY,
    reports:    READ_ONLY,
  },

  'Warehouse Staff': {
    inventory:  ALL_ACTIONS,
    documents:  READ_ONLY,
    payroll:    READ_ONLY,
  },

  'Site Engineer': {
    dashboard:  READ_ONLY,
    project:    READ_WRITE,
    expense:    READ_WRITE,
    documents:  READ_WRITE,
    payroll:    READ_ONLY,
  },

  'HR': {
    dashboard:  READ_ONLY,
    expense:    NO_DELETE,
    approvals:  NO_DELETE,
    payroll:    ALL_ACTIONS,
    documents:  READ_WRITE,
    reports:    READ_ONLY,
  },

  'Accountant': {
    dashboard:  READ_ONLY,
    sales:      READ_ONLY,
    purchase:   READ_ONLY,
    accounting: ALL_ACTIONS,
    expense:    ALL_ACTIONS,
    approvals:  ALL_ACTIONS,
    payroll:    READ_ONLY,
    documents:  READ_WRITE,
    reports:    READ_ONLY,
  },

  'Employee': {
    expense:    READ_WRITE,
    documents:  READ_ONLY,
    payroll:    READ_ONLY,
  },
};

// ─── Helper functions ─────────────────────────────────────────────────────────

/** Check if a role can perform an action on a module */
export function checkPermission(
  role: ERPUserRole,
  action: AppAction,
  module: AppModule
): boolean {
  const rolePerms = PERMISSIONS[role];
  if (!rolePerms) return false;
  const modulePerms = rolePerms[module];
  if (!modulePerms) return false;
  return modulePerms.includes(action);
}

/** Get all modules a role can view */
export function getAccessibleModules(role: ERPUserRole): AppModule[] {
  const rolePerms = PERMISSIONS[role];
  if (!rolePerms) return [];
  return (Object.keys(rolePerms) as AppModule[]).filter(
    (mod) => rolePerms[mod]?.includes('view')
  );
}

/** Get module from route segment */
export function getModuleFromRoute(segment: string): AppModule | null {
  return ROUTE_MODULE_MAP[segment] ?? null;
}
