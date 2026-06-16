const fs = require('fs');

const companyId = 'c8b671a8-ff69-42b7-a37a-77c86f7881c1';
const deptTech = '90909090-1111-1111-1111-111111111111'; // Kỹ thuật thi công
const deptFin = '90909090-2222-2222-2222-222222222222';  // Tài chính Kế toán
const deptSales = '90909090-3333-3333-3333-333333333333'; // Kinh doanh
const deptLogistics = '90909090-4444-4444-4444-444444444444'; // Kho vận

const employees = [
  {
    id: '70707070-0000-0000-0000-000000000001',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Nguyễn Văn Trị',
    deptId: deptTech,
    deptName: 'Ban Giám đốc',
    position: 'Tổng Giám đốc',
    salary: 55000000,
    email: 'admin@apex.com'
  },
  {
    id: '70707070-1111-1111-1111-111111111111',
    userId: 'a33a76d1-cbca-47e0-8095-943db603c9a5',
    name: 'Dylan',
    deptId: deptTech,
    deptName: 'Phòng Kỹ thuật thi công',
    position: 'Trưởng phòng Kỹ thuật',
    salary: 30000000,
    email: 'lequangdieu0302@gmail.com'
  },
  {
    id: '70707070-2222-2222-2222-222222222222',
    userId: '9b436be3-5621-45d3-8fbb-033a9fe2d10e',
    name: 'Luân',
    deptId: deptFin,
    deptName: 'Phòng Tài chính Kế toán',
    position: 'Kế toán trưởng',
    salary: 22000000,
    email: 'lequangdieu03022@gmail.com'
  },
  {
    id: '70707070-3333-3333-3333-333333333333',
    userId: '37abd426-54ca-498b-bab6-db260c64bbcf',
    name: 'Tài',
    deptId: deptSales,
    deptName: 'Phòng Kinh doanh',
    position: 'Trưởng nhóm Sales',
    salary: 18000000,
    email: 'lequangdieu030222@gmail.com'
  },
  {
    id: '70707070-4444-4444-4444-444444444444',
    userId: 'e12a8cd5-86dd-4246-9754-5d6df421133a',
    name: 'Quân',
    deptId: deptLogistics,
    deptName: 'Phòng Vật tư & Kho vận',
    position: 'Thủ kho chính',
    salary: 15000000,
    email: 'lequangdieu0302222@gmail.com'
  },
  {
    id: '70707070-5555-5555-5555-555555555555',
    userId: '978f8ea5-bb6e-4b0e-ab43-a183c89f316b',
    name: 'Kiên',
    deptId: deptTech,
    deptName: 'Phòng Kỹ thuật thi công',
    position: 'Nhân viên Nhân sự',
    salary: 16000000,
    email: 'lequangdieu03022232@gmail.com'
  },
  {
    id: '70707070-6666-6666-6666-666666666666',
    userId: 'd06e4f96-1577-4bd8-b68e-72e59fe5deca',
    name: 'Tiến',
    deptId: deptTech,
    deptName: 'Phòng Kỹ thuật thi công',
    position: 'Kỹ sư Giám sát',
    salary: 20000000,
    email: 'lequangdieu030222132@gmail.com'
  },
  {
    id: '70707070-7777-7777-7777-777777777777',
    userId: 'e70a9dc6-8793-476d-a292-c0194bfd1d67',
    name: 'Tèo',
    deptId: deptSales,
    deptName: 'Phòng Kinh doanh',
    position: 'Nhân viên Sales',
    salary: 12000000,
    email: 'lequangdieu0302222132@gmail.com'
  },
  {
    id: '70707070-8888-8888-8888-888888888888',
    userId: '569e5926-8e43-4475-b63a-d90214a9d136',
    name: 'Hải',
    deptId: deptLogistics,
    deptName: 'Phòng Vật tư & Kho vận',
    position: 'Nhân viên Kho',
    salary: 11000000,
    email: 'lequangdieu032@gmail.com'
  },
  {
    id: '70707070-9999-9999-9999-999999999999',
    userId: '180ce789-464b-4917-bff5-33a9b32165e8',
    name: 'My',
    deptId: deptFin,
    deptName: 'Phòng Tài chính Kế toán',
    position: 'Kế toán viên',
    salary: 14000000,
    email: 'lequangdieu1032@gmail.com'
  },
  {
    id: '70707070-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    userId: 'be4be1d8-bda9-417c-93f8-8fdaf57b591a',
    name: 'dung',
    deptId: deptTech,
    deptName: 'Phòng Kỹ thuật thi công',
    position: 'Giám đốc Nhân sự',
    salary: 35000000,
    email: 'hudung@gmail.com'
  }
];

let sql = `
-- =============================================================================
-- SEED DATA FOR DEPARTMENTS, EMPLOYEES AND TRANSACTIONS (JUNE 2026)
-- =============================================================================

-- 1. DEPARTMENTS
insert into public.departments (id, company_id, name, manager_id) values
('${deptSales}', '${companyId}', 'Phòng Kinh doanh', '00000000-0000-0000-0000-000000000003'),
('${deptLogistics}', '${companyId}', 'Phòng Vật tư & Kho vận', '00000000-0000-0000-0000-000000000005')
on conflict (id) do nothing;

-- 2. EMPLOYEES
`;

for (const emp of employees) {
  sql += `insert into public.employees (id, company_id, user_id, department_id, position, hire_date, salary, active) values
('${emp.id}', '${companyId}', '${emp.userId}', '${emp.deptId}', '${emp.position}', '2024-01-15', ${emp.salary}, true)
on conflict (id) do update set department_id = excluded.department_id, salary = excluded.salary, position = excluded.position;

`;
}

sql += `\n-- 3. TIME ATTENDANCE PUNCHEES (JUNE 1, 2026 to JUNE 15, 2026)\n`;

// Generate attendance punches for June 1 to June 15, excluding weekends (June 6, 7, 13, 14)
const dates = [];
for (let d = 1; d <= 15; d++) {
  const dayStr = d < 10 ? `0${d}` : `${d}`;
  const dateStr = `2026-06-${dayStr}`;
  const dateObj = new Date(dateStr);
  const dayOfWeek = dateObj.getDay();
  if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Weekdays only
    dates.push(dateStr);
  }
}

for (const emp of employees) {
  // We'll skip some punches to simulate leaves, late arrivals, etc.
  for (const date of dates) {
    // Skip June 10 & 11 for Dylan (simulate approved leave)
    if (emp.name === 'Dylan' && (date === '2026-06-10' || date === '2026-06-11')) continue;

    const isLate = Math.random() < 0.15; // 15% chance late
    const checkInTime = isLate ? '08:25:00' : '07:55:00';
    const status = isLate ? 'late' : 'on_time';
    const checkOutTime = '17:05:00';
    const otHours = Math.random() < 0.25 ? 2.0 : 0.0; // 25% chance of 2 hours OT

    sql += `insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('${emp.id}', '${emp.name}', '${emp.deptName}', '${date}', '${date}T${checkInTime}+07:00', '${date}T${checkOutTime}+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', '${status}', 'sh1', ${otHours});

`;
  }
}

sql += `
-- 4. LEAVE REQUESTS
insert into public.leave_requests (employee_id, employee_name, department, type, start_date, end_date, reason, status, approved_by) values
('70707070-1111-1111-1111-111111111111', 'Dylan', 'Phòng Kỹ thuật thi công', 'annual', '2026-06-10', '2026-06-11', 'Nghỉ giải quyết việc gia đình', 'approved', 'dung'),
('70707070-2222-2222-2222-222222222222', 'Luân', 'Phòng Tài chính Kế toán', 'sick', '2026-06-16', '2026-06-16', 'Khám sức khỏe định kỳ', 'pending', null);

-- 5. OVERTIME REQUESTS
insert into public.overtime_requests (employee_id, employee_name, department, date, hours, type, reason, status, approved_by) values
('70707070-1111-1111-1111-111111111111', 'Dylan', 'Phòng Kỹ thuật thi công', '2026-06-08', 2.00, 'weekday', 'Hoàn thiện hồ sơ nghiệm thu kỹ thuật Cầu cảng số 4', 'approved', 'dung'),
('70707070-3333-3333-3333-333333333333', 'Tài', 'Phòng Kinh doanh', '2026-06-12', 3.00, 'weekday', 'Hỗ trợ sự kiện giới thiệu dự án LaGuardia Hangar', 'approved', 'dung'),
('70707070-1111-1111-1111-111111111111', 'Dylan', 'Phòng Kỹ thuật thi công', '2026-06-14', 8.00, 'sunday', 'Trực kiểm tra kỹ thuật móng cọc công trường', 'pending', null);

-- 6. ATTENDANCE ADJUSTMENTS
insert into public.attendance_adjustments (employee_id, employee_name, department, date, requested_check_in, requested_check_out, reason, status, approved_by) values
('70707070-2222-2222-2222-222222222222', 'Luân', 'Phòng Tài chính Kế toán', '2026-06-05', '08:00:00', '17:00:00', 'Quên máy chấm công do đi ngân hàng trực tiếp buổi sáng', 'approved', 'dung');

-- 7. PAST MONTH PAYSLIPS (MAY 2026) - LOCKED/SENT
`;

for (const emp of employees) {
  const base = emp.salary;
  const ins = Number((base * 0.115).toFixed(0)); // 11.5% insurance
  const tax = Number((base * 0.05).toFixed(0)); // 5% tax mock
  const net = base - ins - tax;

  sql += `insert into public.payslips (employee_id, employee_name, email, department, month, base_salary, workdays, ot_hours, ot_pay, allowance, bonus, deductions, insurance, tax, net_pay, status, last_sent_at) values
('${emp.id}', '${emp.name}', '${emp.email}', '${emp.deptName}', '2026-05', ${base}, 22.0, 0.0, 0.0, 1000000.0, 500000.0, 0.0, ${ins}, ${tax}, ${net + 1500000}, 'sent', '2026-06-05T09:00:00Z')
on conflict (employee_id, month) do nothing;

`;
}

sql += `
-- 8. AUDIT LOGS
insert into public.payroll_audit_logs (operator_user, timestamp, action, details) values
('dung', '2026-06-05T09:00:00Z', 'EMAIL_PAYSLIP', 'Đã phân phối phiếu lương tháng 05/2026 cho toàn bộ nhân viên.'),
('dung', '2026-06-05T08:30:00Z', 'LOCK_PAYROLL', 'Đã khóa bảng lương tháng 05/2026.');
`;

fs.writeFileSync('scratch/seed_payroll_data.sql', sql, 'utf8');
console.log("Created scratch/seed_payroll_data.sql successfully.");
