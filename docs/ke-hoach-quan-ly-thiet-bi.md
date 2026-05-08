# Kế hoạch chi tiết: Hệ thống Quản lý Thiết bị Bệnh viện

## 1. Mục tiêu dự án
Xây dựng một hệ thống phần mềm tập trung để quản lý vòng đời của tất cả các loại tài sản, thiết bị trong bệnh viện, được phân quyền và quản lý bởi 3 phòng ban chức năng chính:
- **Phòng CNTT:** Quản lý máy tính, máy in, server, thiết bị mạng, phần mềm...
- **Phòng Vật tư thiết bị Y tế:** Quản lý máy siêu âm, X-quang, máy đo huyết áp, giường bệnh...
- **Phòng Hành chính quản trị:** Quản lý bàn ghế, tủ tài liệu, điều hòa, quạt, xe cứu thương...

## 2. Phạm vi hệ thống (Scope)
Hệ thống sẽ phục vụ các quy trình cốt lõi sau:
- **Nhập/Xuất kho:** Quản lý thông qua các **Phiếu nhập kho** và **Phiếu xuất kho** chuẩn hóa. Ghi nhận thiết bị mới mua, phân bổ bàn giao về các khoa/phòng.
- **Theo dõi vị trí & Trạng thái:** Nắm bắt chính xác thiết bị đang ở khoa nào, do ai chịu trách nhiệm, tình trạng hiện tại (Chưa sử dụng, Đang sử dụng, Báo hỏng, Đang sửa chữa, Đã thanh lý).
- **Bảo trì & Sửa chữa:** Theo dõi lịch sử sửa chữa, chi phí, và lên lịch bảo trì định kỳ.
- **Thống kê & Báo cáo:** Cung cấp **Báo cáo Nhập - Xuất - Tồn**, báo cáo tổng tài sản, báo cáo khấu hao, thiết bị hư hỏng theo từng phòng ban quản lý chuyên trách.

## 3. Phân quyền và Vai trò (Roles & Permissions)
Tính năng cốt lõi là phải phân tách rõ ràng quyền hạn của 3 phòng ban:
- **Super Admin (Ban Giám Đốc):** Xem được toàn bộ dữ liệu, báo cáo tổng thể.
- **Quản trị viên CNTT:** Chỉ được Thêm/Sửa/Xóa/Luân chuyển và xem báo cáo nhóm "Thiết bị tin học".
- **Quản trị viên Vật tư Y tế:** Chỉ được thao tác với nhóm "Thiết bị y tế".
- **Quản trị viên Hành chính:** Chỉ được thao tác với nhóm "Thiết bị hành chính".
- **Người dùng các Khoa/Phòng (Lâm sàng):** Chỉ xem được danh sách thiết bị khoa mình đang quản lý, có quyền tạo phiếu yêu cầu sửa chữa/báo hỏng.

## 4. Cấu trúc dữ liệu dự kiến (Data Schema)
**1. Bảng `Departments` (Khoa/Phòng):**
- `id`, `name`, `type` (Phòng quản lý hay Khoa lâm sàng).

**2. Bảng `Warehouses` (Danh mục Kho):**
- Quy tắc: Mỗi phòng quản lý (CNTT, VTYT, HCQT) có 1 "Kho chính". Mỗi khoa lâm sàng có 1 "Kho khoa".
- `id`, `name`, `department_id`, `is_main_warehouse` (true/false).

**3. Bảng `Equipment_Categories` (Danh mục loại dùng chung):**
- Đây là bảng danh mục DÙNG CHUNG cho cả 3 bộ phận, nhưng có trường phân loại để biết danh mục này thuộc bộ phận nào quản lý.
- `id`, `name`, `managed_by` (Phân loại danh mục thuộc: CNTT, VTYT, hay HCQT).

**4. Bảng `Equipments` (Danh sách thiết bị/Tài sản cụ thể):**
- Khi import dữ liệu, hệ thống tự động map theo file Excel chuẩn của bệnh viện, đồng thời **TỰ ĐỘNG SINH RA 1 MÃ QR CODE** (`qr_code`) để dán lên thiết bị thực tế.
- **Các trường cơ bản (map theo Excel):**
  - `ma_vttb` (Mã TB), `ten_vttb` (Tên TB), `qr_code` (Mã QR sinh tự động).
  - `hang_sx`, `nuoc_sx`, `nam_sx` (Thông tin sản xuất).
  - `loai_thietbi`, `nhom`, `loai`, `donvitinh`, `vattu_hay_tb` (Phân loại).
  - `kyhieu` (Model), `serial`, `quanly_serial` (Thông tin định danh).
  - `dongia`, `vat`, `dongia_vat` (Tài chính).
  - `nguon_kp` (Nguồn kinh phí), `dv_cungung` (Nhà cung cấp).
  - `bao_hanh`, `ngay_bdbh`, `ngay_ktbh` (Thông tin bảo hành).
  - `pp_tinh_khauhao`, `thoigian_khauhao`, `ten_ketoan` (Khấu hao).
- **Các trường quản lý luồng:**
  - `tt_hoatdong` / `status` (Trạng thái: Đang hoạt động, Trong kho, Báo hỏng, Thanh lý...).
  - `warehouse_id` (Thiết bị đang nằm ở kho nào - Kho chính hay Kho khoa).

**5. Bảng `Inventory_Vouchers` (Phiếu Nhập/Xuất kho):**
- Đây là bảng lưu thông tin các chứng từ nhập kho khi mua sắm hoặc xuất kho luân chuyển.
- `id`, `voucher_code` (Mã phiếu, VD: PN-VTYT-001), `type` (Nhập kho / Xuất kho).
- `date`, `supplier_name` (Nhà cung cấp - nếu nhập), `from_warehouse_id`, `to_warehouse_id`.
- `created_by` (Người lập phiếu).

**6. Bảng `Maintenance_Logs` (Lịch sử bảo trì/Sửa chữa):**
- `id`, `equipment_id`, `reported_by` (Khoa báo hỏng), `issue_description`.
- `handled_by` (Người sửa), `status` (Chờ xử lý, Đang sửa, Hoàn thành), `cost`.

## 5. Luồng xử lý nghiệp vụ chính (Business Logic)
**Luồng 1: Quy trình Nhập/Xuất kho bằng Phiếu**
1. **Nhập kho chính:** Phòng Vật tư Y tế (VTYT) mua mới lô thiết bị.
   - Quản trị viên VTYT lập **Phiếu Nhập Kho** (điền ngày nhập, nhà cung cấp).
   - Khai báo danh sách thiết bị vào phiếu này. Ngay khi lưu, hệ thống tự động sinh ra một **mã QR Code** cho từng thiết bị. Trạng thái thiết bị lúc này là: `Trong kho`.
2. **Xuất kho về Khoa:** Khoa Nội yêu cầu cấp thiết bị. Quản trị viên VTYT lập **Phiếu Xuất Kho**, chọn thiết bị từ "Kho chính - VTYT" xuất về "Kho - Khoa Nội".
3. **Cập nhật vị trí:** Hệ thống tự động dựa trên Phiếu xuất kho để chuyển `warehouse_id` của thiết bị sang Kho của Khoa Nội, trạng thái thiết bị đổi thành `Đang sử dụng`.

**Luồng 2: Báo cáo Nhập - Xuất - Tồn**
- Quản trị viên chọn mốc thời gian (VD: Tháng 5) để xem báo cáo tự động:
  - **Tồn đầu kỳ:** Số lượng thiết bị loại X trong kho ở đầu kỳ.
  - **Nhập trong kỳ:** Số lượng thiết bị loại X mua mới (dựa vào tổng Phiếu nhập).
  - **Xuất trong kỳ:** Số lượng thiết bị loại X cấp cho các khoa (dựa vào tổng Phiếu xuất).
  - **Tồn cuối kỳ:** Tồn đầu kỳ + Nhập - Xuất (Số lượng còn lại thực tế trong kho).

**Luồng 3: Quy trình Báo hỏng - Sửa chữa liên phòng ban**
1. Điều dưỡng khoa Nội phát hiện 1 máy tính hỏng và 1 máy đo huyết áp hỏng.
2. Lên phần mềm tạo 2 "Yêu cầu sửa chữa".
3. Hệ thống tự động phân loại: 
   - Máy tính -> Báo thông báo cho nhân sự phòng CNTT.
   - Máy đo huyết áp -> Báo thông báo cho nhân sự phòng Vật tư Y tế.
4. Nhân viên kỹ thuật của từng phòng tiếp nhận, chuyển trạng thái sang "Đang sửa".
5. Sau khi sửa xong, cập nhật chi phí, ghi chú, trạng thái thành "Đang sử dụng" -> Khoa Nội nhận được thông báo đã sửa xong.

## 6. Giai đoạn triển khai (Phases)
**Giai đoạn 1 (MVP - Nền tảng cốt lõi):**
- Xây dựng database, phân quyền đăng nhập.
- Tính năng Quản lý danh mục thiết bị (CRUD).
- Phân bổ thiết bị cho các Khoa/Phòng.

**Giai đoạn 2 (Vận hành & Theo dõi):**
- Luồng tạo phiếu báo hỏng và cập nhật sửa chữa.
- Dashboard báo cáo thống kê theo từng phòng ban quản lý.

**Giai đoạn 3 (Nâng cao):**
- Quản lý khấu hao tài sản.
- Tạo mã QR/Barcode để dán lên thiết bị và quét bằng điện thoại.

---
**CÁC CÂU HỎI CẦN BẠN XÁC NHẬN ĐỂ BẮT ĐẦU:**
1. Hệ thống này là một dự án hoàn toàn mới, hay sẽ tích hợp vào source code hiện tại đang mở?
2. Bạn dự định sử dụng Tech Stack nào cho dự án này (ví dụ: Next.js + SQL Server)?
3. Bạn có muốn thêm bớt phần nào trong bản kế hoạch này không?
