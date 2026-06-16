'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useERP } from '@/context/erp-context';
import {
  PayrollShift, AttendanceLocation, PayrollAttendanceLog,
  LeaveRequest, OvertimeRequest, AttendanceAdjustment,
  Payslip, EmailLog, PayrollAuditLog
} from '@/types/payroll';

// ─── DTO Conversion Helpers (snake_case to camelCase) ──────────────────────────

const mapDbShift = (s: any): PayrollShift => ({
  id: s.id,
  name: s.name,
  startTime: s.start_time.slice(0, 5), // '08:00:00' -> '08:00'
  endTime: s.end_time.slice(0, 5),
  breakMinutes: s.break_minutes,
  graceMinutes: s.grace_minutes,
  otRate: Number(s.ot_rate)
});

const mapDbLocation = (l: any): AttendanceLocation => ({
  id: l.id,
  name: l.name,
  lat: Number(l.lat),
  lng: Number(l.lng),
  radius: Number(l.radius),
  active: l.active
});

const mapDbAttendance = (a: any): PayrollAttendanceLog => ({
  id: a.id,
  employeeId: a.employee_id,
  employeeName: a.employee_name,
  department: a.department,
  date: a.date,
  checkIn: a.check_in,
  checkOut: a.check_out || undefined,
  gpsIn: a.gps_in,
  gpsOut: a.gps_out || undefined,
  addressIn: a.address_in || undefined,
  addressOut: a.address_out || undefined,
  photoIn: a.photo_in || undefined,
  photoOut: a.photo_out || undefined,
  deviceIn: a.device_in || undefined,
  deviceOut: a.device_out || undefined,
  status: a.status,
  shiftId: a.shift_id,
  overtimeHours: a.overtime_hours ? Number(a.overtime_hours) : 0
});

const mapDbLeave = (l: any): LeaveRequest => ({
  id: l.id,
  employeeId: l.employee_id,
  employeeName: l.employee_name,
  department: l.department,
  type: l.type,
  startDate: l.start_date,
  endDate: l.end_date,
  reason: l.reason,
  status: l.status,
  approvedBy: l.approved_by || undefined,
  createdAt: l.created_at
});

const mapDbOT = (o: any): OvertimeRequest => ({
  id: o.id,
  employeeId: o.employee_id,
  employeeName: o.employee_name,
  department: o.department,
  date: o.date,
  hours: Number(o.hours),
  type: o.type,
  reason: o.reason,
  status: o.status,
  approvedBy: o.approved_by || undefined,
  createdAt: o.created_at
});

const mapDbAdjustment = (a: any): AttendanceAdjustment => ({
  id: a.id,
  employeeId: a.employee_id,
  employeeName: a.employee_name,
  department: a.department,
  date: a.date,
  requestedCheckIn: a.requested_check_in?.slice(0, 5) || undefined,
  requestedCheckOut: a.requested_check_out?.slice(0, 5) || undefined,
  reason: a.reason,
  proofUrl: a.proof_url || undefined,
  status: a.status,
  approvedBy: a.approved_by || undefined,
  createdAt: a.created_at
});

const mapDbPayslip = (p: any): Payslip => ({
  id: p.id,
  employeeId: p.employee_id,
  employeeName: p.employee_name,
  email: p.email,
  department: p.department,
  month: p.month,
  baseSalary: Number(p.base_salary),
  workdays: Number(p.workdays),
  otHours: Number(p.ot_hours),
  otPay: Number(p.ot_pay),
  allowance: Number(p.allowance),
  bonus: Number(p.bonus),
  deductions: Number(p.deductions),
  insurance: Number(p.insurance),
  tax: Number(p.tax),
  netPay: Number(p.net_pay),
  status: p.status,
  lastSentAt: p.last_sent_at || undefined,
  createdAt: p.created_at
});

// ─── Custom State Hook ─────────────────────────────────────────────────────────

export function usePayrollState() {
  const supabase = createClient();
  const { currentUser, activeCompanyId } = useERP();

  const [shifts, setShifts] = useState<PayrollShift[]>([]);
  const [locations, setLocations] = useState<AttendanceLocation[]>([]);
  const [attendance, setAttendance] = useState<PayrollAttendanceLog[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [otRequests, setOTRequests] = useState<OvertimeRequest[]>([]);
  const [adjustments, setAdjustments] = useState<AttendanceAdjustment[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<PayrollAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from Supabase on mount
  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Shifts
        const { data: shiftsData } = await supabase.from('payroll_shifts').select('*');
        if (shiftsData) {
          setShifts(shiftsData.map(mapDbShift));
        }

        // 2. Fetch Locations
        const { data: locsData } = await supabase.from('attendance_locations').select('*');
        if (locsData) {
          setLocations(locsData.map(mapDbLocation));
        }

        // 3. Fetch Attendance Logs
        const { data: attData } = await supabase
          .from('payroll_attendance_logs')
          .select('*')
          .order('date', { ascending: false })
          .order('check_in', { ascending: false });
        if (attData) {
          setAttendance(attData.map(mapDbAttendance));
        }

        // 4. Fetch Leave Requests
        const { data: leavesData } = await supabase
          .from('leave_requests')
          .select('*')
          .order('created_at', { ascending: false });
        if (leavesData) {
          setLeaveRequests(leavesData.map(mapDbLeave));
        }

        // 5. Fetch OT Requests
        const { data: otData } = await supabase
          .from('overtime_requests')
          .select('*')
          .order('created_at', { ascending: false });
        if (otData) {
          setOTRequests(otData.map(mapDbOT));
        }

        // 6. Fetch Adjustments
        const { data: adjsData } = await supabase
          .from('attendance_adjustments')
          .select('*')
          .order('created_at', { ascending: false });
        if (adjsData) {
          setAdjustments(adjsData.map(mapDbAdjustment));
        }

        // 7. Fetch Payslips
        const { data: slipsData } = await supabase
          .from('payslips')
          .select('*')
          .order('created_at', { ascending: false });
        if (slipsData) {
          setPayslips(slipsData.map(mapDbPayslip));
        }

        // 8. Fetch Email Logs
        const { data: emailsData } = await supabase
          .from('email_logs')
          .select('*')
          .order('sent_at', { ascending: false });
        if (emailsData) {
          setEmailLogs(emailsData.map(e => ({
            id: e.id,
            employeeId: e.employee_id,
            employeeName: e.employee_name,
            email: e.email,
            month: e.month,
            sentAt: e.sent_at,
            status: e.status,
            errorMessage: e.error_message || undefined
          })));
        }

        // 9. Fetch Audit Logs
        const { data: auditsData } = await supabase
          .from('payroll_audit_logs')
          .select('*')
          .order('timestamp', { ascending: false });
        if (auditsData) {
          setAuditLogs(auditsData.map(a => ({
            id: a.id,
            user: a.operator_user,
            timestamp: a.timestamp,
            action: a.action,
            details: a.details
          })));
        }
      } catch (err) {
        console.error("Error loading payroll/attendance data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [currentUser?.id, activeCompanyId, supabase]);

  // Add Audit Log helper
  const addAuditLog = async (user: string, action: string, details: string) => {
    const newLog = {
      operator_user: user,
      timestamp: new Date().toISOString(),
      action,
      details
    };

    const { data, error } = await supabase
      .from('payroll_audit_logs')
      .insert(newLog)
      .select()
      .single();

    if (error) {
      console.error("Error adding audit log:", error);
    } else if (data) {
      setAuditLogs(prev => [{
        id: data.id,
        user: data.operator_user,
        timestamp: data.timestamp,
        action: data.action,
        details: data.details
      }, ...prev]);
    }
  };

  // ─── Mutating Actions ─────────────────────────────────────────────────────────

  // Clock In
  const clockIn = async (
    employeeId: string,
    employeeName: string,
    department: string,
    shiftId: string,
    gpsCoords: string,
    address: string,
    photoUrl: string,
    device: string,
    status: 'on_time' | 'late' | 'out_of_area'
  ) => {
    const newLog = {
      employee_id: employeeId,
      employee_name: employeeName,
      department,
      date: new Date().toISOString().split('T')[0],
      check_in: new Date().toISOString(),
      gps_in: gpsCoords,
      address_in: address,
      photo_in: photoUrl,
      device_in: device,
      status,
      shift_id: shiftId,
      overtime_hours: 0
    };

    const { data, error } = await supabase
      .from('payroll_attendance_logs')
      .insert(newLog)
      .select()
      .single();

    if (error) {
      console.error("Error clocking in:", error);
    } else if (data) {
      setAttendance(prev => [mapDbAttendance(data), ...prev]);
    }
  };

  // Clock Out
  const clockOut = async (
    logId: string,
    gpsCoords: string,
    address: string,
    photoUrl: string,
    device: string,
    overtimeHrs: number
  ) => {
    const updateLog = {
      check_out: new Date().toISOString(),
      gps_out: gpsCoords,
      address_out: address,
      photo_out: photoUrl,
      device_out: device,
      overtime_hours: overtimeHrs
    };

    const { data, error } = await supabase
      .from('payroll_attendance_logs')
      .update(updateLog)
      .eq('id', logId)
      .select()
      .single();

    if (error) {
      console.error("Error clocking out:", error);
    } else if (data) {
      setAttendance(prev => prev.map(log => log.id === logId ? mapDbAttendance(data) : log));
    }
  };

  // Leave Requests
  const requestLeave = async (req: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => {
    const newReq = {
      employee_id: req.employeeId,
      employee_name: req.employeeName,
      department: req.department,
      type: req.type,
      start_date: req.startDate,
      end_date: req.endDate,
      reason: req.reason,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('leave_requests')
      .insert(newReq)
      .select()
      .single();

    if (error) {
      console.error("Error requesting leave:", error);
    } else if (data) {
      setLeaveRequests(prev => [mapDbLeave(data), ...prev]);
    }
  };

  const approveLeave = async (id: string, managerName: string) => {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({ status: 'approved', approved_by: managerName })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error approving leave:", error);
    } else if (data) {
      setLeaveRequests(prev => prev.map(req => req.id === id ? mapDbLeave(data) : req));
      await addAuditLog(managerName, 'APPROVE_LEAVE', `Approved leave request ${id} for employee`);
    }
  };

  const rejectLeave = async (id: string, managerName: string) => {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({ status: 'rejected', approved_by: managerName })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error rejecting leave:", error);
    } else if (data) {
      setLeaveRequests(prev => prev.map(req => req.id === id ? mapDbLeave(data) : req));
      await addAuditLog(managerName, 'REJECT_LEAVE', `Rejected leave request ${id} for employee`);
    }
  };

  // OT Requests
  const requestOT = async (req: Omit<OvertimeRequest, 'id' | 'status' | 'createdAt'>) => {
    const newReq = {
      employee_id: req.employeeId,
      employee_name: req.employeeName,
      department: req.department,
      date: req.date,
      hours: req.hours,
      type: req.type,
      reason: req.reason,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('overtime_requests')
      .insert(newReq)
      .select()
      .single();

    if (error) {
      console.error("Error requesting OT:", error);
    } else if (data) {
      setOTRequests(prev => [mapDbOT(data), ...prev]);
    }
  };

  const approveOT = async (id: string, managerName: string) => {
    const { data, error } = await supabase
      .from('overtime_requests')
      .update({ status: 'approved', approved_by: managerName })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error approving OT:", error);
    } else if (data) {
      setOTRequests(prev => prev.map(req => req.id === id ? mapDbOT(data) : req));
      await addAuditLog(managerName, 'APPROVE_OT', `Approved overtime request ${id} for employee`);
    }
  };

  const rejectOT = async (id: string, managerName: string) => {
    const { data, error } = await supabase
      .from('overtime_requests')
      .update({ status: 'rejected', approved_by: managerName })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error rejecting OT:", error);
    } else if (data) {
      setOTRequests(prev => prev.map(req => req.id === id ? mapDbOT(data) : req));
      await addAuditLog(managerName, 'REJECT_OT', `Rejected overtime request ${id} for employee`);
    }
  };

  // Adjustments
  const requestAdjustment = async (req: Omit<AttendanceAdjustment, 'id' | 'status' | 'createdAt'>) => {
    const newReq = {
      employee_id: req.employeeId,
      employee_name: req.employeeName,
      department: req.department,
      date: req.date,
      requested_check_in: req.requestedCheckIn ? `${req.requestedCheckIn}:00` : null,
      requested_check_out: req.requestedCheckOut ? `${req.requestedCheckOut}:00` : null,
      reason: req.reason,
      proof_url: req.proofUrl || null,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('attendance_adjustments')
      .insert(newReq)
      .select()
      .single();

    if (error) {
      console.error("Error requesting adjustment:", error);
    } else if (data) {
      setAdjustments(prev => [mapDbAdjustment(data), ...prev]);
    }
  };

  const approveAdjustment = async (id: string, hrName: string) => {
    const { data, error } = await supabase
      .from('attendance_adjustments')
      .update({ status: 'approved', approved_by: hrName })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error approving adjustment:", error);
    } else if (data) {
      setAdjustments(prev => prev.map(req => req.id === id ? mapDbAdjustment(data) : req));
      await addAuditLog(hrName, 'APPROVE_ADJUSTMENT', `Approved attendance adjustment ${id}`);
    }
  };

  const rejectAdjustment = async (id: string, hrName: string) => {
    const { data, error } = await supabase
      .from('attendance_adjustments')
      .update({ status: 'rejected', approved_by: hrName })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error rejecting adjustment:", error);
    } else if (data) {
      setAdjustments(prev => prev.map(req => req.id === id ? mapDbAdjustment(data) : req));
      await addAuditLog(hrName, 'REJECT_ADJUSTMENT', `Rejected attendance adjustment ${id}`);
    }
  };

  // Automated Monthly Payroll Calculation & Lock
  const calculateMonthPayroll = async (month: string, employeesList: any[]) => {
    const calculated = employeesList.map(emp => {
      const logs = attendance.filter(log => log.employeeId === emp.id && log.date.startsWith(month));
      const workdays = logs.filter(log => log.status !== 'absent').length || 20;
      
      const approvedOT = otRequests.filter(req => req.employeeId === emp.id && req.date.startsWith(month) && req.status === 'approved');
      const otHours = approvedOT.reduce((sum, r) => sum + r.hours, 0);

      const baseSalary = emp.salary || 5000;
      const hourlyRate = baseSalary / 22 / 8;
      const otPay = Number((otHours * hourlyRate * 1.5).toFixed(2));
      const allowance = 250;
      const bonus = 0;
      const deductions = 0;

      const insurance = Number((baseSalary * 0.11).toFixed(2));
      const taxableIncome = baseSalary + otPay + allowance + bonus - insurance - 450;
      const tax = taxableIncome > 0 ? Number((taxableIncome * 0.05).toFixed(2)) : 0;
      const netPay = Number((baseSalary + otPay + allowance + bonus - deductions - insurance - tax).toFixed(2));

      return {
        employee_id: emp.id,
        employee_name: emp.name,
        email: emp.email || `${emp.name.toLowerCase().replace(/ /g, '')}@apex.com`,
        department: emp.department || 'Operations',
        month,
        base_salary: baseSalary,
        workdays,
        ot_hours: otHours,
        ot_pay: otPay,
        allowance,
        bonus,
        deductions,
        insurance,
        tax,
        net_pay: netPay,
        status: 'draft'
      };
    });

    const { error: deleteError } = await supabase
      .from('payslips')
      .delete()
      .eq('month', month)
      .eq('status', 'draft');

    if (deleteError) {
      console.error("Error clearing existing draft payslips:", deleteError);
      return;
    }

    if (calculated.length > 0) {
      const { data, error } = await supabase
        .from('payslips')
        .insert(calculated)
        .select();

      if (error) {
        console.error("Error inserting draft payslips:", error);
      } else if (data) {
        const newSlips = data.map(mapDbPayslip);
        setPayslips(prev => {
          const preserved = prev.filter(p => !(p.month === month && p.status === 'draft'));
          return [...preserved, ...newSlips];
        });
      }
    }
  };

  const lockPayroll = async (month: string, hrName: string) => {
    const { data, error } = await supabase
      .from('payslips')
      .update({ status: 'locked' })
      .eq('month', month)
      .eq('status', 'draft')
      .select();

    if (error) {
      console.error("Error locking payroll:", error);
    } else if (data) {
      const updatedSlips = data.map(mapDbPayslip);
      setPayslips(prev => {
        const map = new Map(prev.map(p => [p.id, p]));
        for (const s of updatedSlips) {
          map.set(s.id, s);
        }
        return Array.from(map.values());
      });
      await addAuditLog(hrName, 'LOCK_PAYROLL', `Locked payroll calculations for month ${month}`);
    }
  };

  const sendPayslipEmail = async (id: string, hrName: string) => {
    const { data, error } = await supabase
      .from('payslips')
      .update({ status: 'sent', last_sent_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error sending payslip:", error);
    } else if (data) {
      const slip = mapDbPayslip(data);
      setPayslips(prev => prev.map(p => p.id === id ? slip : p));

      const newLog = {
        employee_id: slip.employeeId,
        employee_name: slip.employeeName,
        email: slip.email,
        month: slip.month,
        sent_at: new Date().toISOString(),
        status: 'success'
      };

      const { data: logData, error: logError } = await supabase
        .from('email_logs')
        .insert(newLog)
        .select()
        .single();

      if (logError) {
        console.error("Error writing email log:", logError);
      } else if (logData) {
        setEmailLogs(prev => [{
          id: logData.id,
          employeeId: logData.employee_id,
          employeeName: logData.employee_name,
          email: logData.email,
          month: logData.month,
          sentAt: logData.sent_at,
          status: logData.status,
          errorMessage: logData.error_message || undefined
        }, ...prev]);
      }

      await addAuditLog(hrName, 'EMAIL_PAYSLIP', `Dispatched PDF payslip via email to ${slip.employeeName} (${slip.email}) for ${slip.month}`);
    }
  };

  const sendBulkEmails = async (month: string, hrName: string) => {
    const { data, error } = await supabase
      .from('payslips')
      .update({ status: 'sent', last_sent_at: new Date().toISOString() })
      .eq('month', month)
      .eq('status', 'locked')
      .select();

    if (error) {
      console.error("Error bulk sending payslips:", error);
    } else if (data && data.length > 0) {
      const slips = data.map(mapDbPayslip);
      
      setPayslips(prev => {
        const map = new Map(prev.map(p => [p.id, p]));
        for (const s of slips) {
          map.set(s.id, s);
        }
        return Array.from(map.values());
      });

      const newLogs = slips.map(s => ({
        employee_id: s.employeeId,
        employee_name: s.employeeName,
        email: s.email,
        month: s.month,
        sent_at: new Date().toISOString(),
        status: 'success'
      }));

      const { data: logsData, error: logsError } = await supabase
        .from('email_logs')
        .insert(newLogs)
        .select();

      if (logsError) {
        console.error("Error bulk writing email logs:", logsError);
      } else if (logsData) {
        const formattedLogs = logsData.map(log => ({
          id: log.id,
          employeeId: log.employee_id,
          employeeName: log.employee_name,
          email: log.email,
          month: log.month,
          sentAt: log.sent_at,
          status: log.status,
          errorMessage: log.error_message || undefined
        }));
        setEmailLogs(prev => [...formattedLogs, ...prev]);
      }

      await addAuditLog(hrName, 'BULK_EMAIL_PAYSLIP', `Dispatched bulk email payslips for month ${month} (Success: ${slips.length}, Failed: 0)`);
    }
  };

  // Locations Actions
  const addLocation = async (loc: Omit<AttendanceLocation, 'active'>) => {
    const newLoc = {
      id: loc.id,
      name: loc.name,
      lat: loc.lat,
      lng: loc.lng,
      radius: loc.radius,
      active: true
    };
    const { data, error } = await supabase
      .from('attendance_locations')
      .insert(newLoc)
      .select()
      .single();

    if (error) {
      console.error("Error adding location:", error);
    } else if (data) {
      setLocations(prev => [...prev, mapDbLocation(data)]);
    }
  };

  const deleteLocation = async (id: string) => {
    const { error } = await supabase
      .from('attendance_locations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting location:", error);
    } else {
      setLocations(prev => prev.filter(l => l.id !== id));
    }
  };

  // Shifts Actions
  const addShift = async (sh: PayrollShift) => {
    const newSh = {
      id: sh.id,
      name: sh.name,
      start_time: sh.startTime.includes(':') && sh.startTime.split(':').length === 2 ? sh.startTime + ":00" : sh.startTime,
      end_time: sh.endTime.includes(':') && sh.endTime.split(':').length === 2 ? sh.endTime + ":00" : sh.endTime,
      break_minutes: sh.breakMinutes,
      grace_minutes: sh.graceMinutes,
      ot_rate: sh.otRate
    };
    const { data, error } = await supabase
      .from('payroll_shifts')
      .insert(newSh)
      .select()
      .single();

    if (error) {
      console.error("Error adding shift:", error);
    } else if (data) {
      setShifts(prev => [...prev, mapDbShift(data)]);
    }
  };

  const deleteShift = async (id: string) => {
    const { error } = await supabase
      .from('payroll_shifts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting shift:", error);
    } else {
      setShifts(prev => prev.filter(s => s.id !== id));
    }
  };

  return {
    shifts,
    locations,
    attendance,
    leaveRequests,
    otRequests,
    adjustments,
    payslips,
    emailLogs,
    auditLogs,
    loading,
    addAuditLog,
    
    // Core actions
    clockIn,
    clockOut,
    requestLeave,
    approveLeave,
    rejectLeave,
    requestOT,
    approveOT,
    rejectOT,
    requestAdjustment,
    approveAdjustment,
    rejectAdjustment,
    calculateMonthPayroll,
    lockPayroll,
    sendPayslipEmail,
    sendBulkEmails,
    
    // Shift/Location actions
    addLocation,
    deleteLocation,
    addShift,
    deleteShift
  };
}
