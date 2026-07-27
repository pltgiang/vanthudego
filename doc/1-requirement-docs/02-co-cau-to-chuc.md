# TM-HT-02 · ĐẶC TẢ MÀN HÌNH — CƠ CẤU TỔ CHỨC

> **Ứng dụng:** Hệ thống · **Phân hệ:** Quản lý danh mục → Cơ cấu tổ chức
> **Mã màn hình:** `SYS-ORG-STRUCTURE` · **Phiên bản:** v1.0 · **Ngày lập:** 24/07/2026
> **Thuộc bộ:** Đặc tả Công cụ Thu mua DEGO · **Kế thừa quy ước:** [01-thong-tin-cong-ty.md](01-thong-tin-cong-ty.md) §3, §5

---

## 1. TỔNG QUAN

### 1.1. Mục đích
Khai báo thông tin về **chi nhánh / phòng ban / bộ phận** trong doanh nghiệp, tạo thành **cây cơ cấu tổ chức** dùng chung cho toàn hệ thống (phân quyền, định tuyến duyệt, gán đơn vị cho phiếu mua hàng…).

### 1.2. Nguyên tắc quan trọng — nơi được sửa
> ⚠️ **Việc thêm mới / sửa cơ cấu tổ chức CHỈ thực hiện trên AMIS Hệ thống.**
> Các ứng dụng tiêu thụ (Thu mua, Kho hàng…) **chỉ xem và đồng bộ**, không sửa.

| Nơi | Xem | Thêm/Sửa/Xóa | Đồng bộ |
|---|:--:|:--:|:--:|
| **AMIS Hệ thống** → Quản lý danh mục → Cơ cấu tổ chức | ✅ | ✅ | — |
| **Ứng dụng tiêu thụ** (Thu mua, Kho hàng…) → Danh mục → Cơ cấu tổ chức | ✅ | ❌ | ✅ |

### 1.3. Hai màn hình trong đặc tả

| Mã | Màn hình | Mô tả |
|---|---|---|
| `A` | **Danh sách cơ cấu tổ chức** | Cây phân cấp + tìm kiếm + lọc trạng thái |
| `B` | **Thêm / Sửa cơ cấu tổ chức** | Form khai báo, **biến đổi theo Cấp tổ chức** |

### 1.4. Vai trò sử dụng

| Vai trò | Xem | Thêm | Sửa | Ngừng theo dõi | Xóa |
|---|:--:|:--:|:--:|:--:|:--:|
| Quản trị hệ thống | ✅ | ✅ | ✅ | ✅ | ✅ |
| Quản trị ứng dụng | ✅ | ✅ | ✅ | ✅ | ❌ |
| Người dùng thường | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 2. MÀN HÌNH A — DANH SÁCH CƠ CẤU TỔ CHỨC

### 2.1. Bố cục (trên AMIS Hệ thống)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Cơ cấu tổ chức                          [ 🗄 Xem phát sinh ]  [ + Thêm cơ cấu ▾ ]│
├──────────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Tìm kiếm theo mã, tên đơn vị, tên viết tắt...]                              │
│                          ⇕ Mở rộng   ⇕ Thu gọn   Trạng thái [Tất cả ▾]  [⤓] [⚙] │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Tên đơn vị        │Mã đơn vị │Tên viết tắt│Thuộc đơn vị│Cấp tổ chức│Trạng thái│Địa chỉ│
├──────────────────────────────────────────────────────────────────────────────────┤
│ ⊟ Công ty chuyển đổi│ERDRTKEJ│Công ty c.đổi│    -     │Tổng công ty│Đang theo dõi│Cầu Giấy│
│    Chi nhánh HCM   │..._01  │     -      │Công ty c.đổi│ Chi nhánh │Đang theo dõi│   -   │
│    Phòng kinh doanh│..._02  │     -      │Công ty c.đổi│ Phòng ban │Đang theo dõi│N03t6  │
│ ⊞ Chi nhánh Hà Nội M│..._03  │     -      │Công ty c.đổi│ Chi nhánh │Đang theo dõi│Hà Nội │
│    Ngừng SD        │..._04  │     -      │Công ty c.đổi│ Chi nhánh │Ngừng theo dõi│  -   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Bố cục (trên ứng dụng tiêu thụ — Thu mua / Kho hàng)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Cơ cấu tổ chức        ⓘ Để thêm mới, sửa thông tin cơ cấu tổ chức vui lòng      │
│                          chuyển sang AMIS Hệ Thống. Bấm vào đây                  │ ← banner
├──────────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Tìm kiếm]                          [⟳] [⤓] [ ⟲ Đồng bộ với AMIS Hệ Thống ] │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Mã đơn vị │ Tên đơn vị              │ Địa chỉ │ Cấp tổ chức      │ Trạng thái     │
├──────────────────────────────────────────────────────────────────────────────────┤
│ ❯ ERDRTKEJ│ Công ty chuyển đổi      │ Cầu...  │Tổng công ty/Công ty│● Đang hoạt động│
│    ..._01 │ Chi nhánh Hồ Chí Minh   │    -    │ Chi nhánh        │● Đang hoạt động│
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3. Banner điều hướng (chỉ trên ứng dụng tiêu thụ)

| Thuộc tính | Giá trị |
|---|---|
| Nền | `#EFF6FF` · viền `1px solid #BFD9FF` · bo `6px` · đệm `8px 12px` |
| Icon | `ⓘ` màu `--primary` |
| Nội dung | *"Để thêm mới, sửa thông tin cơ cấu tổ chức vui lòng chuyển sang **AMIS Hệ Thống**. Bấm vào đây"* |
| `AMIS Hệ Thống` | In đậm, màu `--text` |
| `Bấm vào đây` | Link màu `--primary`, gạch chân khi hover → mở AMIS Hệ thống ở **tab mới** |
| Vị trí | Góc trên–phải, cùng hàng tiêu đề |

### 2.4. Đặc tả cột danh sách

| # | Cột | Kiểu | Rộng | Canh | Định dạng |
|---|---|---|---|---|---|
| 1 | **Tên đơn vị** | TEXT + cây | `280px` | Trái | Cột **neo cây**: có icon `⊞`/`⊟`, thụt lề `20px`/cấp. Cấp 1 **in đậm** |
| 2 | **Mã đơn vị** | TEXT | `160px` | Trái | Chữ `--text`; dài quá → `…` + tooltip |
| 3 | **Tên viết tắt** | TEXT | `140px` | Trái | Trống → hiện `-` màu `#9CA3AF` |
| 4 | **Thuộc đơn vị** | TEXT | `160px` | Trái | Tên đơn vị cha; cấp 1 → `-` |
| 5 | **Cấp tổ chức** | TEXT | `140px` | Trái | Xem §2.6 |
| 6 | **Trạng thái** | BADGE | `130px` | Trái | Xem §2.5 |
| 7 | **Địa chỉ** | TEXT | `200px` | Trái | Trống → `-` |

**Định dạng bảng chung:**

| Thành phần | Định dạng |
|---|---|
| Header | Nền `#F7F8FA` · chữ `13px/600 #4B5563` · cao `44px` · dính trên khi cuộn (`sticky`) |
| Dòng | Cao `40px` · viền dưới `1px #EEF1F5` · chữ `13px --text` |
| Hover dòng | Nền `#F5F9FF` |
| Dòng chọn | Nền `#E9F3FF` |
| Ô trống | Ký tự `-` màu `#9CA3AF` |
| Cột đóng băng | Cột **Tên đơn vị** ghim trái khi cuộn ngang |
| Cuộn ngang | Bật khi tổng bề rộng cột > vùng hiển thị |

### 2.5. Badge trạng thái

> ⚠️ **Điểm cần chốt:** hai màn hình đang dùng **hai bộ nhãn khác nhau** cho cùng một dữ liệu.

| Giá trị DB (`is_inactive`) | Nhãn trên AMIS Hệ thống | Nhãn trên ứng dụng tiêu thụ | Định dạng badge |
|---|---|---|---|
| `false` | **Đang theo dõi** | **● Đang hoạt động** | Nền `#E6F4FF` · chữ `#1B6DF3` · bo `4px` · `12px/500` · đệm `2px 8px` (bản tiêu thụ có chấm tròn `#22C55E` + nền `#E7F7EE` + chữ `#16A34A`) |
| `true` | **Ngừng theo dõi** | *(ẩn khỏi danh sách hoặc hiện xám)* | Nền `#F1F3F6` · chữ `#6B7280` |

**Kiến nghị:** thống nhất **một** bộ nhãn — đề xuất dùng **"Đang theo dõi / Ngừng theo dõi"** ở mọi nơi, vì đúng với tên trường `Ngừng theo dõi` trong form.

### 2.6. Danh mục Cấp tổ chức

| Thứ bậc | Giá trị | Ghi chú |
|:--:|---|---|
| 1 | **Tổng công ty/Công ty** | **Duy nhất 1 bản ghi**, hệ thống tự sinh |
| 2 | **Chi nhánh** | Bắt buộc chọn *Hạch toán phụ thuộc / độc lập* |
| 3 | **Văn phòng/Trung tâm** | |
| 4 | **Phòng ban** | |
| 5 | **Phân xưởng** | |
| 6 | **Nhóm/Tổ/Đội** | |

**Quy tắc phân cấp:** đơn vị con phải có `Cấp tổ chức` **thấp hơn** (số thứ bậc lớn hơn) đơn vị cha.
*Ví dụ hợp lệ:* Phòng ban ⊂ Chi nhánh · Phòng ban ⊂ Tổng công ty. *Không hợp lệ:* Chi nhánh ⊂ Phòng ban.
*(Quy tắc suy từ dữ liệu mẫu — **cần xác nhận** với nghiệp vụ cho các trường hợp biên.)*

### 2.7. Thanh công cụ

| Điều khiển | Kiểu | Hành vi |
|---|---|---|
| **🔍 Tìm kiếm** | Ô nhập | Tìm theo **mã · tên đơn vị · tên viết tắt**. Debounce `300ms`. Có kết quả → **tự bung** nhánh chứa kết quả và **tô sáng** từ khóa |
| **⇕ Mở rộng** | Link | Bung toàn bộ cây |
| **⇕ Thu gọn** | Link | Thu về cấp 1 |
| **Trạng thái** | SELECT | `Tất cả` (mặc định) · `Đang theo dõi` · `Ngừng theo dõi` |
| **⤓ Xuất khẩu** | Icon | Xuất danh sách ra Excel theo bộ lọc hiện tại |
| **⚙ Tùy chỉnh cột** | Icon | Ẩn/hiện + kéo đổi thứ tự cột; lưu theo người dùng |
| **🗄 Xem phát sinh** | Nút outline | Xem các nghiệp vụ đã phát sinh của đơn vị *(cần xác nhận chi tiết)* |
| **+ Thêm cơ cấu ▾** | Nút primary + dropdown | Mở màn hình B. Dropdown: *Thêm cơ cấu* · *Nhập khẩu từ Excel* *(cần xác nhận)* |
| **⟳ / ⟲ Đồng bộ** | Nút | **Chỉ ở ứng dụng tiêu thụ** — kéo dữ liệu mới nhất từ AMIS Hệ thống |

### 2.8. Thao tác trên dòng

Hover dòng → hiện nút thao tác cuối dòng (hoặc menu `⋮`):

| Thao tác | Điều kiện | Ghi chú |
|---|---|---|
| **Sửa** | Có quyền sửa | Mở màn hình B ở chế độ Sửa |
| **Thêm đơn vị con** | Có quyền thêm | Mở màn hình B, `Thuộc đơn vị` = dòng hiện tại |
| **Ngừng theo dõi** | `org_level ≠ Tổng công ty/Công ty` | Xem §5.2 |
| **Xóa** | `org_level ≠ Tổng công ty/Công ty` **và** không có đơn vị con **và** chưa phát sinh dữ liệu | Hộp xác nhận |

---

## 3. MÀN HÌNH B — THÊM / SỬA CƠ CẤU TỔ CHỨC

### 3.1. Bố cục

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Thêm cơ cấu tổ chức                            [ Hủy bỏ ]  [ 💾 Lưu ]      │
├───────────────────────────────────┬──────────────────────────────────────────┤
│ CỘT TRÁI                          │ CỘT PHẢI                                 │
│                                   │                                          │
│ Thuộc đơn vị *        [select ▾]  │ Trưởng đơn vị          [select ▾]        │
│ Mã đơn vị *           [________]  │ Chức năng, nhiệm vụ    [________]        │
│ Tên viết tắt          [________]  │ Số ĐK kinh doanh  ⚑    [________]        │
│ Tên đơn vị *          [________]  │ Ngày cấp          ⚑    [__/__/____] 📅   │
│ Cấp tổ chức *      [select ▾] [⋮] │ Nơi cấp           ⚑    [________]        │
│   ⚑ ◉ Hạch toán phụ thuộc         │ Địa chỉ                [________]        │
│     ○ Hạch toán độc lập           │ ☐ Ngừng theo dõi                         │
│ Số thứ tự             [___] ⇅     │                                          │
│ Lĩnh vực hoạt động                │                                          │
│  ☐ Sản xuất ☐ Kinh doanh ☐ Hỗ trợ │                                          │
│  ☐ Văn phòng ☐ Cửa hàng ☐ Nhà hàng│                                          │
└───────────────────────────────────┴──────────────────────────────────────────┘
       ⚑ = trường hiển thị có điều kiện, xem §3.3
```

**Lưới:** 2 cột bằng nhau, gap `32px`. Màn hình `< 1280px` → xếp chồng 1 cột.
**Tiêu đề:** `← Thêm cơ cấu tổ chức` / `← Sửa cơ cấu tổ chức` — mũi tên quay lại danh sách (áp dụng §4.3 nếu có thay đổi chưa lưu).

### 3.2. Đặc tả trường dữ liệu

**Chú giải `Kiểu`:** `TEXT` chữ · `NUM` số · `SELECT` chọn 1 · `MULTI` chọn nhiều · `RADIO` chọn 1 trong nhóm · `CHECK` hộp kiểm · `DATE` ngày · `RO` chỉ đọc.

#### Cột trái

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc | Ghi chú |
|---|---|---|:--:|---|---|
| `parent_id` | Thuộc đơn vị | SELECT | ✅ | 1 giá trị · có tìm kiếm | Nguồn: cây cơ cấu hiện có. **Không được chọn chính nó hoặc đơn vị con của nó** (chống vòng lặp). Cấp Tổng công ty → **trống + disable** |
| `unit_code` | Mã đơn vị | TEXT | ✅ | 1–50 ký tự · **duy nhất toàn hệ thống** | Chữ, số, `_`, `-`. Không khoảng trắng. Tự viết **HOA** khi rời ô |
| `short_name` | Tên viết tắt | TEXT | ✖ | ≤ 100 ký tự | Placeholder *Nhập tên viết tắt* |
| `unit_name` | Tên đơn vị | TEXT | ✅ | 2–255 ký tự | Cho tiếng Việt có dấu |
| `org_level` | Cấp tổ chức | SELECT | ✅ | 1 trong 6 giá trị (§2.6) | Kèm nút `⋮` mở thiết lập danh mục cấp tổ chức. **Chế độ Sửa với Tổng công ty → disable** |
| `accounting_type` | Hạch toán phụ thuộc / độc lập | RADIO | ✅ ⚑ | `DEPENDENT` \| `INDEPENDENT` | **Chỉ hiện khi `org_level = Chi nhánh`**. Mặc định `Hạch toán phụ thuộc` |
| `sort_order` | Số thứ tự | NUM | ✖ | Số nguyên dương `1–9999` | Có nút tăng/giảm `⇅`. Quyết định thứ tự hiển thị trong cùng cấp |
| `business_areas` | Lĩnh vực hoạt động | MULTI | ✖ | 0–6 giá trị | **Nhóm checkbox** — xem §3.4 |

#### Cột phải

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc | Ghi chú |
|---|---|---|:--:|---|---|
| `manager_id` | Trưởng đơn vị | SELECT | ✖ | 1 nhân viên · có tìm kiếm | Nguồn: danh sách nhân viên. Placeholder *Chọn trưởng đơn vị* |
| `functions_duties` | Chức năng, nhiệm vụ | TEXT | ✖ | ≤ 500 ký tự | VD: *Giám đốc* |
| `business_reg_no` | Số ĐK kinh doanh | TEXT | ✖ ⚑ | ≤ 50 ký tự, chữ + số | **Chỉ hiện với Tổng công ty & Chi nhánh** |
| `business_reg_date` | Ngày cấp | DATE | ✖ ⚑ | `dd/MM/yyyy` · ≤ hôm nay | **Chỉ hiện với Tổng công ty & Chi nhánh** |
| `business_reg_place` | Nơi cấp | TEXT | ✖ ⚑ | ≤ 255 ký tự | **Chỉ hiện với Tổng công ty & Chi nhánh** |
| `address` | Địa chỉ | TEXT | ✖ | ≤ 255 ký tự | 1 dòng (khác `Địa chỉ` ở màn Thông tin công ty vốn là textarea) |
| `is_inactive` | Ngừng theo dõi | CHECK | ✖ | `true`/`false` | Mặc định bỏ chọn. **Disable với Tổng công ty/Công ty** |

### 3.3. ⚑ MA TRẬN HIỂN THỊ TRƯỜNG THEO CẤP TỔ CHỨC

> Đây là quy tắc **quan trọng nhất** của màn hình — form đổi hình theo `org_level`.

| Trường | Tổng công ty/Công ty | Chi nhánh | Văn phòng/TT · Phòng ban · Phân xưởng · Nhóm/Tổ/Đội |
|---|:--:|:--:|:--:|
| `parent_id` Thuộc đơn vị | ⬜ trống + disable | ✅ | ✅ |
| `unit_code` Mã đơn vị | ✅ | ✅ | ✅ |
| `short_name` Tên viết tắt | ✅ | ✅ | ✅ |
| `unit_name` Tên đơn vị | ✅ | ✅ | ✅ |
| `org_level` Cấp tổ chức | 🔒 disable khi Sửa | ✅ | ✅ |
| `accounting_type` Hạch toán | ❌ ẩn | ✅ **bắt buộc** | ❌ ẩn |
| `sort_order` Số thứ tự | 🔒 disable | ✅ | ✅ |
| `business_areas` Lĩnh vực | ✅ | ✅ | ✅ |
| `manager_id` Trưởng đơn vị | ✅ | ✅ | ✅ |
| `functions_duties` Chức năng | ✅ | ✅ | ✅ |
| `business_reg_no` Số ĐKKD | ✅ | ✅ | ❌ **ẩn** |
| `business_reg_date` Ngày cấp | ✅ | ✅ | ❌ **ẩn** |
| `business_reg_place` Nơi cấp | ✅ | ✅ | ❌ **ẩn** |
| `address` Địa chỉ | ✅ | ✅ | ✅ |
| `is_inactive` Ngừng theo dõi | 🔒 **disable** | ✅ | ✅ |

**Chú giải:** ✅ hiện & sửa được · ❌ ẩn hoàn toàn · 🔒 hiện nhưng khóa · ⬜ hiện nhưng trống

**Hành vi khi đổi `org_level`:**
1. Chọn **Chi nhánh** → hiện nhóm radio `Hạch toán`, mặc định *Phụ thuộc*; hiện nhóm ĐKKD.
2. Chuyển từ Chi nhánh → Phòng ban: **ẩn** radio Hạch toán và nhóm ĐKKD, đồng thời **xóa giá trị** các trường bị ẩn (không gửi lên API).
3. Việc ẩn/hiện diễn ra **tức thì**, không cần tải lại trang.

### 3.4. Đặc tả `Lĩnh vực hoạt động` (MULTISELECT)

| Thuộc tính | Giá trị |
|---|---|
| Dạng hiển thị | **Nhóm checkbox**, xếp lưới **3 cột × 2 hàng** |
| Giá trị | `Sản xuất` · `Kinh doanh` · `Hỗ trợ` · `Văn phòng` · `Cửa hàng` · `Nhà hàng` |
| Bắt buộc | Không — cho phép **không chọn gì** |
| Số lượng chọn | 0 → 6 (không giới hạn) |
| Lưu trữ | Mảng mã: `["KINH_DOANH","HO_TRO"]` |
| Ô checkbox | `16×16px` · bo `3px` · viền `1.5px #D9DEE7` |
| Khi chọn | Nền `--primary` · dấu ✓ trắng · viền `--primary` |
| Nhãn | `13px --text`, cách ô `8px`, **bấm vào nhãn cũng chọn được** |
| Khoảng cách | Ngang `32px` · dọc `12px` |

> **Lưu ý:** đây là MULTI dạng **checkbox group** (danh sách ngắn, cố định), **không** dùng dropdown chip như quy ước MULTI tổng quát ở [01-thong-tin-cong-ty.md](01-thong-tin-cong-ty.md) §5.4. Quy tắc chọn dạng: **≤ 8 giá trị cố định → checkbox group; > 8 hoặc danh mục động → dropdown chip.**

### 3.5. Đặc tả `Hạch toán` (RADIO)

| Thuộc tính | Giá trị |
|---|---|
| Dạng | 2 radio **cùng hàng ngang**, đặt **ngay dưới** ô `Cấp tổ chức` |
| Giá trị | `◉ Hạch toán phụ thuộc` (mặc định) · `○ Hạch toán độc lập` |
| Bắt buộc | ✅ khi `org_level = Chi nhánh` |
| Nút radio | `16×16px` · viền `1.5px #D9DEE7`; khi chọn: viền `--primary` + chấm trong `--primary` |
| Khoảng cách 2 lựa chọn | `32px` |
| Không cho bỏ chọn | Đã chọn thì luôn có 1 giá trị |

---

## 4. NÚT & TRẠNG THÁI MÀN HÌNH

### 4.1. Luồng thao tác

```
   ┌──── DANH SÁCH (Màn hình A) ────┐
   │  [ + Thêm cơ cấu ]  [ Sửa ]    │
   └───────┬──────────────┬─────────┘
           │ Thêm         │ Sửa
           ▼              ▼
   ┌──── FORM (Màn hình B) — luôn ở chế độ nhập ────┐
   │        [ Hủy bỏ ]      [ 💾 Lưu ]              │
   └───┬────────────────────────────┬───────────────┘
       │ "Hủy bỏ"                   │ "Lưu" (hợp lệ)
       ▼                            ▼
  Xác nhận nếu có thay đổi     Gọi API → toast
  → quay lại DANH SÁCH        → quay lại DANH SÁCH
```

> **Khác với màn Thông tin công ty:** ở đây **không có nút "Chỉnh sửa" tại chỗ**. Form là **màn hình riêng**, mở ra là đã ở chế độ nhập; cặp nút luôn là **Hủy bỏ / Lưu**.

### 4.2. Đặc tả nút

| Nút | Vị trí | Kiểu | Màu | Hành vi |
|---|---|---|---|---|
| **+ Thêm cơ cấu ▾** | Màn A, trên–phải | Primary + dropdown | Nền `--primary`, chữ trắng | Mở màn B (chế độ Thêm) |
| **🗄 Xem phát sinh** | Màn A, trái nút Thêm | Secondary | Nền trắng, viền `--primary`, chữ `--primary` | Xem nghiệp vụ phát sinh |
| **⟲ Đồng bộ với AMIS Hệ Thống** | Màn A (app tiêu thụ) | Secondary | Viền `--primary`, chữ `--primary` | Kéo dữ liệu mới; đang chạy → spinner + disable |
| **Hủy bỏ** | Màn B, trên–phải, **bên trái** Lưu | Secondary | Nền trắng, viền `--border`, chữ `--text` | Có thay đổi → hộp xác nhận; không → quay lại ngay |
| **💾 Lưu** | Màn B, ngoài cùng phải | Primary | Nền `--primary`, chữ trắng, icon 💾 | Validate → API → toast → quay lại danh sách |
| **←** (mũi tên) | Màn B, trước tiêu đề | Icon | `#4B5563` | Tương đương **Hủy bỏ** |

**Kích thước nút:** cao `36px` · bo `6px` · đệm ngang `16px` · chữ `14px/500` · khoảng cách `8px`.

### 4.3. Hộp xác nhận khi Hủy bỏ

```
┌──────────────────────────────────────────────┐
│  Xác nhận hủy                                │
│  Các thay đổi chưa được lưu sẽ bị mất.       │
│  Bạn có chắc chắn muốn hủy?                  │
│                  [ Tiếp tục sửa ] [ Hủy bỏ ] │
└──────────────────────────────────────────────┘
```
Chỉ hiện khi **có thay đổi thật** (so sánh với bản gốc).

### 4.4. Trạng thái nút Lưu

| Tình huống | Trạng thái |
|---|---|
| Chế độ Sửa, chưa đổi gì | **Disable** (mờ 50%) |
| Đang gọi API | **Loading** — spinner, khóa cả 2 nút |
| Lỗi validate | Bật lại, **cuộn tới ô lỗi đầu tiên** và focus |

---

## 5. QUY TẮC NGHIỆP VỤ

### 5.1. Đơn vị cấp Tổng công ty/Công ty

| Quy tắc | Chi tiết |
|---|---|
| Số lượng | **Duy nhất 1 bản ghi** trong toàn hệ thống |
| Nguồn tạo | **Hệ thống tự sinh** khi khởi tạo dữ liệu — người dùng **không tạo tay** |
| Sửa | ✅ Được, qua chức năng **Sửa** |
| Đổi `Cấp tổ chức` | ❌ **Không** — ô bị khóa |
| **Xóa** | ❌ **Không bao giờ** |
| **Ngừng theo dõi** | ❌ **Không bao giờ** — checkbox bị disable |
| `Thuộc đơn vị` | Luôn trống (là gốc cây) |

### 5.2. Ngừng theo dõi

| Quy tắc | Chi tiết |
|---|---|
| Cách dùng | Với đơn vị **không còn nhu cầu sử dụng** — thay cho xóa |
| Cách bật | Tích ô `Ngừng theo dõi` trong form, hoặc thao tác nhanh trên dòng |
| Hệ quả | Đơn vị **không xuất hiện trong các dropdown chọn đơn vị** ở nghiệp vụ mới |
| Dữ liệu cũ | **Vẫn giữ nguyên** — chứng từ đã gắn đơn vị này không đổi |
| Đơn vị con | Ngừng theo dõi đơn vị cha → **hỏi xác nhận** có ngừng theo dõi toàn bộ nhánh con không |
| Khôi phục | Bỏ tích để dùng lại |

### 5.3. Xóa đơn vị

Chỉ xóa được khi **thỏa mãn đồng thời**:
1. `org_level ≠ Tổng công ty/Công ty`
2. **Không có đơn vị con**
3. **Chưa phát sinh dữ liệu** (chưa gắn nhân sự / chứng từ / phiếu mua hàng…)

Không thỏa → chặn, hiện thông báo nêu rõ lý do và **gợi ý dùng Ngừng theo dõi**.

### 5.4. Toàn vẹn cây

| Quy tắc | Xử lý |
|---|---|
| Chống vòng lặp | `parent_id` **không được** là chính nó hoặc bất kỳ đơn vị con cháu của nó |
| Đổi đơn vị cha | Toàn bộ nhánh con **di chuyển theo** |
| Cấp tổ chức | Con phải thấp cấp hơn cha (§2.6) |
| Mã đơn vị | **Duy nhất toàn hệ thống**, kể cả đơn vị đã ngừng theo dõi |

### 5.5. Đồng bộ sang ứng dụng tiêu thụ

| Quy tắc | Chi tiết |
|---|---|
| Chiều đồng bộ | **Một chiều**: AMIS Hệ thống → ứng dụng tiêu thụ |
| Kích hoạt | Thủ công (nút **Đồng bộ**) hoặc tự động theo lịch *(cần xác nhận)* |
| Kết quả | Toast *"Đồng bộ thành công. Cập nhật {n} đơn vị."* |
| Xung đột | Bản AMIS Hệ thống **luôn thắng** |

---

## 6. QUY ĐỊNH NHẬP LIỆU ÁP DỤNG

> Kế thừa đầy đủ [01-thong-tin-cong-ty.md](01-thong-tin-cong-ty.md) §5. Dưới đây là phần **riêng** của màn hình này.

### 6.1. TEXT — chữ

| Trường | Quy định riêng |
|---|---|
| `unit_code` | Chỉ `A–Z`, `0–9`, `_`, `-`. **Chặn khoảng trắng ngay khi gõ**. Tự viết HOA khi rời ô. Kiểm tra trùng qua API (debounce `500ms`), trùng → lỗi `E103` |
| `unit_name` · `short_name` | Cho tiếng Việt có dấu; `trim()` 2 đầu; gộp khoảng trắng thừa |
| `functions_duties` | Tối đa 500 ký tự, hiện bộ đếm khi còn < 50 |

### 6.2. NUM — số

| Trường | Quy định riêng |
|---|---|
| `sort_order` | **Số nguyên dương**, `1–9999`. Chặn chữ, dấu `-`, dấu `.` ngay khi gõ. Có nút `⇅` tăng/giảm bước 1. Bỏ trống → hệ thống tự xếp cuối cùng cấp |

### 6.3. SELECT — chọn một

| Trường | Quy định riêng |
|---|---|
| `parent_id` | Dropdown **dạng cây**, có tìm kiếm. **Ẩn** chính nó + toàn bộ con cháu khỏi danh sách. Đơn vị đã Ngừng theo dõi **không hiện** khi thêm mới |
| `org_level` | 6 giá trị cố định. **Không** có mục rỗng (bắt buộc). Đổi giá trị → kích hoạt ẩn/hiện §3.3 |
| `manager_id` | Danh sách nhân viên, có tìm kiếm theo tên/mã. Có mục *"-- Chọn --"* để bỏ trống |

### 6.4. MULTI — chọn nhiều
`business_areas` — xem chi tiết §3.4.

### 6.5. RADIO / CHECK
`accounting_type` — §3.5. `is_inactive` — checkbox đơn, xem §5.2.

### 6.6. DATE
`business_reg_date`: hiển thị `dd/MM/yyyy`, lưu ISO `yyyy-MM-dd`, **≤ ngày hiện tại**, cho gõ tay lẫn chọn lịch.

---

## 7. KIỂM TRA HỢP LỆ & THÔNG BÁO

### 7.1. Bộ mã lỗi

| Mã | Tình huống | Nội dung hiển thị |
|---|---|---|
| `E101` | Bỏ trống bắt buộc | *"{Tên trường} không được để trống."* |
| `E102` | Mã đơn vị sai định dạng | *"Mã đơn vị chỉ gồm chữ, số, dấu gạch dưới và gạch ngang."* |
| `E103` | Mã đơn vị trùng | *"Mã đơn vị đã tồn tại. Vui lòng nhập mã khác."* |
| `E104` | Chọn cha là chính nó/con của nó | *"Không thể chọn đơn vị này làm đơn vị cấp trên."* |
| `E105` | Sai thứ bậc cấp tổ chức | *"Cấp tổ chức của đơn vị con phải thấp hơn đơn vị cấp trên."* |
| `E106` | Chi nhánh chưa chọn hạch toán | *"Vui lòng chọn hình thức hạch toán cho chi nhánh."* |
| `E107` | Tạo trùng Tổng công ty | *"Doanh nghiệp chỉ có một đơn vị cấp Tổng công ty/Công ty."* |
| `E108` | Xóa Tổng công ty | *"Không thể xóa đơn vị cấp Tổng công ty/Công ty."* |
| `E109` | Ngừng theo dõi Tổng công ty | *"Không thể ngừng theo dõi đơn vị cấp Tổng công ty/Công ty."* |
| `E110` | Xóa đơn vị còn con | *"Đơn vị đang có {n} đơn vị trực thuộc. Vui lòng xóa đơn vị con trước."* |
| `E111` | Xóa đơn vị đã phát sinh | *"Đơn vị đã phát sinh dữ liệu, không thể xóa. Bạn có thể chọn Ngừng theo dõi."* |
| `E112` | Số thứ tự sai | *"Số thứ tự phải là số nguyên từ 1 đến 9999."* |
| `E113` | Ngày cấp tương lai | *"Ngày cấp không được lớn hơn ngày hiện tại."* |

**Hiển thị:** viền ô đỏ + dòng lỗi `12px --danger` ngay dưới ô. Lỗi nghiệp vụ chặn (E107–E111) → **modal** hoặc **toast đỏ**.

### 7.2. Thông báo thành công
- Thêm: *"Thêm cơ cấu tổ chức thành công."*
- Sửa: *"Cập nhật cơ cấu tổ chức thành công."*
- Xóa: *"Xóa cơ cấu tổ chức thành công."*
- Đồng bộ: *"Đồng bộ thành công. Cập nhật {n} đơn vị."*

Toast xanh, góc trên–phải, tự tắt sau **3 giây**.

---

## 8. API

```http
GET    /api/v1/system/org-units?status=&q=&tree=true   → cây cơ cấu
GET    /api/v1/system/org-units/:id                    → chi tiết
POST   /api/v1/system/org-units                        → thêm mới
PUT    /api/v1/system/org-units/:id                    → cập nhật
DELETE /api/v1/system/org-units/:id                    → xóa
PATCH  /api/v1/system/org-units/:id/inactive           → { isInactive: true }
GET    /api/v1/system/org-units/check-code?code=       → kiểm tra trùng mã
GET    /api/v1/system/org-units/:id/transactions       → xem phát sinh
POST   /api/v1/{app}/org-units/sync                    → đồng bộ (app tiêu thụ)
```

**Payload mẫu `POST` — Chi nhánh:**
```json
{
  "parent_id": "uuid-cong-ty-chuyen-doi",
  "unit_code": "ERDRTKEJ_01",
  "short_name": null,
  "unit_name": "Chi nhánh Hồ Chí Minh",
  "org_level": "CHI_NHANH",
  "accounting_type": "DEPENDENT",
  "sort_order": 1,
  "business_areas": ["KINH_DOANH"],
  "manager_id": null,
  "functions_duties": null,
  "business_reg_no": "DK888899996633",
  "business_reg_date": "2026-01-01",
  "business_reg_place": "Hà Nội 2",
  "address": "Cầu Giấy - Hà Nội - Việt Nam",
  "is_inactive": false
}
```

**Payload mẫu `POST` — Phòng ban** *(các trường ĐKKD bị ẩn → **không gửi**)*:
```json
{
  "parent_id": "uuid-cong-ty-chuyen-doi",
  "unit_code": "ERDRTKEJ_02",
  "unit_name": "Phòng kinh doanh",
  "org_level": "PHONG_BAN",
  "business_areas": ["KINH_DOANH"],
  "address": "N03t6 Ngoại Giao Đoàn",
  "is_inactive": false
}
```

**Mã lỗi HTTP:** `400` sai định dạng · `403` không có quyền · `409` trùng mã / vi phạm nghiệp vụ · `422` thiếu trường bắt buộc.

---

## 9. GHI NHẬN NHẬT KÝ (AUDIT)

| `action` | Khi nào |
|---|---|
| `CREATE_ORG_UNIT` | Thêm đơn vị |
| `UPDATE_ORG_UNIT` | Sửa đơn vị (ghi `before`/`after` **chỉ trường thay đổi**) |
| `DELETE_ORG_UNIT` | Xóa đơn vị |
| `TOGGLE_ORG_UNIT_STATUS` | Bật/tắt Ngừng theo dõi |
| `SYNC_ORG_UNIT` | Đồng bộ sang app tiêu thụ (ghi số bản ghi) |

Xem tại **Hệ thống → Nhật ký hoạt động**.

---

## 10. CHECKLIST NGHIỆM THU

**Danh sách (Màn hình A)**
- [ ] Cây hiển thị đúng phân cấp, thụt lề `20px`/cấp, icon `⊞`/`⊟` bung–thu đúng
- [ ] **Mở rộng / Thu gọn** hoạt động trên toàn cây
- [ ] Tìm kiếm theo **mã · tên đơn vị · tên viết tắt** → tự bung nhánh + tô sáng từ khóa
- [ ] Lọc **Trạng thái** = Ngừng theo dõi → chỉ hiện đơn vị đã ngừng
- [ ] Badge trạng thái đúng màu; ô trống hiện `-`
- [ ] Cột **Tên đơn vị** ghim trái khi cuộn ngang
- [ ] Tùy chỉnh cột lưu lại sau khi tải lại trang
- [ ] Trên app tiêu thụ: **banner** hiện đúng, link *Bấm vào đây* mở AMIS Hệ thống tab mới
- [ ] Trên app tiêu thụ: **không có** nút Thêm/Sửa/Xóa

**Form (Màn hình B)**
- [ ] Chọn `Cấp tổ chức = Chi nhánh` → hiện radio **Hạch toán** (mặc định *Phụ thuộc*) + nhóm ĐKKD
- [ ] Chọn `Cấp tổ chức = Phòng ban` → **ẩn** radio Hạch toán và Số ĐKKD/Ngày cấp/Nơi cấp
- [ ] Đổi Chi nhánh → Phòng ban: trường bị ẩn **không gửi lên API**
- [ ] Sửa đơn vị Tổng công ty: `Cấp tổ chức`, `Số thứ tự`, `Ngừng theo dõi` đều **khóa**; `Thuộc đơn vị` trống
- [ ] Không tạo được đơn vị thứ hai cấp Tổng công ty → lỗi `E107`
- [ ] Không xóa / không ngừng theo dõi được Tổng công ty → `E108` / `E109`
- [ ] `Mã đơn vị` nhập khoảng trắng → bị chặn; nhập trùng → `E103`
- [ ] Chọn `Thuộc đơn vị` là chính nó hoặc con của nó → `E104`
- [ ] `Số thứ tự` nhập chữ/số âm → bị chặn ngay khi gõ
- [ ] `Lĩnh vực hoạt động`: chọn nhiều, bấm nhãn cũng chọn được, bỏ trống vẫn lưu được
- [ ] `Ngày cấp` chọn ngày tương lai → `E113`
- [ ] **Hủy bỏ** khi có thay đổi → hộp xác nhận; xác nhận → quay lại danh sách, không lưu
- [ ] Nút **←** hành xử giống **Hủy bỏ**
- [ ] Lưu thành công → toast xanh + quay lại danh sách + dòng mới đúng vị trí trong cây
- [ ] Xóa đơn vị còn con → `E110`; đơn vị đã phát sinh → `E111`
- [ ] Ngừng theo dõi đơn vị cha → hỏi xác nhận áp dụng cho nhánh con
- [ ] Đơn vị đã Ngừng theo dõi **không xuất hiện** trong dropdown chọn đơn vị ở nghiệp vụ mới
- [ ] Nhật ký hoạt động ghi đúng `action` và trường thay đổi
- [ ] Màn hình `< 1280px` → 2 cột xếp chồng, không vỡ layout

---

## PHỤ LỤC A — Tóm tắt trường theo kiểu nhập

| Kiểu | Số trường | Danh sách |
|---|:--:|---|
| **TEXT** | 6 | `unit_code`* · `short_name` · `unit_name`* · `functions_duties` · `business_reg_no` · `business_reg_place` · `address` |
| **NUM** | 1 | `sort_order` |
| **SELECT** | 3 | `parent_id`* · `org_level`* · `manager_id` |
| **MULTI** | 1 | `business_areas` *(checkbox group, 6 giá trị)* |
| **RADIO** | 1 | `accounting_type`* *(chỉ Chi nhánh)* |
| **CHECK** | 1 | `is_inactive` |
| **DATE** | 1 | `business_reg_date` |

`*` = bắt buộc · **Tổng: 15 trường**, trong đó **4 bắt buộc cố định** + **1 bắt buộc có điều kiện**.

## PHỤ LỤC B — Điểm cần xác nhận với nghiệp vụ

| # | Vấn đề | Ghi nhận từ ảnh |
|---|---|---|
| 1 | **Nhãn trạng thái không thống nhất** | AMIS Hệ thống: *Đang theo dõi / Ngừng theo dõi*; app tiêu thụ: *Đang hoạt động*. → Đề xuất thống nhất 1 bộ |
| 2 | **Nhãn trường cha không thống nhất** | Màn **Sửa** ghi *"Thuộc phòng ban"*, màn **Thêm** ghi *"Thuộc đơn vị"*. → Đề xuất dùng **"Thuộc đơn vị"** |
| 3 | Nội dung nút **Xem phát sinh** | Chưa rõ hiển thị gì |
| 4 | Dropdown `▾` cạnh **Thêm cơ cấu** | Chưa rõ các mục con (giả định có *Nhập khẩu từ Excel*) |
| 5 | Nút `⋮` cạnh **Cấp tổ chức** | Giả định mở thiết lập danh mục cấp tổ chức |
| 6 | Quy tắc thứ bậc cha–con | Suy từ dữ liệu mẫu, cần xác nhận trường hợp biên |
| 7 | Đồng bộ tự động | Chưa rõ có chạy theo lịch hay chỉ thủ công |
