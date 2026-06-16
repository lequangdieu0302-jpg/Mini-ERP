'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';
import React, { useState, useEffect } from 'react';
import { useERP } from '@/context/erp-context';
import { 
  Plus, Users, Search, Mail, Calendar, CreditCard,
  Building, Check, CheckCircle2, ShieldAlert, Award, X, Edit2
} from 'lucide-react';
import { Employee, ERPUserRole } from '@/types/erp';
import { createClient } from '@/utils/supabase/client';

export default function Workforce() {
  const supabase = createClient();
  const { 
    employees, users, userCompanies, updateUserRole, 
    addEmployee, updateEmployee, t 
  } = useERP();
  
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states for registering new employee
  const [selectedUserId, setSelectedUserId] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [dept, setDept] = useState('dept1'); // dept1 = Engineering, dept2 = Finance
  const [hireDate, setHireDate] = useState('');
  const [selectedRole, setSelectedRole] = useState('Employee');

  // Modal / Form states for editing employee
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editPosition, setEditPosition] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editDept, setEditDept] = useState('dept1');
  const [editHireDate, setEditHireDate] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editRole, setEditRole] = useState<ERPUserRole>('Employee');

  // Find users who do not have an employee profile yet
  const unassignedUsers = users.filter(u => !employees.some(e => e.user_id === u.id));

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !position) return;

    const department_id = dept === 'dept2' 
      ? '90909090-2222-2222-2222-222222222222' 
      : '90909090-1111-1111-1111-111111111111';

    const success = await addEmployee({
      user_id: selectedUserId,
      position,
      hire_date: hireDate || new Date().toISOString().split('T')[0],
      salary: salary ? Number(salary) : undefined,
      department_id,
      active: true
    });

    if (success) {
      await updateUserRole(selectedUserId, selectedRole as ERPUserRole);
      // Reset
      setSelectedUserId('');
      setPosition('');
      setSalary('');
      setHireDate('');
      setSelectedRole('Employee');
      setIsAdding(false);
    }
  };

  const handleEditClick = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditPosition(emp.position);
    setEditSalary(emp.salary ? String(emp.salary) : '');
    setEditDept(emp.department_id === '90909090-2222-2222-2222-222222222222' ? 'dept2' : 'dept1');
    setEditHireDate(emp.hire_date);
    setEditActive(emp.active ?? true);
    
    // Find current system role
    const userCompany = userCompanies.find(uc => uc.user_id === emp.user_id && uc.company_id === emp.company_id);
    setEditRole(userCompany ? (userCompany.role as ERPUserRole) : 'Employee');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const department_id = editDept === 'dept2' 
      ? '90909090-2222-2222-2222-222222222222' 
      : '90909090-1111-1111-1111-111111111111';

    const success = await updateEmployee(editingEmployee.id, {
      position: editPosition,
      salary: editSalary ? Number(editSalary) : undefined,
      hire_date: editHireDate,
      department_id,
      active: editActive
    });

    if (success && editingEmployee.user_id) {
      await updateUserRole(editingEmployee.user_id, editRole);
    }

    setEditingEmployee(null);
  };

  const filteredEmployees = employees.filter(emp => {
    const u = users.find(usr => usr.id === emp.user_id);
    const fullname = u ? u.full_name : t('New Staff member');
    return fullname.toLowerCase().includes(searchTerm.toLowerCase()) || 
           emp.position.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <PermissionGuard module="workforce">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto min-h-screen text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-55 tracking-tight">{t('Workforce Directory')}</h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t('Manage HR files, direct salaries, direct payroll classifications and profiles.')}</p>
        </div>

        <button 
          onClick={() => { setIsAdding(!isAdding); setEditingEmployee(null); }}
          className="saas-button-primary flex items-center gap-1.5"
        >
          {isAdding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {isAdding ? t('Cancel') : t('Register Employee')}
        </button>
      </div>

      {/* Add Employee Form */}
      {isAdding && (
        <form onSubmit={handleRegisterSubmit} className="saas-card p-6 space-y-5 max-w-2xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Register Staff Member')}</h3>
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-zinc-400 hover:text-zinc-655"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Select User Account *')}</label>
              <select
                required
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="saas-input"
              >
                <option value="">{t('-- Select Registered User --')}</option>
                {unassignedUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Position / Title *')}</label>
              <input 
                type="text" 
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder={t('e.g. Masonry Foreman')}
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Monthly Direct Salary ($)')}</label>
              <input 
                type="number" 
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="4500"
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Hire Date')}</label>
              <input 
                type="date" 
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Primary Department')}</label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="saas-input"
              >
                <option value="dept1">{t('Engineering Operations')}</option>
                <option value="dept2">{t('Finance & Accounting')}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('System Access Role')}</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="saas-input"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Company Admin">Company Admin</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Sales">Sales</option>
                <option value="Purchasing">Purchasing</option>
                <option value="Warehouse Staff">Warehouse Staff</option>
                <option value="Site Engineer">Site Engineer</option>
                <option value="HR">HR</option>
                <option value="Accountant">Accountant</option>
                <option value="Employee">Employee</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="saas-button-secondary"
            >
              {t('Cancel')}
            </button>
            <button 
              type="submit"
              className="saas-button-primary"
            >
              {t('Save Profile')}
            </button>
          </div>
        </form>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <form onSubmit={handleEditSubmit} className="saas-card p-6 space-y-5 max-w-2xl w-full animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {t('Edit Employee Profile')}
              </h3>
              <button 
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="text-zinc-400 hover:text-zinc-655"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Employee Name')}</label>
                <input 
                  type="text" 
                  disabled
                  value={users.find(u => u.id === editingEmployee.user_id)?.full_name || t('New Staff member')}
                  className="saas-input bg-zinc-100 dark:bg-zinc-900 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Position / Title *')}</label>
                <input 
                  type="text" 
                  required
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Monthly Direct Salary ($)')}</label>
                <input 
                  type="number" 
                  value={editSalary}
                  onChange={(e) => setEditSalary(e.target.value)}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Hire Date')}</label>
                <input 
                  type="date" 
                  value={editHireDate}
                  onChange={(e) => setEditHireDate(e.target.value)}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Primary Department')}</label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="saas-input"
                >
                  <option value="dept1">{t('Engineering Operations')}</option>
                  <option value="dept2">{t('Finance & Accounting')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('System Access Role')}</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as ERPUserRole)}
                  className="saas-input"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Company Admin">Company Admin</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Sales">Sales</option>
                  <option value="Purchasing">Purchasing</option>
                  <option value="Warehouse Staff">Warehouse Staff</option>
                  <option value="Site Engineer">Site Engineer</option>
                  <option value="HR">HR</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-4 md:col-span-2">
                <input 
                  type="checkbox" 
                  id="editActive"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-indigo-655 focus:ring-indigo-500"
                />
                <label htmlFor="editActive" className="text-xs font-bold text-zinc-750 dark:text-zinc-200">
                  {t('Active Duty status (currently working)')}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <button 
                type="button" 
                onClick={() => setEditingEmployee(null)}
                className="saas-button-secondary"
              >
                {t('Cancel')}
              </button>
              <button 
                type="submit"
                className="saas-button-primary"
              >
                {t('Save Changes')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative w-48">
        <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-555" />
        <input 
          type="text" 
          placeholder={t('Search personnel profiles...')} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="saas-input pl-8"
        />
      </div>

      {/* Grid portfolios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => {
          const u = users.find(usr => usr.id === emp.user_id);
          const fullname = u ? u.full_name : t('New Staff member');
          const avatar = u ? u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
          const emailField = u ? u.email : 'new.staff@apexconstruction.com';
          const deptName = (emp.department_id === '90909090-2222-2222-2222-222222222222' || emp.department_id === 'dept2') 
            ? t('Finance') 
            : t('Engineering');
          const userCompany = userCompanies.find(uc => uc.user_id === emp.user_id && uc.company_id === emp.company_id);
          const systemRole = userCompany ? userCompany.role : 'Employee';

          return (
            <div key={emp.id} className="saas-card p-5 space-y-4 hover:border-zinc-350 dark:hover:border-zinc-700 relative group/card">
              
              <button 
                onClick={() => handleEditClick(emp)}
                className="absolute top-3 right-3 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 opacity-0 group-hover/card:opacity-100 transition duration-150 cursor-pointer shadow-sm animate-in fade-in"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center gap-3">
                <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover shrink-0 border border-zinc-200/50 dark:border-zinc-800" />
                <div>
                  <h3 className="text-xs font-bold text-zinc-855 dark:text-zinc-100 leading-snug">{fullname}</h3>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-500 uppercase tracking-wider mt-0.5">
                    <Award className="h-3 w-3" /> {emp.position}
                  </div>
                  {emp.user_id && (
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider">
                      <span>{t('Role:')}</span>
                      <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-[9px] text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider">
                        {t(systemRole)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile fields */}
              <div className="space-y-2 text-[10px] text-zinc-660 dark:text-zinc-400 border-t border-zinc-200/50 dark:border-zinc-850 pt-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{emailField}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>{t('Dept:')} <strong>{deptName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span suppressHydrationWarning>{t('Hired:')} {new Date(emp.hire_date).toLocaleDateString()}</span>
                </div>
                {emp.salary && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>{t('Salary:')} <strong suppressHydrationWarning>${emp.salary.toLocaleString()}/mo</strong></span>
                  </div>
                )}
              </div>

              {/* Active Badge */}
              <div className="pt-3 border-t border-zinc-200/50 dark:border-zinc-850 flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-555">
                <span className="font-mono">EMP-{emp.id.substring(0, 5).toUpperCase()}</span>
                {emp.active ? (
                  <span className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-250/25 dark:border-emerald-900/30">
                    <CheckCircle2 className="h-3 w-3 animate-pulse" /> {t('Active Duty')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-950/20 dark:text-zinc-400 border border-zinc-250/25 dark:border-zinc-900/30">
                    <X className="h-3 w-3" /> {t('Inactive')}
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
    </PermissionGuard>
  );
}
