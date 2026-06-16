'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useERP } from '@/context/erp-context';
import { usePayrollState } from '@/hooks/use-payroll-state';
import {
  Users, Clock, MapPin, Calendar, ClipboardList, CheckCircle,
  FileText, BarChart3, ShieldAlert, Check, X, Plus, Trash2,
  Mail, Download, Printer, Search, RefreshCw, Send, Lock
} from 'lucide-react';

export function HRPayrollDashboard() {
  const { t, users, employees } = useERP();
  const {
    shifts, addShift, deleteShift,
    locations, addLocation, deleteLocation,
    attendance,
    leaveRequests, approveLeave, rejectLeave,
    otRequests, approveOT, rejectOT,
    adjustments, approveAdjustment, rejectAdjustment,
    payslips, calculateMonthPayroll, lockPayroll,
    sendPayslipEmail, sendBulkEmails,
    emailLogs, auditLogs
  } = usePayrollState();

  // Active UI Tab - connected to URL query parameters
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = (searchParams.get('tab') || 'dashboard') as 'dashboard' | 'logs' | 'locations' | 'shifts' | 'leaves' | 'ot' | 'adjustments' | 'timesheet' | 'calculations' | 'delivery' | 'reports' | 'audit';

  const setActiveTab = (tab: string) => {
    router.replace(`/payroll?tab=${tab}`);
  };

  // Local state for forms
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [searchName, setSearchName] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form states for Location CRUD
  const [locName, setLocName] = useState('');
  const [locLat, setLocLat] = useState('');
  const [locLng, setLocLng] = useState('');
  const [locRadius, setLocRadius] = useState(100);

  // Form states for Shift CRUD
  const [shiftName, setShiftName] = useState('');
  const [shiftStart, setShiftStart] = useState('08:00');
  const [shiftEnd, setShiftEnd] = useState('17:00');
  const [shiftGrace, setShiftGrace] = useState(15);
  const [shiftBreak, setShiftBreak] = useState(60);
  const [shiftOTRate, setShiftOTRate] = useState(1.5);

  // Success toast state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Generate complete employees list mapped from users & seed employees
  const payrollEmployees = users
    .filter(u => ['u2', 'u3', 'u4', 'u5', 'u6', 'u8'].includes(u.id))
    .map(u => {
      const emp = employees.find(e => e.user_id === u.id);
      return {
        id: emp?.id || `emp-${u.id}`,
        name: u.full_name,
        email: u.email,
        position: emp?.position || (u.id === 'u2' ? 'Project Manager' : u.id === 'u3' ? 'Sales Exec' : u.id === 'u5' ? 'Warehouse Manager' : 'Operations Staff'),
        salary: emp?.salary || (u.id === 'u2' ? 7500 : u.id === 'u3' ? 6000 : u.id === 'u5' ? 5800 : 5000),
        department: u.id === 'u2' || u.id === 'u6' ? 'Engineering Operations' : u.id === 'u8' ? 'Finance & Accounting' : u.id === 'u5' ? 'Warehouse Operations' : 'Sales & Marketing',
        active: true
      };
    });

  // Calculate statistics
  const todayStr = '2026-06-15';
  const todayLogs = attendance.filter(log => log.date === todayStr);
  const totalEmployees = payrollEmployees.length;
  const activeTodayCount = todayLogs.filter(log => log.status !== 'absent').length;
  const lateTodayCount = todayLogs.filter(log => log.status === 'late').length;
  const absentTodayCount = totalEmployees - activeTodayCount;
  const onLeaveTodayCount = leaveRequests.filter(req => req.status === 'approved' && req.startDate <= todayStr && req.endDate >= todayStr).length;

  const currentMonthSlips = payslips.filter(p => p.month === selectedMonth);
  const totalPayrollCost = currentMonthSlips.reduce((sum, p) => sum + p.netPay, 0);
  const totalOTHours = currentMonthSlips.reduce((sum, p) => sum + p.otHours, 0);

  // Handlers
  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName || !locLat || !locLng) return;
    const newLoc = {
      id: `loc-${Date.now()}`,
      name: locName,
      lat: Number(locLat),
      lng: Number(locLng),
      radius: Number(locRadius)
    };
    addLocation(newLoc);
    setLocName('');
    setLocLat('');
    setLocLng('');
    setLocRadius(100);
    triggerToast(t('Location added successfully!'));
  };

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftName) return;
    const newShift = {
      id: `sh-${Date.now()}`,
      name: shiftName,
      startTime: shiftStart,
      endTime: shiftEnd,
      graceMinutes: Number(shiftGrace),
      breakMinutes: Number(shiftBreak),
      otRate: Number(shiftOTRate)
    };
    addShift(newShift);
    setShiftName('');
    setShiftStart('08:00');
    setShiftEnd('17:00');
    setShiftGrace(15);
    setShiftBreak(60);
    setShiftOTRate(1.5);
    triggerToast(t('Shift added successfully!'));
  };

  const handleRunCalculation = () => {
    calculateMonthPayroll(selectedMonth, payrollEmployees);
    triggerToast(t('Calculated payroll for month ') + selectedMonth);
  };

  const handleLockPayroll = () => {
    lockPayroll(selectedMonth, 'Emily HR');
    triggerToast(t('Locked payroll sheet for month ') + selectedMonth);
  };

  const handleBulkEmails = () => {
    sendBulkEmails(selectedMonth, 'Emily HR');
    triggerToast(t('Dispatched payslips emails to all locked employees.'));
  };

  const exportSimulatedFile = (type: 'excel' | 'pdf', title: string) => {
    const element = document.createElement('a');
    const fileContent = `Simulated Export Data\nTitle: ${title}\nMonth: ${selectedMonth}\nGenerated At: ${new Date().toISOString()}`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/ /g, '_')}_${selectedMonth}.${type === 'excel' ? 'csv' : 'txt'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerToast(t('Exported file successfully!'));
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto min-h-screen text-xs select-none">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-emerald-500 text-white px-4 py-2.5 shadow-lg border border-emerald-400 flex items-center gap-2 animate-bounce">
          <CheckCircle className="h-4.5 w-4.5" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-semibold mb-1">
            <span>{t('SuccessFactors Suite')}</span>
            <span>/</span>
            <span className="text-zinc-650 dark:text-zinc-350">{t('Payroll & Attendance')}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-zinc-950 dark:text-white" />
            {t('HR Payroll & Attendance Command Center')}
          </h1>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-450 mt-1">
            {t('Corporate dashboard for biometric lock registers, automated contract pay, and secure slips dispatch.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="saas-input bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 font-bold px-3 py-2 text-xs rounded-xl"
          />
          <button
            onClick={handleRunCalculation}
            className="saas-button-primary bg-indigo-650 hover:bg-indigo-600 flex items-center gap-1.5 py-2"
          >
            <RefreshCw className="h-3.5 w-3.5" /> {t('Auto-Calculate Pay')}
          </button>
        </div>
      </div>

      {/* Horizontal Navigation Menu - hidden on desktop since it's now in the sidebar tree */}
      <div className="md:hidden flex overflow-x-auto pb-1 gap-1.5 border-b border-zinc-200/40 dark:border-zinc-850/40 scrollbar-thin">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'logs', label: 'Attendance Logs', icon: Clock },
          { id: 'locations', label: 'Locations', icon: MapPin },
          { id: 'shifts', label: 'Shifts', icon: Calendar },
          { id: 'leaves', label: 'Leaves Approval', icon: ClipboardList },
          { id: 'ot', label: 'OT Approval', icon: Clock },
          { id: 'adjustments', label: 'Adjustments', icon: FileText },
          { id: 'timesheet', label: 'Monthly Timesheet', icon: ClipboardList },
          { id: 'calculations', label: 'Calculations Grid', icon: RefreshCw },
          { id: 'delivery', label: 'Payslip Delivery', icon: Mail },
          { id: 'reports', label: 'Reports Hub', icon: BarChart3 },
          { id: 'audit', label: 'Audit Trail', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-450 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(tab.label)}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            {[
              { label: 'Active Today', val: activeTodayCount, desc: 'Clocked in staff', color: 'text-emerald-500' },
              { label: 'Late Today', val: lateTodayCount, desc: 'Past shift hours', color: 'text-amber-500' },
              { label: 'Absent Today', val: absentTodayCount, desc: 'No punches today', color: 'text-rose-500' },
              { label: 'On Leave Today', val: onLeaveTodayCount, desc: 'Approved requests', color: 'text-blue-500' },
              { label: 'Month OT Hours', val: `${totalOTHours} Hrs`, desc: 'Approved Overtime', color: 'text-indigo-500' },
              { label: 'Total Payroll Cost', val: `$${totalPayrollCost.toLocaleString()}`, desc: 'Selected month cost', color: 'text-zinc-900 dark:text-white' }
            ].map((stat, i) => (
              <div key={i} className="saas-card p-4 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t(stat.label)}</span>
                <div className={`text-base font-black font-mono mt-1 ${stat.color}`}>{stat.val}</div>
                <span className="text-[9px] text-zinc-450 dark:text-zinc-550 mt-0.5">{t(stat.desc)}</span>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart A: Daily Attendance (CSS Bar representation) */}
            <div className="saas-card p-5 space-y-4">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Daily Attendance Ratio (Last 7 Days)')}</h3>
              <div className="h-48 flex items-end justify-between gap-2.5 pt-6 border-b border-zinc-200/40 dark:border-zinc-800/40">
                {Array.from({ length: 7 }, (_, idx) => {
                  const dayMap = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                  const onTimePct = [85, 90, 78, 92, 88, 45, 10][idx];
                  const latePct = [10, 8, 15, 5, 8, 15, 5][idx];
                  const absentPct = [5, 2, 7, 3, 4, 40, 85][idx];
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full flex flex-col justify-end h-full relative rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        <div style={{ height: `${onTimePct}%` }} className="bg-emerald-500/80 hover:bg-emerald-500 transition-all" title={`On time: ${onTimePct}%`} />
                        <div style={{ height: `${latePct}%` }} className="bg-amber-500/80 hover:bg-amber-500 transition-all" title={`Late: ${latePct}%`} />
                        <div style={{ height: `${absentPct}%` }} className="bg-rose-500/80 hover:bg-rose-500 transition-all" title={`Absent: ${absentPct}%`} />
                      </div>
                      <span className="text-[9px] font-bold text-zinc-450 mt-1.5">{dayMap[idx]}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-4 text-[9px] font-semibold">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />{t('On-Time')}</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />{t('Late')}</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />{t('Absent')}</span>
              </div>
            </div>

            {/* Chart B: Department Payroll Breakdown */}
            <div className="saas-card p-5 space-y-4">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Payroll Cost By Department ($)')}</h3>
              <div className="space-y-3 pt-4">
                {[
                  { dept: 'Engineering Operations', cost: 17777, color: 'bg-indigo-500' },
                  { dept: 'Finance & Accounting', cost: 8479, color: 'bg-teal-500' },
                  { dept: 'Warehouse Operations', cost: 5800, color: 'bg-amber-500' },
                  { dept: 'Sales & Marketing', cost: 6000, color: 'bg-pink-500' }
                ].map((item, i) => {
                  const maxCost = 20000;
                  const widthPct = Math.min((item.cost / maxCost) * 100, 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between font-bold text-[10px]">
                        <span className="text-zinc-650 dark:text-zinc-350">{t(item.dept)}</span>
                        <span className="font-mono text-zinc-900 dark:text-white">${item.cost.toLocaleString()}</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-150 dark:bg-zinc-900 overflow-hidden">
                        <div style={{ width: `${widthPct}%` }} className={`h-full rounded-full ${item.color}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-4 saas-card p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-4">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Attendance Logs Archive')}</h3>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder={t('Search employee...')}
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="saas-input py-1.5 px-3 text-xs w-full sm:w-44"
              />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="saas-input py-1.5 px-2 text-xs w-full sm:w-36"
              >
                <option value="All">{t('All Departments')}</option>
                <option value="Engineering Operations">{t('Engineering Operations')}</option>
                <option value="Finance & Accounting">{t('Finance & Accounting')}</option>
                <option value="Warehouse Operations">{t('Warehouse Operations')}</option>
                <option value="Sales & Marketing">{t('Sales & Marketing')}</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>{t('Date')}</th>
                  <th>{t('Employee')}</th>
                  <th>{t('Department')}</th>
                  <th>{t('Check In')}</th>
                  <th>{t('Check Out')}</th>
                  <th>{t('Verification Details')}</th>
                  <th>{t('Status')}</th>
                </tr>
              </thead>
              <tbody>
                {attendance
                  .filter(log => {
                    const matchName = log.employeeName.toLowerCase().includes(searchName.toLowerCase());
                    const matchDept = deptFilter === 'All' || log.department === deptFilter;
                    return matchName && matchDept;
                  })
                  .map(log => {
                    return (
                      <tr key={log.id}>
                        <td suppressHydrationWarning className="font-mono">{log.date}</td>
                        <td className="font-bold text-zinc-900 dark:text-white">{log.employeeName}</td>
                        <td>{t(log.department)}</td>
                        <td suppressHydrationWarning className="font-mono text-emerald-600 dark:text-emerald-450 font-bold">
                          {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </td>
                        <td suppressHydrationWarning className="font-mono text-zinc-600 dark:text-zinc-400">
                          {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('Active')}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {log.photoIn && (
                              <img src={log.photoIn} alt="Verification" className="h-6 w-6 rounded-full object-cover border border-zinc-200" />
                            )}
                            <div className="text-[9px] text-zinc-400 font-mono">
                              <div>GPS: {log.gpsIn}</div>
                              {log.deviceIn && <div>Dev: {log.deviceIn}</div>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${
                            log.status === 'on_time'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200/20'
                              : log.status === 'late'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/20'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-200/20'
                          }`}>
                            {t(log.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Location form */}
          <div className="saas-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Register Check-in Location')}</h3>
            <form onSubmit={handleAddLocation} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Location Name *')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summit Office HQ"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  className="saas-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Latitude *')}</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    placeholder="e.g. 40.7128"
                    value={locLat}
                    onChange={(e) => setLocLat(e.target.value)}
                    className="saas-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Longitude *')}</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    placeholder="e.g. -74.0060"
                    value={locLng}
                    onChange={(e) => setLocLng(e.target.value)}
                    className="saas-input"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Allowed Radius (Meters) *')}</label>
                <input
                  type="number"
                  required
                  min="10"
                  max="1000"
                  value={locRadius}
                  onChange={(e) => setLocRadius(Number(e.target.value))}
                  className="saas-input"
                />
              </div>
              <button type="submit" className="saas-button-primary w-full flex items-center justify-center gap-1.5 py-2">
                <Plus className="h-3.5 w-3.5" /> {t('Create Location')}
              </button>
            </form>
          </div>

          {/* Locations list */}
          <div className="saas-card p-5 lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Active Geofence Areas')}</h3>
            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>{t('Name')}</th>
                    <th>{t('Coordinates')}</th>
                    <th>{t('Allowed Radius')}</th>
                    <th>{t('Status')}</th>
                    <th className="text-right">{t('Action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map(loc => (
                    <tr key={loc.id}>
                      <td className="font-bold text-zinc-850 dark:text-zinc-200">{loc.name}</td>
                      <td className="font-mono text-zinc-400">{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</td>
                      <td className="font-mono font-semibold">{loc.radius}m</td>
                      <td>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-200/20">
                          {t('Active')}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => {
                            deleteLocation(loc.id);
                            triggerToast(t('Deleted location ') + loc.name);
                          }}
                          className="text-rose-500 hover:text-rose-600 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shifts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shift form */}
          <div className="saas-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Create Shift Policy')}</h3>
            <form onSubmit={handleAddShift} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Shift Name *')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Night Shift"
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                  className="saas-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Start Time *')}</label>
                  <input
                    type="time"
                    required
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="saas-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('End Time *')}</label>
                  <input
                    type="time"
                    required
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="saas-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Grace (Min)')}</label>
                  <input
                    type="number"
                    value={shiftGrace}
                    onChange={(e) => setShiftGrace(Number(e.target.value))}
                    className="saas-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Break (Min)')}</label>
                  <input
                    type="number"
                    value={shiftBreak}
                    onChange={(e) => setShiftBreak(Number(e.target.value))}
                    className="saas-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('OT Rate')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={shiftOTRate}
                    onChange={(e) => setShiftOTRate(Number(e.target.value))}
                    className="saas-input"
                  />
                </div>
              </div>
              <button type="submit" className="saas-button-primary w-full flex items-center justify-center gap-1.5 py-2">
                <Plus className="h-3.5 w-3.5" /> {t('Create Shift Policy')}
              </button>
            </form>
          </div>

          {/* Shifts list */}
          <div className="saas-card p-5 lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Shift Configurations')}</h3>
            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>{t('Name')}</th>
                    <th>{t('Time Window')}</th>
                    <th>{t('Grace Period')}</th>
                    <th>{t('Break Duration')}</th>
                    <th>{t('OT Multiplier')}</th>
                    <th className="text-right">{t('Action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map(sh => (
                    <tr key={sh.id}>
                      <td className="font-bold text-zinc-850 dark:text-zinc-200">{t(sh.name)}</td>
                      <td className="font-mono text-zinc-600 dark:text-zinc-350">{sh.startTime} - {sh.endTime}</td>
                      <td className="font-mono">{sh.graceMinutes} {t('min')}</td>
                      <td className="font-mono">{sh.breakMinutes} {t('min')}</td>
                      <td className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{sh.otRate}x</td>
                      <td className="text-right">
                        <button
                          onClick={() => {
                            deleteShift(sh.id);
                            triggerToast(t('Deleted shift ') + sh.name);
                          }}
                          className="text-rose-500 hover:text-rose-600 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="saas-card p-5 space-y-4">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Leave Requests Approvals')}</h3>
          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>{t('Employee')}</th>
                  <th>{t('Department')}</th>
                  <th>{t('Type')}</th>
                  <th>{t('Date Range')}</th>
                  <th>{t('Reason')}</th>
                  <th>{t('Status')}</th>
                  <th className="text-center">{t('Decisions')}</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map(req => (
                  <tr key={req.id}>
                    <td className="font-bold text-zinc-900 dark:text-white">{req.employeeName}</td>
                    <td>{t(req.department)}</td>
                    <td className="capitalize font-semibold text-zinc-650 dark:text-zinc-350">{t(req.type)}</td>
                    <td suppressHydrationWarning className="font-mono">{req.startDate} {t('to')} {req.endDate}</td>
                    <td className="italic text-zinc-550 max-w-[200px] truncate">{req.reason}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200/20'
                          : req.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-200/20'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/20'
                      }`}>
                        {t(req.status)}
                      </span>
                    </td>
                    <td className="text-center">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              approveLeave(req.id, 'Emily HR');
                              triggerToast(t('Approved leave request!'));
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded p-1 transition cursor-pointer"
                            title={t('Approve')}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              rejectLeave(req.id, 'Emily HR');
                              triggerToast(t('Rejected leave request!'));
                            }}
                            className="bg-rose-500 hover:bg-rose-600 text-white rounded p-1 transition cursor-pointer"
                            title={t('Reject')}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {t('By')} {req.approvedBy}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ot' && (
        <div className="saas-card p-5 space-y-4">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Overtime Registration Approvals')}</h3>
          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>{t('Employee')}</th>
                  <th>{t('Department')}</th>
                  <th>{t('Date')}</th>
                  <th>{t('OT Hours')}</th>
                  <th>{t('OT Category')}</th>
                  <th>{t('Reason')}</th>
                  <th>{t('Status')}</th>
                  <th className="text-center">{t('Decisions')}</th>
                </tr>
              </thead>
              <tbody>
                {otRequests.map(req => (
                  <tr key={req.id}>
                    <td className="font-bold text-zinc-900 dark:text-white">{req.employeeName}</td>
                    <td>{t(req.department)}</td>
                    <td suppressHydrationWarning className="font-mono">{req.date}</td>
                    <td className="font-mono font-bold">{req.hours} Hrs</td>
                    <td className="capitalize font-semibold">{t(req.type)}</td>
                    <td className="italic text-zinc-550 max-w-[200px] truncate">{req.reason}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200/20'
                          : req.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-200/20'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/20'
                      }`}>
                        {t(req.status)}
                      </span>
                    </td>
                    <td className="text-center">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              approveOT(req.id, 'Emily HR');
                              triggerToast(t('Approved Overtime!'));
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded p-1 transition cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              rejectOT(req.id, 'Emily HR');
                              triggerToast(t('Rejected Overtime!'));
                            }}
                            className="bg-rose-500 hover:bg-rose-600 text-white rounded p-1 transition cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {t('By')} {req.approvedBy}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'adjustments' && (
        <div className="saas-card p-5 space-y-4">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Attendance Adjustments Approvals')}</h3>
          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>{t('Employee')}</th>
                  <th>{t('Department')}</th>
                  <th>{t('Target Date')}</th>
                  <th>{t('Requested Times')}</th>
                  <th>{t('Reason')}</th>
                  <th>{t('Status')}</th>
                  <th className="text-center">{t('Decisions')}</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map(req => (
                  <tr key={req.id}>
                    <td className="font-bold text-zinc-900 dark:text-white">{req.employeeName}</td>
                    <td>{t(req.department)}</td>
                    <td suppressHydrationWarning className="font-mono">{req.date}</td>
                    <td className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      In: {req.requestedCheckIn} | Out: {req.requestedCheckOut}
                    </td>
                    <td className="italic text-zinc-550 max-w-[200px] truncate">{req.reason}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200/20'
                          : req.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-200/20'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/20'
                      }`}>
                        {t(req.status)}
                      </span>
                    </td>
                    <td className="text-center">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              approveAdjustment(req.id, 'Emily HR');
                              triggerToast(t('Approved adjustment!'));
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded p-1 transition cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              rejectAdjustment(req.id, 'Emily HR');
                              triggerToast(t('Rejected adjustment!'));
                            }}
                            className="bg-rose-500 hover:bg-rose-600 text-white rounded p-1 transition cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {t('By')} {req.approvedBy}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'timesheet' && (
        <div className="saas-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-4">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Monthly Timesheets Matrix')}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => exportSimulatedFile('excel', `Timesheet_Report_${selectedMonth}`)}
                className="saas-button-secondary inline-flex items-center gap-1 py-1.5 text-[10px] uppercase font-bold"
              >
                <Download className="h-3 w-3" /> Export Excel
              </button>
              <button
                onClick={() => exportSimulatedFile('pdf', `Timesheet_Report_${selectedMonth}`)}
                className="saas-button-secondary inline-flex items-center gap-1 py-1.5 text-[10px] uppercase font-bold"
              >
                <Printer className="h-3 w-3" /> Export PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>{t('Employee')}</th>
                  <th>{t('Department')}</th>
                  <th className="text-center">{t('Work Days')}</th>
                  <th className="text-center">{t('Total Hours')}</th>
                  <th className="text-center">{t('OT Hours')}</th>
                  <th className="text-center">{t('Late Occurrences')}</th>
                  <th className="text-center">{t('Leaves Approved')}</th>
                </tr>
              </thead>
              <tbody>
                {payrollEmployees.map(emp => {
                  const logs = attendance.filter(log => log.employeeId === emp.id && log.date.startsWith(selectedMonth));
                  const workdays = logs.filter(log => log.status !== 'absent').length || 20;
                  const totalHrs = workdays * 8;
                  
                  const approvedOT = otRequests.filter(req => req.employeeId === emp.id && req.date.startsWith(selectedMonth) && req.status === 'approved');
                  const otHours = approvedOT.reduce((sum, r) => sum + r.hours, 0);

                  const lateCount = logs.filter(log => log.status === 'late').length;
                  const leavesCount = leaveRequests.filter(req => req.employeeId === emp.id && req.startDate.startsWith(selectedMonth) && req.status === 'approved').length;

                  return (
                    <tr key={emp.id}>
                      <td className="font-bold text-zinc-900 dark:text-white">{emp.name}</td>
                      <td>{t(emp.department)}</td>
                      <td className="text-center font-mono font-bold">{workdays}</td>
                      <td className="text-center font-mono">{totalHrs}</td>
                      <td className="text-center font-mono text-indigo-600 dark:text-indigo-400 font-bold">{otHours}</td>
                      <td className="text-center font-mono text-amber-500 font-bold">{lateCount}</td>
                      <td className="text-center font-mono text-blue-500 font-bold">{leavesCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'calculations' && (
        <div className="saas-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Bảng tính lương tự động')}</h3>
              <p className="text-[9px] text-zinc-450 mt-0.5">{t('Calculated via dynamic formula: Base Salary + OT + Allowance + Bonus - Deductions - PIT - Ins = Net Pay.')}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleLockPayroll}
                className="saas-button-primary bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center gap-1 py-1.5 text-[10px] uppercase font-bold"
              >
                <Lock className="h-3.5 w-3.5" /> {t('Lock payroll')}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="saas-table text-[10px]">
              <thead>
                <tr>
                  <th>{t('Employee')}</th>
                  <th className="text-right">{t('Base Salary')}</th>
                  <th className="text-right">{t('OT Hours')}</th>
                  <th className="text-right">{t('OT Pay')}</th>
                  <th className="text-right">{t('Allowance')}</th>
                  <th className="text-right">{t('Bonus')}</th>
                  <th className="text-right">{t('Deductions')}</th>
                  <th className="text-right">{t('Bảo hiểm')}</th>
                  <th className="text-right">{t('Thuế')}</th>
                  <th className="text-right font-black">{t('Net Pay')}</th>
                  <th className="text-center">{t('Status')}</th>
                </tr>
              </thead>
              <tbody>
                {currentMonthSlips.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-6 text-zinc-450 italic">
                      {t('No payroll data calculated yet. Click "Auto-Calculate Pay" at the top right to start.')}
                    </td>
                  </tr>
                ) : (
                  currentMonthSlips.map(p => (
                    <tr key={p.id}>
                      <td className="font-bold text-zinc-900 dark:text-white">{p.employeeName}</td>
                      <td className="text-right font-mono font-semibold">${p.baseSalary.toLocaleString()}</td>
                      <td className="text-right font-mono">{p.otHours}</td>
                      <td className="text-right font-mono">${p.otPay.toLocaleString()}</td>
                      <td className="text-right font-mono">${p.allowance.toLocaleString()}</td>
                      <td className="text-right font-mono">${p.bonus.toLocaleString()}</td>
                      <td className="text-right font-mono text-rose-500">-${p.deductions.toLocaleString()}</td>
                      <td className="text-right font-mono text-rose-500">-${p.insurance.toLocaleString()}</td>
                      <td className="text-right font-mono text-rose-500">-${p.tax.toLocaleString()}</td>
                      <td className="text-right font-mono font-black text-emerald-600 dark:text-emerald-450">${p.netPay.toLocaleString()}</td>
                      <td className="text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                          p.status === 'sent'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200/20'
                            : p.status === 'locked'
                            ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-transparent'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/20'
                        }`}>
                          {t(p.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'delivery' && (
        <div className="space-y-6">
          <div className="saas-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-4">
              <div>
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Bulk Deliver Payslips')}</h3>
                <p className="text-[9px] text-zinc-450 mt-0.5">{t('Locks payslips to "sent" status and dispatches secure PDF invoices to registered Supabase Auth emails.')}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkEmails}
                  className="saas-button-primary bg-indigo-650 hover:bg-indigo-600 flex items-center gap-1.5 py-1.5 text-[10px] uppercase font-bold"
                >
                  <Send className="h-3.5 w-3.5" /> {t('Send Bulk Emails')}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>{t('Employee')}</th>
                    <th>{t('Email Address')}</th>
                    <th className="text-right">{t('Net Pay')}</th>
                    <th>{t('Status')}</th>
                    <th>{t('Last Sent Timestamp')}</th>
                    <th className="text-right">{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthSlips.map(p => (
                    <tr key={p.id}>
                      <td className="font-bold text-zinc-900 dark:text-white">{p.employeeName}</td>
                      <td className="font-mono text-zinc-500">{p.email}</td>
                      <td className="text-right font-mono font-bold">${p.netPay.toLocaleString()}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                          p.status === 'sent'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border-emerald-200/20'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/20'
                        }`}>
                          {t(p.status)}
                        </span>
                      </td>
                      <td suppressHydrationWarning className="font-mono text-zinc-400">
                        {p.lastSentAt ? new Date(p.lastSentAt).toLocaleString() : 'Never'}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => {
                            sendPayslipEmail(p.id, 'Emily HR');
                            triggerToast(t('Sent payslip email to ') + p.employeeName);
                          }}
                          className="saas-button-secondary py-1 text-[9px] uppercase font-bold inline-flex items-center gap-1"
                        >
                          <Send className="h-3 w-3" /> {t('Send Email')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Email Dispatch logs */}
          <div className="saas-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Email Logs Tracker')}</h3>
            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>{t('Date Sent')}</th>
                    <th>{t('Employee')}</th>
                    <th>{t('Email Address')}</th>
                    <th>{t('Target Month')}</th>
                    <th>{t('Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.map(log => (
                    <tr key={log.id}>
                      <td suppressHydrationWarning className="font-mono text-zinc-500">{new Date(log.sentAt).toLocaleString()}</td>
                      <td className="font-bold text-zinc-850 dark:text-zinc-200">{log.employeeName}</td>
                      <td className="font-mono">{log.email}</td>
                      <td className="font-mono">{log.month}</td>
                      <td>
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-250/20">
                          <Check className="h-2.5 w-2.5" /> SUCCESS
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="saas-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('System Payroll Reports Center')}</h3>
            <button
              onClick={() => exportSimulatedFile('pdf', 'Payroll_Summary_Report')}
              className="saas-button-secondary flex items-center gap-1.5 py-1.5 text-[10px] uppercase font-bold"
            >
              <Download className="h-3.5 w-3.5" /> PDF Download
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Daily Attendance Report', 'Monthly Hours Aggregations', 'Late & Off-time Incident Logs',
              'Absenteeism Registry', 'Overtime Hours Audit', 'Leaves Distribution Chart',
              'Human Capital Budget Analysis', 'Departmental Cost Breakdown', 'Net Salaries Allocation'
            ].map((report, idx) => (
              <div key={idx} className="border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-4 space-y-3 bg-zinc-50/10 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-zinc-850 dark:text-zinc-200">{t(report)}</span>
                  <FileText className="h-4.5 w-4.5 text-zinc-400" />
                </div>
                <p className="text-[9px] text-zinc-400">{t('Generates analytical summary chart with direct employee metrics for the selected month.')}</p>
                <div className="flex justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900/60">
                  <button
                    onClick={() => exportSimulatedFile('excel', report)}
                    className="text-indigo-650 hover:underline font-bold text-[9px]"
                  >
                    CSV/EXCEL
                  </button>
                  <button
                    onClick={() => exportSimulatedFile('pdf', report)}
                    className="text-indigo-650 hover:underline font-bold text-[9px]"
                  >
                    PDF PREVIEW
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="saas-card p-5 space-y-4">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Audit Logs Timeline')}</h3>
          <div className="overflow-x-auto">
            <table className="saas-table font-mono text-[9px]">
              <thead>
                <tr>
                  <th>{t('Timestamp')}</th>
                  <th>{t('Operator')}</th>
                  <th>{t('Action Key')}</th>
                  <th>{t('Action Details')}</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td suppressHydrationWarning className="text-zinc-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="font-bold text-zinc-850 dark:text-zinc-200">{log.user}</td>
                    <td className="text-indigo-600 dark:text-indigo-400 font-bold">{log.action}</td>
                    <td className="text-zinc-600 dark:text-zinc-350">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
