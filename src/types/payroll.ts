export interface PayrollShift {
  id: string;
  name: string;      // Admin, Morning, Afternoon, Night, Rotating
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  breakMinutes: number;
  graceMinutes: number; // minutes allowed late
  otRate: number;       // standard OT multiplier
}

export interface AttendanceLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number; // allowed radius in meters
  active: boolean;
}

export interface PayrollAttendanceLog {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;       // YYYY-MM-DD
  checkIn: string;    // ISO timestamp
  checkOut?: string;  // ISO timestamp
  gpsIn: string;      // "lat, lng"
  gpsOut?: string;    // "lat, lng"
  addressIn?: string;
  addressOut?: string;
  photoIn?: string;    // base64 image URL or mock URL
  photoOut?: string;   // base64 image URL or mock URL
  deviceIn?: string;
  deviceOut?: string;
  status: 'on_time' | 'late' | 'early_out' | 'absent' | 'out_of_area';
  shiftId: string;
  overtimeHours?: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: 'annual' | 'sick' | 'unpaid' | 'personal' | 'maternity';
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string; // Manager/HR name
  createdAt: string;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;       // YYYY-MM-DD
  hours: number;
  type: 'weekday' | 'sunday' | 'holiday';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: string;
}

export interface AttendanceAdjustment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;              // YYYY-MM-DD
  requestedCheckIn?: string;  // HH:MM
  requestedCheckOut?: string; // HH:MM
  reason: string;
  proofUrl?: string;          // Mock document or image
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: string;
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  email: string;
  department: string;
  month: string;         // YYYY-MM
  baseSalary: number;
  workdays: number;      // actual workdays
  otHours: number;
  otPay: number;
  allowance: number;
  bonus: number;
  deductions: number;
  insurance: number;     // social + health + unemployment
  tax: number;           // PIT
  netPay: number;
  status: 'draft' | 'locked' | 'sent';
  lastSentAt?: string;
  createdAt: string;
}

export interface EmailLog {
  id: string;
  employeeId: string;
  employeeName: string;
  email: string;
  month: string;
  sentAt: string;
  status: 'success' | 'failed';
  errorMessage?: string;
}

export interface PayrollAuditLog {
  id: string;
  user: string;       // HR or Admin username
  timestamp: string;  // ISO timestamp
  action: string;     // e.g. "LOCK_PAYROLL", "APPROVE_LEAVE"
  details: string;
}
