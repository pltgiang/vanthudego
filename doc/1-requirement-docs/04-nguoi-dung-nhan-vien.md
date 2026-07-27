# TM-HT-04 · ĐẶC TẢ MÀN HÌNH — ĐỐI TƯỢNG (NGƯỜI DÙNG / NHÂN VIÊN)

> 🎨 **GIAO DIỆN — bắt buộc đọc trước khi code:** bám theo **[00-he-thong-thiet-ke-giao-dien.md](00-he-thong-thiet-ke-giao-dien.md)** (UI Kit).
> Màn A (danh sách) dùng: `.tabs` (4 tab) · `.list-toolbar` · `.data-table` với **ô Họ và tên `.user-cell` + `.avatar`** · badge `.badge-active/.badge-pending/.badge-inactive`.
> Màn B (form) dùng: `.company-card` + `.grid-2`/`.field` · nhóm checkbox `is_user`/`is_employee` · `.field input:disabled` (Email tài khoản khóa theo MISAID).
> Màn C (nhập khẩu) dùng: `.stepper` 4 bước (§7.5 UI Kit) · vùng kéo–thả · bảng preview lỗi (dòng lỗi nền đỏ).
> Ô trống bảng dùng `-`. Nhãn nút & badge theo §9 UI Kit.

> **Ứng dụng:** Hệ thống · **Phân hệ:** Quản lý danh mục → Đối tượng
> **Mã màn hình:** `SYS-SUBJECT` · **Phiên bản:** v1.0 · **Ngày lập:** 24/07/2026 · **Nguồn cập nhật:** 23/07/2026
> **Thuộc bộ:** Đặc tả Công cụ Thu mua DEGO · **Kế thừa quy ước:** [01](01-thong-tin-cong-ty.md) §3, §5 · [02](02-co-cau-to-chuc.md) §2.4 · [03](03-vi-tri-cong-viec.md) §2.7

---

## 1. TỔNG QUAN

### 1.1. Mục đích
Khai báo, chỉnh sửa thông tin **người dùng / nhân viên** của công ty. Dữ liệu này **đồng bộ sang toàn bộ hệ sinh thái MISA AMIS** (Kế toán, CRM, Kho, Sản xuất, **Mua hàng**, Quy trình, Công việc, Nhân viên, Tài sản…) — HR **chỉ khai báo một lần**.

### 1.2. Đường dẫn truy cập
```
https://amisapp.misa.vn/system/company-info
→ Quản lý danh mục → Đối tượng → tab Người dùng / Nhân viên
```

### 1.3. Phạm vi quyền
> ⚠️ **CHỈ Quản trị hệ thống** được thực hiện mọi thao tác trên màn hình này (thêm, sửa, nhập khẩu, kích hoạt, xóa).

| Vai trò | Xem | Thêm | Sửa | Kích hoạt / Ngưng | Xóa | Nhập khẩu |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| **Quản trị hệ thống** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Quản trị ứng dụng | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Người dùng thường | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 2. KHÁI NIỆM CỐT LÕI — NGƯỜI DÙNG vs NHÂN VIÊN

### 2.1. Định nghĩa

| Đối tượng | Định nghĩa |
|---|---|
| **Người dùng** | Người **sử dụng các ứng dụng** thuộc hệ sinh thái MISA AMIS (có tài khoản đăng nhập) |
| **Nhân viên** | **Nhân sự công ty** (có trong danh sách nhân sự) |

### 2.2. Ba trường hợp kết hợp

```
                    ┌─────────────────────────────────┐
                    │         NHÂN VIÊN               │
                    │  (nhân sự công ty)              │
        ┌───────────┼─────────────────┐               │
        │           │   ① VỪA LÀ CẢ   │               │
        │           │      HAI        │               │
        │           └─────────────────┼───────────────┘
        │      ③ CHỈ NGƯỜI DÙNG       │  ② CHỈ NHÂN VIÊN
        │  NGƯỜI DÙNG                 │
        └─────────────────────────────┘
```

| # | Trường hợp | Mô tả | Ví dụ |
|:--:|---|---|---|
| ① | **Vừa là nhân viên, vừa là người dùng** | Có trong danh sách nhân sự **và** có tài khoản đăng nhập | Nhân viên văn phòng |
| ② | **Là nhân viên, không là người dùng** | Nhân sự công ty nhưng **không cần dùng phần mềm** | Công nhân nhà máy |
| ③ | **Là người dùng, không là nhân viên** | Có tài khoản dùng phần mềm nhưng **không thuộc biên chế** | Cộng tác viên, kế toán dịch vụ, đối tác |

> **Hệ quả thiết kế:** một bản ghi `subject` mang **hai cờ độc lập** `is_user` và `is_employee`. Ít nhất một cờ phải bật.
> ⚠️ **Giới hạn hiện tại:** **chưa hỗ trợ nhập khẩu** đối tượng vừa là Nhân viên vừa là Người dùng — phải nhập khẩu riêng từng loại.

---

## 3. MÀN HÌNH A — DANH SÁCH ĐỐI TƯỢNG

### 3.1. Bố cục

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  Đối tượng            [⚄ Chuẩn hoá dữ liệu]  [⇥]  [ + Thêm đối tượng ▾ ]             │
├──────────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐                                                                        │
│  │Người dùng│  Nhân viên   Chờ duyệt   Yêu cầu kích hoạt          ← 4 TAB            │
│  └━━━━━━━━━━┘                                                                        │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ [🔍 Tìm kiếm theo tên, email, số điện thoại...]  Trạng thái [Tất cả ▾]         [⚙]   │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ☐ │Họ và tên │ĐT di động│Email cá nhân│Email tài khoản│SĐT TK│Trạng thái TK│Ngày sinh│Giới tí…│Địa chỉ│
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ☐ │(JL) Jean Luc│0973123456│pjeanluc211@…│pjeanluc211@…│ - - │[Đang hoạt động]│ - - │ - - │ - - │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Bốn tab

| Tab | Nội dung | Bộ trạng thái |
|---|---|---|
| **Người dùng** *(mặc định)* | Đối tượng có `is_user = true` | Chờ xác nhận · Đang hoạt động · Ngừng hoạt động |
| **Nhân viên** | Đối tượng có `is_employee = true` | Đang làm việc · Đã nghỉ việc |
| **Chờ duyệt** | Đối tượng đang chờ phê duyệt ⓘ | *(cần xác nhận)* |
| **Yêu cầu kích hoạt** | Yêu cầu kích hoạt tài khoản đang chờ xử lý ⓘ | *(cần xác nhận)* |

**Định dạng tab:**

| Trạng thái | Định dạng |
|---|---|
| Tab đang chọn | Chữ `15px/600 --primary` · gạch chân `2px --primary` dưới đáy |
| Tab thường | Chữ `15px/500 #4B5563` · không gạch chân |
| Hover | Chữ `--text` |
| Khoảng cách | `32px` giữa các tab |
| Ghi nhớ | Đổi tab → **reset bộ lọc và trang về 1**; giữ nguyên từ khóa tìm kiếm ⓘ |

### 3.3. Đặc tả cột danh sách (tab Người dùng)

| # | Cột | Kiểu | Rộng | Định dạng |
|---|---|---|---|---|
| 0 | **☐ Chọn** | CHECK | `44px` | Header có ô **chọn tất cả** (có trạng thái nửa chọn) |
| 1 | **Họ và tên** | AVATAR + TEXT | `240px` | **Avatar tròn** + tên — xem §3.4 |
| 2 | **Điện thoại di động** | TEXT | `200px` | Số ĐT cá nhân |
| 3 | **Email cá nhân** | TEXT | `200px` | Dài quá → `…` + tooltip |
| 4 | **Email tài khoản** | TEXT | `200px` | Email đăng nhập MISA AMIS |
| 5 | **SĐT tài khoản** | TEXT | `190px` | Số ĐT đăng nhập; trống → `- -` |
| 6 | **Trạng thái tài khoản** | BADGE | `190px` | Xem §3.5 |
| 7 | **Ngày sinh** | DATE | `130px` | `dd/MM/yyyy`; trống → `- -` |
| 8 | **Giới tính** | TEXT | `100px` | Header bị cắt hiển thị `Giới tí…` |
| 9 | **Địa chỉ** | TEXT | `200px` | Trống → `- -` |

> **Lưu ý định dạng:** khi bề rộng cột không đủ, **cả tiêu đề cột cũng bị cắt** bằng `…` (VD `Giới tí…`). Cần có `title` tooltip hiển thị tên cột đầy đủ khi hover.

**Định dạng bảng chung** — kế thừa [02](02-co-cau-to-chuc.md) §2.4:

| Thành phần | Định dạng |
|---|---|
| Header | Nền `#FFFFFF` · chữ `13px/600 #4B5563` · cao `44px` · viền dưới `1px #E7EBF0` · `sticky` |
| Dòng | Cao `44px` (cao hơn các màn khác do có avatar) · viền dưới `1px #EEF1F5` |
| Hover dòng | Nền `#F5F9FF` → **hiện nút `⋮`** cuối dòng |
| Ô trống | `- -` màu `#9CA3AF` |
| Cột đóng băng | **Họ và tên** ghim trái khi cuộn ngang |

### 3.4. Avatar trong cột Họ và tên

| Thuộc tính | Giá trị |
|---|---|
| Hình dạng | Tròn `28×28px`, cách tên `10px` |
| Nội dung | **Chữ cái đầu** của họ và tên, tối đa 2 ký tự, in HOA (VD `Jean Luc` → `JL`) |
| Chữ | `11px/600` màu trắng |
| Nền | Màu sinh **theo hash tên** từ bảng màu cố định (đảm bảo cùng người luôn cùng màu) |
| Có ảnh đại diện | Hiển thị ảnh, `object-fit: cover`, bo tròn |
| Tên | `13px --text`, cùng hàng, canh giữa theo chiều dọc |

### 3.5. Badge trạng thái

**Tab Người dùng:**

| Giá trị | Nhãn | Định dạng |
|---|---|---|
| `PENDING_CONFIRM` | **Chờ xác nhận** | Nền `#FFF7E6` · chữ `#B45309` · bo `4px` · `12px/500` · đệm `3px 10px` |
| `ACTIVE` | **Đang hoạt động** | Nền `#EAF7EF` · chữ `#16A34A` · cùng bo/cỡ |
| `INACTIVE` | **Ngừng hoạt động** | Nền `#F5F6F8` · chữ `#6B7280` · cùng bo/cỡ |

**Tab Nhân viên:**

| Giá trị | Nhãn | Định dạng |
|---|---|---|
| `WORKING` | **Đang làm việc** | Nền `#EAF7EF` · chữ `#16A34A` |
| `RESIGNED` | **Đã nghỉ việc** | Nền `#F5F6F8` · chữ `#6B7280` |

> ⚠️ **Không thống nhất (thứ 3 trong bộ):** badge màn này là **nền đặc, không viền**; màn Vị trí công việc dùng **viền xanh lá + nền nhạt**; màn Cơ cấu tổ chức dùng **nền xanh dương đặc**. → Xem Phụ lục C.

### 3.6. Thanh công cụ

| Điều khiển | Kiểu | Hành vi |
|---|---|---|
| **🔍 Tìm kiếm** | Ô nhập `280px` | Tìm theo **tên · email · số điện thoại**. Debounce `300ms` |
| **Trạng thái** | SELECT `190px` | `Tất cả` (mặc định) + các giá trị theo tab hiện tại (§3.5) |
| **⚙ Tùy chỉnh cột** | Icon, góc phải | Ẩn/hiện + đổi thứ tự cột; lưu theo người dùng |
| **⚄ Chuẩn hoá dữ liệu** | Nút outline | Rà soát & chuẩn hóa dữ liệu đối tượng ⓘ *(cần xác nhận phạm vi)* |
| **⇥ Xuất khẩu** | Icon | Xuất danh sách **theo tab đang mở** ra Excel. Muốn xuất Nhân viên → phải mở tab **Nhân viên** rồi xuất |
| **+ Thêm đối tượng ▾** | Primary + dropdown | Xem §3.7 |

### 3.7. Dropdown nút Thêm đối tượng

```
┌──────────────────────────┐
│ + Thêm đối tượng      ▾  │
├──────────────────────────┤
│  Nhập khẩu nhân viên     │
│  Nhập khẩu người dùng    │
└──────────────────────────┘
```

| Mục | Hành vi |
|---|---|
| **Bấm thẳng nút** | Mở màn hình B — Thêm đối tượng thủ công |
| **Nhập khẩu nhân viên** | Mở màn hình C — wizard nhập khẩu, chế độ `NHÂN VIÊN` |
| **Nhập khẩu người dùng** | Mở màn hình C — wizard nhập khẩu, chế độ `NGƯỜI DÙNG` |

> ⚠️ **Chưa hỗ trợ** nhập khẩu đối tượng **vừa là Nhân viên vừa là Người dùng**. Cần hiển thị dòng cảnh báo này ngay trong wizard.

### 3.8. Menu thao tác trên dòng `⋮`

Hover dòng → hiện nút `⋮` cuối dòng:

| Thao tác | Điều kiện hiển thị | Hành vi |
|---|---|---|
| **Sửa** | Luôn | Mở màn hình B chế độ Sửa |
| **Ngưng kích hoạt** | Trạng thái = `Đang hoạt động` | Xác nhận → `Ngừng hoạt động`; người dùng **không đăng nhập được** |
| **Kích hoạt** | Trạng thái = `Ngừng hoạt động` | Xác nhận → `Đang hoạt động` |
| **Gửi lại email** | Trạng thái = `Chờ xác nhận` | Gửi lại email kích hoạt |
| **Sao chép đường dẫn kích hoạt** | Trạng thái = `Chờ xác nhận` | Copy link → toast *"Đã sao chép"* |
| **Xóa** | Luôn (trừ tài khoản đang đăng nhập) | Xác nhận, **cảnh báo không thể hoàn tác** |

---

## 4. MÀN HÌNH B — THÊM / SỬA ĐỐI TƯỢNG

> ⓘ **Ghi chú nguồn:** ảnh chụp form **chưa được cung cấp**. Bố cục và danh sách trường dưới đây dựng từ **cột danh sách quan sát được** + **tài liệu hướng dẫn**. Các trường đánh dấu ⓘ là **suy luận, cần xác nhận** — xem Phụ lục B.

### 4.1. Bố cục

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Thêm đối tượng                                     [ Hủy ]  [ 💾 Lưu ]     │
├──────────────────────────────────────────────────────────────────────────────┤
│  LOẠI ĐỐI TƯỢNG                                                              │
│   ☑ Người dùng     ☑ Nhân viên          ← ít nhất phải chọn 1                │
├──────────────────────────────────────────────────────────────────────────────┤
│  THÔNG TIN CHUNG                                                             │
│   Họ và tên *          [____________]  │  Ngày sinh      [__/__/____] 📅      │
│   Giới tính       [Nam ▾]              │  Điện thoại di động [__________]     │
│   Email cá nhân   [____________]       │  Địa chỉ        [________________]   │
│   Đơn vị công tác ⓘ [select cây ▾]     │  Vị trí công việc ⓘ [select ▾]      │
├──────────────────────────────────────────────────────────────────────────────┤
│  THÔNG TIN TÀI KHOẢN     ← chỉ hiện khi ☑ Người dùng                          │
│   SĐT tài khoản *      [____________]                                        │
│   Email tài khoản *    [____________]  🔒 khóa nếu SĐT đã có MISAID          │
│   ⓘ Nếu SĐT đã có tài khoản MISAID, Email tài khoản tự hiển thị và không     │
│     sửa được. Muốn đổi, thực hiện trên MISA ID.                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 4.2. Đặc tả trường dữ liệu

#### Nhóm — Loại đối tượng

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|:--:|---|
| `is_user` | Người dùng | CHECK | ⚑ | **Ít nhất một** trong `is_user` / `is_employee` phải bật → lỗi `E301` |
| `is_employee` | Nhân viên | CHECK | ⚑ | Như trên |

#### Nhóm — Thông tin chung

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc | Ghi chú |
|---|---|---|:--:|---|---|
| `full_name` | Họ và tên | TEXT | ✅ | 2–100 ký tự · **chỉ chữ cái + khoảng trắng** | Cho tiếng Việt có dấu; **chặn gõ số** |
| `birth_date` | Ngày sinh | DATE | ✖ | `dd/MM/yyyy` · **≤ hôm nay** · tuổi ≥ 15 | |
| `gender` | Giới tính | SELECT | ✖ | `Nam` · `Nữ` · `Khác` | |
| `mobile_phone` | Điện thoại di động | PHONE | ✖ | `^(0\|\+84)[0-9]{9,10}$` | Số ĐT cá nhân, **khác** SĐT tài khoản |
| `personal_email` | Email cá nhân | EMAIL | ✖ | Regex chuẩn · ≤ 255 | Tự hạ chữ thường |
| `address` | Địa chỉ | TEXT | ✖ | ≤ 255 ký tự | |
| `org_unit_id` ⓘ | Đơn vị công tác | SELECT | ✖ ⓘ | Cây Cơ cấu tổ chức ([TM-HT-02](02-co-cau-to-chuc.md)) | **Suy luận** |
| `job_position_id` ⓘ | Vị trí công việc | SELECT | ✖ ⓘ | Danh mục Vị trí công việc ([TM-HT-03](03-vi-tri-cong-viec.md)) | **Suy luận** — chỉ hiện vị trí *Đang theo dõi* |
| `employee_code` ⓘ | Mã nhân viên | TEXT | ✖ ⓘ | Duy nhất | **Suy luận** — chỉ khi `is_employee = true` |

#### Nhóm — Thông tin tài khoản *(chỉ hiện khi `is_user = true`)*

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc | Ghi chú |
|---|---|---|:--:|---|---|
| `account_phone` | SĐT tài khoản | PHONE | ✅ | `^(0\|\+84)[0-9]{9,10}$` · **duy nhất** | **Dùng để đăng nhập MISA AMIS** |
| `account_email` | Email tài khoản | EMAIL | ✅ | Regex chuẩn · **duy nhất** | **Dùng để đăng nhập.** Xem §4.3 |

### 4.3. Quy tắc MISAID — trường `Email tài khoản`

```
Người dùng nhập SĐT tài khoản
          │
          ▼
   Kiểm tra MISAID  ──── ĐÃ CÓ tài khoản ───► Email tài khoản TỰ ĐIỀN
          │                                    + KHÓA (readonly, nền xám)
          │                                    + hiện ghi chú hướng dẫn
          │
          └──── CHƯA CÓ ───────────────────► Email tài khoản cho NHẬP TAY
```

| Trạng thái | Định dạng ô `Email tài khoản` |
|---|---|
| SĐT **đã có** MISAID | Tự điền · **readonly** · nền `--bg-readonly` · con trỏ `not-allowed` |
| SĐT **chưa có** MISAID | Cho nhập bình thường |

**Ghi chú hiển thị dưới ô** (khi bị khóa):
> *"SĐT này đã có tài khoản MISAID. Để đổi Email tài khoản, vui lòng thực hiện trên MISA ID."* — kèm link **Xem tại đây**.

**Kỹ thuật:** gọi API kiểm tra MISAID khi **rời ô** `account_phone` (`onBlur`), có trạng thái loading trên ô Email tài khoản.

---

## 5. MÀN HÌNH C — NHẬP KHẨU TỪ TỆP EXCEL

### 5.1. Wizard 4 bước

```
 ①  Chọn tệp        ②  Ghép cột       ③  Kiểm tra dữ liệu   ④  Kết quả
 ────────────  ──►  ────────────  ──► ─────────────────  ──► ──────────
 Tải tệp mẫu        Ghép cột Excel     Hiển thị lỗi từng     Số bản ghi
 + tải tệp lên      ↔ trường hệ thống  dòng, cho tải về      thành công /
                                       danh sách lỗi          thất bại
```

### 5.2. Bước ① — Chọn tệp

| Thành phần | Đặc tả |
|---|---|
| **Cảnh báo chế độ** | Banner vàng: *"Đang nhập khẩu **{Nhân viên/Người dùng}**. Chưa hỗ trợ nhập khẩu đối tượng vừa là Nhân viên vừa là Người dùng."* |
| **Tải tệp mẫu** | Link/nút *"Tải xuống tệp mẫu"* → file `.xlsx` có sẵn tiêu đề cột và dòng ví dụ |
| **Vùng tải lên** | Kéo–thả hoặc bấm chọn. Nhận `.xlsx`, `.xls` · **≤ 5 MB** · tối đa **2.000 dòng** ⓘ |
| Lỗi định dạng | *"Chỉ chấp nhận tệp .xlsx, .xls."* |

### 5.3. Bước ② — Ghép cột dữ liệu

| Thành phần | Đặc tả |
|---|---|
| Bố cục | Bảng 2 cột: **Cột trong tệp Excel** ↔ **Trường trong hệ thống** |
| Tự ghép | Tự khớp khi tên cột trùng tiêu đề tệp mẫu |
| Trường bắt buộc | Đánh dấu `*`; **chưa ghép → không cho sang bước sau** |
| Bỏ qua cột | Cho chọn *"-- Không nhập --"* |

### 5.4. Bước ③ — Kiểm tra dữ liệu

| Thành phần | Đặc tả |
|---|---|
| Bảng xem trước | Toàn bộ dòng, **dòng lỗi tô nền đỏ nhạt** `#FEF2F2`, ô lỗi viền `--danger` |
| Bộ đếm | *"{n} dòng hợp lệ · {m} dòng lỗi"* |
| Chi tiết lỗi | Cột **Lỗi** ghi rõ lý do từng dòng (trùng SĐT, sai định dạng email…) |
| Tải danh sách lỗi | Nút *"Tải về dòng lỗi"* → Excel kèm cột mô tả lỗi |
| Nút tiếp tục | *"Nhập khẩu {n} dòng hợp lệ"* — **bỏ qua dòng lỗi** |

### 5.5. Bước ④ — Kết quả

Thông báo tổng kết: *"Nhập khẩu thành công **{n}** đối tượng. **{m}** dòng thất bại."*
Người dùng mới tạo qua nhập khẩu → trạng thái **Chờ xác nhận**, hệ thống **gửi email kích hoạt hàng loạt**.

---

## 6. LUỒNG KÍCH HOẠT TÀI KHOẢN

### 6.1. Sơ đồ

```
   [Quản trị nhấn LƯU]
            │
            ▼
   ┌──────────────────┐        Hệ thống gửi email
   │  CHỜ XÁC NHẬN    │ ─────► yêu cầu xác nhận tài khoản
   └────────┬─────────┘
            │  Người dùng mở email → nhấn "Xác nhận"
            ▼
   ┌──────────────────┐
   │ ĐANG HOẠT ĐỘNG   │ ◄──── Quản trị nhấn "Kích hoạt"
   └────────┬─────────┘
            │  Quản trị nhấn "Ngưng kích hoạt"
            ▼
   ┌──────────────────┐
   │ NGỪNG HOẠT ĐỘNG  │  → KHÔNG đăng nhập được vào mọi ứng dụng
   └──────────────────┘
```

### 6.2. Hỗ trợ khi người dùng chưa nhận được email

| Thao tác | Vị trí | Hành vi |
|---|---|---|
| **Gửi lại email** | Menu `⋮` trên dòng | Gửi lại email kích hoạt → toast *"Đã gửi lại email kích hoạt."*. **Giới hạn tần suất** ⓘ (đề xuất ≤ 3 lần / 10 phút) |
| **Sao chép đường dẫn kích hoạt** | Menu `⋮` trên dòng | Copy link vào clipboard → toast *"Đã sao chép đường dẫn kích hoạt."* để gửi thủ công |

### 6.3. Hai bộ trạng thái

| Bộ | Áp dụng | Giá trị |
|---|---|---|
| **Trạng thái Người dùng** | `is_user = true` | `Chờ xác nhận` → `Đang hoạt động` ⇄ `Ngừng hoạt động` |
| **Trạng thái Nhân viên** | `is_employee = true` | `Đang làm việc` ⇄ `Đã nghỉ việc` |

> **Quan trọng:** một đối tượng ① *(vừa là cả hai)* mang **đồng thời 2 trạng thái độc lập**. Nghỉ việc (`Đã nghỉ việc`) **không tự động** khóa tài khoản — cần cân nhắc bổ sung nhắc nhở cho quản trị. ⓘ

---

## 7. NÚT & TRẠNG THÁI

| Nút | Vị trí | Kiểu | Hành vi |
|---|---|---|---|
| **+ Thêm đối tượng ▾** | Màn A, trên–phải | Primary + dropdown | §3.7 |
| **⚄ Chuẩn hoá dữ liệu** | Màn A, trái nút Thêm | Secondary (viền `--primary`, chữ `--primary`) | Rà soát/chuẩn hóa dữ liệu ⓘ |
| **⇥ Xuất khẩu** | Màn A | Icon | Xuất Excel theo **tab đang mở** |
| **Hủy** | Màn B, bên trái Lưu | Secondary | Có thay đổi → hộp xác nhận |
| **💾 Lưu** | Màn B, ngoài cùng phải | Primary | Validate → API → **tạo ở trạng thái Chờ xác nhận** + gửi email → toast → về danh sách |
| **←** | Màn B, trước tiêu đề | Icon | Tương đương **Hủy** |

**Kích thước nút:** cao `36px` · bo `6px` · đệm ngang `16px` · chữ `14px/500` · khoảng cách `8px`.

**Trạng thái nút Lưu:** chưa đổi gì → **disable**; đang gọi API → **loading**, khóa cả 2 nút; lỗi validate → **cuộn tới ô lỗi đầu tiên**.

---

## 8. QUY ĐỊNH NHẬP LIỆU ÁP DỤNG

> Kế thừa [01-thong-tin-cong-ty.md](01-thong-tin-cong-ty.md) §5. Phần **riêng** của màn hình này:

### 8.1. TEXT — chữ

| Trường | Quy định riêng |
|---|---|
| `full_name` | **Chỉ chữ cái + khoảng trắng** — regex `^[\p{L}\s]+$`, **chặn gõ số ngay tại ô**. Chuẩn hóa: `trim()`, gộp khoảng trắng thừa, viết hoa chữ đầu mỗi từ ⓘ |
| `address` | ≤ 255 ký tự, 1 dòng |

### 8.2. NUM — số
Màn hình này **không có trường nhập số thuần**. Các trường số điện thoại tuân theo quy tắc **PHONE** (§8.5).

### 8.3. SELECT — chọn một

| Trường | Quy định riêng |
|---|---|
| `gender` | 3 giá trị cố định; có mục *"-- Chọn --"* |
| `org_unit_id` ⓘ | Dropdown **dạng cây**, có tìm kiếm; **ẩn** đơn vị đã Ngừng theo dõi |
| `job_position_id` ⓘ | Chỉ hiện vị trí **Đang theo dõi**; có tìm kiếm theo mã/tên |

### 8.4. MULTI — chọn nhiều
Màn hình này **không có trường MULTI**. *(Nếu xác nhận một người có thể thuộc nhiều đơn vị công tác thì `org_unit_ids` phải chuyển sang MULTI dạng chip theo chuẩn [03](03-vi-tri-cong-viec.md) §3.3 — cần xác nhận.)*

### 8.5. PHONE / EMAIL

| Trường | Quy định |
|---|---|
| `mobile_phone` · `account_phone` | Chỉ số, `+`, khoảng trắng; VN `^(0\|\+84)[0-9]{9,10}$`; **bỏ khoảng trắng khi lưu**. `account_phone` phải **duy nhất toàn hệ thống** |
| `personal_email` · `account_email` | Regex chuẩn; **tự hạ chữ thường**; kiểm tra khi rời ô. `account_email` phải **duy nhất** |

> **Lưu ý:** `mobile_phone` (cá nhân) và `account_phone` (đăng nhập) là **hai trường độc lập**, có thể khác nhau.

### 8.6. DATE
`birth_date`: hiển thị `dd/MM/yyyy`, lưu ISO `yyyy-MM-dd`, **≤ ngày hiện tại**, cho gõ tay lẫn chọn lịch.

### 8.7. CHECK
`is_user`, `is_employee`: hộp kiểm độc lập; **ràng buộc ít nhất một** được bật.

---

## 9. KIỂM TRA HỢP LỆ & THÔNG BÁO

### 9.1. Bộ mã lỗi

| Mã | Tình huống | Nội dung hiển thị |
|---|---|---|
| `E301` | Không chọn loại đối tượng nào | *"Vui lòng chọn ít nhất một loại: Người dùng hoặc Nhân viên."* |
| `E302` | Bỏ trống bắt buộc | *"{Tên trường} không được để trống."* |
| `E303` | Họ và tên chứa số | *"Họ và tên chỉ được chứa chữ cái."* |
| `E304` | SĐT tài khoản sai định dạng | *"Số điện thoại không hợp lệ (10–11 chữ số)."* |
| `E305` | SĐT tài khoản đã tồn tại | *"Số điện thoại này đã được sử dụng cho tài khoản khác."* |
| `E306` | Email tài khoản đã tồn tại | *"Email tài khoản này đã được sử dụng."* |
| `E307` | Email sai định dạng | *"Email không đúng định dạng."* |
| `E308` | Ngày sinh tương lai | *"Ngày sinh không được lớn hơn ngày hiện tại."* |
| `E309` | Tuổi dưới 15 | *"Đối tượng phải từ 15 tuổi trở lên."* |
| `E310` | Nhập khẩu sai định dạng tệp | *"Chỉ chấp nhận tệp .xlsx, .xls."* |
| `E311` | Nhập khẩu chưa ghép trường bắt buộc | *"Vui lòng ghép đầy đủ các trường bắt buộc."* |
| `E312` | Xóa tài khoản đang đăng nhập | *"Không thể xóa tài khoản đang đăng nhập."* |
| `E313` | Gửi lại email quá tần suất | *"Bạn đã gửi lại email quá nhiều lần. Vui lòng thử lại sau {n} phút."* |

### 9.2. Thông báo thành công
- Thêm: *"Thêm đối tượng thành công. Email kích hoạt đã được gửi tới {email}."*
- Sửa: *"Cập nhật thông tin thành công."*
- Kích hoạt / Ngưng: *"Đã {kích hoạt/ngưng kích hoạt} tài khoản."*
- Xóa: *"Xóa đối tượng thành công."*
- Nhập khẩu: *"Nhập khẩu thành công {n} đối tượng. {m} dòng thất bại."*

Toast xanh, góc trên–phải, tự tắt sau **3 giây** *(riêng thông báo nhập khẩu giữ **5 giây**)*.

---

## 10. API

```http
GET    /api/v1/system/subjects?tab=user|employee&q=&status=&page=&size=
GET    /api/v1/system/subjects/:id
POST   /api/v1/system/subjects
PUT    /api/v1/system/subjects/:id
DELETE /api/v1/system/subjects/:id
PATCH  /api/v1/system/subjects/:id/activate         → kích hoạt
PATCH  /api/v1/system/subjects/:id/deactivate       → ngưng kích hoạt
POST   /api/v1/system/subjects/:id/resend-email     → gửi lại email kích hoạt
GET    /api/v1/system/subjects/:id/activation-link  → lấy đường dẫn kích hoạt
GET    /api/v1/system/subjects/check-misaid?phone=  → kiểm tra MISAID
GET    /api/v1/system/subjects/export?tab=          → xuất Excel
GET    /api/v1/system/subjects/import/template?type=employee|user
POST   /api/v1/system/subjects/import/upload        → (multipart) trả preview + lỗi
POST   /api/v1/system/subjects/import/commit        → xác nhận nhập khẩu
POST   /api/v1/system/subjects/normalize            → chuẩn hoá dữ liệu
```

**Payload mẫu `POST`:**
```json
{
  "is_user": true,
  "is_employee": true,
  "full_name": "Jean Luc",
  "birth_date": null,
  "gender": null,
  "mobile_phone": "0973123456",
  "personal_email": "pjeanluc211@gmail.com",
  "address": null,
  "account_phone": "0973123456",
  "account_email": "pjeanluc211@gmail.com"
}
```

**Response kiểm tra MISAID:**
```json
{ "exists": true, "account_email": "pjeanluc211@gmail.com", "editable": false }
```

**Mã lỗi HTTP:** `400` sai định dạng · `403` không phải quản trị hệ thống · `409` trùng SĐT/email · `422` thiếu trường bắt buộc · `429` gửi lại email quá tần suất.

---

## 11. GHI NHẬN NHẬT KÝ (AUDIT)

| `action` | Khi nào |
|---|---|
| `CREATE_SUBJECT` | Thêm đối tượng |
| `UPDATE_SUBJECT` | Sửa (ghi `before`/`after` **chỉ trường thay đổi**) |
| `DELETE_SUBJECT` | Xóa đối tượng |
| `ACTIVATE_SUBJECT` / `DEACTIVATE_SUBJECT` | Kích hoạt / ngưng kích hoạt |
| `RESEND_ACTIVATION_EMAIL` | Gửi lại email |
| `COPY_ACTIVATION_LINK` | Sao chép đường dẫn kích hoạt |
| `IMPORT_SUBJECTS` | Nhập khẩu (ghi số thành công/thất bại, tên tệp) |
| `EXPORT_SUBJECTS` | Xuất khẩu (ghi tab + số bản ghi) |

> **Bảo mật:** đây là màn hình quản lý tài khoản đăng nhập → **bắt buộc ghi log cả hành vi XEM danh sách và XUẤT KHẨU**.

---

## 12. CHECKLIST NGHIỆM THU

**Danh sách (Màn hình A)**
- [ ] 4 tab hiển thị đúng; tab **Người dùng** mặc định, có gạch chân xanh
- [ ] Đổi tab → cột và bộ giá trị lọc Trạng thái **đổi theo tab**
- [ ] Avatar hiện đúng chữ cái đầu (`Jean Luc` → `JL`), cùng người luôn cùng màu
- [ ] Ô trống hiện `- -`; tiêu đề cột bị cắt có tooltip đầy đủ
- [ ] Tìm kiếm theo **tên · email · số điện thoại** đều ra kết quả
- [ ] Cột **Họ và tên** ghim trái khi cuộn ngang
- [ ] Hover dòng → hiện nút `⋮` với đúng các mục theo trạng thái
- [ ] Dòng `Chờ xác nhận` mới có **Gửi lại email** và **Sao chép đường dẫn kích hoạt**
- [ ] Dòng `Đang hoạt động` có **Ngưng kích hoạt**, không có **Kích hoạt**
- [ ] Xuất khẩu ở tab Nhân viên ra đúng danh sách nhân viên

**Form (Màn hình B)**
- [ ] Không chọn loại đối tượng nào → lỗi `E301`
- [ ] Bỏ tích **Người dùng** → nhóm **Thông tin tài khoản** **ẩn** đi
- [ ] `Họ và tên` gõ số → bị chặn ngay
- [ ] Nhập `SĐT tài khoản` **đã có MISAID** → `Email tài khoản` **tự điền + khóa** + hiện ghi chú và link *Xem tại đây*
- [ ] Nhập `SĐT tài khoản` **chưa có MISAID** → `Email tài khoản` cho nhập tay
- [ ] SĐT/Email tài khoản trùng → `E305` / `E306`
- [ ] Ngày sinh tương lai → `E308`
- [ ] Lưu thành công → đối tượng ở trạng thái **Chờ xác nhận** + **email kích hoạt được gửi**

**Nhập khẩu (Màn hình C)**
- [ ] Dropdown có **Nhập khẩu nhân viên** và **Nhập khẩu người dùng** riêng biệt
- [ ] Hiện cảnh báo **chưa hỗ trợ nhập khẩu đồng thời cả hai loại**
- [ ] Tải được tệp mẫu, tệp có đủ tiêu đề cột
- [ ] Tải tệp `.pdf` → `E310`
- [ ] Chưa ghép trường bắt buộc → chặn sang bước sau (`E311`)
- [ ] Bước kiểm tra: dòng lỗi **tô nền đỏ**, có bộ đếm hợp lệ/lỗi, tải được danh sách lỗi
- [ ] Nhập khẩu chỉ áp dụng cho **dòng hợp lệ**, bỏ qua dòng lỗi
- [ ] Đối tượng nhập khẩu ở trạng thái **Chờ xác nhận** + gửi email hàng loạt

**Kích hoạt & phân quyền**
- [ ] Người dùng nhấn xác nhận trong email → chuyển **Đang hoạt động**
- [ ] **Ngừng hoạt động** → người dùng **không đăng nhập được** vào bất kỳ ứng dụng nào
- [ ] Gửi lại email quá số lần cho phép → `E313`
- [ ] Tài khoản **không phải quản trị hệ thống** → không truy cập được màn hình này
- [ ] Không xóa được tài khoản đang đăng nhập → `E312`
- [ ] Nhật ký ghi nhận cả hành vi **xem** và **xuất khẩu** danh sách

---

## PHỤ LỤC A — Tóm tắt trường theo kiểu nhập

| Kiểu | Số trường | Danh sách |
|---|:--:|---|
| **TEXT** | 2 (+1 ⓘ) | `full_name`* · `address` · `employee_code` ⓘ |
| **NUM** | 0 | *(không có)* |
| **SELECT** | 1 (+2 ⓘ) | `gender` · `org_unit_id` ⓘ · `job_position_id` ⓘ |
| **MULTI** | 0 | *(không có — xem §8.4)* |
| **CHECK** | 2 | `is_user` ⚑ · `is_employee` ⚑ |
| **DATE** | 1 | `birth_date` |
| **PHONE** | 2 | `mobile_phone` · `account_phone`* |
| **EMAIL** | 2 | `personal_email` · `account_email`* |

`*` = bắt buộc · `⚑` = bắt buộc theo nhóm · `ⓘ` = suy luận, cần xác nhận
**Tổng: 10 trường chắc chắn + 3 trường suy luận**

## PHỤ LỤC B — Điểm cần xác nhận với nghiệp vụ

| # | Vấn đề | Ghi nhận |
|---|---|---|
| 1 | **Ảnh form Thêm/Sửa chưa có** | Toàn bộ §4 dựng từ cột danh sách + tài liệu hướng dẫn. Cần ảnh form để chốt bố cục và danh sách trường chính xác |
| 2 | Trường `Đơn vị công tác`, `Vị trí công việc`, `Mã nhân viên` | **Suy luận** từ quan hệ với TM-HT-02/03 — chưa quan sát được trên UI |
| 3 | Một người có thuộc **nhiều đơn vị công tác** không? | Nếu có → phải chuyển sang MULTI dạng chip (§8.4) |
| 4 | Tab **Chờ duyệt** | Chưa rõ nội dung, quy trình duyệt và ai duyệt |
| 5 | Tab **Yêu cầu kích hoạt** | Chưa rõ khác gì với trạng thái *Chờ xác nhận* |
| 6 | Nút **Chuẩn hoá dữ liệu** | Chưa rõ phạm vi (gộp trùng? chuẩn hóa định dạng SĐT/email?) |
| 7 | Giới hạn tệp nhập khẩu | Đề xuất ≤ 5MB / 2.000 dòng — cần chốt |
| 8 | Tần suất **Gửi lại email** | Đề xuất ≤ 3 lần/10 phút — cần chốt |
| 9 | Liên động **Đã nghỉ việc** ↔ khóa tài khoản | Hiện là 2 trạng thái độc lập; có nên tự nhắc/khóa khi nghỉ việc? |
| 10 | Đối tượng ① *(vừa NV vừa NSD)* hiển thị ở **cả 2 tab**? | Suy luận là có — cần xác nhận |

## PHỤ LỤC C — Tổng hợp điểm KHÔNG THỐNG NHẤT toàn bộ ứng dụng

> Cập nhật qua từng màn hình. **Cần chốt trước khi code.**

| # | Hạng mục | TM-HT-01 | TM-HT-02 | TM-HT-03 | TM-HT-04 | Đề xuất |
|---|---|---|---|---|---|---|
| 1 | Nhãn nút hủy | *Hủy* | *Hủy bỏ* | *Hủy* | *Hủy* ⓘ | **Hủy** |
| 2 | Ký tự ô trống | — | `-` | `- -` | `- -` | **`-`** |
| 3 | Kiểu badge trạng thái | — | Nền xanh dương đặc | **Viền** xanh lá, nền nhạt | **Nền đặc**, không viền | **Chốt 1 kiểu** |
| 4 | Nhãn trạng thái | — | *Đang theo dõi* / *Đang hoạt động* | *Đang theo dõi* | *Đang hoạt động* | **Chốt theo ngữ cảnh:** danh mục → *Đang theo dõi*; tài khoản → *Đang hoạt động* |
| 5 | Nhãn trường đơn vị cha | — | *Thuộc đơn vị* vs *Thuộc phòng ban* | — | — | **Thuộc đơn vị** |
| 6 | Vị trí nút tùy chỉnh cột `⚙` | — | Cùng hàng bộ lọc | Cùng hàng nút Thêm | Cùng hàng bộ lọc | **Chốt 1 vị trí** |
