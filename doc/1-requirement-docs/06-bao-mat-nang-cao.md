# TM-HT-06 · ĐẶC TẢ MÀN HÌNH — BẢO MẬT NÂNG CAO

> 🎨 **GIAO DIỆN — bắt buộc đọc trước khi code:** bám theo **[00-he-thong-thiet-ke-giao-dien.md](00-he-thong-thiet-ke-giao-dien.md)** (UI Kit).
> Màn 1 trang, chế độ Xem/Sửa. Dùng: `.company-card` bọc 4 khối · **toggle** `.switch` + `.switch-desc` (§7.1) · **radio** `.radio-row` (Áp dụng cho) · **chips nhập tự do** `.chips-input` (IP, tên miền) · bảng miễn trừ `.data-table` + `.empty-state` ("Không có dữ liệu").
> Nút: chế độ Xem `.btn` **Chỉnh sửa**; chế độ Sửa `.btn.ghost` **Hủy** + `.btn` **Lưu** (theo §9 UI Kit dùng *Lưu*, không dùng *Lưu chỉnh sửa*).

> **Ứng dụng:** Hệ thống · **Phân hệ:** Bảo mật nâng cao
> **Mã màn hình:** `SYS-ADV-SECURITY` · **Phiên bản:** v1.0 · **Ngày lập:** 24/07/2026
> **Thuộc bộ:** Đặc tả Công cụ Thu mua DEGO · **Kế thừa quy ước:** [01](01-thong-tin-cong-ty.md) §3, §5, §6 · [03](03-vi-tri-cong-viec.md) §3.3 · [05](05-phan-quyen.md) §8

---

## 1. TỔNG QUAN

### 1.1. Mục đích
Hạn chế nguy cơ **rò rỉ dữ liệu** khi công ty dùng các ứng dụng MISA AMIS, bằng bốn cơ chế:

| Khối | Cơ chế |
|---|---|
| **Tự động đăng xuất** | Đăng xuất tài khoản sau một khoảng thời gian kể từ khi đăng nhập |
| **Giới hạn truy cập theo IP** | Chỉ IP trong danh sách cho phép mới truy cập được |
| **Giới hạn truy cập theo thời gian** | Chỉ trong khung giờ cho phép mới truy cập được |
| **Giới hạn tên miền email tài khoản** | Chỉ email thuộc tên miền cho phép mới được dùng làm email đăng nhập |

### 1.2. Đường dẫn truy cập
```
Ứng dụng Hệ thống → Bảo mật nâng cao
```

### 1.3. Phạm vi quyền
> Thuộc nhóm cấu hình hệ thống — **chỉ Quản trị hệ thống** (và Quản trị bảo mật nếu được cấp) mới thao tác. Người dùng thường **không truy cập** phân hệ này.

### 1.4. Đặc điểm màn hình
- **Một trang duy nhất**, không có màn danh sách/form riêng.
- Toàn trang chạy theo **2 chế độ Xem / Sửa** — giống [01-thong-tin-cong-ty.md](01-thong-tin-cong-ty.md) §6 (nút **Chỉnh sửa → Hủy / Lưu chỉnh sửa**).
- Mỗi khối có **công tắc bật/tắt**; bật mới hiện các trường cấu hình con.

---

## 2. BỐ CỤC MÀN HÌNH

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Bảo mật nâng cao                                    [ ✏ Chỉnh sửa ]          │  ← chế độ Xem
│                                          (chế độ Sửa: [ Hủy ]  [ Lưu chỉnh sửa ])│
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ TỰ ĐỘNG ĐĂNG XUẤT                                                       │  │
│  │  ◯ Tự động đăng xuất                                                    │  │
│  │  Tính từ thời điểm người dùng đăng nhập, cứ sau khoảng thời gian đã     │  │
│  │  thiết lập hệ thống sẽ tự động đăng xuất.                               │  │
│  │  ⚑ (bật) → [ Số ] [phút/giờ ▾]                                          │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │ GIỚI HẠN TRUY CẬP                                                       │  │
│  │  ◯ Giới hạn truy cập theo địa chỉ IP    ⚑ (bật) → danh sách IP          │  │
│  │  ◯ Giới hạn truy cập theo thời gian     ⚑ (bật) → khung giờ             │  │
│  │  Áp dụng giới hạn truy cập cho                                          │  │
│  │   ◉ Tất cả ứng dụng    ○ Chỉ ứng dụng được chọn  ⚑ → chọn app          │  │
│  │  Danh sách người dùng không bị giới hạn truy cập                        │  │
│  │   + Thêm người dùng   + Thêm danh sách quản trị                         │  │
│  │   ┌──────────────────────────────────────────────────────────────────┐ │  │
│  │   │ Họ và tên │ Email tài khoản │ Đơn vị công tác │                    │ │  │
│  │   └──────────────────────────────────────────────────────────────────┘ │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │ GIỚI HẠN TÊN MIỀN EMAIL TÀI KHOẢN                                       │  │
│  │  ◉ Giới hạn tên miền email tài khoản                                    │  │
│  │  Tên miền email là những ký tự sau dấu @, ví dụ: gmail.com; outlook.com;│  │
│  │  Chỉ những email chứa tên miền cho phép mới có thể dùng làm email TK.   │  │
│  │  ⚑ (bật) → Tên miền được truy cập  [ chip input ]                       │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                          ⚑ = trường con chỉ hiện khi công tắc BẬT
```

**Khung ngoài:** một thẻ trắng lớn (bo `10px`, viền `1px --border-card`, đệm `24px`) chứa 4 khối, ngăn nhau bằng viền `1px #EEF1F5`.

**Tiêu đề khối:** chữ IN HOA `13px/700 #4B5563`, `letter-spacing 0.4px`, cách khối trên `24px`.

---

## 3. QUY ƯỚC ĐỊNH DẠNG

> Kế thừa palette [01-thong-tin-cong-ty.md](01-thong-tin-cong-ty.md) §3.1.

### 3.1. Công tắc (toggle switch)

| Trạng thái | Định dạng |
|---|---|
| **Tắt** | Nền `#CBD5DD` · núm tròn trắng bên trái · rộng `36px` cao `20px` |
| **Bật** | Nền `--primary` (`#1B6DF3`) · núm trắng trượt sang phải |
| **Disable (chế độ Xem)** | Giảm độ mờ 60% · con trỏ `not-allowed` · **không bấm được** |
| Nhãn | Chữ `14px --text`, cách công tắc `10px`, cùng hàng |
| Mô tả dưới | Chữ `13px #6B7280`, cách nhãn `4px`, thụt lề bằng nhãn |

### 3.2. Radio (nhóm "Áp dụng cho")

Theo chuẩn [02-co-cau-to-chuc.md](02-co-cau-to-chuc.md) §3.5: nút `16×16px`, chọn → viền + chấm `--primary`, các lựa chọn xếp **dọc**, cách nhau `10px`.

### 3.3. Bảng người dùng không bị giới hạn

| Thành phần | Định dạng |
|---|---|
| Cột | **Họ và tên** (avatar + tên) · **Email tài khoản** · **Đơn vị công tác** · cột thao tác |
| Avatar | Theo chuẩn [04-nguoi-dung-nhan-vien.md](04-nguoi-dung-nhan-vien.md) §3.4 |
| Header | Nền `#FFFFFF` · chữ `13px/600 #4B5563` · cao `44px` |
| Trống | Canh giữa bảng: chữ **"Không có dữ liệu"** màu `#9CA3AF`, vùng cao ~`120px` |
| Xóa dòng | Hover → nút `🗑` cuối dòng (chỉ ở chế độ Sửa) |

### 3.4. Ô nhập chip (tên miền / IP)

Theo chuẩn MULTI-chip [03-vi-tri-cong-viec.md](03-vi-tri-cong-viec.md) §3.3, nhưng **nhập tự do** (không chọn từ danh mục):
- Gõ giá trị → `Enter` hoặc `,` → tạo chip.
- Chip nền `#F1F3F6`, nút `✕` gỡ.
- Giá trị sai định dạng → **không tạo chip**, viền ô đỏ + báo lỗi.

---

## 4. CHI TIẾT CÁC KHỐI

### 4.1. Khối — TỰ ĐỘNG ĐĂNG XUẤT

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc | Ghi chú |
|---|---|---|:--:|---|---|
| `auto_logout_enabled` | Tự động đăng xuất | TOGGLE | ✖ | on/off · mặc định **off** | Bật mới hiện trường thời gian |
| `auto_logout_value` | *(thời gian)* | NUM | ✅ ⚑ | số nguyên `1–1440` ⓘ | Chỉ hiện khi bật |
| `auto_logout_unit` | *(đơn vị)* | SELECT | ✅ ⚑ | `phút` · `giờ` ⓘ | Chỉ hiện khi bật |

**Mô tả hiển thị:** *"Tính từ thời điểm người dùng đăng nhập, cứ sau khoảng thời gian đã thiết lập hệ thống sẽ tự động đăng xuất."*

> ⓘ Ảnh chụp ở trạng thái **tắt** nên chưa thấy được trường con (giá trị + đơn vị). Cấu trúc trên là **suy luận** — xem Phụ lục B.

### 4.2. Khối — GIỚI HẠN TRUY CẬP

#### 4.2.1. Hai công tắc con

| Mã trường | Nhãn | Kiểu | Ràng buộc | Trường con khi bật |
|---|---|---|---|---|
| `ip_restrict_enabled` | Giới hạn truy cập theo địa chỉ IP | TOGGLE | mặc định off | Danh sách **IP cho phép** (§4.2.2) |
| `time_restrict_enabled` | Giới hạn truy cập theo thời gian | TOGGLE | mặc định off | Danh sách **khung giờ** (§4.2.3) |

#### 4.2.2. Giới hạn theo IP *(khi `ip_restrict_enabled = on`)*

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|:--:|---|
| `allowed_ips` | Địa chỉ IP được phép | **CHIP (nhập tự do)** | ✅ ⚑ | Mỗi chip là **IPv4 hợp lệ** hoặc **dải CIDR** (`192.168.1.0/24`) |

- **Tiện ích "Xem IP hiện tại":** hiển thị IP công cộng của người thao tác + nút **"Dùng IP này"** để thêm nhanh.
- Sai định dạng IP → không tạo chip, báo lỗi `E602`.
- ⚠️ **Cảnh báo tự khóa:** nếu người thao tác **không** thêm IP hiện tại của chính mình → hiện cảnh báo *"Bạn có thể tự chặn quyền truy cập của mình"* trước khi lưu.

#### 4.2.3. Giới hạn theo thời gian *(khi `time_restrict_enabled = on`)*

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|:--:|---|
| `time_windows` | Khung giờ cho phép | LIST(khung giờ) | ✅ ⚑ | Mỗi khung: **thứ trong tuần** (MULTI) + **giờ bắt đầu** + **giờ kết thúc**; kết thúc > bắt đầu ⓘ |

> ⓘ Giao diện chi tiết của khung giờ **chưa quan sát được** (công tắc đang tắt). Cấu trúc là suy luận — cần xác nhận (§Phụ lục B).

#### 4.2.4. Phạm vi áp dụng

| Mã trường | Nhãn | Kiểu | Ràng buộc | Ghi chú |
|---|---|---|---|---|
| `restrict_scope` | Áp dụng giới hạn truy cập cho | RADIO | `ALL_APPS` (mặc định) \| `SELECTED_APPS` | |
| `restrict_apps` | *(danh sách app)* | MULTI (chip) ⚑ | ≥ 1 app khi chọn `SELECTED_APPS` | Chỉ hiện khi chọn *Chỉ ứng dụng được chọn*; nguồn: danh sách 30 ứng dụng ([05](05-phan-quyen.md) §6) |

| Giá trị | Ý nghĩa |
|---|---|
| **Tất cả ứng dụng** | Áp dụng cho mọi ứng dụng đơn vị đang dùng |
| **Chỉ ứng dụng được chọn** | Chỉ các app đã chọn bị giới hạn |

#### 4.2.5. Danh sách người dùng KHÔNG bị giới hạn

Cho ban lãnh đạo/quản lý truy cập mọi lúc, bỏ qua giới hạn IP & thời gian.

| Nút | Hành vi |
|---|---|
| **+ Thêm người dùng** | Mở modal chọn người dùng (checkbox, có tìm kiếm) — chuẩn modal [05](05-phan-quyen.md) §8 |
| **+ Thêm danh sách quản trị** | Thêm **hàng loạt** toàn bộ người có vai trò quản trị (Quản trị hệ thống + Quản trị bảo mật) ⓘ |

Bảng kết quả: **Họ và tên · Email tài khoản · Đơn vị công tác** + nút xóa dòng.
Trùng người → bỏ qua, không thêm lặp.

> **Lưu ý quan trọng:** danh sách này áp dụng cho **cả IP lẫn thời gian**, **không** áp dụng cho giới hạn tên miền email (§4.3).

### 4.3. Khối — GIỚI HẠN TÊN MIỀN EMAIL TÀI KHOẢN

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|:--:|---|
| `email_domain_enabled` | Giới hạn tên miền email tài khoản | TOGGLE | ✖ | mặc định off |
| `allowed_domains` | Tên miền được truy cập | **CHIP (nhập tự do)** | ✅ ⚑ | Mỗi chip là **tên miền hợp lệ** (`gmail.com`, `degoholding.vn`) — không có `@`, không khoảng trắng |

**Mô tả:** *"Tên miền email là những ký tự sau dấu @, ví dụ: gmail.com; outlook.com;… Chỉ những email chứa tên miền cho phép mới có thể sử dụng làm email tài khoản."*

**Quy tắc:**
- Nhập có `@` → tự cắt lấy phần sau `@` (`user@abc.com` → `abc.com`).
- Sai định dạng tên miền → không tạo chip, lỗi `E603`.
- Không phân biệt hoa–thường, tự hạ **chữ thường**.
- **Chống tự khóa:** khi bật, nếu tên miền email của **chính người thao tác** không nằm trong danh sách → cảnh báo trước khi lưu.

> **Phạm vi ảnh hưởng:** quy tắc này áp dụng khi **thêm mới / đổi email tài khoản** ở màn [04-nguoi-dung-nhan-vien.md](04-nguoi-dung-nhan-vien.md). Email hiện có **không hợp lệ** sau khi bật → cần chính sách xử lý (chặn đăng nhập? cảnh báo?) — ⓘ cần xác nhận.

---

## 5. NÚT & TRẠNG THÁI MÀN HÌNH

### 5.1. Hai chế độ

```
   ┌──────────── CHẾ ĐỘ XEM ────────────┐
   │ Mọi công tắc / ô: khóa (disable)   │
   │ Nút:  [ ✏ Chỉnh sửa ]              │
   └───────────────┬────────────────────┘
                   │ nhấn "Chỉnh sửa"
                   ▼
   ┌──────────── CHẾ ĐỘ SỬA ────────────┐
   │ Công tắc / ô mở khóa                │
   │ Nút:  [ Hủy ]  [ Lưu chỉnh sửa ]   │
   └───┬───────────────────────┬────────┘
       │ "Hủy"                 │ "Lưu chỉnh sửa" (hợp lệ)
       ▼                       ▼
  Khôi phục dữ liệu gốc    Gọi API → toast → về Xem
  → về CHẾ ĐỘ XEM
```

### 5.2. Đặc tả nút

| Nút | Vị trí | Kiểu | Màu | Hiện khi | Hành vi |
|---|---|---|---|---|---|
| **✏ Chỉnh sửa** | Góc trên–phải | Primary | Nền `--primary`, chữ trắng, icon ✏ | Chế độ **Xem** | Mở khóa toàn bộ điều khiển → chế độ Sửa |
| **Hủy** | Trên–phải, **trái** nút Lưu | Secondary | Nền trắng, viền `--border`, chữ `--text` | Chế độ **Sửa** | Có thay đổi → hộp xác nhận; khôi phục dữ liệu gốc |
| **Lưu chỉnh sửa** | Trên–phải, ngoài cùng | Primary | Nền `--primary`, chữ trắng | Chế độ **Sửa** | Validate → API → toast → về chế độ Xem |

**Kích thước nút:** cao `36px` · bo `6px` · đệm ngang `16px` · chữ `14px/500` · khoảng cách `8px`.

> ⚠️ **Không thống nhất:** nút lưu ở đây là **"Lưu chỉnh sửa"** (giống modal ở [05](05-phan-quyen.md)); màn [01](01-thong-tin-cong-ty.md) dùng **"Lưu"**. → Phụ lục C.

### 5.3. Trạng thái nút Lưu chỉnh sửa

| Tình huống | Trạng thái |
|---|---|
| Chưa thay đổi gì | **Disable** (mờ 50%) |
| Đang gọi API | **Loading** — spinner, khóa cả 2 nút |
| Lỗi validate | Bật lại, **cuộn tới khối/ô lỗi đầu tiên** |
| Có cảnh báo tự khóa (IP/tên miền) | Hiện modal xác nhận **trước khi** gọi API |

### 5.4. Hộp xác nhận khi Hủy
Chỉ hiện khi **có thay đổi thật** (so với bản gốc): *"Các thay đổi chưa được lưu sẽ bị mất. Bạn có chắc chắn muốn hủy?"* → `[Tiếp tục sửa]` `[Hủy bỏ]`.

---

## 6. QUY ĐỊNH NHẬP LIỆU

> Kế thừa [01-thong-tin-cong-ty.md](01-thong-tin-cong-ty.md) §5. Phần riêng:

### 6.1. NUM — số (`auto_logout_value`)
Số nguyên dương, chặn chữ và dấu ngay khi gõ, khoảng hợp lệ `1–1440` (nếu đơn vị phút) ⓘ; bỏ trống khi công tắc bật → `E601`.

### 6.2. SELECT — chọn một

| Trường | Quy định |
|---|---|
| `auto_logout_unit` | `phút` · `giờ`, không có mục rỗng |
| Không tìm thấy | Không áp dụng (danh sách cố định, ngắn) |

### 6.3. MULTI — chọn nhiều

| Trường | Dạng | Nguồn |
|---|---|---|
| `restrict_apps` | dropdown + chip | Danh sách 30 ứng dụng ([05](05-phan-quyen.md) §6) |
| `time_windows[].weekdays` | checkbox group ⓘ | T2…CN (7 giá trị cố định → dùng checkbox group theo chuẩn [02](02-co-cau-to-chuc.md) §3.4) |

### 6.4. CHIP nhập tự do

| Trường | Định dạng hợp lệ | Ví dụ |
|---|---|---|
| `allowed_ips` | IPv4 (`x.x.x.x`, 0–255) hoặc CIDR (`/8`–`/32`) | `203.0.113.10` · `192.168.1.0/24` |
| `allowed_domains` | tên miền (không `@`, có `.`) | `gmail.com` · `degoholding.vn` |

Tạo chip bằng `Enter` hoặc `,`; gỡ bằng `✕` hoặc `Backspace`; **chống trùng**; sai định dạng → không tạo, báo lỗi.

### 6.5. TOGGLE
Mỗi công tắc là boolean độc lập. **Tắt công tắc → ẩn (không xóa) giá trị các trường con**; lưu lại giá trị để khi bật lại vẫn còn ⓘ.

---

## 7. QUY TẮC NGHIỆP VỤ

| # | Quy tắc |
|---|---|
| 1 | Tất cả thiết lập chỉ có hiệu lực **sau khi Lưu chỉnh sửa** thành công |
| 2 | Giới hạn **IP** và **thời gian** **không** áp dụng cho người trong *Danh sách không bị giới hạn* |
| 3 | Giới hạn **tên miền email** áp dụng độc lập, **không** liên quan danh sách miễn trừ ở §4.2.5 |
| 4 | Bật giới hạn IP/tên miền mà tự loại mình ra → **cảnh báo tự khóa** trước khi lưu |
| 5 | *Áp dụng cho* = **Chỉ ứng dụng được chọn** → bắt buộc chọn ≥ 1 app |
| 6 | Tự động đăng xuất đếm **từ thời điểm đăng nhập**, không phải từ thao tác cuối |
| 7 | Người dùng đang online khi bật giới hạn IP → bị đăng xuất ở request kế tiếp nếu IP không hợp lệ ⓘ |
| 8 | Đây là cấu hình cấp **toàn hệ thống**, áp dụng cho **mọi pháp nhân/đơn vị** ⓘ |

---

## 8. KIỂM TRA HỢP LỆ & THÔNG BÁO

### 8.1. Bộ mã lỗi

| Mã | Tình huống | Nội dung hiển thị |
|---|---|---|
| `E601` | Bật công tắc nhưng bỏ trống cấu hình bắt buộc | *"Vui lòng nhập {trường} khi bật {chức năng}."* |
| `E602` | Địa chỉ IP sai định dạng | *"Địa chỉ IP không hợp lệ."* |
| `E603` | Tên miền sai định dạng | *"Tên miền không hợp lệ (ví dụ: gmail.com)."* |
| `E604` | Chỉ ứng dụng được chọn nhưng chưa chọn app | *"Vui lòng chọn ít nhất một ứng dụng để áp dụng giới hạn."* |
| `E605` | Khung giờ kết thúc ≤ bắt đầu | *"Giờ kết thúc phải sau giờ bắt đầu."* |
| `E606` | Thời gian tự đăng xuất ngoài khoảng | *"Thời gian tự động đăng xuất phải từ 1 đến 1440 phút."* |
| `W601` | Cảnh báo tự khóa (IP) | *"Địa chỉ IP hiện tại của bạn không nằm trong danh sách cho phép. Bạn có thể tự chặn quyền truy cập của mình. Tiếp tục?"* |
| `W602` | Cảnh báo tự khóa (tên miền) | *"Email tài khoản của bạn không thuộc tên miền cho phép. Tiếp tục?"* |

**Hiển thị:** lỗi cạnh ô/khối tương ứng; cảnh báo `W60x` là **modal xác nhận** trước khi lưu.

### 8.2. Thông báo thành công
Toast xanh, góc trên–phải, 3 giây: *"Cập nhật thiết lập bảo mật nâng cao thành công."*

---

## 9. API

```http
GET  /api/v1/system/security-settings              → lấy toàn bộ cấu hình
PUT  /api/v1/system/security-settings              → lưu toàn bộ cấu hình
GET  /api/v1/system/security-settings/my-ip        → IP hiện tại của người dùng
GET  /api/v1/system/security-settings/exempt-users → danh sách miễn trừ
```

**Payload mẫu `PUT`:**
```json
{
  "auto_logout": { "enabled": false, "value": 30, "unit": "MINUTE" },
  "ip_restriction": {
    "enabled": true,
    "allowed_ips": ["203.0.113.10", "192.168.1.0/24"]
  },
  "time_restriction": {
    "enabled": false,
    "windows": [
      { "weekdays": ["MON","TUE","WED","THU","FRI"], "from": "08:00", "to": "18:00" }
    ]
  },
  "restrict_scope": "SELECTED_APPS",
  "restrict_app_ids": ["uuid-van-thu", "uuid-mua-hang"],
  "exempt_user_ids": ["uuid-jean-luc"],
  "email_domain": {
    "enabled": true,
    "allowed_domains": ["degoholding.vn", "gmail.com"]
  }
}
```

**Mã lỗi HTTP:** `400` sai định dạng · `403` không đủ quyền · `422` thiếu cấu hình bắt buộc khi bật.

---

## 10. AUDIT

> Cấu hình bảo mật → **mọi thay đổi bắt buộc ghi log chi tiết**.

| `action` | Ghi kèm |
|---|---|
| `UPDATE_SECURITY_SETTINGS` | `before`/`after` toàn bộ cấu hình |
| `ENABLE_IP_RESTRICTION` / `DISABLE_IP_RESTRICTION` | danh sách IP |
| `ENABLE_TIME_RESTRICTION` / `DISABLE_TIME_RESTRICTION` | khung giờ |
| `ENABLE_EMAIL_DOMAIN_LIMIT` / `DISABLE_EMAIL_DOMAIN_LIMIT` | danh sách tên miền |
| `ADD_EXEMPT_USER` / `REMOVE_EXEMPT_USER` | user_id |
| `UPDATE_AUTO_LOGOUT` | giá trị + đơn vị |

Ngoài ra, ghi log **mọi lần chặn truy cập** do vi phạm IP/thời gian (phục vụ điều tra sự cố).

---

## 11. CHECKLIST NGHIỆM THU

**Chế độ Xem / Sửa**
- [ ] Vào màn hình → mọi công tắc/ô **khóa**, chỉ hiện nút **Chỉnh sửa**
- [ ] Nhấn **Chỉnh sửa** → công tắc/ô mở khóa, hiện **Hủy** + **Lưu chỉnh sửa**
- [ ] Nút **Lưu chỉnh sửa** disable khi chưa thay đổi gì
- [ ] **Hủy** khi có thay đổi → hộp xác nhận; xác nhận → dữ liệu về bản gốc

**Tự động đăng xuất**
- [ ] Bật công tắc → hiện trường thời gian + đơn vị; tắt → ẩn
- [ ] Bỏ trống thời gian khi bật → `E601`; nhập ngoài `1–1440` → `E606`

**Giới hạn IP**
- [ ] Bật → hiện ô nhập IP + tiện ích **Xem IP hiện tại**
- [ ] Nhập IP sai định dạng → không tạo chip, `E602`
- [ ] Không thêm IP của mình → cảnh báo tự khóa `W601` trước khi lưu
- [ ] Nút **Dùng IP này** thêm nhanh IP hiện tại

**Giới hạn thời gian & phạm vi**
- [ ] Bật giới hạn thời gian → cấu hình được khung giờ; kết thúc ≤ bắt đầu → `E605`
- [ ] Chọn **Chỉ ứng dụng được chọn** → hiện chọn app; không chọn app nào → `E604`
- [ ] Chọn **Tất cả ứng dụng** → ẩn phần chọn app

**Danh sách miễn trừ**
- [ ] **+ Thêm người dùng** mở modal chọn, thêm được nhiều người
- [ ] **+ Thêm danh sách quản trị** thêm hàng loạt người có vai trò quản trị
- [ ] Bảng trống hiện **"Không có dữ liệu"**
- [ ] Xóa dòng khỏi danh sách (chế độ Sửa)

**Giới hạn tên miền email**
- [ ] Bật → hiện ô nhập tên miền; nhập `user@abc.com` → tự thành chip `abc.com`
- [ ] Tên miền sai → `E603`; tên miền của mình không có trong danh sách → `W602`

**Chung**
- [ ] Lưu thành công → toast xanh, về chế độ Xem, cấu hình có hiệu lực
- [ ] Người dùng thường không truy cập được phân hệ này
- [ ] Nhật ký hoạt động ghi nhận mọi thay đổi cấu hình bảo mật
- [ ] *(Kiểm thử tích hợp)* Sau khi bật giới hạn IP, truy cập từ IP ngoài danh sách → bị chặn; người trong danh sách miễn trừ vẫn vào được

---

## PHỤ LỤC A — Tóm tắt trường theo kiểu nhập

| Kiểu | Số trường | Danh sách |
|---|:--:|---|
| **TOGGLE** | 4 | `auto_logout_enabled` · `ip_restrict_enabled` · `time_restrict_enabled` · `email_domain_enabled` |
| **NUM** | 1 | `auto_logout_value` ⚑ |
| **SELECT** | 1 | `auto_logout_unit` ⚑ |
| **RADIO** | 1 | `restrict_scope` |
| **MULTI (chip)** | 1 | `restrict_apps` ⚑ |
| **CHIP tự do** | 2 | `allowed_ips` ⚑ · `allowed_domains` ⚑ |
| **LIST phức** | 1 | `time_windows` ⚑ (thứ + giờ) |
| **Bảng người dùng** | 1 | `exempt_user_ids` |

`⚑` = chỉ hiện/bắt buộc khi công tắc cha bật

## PHỤ LỤC B — Điểm cần xác nhận

| # | Vấn đề | Ghi nhận |
|---|---|---|
| 1 | Trường con **Tự động đăng xuất** | Ảnh ở trạng thái tắt → chưa thấy dạng nhập (số + đơn vị? hay dropdown khoảng cố định 15/30/60 phút?) |
| 2 | Đơn vị & khoảng hợp lệ thời gian tự đăng xuất | Suy luận `1–1440 phút` — cần chốt |
| 3 | Giao diện **khung giờ** (time window) | Chưa quan sát được — cấu trúc thứ + giờ là suy luận |
| 4 | **Xem IP hiện tại** | Tài liệu có nêu tiện ích này nhưng ảnh không thể hiện — cần xác nhận vị trí/hình thức |
| 5 | **+ Thêm danh sách quản trị** | Thêm toàn bộ quản trị (QTHT + QTBM)? hay chỉ một loại? |
| 6 | Phạm vi cấu hình | Toàn hệ thống (mọi pháp nhân) hay từng pháp nhân? Với mô hình holding DEGO rất quan trọng |
| 7 | Email hiện có **không hợp lệ** sau khi bật giới hạn tên miền | Chặn đăng nhập? cảnh báo? cho tồn tại? |
| 8 | Hành vi người đang online khi siết IP | Đăng xuất ngay hay ở phiên kế tiếp? |
| 9 | Giới hạn IP hỗ trợ IPv6 và dải CIDR? | Suy luận có CIDR; IPv6 chưa rõ |

## PHỤ LỤC C — Tổng hợp điểm KHÔNG THỐNG NHẤT (cập nhật qua 6 màn)

| # | Hạng mục | 01 | 02 | 03 | 04 | 05 | 06 | Đề xuất |
|---|---|---|---|---|---|---|---|---|
| 1 | Nhãn nút hủy | *Hủy* | *Hủy bỏ* | *Hủy* | *Hủy* | *Hủy* | *Hủy* | **Hủy** |
| 2 | Ký tự ô trống | — | `-` | `- -` | `- -` | `- -` | *"Không có dữ liệu"* | **Thống nhất** |
| 3 | Kiểu badge trạng thái | — | xanh dương đặc | viền xanh lá | nền đặc | nền đặc | — | **Chốt 1 kiểu** |
| 4 | Nhãn nút lưu | *Lưu* | *Lưu* | *Lưu* | *Lưu* | *Lưu* / *Lưu chỉnh sửa* | **Lưu chỉnh sửa** | **Lưu** |
| 5 | Vị trí nút Hủy/Lưu | Trên–phải | Trên–phải | Trên–phải | Trên–phải | Đáy trang (màn C) | Trên–phải | **Chốt theo loại màn** |
| 6 | Mẫu 2 chế độ Xem/Sửa | ✅ có | — | — | — | — | ✅ có | Dùng cho **màn cấu hình 1 trang** |
