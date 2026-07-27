# TM-HT-03 · ĐẶC TẢ MÀN HÌNH — VỊ TRÍ CÔNG VIỆC

> **Ứng dụng:** Hệ thống · **Phân hệ:** Quản lý danh mục → Đối tượng/Người dùng → Vị trí công việc
> **Mã màn hình:** `SYS-JOB-POSITION` · **Phiên bản:** v1.0 · **Ngày lập:** 24/07/2026
> **Thuộc bộ:** Đặc tả Công cụ Thu mua DEGO · **Kế thừa quy ước:** [01-thong-tin-cong-ty.md](01-thong-tin-cong-ty.md) §3, §5 · [02-co-cau-to-chuc.md](02-co-cau-to-chuc.md) §2.4

---

## 1. TỔNG QUAN

### 1.1. Mục đích
Tạo các **vị trí công việc thực tế** tại đơn vị để gán cho người dùng. Vị trí công việc hiển thị trên **thông tin người dùng** ở tất cả ứng dụng MISA AMIS, giúp nhận biết vai trò của từng người.

### 1.2. Đường dẫn truy cập
```
Ứng dụng Hệ thống → Quản lý danh mục → Đối tượng/Người dùng → Vị trí công việc
```

### 1.3. Quan hệ dữ liệu

```
      ┌──────────────────┐          ┌──────────────────┐
      │  Nhóm vị trí     │          │    Chức danh     │
      │ (danh mục phụ)   │          │  (danh mục phụ)  │
      └────────┬─────────┘          └────────┬─────────┘
               │ 1                           │ 1
               │                             │
               ▼ n                           ▼ n
          ┌────────────────────────────────────────┐
          │          VỊ TRÍ CÔNG VIỆC              │
          └────────────────┬───────────────────────┘
                           │ n ── n
                           ▼
                  ┌──────────────────┐
                  │  Cơ cấu tổ chức  │  ← Đơn vị công tác (nhiều đơn vị)
                  │    (TM-HT-02)    │
                  └──────────────────┘
                           │
                           ▼
                    Gán cho Người dùng
```

### 1.4. Ba màn hình trong đặc tả

| Mã | Màn hình | Mô tả |
|---|---|---|
| `A` | **Danh sách vị trí công việc** | Bảng phẳng + tìm kiếm + lọc + phân trang |
| `B` | **Thêm / Sửa vị trí công việc** | Form 2 cột |
| `C` | **Modal quản lý danh mục phụ** | *Nhóm vị trí* · *Chức danh* — chọn / sửa / xóa |

### 1.5. Vai trò sử dụng

| Vai trò | Xem | Thêm | Sửa | Ngừng theo dõi | Xóa |
|---|:--:|:--:|:--:|:--:|:--:|
| Quản trị hệ thống | ✅ | ✅ | ✅ | ✅ | ✅ |
| Quản trị ứng dụng | ✅ | ✅ | ✅ | ✅ | ❌ |
| Người dùng thường | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 2. MÀN HÌNH A — DANH SÁCH VỊ TRÍ CÔNG VIỆC

### 2.1. Bố cục

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│  Vị trí công việc                                                                  │
├────────────────────────────────────────────────────────────────────────────────────┤
│ [🔍 Tìm kiếm theo mã, tên vị trí, đơn vị]  Trạng thái [Tất cả ▾]                    │
│                                                    [⇥]  [ + Thêm vị trí ▾ ]  [⚙]  │
├────────────────────────────────────────────────────────────────────────────────────┤
│ ☐ │ Mã vị trí │ Tên vị trí              │ Đơn vị │ Trạng thái   │Nhóm vị trí│Chức danh│
├────────────────────────────────────────────────────────────────────────────────────┤
│ ☐ │ COO       │ Giám đốc điều hành      │  - -   │[Đang theo dõi]│   - -    │  - -   │
│ ☐ │ CSKH      │ Nhân viên chăm sóc KH   │  - -   │[Đang theo dõi]│   - -    │  - -   │
│ ☐ │ NVMH      │ Nhân viên mua hàng      │  - -   │[Đang theo dõi]│   - -    │  - -   │
│ ☐ │ TGĐ       │ Tổng giám đốc           │  - -   │[Đang theo dõi]│   - -    │  - -   │
├────────────────────────────────────────────────────────────────────────────────────┤
│ Tổng số: 15            Số dòng/trang [20 ▾]   1 - 15   |◀  ◀  ▶  ▶|               │
└────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Đặc tả cột danh sách

| # | Cột | Kiểu | Rộng | Canh | Định dạng |
|---|---|---|---|---|---|
| 0 | **☐ Chọn** | CHECK | `44px` | Giữa | Header có ô **chọn tất cả** (trạng thái nửa chọn khi chọn một phần) |
| 1 | **Mã vị trí** | TEXT | `200px` | Trái | Chữ `--text`; VD `COO`, `NVMH` |
| 2 | **Tên vị trí** | TEXT | `280px` | Trái | Dài quá → `…` + tooltip |
| 3 | **Đơn vị** | TEXT | `240px` | Trái | Nhiều đơn vị → hiện đơn vị đầu + `+N`; trống → `- -` |
| 4 | **Trạng thái** | BADGE | `160px` | Trái | Xem §2.3 |
| 5 | **Nhóm vị trí** | TEXT | `240px` | Trái | Trống → `- -` |
| 6 | **Chức danh** | TEXT | `240px` | Trái | Trống → `- -` |

**Định dạng bảng chung** *(kế thừa [02-co-cau-to-chuc.md](02-co-cau-to-chuc.md) §2.4)*:

| Thành phần | Định dạng |
|---|---|
| Header | Nền `#FFFFFF` · chữ `13px/600 #4B5563` · cao `44px` · viền dưới `1px #E7EBF0` · `sticky` |
| Dòng | Cao `40px` · viền dưới `1px #EEF1F5` · chữ `13px --text` |
| Hover dòng | Nền `#F5F9FF` |
| Dòng được chọn | Nền `#E9F3FF`, checkbox tích xanh |
| **Ô trống** | Ký tự **`- -`** (hai gạch) màu `#9CA3AF`, canh trái |
| Cột đóng băng | **Mã vị trí** ghim trái khi cuộn ngang |
| Vùng trống dưới bảng | Nền trắng, **không kẻ dòng giả** |

> ⚠️ **Không thống nhất:** màn Cơ cấu tổ chức dùng **`-`** (một gạch) cho ô trống, màn này dùng **`- -`** (hai gạch). → Đề xuất thống nhất **`-`**.

### 2.3. Badge trạng thái

| Giá trị | Nhãn | Định dạng |
|---|---|---|
| `is_inactive = false` | **Đang theo dõi** | Nền `#F2FBF5` · viền `1px solid #86D9A4` · chữ `#16A34A` · bo `4px` · `12px/500` · đệm `3px 10px` |
| `is_inactive = true` | **Ngừng theo dõi** | Nền `#F5F6F8` · viền `1px solid #D9DEE7` · chữ `#6B7280` · cùng bo/cỡ |

> ⚠️ **Không thống nhất:** màn Cơ cấu tổ chức dùng badge **nền xanh dương đặc, không viền**; màn này dùng badge **viền xanh lá, nền nhạt**. → Cần chốt **một** kiểu badge trạng thái cho toàn bộ ứng dụng.

### 2.4. Thanh công cụ

| Điều khiển | Kiểu | Hành vi |
|---|---|---|
| **🔍 Tìm kiếm** | Ô nhập, rộng `280px` | Tìm theo **mã vị trí · tên vị trí · đơn vị**. Debounce `300ms`. Placeholder *"Tìm kiếm theo mã, tên vị trí, đơn vị"* |
| **Trạng thái** | SELECT, rộng `240px` | `Tất cả` (mặc định) · `Đang theo dõi` · `Ngừng theo dõi` |
| **⇥ Xuất khẩu** | Icon | Xuất Excel theo bộ lọc hiện tại |
| **+ Thêm vị trí ▾** | Primary + dropdown | Mở màn hình B. Dropdown: *Thêm vị trí* · *Nhập khẩu từ Excel* *(cần xác nhận)* |
| **⚙ Tùy chỉnh cột** | Icon | Ẩn/hiện + đổi thứ tự cột; lưu theo người dùng |

### 2.5. Thao tác hàng loạt (khi tích chọn ≥ 1 dòng)

Hiện thanh thao tác thay cho thanh công cụ: *"Đã chọn {n} vị trí"* + các nút:

| Thao tác | Điều kiện |
|---|---|
| **Ngừng theo dõi** | Các dòng đang theo dõi |
| **Bỏ ngừng theo dõi** | Các dòng đang ngừng |
| **Xóa** | Tất cả dòng chọn **chưa được gán cho người dùng nào** |
| **Bỏ chọn** | Luôn có |

### 2.6. Thao tác trên dòng
Hover dòng → hiện nút cuối dòng (hoặc menu `⋮`): **Sửa** · **Ngừng theo dõi** · **Xóa**.
Bấm vào **Mã vị trí** hoặc **Tên vị trí** → mở màn hình B chế độ Sửa.

### 2.7. Phân trang

```
Tổng số: 15          Số dòng/trang [20 ▾]     1 - 15     |◀   ◀   ▶   ▶|
```

| Thành phần | Đặc tả |
|---|---|
| **Tổng số** | Góc dưới–trái. Chữ `13px #4B5563`, số **in đậm** |
| **Số dòng/trang** | SELECT: `20` (mặc định) · `50` · `100` |
| **Khoảng hiển thị** | Dạng `{từ} - {đến}`, VD `1 - 15` |
| **Nút điều hướng** | `|◀` đầu · `◀` trước · `▶` sau · `▶|` cuối. **Disable** (mờ 40%) khi ở biên |
| Ghi nhớ | Đổi số dòng/trang → quay về **trang 1**, lưu lựa chọn theo người dùng |

---

## 3. MÀN HÌNH B — THÊM / SỬA VỊ TRÍ CÔNG VIỆC

### 3.1. Bố cục

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Thêm vị trí công việc                              [ Hủy ]  [ 💾 Lưu ]     │
├───────────────────────────────────┬──────────────────────────────────────────┤
│ CỘT TRÁI                          │ CỘT PHẢI                                 │
│                                   │                                          │
│ Mã vị trí *      [VT000001_____]  │ Tên vị trí *     [_________________]     │
│                                   │                                          │
│ Đơn vị công tác *                 │ Nhóm vị trí      [Kế toán      ▾] [⋮]    │
│ ┌─────────────────────────────┐   │                                          │
│ │ [CÔNG TY TNHH NÉT VIỆT ✕]   │   │ Chức danh        [Nhân viên    ▾] [⋮]    │
│ │                             │   │                                          │
│ └─────────────────────────────┘   │                                          │
│                                   │                                          │
│ ☐ Ngừng theo dõi  ⚑               │                                          │
└───────────────────────────────────┴──────────────────────────────────────────┘
        ⚑ Vị trí điều khiển Trạng thái chưa quan sát được — xem Phụ lục B
```

**Lưới:** 2 cột bằng nhau, gap `32px`. Màn hình `< 1280px` → xếp chồng 1 cột.

### 3.2. Đặc tả trường dữ liệu

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc | Ghi chú |
|---|---|---|:--:|---|---|
| `position_code` | Mã vị trí | TEXT | ✅ | 1–20 ký tự · **duy nhất** | **Hệ thống tự sinh** mẫu `VT` + 6 số (`VT000001`), tăng dần. **Cho phép sửa** thành mã nghiệp vụ (`COO`, `NVMH`). Chữ, số, `_`, `-`; không khoảng trắng; tự viết HOA |
| `position_name` | Tên vị trí | TEXT | ✅ | 2–255 ký tự | Cho tiếng Việt có dấu. Placeholder *Nhập tên vị trí* |
| `org_unit_ids` | Đơn vị công tác | **MULTI** | ✅ | ≥ 1 đơn vị | Chọn từ **cây Cơ cấu tổ chức** (TM-HT-02). Hiển thị dạng **chip** — xem §3.3 |
| `position_group_id` | Nhóm vị trí | SELECT | ✖ | 1 giá trị | Kèm nút `⋮` mở **Modal C**. VD: *Kế toán* |
| `job_title_id` | Chức danh | SELECT | ✖ | 1 giá trị | Kèm nút `⋮` mở **Modal C**. VD: *Nhân viên* |
| `is_inactive` | Trạng thái / Ngừng theo dõi | CHECK | ✖ | `true`/`false` | Mặc định **Đang theo dõi**. Xem §5.2 |

### 3.3. Đặc tả `Đơn vị công tác` (MULTISELECT dạng CHIP)

> Đây là **MULTI dạng chip** đúng theo quy ước tổng quát [01-thong-tin-cong-ty.md](01-thong-tin-cong-ty.md) §5.4 — khác với `Lĩnh vực hoạt động` ở TM-HT-02 (checkbox group), vì đây là **danh mục động, số lượng lớn**.

| Thuộc tính | Giá trị |
|---|---|
| Dạng hiển thị | Ô cao tối thiểu **`72px`** (≈ 2 hàng chip), chip **tự xuống dòng** khi tràn |
| Nguồn dữ liệu | Cây **Cơ cấu tổ chức**, hiển thị dropdown **dạng cây**, có tìm kiếm |
| Số lượng | **≥ 1** (bắt buộc), không giới hạn trên |
| **Chip** | Nền `#F1F3F6` · viền `1px #E1E5EA` · bo `4px` · chữ `13px --text` · đệm `3px 8px` · cách nhau `6px` |
| **Nút gỡ chip** | Icon `✕` `12px` màu `#6B7280`, hover → `--danger` |
| Chọn đơn vị cha | **Không** tự chọn đơn vị con — mỗi đơn vị là một chip độc lập |
| Đơn vị đã Ngừng theo dõi | **Không hiện** trong dropdown khi thêm mới; nếu bản ghi cũ đang dùng thì **vẫn hiển thị chip** (màu xám nhạt) |
| Trùng lặp | Đơn vị đã chọn bị **ẩn/mờ** trong dropdown |
| Xóa nhanh | `Backspace` khi con trỏ ở cuối ô rỗng → gỡ chip cuối |
| Bỏ trống | → Lỗi `E203` |

### 3.4. Đặc tả SELECT kèm nút `⋮`

Áp dụng cho **`Nhóm vị trí`** và **`Chức danh`**.

```
┌────────────────────────────────┐ ┌───┐
│ Kế toán                     ▾  │ │ ⋮ │  ← mở Modal C
└────────────────────────────────┘ └───┘
```

| Thuộc tính | Giá trị |
|---|---|
| Ô select | Chiếm phần lớn bề rộng; icon `▾` bên phải |
| Nút `⋮` | Vuông `40×40px`, nền trắng, viền `1px --border`, bo `6px`, cách select `8px`, icon `⋮` `#6B7280` |
| Hành vi nút `⋮` | Mở **Modal C** để chọn / thêm / sửa / xóa mục danh mục |
| Sau khi đóng modal | Giá trị chọn trong modal **được áp vào ô select**; danh sách dropdown làm mới |
| Bỏ trống | Cho phép — có mục *"-- Chọn --"* |

---

## 4. MÀN HÌNH C — MODAL QUẢN LÝ DANH MỤC PHỤ

Dùng chung cho **Nhóm vị trí** và **Chức danh**.

### 4.1. Bố cục

```
┌────────────────────────────────────────────────┐
│  Nhóm vị trí                              ✕    │
├────────────────────────────────────────────────┤
│  ○  Hành chính                        ✏   🗑   │
│  ○  Nhân sự                           ✏   🗑   │
│  ◉  Kế toán                           ✏   🗑   │
│  ○  Kinh doanh                        ✏   🗑   │
│  ○  Kỹ thuật                          ✏   🗑   │
│  ○  Công nhân                         ✏   🗑   │
│  ○  Quản lý                           ✏   🗑   │
│  ○  Lãnh đạo                          ✏   🗑   │
├────────────────────────────────────────────────┤
│  [ + Thêm mới ]              [ Hủy ] [ Đồng ý ]│  ⚑ cần xác nhận
└────────────────────────────────────────────────┘
```

### 4.2. Định dạng modal

| Thành phần | Định dạng |
|---|---|
| Hộp modal | Rộng `480px` · nền trắng · bo `8px` · bóng `0 8px 24px rgba(16,24,40,.12)` |
| Lớp phủ | `rgba(16,24,40,.45)` |
| Tiêu đề | `18px/600 --text`, đệm `20px 24px` |
| Nút đóng `✕` | `20px` màu `#6B7280`, góc trên–phải, hover → `--text` |
| Dòng mục | Cao `44px` · viền dưới `1px #EEF1F5` · đệm ngang `24px` |
| Hover dòng | Nền `#F5F9FF`, **hiện rõ** icon ✏ 🗑 |
| Radio | `16×16px`; chọn → viền + chấm `--primary` |
| Nhãn mục | `14px --text`, cách radio `12px` |
| Icon ✏ Sửa | `16px #6B7280`, hover → `--primary` |
| Icon 🗑 Xóa | `16px #6B7280`, hover → `--danger` |
| Danh sách dài | Cuộn dọc trong modal, tối đa cao `420px` |

### 4.3. Giá trị mặc định

| Nhóm vị trí | Chức danh |
|---|---|
| Hành chính · Nhân sự · Kế toán · Kinh doanh · Kỹ thuật · Công nhân · Quản lý · Lãnh đạo | Chủ tịch HĐQT · Tổng giám đốc · Phó tổng giám đốc · Giám đốc · Phó giám đốc · Trưởng phòng · Phó phòng · Nhân viên |

> **Lưu ý:** danh sách **Chức danh** có thứ bậc từ cao → thấp; giữ nguyên thứ tự này, **không sắp xếp A–Z**.

### 4.4. Thao tác trong modal

| Thao tác | Hành vi |
|---|---|
| **Chọn** (radio) | Chọn 1 mục → áp vào ô select ở màn hình B |
| **✏ Sửa** | Chuyển dòng sang chế độ nhập tại chỗ (inline); `Enter` lưu, `Esc` hủy. Tên **không được trùng** |
| **🗑 Xóa** | Hộp xác nhận. **Chặn** nếu mục đang được ≥ 1 vị trí công việc sử dụng → lỗi `E207` |
| **+ Thêm mới** | Thêm dòng trống ở cuối, focus vào ô nhập |
| **✕ / Hủy** | Đóng modal, **không áp** thay đổi lựa chọn |

---

## 5. NÚT & QUY TẮC NGHIỆP VỤ

### 5.1. Đặc tả nút

| Nút | Vị trí | Kiểu | Màu | Hành vi |
|---|---|---|---|---|
| **+ Thêm vị trí ▾** | Màn A, trên–phải | Primary + dropdown | Nền `--primary`, chữ trắng | Mở màn B (chế độ Thêm), `Mã vị trí` tự sinh |
| **Hủy** | Màn B, trên–phải, **bên trái** Lưu | Secondary | Nền trắng, viền `--border`, chữ `--text` | Có thay đổi → hộp xác nhận; không → quay lại ngay |
| **💾 Lưu** | Màn B, ngoài cùng phải | Primary | Nền `--primary`, chữ trắng, icon 💾 | Validate → API → toast → quay lại danh sách |
| **←** (mũi tên) | Màn B, trước tiêu đề | Icon | `#4B5563` | Tương đương **Hủy** |

**Kích thước nút:** cao `36px` · bo `6px` · đệm ngang `16px` · chữ `14px/500` · khoảng cách `8px`.

> ⚠️ **Không thống nhất:** màn Cơ cấu tổ chức dùng nhãn **"Hủy bỏ"**, màn này và màn Thông tin công ty dùng **"Hủy"**. → Đề xuất thống nhất **"Hủy"**.

### 5.2. Luồng & trạng thái nút

```
   DANH SÁCH ──[+ Thêm vị trí]/[Sửa]──► FORM (luôn ở chế độ nhập)
                                          [ Hủy ]   [ 💾 Lưu ]
                                             │          │
                     Xác nhận nếu có thay đổi│          │Validate → API
                                             ▼          ▼
                                        DANH SÁCH   toast + DANH SÁCH
```

| Tình huống | Trạng thái nút Lưu |
|---|---|
| Chế độ Sửa, chưa đổi gì | **Disable** (mờ 50%) |
| Đang gọi API | **Loading** — spinner, khóa cả 2 nút |
| Lỗi validate | Bật lại, **cuộn tới ô lỗi đầu tiên** và focus |

### 5.3. Quy tắc nghiệp vụ

| # | Quy tắc |
|---|---|
| 1 | `Mã vị trí` **duy nhất toàn hệ thống**, kể cả vị trí đã Ngừng theo dõi |
| 2 | `Mã vị trí` tự sinh `VT######` nhưng **cho phép sửa** — sửa xong vẫn phải duy nhất |
| 3 | `Đơn vị công tác` **bắt buộc ≥ 1**; một vị trí có thể dùng ở **nhiều đơn vị** |
| 4 | **Ngừng theo dõi** → vị trí **không hiện** trong dropdown gán cho người dùng mới; người dùng đang giữ vị trí này **giữ nguyên** |
| 5 | **Xóa** chỉ được khi vị trí **chưa gán cho người dùng nào**; ngược lại → gợi ý *Ngừng theo dõi* |
| 6 | Xóa mục trong `Nhóm vị trí`/`Chức danh` bị **chặn** nếu đang có vị trí công việc sử dụng |
| 7 | Vị trí công việc hiển thị trên **thông tin người dùng ở mọi ứng dụng AMIS** — đổi tên vị trí sẽ **cập nhật đồng loạt** |

---

## 6. QUY ĐỊNH NHẬP LIỆU ÁP DỤNG

> Kế thừa [01-thong-tin-cong-ty.md](01-thong-tin-cong-ty.md) §5. Dưới đây là phần **riêng** của màn hình này.

### 6.1. TEXT — chữ

| Trường | Quy định riêng |
|---|---|
| `position_code` | Chỉ `A–Z`, `0–9`, `_`, `-`. **Chặn khoảng trắng ngay khi gõ**. Tự viết HOA khi rời ô. Kiểm tra trùng qua API (debounce `500ms`) → lỗi `E202` |
| `position_name` | Cho tiếng Việt có dấu; `trim()` 2 đầu; gộp khoảng trắng thừa; 2–255 ký tự |

### 6.2. NUM — số
Màn hình này **không có trường nhập số**. Số duy nhất là **phần đuôi mã tự sinh** (`VT000001`) do hệ thống quản lý, người dùng không nhập riêng.

### 6.3. SELECT — chọn một

| Trường | Quy định riêng |
|---|---|
| `position_group_id` | 8 giá trị mặc định, **danh mục động** (thêm/sửa/xóa qua Modal C). Có mục *"-- Chọn --"*. Mục đã xóa → bản ghi cũ hiện giá trị cũ dạng chữ xám |
| `job_title_id` | 8 giá trị mặc định theo **thứ bậc**, **không sắp A–Z**. Có mục *"-- Chọn --"* |

### 6.4. MULTI — chọn nhiều
`org_unit_ids` — dạng **chip**, chi tiết §3.3.

**Quy tắc chọn dạng MULTI cho toàn bộ ứng dụng** *(chốt từ TM-HT-02 §3.4)*:

| Điều kiện | Dạng hiển thị | Ví dụ |
|---|---|---|
| ≤ 8 giá trị, **cố định** | **Checkbox group** | `Lĩnh vực hoạt động` (TM-HT-02) |
| > 8 giá trị **hoặc danh mục động** | **Dropdown + chip** | `Đơn vị công tác` (màn này) |

### 6.5. CHECK
`is_inactive` — hộp kiểm đơn, mặc định **bỏ chọn** (= Đang theo dõi).

---

## 7. KIỂM TRA HỢP LỆ & THÔNG BÁO

### 7.1. Bộ mã lỗi

| Mã | Tình huống | Nội dung hiển thị |
|---|---|---|
| `E201` | Bỏ trống bắt buộc | *"{Tên trường} không được để trống."* |
| `E202` | Mã vị trí trùng | *"Mã vị trí đã tồn tại. Vui lòng nhập mã khác."* |
| `E203` | Chưa chọn đơn vị công tác | *"Vui lòng chọn ít nhất một đơn vị công tác."* |
| `E204` | Mã vị trí sai định dạng | *"Mã vị trí chỉ gồm chữ, số, dấu gạch dưới và gạch ngang."* |
| `E205` | Tên vị trí quá dài | *"Tên vị trí tối đa 255 ký tự."* |
| `E206` | Xóa vị trí đã gán người dùng | *"Vị trí đang được gán cho {n} người dùng, không thể xóa. Bạn có thể chọn Ngừng theo dõi."* |
| `E207` | Xóa mục danh mục đang dùng | *"{Nhóm vị trí/Chức danh} này đang được {n} vị trí công việc sử dụng, không thể xóa."* |
| `E208` | Tên mục danh mục trùng | *"Tên đã tồn tại trong danh sách."* |

**Hiển thị:** viền ô đỏ + dòng lỗi `12px --danger` ngay dưới ô. Lỗi chặn nghiệp vụ (`E206`, `E207`) → **modal** hoặc **toast đỏ**.

### 7.2. Thông báo thành công
- Thêm: *"Thêm vị trí công việc thành công."*
- Sửa: *"Cập nhật vị trí công việc thành công."*
- Xóa: *"Xóa vị trí công việc thành công."*
- Hàng loạt: *"Đã cập nhật {n} vị trí công việc."*

Toast xanh, góc trên–phải, tự tắt sau **3 giây**.

---

## 8. API

```http
GET    /api/v1/system/job-positions?q=&status=&page=&size=   → danh sách + phân trang
GET    /api/v1/system/job-positions/:id                      → chi tiết
POST   /api/v1/system/job-positions                          → thêm mới
PUT    /api/v1/system/job-positions/:id                      → cập nhật
DELETE /api/v1/system/job-positions/:id                      → xóa
PATCH  /api/v1/system/job-positions/bulk-status              → { ids[], isInactive }
GET    /api/v1/system/job-positions/next-code                → sinh mã VT######
GET    /api/v1/system/job-positions/check-code?code=         → kiểm tra trùng

GET    /api/v1/system/position-groups                        → danh mục Nhóm vị trí
POST   /api/v1/system/position-groups
PUT    /api/v1/system/position-groups/:id
DELETE /api/v1/system/position-groups/:id
GET    /api/v1/system/job-titles                             → danh mục Chức danh
POST   /api/v1/system/job-titles
PUT    /api/v1/system/job-titles/:id
DELETE /api/v1/system/job-titles/:id
```

**Payload mẫu `POST`:**
```json
{
  "position_code": "NVMH",
  "position_name": "Nhân viên mua hàng",
  "org_unit_ids": ["uuid-cong-ty-net-viet", "uuid-chi-nhanh-hcm"],
  "position_group_id": "uuid-nhom-kinh-doanh",
  "job_title_id": "uuid-chuc-danh-nhan-vien",
  "is_inactive": false
}
```

**Response danh sách:**
```json
{
  "data": [
    { "id": "...", "position_code": "COO", "position_name": "Giám đốc điều hành",
      "org_units": [], "position_group": null, "job_title": null, "is_inactive": false }
  ],
  "meta": { "total": 15, "page": 1, "size": 20 }
}
```

**Mã lỗi HTTP:** `400` sai định dạng · `403` không có quyền · `409` trùng mã / đang được sử dụng · `422` thiếu trường bắt buộc.

---

## 9. GHI NHẬN NHẬT KÝ (AUDIT)

| `action` | Khi nào |
|---|---|
| `CREATE_JOB_POSITION` | Thêm vị trí |
| `UPDATE_JOB_POSITION` | Sửa (ghi `before`/`after` **chỉ trường thay đổi**) |
| `DELETE_JOB_POSITION` | Xóa vị trí |
| `TOGGLE_JOB_POSITION_STATUS` | Đổi trạng thái (đơn lẻ hoặc hàng loạt — ghi số lượng) |
| `UPDATE_POSITION_GROUP` / `UPDATE_JOB_TITLE` | Thêm/sửa/xóa mục danh mục phụ |

Xem tại **Hệ thống → Nhật ký hoạt động**.

---

## 10. CHECKLIST NGHIỆM THU

**Danh sách (Màn hình A)**
- [ ] Hiển thị đúng 7 cột; ô trống hiện `- -` màu xám
- [ ] Badge **Đang theo dõi** viền xanh lá đúng mẫu; **Ngừng theo dõi** xám
- [ ] Tìm kiếm theo **mã · tên vị trí · đơn vị** đều ra kết quả
- [ ] Lọc Trạng thái = *Ngừng theo dõi* → chỉ hiện vị trí đã ngừng
- [ ] Checkbox **chọn tất cả** ở header hoạt động; trạng thái nửa chọn đúng
- [ ] Chọn ≥ 1 dòng → hiện thanh thao tác hàng loạt kèm số lượng
- [ ] Phân trang: đổi *Số dòng/trang* → về trang 1; nút biên bị disable đúng
- [ ] `Tổng số` khớp số bản ghi sau khi lọc
- [ ] Tùy chỉnh cột lưu lại sau khi tải lại trang
- [ ] Cột **Mã vị trí** ghim trái khi cuộn ngang

**Form (Màn hình B)**
- [ ] Mở Thêm mới → `Mã vị trí` **tự sinh** dạng `VT000001`, sửa được
- [ ] Nhập mã trùng → lỗi `E202`; nhập khoảng trắng → bị chặn khi gõ
- [ ] `Đơn vị công tác`: chọn nhiều đơn vị → hiện nhiều chip, chip xuống dòng khi tràn
- [ ] Gỡ chip bằng nút `✕` và bằng phím `Backspace`
- [ ] Bỏ trống `Đơn vị công tác` → lỗi `E203`
- [ ] Đơn vị đã Ngừng theo dõi **không xuất hiện** trong dropdown chọn
- [ ] `Nhóm vị trí` / `Chức danh` để trống vẫn lưu được
- [ ] **Hủy** khi có thay đổi → hộp xác nhận; nút **←** hành xử giống Hủy
- [ ] Lưu thành công → toast xanh + quay lại danh sách + dòng mới hiển thị đúng

**Modal danh mục phụ (Màn hình C)**
- [ ] Nút `⋮` cạnh `Nhóm vị trí` mở modal **Nhóm vị trí** (8 mục mặc định)
- [ ] Nút `⋮` cạnh `Chức danh` mở modal **Chức danh** (8 mục, đúng thứ bậc, **không** sắp A–Z)
- [ ] Chọn radio trong modal → giá trị áp vào ô select ở màn B
- [ ] ✏ Sửa tên inline: `Enter` lưu, `Esc` hủy; tên trùng → `E208`
- [ ] 🗑 Xóa mục **đang được sử dụng** → chặn, lỗi `E207`
- [ ] Đóng bằng `✕` → **không áp** thay đổi lựa chọn

**Nghiệp vụ**
- [ ] Xóa vị trí **đã gán người dùng** → `E206`, gợi ý Ngừng theo dõi
- [ ] Vị trí Ngừng theo dõi **không hiện** khi gán cho người dùng mới
- [ ] Đổi tên vị trí → cập nhật hiển thị ở thông tin người dùng
- [ ] Nhật ký hoạt động ghi đúng `action` và trường thay đổi
- [ ] Màn hình `< 1280px` → 2 cột xếp chồng, không vỡ layout

---

## PHỤ LỤC A — Tóm tắt trường theo kiểu nhập

| Kiểu | Số trường | Danh sách |
|---|:--:|---|
| **TEXT** | 2 | `position_code`* · `position_name`* |
| **NUM** | 0 | *(không có)* |
| **SELECT** | 2 | `position_group_id` · `job_title_id` |
| **MULTI** | 1 | `org_unit_ids`* *(dropdown + chip)* |
| **CHECK** | 1 | `is_inactive` |

`*` = bắt buộc · **Tổng: 6 trường**, trong đó **3 bắt buộc**.

## PHỤ LỤC B — Điểm cần xác nhận với nghiệp vụ

| # | Vấn đề | Ghi nhận |
|---|---|---|
| 1 | **Vị trí điều khiển Trạng thái trong form** | Ảnh form bị cắt dưới phần `Chức danh`, chưa quan sát được. Tài liệu hướng dẫn có nêu trường *Trạng thái (Đang theo dõi/Ngừng theo dõi)* → đặc tả tạm theo mẫu checkbox `Ngừng theo dõi` của TM-HT-02 |
| 2 | **Nút đáy Modal C** | Chưa quan sát được (ảnh cắt). Giả định có *+ Thêm mới* và cặp *Hủy / Đồng ý* |
| 3 | Dropdown `▾` cạnh **Thêm vị trí** | Chưa rõ mục con (giả định *Nhập khẩu từ Excel*) |
| 4 | Cột **Đơn vị** khi có nhiều đơn vị | Dữ liệu mẫu đều trống (`- -`), chưa thấy cách hiển thị nhiều đơn vị → đề xuất *"{đơn vị đầu} +N"* |
| 5 | Vị trí mặc định của hệ thống | 15 bản ghi mẫu (COO, CSKH, GĐ…) — chưa rõ có phải dữ liệu khởi tạo sẵn và có được xóa không |

## PHỤ LỤC C — Tổng hợp điểm KHÔNG THỐNG NHẤT toàn bộ ứng dụng

> Cập nhật dần qua các màn hình. Cần chốt để đồng bộ trước khi code.

| # | Hạng mục | TM-HT-01 | TM-HT-02 | TM-HT-03 | Đề xuất |
|---|---|---|---|---|---|
| 1 | Nhãn nút hủy | *Hủy* | *Hủy bỏ* | *Hủy* | **Hủy** |
| 2 | Ký tự ô trống | — | `-` | `- -` | **`-`** |
| 3 | Kiểu badge trạng thái | — | Nền xanh dương đặc | Viền xanh lá, nền nhạt | **Chốt 1 kiểu** |
| 4 | Nhãn trạng thái | — | *Đang theo dõi* / app tiêu thụ ghi *Đang hoạt động* | *Đang theo dõi* | **Đang theo dõi / Ngừng theo dõi** |
| 5 | Nhãn trường đơn vị cha | — | *Thuộc đơn vị* (Thêm) vs *Thuộc phòng ban* (Sửa) | — | **Thuộc đơn vị** |
