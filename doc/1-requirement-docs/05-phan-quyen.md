# TM-HT-05 · ĐẶC TẢ MÀN HÌNH — PHÂN QUYỀN

> 🎨 **GIAO DIỆN — bắt buộc đọc trước khi code:** bám theo **[00-he-thong-thiet-ke-giao-dien.md](00-he-thong-thiet-ke-giao-dien.md)** (UI Kit).
> Dùng: `.tabs` · `.data-table` (bảng lồng — ô Họ và tên/Nhóm `rowspan`) · **drawer** `.drawer` (panel chi tiết ứng dụng/nhóm, §6.2) · **modal gán quyền** `.modal` + `.ctx-card` + các dòng vai trò (§6.3).
> Màn Thêm/Sửa vai trò dùng: **cây phân quyền** `.perm-tree` (checkbox + `.perm-level` dropdown mức quyền, ghi chú cam `.perm-warn`, §7.4). Nút Hủy/Lưu ở footer dính đáy.
> Danh sách vai trò trong modal **lấy động theo ứng dụng** — không hard-code. Nhãn nút & badge theo §9 UI Kit.

> **Ứng dụng:** Hệ thống · **Phân hệ:** Phân quyền
> **Mã màn hình:** `SYS-AUTHORIZATION` · **Phiên bản:** v1.0 · **Ngày lập:** 24/07/2026
> **Thuộc bộ:** Đặc tả Công cụ Thu mua DEGO · **Kế thừa quy ước:** [01](01-thong-tin-cong-ty.md) §3, §5 · [02](02-co-cau-to-chuc.md) §2.4 · [03](03-vi-tri-cong-viec.md) §2.7, §4 · [04](04-nguoi-dung-nhan-vien.md) §3.4

---

## MỤC LỤC

1. [Tổng quan & mô hình phân quyền](#1-tổng-quan--mô-hình-phân-quyền)
2. [Hai vai trò hệ thống](#2-hai-vai-trò-hệ-thống)
3. [Màn hình A — Quản trị hệ thống](#3-màn-hình-a--quản-trị-hệ-thống)
4. [Màn hình B — Vai trò](#4-màn-hình-b--vai-trò)
5. [Màn hình C — Thêm / Sửa vai trò](#5-màn-hình-c--thêm--sửa-vai-trò)
6. [Màn hình D — Ứng dụng](#6-màn-hình-d--ứng-dụng)
7. [Màn hình E — Nhóm](#7-màn-hình-e--nhóm)
8. [Modal gán quyền dùng chung](#8-modal-gán-quyền-dùng-chung)
9. [Quy định nhập liệu](#9-quy-định-nhập-liệu)
10. [Quy tắc nghiệp vụ](#10-quy-tắc-nghiệp-vụ)
11. [Kiểm tra hợp lệ & thông báo](#11-kiểm-tra-hợp-lệ--thông-báo)
12. [API](#12-api)
13. [Audit](#13-audit)
14. [Checklist nghiệm thu](#14-checklist-nghiệm-thu)

---

## 1. TỔNG QUAN & MÔ HÌNH PHÂN QUYỀN

### 1.1. Mục đích
Cấp quyền truy cập ứng dụng cho người dùng — **theo từng người** hoặc **theo nhóm** — kèm **vai trò** và **phạm vi dữ liệu** trong ứng dụng đó.

### 1.2. Công thức quyền

> **Quyền hiệu lực = VAI TRÒ (làm được gì) × PHẠM VI DỮ LIỆU (trên dữ liệu nào)**

Mỗi dòng phân quyền luôn gồm **một cặp**:

| Thành phần | Ý nghĩa | Kiểu |
|---|---|---|
| **Vai trò** | Bộ quyền chức năng trong ứng dụng | SELECT |
| **Được quyền truy cập dữ liệu** | Đơn vị dữ liệu được phép thấy | **MULTI (chip)** |

### 1.3. Hai con đường gán quyền

```
        ┌──────────────────────────────────────────────────┐
        │              NGƯỜI DÙNG                          │
        └───────┬──────────────────────────┬───────────────┘
                │ ① Gán TRỰC TIẾP          │ ② Gán qua NHÓM
                ▼                          ▼
        ┌───────────────┐          ┌───────────────┐
        │  ỨNG DỤNG     │◄─────────│    NHÓM       │
        │  + Vai trò    │  gán cho │  + Vai trò    │
        │  + Phạm vi DL │  cả nhóm │  + Phạm vi DL │
        └───────────────┘          └───────────────┘

   Quyền cuối cùng = HỢP (union) của quyền trực tiếp và quyền kế thừa từ mọi nhóm
```

> **Nguyên tắc cộng dồn:** một người có thể nhận quyền từ **nhiều nguồn** (trực tiếp + nhiều nhóm). Hệ thống lấy **hợp** của tất cả — quyền rộng nhất thắng. *(Suy luận từ dữ liệu mẫu — cần xác nhận, xem §15.)*

### 1.4. Bốn khu vực trong phân hệ

| Mã | Khu vực | Chức năng |
|---|---|---|
| `A` | **Quản trị hệ thống** | Danh sách người giữ vai trò quản trị (tab *Người dùng* \| *Vai trò*) |
| `B` | **Vai trò** | Danh mục vai trò truy cập AMIS Hệ thống |
| `C` | **Thêm / Sửa vai trò** | Form cây phân quyền phân hệ |
| `D` | **Ứng dụng** | 30 ứng dụng → gán người dùng / nhóm vào từng ứng dụng |
| `E` | **Nhóm** | Quản lý nhóm → gán ứng dụng / người dùng cho nhóm |

---

## 2. HAI VAI TRÒ HỆ THỐNG

| Tiêu chí | **Quản trị hệ thống** | **Quản trị bảo mật** |
|---|---|---|
| **Đối tượng thường giao** | Chủ doanh nghiệp | Bộ phận IT |
| **Mục đích chính** | Quản lý tổng thể hệ thống & dữ liệu doanh nghiệp | Hỗ trợ phân quyền sử dụng ứng dụng cho thành viên |
| **Phân hệ được truy cập** | **Toàn bộ**: Thông tin công ty · Quản lý danh mục · Phân quyền · Tình hình sử dụng · Cấu hình mail server · Bảo mật nâng cao · Nhật ký hoạt động · Thùng rác | **Toàn bộ**, **NHƯNG không truy cập được mục *Quản trị hệ thống*** trong phân hệ Phân quyền |
| **Quyền trên ứng dụng AMIS khác** | **Mặc định quản trị toàn bộ** mọi ứng dụng | **Chỉ khi được phân cụ thể** — không mặc định |
| **Cấp được quyền Quản trị hệ thống cho người khác** | ✅ **Có** | ❌ **Không** |

> ⚠️ **Quy tắc chốt:** **CHỈ Quản trị hệ thống** mới cấp được vai trò **Quản trị hệ thống** cho người khác.

### 2.1. Vai trò đặc biệt — Quản trị ứng dụng

| Đặc điểm | Mô tả |
|---|---|
| Nguồn | **Hệ thống tự sinh** cho mỗi ứng dụng (VD *Quản trị ứng dụng Văn thư*) |
| Tạo mới | ❌ **Không tạo được** |
| Sửa / Xóa | ❌ **Không** |
| Hiển thị | Xuất hiện trong dropdown **Vai trò** khi gán người dùng vào ứng dụng |

### 2.2. Ví dụ minh họa
> Công ty dùng 3 ứng dụng: Công việc, Tuyển dụng, Phòng họp.
> Phân quyền người dùng A là **Quản trị hệ thống** → A **tự động** có quyền quản trị **cả 3** ứng dụng.

---

## 3. MÀN HÌNH A — QUẢN TRỊ HỆ THỐNG

### 3.1. Bố cục

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Phân quyền                                                                      │
│  ┌──────────┐                                                                    │
│  │Người dùng│  Vai trò                                        ← 2 TAB            │
│  └━━━━━━━━━━┘                                                                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [🔍 Tìm kiếm quản trị hệ thống]  Vai trò [Tất cả ▾]              [ + Thêm mới ] │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Mã NV │Họ và tên│SĐT TK│Email tài khoản│Đơn vị công tác│Vị trí CV│Vai trò│Trạng thái TK│
├──────────────────────────────────────────────────────────────────────────────────┤
│NV000001│(JL) Jean Luc│  │pjeanluc211@…│CÔNG TY TNHH NÉT VIỆT│ │Quản trị hệ thống│[Đang hoạt động]│
├──────────────────────────────────────────────────────────────────────────────────┤
│ Tổng số bản ghi: 1        Số dòng/trang [20 ▾]  1 - 1   |◀ ◀ ▶ ▶|               │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Đặc tả cột (tab Người dùng)

| # | Cột | Kiểu | Rộng | Định dạng |
|---|---|---|---|---|
| 1 | **Mã nhân viên** | TEXT | `170px` | VD `NV000001` |
| 2 | **Họ và tên** | AVATAR + TEXT | `300px` | Avatar tròn + tên — chuẩn [04](04-nguoi-dung-nhan-vien.md) §3.4 |
| 3 | **SĐT tài khoản** | TEXT | `195px` | Trống → `- -` |
| 4 | **Email tài khoản** | TEXT | `230px` | Email đăng nhập |
| 5 | **Đơn vị công tác** | TEXT | `225px` | Từ Cơ cấu tổ chức |
| 6 | **Vị trí công việc** | TEXT | `195px` | Từ danh mục Vị trí công việc |
| 7 | **Vai trò** | **LINK** | `200px` | Chữ màu `--primary`, **bấm được** → mở sửa vai trò |
| 8 | **Trạng thái tài khoản** | BADGE | `160px` | Nền `#EAF7EF` · chữ `#16A34A` |

### 3.3. Thanh công cụ

| Điều khiển | Hành vi |
|---|---|
| **🔍 Tìm kiếm** | Placeholder *"Tìm kiếm quản trị hệ thống"* — tìm theo mã NV, tên, email |
| **Vai trò** | SELECT: `Tất cả` · `Quản trị hệ thống` · `Quản trị bảo mật` |
| **+ Thêm mới** | Mở modal chọn người dùng → gán vai trò quản trị |

### 3.4. Luồng thêm người quản trị

```
[+ Thêm mới] → Modal chọn người dùng (checkbox, có tìm kiếm)
             → Tích chọn người dùng
             → Chọn vai trò (Quản trị hệ thống / Quản trị bảo mật)
             → [Lưu] → toast → danh sách cập nhật
```

> ⚠️ Nếu người thao tác là **Quản trị bảo mật** → **ẩn hoàn toàn** khu vực này (không truy cập được mục *Quản trị hệ thống*).

---

## 4. MÀN HÌNH B — VAI TRÒ

### 4.1. Bố cục

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Phân quyền        Người dùng │ ┌────────┐                                       │
│                               │ │Vai trò │                                       │
│                               │ └━━━━━━━━┘                                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [🔍 Tìm kiếm vai trò]                                          [ + Thêm vai trò ]│
├──────────────────────────────────────────────────────────────────────────────────┤
│ Tên vai trò        │ Mô tả                                                        │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Quản trị bảo mật   │ Có quyền thực hiện các tính năng trên AMIS Hệ thống, nhưng  │
│                    │ không thể tự phân quyền truy cập ứng dụng cho mình và phân  │
│                    │ quyền người khác thành QTHT                                 │
│ Quản lý danh mục   │ Được thêm, sửa, xóa danh mục (Cơ cấu tổ chức, nhân viên…)   │
│                    │ nhưng không được thực hiện tính năng khác trên AMIS Hệ thống│
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2. Đặc tả cột

| # | Cột | Kiểu | Rộng | Định dạng |
|---|---|---|---|---|
| 1 | **Tên vai trò** | TEXT | `280px` | Chữ `13px --text` |
| 2 | **Mô tả** | TEXT | Còn lại | Cho **xuống dòng** (wrap), tối đa 2–3 dòng |

**Thao tác trên dòng:** hover → nút `⋮` với **Sửa** · **Nhân bản** ⓘ · **Xóa**.

---

## 5. MÀN HÌNH C — THÊM / SỬA VAI TRÒ

### 5.1. Bố cục

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ ← Thêm vai trò                                                                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│  Thông tin chung                                                                 │
│   Tên vai trò *  [__________________]    Mô tả  [___________________________]    │
├──────────────────────────────────────────────────────────────────────────────────┤
│  Phân quyền phân hệ                                                              │
│                                                                                  │
│   Thông tin công ty              [✓] Xem, Sửa      ▾                             │
│   ⌄ Quản lý danh mục                                                             │
│       Cơ cấu tổ chức             [✓] Toàn quyền    ▾                             │
│       Người dùng                 [✓] Toàn quyền    ▾                             │
│       …                                                                          │
│   ⌄ Phân quyền  (Người có quyền này chỉ được phân quyền truy cập cho người khác, │
│                  không được thêm, sửa quyền của chính mình)         ← ghi chú cam│
│       Ứng dụng, nhóm             [✓] Toàn quyền    ▾                             │
│       ⌄ Truy cập AMIS Hệ thống                                                   │
│           Người dùng             [ ] Chọn quyền    ▾                             │
│           Vai trò                [ ] Chọn quyền    ▾                             │
│   …                                                                              │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                        [ Hủy ]  [ Lưu ]          │
└──────────────────────────────────────────────────────────────────────────────────┘
```

> **Lưu ý bố cục:** cặp nút **Hủy / Lưu** nằm ở **thanh dính đáy trang** (sticky footer), **không** ở góc trên–phải như các màn hình khác trong bộ. → Bổ sung vào bảng không thống nhất (§16).

### 5.2. Trường Thông tin chung

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|:--:|---|
| `role_name` | Tên vai trò | TEXT | ✅ | 2–150 ký tự · **duy nhất** · placeholder *Nhập tên vai trò* |
| `description` | Mô tả | TEXTAREA | ✖ | ≤ 500 ký tự · cao tối thiểu `88px` · placeholder *Nhập mô tả* |

### 5.3. Cây phân quyền phân hệ

**Cấu trúc quan sát được:**

```
Thông tin công ty
Quản lý danh mục
  ├─ Cơ cấu tổ chức          ├─ Vật tư hàng hóa
  ├─ Người dùng              ├─ Nhóm vật tư hàng hóa
  ├─ Nhân viên               ├─ Kho hàng
  ├─ Vị trí công việc        ├─ Chờ duyệt
  ├─ Khách hàng              ├─ Nhà cung cấp
  ├─ Nhóm khách hàng         └─ Nhóm nhà cung cấp
Phân quyền                          ⚠ có ghi chú cảnh báo
  ├─ Ứng dụng, nhóm
  └─ Truy cập AMIS Hệ thống
       ├─ Người dùng
       └─ Vai trò
Tình hình sử dụng
Cấu hình mail server
Bảo mật nâng cao
Thiết lập chung
Nhật ký hoạt động
Thùng rác
  ├─ Cơ cấu tổ chức    ├─ Nhân viên
  ├─ Vị trí công việc  └─ Người dùng
```

> 💡 **Liên quan Thu mua:** các mục **Vật tư hàng hóa · Nhóm vật tư hàng hóa · Kho hàng · Nhà cung cấp · Nhóm nhà cung cấp · Chờ duyệt** chính là danh mục nền cho nghiệp vụ mua hàng.

### 5.4. Đặc tả một dòng quyền

```
      [✓]  Toàn quyền  ▾
       │        │
   checkbox   dropdown mức quyền
```

| Thành phần | Đặc tả |
|---|---|
| **Checkbox** | `16×16px` · bo `3px` · chọn → nền `--primary` + ✓ trắng |
| **Dropdown mức quyền** | Chữ `13px --text` + icon `▾`; **disable/mờ** khi checkbox chưa tích, hiện chữ **"Chọn quyền"** màu `#9CA3AF` |
| **Nhãn phân hệ** | `13px --text`, thụt lề `24px`/cấp |
| **Node cha** | Có icon `⌄`/`›` bung–thu; tích cha → **tích toàn bộ con**; con tích một phần → cha ở trạng thái **nửa chọn** |
| **Ghi chú cảnh báo** | Chữ `12px` màu **cam `#E8A317`**, đặt **cùng hàng** với nhãn node cha, trong ngoặc đơn |

### 5.5. Mức quyền

| Giá trị | Ý nghĩa | Ghi chú |
|---|---|---|
| **Chọn quyền** | *(chưa tích)* — chưa cấp quyền nào | Trạng thái mặc định |
| **Xem** | Chỉ đọc | |
| **Xem, Sửa** | Đọc + sửa | Quan sát ở *Thông tin công ty* |
| **Toàn quyền** | Thêm · Sửa · Xóa · Xem | Quan sát ở hầu hết danh mục |

> ⓘ Danh sách mức quyền đầy đủ theo từng phân hệ **chưa quan sát được hết** (dropdown chưa mở) — cần xác nhận, xem §15.

### 5.6. Ghi chú cảnh báo phân hệ Phân quyền

> *"Người có quyền này chỉ được phân quyền truy cập cho người khác, **không được thêm, sửa quyền của chính mình**."*

**Hệ quả kỹ thuật — bắt buộc kiểm tra ở backend:**
```
IF  target_user_id == current_user_id
AND permission_scope IN ('Phân quyền', 'Truy cập AMIS Hệ thống')
THEN  từ chối (403) — chống tự nâng quyền (privilege escalation)
```

---

## 6. MÀN HÌNH D — ỨNG DỤNG

### 6.1. Danh sách ứng dụng

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Ứng dụng                                                                        │
│  [🔍 Tìm kiếm ứng dụng]                                                          │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Tên ứng dụng                    │ Đối tượng sử dụng          │ Trạng thái sử dụng│
├──────────────────────────────────────────────────────────────────────────────────┤
│ 🟡 Kiến thức                    │ Tất cả người dùng          │ [Đang sử dụng]    │
│ 🟣 Phòng họp                    │ Người dùng được phân quyền │ [Đang sử dụng]    │
│ 🔵 Mua hàng                     │ Người dùng được phân quyền │ [Đang sử dụng]    │
│ 🟠 Văn thư                      │ Người dùng được phân quyền │ [Đang sử dụng]    │
│ 🟢 CRM                          │ Tất cả nhân viên           │ [Đang sử dụng]    │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Tổng số bản ghi: 30       Số dòng/trang [20 ▾]  1 - 20  |◀ ◀ ▶ ▶|                │
└──────────────────────────────────────────────────────────────────────────────────┘
```

| # | Cột | Kiểu | Định dạng |
|---|---|---|---|
| 1 | **Tên ứng dụng** | ICON + TEXT | Icon app `28×28px` bo `6px` + tên; cách `12px` |
| 2 | **Đối tượng sử dụng** | TEXT | 3 giá trị — xem §6.2 |
| 3 | **Trạng thái sử dụng** | BADGE | *Đang sử dụng*: nền `#EAF7EF` · chữ `#16A34A` |

### 6.2. Đối tượng sử dụng

| Giá trị | Ý nghĩa |
|---|---|
| **Tất cả người dùng** | Mọi người dùng đều vào được, **không cần phân quyền** |
| **Tất cả nhân viên** | Mọi đối tượng có `is_employee = true` |
| **Người dùng được phân quyền** | **Chỉ** người/nhóm được gán — phải cấu hình ở panel chi tiết |

### 6.3. Panel chi tiết ứng dụng

Bấm vào dòng ứng dụng → **panel trượt từ phải** (rộng ~`55%` màn hình):

```
┌────────────────────────────────────────────────────────────┐
│ 🟠  Văn thư ↗                                          ✕   │
│     Quản lý văn thư                                        │
│  👥 Đối tượng sử dụng · Người dùng được phân quyền         │
├────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐                                     │
│  │Người dùng sử dụng①│  Nhóm ②           ← 2 TAB có SỐ ĐẾM│
│  └━━━━━━━━━━━━━━━━━━━┘                                     │
├────────────────────────────────────────────────────────────┤
│ [🔍 Tìm kiếm nhanh trong danh sách]    [⇥] [+ Thêm người dùng]│
├────────────────────────────────────────────────────────────┤
│ ☐ │ Họ và tên      │ Vai trò              │ Được quyền truy cập DL│
├────────────────────────────────────────────────────────────┤
│ ☐ │(JL) Jean Luc   │ Quản trị hệ thống    │ CÔNG TY TNHH NÉT VIỆT │
│   │pjeanluc211@…   │ Quản trị ứng dụng VT │ CÔNG TY TNHH NÉT VIỆT │
├────────────────────────────────────────────────────────────┤
│ Tổng số bản ghi: 1   Số dòng/trang [20▾]  1-1  |◀ ◀ ▶ ▶|  │
└────────────────────────────────────────────────────────────┘
```

**Đặc tả header panel:**

| Thành phần | Định dạng |
|---|---|
| Icon ứng dụng | `44×44px`, bo `10px` |
| Tên ứng dụng | `20px/600 --text` + icon `↗` mở ứng dụng ở tab mới |
| Mô tả ứng dụng | `13px #6B7280` |
| Dòng đối tượng | Icon 👥 + *"Đối tượng sử dụng · {giá trị}"*, `13px #6B7280` |
| Nút đóng `✕` | Góc trên–phải `20px #6B7280` |

**Hai tab có số đếm:** nhãn tab kèm **badge số** tròn nền `#E9F3FF` chữ `--primary`.

### 6.4. Tab *Người dùng sử dụng*

| # | Cột | Định dạng |
|---|---|---|
| 0 | ☐ Chọn | Có chọn tất cả ở header |
| 1 | **Họ và tên** | Avatar + **tên đậm** trên, **email** `12px #6B7280` dưới |
| 2 | **Vai trò** | **Một người có thể có NHIỀU vai trò** → mỗi vai trò một dòng con, kẻ ngăn `1px #EEF1F5` |
| 3 | **Được quyền truy cập dữ liệu** | Tên đơn vị, khớp theo từng dòng vai trò |

> **Quan trọng:** cột Vai trò và Phạm vi dữ liệu là **bảng lồng** — một ô Họ và tên gộp (rowspan) nhiều dòng vai trò.

### 6.5. Tab *Nhóm*

| # | Cột | Định dạng |
|---|---|---|
| 1 | **Nhóm** | Tên nhóm; gộp ô (rowspan) khi nhóm có nhiều vai trò |
| 2 | **Vai trò** | Mỗi vai trò một dòng |
| 3 | **Được quyền truy cập dữ liệu** | Khớp theo dòng vai trò |

Nút hành động: **+ Thêm nhóm**.

---

## 7. MÀN HÌNH E — NHÓM

### 7.1. Danh sách nhóm

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Nhóm                                                                            │
│  [🔍 Tìm kiếm nhóm]                                            [ + Thêm nhóm ]  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Tên nhóm                                              │ Số lượng người dùng      │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Người dùng app Tuyển dụng                             │            0             │
│ Những người dùng được nhân sự mời vào Hội đồng tuyển dụng   ← mô tả dòng 2       │
│ Tất cả người dùng                                     │            1             │
│ Tất cả nhân viên                                      │            1             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

| # | Cột | Kiểu | Định dạng |
|---|---|---|---|
| 1 | **Tên nhóm** | TEXT 2 DÒNG | Dòng 1: tên `13px --text`. Dòng 2: **mô tả** `12px #9CA3AF` (ẩn nếu trống) |
| 2 | **Số lượng người dùng** | NUM | Canh **phải** hoặc giữa; số nguyên |

**Nhóm mặc định hệ thống:** `Tất cả người dùng` · `Tất cả nhân viên` — ⓘ *cần xác nhận có xóa/sửa được không*.

### 7.2. Modal Thêm nhóm

```
┌────────────────────────────────────────────────┐
│  Thêm nhóm                                ✕    │
│  Tạo nhóm mới để quản lý các nhóm người dùng   │
│  trong tổ chức                                 │
│                                                │
│  Tên nhóm *                                    │
│  [__________________________________________]  │
│                                                │
│  Mô tả                                         │
│  ┌──────────────────────────────────────────┐  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
├────────────────────────────────────────────────┤
│                            [ Hủy ]  [ Lưu ]    │
└────────────────────────────────────────────────┘
```

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|:--:|---|
| `group_name` | Tên nhóm | TEXT | ✅ | 2–150 ký tự · **duy nhất** · placeholder *Tên nhóm* |
| `group_description` | Mô tả | TEXTAREA | ✖ | ≤ 500 ký tự · cao `96px` · placeholder *Mô tả* |

> **Lưu ý định dạng:** nhãn `Tên nhóm*` — dấu `*` **dính liền** không có khoảng trắng, khác các màn khác (`Tên vai trò *`). → §16.

### 7.3. Panel chi tiết nhóm

Bấm vào nhóm → panel trượt phải, tiêu đề = **tên nhóm**, có **2 tab**:

| Tab | Cột | Nút |
|---|---|---|
| **Ứng dụng** | Ứng dụng (icon+tên) · Vai trò · Được quyền truy cập dữ liệu | **+ Thêm ứng dụng** |
| **Người dùng** | ☐ · Họ và tên (avatar + email) | **+ Thêm người dùng** · **⊞ Xuất khẩu** |

**Ví dụ dữ liệu tab Ứng dụng** (nhóm *Tất cả người dùng*):

| Ứng dụng | Vai trò | Được quyền truy cập dữ liệu |
|---|---|---|
| Chat | Người sử dụng ứng dụng Chat | *(trống)* |
| Mạng xã hội | Nhân viên | CÔNG TY TNHH NÉT VIỆT |
| Công việc | Thành viên | *(trống)* |

> **Nhận xét:** cột *Được quyền truy cập dữ liệu* **có thể trống** với ứng dụng không phân vùng dữ liệu (Chat, Công việc). → Trường này **bắt buộc theo từng ứng dụng**, không bắt buộc toàn cục. Cần xác nhận (§15).

---

## 8. MODAL GÁN QUYỀN DÙNG CHUNG

Bốn ngữ cảnh dùng **cùng một mẫu modal**:

| Ngữ cảnh | Tiêu đề modal | Khối thông tin đầu |
|---|---|---|
| Sửa quyền **người dùng** trong ứng dụng | *Chỉnh sửa thiết lập ứng dụng* | Thẻ **người dùng** (avatar + tên + email) |
| Sửa quyền **nhóm** trong ứng dụng | *Chỉnh sửa thiết lập ứng dụng* | Tên nhóm (VD *Tất cả nhân viên*) |
| Sửa **ứng dụng** của nhóm | *Sửa ứng dụng* | Thẻ **ứng dụng** (icon + tên + mô tả) |
| Thêm mới tương ứng | *Thêm …* | Như trên |

### 8.1. Bố cục

```
┌────────────────────────────────────────────────────────────────┐
│  Chỉnh sửa thiết lập ứng dụng                             ✕    │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ (JL)  Jean Luc                                           │  │ ← thẻ ngữ cảnh
│  │       pjeanluc211@gmail.com                              │  │   nền #EFF6FF
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Vai trò *                    Được quyền truy cập dữ liệu *    │
│  [Quản lý Văn thư        ▾]   [CÔNG TY TNHH NÉT VIỆT ✕ ]  [🗑] │
│                                                                │
│  Vai trò *                    Được quyền truy cập dữ liệu *    │
│  [Người xem Văn thư      ▾]   [Kế toán ✕               ]  [🗑] │
│                                                                │
│  + Thêm vai trò                                                │
├────────────────────────────────────────────────────────────────┤
│                                  [ Hủy ]  [ Lưu chỉnh sửa ]    │
└────────────────────────────────────────────────────────────────┘
```

### 8.2. Đặc tả

| Thành phần | Đặc tả |
|---|---|
| **Hộp modal** | Rộng `680px` · nền trắng · bo `8px` · bóng `0 8px 24px rgba(16,24,40,.12)` |
| **Thẻ ngữ cảnh** | Nền `#EFF6FF` · bo `8px` · đệm `16px` · avatar/icon `44px` + tên `16px/600` + phụ đề `13px #6B7280` |
| **Dòng vai trò** | 2 cột: `Vai trò` (SELECT) ~`50%` · `Được quyền truy cập dữ liệu` (MULTI chip) ~`45%` · nút `🗑` `5%` |
| **Nút 🗑 xóa dòng** | Icon `16px` màu `--danger`, chỉ hiện khi **có ≥ 2 dòng** ⓘ |
| **+ Thêm vai trò** | Link `13px --primary` + icon `+`, thêm một dòng vai trò trống |
| **Ngăn cách dòng** | Viền trên `1px #EEF1F5` giữa các dòng vai trò |

### 8.3. Trường trong modal

| Mã trường | Nhãn | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|:--:|---|
| `role_id` | Vai trò | SELECT | ✅ | Danh sách **lấy từ thiết lập Vai trò của ứng dụng tương ứng** |
| `data_scope_ids` | Được quyền truy cập dữ liệu | **MULTI (chip)** | ⚑ | Chọn từ cây Cơ cấu tổ chức. Bắt buộc **tùy ứng dụng** (§7.3) |

> ⚠️ **Quy tắc chốt:** *"Trường **Vai trò** dữ liệu được lấy lên từ thiết lập Vai trò trong ứng dụng tương ứng."* → Frontend **không hard-code** danh sách vai trò; luôn gọi API theo `app_id`.

**Chống trùng:** không cho chọn **cùng một vai trò 2 lần** trong một modal → lỗi `E505`.

---

## 9. QUY ĐỊNH NHẬP LIỆU

> Kế thừa [01](01-thong-tin-cong-ty.md) §5. Phần **riêng** của phân hệ này:

### 9.1. TEXT — chữ

| Trường | Quy định |
|---|---|
| `role_name` | 2–150 ký tự · **duy nhất** · `trim()` · gộp khoảng trắng thừa · kiểm tra trùng khi rời ô |
| `group_name` | 2–150 ký tự · **duy nhất** · như trên |

### 9.2. TEXTAREA
`description`, `group_description`: ≤ 500 ký tự · cho xuống dòng · hiện bộ đếm khi còn < 50 ký tự.

### 9.3. NUM — số
Phân hệ này **không có trường nhập số**. Cột *Số lượng người dùng* là **số tính toán, chỉ đọc**.

### 9.4. SELECT — chọn một

| Trường | Quy định |
|---|---|
| `role_id` (trong modal) | **Nguồn động theo ứng dụng** — gọi `GET /apps/:appId/roles`. Có tìm kiếm khi > 10 mục. **Không** có mục rỗng (bắt buộc) |
| Lọc `Vai trò` (màn A) | `Tất cả` · `Quản trị hệ thống` · `Quản trị bảo mật` |
| Mức quyền (màn C) | Disable khi checkbox chưa tích; hiện *"Chọn quyền"* |

### 9.5. MULTI — chọn nhiều

`data_scope_ids` — **dropdown + chip**, đúng chuẩn [03](03-vi-tri-cong-viec.md) §3.3:

| Thuộc tính | Giá trị |
|---|---|
| Nguồn | Cây **Cơ cấu tổ chức** ([TM-HT-02](02-co-cau-to-chuc.md)), dropdown dạng cây, có tìm kiếm |
| Chip | Nền `#F1F3F6` · viền `1px #E1E5EA` · bo `4px` · chữ `13px` · nút `✕` `12px #6B7280` |
| Số lượng | ≥ 1 nếu ứng dụng yêu cầu phân vùng dữ liệu; **cho phép trống** với ứng dụng không phân vùng |
| Trùng lặp | Đơn vị đã chọn bị ẩn/mờ trong dropdown |
| Xóa nhanh | `Backspace` ở ô rỗng → gỡ chip cuối |

### 9.6. CHECKBOX — cây phân quyền (màn C)

| Quy tắc | Chi tiết |
|---|---|
| Tích node **cha** | Tự tích **toàn bộ node con** |
| Bỏ tích cha | Bỏ tích **toàn bộ con** |
| Con tích một phần | Cha hiển thị trạng thái **nửa chọn** (indeterminate) |
| Chưa tích | Dropdown mức quyền **disable**, hiện *"Chọn quyền"* |
| Đã tích | Dropdown bật, **mặc định** mức quyền thấp nhất (*Xem*) ⓘ |

---

## 10. QUY TẮC NGHIỆP VỤ

| # | Quy tắc |
|---|---|
| 1 | **Chỉ Quản trị hệ thống** cấp được vai trò **Quản trị hệ thống** cho người khác |
| 2 | **Quản trị bảo mật không truy cập được** mục *Quản trị hệ thống* trong phân hệ Phân quyền |
| 3 | **Quản trị hệ thống mặc định có quyền quản trị TOÀN BỘ** ứng dụng — không cần gán từng app |
| 4 | Vai trò **Quản trị ứng dụng** do hệ thống **tự sinh**, **không tạo / sửa / xóa được** |
| 5 | **Không ai được tự thêm/sửa quyền của chính mình** ở phân hệ Phân quyền (§5.6) |
| 6 | Danh sách **Vai trò** trong modal **lấy từ thiết lập vai trò của ứng dụng tương ứng** |
| 7 | Danh sách **Nhóm** khi gán chỉ gồm nhóm đã tạo ở phân hệ **Nhóm** |
| 8 | Ứng dụng có *Đối tượng sử dụng* = **Tất cả người dùng / Tất cả nhân viên** → **không cần** gán từng người |
| 9 | Quyền cuối cùng = **hợp** của quyền trực tiếp + quyền từ mọi nhóm (§1.3) |
| 10 | Xóa nhóm → **gỡ toàn bộ quyền kế thừa** của thành viên nhóm đó; phải cảnh báo số người ảnh hưởng |
| 11 | Gỡ người khỏi ứng dụng → người đó **mất quyền truy cập** ứng dụng ngay lần đăng nhập kế tiếp |

---

## 11. KIỂM TRA HỢP LỆ & THÔNG BÁO

### 11.1. Bộ mã lỗi

| Mã | Tình huống | Nội dung hiển thị |
|---|---|---|
| `E501` | Bỏ trống bắt buộc | *"{Tên trường} không được để trống."* |
| `E502` | Tên vai trò trùng | *"Tên vai trò đã tồn tại."* |
| `E503` | Tên nhóm trùng | *"Tên nhóm đã tồn tại."* |
| `E504` | Chưa chọn phạm vi dữ liệu | *"Vui lòng chọn phạm vi dữ liệu được truy cập."* |
| `E505` | Trùng vai trò trong một modal | *"Vai trò này đã được thêm. Vui lòng chọn vai trò khác."* |
| `E506` | Không đủ quyền cấp QTHT | *"Chỉ Quản trị hệ thống mới có quyền phân quyền vai trò Quản trị hệ thống."* |
| `E507` | Tự sửa quyền của chính mình | *"Bạn không được thêm, sửa quyền của chính mình."* |
| `E508` | Sửa/xóa vai trò hệ thống | *"Không thể sửa hoặc xóa vai trò do hệ thống tạo."* |
| `E509` | Xóa vai trò đang được sử dụng | *"Vai trò đang được {n} người dùng/nhóm sử dụng, không thể xóa."* |
| `E510` | Xóa nhóm còn thành viên | *"Nhóm đang có {n} người dùng. Xóa nhóm sẽ gỡ toàn bộ quyền kế thừa. Bạn có chắc chắn?"* |
| `E511` | Vai trò chưa cấu hình quyền nào | *"Vui lòng chọn ít nhất một quyền cho vai trò."* |

### 11.2. Thông báo thành công
- Thêm vai trò: *"Thêm vai trò thành công."*
- Thêm nhóm: *"Thêm nhóm thành công."*
- Gán quyền: *"Phân quyền thành công."*
- Sửa quyền: *"Cập nhật phân quyền thành công."*
- Gỡ quyền: *"Đã gỡ quyền truy cập."*

Toast xanh, góc trên–phải, tự tắt sau **3 giây**.

---

## 12. API

```http
# Quản trị hệ thống
GET    /api/v1/system/admins?q=&role=&page=&size=
POST   /api/v1/system/admins                    { userIds[], role }
DELETE /api/v1/system/admins/:userId

# Vai trò AMIS Hệ thống
GET    /api/v1/system/roles?q=
GET    /api/v1/system/roles/:id
POST   /api/v1/system/roles                     { roleName, description, permissions[] }
PUT    /api/v1/system/roles/:id
DELETE /api/v1/system/roles/:id
GET    /api/v1/system/permission-tree            → cây phân hệ + mức quyền hợp lệ

# Ứng dụng
GET    /api/v1/system/apps?q=&page=&size=
GET    /api/v1/system/apps/:appId/roles          → vai trò CỦA ỨNG DỤNG (§8.3)
GET    /api/v1/system/apps/:appId/users
POST   /api/v1/system/apps/:appId/users          { userIds[], assignments[] }
PUT    /api/v1/system/apps/:appId/users/:userId  { assignments[] }
DELETE /api/v1/system/apps/:appId/users/:userId
GET    /api/v1/system/apps/:appId/groups
POST   /api/v1/system/apps/:appId/groups
PUT    /api/v1/system/apps/:appId/groups/:groupId
DELETE /api/v1/system/apps/:appId/groups/:groupId

# Nhóm
GET    /api/v1/system/groups?q=
POST   /api/v1/system/groups                    { groupName, description }
PUT    /api/v1/system/groups/:id
DELETE /api/v1/system/groups/:id
GET    /api/v1/system/groups/:id/users
POST   /api/v1/system/groups/:id/users          { userIds[] }
DELETE /api/v1/system/groups/:id/users/:userId
GET    /api/v1/system/groups/:id/apps
POST   /api/v1/system/groups/:id/apps           { appId, assignments[] }
PUT    /api/v1/system/groups/:id/apps/:appId
DELETE /api/v1/system/groups/:id/apps/:appId
GET    /api/v1/system/groups/:id/users/export
```

**Payload gán quyền (dùng chung):**
```json
{
  "assignments": [
    { "role_id": "uuid-quan-ly-van-thu",  "data_scope_ids": ["uuid-cong-ty-net-viet"] },
    { "role_id": "uuid-nguoi-xem-van-thu","data_scope_ids": ["uuid-phong-ke-toan"] }
  ]
}
```

**Payload tạo vai trò:**
```json
{
  "role_name": "Quản lý danh mục",
  "description": "Được thêm, sửa, xóa danh mục...",
  "permissions": [
    { "module_key": "catalog.org_unit",    "level": "FULL" },
    { "module_key": "catalog.job_position","level": "FULL" },
    { "module_key": "company_info",        "level": "VIEW_EDIT" }
  ]
}
```

**Mã lỗi HTTP:** `400` sai định dạng · `403` không đủ quyền / tự nâng quyền · `409` trùng tên / đang được sử dụng · `422` thiếu trường bắt buộc.

---

## 13. AUDIT

> ⚠️ Đây là phân hệ **nhạy cảm nhất** — mọi thao tác **bắt buộc ghi log**, kể cả **xem**.

| `action` | Khi nào |
|---|---|
| `GRANT_SYSTEM_ADMIN` / `REVOKE_SYSTEM_ADMIN` | Cấp / thu hồi vai trò quản trị |
| `CREATE_ROLE` / `UPDATE_ROLE` / `DELETE_ROLE` | Thao tác vai trò (ghi **toàn bộ cây quyền** trước–sau) |
| `CREATE_GROUP` / `UPDATE_GROUP` / `DELETE_GROUP` | Thao tác nhóm |
| `ADD_USER_TO_GROUP` / `REMOVE_USER_FROM_GROUP` | Thành viên nhóm |
| `GRANT_APP_ACCESS` / `UPDATE_APP_ACCESS` / `REVOKE_APP_ACCESS` | Quyền ứng dụng (ghi `app_id`, `role_id`, `data_scope`) |
| `VIEW_AUTHORIZATION` | **Xem** danh sách phân quyền |
| `EXPORT_GROUP_USERS` | Xuất khẩu danh sách người dùng nhóm |

---

## 14. CHECKLIST NGHIỆM THU

**Quản trị hệ thống (Màn A)**
- [ ] Tài khoản **Quản trị bảo mật** đăng nhập → **không thấy** mục Quản trị hệ thống
- [ ] Chỉ **Quản trị hệ thống** mới gán được vai trò Quản trị hệ thống → sai quyền trả `E506`
- [ ] Cột **Vai trò** là link màu xanh, bấm được
- [ ] Lọc theo Vai trò hoạt động đúng

**Vai trò (Màn B, C)**
- [ ] Tạo vai trò: tên trùng → `E502`; không chọn quyền nào → `E511`
- [ ] Tích node **cha** → toàn bộ con được tích; bỏ tích cha → bỏ hết con
- [ ] Con tích một phần → cha ở trạng thái **nửa chọn**
- [ ] Checkbox chưa tích → dropdown mức quyền **disable** và hiện *"Chọn quyền"*
- [ ] Ghi chú cảnh báo phân hệ Phân quyền hiển thị **màu cam**, đúng nội dung
- [ ] **Không tự sửa được quyền của chính mình** → `E507` (kiểm tra ở **backend**, không chỉ ẩn nút)
- [ ] Vai trò **Quản trị ứng dụng** không xuất hiện trong danh sách tạo/sửa → `E508`
- [ ] Xóa vai trò đang dùng → `E509`
- [ ] Nút **Hủy / Lưu** nằm ở thanh dính đáy trang, luôn thấy khi cuộn

**Ứng dụng (Màn D)**
- [ ] Danh sách 30 ứng dụng, phân trang 20/trang
- [ ] Bấm dòng → panel trượt phải, header có icon, tên, mô tả, đối tượng sử dụng
- [ ] Tab hiển thị **số đếm** đúng (Người dùng sử dụng ① / Nhóm ②)
- [ ] Một người có **nhiều vai trò** → hiển thị nhiều dòng, ô Họ và tên **gộp (rowspan)**
- [ ] Dropdown **Vai trò** trong modal lấy đúng vai trò **của ứng dụng đó** (không hard-code)
- [ ] Ứng dụng *Tất cả người dùng* → không bắt buộc gán từng người

**Nhóm (Màn E)**
- [ ] Thêm nhóm: tên trùng → `E503`; mô tả để trống vẫn lưu được
- [ ] Cột **Số lượng người dùng** cập nhật đúng sau khi thêm/gỡ thành viên
- [ ] Panel nhóm có 2 tab **Ứng dụng** / **Người dùng**
- [ ] Thêm ứng dụng cho nhóm → **mọi thành viên** nhận quyền đó
- [ ] Xóa nhóm còn thành viên → cảnh báo `E510` kèm số người ảnh hưởng
- [ ] Xuất khẩu danh sách người dùng của nhóm ra Excel

**Modal gán quyền (§8)**
- [ ] **+ Thêm vai trò** thêm được nhiều dòng
- [ ] Nút `🗑` xóa dòng, chỉ hiện khi có ≥ 2 dòng
- [ ] Chọn trùng vai trò → `E505`
- [ ] Chip phạm vi dữ liệu gỡ được bằng `✕` và `Backspace`
- [ ] **Hủy** → không lưu thay đổi

**Bảo mật**
- [ ] Người dùng bị gỡ quyền → **mất truy cập ngay lần đăng nhập kế tiếp**
- [ ] Mọi thao tác phân quyền được ghi `audit_log`, gồm cả hành vi **xem**
- [ ] Gọi thẳng API để tự nâng quyền → bị chặn `403`

---

## 15. PHỤ LỤC A — Điểm cần xác nhận

| # | Vấn đề | Ghi nhận |
|---|---|---|
| 1 | **Quy tắc cộng dồn quyền** | Quyền trực tiếp + quyền từ nhiều nhóm → lấy hợp (union) hay có ưu tiên/loại trừ? Ảnh hưởng lớn tới thiết kế |
| 2 | **Danh sách mức quyền đầy đủ** | Chỉ quan sát được *Xem, Sửa* · *Toàn quyền* · *Chọn quyền*. Cần danh sách đủ theo từng phân hệ |
| 3 | **Phạm vi dữ liệu bắt buộc hay không** | Chat/Công việc để trống, Mạng xã hội có giá trị → quy tắc theo từng ứng dụng, cần bảng chốt |
| 4 | Nhóm mặc định *Tất cả người dùng* / *Tất cả nhân viên* | Có sửa/xóa được không? Thành viên tự động cập nhật? |
| 5 | Nút `🗑` khi chỉ còn **1 dòng vai trò** | Có ẩn không, hay cho xóa hết? |
| 6 | Thao tác **Nhân bản vai trò** | Suy luận — chưa quan sát trên UI |
| 7 | Mức quyền mặc định sau khi tích checkbox | Chưa quan sát được |
| 8 | Ứng dụng đổi *Đối tượng sử dụng* ở đâu? | Cột hiển thị được nhưng chưa thấy màn hình cấu hình |
| 9 | Tổng 30 ứng dụng | Danh sách đầy đủ chưa quan sát hết (mới thấy ~15) |
| 10 | Tên file ảnh để gom nhóm | Bạn có nhắc *"tham khảo theo tên file ảnh"* nhưng hệ thống chỉ nhận được ảnh, **không kèm tên file** → mình gom nhóm theo nội dung quan sát |

## 16. PHỤ LỤC B — Tổng hợp điểm KHÔNG THỐNG NHẤT

| # | Hạng mục | 01 | 02 | 03 | 04 | 05 | Đề xuất |
|---|---|---|---|---|---|---|---|
| 1 | Nhãn nút hủy | *Hủy* | *Hủy bỏ* | *Hủy* | *Hủy* | *Hủy* | **Hủy** |
| 2 | Ký tự ô trống | — | `-` | `- -` | `- -` | `- -` | **`-`** |
| 3 | Kiểu badge trạng thái | — | Nền xanh dương đặc | Viền xanh lá | Nền đặc | Nền đặc | **Chốt 1 kiểu** |
| 4 | Nhãn tổng số | — | — | *Tổng số: 15* | — | *Tổng số bản ghi: 30* | **Tổng số bản ghi** |
| 5 | Nhãn nút lưu trong modal | — | — | — | — | *Lưu* vs *Lưu chỉnh sửa* | **Lưu** |
| 6 | Vị trí cặp nút Hủy/Lưu | Trên–phải | Trên–phải | Trên–phải | Trên–phải | **Đáy trang** (màn C) | **Chốt theo loại màn** |
| 7 | Khoảng trắng trước dấu `*` | `Tên đầy đủ *` | `Mã đơn vị *` | `Mã vị trí *` | — | `Tên nhóm*` (dính) | **Có khoảng trắng** |
| 8 | Nhãn trạng thái | — | *Đang theo dõi* / *Đang hoạt động* | *Đang theo dõi* | *Đang hoạt động* | *Đang sử dụng* | **Theo ngữ cảnh** |
