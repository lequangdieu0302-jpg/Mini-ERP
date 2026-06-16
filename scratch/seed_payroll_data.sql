
-- =============================================================================
-- SEED DATA FOR DEPARTMENTS, EMPLOYEES AND TRANSACTIONS (JUNE 2026)
-- =============================================================================

-- 1. DEPARTMENTS
insert into public.departments (id, company_id, name, manager_id) values
('90909090-3333-3333-3333-333333333333', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Phòng Kinh doanh', '00000000-0000-0000-0000-000000000003'),
('90909090-4444-4444-4444-444444444444', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Phòng Vật tư & Kho vận', '00000000-0000-0000-0000-000000000005')
on conflict (id) do nothing;

-- 2. EMPLOYEES
insert into public.employees (id, company_id, user_id, department_id, position, hire_date, salary, active) values
('70707070-0000-0000-0000-000000000001', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', '00000000-0000-0000-0000-000000000001', '90909090-1111-1111-1111-111111111111', 'Tổng Giám đốc', '2024-01-15', 55000000, true)
on conflict (id) do update set department_id = excluded.department_id, salary = excluded.salary, position = excluded.position;

insert into public.employees (id, company_id, user_id, department_id, position, hire_date, salary, active) values
('70707070-1111-1111-1111-111111111111', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'a33a76d1-cbca-47e0-8095-943db603c9a5', '90909090-1111-1111-1111-111111111111', 'Trưởng phòng Kỹ thuật', '2024-01-15', 30000000, true)
on conflict (id) do update set department_id = excluded.department_id, salary = excluded.salary, position = excluded.position;

insert into public.employees (id, company_id, user_id, department_id, position, hire_date, salary, active) values
('70707070-2222-2222-2222-222222222222', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', '9b436be3-5621-45d3-8fbb-033a9fe2d10e', '90909090-2222-2222-2222-222222222222', 'Kế toán trưởng', '2024-01-15', 22000000, true)
on conflict (id) do update set department_id = excluded.department_id, salary = excluded.salary, position = excluded.position;

insert into public.employees (id, company_id, user_id, department_id, position, hire_date, salary, active) values
('70707070-3333-3333-3333-333333333333', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', '37abd426-54ca-498b-bab6-db260c64bbcf', '90909090-3333-3333-3333-333333333333', 'Trưởng nhóm Sales', '2024-01-15', 18000000, true)
on conflict (id) do update set department_id = excluded.department_id, salary = excluded.salary, position = excluded.position;

insert into public.employees (id, company_id, user_id, department_id, position, hire_date, salary, active) values
('70707070-4444-4444-4444-444444444444', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'e12a8cd5-86dd-4246-9754-5d6df421133a', '90909090-4444-4444-4444-444444444444', 'Thủ kho chính', '2024-01-15', 15000000, true)
on conflict (id) do update set department_id = excluded.department_id, salary = excluded.salary, position = excluded.position;

insert into public.employees (id, company_id, user_id, department_id, position, hire_date, salary, active) values
('70707070-5555-5555-5555-555555555555', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', '978f8ea5-bb6e-4b0e-ab43-a183c89f316b', '90909090-1111-1111-1111-111111111111', 'Nhân viên Nhân sự', '2024-01-15', 16000000, true)
on conflict (id) do update set department_id = excluded.department_id, salary = excluded.salary, position = excluded.position;

insert into public.employees (id, company_id, user_id, department_id, position, hire_date, salary, active) values
('70707070-6666-6666-6666-666666666666', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'd06e4f96-1577-4bd8-b68e-72e59fe5deca', '90909090-1111-1111-1111-111111111111', 'Kỹ sư Giám sát', '2024-01-15', 20000000, true)
on conflict (id) do update set department_id = excluded.department_id, salary = excluded.salary, position = excluded.position;

insert into public.employees (id, company_id, user_id, department_id, position, hire_date, salary, active) values
('70707070-7777-7777-7777-777777777777', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'e70a9dc6-8793-476d-a292-c0194bfd1d67', '90909090-3333-3333-3333-333333333333', 'Nhân viên Sales', '2024-01-15', 12000000, true)
on conflict (id) do update set department_id = excluded.department_id, salary = excluded.salary, position = excluded.position;

insert into public.employees (id, company_id, user_id, department_id, position, hire_date, salary, active) values
('70707070-8888-8888-8888-888888888888', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', '569e5926-8e43-4475-b63a-d90214a9d136', '90909090-4444-4444-4444-444444444444', 'Nhân viên Kho', '2024-01-15', 11000000, true)
on conflict (id) do update set department_id = excluded.department_id, salary = excluded.salary, position = excluded.position;

insert into public.employees (id, company_id, user_id, department_id, position, hire_date, salary, active) values
('70707070-9999-9999-9999-999999999999', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', '180ce789-464b-4917-bff5-33a9b32165e8', '90909090-2222-2222-2222-222222222222', 'Kế toán viên', '2024-01-15', 14000000, true)
on conflict (id) do update set department_id = excluded.department_id, salary = excluded.salary, position = excluded.position;

insert into public.employees (id, company_id, user_id, department_id, position, hire_date, salary, active) values
('70707070-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'be4be1d8-bda9-417c-93f8-8fdaf57b591a', '90909090-1111-1111-1111-111111111111', 'Giám đốc Nhân sự', '2024-01-15', 35000000, true)
on conflict (id) do update set department_id = excluded.department_id, salary = excluded.salary, position = excluded.position;


-- 3. TIME ATTENDANCE PUNCHEES (JUNE 1, 2026 to JUNE 15, 2026)
insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-0000-0000-0000-000000000001', 'Nguyễn Văn Trị', 'Ban Giám đốc', '2026-06-01', '2026-06-01T07:55:00+07:00', '2026-06-01T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-0000-0000-0000-000000000001', 'Nguyễn Văn Trị', 'Ban Giám đốc', '2026-06-02', '2026-06-02T07:55:00+07:00', '2026-06-02T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-0000-0000-0000-000000000001', 'Nguyễn Văn Trị', 'Ban Giám đốc', '2026-06-03', '2026-06-03T08:25:00+07:00', '2026-06-03T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'late', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-0000-0000-0000-000000000001', 'Nguyễn Văn Trị', 'Ban Giám đốc', '2026-06-04', '2026-06-04T07:55:00+07:00', '2026-06-04T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-0000-0000-0000-000000000001', 'Nguyễn Văn Trị', 'Ban Giám đốc', '2026-06-05', '2026-06-05T07:55:00+07:00', '2026-06-05T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-0000-0000-0000-000000000001', 'Nguyễn Văn Trị', 'Ban Giám đốc', '2026-06-08', '2026-06-08T07:55:00+07:00', '2026-06-08T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-0000-0000-0000-000000000001', 'Nguyễn Văn Trị', 'Ban Giám đốc', '2026-06-09', '2026-06-09T07:55:00+07:00', '2026-06-09T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-0000-0000-0000-000000000001', 'Nguyễn Văn Trị', 'Ban Giám đốc', '2026-06-10', '2026-06-10T07:55:00+07:00', '2026-06-10T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-0000-0000-0000-000000000001', 'Nguyễn Văn Trị', 'Ban Giám đốc', '2026-06-11', '2026-06-11T07:55:00+07:00', '2026-06-11T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-0000-0000-0000-000000000001', 'Nguyễn Văn Trị', 'Ban Giám đốc', '2026-06-12', '2026-06-12T07:55:00+07:00', '2026-06-12T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-0000-0000-0000-000000000001', 'Nguyễn Văn Trị', 'Ban Giám đốc', '2026-06-15', '2026-06-15T07:55:00+07:00', '2026-06-15T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-1111-1111-1111-111111111111', 'Dylan', 'Phòng Kỹ thuật thi công', '2026-06-01', '2026-06-01T07:55:00+07:00', '2026-06-01T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-1111-1111-1111-111111111111', 'Dylan', 'Phòng Kỹ thuật thi công', '2026-06-02', '2026-06-02T07:55:00+07:00', '2026-06-02T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-1111-1111-1111-111111111111', 'Dylan', 'Phòng Kỹ thuật thi công', '2026-06-03', '2026-06-03T07:55:00+07:00', '2026-06-03T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-1111-1111-1111-111111111111', 'Dylan', 'Phòng Kỹ thuật thi công', '2026-06-04', '2026-06-04T07:55:00+07:00', '2026-06-04T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-1111-1111-1111-111111111111', 'Dylan', 'Phòng Kỹ thuật thi công', '2026-06-05', '2026-06-05T07:55:00+07:00', '2026-06-05T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-1111-1111-1111-111111111111', 'Dylan', 'Phòng Kỹ thuật thi công', '2026-06-08', '2026-06-08T07:55:00+07:00', '2026-06-08T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-1111-1111-1111-111111111111', 'Dylan', 'Phòng Kỹ thuật thi công', '2026-06-09', '2026-06-09T07:55:00+07:00', '2026-06-09T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-1111-1111-1111-111111111111', 'Dylan', 'Phòng Kỹ thuật thi công', '2026-06-12', '2026-06-12T07:55:00+07:00', '2026-06-12T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-1111-1111-1111-111111111111', 'Dylan', 'Phòng Kỹ thuật thi công', '2026-06-15', '2026-06-15T07:55:00+07:00', '2026-06-15T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-2222-2222-2222-222222222222', 'Luân', 'Phòng Tài chính Kế toán', '2026-06-01', '2026-06-01T07:55:00+07:00', '2026-06-01T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-2222-2222-2222-222222222222', 'Luân', 'Phòng Tài chính Kế toán', '2026-06-02', '2026-06-02T07:55:00+07:00', '2026-06-02T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-2222-2222-2222-222222222222', 'Luân', 'Phòng Tài chính Kế toán', '2026-06-03', '2026-06-03T07:55:00+07:00', '2026-06-03T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-2222-2222-2222-222222222222', 'Luân', 'Phòng Tài chính Kế toán', '2026-06-04', '2026-06-04T07:55:00+07:00', '2026-06-04T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-2222-2222-2222-222222222222', 'Luân', 'Phòng Tài chính Kế toán', '2026-06-05', '2026-06-05T07:55:00+07:00', '2026-06-05T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-2222-2222-2222-222222222222', 'Luân', 'Phòng Tài chính Kế toán', '2026-06-08', '2026-06-08T07:55:00+07:00', '2026-06-08T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-2222-2222-2222-222222222222', 'Luân', 'Phòng Tài chính Kế toán', '2026-06-09', '2026-06-09T07:55:00+07:00', '2026-06-09T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-2222-2222-2222-222222222222', 'Luân', 'Phòng Tài chính Kế toán', '2026-06-10', '2026-06-10T08:25:00+07:00', '2026-06-10T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'late', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-2222-2222-2222-222222222222', 'Luân', 'Phòng Tài chính Kế toán', '2026-06-11', '2026-06-11T07:55:00+07:00', '2026-06-11T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-2222-2222-2222-222222222222', 'Luân', 'Phòng Tài chính Kế toán', '2026-06-12', '2026-06-12T07:55:00+07:00', '2026-06-12T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-2222-2222-2222-222222222222', 'Luân', 'Phòng Tài chính Kế toán', '2026-06-15', '2026-06-15T07:55:00+07:00', '2026-06-15T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-3333-3333-3333-333333333333', 'Tài', 'Phòng Kinh doanh', '2026-06-01', '2026-06-01T07:55:00+07:00', '2026-06-01T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-3333-3333-3333-333333333333', 'Tài', 'Phòng Kinh doanh', '2026-06-02', '2026-06-02T07:55:00+07:00', '2026-06-02T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-3333-3333-3333-333333333333', 'Tài', 'Phòng Kinh doanh', '2026-06-03', '2026-06-03T07:55:00+07:00', '2026-06-03T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-3333-3333-3333-333333333333', 'Tài', 'Phòng Kinh doanh', '2026-06-04', '2026-06-04T07:55:00+07:00', '2026-06-04T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-3333-3333-3333-333333333333', 'Tài', 'Phòng Kinh doanh', '2026-06-05', '2026-06-05T07:55:00+07:00', '2026-06-05T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-3333-3333-3333-333333333333', 'Tài', 'Phòng Kinh doanh', '2026-06-08', '2026-06-08T07:55:00+07:00', '2026-06-08T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-3333-3333-3333-333333333333', 'Tài', 'Phòng Kinh doanh', '2026-06-09', '2026-06-09T07:55:00+07:00', '2026-06-09T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-3333-3333-3333-333333333333', 'Tài', 'Phòng Kinh doanh', '2026-06-10', '2026-06-10T07:55:00+07:00', '2026-06-10T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-3333-3333-3333-333333333333', 'Tài', 'Phòng Kinh doanh', '2026-06-11', '2026-06-11T07:55:00+07:00', '2026-06-11T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-3333-3333-3333-333333333333', 'Tài', 'Phòng Kinh doanh', '2026-06-12', '2026-06-12T07:55:00+07:00', '2026-06-12T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-3333-3333-3333-333333333333', 'Tài', 'Phòng Kinh doanh', '2026-06-15', '2026-06-15T07:55:00+07:00', '2026-06-15T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-4444-4444-4444-444444444444', 'Quân', 'Phòng Vật tư & Kho vận', '2026-06-01', '2026-06-01T07:55:00+07:00', '2026-06-01T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-4444-4444-4444-444444444444', 'Quân', 'Phòng Vật tư & Kho vận', '2026-06-02', '2026-06-02T07:55:00+07:00', '2026-06-02T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-4444-4444-4444-444444444444', 'Quân', 'Phòng Vật tư & Kho vận', '2026-06-03', '2026-06-03T07:55:00+07:00', '2026-06-03T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-4444-4444-4444-444444444444', 'Quân', 'Phòng Vật tư & Kho vận', '2026-06-04', '2026-06-04T07:55:00+07:00', '2026-06-04T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-4444-4444-4444-444444444444', 'Quân', 'Phòng Vật tư & Kho vận', '2026-06-05', '2026-06-05T07:55:00+07:00', '2026-06-05T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-4444-4444-4444-444444444444', 'Quân', 'Phòng Vật tư & Kho vận', '2026-06-08', '2026-06-08T07:55:00+07:00', '2026-06-08T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-4444-4444-4444-444444444444', 'Quân', 'Phòng Vật tư & Kho vận', '2026-06-09', '2026-06-09T08:25:00+07:00', '2026-06-09T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'late', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-4444-4444-4444-444444444444', 'Quân', 'Phòng Vật tư & Kho vận', '2026-06-10', '2026-06-10T07:55:00+07:00', '2026-06-10T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-4444-4444-4444-444444444444', 'Quân', 'Phòng Vật tư & Kho vận', '2026-06-11', '2026-06-11T07:55:00+07:00', '2026-06-11T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-4444-4444-4444-444444444444', 'Quân', 'Phòng Vật tư & Kho vận', '2026-06-12', '2026-06-12T07:55:00+07:00', '2026-06-12T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-4444-4444-4444-444444444444', 'Quân', 'Phòng Vật tư & Kho vận', '2026-06-15', '2026-06-15T07:55:00+07:00', '2026-06-15T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-5555-5555-5555-555555555555', 'Kiên', 'Phòng Kỹ thuật thi công', '2026-06-01', '2026-06-01T07:55:00+07:00', '2026-06-01T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-5555-5555-5555-555555555555', 'Kiên', 'Phòng Kỹ thuật thi công', '2026-06-02', '2026-06-02T07:55:00+07:00', '2026-06-02T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-5555-5555-5555-555555555555', 'Kiên', 'Phòng Kỹ thuật thi công', '2026-06-03', '2026-06-03T07:55:00+07:00', '2026-06-03T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-5555-5555-5555-555555555555', 'Kiên', 'Phòng Kỹ thuật thi công', '2026-06-04', '2026-06-04T07:55:00+07:00', '2026-06-04T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-5555-5555-5555-555555555555', 'Kiên', 'Phòng Kỹ thuật thi công', '2026-06-05', '2026-06-05T07:55:00+07:00', '2026-06-05T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-5555-5555-5555-555555555555', 'Kiên', 'Phòng Kỹ thuật thi công', '2026-06-08', '2026-06-08T07:55:00+07:00', '2026-06-08T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-5555-5555-5555-555555555555', 'Kiên', 'Phòng Kỹ thuật thi công', '2026-06-09', '2026-06-09T08:25:00+07:00', '2026-06-09T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'late', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-5555-5555-5555-555555555555', 'Kiên', 'Phòng Kỹ thuật thi công', '2026-06-10', '2026-06-10T08:25:00+07:00', '2026-06-10T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'late', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-5555-5555-5555-555555555555', 'Kiên', 'Phòng Kỹ thuật thi công', '2026-06-11', '2026-06-11T07:55:00+07:00', '2026-06-11T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-5555-5555-5555-555555555555', 'Kiên', 'Phòng Kỹ thuật thi công', '2026-06-12', '2026-06-12T08:25:00+07:00', '2026-06-12T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'late', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-5555-5555-5555-555555555555', 'Kiên', 'Phòng Kỹ thuật thi công', '2026-06-15', '2026-06-15T07:55:00+07:00', '2026-06-15T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-6666-6666-6666-666666666666', 'Tiến', 'Phòng Kỹ thuật thi công', '2026-06-01', '2026-06-01T07:55:00+07:00', '2026-06-01T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-6666-6666-6666-666666666666', 'Tiến', 'Phòng Kỹ thuật thi công', '2026-06-02', '2026-06-02T07:55:00+07:00', '2026-06-02T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-6666-6666-6666-666666666666', 'Tiến', 'Phòng Kỹ thuật thi công', '2026-06-03', '2026-06-03T07:55:00+07:00', '2026-06-03T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-6666-6666-6666-666666666666', 'Tiến', 'Phòng Kỹ thuật thi công', '2026-06-04', '2026-06-04T07:55:00+07:00', '2026-06-04T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-6666-6666-6666-666666666666', 'Tiến', 'Phòng Kỹ thuật thi công', '2026-06-05', '2026-06-05T07:55:00+07:00', '2026-06-05T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-6666-6666-6666-666666666666', 'Tiến', 'Phòng Kỹ thuật thi công', '2026-06-08', '2026-06-08T08:25:00+07:00', '2026-06-08T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'late', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-6666-6666-6666-666666666666', 'Tiến', 'Phòng Kỹ thuật thi công', '2026-06-09', '2026-06-09T07:55:00+07:00', '2026-06-09T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-6666-6666-6666-666666666666', 'Tiến', 'Phòng Kỹ thuật thi công', '2026-06-10', '2026-06-10T07:55:00+07:00', '2026-06-10T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-6666-6666-6666-666666666666', 'Tiến', 'Phòng Kỹ thuật thi công', '2026-06-11', '2026-06-11T07:55:00+07:00', '2026-06-11T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-6666-6666-6666-666666666666', 'Tiến', 'Phòng Kỹ thuật thi công', '2026-06-12', '2026-06-12T07:55:00+07:00', '2026-06-12T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-6666-6666-6666-666666666666', 'Tiến', 'Phòng Kỹ thuật thi công', '2026-06-15', '2026-06-15T07:55:00+07:00', '2026-06-15T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-7777-7777-7777-777777777777', 'Tèo', 'Phòng Kinh doanh', '2026-06-01', '2026-06-01T07:55:00+07:00', '2026-06-01T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-7777-7777-7777-777777777777', 'Tèo', 'Phòng Kinh doanh', '2026-06-02', '2026-06-02T07:55:00+07:00', '2026-06-02T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-7777-7777-7777-777777777777', 'Tèo', 'Phòng Kinh doanh', '2026-06-03', '2026-06-03T07:55:00+07:00', '2026-06-03T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-7777-7777-7777-777777777777', 'Tèo', 'Phòng Kinh doanh', '2026-06-04', '2026-06-04T07:55:00+07:00', '2026-06-04T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-7777-7777-7777-777777777777', 'Tèo', 'Phòng Kinh doanh', '2026-06-05', '2026-06-05T07:55:00+07:00', '2026-06-05T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-7777-7777-7777-777777777777', 'Tèo', 'Phòng Kinh doanh', '2026-06-08', '2026-06-08T08:25:00+07:00', '2026-06-08T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'late', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-7777-7777-7777-777777777777', 'Tèo', 'Phòng Kinh doanh', '2026-06-09', '2026-06-09T07:55:00+07:00', '2026-06-09T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-7777-7777-7777-777777777777', 'Tèo', 'Phòng Kinh doanh', '2026-06-10', '2026-06-10T08:25:00+07:00', '2026-06-10T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'late', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-7777-7777-7777-777777777777', 'Tèo', 'Phòng Kinh doanh', '2026-06-11', '2026-06-11T07:55:00+07:00', '2026-06-11T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-7777-7777-7777-777777777777', 'Tèo', 'Phòng Kinh doanh', '2026-06-12', '2026-06-12T08:25:00+07:00', '2026-06-12T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'late', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-7777-7777-7777-777777777777', 'Tèo', 'Phòng Kinh doanh', '2026-06-15', '2026-06-15T08:25:00+07:00', '2026-06-15T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'late', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-8888-8888-8888-888888888888', 'Hải', 'Phòng Vật tư & Kho vận', '2026-06-01', '2026-06-01T07:55:00+07:00', '2026-06-01T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-8888-8888-8888-888888888888', 'Hải', 'Phòng Vật tư & Kho vận', '2026-06-02', '2026-06-02T07:55:00+07:00', '2026-06-02T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-8888-8888-8888-888888888888', 'Hải', 'Phòng Vật tư & Kho vận', '2026-06-03', '2026-06-03T07:55:00+07:00', '2026-06-03T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-8888-8888-8888-888888888888', 'Hải', 'Phòng Vật tư & Kho vận', '2026-06-04', '2026-06-04T07:55:00+07:00', '2026-06-04T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-8888-8888-8888-888888888888', 'Hải', 'Phòng Vật tư & Kho vận', '2026-06-05', '2026-06-05T07:55:00+07:00', '2026-06-05T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-8888-8888-8888-888888888888', 'Hải', 'Phòng Vật tư & Kho vận', '2026-06-08', '2026-06-08T07:55:00+07:00', '2026-06-08T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-8888-8888-8888-888888888888', 'Hải', 'Phòng Vật tư & Kho vận', '2026-06-09', '2026-06-09T07:55:00+07:00', '2026-06-09T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-8888-8888-8888-888888888888', 'Hải', 'Phòng Vật tư & Kho vận', '2026-06-10', '2026-06-10T07:55:00+07:00', '2026-06-10T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-8888-8888-8888-888888888888', 'Hải', 'Phòng Vật tư & Kho vận', '2026-06-11', '2026-06-11T07:55:00+07:00', '2026-06-11T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-8888-8888-8888-888888888888', 'Hải', 'Phòng Vật tư & Kho vận', '2026-06-12', '2026-06-12T07:55:00+07:00', '2026-06-12T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-8888-8888-8888-888888888888', 'Hải', 'Phòng Vật tư & Kho vận', '2026-06-15', '2026-06-15T08:25:00+07:00', '2026-06-15T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'late', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-9999-9999-9999-999999999999', 'My', 'Phòng Tài chính Kế toán', '2026-06-01', '2026-06-01T07:55:00+07:00', '2026-06-01T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-9999-9999-9999-999999999999', 'My', 'Phòng Tài chính Kế toán', '2026-06-02', '2026-06-02T07:55:00+07:00', '2026-06-02T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-9999-9999-9999-999999999999', 'My', 'Phòng Tài chính Kế toán', '2026-06-03', '2026-06-03T07:55:00+07:00', '2026-06-03T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-9999-9999-9999-999999999999', 'My', 'Phòng Tài chính Kế toán', '2026-06-04', '2026-06-04T08:25:00+07:00', '2026-06-04T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'late', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-9999-9999-9999-999999999999', 'My', 'Phòng Tài chính Kế toán', '2026-06-05', '2026-06-05T07:55:00+07:00', '2026-06-05T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-9999-9999-9999-999999999999', 'My', 'Phòng Tài chính Kế toán', '2026-06-08', '2026-06-08T07:55:00+07:00', '2026-06-08T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-9999-9999-9999-999999999999', 'My', 'Phòng Tài chính Kế toán', '2026-06-09', '2026-06-09T07:55:00+07:00', '2026-06-09T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-9999-9999-9999-999999999999', 'My', 'Phòng Tài chính Kế toán', '2026-06-10', '2026-06-10T07:55:00+07:00', '2026-06-10T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-9999-9999-9999-999999999999', 'My', 'Phòng Tài chính Kế toán', '2026-06-11', '2026-06-11T07:55:00+07:00', '2026-06-11T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-9999-9999-9999-999999999999', 'My', 'Phòng Tài chính Kế toán', '2026-06-12', '2026-06-12T08:25:00+07:00', '2026-06-12T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'late', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-9999-9999-9999-999999999999', 'My', 'Phòng Tài chính Kế toán', '2026-06-15', '2026-06-15T07:55:00+07:00', '2026-06-15T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dung', 'Phòng Kỹ thuật thi công', '2026-06-01', '2026-06-01T07:55:00+07:00', '2026-06-01T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 2);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dung', 'Phòng Kỹ thuật thi công', '2026-06-02', '2026-06-02T07:55:00+07:00', '2026-06-02T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dung', 'Phòng Kỹ thuật thi công', '2026-06-03', '2026-06-03T07:55:00+07:00', '2026-06-03T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dung', 'Phòng Kỹ thuật thi công', '2026-06-04', '2026-06-04T07:55:00+07:00', '2026-06-04T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dung', 'Phòng Kỹ thuật thi công', '2026-06-05', '2026-06-05T07:55:00+07:00', '2026-06-05T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dung', 'Phòng Kỹ thuật thi công', '2026-06-08', '2026-06-08T07:55:00+07:00', '2026-06-08T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dung', 'Phòng Kỹ thuật thi công', '2026-06-09', '2026-06-09T07:55:00+07:00', '2026-06-09T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dung', 'Phòng Kỹ thuật thi công', '2026-06-10', '2026-06-10T07:55:00+07:00', '2026-06-10T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dung', 'Phòng Kỹ thuật thi công', '2026-06-11', '2026-06-11T07:55:00+07:00', '2026-06-11T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dung', 'Phòng Kỹ thuật thi công', '2026-06-12', '2026-06-12T07:55:00+07:00', '2026-06-12T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);

insert into public.payroll_attendance_logs (employee_id, employee_name, department, date, check_in, check_out, gps_in, gps_out, address_in, address_out, status, shift_id, overtime_hours) values
('70707070-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dung', 'Phòng Kỹ thuật thi công', '2026-06-15', '2026-06-15T07:55:00+07:00', '2026-06-15T17:05:00+07:00', '21.016700, 105.783800', '21.016700, 105.783800', 'Landmark 72, Cầu Giấy, Hà Nội', 'Landmark 72, Cầu Giấy, Hà Nội', 'on_time', 'sh1', 0);


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
insert into public.payslips (employee_id, employee_name, email, department, month, base_salary, workdays, ot_hours, ot_pay, allowance, bonus, deductions, insurance, tax, net_pay, status, last_sent_at) values
('70707070-0000-0000-0000-000000000001', 'Nguyễn Văn Trị', 'admin@apex.com', 'Ban Giám đốc', '2026-05', 55000000, 22.0, 0.0, 0.0, 1000000.0, 500000.0, 0.0, 6325000, 2750000, 47425000, 'sent', '2026-06-05T09:00:00Z')
on conflict (employee_id, month) do nothing;

insert into public.payslips (employee_id, employee_name, email, department, month, base_salary, workdays, ot_hours, ot_pay, allowance, bonus, deductions, insurance, tax, net_pay, status, last_sent_at) values
('70707070-1111-1111-1111-111111111111', 'Dylan', 'lequangdieu0302@gmail.com', 'Phòng Kỹ thuật thi công', '2026-05', 30000000, 22.0, 0.0, 0.0, 1000000.0, 500000.0, 0.0, 3450000, 1500000, 26550000, 'sent', '2026-06-05T09:00:00Z')
on conflict (employee_id, month) do nothing;

insert into public.payslips (employee_id, employee_name, email, department, month, base_salary, workdays, ot_hours, ot_pay, allowance, bonus, deductions, insurance, tax, net_pay, status, last_sent_at) values
('70707070-2222-2222-2222-222222222222', 'Luân', 'lequangdieu03022@gmail.com', 'Phòng Tài chính Kế toán', '2026-05', 22000000, 22.0, 0.0, 0.0, 1000000.0, 500000.0, 0.0, 2530000, 1100000, 19870000, 'sent', '2026-06-05T09:00:00Z')
on conflict (employee_id, month) do nothing;

insert into public.payslips (employee_id, employee_name, email, department, month, base_salary, workdays, ot_hours, ot_pay, allowance, bonus, deductions, insurance, tax, net_pay, status, last_sent_at) values
('70707070-3333-3333-3333-333333333333', 'Tài', 'lequangdieu030222@gmail.com', 'Phòng Kinh doanh', '2026-05', 18000000, 22.0, 0.0, 0.0, 1000000.0, 500000.0, 0.0, 2070000, 900000, 16530000, 'sent', '2026-06-05T09:00:00Z')
on conflict (employee_id, month) do nothing;

insert into public.payslips (employee_id, employee_name, email, department, month, base_salary, workdays, ot_hours, ot_pay, allowance, bonus, deductions, insurance, tax, net_pay, status, last_sent_at) values
('70707070-4444-4444-4444-444444444444', 'Quân', 'lequangdieu0302222@gmail.com', 'Phòng Vật tư & Kho vận', '2026-05', 15000000, 22.0, 0.0, 0.0, 1000000.0, 500000.0, 0.0, 1725000, 750000, 14025000, 'sent', '2026-06-05T09:00:00Z')
on conflict (employee_id, month) do nothing;

insert into public.payslips (employee_id, employee_name, email, department, month, base_salary, workdays, ot_hours, ot_pay, allowance, bonus, deductions, insurance, tax, net_pay, status, last_sent_at) values
('70707070-5555-5555-5555-555555555555', 'Kiên', 'lequangdieu03022232@gmail.com', 'Phòng Kỹ thuật thi công', '2026-05', 16000000, 22.0, 0.0, 0.0, 1000000.0, 500000.0, 0.0, 1840000, 800000, 14860000, 'sent', '2026-06-05T09:00:00Z')
on conflict (employee_id, month) do nothing;

insert into public.payslips (employee_id, employee_name, email, department, month, base_salary, workdays, ot_hours, ot_pay, allowance, bonus, deductions, insurance, tax, net_pay, status, last_sent_at) values
('70707070-6666-6666-6666-666666666666', 'Tiến', 'lequangdieu030222132@gmail.com', 'Phòng Kỹ thuật thi công', '2026-05', 20000000, 22.0, 0.0, 0.0, 1000000.0, 500000.0, 0.0, 2300000, 1000000, 18200000, 'sent', '2026-06-05T09:00:00Z')
on conflict (employee_id, month) do nothing;

insert into public.payslips (employee_id, employee_name, email, department, month, base_salary, workdays, ot_hours, ot_pay, allowance, bonus, deductions, insurance, tax, net_pay, status, last_sent_at) values
('70707070-7777-7777-7777-777777777777', 'Tèo', 'lequangdieu0302222132@gmail.com', 'Phòng Kinh doanh', '2026-05', 12000000, 22.0, 0.0, 0.0, 1000000.0, 500000.0, 0.0, 1380000, 600000, 11520000, 'sent', '2026-06-05T09:00:00Z')
on conflict (employee_id, month) do nothing;

insert into public.payslips (employee_id, employee_name, email, department, month, base_salary, workdays, ot_hours, ot_pay, allowance, bonus, deductions, insurance, tax, net_pay, status, last_sent_at) values
('70707070-8888-8888-8888-888888888888', 'Hải', 'lequangdieu032@gmail.com', 'Phòng Vật tư & Kho vận', '2026-05', 11000000, 22.0, 0.0, 0.0, 1000000.0, 500000.0, 0.0, 1265000, 550000, 10685000, 'sent', '2026-06-05T09:00:00Z')
on conflict (employee_id, month) do nothing;

insert into public.payslips (employee_id, employee_name, email, department, month, base_salary, workdays, ot_hours, ot_pay, allowance, bonus, deductions, insurance, tax, net_pay, status, last_sent_at) values
('70707070-9999-9999-9999-999999999999', 'My', 'lequangdieu1032@gmail.com', 'Phòng Tài chính Kế toán', '2026-05', 14000000, 22.0, 0.0, 0.0, 1000000.0, 500000.0, 0.0, 1610000, 700000, 13190000, 'sent', '2026-06-05T09:00:00Z')
on conflict (employee_id, month) do nothing;

insert into public.payslips (employee_id, employee_name, email, department, month, base_salary, workdays, ot_hours, ot_pay, allowance, bonus, deductions, insurance, tax, net_pay, status, last_sent_at) values
('70707070-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dung', 'hudung@gmail.com', 'Phòng Kỹ thuật thi công', '2026-05', 35000000, 22.0, 0.0, 0.0, 1000000.0, 500000.0, 0.0, 4025000, 1750000, 30725000, 'sent', '2026-06-05T09:00:00Z')
on conflict (employee_id, month) do nothing;


-- 8. AUDIT LOGS
insert into public.payroll_audit_logs (operator_user, timestamp, action, details) values
('dung', '2026-06-05T09:00:00Z', 'EMAIL_PAYSLIP', 'Đã phân phối phiếu lương tháng 05/2026 cho toàn bộ nhân viên.'),
('dung', '2026-06-05T08:30:00Z', 'LOCK_PAYROLL', 'Đã khóa bảng lương tháng 05/2026.');
