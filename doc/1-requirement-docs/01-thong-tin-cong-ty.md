# TM-HT-01 · ĐẶC TẢ MÀN HÌNH — THÔNG TIN CÔNG TY

> **Ứng dụng:** Hệ thống · **Phân hệ:** Thông tin công ty → Thông tin chung
> **Mã màn hình:** `SYS-COMPANY-INFO` · **Phiên bản:** v1.0 · **Ngày lập:** 24/07/2026
> **Thuộc bộ:** Đặc tả Công cụ Thu mua DEGO

---

## 1. TỔNG QUAN

### 1.1. Mục đích
Cho phép người dùng khai báo các thông tin cơ bản của doanh nghiệp, để hệ thống **tự động lấy lên các báo cáo, tài liệu, biểu mẫu** (đơn hàng, hợp đồng, phiếu yêu cầu mua…), giúp không phải nhập lại thủ công.

### 1.2. Đường dẫn truy cập
```
Ứng dụng Hệ thống → Thông tin công ty → Thông tin chung
```

### 1.3. Nguồn dữ liệu ban đầu
Khi mở lần đầu, hệ thống **tự động điền** dữ liệu người dùng đã khai khi **Đăng ký tài khoản**: `Tên đầy đủ`, `Mã số thuế`, `Điện thoại`, `Email`.

### 1.4. Vai trò sử dụng

| Vai trò | Xem | Chỉnh sửa | Chuyển mô hình tập đoàn |
|---|:--:|:--:|:--:|
| Quản trị hệ thống | ✅ | ✅ | ✅ |
| Quản trị ứng dụng | ✅ | ✅ | ❌ |
| Người dùng thường | ✅ | ❌ | ❌ |

---

## 2. BỐ CỤC MÀN HÌNH

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [☰] ⚙ Hệ thống                                    🔔 ❓ 👤                    │ Top bar
├────────────────┬─────────────────────────────────────────────────────────────┤
│ ▸ Thông tin CT │  Thông tin công ty            [ Hủy ]  [ 💾 Lưu ]           │ Page header
│ ▸ QL danh mục  ├─────────────────────────────────────────────────────────────┤
│ ▸ Phân quyền   │ ┌─────────────────────────────────────────────────────────┐ │
│ ▸ Tình hình SD │ │ ┌──────┐   CÔNG TY TNHH NÉT VIỆT                        │ │ Banner
│ ▸ Mail server  │ │ │ LOGO │   MST: 0302028548                             │ │
│ ▸ Bảo mật NC   │ │ │  [⬆] │                                                │ │
│ ▸ Thiết lập    │ └─────────────────────────────────────────────────────────┘ │
│ ▸ Nhật ký      │ ┌───────────────────────┐ ┌───────────────────────────────┐ │
│ ▸ Thùng rác    │ │ 🏛 Thông tin chi tiết │ │ 📄 Đăng ký kinh doanh         │ │ Hàng 1
│                │ │ ····················· │ │ ····························· │ │
│                │ │ Tên đầy đủ *          │ │ Mã số ĐKKD    │ Ngày cấp      │ │
│                │ │ Tên viết tắt │ Loại hình│ │ Nơi cấp                      │ │
│                │ │ MST *        │ Mã cty  │ │ Người đại diện │ Chức danh    │ │
│                │ │ Ngày thành lập         │ │                               │ │
│                │ └───────────────────────┘ └───────────────────────────────┘ │
│                │ ┌───────────────────────┐ ┌───────────────────────────────┐ │
│                │ │ 📞 Thông tin liên hệ  │ │ ⚙ Mô hình hoạt động           │ │ Hàng 2
│                │ │ ····················· │ │ ····························· │ │
│                │ │ Địa chỉ * (textarea)  │ │ Mô hình  [Công ty] (readonly) │ │
│                │ │ Tỉnh │ Quận │ Xã      │ │ [ Chuyển thành mô hình TĐ ]   │ │
│                │ │ Điện thoại * │ Fax    │ │ ┌───────────────────────────┐ │ │
│                │ │ Email        │ Website│ │ │ ⚠ Lưu ý: ...              │ │ │
│                │ └───────────────────────┘ └───────────────────────────────┘ │
└────────────────┴─────────────────────────────────────────────────────────────┘
```

**Lưới:** 2 cột bằng nhau, gap `24px`. Màn hình `< 1280px` → xếp chồng 1 cột.

---

## 3. QUY ƯỚC ĐỊNH DẠNG (FORMAT · KHUNG · MÀU SẮC)

> Mã màu đọc từ mockup — cần đối chiếu lại với design token chính thức trước khi code.

### 3.1. Bảng màu

| Token | Mã màu | Dùng cho |
|---|---|---|
| `--primary` | `#1B6DF3` | Top bar, nút **Lưu**, viền focus, link, icon chính |
| `--primary-hover` | `#1557C8` | Trạng thái hover nút chính |
| `--danger` | `#EF4444` | Dấu `*` bắt buộc, viền lỗi, text lỗi |
| `--success` | `#22A45D` | Icon "Đăng ký kinh doanh", toast thành công |
| `--purple` | `#7C5CFC` | Icon "Thông tin liên hệ" |
| `--warning` | `#F59E0B` | Icon "Mô hình hoạt động", viền hộp lưu ý |
| `--bg-page` | `#F4F6FA` | Nền trang |
| `--bg-card` | `#FFFFFF` | Nền thẻ (card) |
| `--bg-readonly` | `#F1F3F6` | Nền ô chỉ đọc / disabled |
| `--bg-note` | `#FFF7E6` | Nền hộp lưu ý |
| `--border` | `#D9DEE7` | Viền input mặc định |
| `--border-card` | `#E7EBF0` | Viền thẻ |
| `--text` | `#1F2937` | Chữ nhập liệu, tiêu đề |
| `--text-label` | `#4B5563` | Nhãn trường |
| `--text-placeholder` | `#9CA3AF` | Chữ gợi ý |
| `--banner-from` → `--banner-to` | `#E9F3FF` → `#E9F8F1` | Gradient banner tên công ty |

### 3.2. Khung thẻ (card)

| Thuộc tính | Giá trị |
|---|---|
| Nền | `--bg-card` |
| Viền | `1px solid --border-card` |
| Bo góc | `10px` |
| Đệm trong | `20px` |
| Đổ bóng | `0 1px 2px rgba(16,24,40,.04)` |
| Tiêu đề thẻ | `15px / 600` + icon `18px` màu theo thẻ |
| Đường ngăn dưới tiêu đề | `1px dashed #E3E8EF`, cách tiêu đề `12px` |

### 3.3. Khung ô nhập (input)

| Trạng thái | Định dạng |
|---|---|
| **Mặc định** | cao `40px` · bo `6px` · viền `1px --border` · nền trắng · chữ `14px --text` · đệm ngang `12px` |
| **Focus** | viền `--primary` + vòng sáng `0 0 0 3px rgba(27,109,243,.15)` |
| **Chỉ đọc / Disabled** | nền `--bg-readonly` · chữ `#6B7280` · con trỏ `not-allowed` · **không viền focus** |
| **Lỗi** | viền `--danger` + dòng lỗi `12px --danger` ngay dưới ô |
| **Placeholder** | chữ `--text-placeholder`, không in nghiêng |
| **Nhãn** | `13px / 500 --text-label`, cách ô `6px`; bắt buộc thì thêm ` *` màu `--danger` |
| **Textarea** | cao tối thiểu `96px`, cho kéo dọc (`resize: vertical`) |
| **Select** | có icon `▾` bên phải, `12px #6B7280` |

### 3.4. Khung ảnh logo

| Thuộc tính | Giá trị |
|---|---|
| Kích thước hiển thị | `96 × 96 px`, bo `12px`, nền trắng, viền `1px --border-card` |
| Nút tải lên | nút tròn `32px` nền `--primary`, icon ⬆ trắng, đặt góc **dưới–phải**, đè lên khung |
| Ảnh trống | icon ảnh xám `#C6CEDA` canh giữa |
| Định dạng nhận | `.png` · `.jpg` · `.jpeg` · `.svg` |
| Dung lượng tối đa | **2 MB** |
| Kích thước khuyến nghị | `≥ 200 × 200 px`, tỉ lệ **1:1** |
| Hiển thị | `object-fit: contain`, **không cắt méo ảnh** |

### 3.5. Hộp lưu ý (note box)

```
┌────────────────────────────────────────────────────────────┐
│ Lưu ý:  Sau khi chuyển đổi sang mô hình Tập đoàn, bạn cần  │  nền  #FFF7E6
│         thiết lập Thông tin chung, Cơ cấu tổ chức (Công ty │  viền trái 3px #F0C36D
│         mẹ – con – liên kết), Phân quyền ở cấp Tập đoàn.   │  bo 6px · đệm 12px
└────────────────────────────────────────────────────────────┘
```
Nhãn `Lưu ý:` in đậm màu `#B45309`; các cụm **Tập đoàn**, **Thông tin chung**, **Cơ cấu tổ chức**, **Phân quyền** in đậm màu `--text`.

---

## 4. CHI TIẾT CÁC TRƯỜNG DỮ LIỆU

**Chú giải cột `Kiểu`:** `TEXT` chữ · `NUM` số · `SELECT` chọn 1 · `MULTI` chọn nhiều · `DATE` ngày · `EMAIL` · `PHONE` · `URL` · `TEXTAREA` · `FILE` · `RO` chỉ đọc.

### 4.1. Banner — Nhận diện công ty

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc | Ghi chú |
|---|---|---|:--:|---|---|
| `logo` | (không nhãn) | FILE | ✖ | png/jpg/jpeg/svg · ≤ 2MB · ≥ 200×200 | Xem §3.4 |
| `display_name` | Tên công ty | RO | — | Lấy từ `full_name` | Chữ `20px/700 --text`, in hoa theo dữ liệu |
| `display_tax_code` | MST | RO | — | Lấy từ `tax_code` | Chữ `13px #6B7280`, nhãn `MST:` |

### 4.2. Thẻ 🏛 **Thông tin chi tiết**

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc | Mặc định | Ghi chú |
|---|---|---|:--:|---|---|---|
| `full_name` | Tên đầy đủ | TEXT | ✅ | 3–255 ký tự | Từ đăng ký TK | Cho phép tiếng Việt có dấu, số, `-`, `.`, `,`, `&`, `(`, `)` |
| `short_name` | Tên viết tắt | TEXT | ✖ | ≤ 50 ký tự | — | Không khoảng trắng đầu/cuối |
| `business_type` | Loại hình kinh doanh | SELECT | ✅ | 1 giá trị | `Doanh nghiệp` | Nguồn: danh mục hệ thống (§4.6) |
| `tax_code` | Mã số thuế | NUM | ✅ | **10** hoặc **13** chữ số; 13 số theo dạng `##########-###` | Từ đăng ký TK | **Duy nhất toàn hệ thống**; chỉ nhập số và dấu `-` |
| `company_code` | Mã công ty | RO | — | Hệ thống sinh | Tự sinh | Nền xám, **có nút 📋 sao chép**; không sửa được |
| `founded_date` | Ngày thành lập | DATE | ✖ | `dd/MM/yyyy` · ≤ ngày hiện tại | — | Có icon lịch, chọn từ date-picker |

### 4.3. Thẻ 📄 **Đăng ký kinh doanh**

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc | Ghi chú |
|---|---|---|:--:|---|---|
| `business_reg_no` | Mã số ĐKKD | TEXT | ✖ | ≤ 50 ký tự, chữ + số | Placeholder: *Nhập mã đăng ký kinh doanh* |
| `business_reg_date` | Ngày cấp | DATE | ✖ | `dd/MM/yyyy` · ≤ hôm nay · **≥ `founded_date`** | |
| `business_reg_place` | Nơi cấp | TEXT | ✖ | ≤ 255 ký tự | Placeholder: *Nhập nơi cấp* |
| `legal_rep_name` | Người đại diện pháp luật | TEXT | ✖ | ≤ 100 ký tự, **chỉ chữ cái + khoảng trắng** | Không cho nhập số |
| `legal_rep_title` | Chức danh | TEXT | ✖ | ≤ 100 ký tự | VD: *Giám đốc*, *Tổng giám đốc* |

### 4.4. Thẻ 📞 **Thông tin liên hệ**

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc | Ghi chú |
|---|---|---|:--:|---|---|
| `address` | Địa chỉ | TEXTAREA | ✅ | 5–500 ký tự | Cao tối thiểu `96px` |
| `province_id` | Tỉnh/Thành phố | SELECT | ✖ | 1 giá trị · có **tìm kiếm** | Nguồn: danh mục địa giới hành chính |
| `district_id` | Quận/Huyện | SELECT | ✖ | **Phụ thuộc** `province_id` | Disable khi chưa chọn Tỉnh |
| `ward_id` | Xã/Phường | SELECT | ✖ | **Phụ thuộc** `district_id` | Disable khi chưa chọn Quận |
| `phone` | Điện thoại | PHONE | ✅ | 10–11 chữ số · `^(0|\+84)[0-9]{9,10}$` | Chỉ nhận số, `+`, khoảng trắng |
| `fax` | Fax | PHONE | ✖ | ≤ 20 ký tự, chỉ số và `-` | |
| `email` | Email | EMAIL | ✖ | `^[\w.+-]+@[\w-]+\.[\w.-]+$` · ≤ 255 | Tự chuyển **chữ thường** khi lưu |
| `website` | Website | URL | ✖ | ≤ 255 · tự thêm `https://` nếu thiếu | VD: `www.degoholding.vn` |

> **Quy tắc phụ thuộc (cascade):** đổi `Tỉnh/Thành phố` → **xóa trắng** `Quận/Huyện` và `Xã/Phường`. Đổi `Quận/Huyện` → **xóa trắng** `Xã/Phường`.

### 4.5. Thẻ ⚙ **Mô hình hoạt động**

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc | Ghi chú |
|---|---|---|:--:|---|---|
| `org_model` | Mô hình | RO | — | `Công ty` \| `Tập đoàn` | Nền xám, **luôn chỉ đọc** — chỉ đổi qua nút bên dưới |
| — | *Chuyển thành mô hình tập đoàn* | BUTTON | — | Chỉ **Quản trị hệ thống** | Xem §7 |

### 4.6. Danh mục nguồn cho các SELECT

| Trường | Nguồn | Giá trị mẫu |
|---|---|---|
| `business_type` | Danh mục hệ thống (cố định) | Doanh nghiệp · Hộ kinh doanh · Hợp tác xã · Tổ chức khác |
| `province_id` | Danh mục địa giới hành chính | 63 tỉnh/thành |
| `district_id` | Địa giới — lọc theo tỉnh | |
| `ward_id` | Địa giới — lọc theo quận/huyện | |

---

## 5. QUY ĐỊNH NHẬP LIỆU THEO KIỂU TRƯỜNG

> Áp dụng thống nhất cho **toàn bộ** màn hình của Công cụ Thu mua.

### 5.1. TEXT — chữ

| Quy định | Chi tiết |
|---|---|
| Ký tự cho phép | Chữ (có dấu tiếng Việt), số, khoảng trắng, `- . , & ( ) / _` |
| Cấm | Ký tự điều khiển, emoji, thẻ HTML (`<`, `>`) |
| Chuẩn hóa khi lưu | `trim()` 2 đầu; gộp nhiều khoảng trắng thành 1 |
| Độ dài | Luôn khai báo `min`/`max`; mặc định `max = 255` |
| Trường "chỉ chữ" | VD `legal_rep_name`: regex `^[\p{L}\s]+$` — **chặn gõ số ngay tại ô** |

### 5.2. NUM — số

| Quy định | Chi tiết |
|---|---|
| Bàn phím mobile | `inputmode="numeric"` |
| Chặn nhập | Chữ cái và ký tự đặc biệt bị **chặn tại `onKeyPress`**, không đợi tới lúc submit |
| Số âm | **Không cho phép**, trừ khi trường ghi rõ |
| Dấu phân cách | Hiển thị `1.000.000` (dấu `.` hàng nghìn); **lưu xuống DB là số thuần** |
| Số thập phân | Mặc định 0 chữ số; trường tiền tệ 2 chữ số |
| Dán (paste) | Tự lọc bỏ ký tự không hợp lệ thay vì báo lỗi |
| Riêng `tax_code` | Là chuỗi số — **giữ số 0 ở đầu**, không ép kiểu number |

### 5.3. SELECT — chọn một

| Quy định | Chi tiết |
|---|---|
| Hiển thị | Danh sách xổ xuống, có icon `▾` |
| Tìm kiếm | Bật khi danh sách **> 10 mục** (VD: Tỉnh/Thành phố) |
| Giá trị rỗng | Có mục *"-- Chọn --"* nếu trường **không bắt buộc** |
| Không tìm thấy | Hiện *"Không có dữ liệu"* |
| Phụ thuộc | Ô con **disable** khi ô cha trống; đổi cha → **xóa trắng** con |
| Mục ngừng hoạt động | **Ẩn** khi chọn mới, nhưng **vẫn hiển thị** nếu bản ghi cũ đang dùng |
| Nhập tự do | **Không cho phép** — chỉ chọn trong danh mục |

### 5.4. MULTI — chọn nhiều

| Quy định | Chi tiết |
|---|---|
| Hiển thị | Dạng **chip/tag** trong ô, mỗi chip có nút `✕` để gỡ |
| Chip tràn | Hiện tối đa 3 chip + *"+N"*; hover xem đầy đủ |
| Tìm kiếm | **Luôn bật** |
| Chọn tất cả | Có *"Chọn tất cả"* / *"Bỏ chọn tất cả"* khi danh sách ≤ 50 mục |
| Giới hạn | Khai báo rõ `max` nếu có; đạt giới hạn → disable các mục còn lại |
| Thứ tự lưu | Theo thứ tự người dùng chọn |
| Trùng lặp | Không cho chọn lại mục đã chọn |
| Xóa nhanh | `Backspace` ở ô rỗng → gỡ chip cuối |

> **Ghi chú:** màn hình Thông tin công ty **hiện chưa dùng** trường MULTI. Quy định trên đặt sẵn để dùng thống nhất ở các màn hình sau (VD: Ngành nghề kinh doanh, Nhóm hàng phụ trách).

### 5.5. DATE — ngày

| Quy định | Chi tiết |
|---|---|
| Định dạng hiển thị | `dd/MM/yyyy` |
| Định dạng lưu | ISO `yyyy-MM-dd` |
| Nhập liệu | Cho **gõ tay** lẫn chọn từ date-picker |
| Ràng buộc | Khai báo `min`/`max`; ngày quá khứ/tương lai tùy trường |
| Liên trường | `business_reg_date` **≥** `founded_date` — sai thì báo lỗi ở ô sau |
| Ngày không hợp lệ | VD `31/02` → báo *"Ngày không hợp lệ"* |

### 5.6. EMAIL · PHONE · URL

| Kiểu | Quy định |
|---|---|
| **EMAIL** | Regex `^[\w.+-]+@[\w-]+\.[\w.-]+$`; tự hạ **chữ thường**; kiểm tra khi rời ô (`onBlur`) |
| **PHONE** | Chỉ số, `+`, khoảng trắng; VN: `^(0\|\+84)[0-9]{9,10}$`; bỏ khoảng trắng khi lưu |
| **URL** | Tự thêm `https://` nếu người dùng gõ thiếu; kiểm tra dạng tên miền hợp lệ |

### 5.7. TEXTAREA

Cao tối thiểu `96px` · chỉ cho kéo **dọc** · hiện bộ đếm `n/500` khi còn < 50 ký tự · cho xuống dòng, **không** cho tab.

### 5.8. RO — chỉ đọc

Nền `--bg-readonly` · không nhận focus bàn phím · **không** gửi lên API khi lưu · nếu là mã (VD `company_code`) thì có nút 📋 **sao chép** kèm toast *"Đã sao chép"*.

---

## 6. TRẠNG THÁI MÀN HÌNH & CÁC NÚT

### 6.1. Hai chế độ

```
        ┌──────────────── CHẾ ĐỘ XEM ────────────────┐
        │  Mọi ô: chỉ đọc (nền xám, không focus)     │
        │  Nút hiển thị:  [ ✏ Chỉnh sửa ]            │
        └────────────────┬───────────────────────────┘
                         │ nhấn "Chỉnh sửa"
                         ▼
        ┌─────────────── CHẾ ĐỘ SỬA ─────────────────┐
        │  Ô nhập mở khóa (trừ trường RO)            │
        │  Nút hiển thị:  [ Hủy ]  [ 💾 Lưu ]        │
        └───┬─────────────────────────────┬──────────┘
            │ "Hủy"                       │ "Lưu" (hợp lệ)
            ▼                             ▼
      Khôi phục dữ liệu gốc          Gọi API → toast
      → về CHẾ ĐỘ XEM               → về CHẾ ĐỘ XEM
```

### 6.2. Đặc tả nút

| Nút | Vị trí | Kiểu | Màu | Hiện khi | Hành vi |
|---|---|---|---|---|---|
| **✏ Chỉnh sửa** | Góc trên–phải | Primary | Nền `--primary`, chữ trắng | Chế độ **Xem** | Mở khóa toàn bộ ô nhập → chuyển chế độ Sửa. Chỉ hiện nếu có quyền sửa |
| **Hủy** | Góc trên–phải, **bên trái** nút Lưu | Secondary | Nền trắng, viền `--border`, chữ `--text` | Chế độ **Sửa** | Khôi phục dữ liệu gốc, xóa mọi lỗi, về chế độ Xem. **Nếu có thay đổi chưa lưu → hiện hộp xác nhận** |
| **💾 Lưu** | Góc trên–phải, ngoài cùng | Primary | Nền `--primary`, chữ trắng, icon 💾 | Chế độ **Sửa** | Kiểm tra hợp lệ → gọi API → toast → về chế độ Xem |

**Kích thước nút:** cao `36px` · bo `6px` · đệm ngang `16px` · chữ `14px/500` · khoảng cách 2 nút `8px`.

### 6.3. Hộp xác nhận khi Hủy

```
┌──────────────────────────────────────────────┐
│  Xác nhận hủy                                │
│                                              │
│  Các thay đổi chưa được lưu sẽ bị mất.      │
│  Bạn có chắc chắn muốn hủy?                  │
│                                              │
│                  [ Tiếp tục sửa ] [ Hủy bỏ ] │
└──────────────────────────────────────────────┘
```
Chỉ hiện khi **thực sự có thay đổi** (so sánh dữ liệu hiện tại với bản gốc). Không thay đổi → hủy ngay, không hỏi.

### 6.4. Trạng thái nút Lưu

| Tình huống | Trạng thái |
|---|---|
| Không có thay đổi | **Disable** (mờ 50%) |
| Đang gọi API | **Loading** — hiện spinner, khóa cả 2 nút, chặn đóng trang |
| Lỗi validate | Bật lại, **cuộn tới ô lỗi đầu tiên** và focus vào đó |

---

## 7. CHUYỂN ĐỔI MÔ HÌNH TẬP ĐOÀN

| Hạng mục | Đặc tả |
|---|---|
| Nút | **Chuyển thành mô hình tập đoàn** — Primary, icon phân nhánh, đặt dưới ô `Mô hình` |
| Điều kiện hiện | `org_model = "Công ty"` **và** người dùng là **Quản trị hệ thống** |
| Xác nhận | Modal cảnh báo — nêu rõ **không thể hoàn tác** |
| Sau khi chuyển | `org_model = "Tập đoàn"`, nút **biến mất**, hộp lưu ý vẫn hiển thị |
| Việc phải làm tiếp | Thiết lập **Thông tin chung**, **Cơ cấu tổ chức** (Công ty mẹ – con – liên kết), **Phân quyền** ở cấp Tập đoàn |

> ⚠️ Đây là thao tác **một chiều**. Cần ghi `audit_log` với `action = CHANGE_ORG_MODEL`, lưu người thực hiện và thời điểm.

---

## 8. KIỂM TRA HỢP LỆ & THÔNG BÁO

### 8.1. Thứ tự kiểm tra
1. Trường **bắt buộc** còn trống
2. **Định dạng** từng trường (regex, độ dài)
3. Ràng buộc **liên trường** (`business_reg_date ≥ founded_date`)
4. Ràng buộc **phía server** (MST trùng)

### 8.2. Thông báo lỗi chuẩn

| Mã | Tình huống | Nội dung hiển thị |
|---|---|---|
| `E001` | Bỏ trống bắt buộc | *"{Tên trường} không được để trống."* |
| `E002` | Sai định dạng MST | *"Mã số thuế phải gồm 10 hoặc 13 chữ số."* |
| `E003` | MST đã tồn tại | *"Mã số thuế này đã được sử dụng."* |
| `E004` | Sai định dạng email | *"Email không đúng định dạng."* |
| `E005` | Sai định dạng điện thoại | *"Số điện thoại không hợp lệ (10–11 chữ số)."* |
| `E006` | Ngày cấp < ngày thành lập | *"Ngày cấp phải sau hoặc bằng ngày thành lập."* |
| `E007` | Ảnh vượt dung lượng | *"Ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn."* |
| `E008` | Sai định dạng ảnh | *"Chỉ chấp nhận file .png, .jpg, .jpeg, .svg."* |
| `E009` | Vượt độ dài | *"{Tên trường} tối đa {n} ký tự."* |

**Cách hiển thị:** viền ô đỏ + dòng lỗi `12px --danger` ngay dưới ô. Lỗi hệ thống (mất mạng, 500) → **toast đỏ** góc trên–phải.

### 8.3. Thông báo thành công
Toast xanh, góc trên–phải, tự tắt sau **3 giây**: *"Cập nhật thông tin công ty thành công."*

---

## 9. API

```http
GET   /api/v1/system/company            → lấy thông tin hiện tại
PUT   /api/v1/system/company            → cập nhật (chỉ gửi trường thay đổi)
POST  /api/v1/system/company/logo       → tải logo (multipart)
POST  /api/v1/system/company/upgrade-to-group  → chuyển mô hình tập đoàn
```

**Payload mẫu `PUT`:**
```json
{
  "full_name": "CÔNG TY TNHH NÉT VIỆT",
  "short_name": "NV",
  "business_type": "DOANH_NGHIEP",
  "tax_code": "0302028548",
  "founded_date": "2015-03-12",
  "business_reg_no": "0302028548",
  "business_reg_date": "2015-03-20",
  "business_reg_place": "Sở KH&ĐT TP.HCM",
  "legal_rep_name": "Jean Luc",
  "legal_rep_title": "Giám đốc",
  "address": "123 Nguyễn Huệ, P. Bến Nghé",
  "province_id": "79", "district_id": "760", "ward_id": "26734",
  "phone": "0973123456",
  "fax": null,
  "email": "pjeanluc211@gmail.com",
  "website": "https://netviet.vn"
}
```

**Mã lỗi:** `400` sai định dạng · `403` không có quyền sửa · `409` MST trùng · `422` thiếu trường bắt buộc.

---

## 10. GHI NHẬN NHẬT KÝ (AUDIT)

Mọi lần **Lưu** thành công phải ghi `audit_log`:

| Trường | Giá trị |
|---|---|
| `action` | `UPDATE_COMPANY_INFO` |
| `entity` | `company` |
| `before` / `after` | JSON **chỉ các trường thay đổi** |
| `actor_id`, `ip`, `created_at` | Theo phiên đăng nhập |

Kết quả xem được tại **Hệ thống → Nhật ký hoạt động**.

---

## 11. CHECKLIST NGHIỆM THU

- [ ] Mở màn hình lần đầu → tự điền Tên đầy đủ, MST, Điện thoại, Email từ đăng ký tài khoản
- [ ] Chế độ Xem: mọi ô khóa, chỉ hiện nút **Chỉnh sửa**
- [ ] Nhấn **Chỉnh sửa** → mở khóa ô, hiện **Hủy** + **Lưu**; ô `Mã công ty` và `Mô hình` **vẫn khóa**
- [ ] Nút **Lưu** disable khi chưa thay đổi gì
- [ ] **Hủy** khi có thay đổi → hiện hộp xác nhận; xác nhận → dữ liệu quay về bản gốc
- [ ] Bỏ trống từng trường bắt buộc → báo đúng lỗi `E001`, cuộn tới ô lỗi đầu tiên
- [ ] MST nhập chữ → bị chặn ngay khi gõ; nhập 9 số → lỗi `E002`
- [ ] Chọn Tỉnh → Quận mở khóa; đổi Tỉnh → Quận và Xã bị xóa trắng
- [ ] `Người đại diện pháp luật` không gõ được số
- [ ] Tải logo 3MB → lỗi `E007`; tải file `.pdf` → lỗi `E008`
- [ ] Nút 📋 sao chép `Mã công ty` → toast *"Đã sao chép"*
- [ ] Ngày cấp < Ngày thành lập → lỗi `E006`
- [ ] Lưu thành công → toast xanh, về chế độ Xem, banner cập nhật tên/MST mới
- [ ] Người dùng thường → **không thấy** nút Chỉnh sửa
- [ ] Nút Chuyển mô hình tập đoàn chỉ hiện với Quản trị hệ thống
- [ ] Màn hình `< 1280px` → 2 cột xếp chồng, không vỡ layout
- [ ] Nhật ký hoạt động ghi nhận đúng các trường đã đổi

---

## PHỤ LỤC — Tóm tắt trường theo kiểu nhập

| Kiểu | Số trường | Danh sách |
|---|:--:|---|
| **TEXT** | 6 | `full_name`* · `short_name` · `business_reg_no` · `business_reg_place` · `legal_rep_name` · `legal_rep_title` |
| **NUM** | 1 | `tax_code`* |
| **SELECT** | 4 | `business_type`* · `province_id` · `district_id` · `ward_id` |
| **MULTI** | 0 | *(chưa dùng ở màn hình này)* |
| **DATE** | 2 | `founded_date` · `business_reg_date` |
| **TEXTAREA** | 1 | `address`* |
| **PHONE** | 2 | `phone`* · `fax` |
| **EMAIL** | 1 | `email` |
| **URL** | 1 | `website` |
| **FILE** | 1 | `logo` |
| **RO** | 2 | `company_code` · `org_model` |

`*` = bắt buộc · **Tổng: 21 trường**, trong đó **5 bắt buộc**.


---

## 12. PHỤ LỤC — BỐ CỤC BẢNG DỮ LIỆU DANH MỤC (CHUẨN VỊ TRÍ CÔNG VIỆC)

Quy chuẩn này được rút ra từ trang **Vị trí công việc**, dùng làm mẫu thiết kế cho các bảng danh mục khác trong hệ thống:

### 12.1. Cấu trúc Card và Bảng
- Bọc toàn bộ bảng trong `<div className="company-card h-100 dis-flex dis-flex-column" style={{ padding: 24 }}>` để tạo đệm 24px 4 phía.
- CSS riêng cho bảng: Padding 2 bên trái phải 10px (`.table-px-10`).
- Khi hover vào dòng (row hover): Đổi màu nền chữ/thao tác sang màu xám nhạt `#909ca8` thay vì `#0096CC`.

### 12.2. Toolbar trên bảng
- Bọc Toolbar bằng: `<div className="toolbar px-10 py-16 dis-flex align-items-center justify-content-between border-bottom" style={{ gap: '16px', flexWrap: 'nowrap' }}>`
- **Bên trái:** Khung tìm kiếm (Search box) có icon kính lúp.
- **Bên phải:** Nhóm nút thao tác:
  - Nút *Import / Export / Cài đặt cột*: dùng class `btn outline icon-btn`. Chú ý viết cách khoảng `btn outline`.
  - Nút *Thêm mới*: dùng class `btn outline primary dis-flex align-items-center gap-8`.

### 12.3. Tính năng Sắp xếp & Cài đặt cột
- **Sắp xếp (Sort):** Tiêu đề cột có thể click để sắp xếp (A-Z / Z-A). Cột đang được sắp xếp có thêm icon `ti-arrow-up` hoặc `ti-arrow-down`.
- **Cài đặt hiển thị cột:** 
  - Nút Cài đặt cột (`ti-columns`) mở ra một Popup.
  - Khung Popup: `position-absolute`, `minWidth: 200`, `backgroundColor: '#fff'`, `padding: 16px`, `borderRadius: 8`, `zIndex: 10`, `boxShadow: '0 8px 24px rgba(0,0,0,0.15)'`.
  - Checkbox: Ẩn checkbox mặc định, dùng class `.react-checkbox` (đã khai báo trong CSS) để tạo ô vuông bo góc phong cách React, chuyển xanh dương khi chọn.
  - Các dòng nhãn: `dis-flex align-items-center gap-12 mb-12 cursor-pointer`, kèm style `{ fontSize: 15, color: '#0f172a', fontWeight: 600, lineHeight: '2rem' }` để tạo khoảng cách dòng rộng rãi, dễ nhìn.
