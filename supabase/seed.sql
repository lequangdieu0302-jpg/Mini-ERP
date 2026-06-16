-- Seed data for Construction & Contracting ERP (Odoo-Style) in Vietnamese
-- Modified with valid hexadecimal UUIDs to prevent 22P02 invalid syntax errors

-- 1. COMPANIES
insert into companies (id, name, logo_url, address, phone, email, tax_id, currency) values
('c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Công ty Cổ phần Xây dựng Apex', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=100&q=80', '100 Đường Khuất Duy Tiến, Thanh Xuân, Hà Nội', '024-555-0100', 'info@apexconstruction.com.vn', 'MST-010998811', 'VND'),
('c8b671a8-ff69-42b7-a37a-77c86f7882c2', 'Nhà cung cấp Vật liệu Xây dựng Apex', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=100&q=80', '250 Đường Quốc lộ 1A, Thuận An, Bình Dương', '0274-555-0200', 'sales@apexmaterials.com.vn', 'MST-010998822', 'VND'),
('c8b671a8-ff69-42b7-a37a-77c86f7883c3', 'Tổng công ty Đầu tư & Xây dựng Summit', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=100&q=80', '50 Đường Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh', '028-555-0300', 'contact@summitbuilders.vn', 'MST-010998833', 'VND');

-- 2. USER PROFILES
insert into users_profile (id, email, full_name, avatar_url, current_company_id) values
('00000000-0000-0000-0000-000000000001', 'admin@apex.com', 'Nguyễn Văn Trị', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1'),
('00000000-0000-0000-0000-000000000002', 'john@apex.com', 'Trần Minh Hoàng', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1'),
('00000000-0000-0000-0000-000000000003', 'alice@apex.com', 'Lê Thị Mai', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1'),
('00000000-0000-0000-0000-000000000004', 'bob@apex.com', 'Phạm Thanh Bình', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1'),
('00000000-0000-0000-0000-000000000005', 'charlie@apex.com', 'Hoàng Văn Khoa', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1'),
('00000000-0000-0000-0000-000000000006', 'dave@apex.com', 'Vũ Quốc Anh', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1'),
('00000000-0000-0000-0000-000000000007', 'emily@apex.com', 'Đỗ Thị Dung', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1'),
('00000000-0000-0000-0000-000000000008', 'frank@apex.com', 'Ngô Chí Dũng', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1');

-- 3. USER COMPANIES (ROLES)
insert into user_companies (user_id, company_id, role) values
('00000000-0000-0000-0000-000000000001', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Super Admin'),
('00000000-0000-0000-0000-000000000001', 'c8b671a8-ff69-42b7-a37a-77c86f7882c2', 'Super Admin'),
('00000000-0000-0000-0000-000000000002', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Project Manager'),
('00000000-0000-0000-0000-000000000003', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Sales'),
('00000000-0000-0000-0000-000000000004', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Purchasing'),
('00000000-0000-0000-0000-000000000005', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Warehouse Staff'),
('00000000-0000-0000-0000-000000000006', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Site Engineer'),
('00000000-0000-0000-0000-000000000007', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'HR'),
('00000000-0000-0000-0000-000000000008', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Accountant');

-- 4. CUSTOMERS
insert into customers (id, company_id, name, email, phone, address, is_company, parent_id, credit_limit) values
('11111111-1111-1111-1111-111111111111', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Tổng công ty Đường sắt Việt Nam', 'procurement@vr.com.vn', '024-3942-5974', '118 Đường Lê Duẩn, Hoàn Kiếm, Hà Nội', true, null, 25000000000.00),
('22222222-2222-2222-2222-222222222222', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Tập đoàn Bất động sản Hoàng Gia', 'billing@royalrealty.vn', '028-3930-1234', '350 Đường Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh', true, null, 12000000000.00),
('33333333-3333-3333-3333-333333333333', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Nguyễn Hoàng Nam', 'nam.nguyen@gmail.com', '090-555-0399', '12 Đường Hoa Mai, Phường 2, Phú Nhuận, TP. Hồ Chí Minh', false, null, 250000000.00);

-- 5. CRM LEADS
insert into crm_leads (id, company_id, name, customer_id, contact_name, email, phone, status, expected_revenue, probability, priority, next_activity, next_activity_date, notes) values
('aeaeaeae-1111-1111-1111-111111111111', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Dự án Móng hầm Căn hộ Vinhomes Grand Park (Phân khu 3)', '22222222-2222-2222-2222-222222222222', 'Phạm Minh Trí', 'tri.pham@royalrealty.vn', '091-555-4011', 'proposition', 20000000000.00, 75.00, 3, 'Gửi báo giá cập nhật thép thanh vằn và tiến độ đổ móng', '2026-06-18', 'Hợp đồng móng hầm quy mô lớn. Đối tác yêu cầu thép chất lượng cao Hòa Phát và cung ứng nhanh.'),
('aeaeaeae-2222-2222-2222-222222222222', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Sửa chữa Gia cố Hầm đường sắt Số 2 Hà Nội', '11111111-1111-1111-1111-111111111111', 'Lê Hữu Phước', 'phuoc.le@vr.com.vn', '098-555-4022', 'new', 30000000000.00, 20.00, 2, 'Gọi điện đặt lịch hẹn khảo sát thực địa', '2026-06-15', 'Đấu thầu gia cố kết cấu vòm hầm tuyến nội đô.'),
('aeaeaeae-3333-3333-3333-333333333333', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Đổ bê tông sân vườn biệt thự Quận 7', '33333333-3333-3333-3333-333333333333', 'Nguyễn Hoàng Nam', 'nam.nguyen@gmail.com', '090-555-0399', 'qualified', 180000000.00, 50.00, 1, 'Gửi bảng giá bê tông tươi mác 250', '2026-06-16', 'Công trình gia đình nhỏ lẻ.');

-- 6. UOM & CATEGORIES
insert into uom (id, name, category) values
('b0b0b0b0-1111-1111-1111-111111111111', 'Mét', 'length'),
('b0b0b0b0-2222-2222-2222-222222222222', 'Mét vuông', 'area'),
('b0b0b0b0-3333-3333-3333-333333333333', 'Mét khối', 'volume'),
('b0b0b0b0-4444-4444-4444-444444444444', 'Kg', 'weight'),
('b0b0b0b0-5555-5555-5555-555555555555', 'Tấn', 'weight'),
('b0b0b0b0-6666-6666-6666-666666666666', 'Cái/Chiếc', 'unit');

insert into product_categories (id, company_id, name) values
('c0c0c0c0-1111-1111-1111-111111111111', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Nguyên vật liệu thô'),
('c0c0c0c0-2222-2222-2222-222222222222', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Thép kết cấu'),
('c0c0c0c0-3333-3333-3333-333333333333', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Dịch vụ thi công');

-- 7. PRODUCTS (MATERIALS)
insert into products (id, company_id, name, sku, barcode, description, category_id, uom_id, sale_price, cost_price, is_material, min_qty, current_qty, image_url) values
('da0da0da-1111-1111-1111-111111111111', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Xi măng Portland Nghi Sơn PCB40', 'CEM-PORT-42', '885002010111', 'Xi măng poóc lăng hỗn hợp chuẩn xây dựng dân dụng và công nghiệp.', 'c0c0c0c0-1111-1111-1111-111111111111', 'b0b0b0b0-4444-4444-4444-444444444444', 95000.00, 78000.00, true, 1000.00, 2500.00, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=150&q=80'),
('da0da0da-2222-2222-2222-222222222222', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Thép thanh vằn Hòa Phát D16', 'ST-REB-16', '885002010222', 'Thép cốt bê tông cán nóng, giới hạn chảy cao, đường kính nominal 16mm.', 'c0c0c0c0-2222-2222-2222-222222222222', 'b0b0b0b0-5555-5555-5555-555555555555', 16500000.00, 14800000.00, true, 20.00, 45.00, 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=150&q=80'),
('da0da0da-3333-3333-3333-333333333333', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Cát vàng đổ bê tông', 'SND-COARSE', '885002010333', 'Cát sông hạt thô, sạch, chuyên dụng cho trộn bê tông mác cao.', 'c0c0c0c0-1111-1111-1111-111111111111', 'b0b0b0b0-3333-3333-3333-333333333333', 380000.00, 250000.00, true, 200.00, 150.00, 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=150&q=80');

-- 8. WAREHOUSES
insert into warehouses (id, company_id, name, code, address) values
('e0e0e0e0-1111-1111-1111-111111111111', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Bãi vật tư Cầu Giấy', 'CGY-01', 'Phường Dịch Vọng Hậu, Cầu Giấy, Hà Nội'),
('e0e0e0e0-2222-2222-2222-222222222222', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Kho trung chuyển Long Biên', 'LBN-02', 'Đường Nguyễn Văn Linh, Long Biên, Hà Nội');

-- 9. PROJECTS
insert into projects (id, company_id, name, description, start_date, end_date, budget, actual_cost, status, manager_id, progress) values
('f0f0f0f0-1111-1111-1111-111111111111', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Cải tạo nâng cấp Cầu cảng Số 4 Hải Phòng', 'Khắc phục sụt lún dầm bê tông, vệ sinh rỉ sét cọc móng thép và sơn phủ bảo vệ cốt thép dưới mực nước triều.', '2026-04-01', '2026-10-31', 9500000000.00, 2800000000.00, 'active', '00000000-0000-0000-0000-000000000002', 28.00),
('f0f0f0f0-2222-2222-2222-222222222222', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Gia cố kết cấu nhà xưởng thép tiền chế Bình Dương', 'Khoan cấy bu lông neo móng cọc, cẩu lắp dầm thép vì kèo vượt nhịp 45m và lợp tôn chống nóng.', '2026-06-01', '2027-02-28', 27000000000.00, 620000000.00, 'active', '00000000-0000-0000-0000-000000000002', 8.00);

-- 10. TASKS
insert into tasks (id, project_id, name, description, priority, status, assignee_id, start_date, due_date, hours_estimate, hours_spent) values
('80808080-1111-1111-1111-111111111111', 'f0f0f0f0-1111-1111-1111-111111111111', 'Khảo sát hiện trạng & Tập kết thiết bị', 'Vận chuyển máy phun rửa cao áp, máy khoan cắt bê tông, lắp dựng rào chắn an toàn công trường.', 'high', 'done', '00000000-0000-0000-0000-000000000006', '2026-04-01', '2026-04-15', 80.00, 85.00),
('80808080-2222-2222-2222-222222222222', 'f0f0f0f0-1111-1111-1111-111111111111', 'Phá dỡ bê tông cũ & Vệ sinh bề mặt cọc', 'Đục tẩy lớp bê tông rỗ nứt bằng búa căn hơi, làm sạch muối bám và gỉ sét cốt thép.', 'medium', 'in_progress', '00000000-0000-0000-0000-000000000006', '2026-04-16', '2026-06-30', 250.00, 180.00),
('80808080-3333-3333-3333-333333333333', 'f0f0f0f0-1111-1111-1111-111111111111', 'Thay thế cốt thép & Khoan cấy thép neo', 'Hàn nối cốt thép chịu lực chính bị ăn mòn, khoan tạo lỗ bơm keo epoxy định vị râu neo.', 'high', 'todo', '00000000-0000-0000-0000-000000000006', '2026-07-01', '2026-08-30', 180.00, 0.00),
('80808080-4444-4444-4444-444444444444', 'f0f0f0f0-2222-2222-2222-222222222222', 'Đào hố móng trụ đỡ vì kèo thép', 'Múc đất định hình hố móng trụ trục A-B và đầm nén đáy móng lót đá 4x6.', 'medium', 'in_progress', '00000000-0000-0000-0000-000000000006', '2026-06-01', '2026-07-15', 120.00, 75.00);

-- 11. DEPARTMENTS & EMPLOYEES
insert into departments (id, company_id, name, manager_id) values
('90909090-1111-1111-1111-111111111111', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Phòng Kỹ thuật thi công', '00000000-0000-0000-0000-000000000006'),
('90909090-2222-2222-2222-222222222222', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Phòng Tài chính Kế toán', '00000000-0000-0000-0000-000000000008');

insert into employees (id, company_id, user_id, department_id, position, hire_date, salary, active) values
('70707070-1111-1111-1111-111111111111', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', '00000000-0000-0000-0000-000000000006', '90909090-1111-1111-1111-111111111111', 'Kỹ sư Kết cấu trưởng', '2024-01-15', 24000000.00, true),
('70707070-2222-2222-2222-222222222222', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', '00000000-0000-0000-0000-000000000008', '90909090-2222-2222-2222-222222222222', 'Kế toán trưởng chi nhánh', '2023-11-01', 20000000.00, true);

-- 12. CHART OF ACCOUNTS
insert into chart_of_accounts (company_id, code, name, type) values
('c8b671a8-ff69-42b7-a37a-77c86f7881c1', '1010', 'Tài khoản Ngân hàng doanh nghiệp (Vietcombank)', 'asset'),
('c8b671a8-ff69-42b7-a37a-77c86f7881c1', '1200', 'Phải thu khách hàng (TK 131)', 'asset'),
('c8b671a8-ff69-42b7-a37a-77c86f7881c1', '1400', 'Hàng tồn kho nguyên vật liệu (TK 152)', 'asset'),
('c8b671a8-ff69-42b7-a37a-77c86f7881c1', '2010', 'Phải trả nhà cung cấp (TK 331)', 'liability'),
('c8b671a8-ff69-42b7-a37a-77c86f7881c1', '4010', 'Doanh thu hợp đồng xây dựng (TK 511)', 'income'),
('c8b671a8-ff69-42b7-a37a-77c86f7881c1', '5010', 'Chi phí mua nguyên vật liệu trực tiếp (TK 621)', 'expense'),
('c8b671a8-ff69-42b7-a37a-77c86f7881c1', '5020', 'Chi phí nhân công trực tiếp công trường (TK 622)', 'expense');

-- 13. VENDORS
insert into vendors (id, company_id, name, email, phone, address, performance_rating) values
('55555555-1111-1111-1111-111111111111', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Công ty Cổ phần Thép Hòa Phát Hưng Yên', 'sales@hoaphat.com.vn', '0221-555-9011', 'Khu công nghiệp Phố Nối A, Giai Phạm, Yên Mỹ, Hưng Yên', 4.80),
('55555555-2222-2222-2222-222222222222', 'c8b671a8-ff69-42b7-a37a-77c86f7881c1', 'Tổng công ty Bê tông tươi Sông Đà', 'logistics@songdaconcrete.vn', '024-555-9022', 'Khu đô thị Văn Khê, Hà Đông, Hà Nội', 4.25);
