# 05 · HƯỚNG DẪN PHÁT TRIỂN ỨNG DỤNG CÔNG CỤ VĂN THƯ (DMS) — DEGO Holding

> **Mục đích:** tài liệu kỹ thuật để đội phát triển dựng ứng dụng quản lý văn bản (văn thư) từ đầu.
> **Chuẩn tham chiếu chức năng:** bộ tính năng MISA AMIS Văn thư (Văn bản nội bộ · Phân quyền · Danh mục · AI trích xuất · Sổ văn bản đến–đi).
> **Yêu cầu riêng của DEGO:** đa pháp nhân (mẹ–con), phiên bản & hiệu lực, vòng đời 4 giai đoạn, ký số, lưu trữ & audit — xem [02-tom-tat-yeu-cau.md](02-tom-tat-yeu-cau.md), [01-nghien-cuu.md](01-nghien-cuu.md).
>
> Ngày lập: 2026-07-23 · Người lập: Team DX · Trạng thái: bản thiết kế để review

---

## MỤC LỤC

1. [Phạm vi & nguyên tắc thiết kế](#1-phạm-vi--nguyên-tắc-thiết-kế)
2. [Kiến trúc tổng thể & công nghệ](#2-kiến-trúc-tổng-thể--công-nghệ)
3. [Mô hình dữ liệu](#3-mô-hình-dữ-liệu)
4. [Mô hình phân quyền](#4-mô-hình-phân-quyền)
5. [Module M1 — Thiết lập danh mục](#5-module-m1--thiết-lập-danh-mục)
6. [Module M2 — Sổ văn bản đến/đi](#6-module-m2--sổ-văn-bản-đếnđi)
7. [Module M3 — Quản lý văn bản (đến/đi/nội bộ)](#7-module-m3--quản-lý-văn-bản-đếnđinội-bộ)
8. [Module M4 — Sinh số hiệu tự động](#8-module-m4--sinh-số-hiệu-tự-động)
9. [Module M5 — AI trích xuất văn bản](#9-module-m5--ai-trích-xuất-văn-bản)
10. [Module M6 — Vòng đời & luồng duyệt](#10-module-m6--vòng-đời--luồng-duyệt)
11. [Module M7 — Phiên bản, hiệu lực & liên kết](#11-module-m7--phiên-bản-hiệu-lực--liên-kết)
12. [Module M8 — Ký số](#12-module-m8--ký-số)
13. [Module M9 — Tra cứu & tìm kiếm](#13-module-m9--tra-cứu--tìm-kiếm)
14. [Module M10 — Lưu trữ, audit & thông báo](#14-module-m10--lưu-trữ-audit--thông-báo)
15. [Thiết kế API](#15-thiết-kế-api)
16. [Thiết kế màn hình](#16-thiết-kế-màn-hình)
17. [Lộ trình phát triển](#17-lộ-trình-phát-triển)
18. [Yêu cầu phi chức năng](#18-yêu-cầu-phi-chức-năng)
19. [Kiểm thử](#19-kiểm-thử)
20. [Rủi ro kỹ thuật](#20-rủi-ro-kỹ-thuật)

---

## 1. Phạm vi & nguyên tắc thiết kế

### 1.1. Ba nhóm người dùng

| Nhóm | Nhu cầu chính | Màn hình chủ đạo |
|---|---|---|
| **End user** (nhân viên phòng ban) | Tra cứu, đọc, nộp đề xuất | Tìm kiếm, Chi tiết văn bản, Việc của tôi |
| **Văn thư** | Vào sổ, cấp số, phát hành, theo dõi | Quản lý văn bản, Sổ văn bản |
| **Quản trị** | Danh mục, phân quyền, cấu hình quy trình | Thiết lập |

### 1.2. Nguyên tắc thiết kế bắt buộc

1. **Multi-tenant theo pháp nhân.** Mọi bảng nghiệp vụ đều mang `org_unit_id`; mọi truy vấn đều đi qua bộ lọc data-scope. Không có API nào trả dữ liệu không lọc phạm vi.
2. **Cấu hình thay vì hard-code.** Loại văn bản, mức mật, mức khẩn, trường thông tin, quy tắc số hiệu, luồng duyệt — tất cả là **dữ liệu**, không phải code.
3. **Không xóa cứng.** Mọi bảng nghiệp vụ dùng `soft delete` (`deleted_at`) + `audit_log`. Bản cũ của văn bản **lưu vết, không xóa**.
4. **Bất biến sau ban hành.** Văn bản đã ban hành không sửa nội dung — muốn đổi phải tạo **phiên bản mới**.
5. **Tách file khỏi metadata.** File nằm ở object storage, DB chỉ giữ khóa + hash. Cho phép thay hạ tầng lưu trữ mà không đổi schema.
6. **Mobile-first cho tra cứu.** Luồng tìm kiếm/đọc phải dùng tốt trên điện thoại (nhân viên đi thị trường).

---

## 2. Kiến trúc tổng thể & công nghệ

### 2.1. Sơ đồ khối

```
┌────────────────────────────────────────────────────────────────┐
│  CLIENT                                                        │
│  Web SPA (React + TS)        ·      Mobile web (PWA)           │
└───────────────────────────┬────────────────────────────────────┘
                            │ HTTPS / JWT
┌───────────────────────────▼────────────────────────────────────┐
│  API GATEWAY  (NestJS)                                         │
│  AuthN/AuthZ · Rate limit · Request log · Data-scope injector   │
└───┬──────────┬──────────┬──────────┬──────────┬────────────────┘
    │          │          │          │          │
┌───▼───┐ ┌────▼────┐ ┌───▼────┐ ┌───▼─────┐ ┌──▼──────────┐
│Catalog│ │Document │ │Workflow│ │ Search  │ │ AI Extract  │
│  M1   │ │ M2/M3   │ │  M6    │ │   M9    │ │     M5      │
└───┬───┘ └────┬────┘ └───┬────┘ └───┬─────┘ └──┬──────────┘
    │          │          │          │          │
┌───▼──────────▼──────────▼──────────▼──────────▼────────────────┐
│  PostgreSQL   │  MinIO/S3 (file)  │  OpenSearch  │  Redis      │
│  (metadata)   │  + versions       │  (full-text) │  (cache/job)│
└────────────────────────────────────────────────────────────────┘
         │                                    │
   ┌─────▼──────┐                      ┌──────▼───────┐
   │ CA ký số   │                      │  LLM API     │
   │ VNPT/Viettel│                     │  (trích xuất)│
   └────────────┘                      └──────────────┘
```

### 2.2. Stack đề xuất

| Lớp | Công nghệ | Lý do |
|---|---|---|
| Frontend | **React 18 + TypeScript + Vite**, TanStack Query, Ant Design | Ant Design có sẵn table/form/tree dày đặc — hợp app nghiệp vụ; team VN quen |
| Backend | **NestJS (Node 20)** | Module hóa rõ, DI, guard/interceptor hợp với data-scope |
| ORM | **Prisma** | Migration an toàn, type-safe |
| CSDL | **PostgreSQL 16** | JSONB cho trường động, `tsvector` dự phòng full-text, row-level security |
| File | **MinIO** (S3 API) | Self-host được, versioning gốc, đổi sang S3 không sửa code |
| Tìm kiếm | **OpenSearch** | Full-text tiếng Việt (ICU + custom analyzer), lọc facet |
| Queue | **BullMQ + Redis** | OCR/trích xuất/index chạy nền |
| AI | **Claude API** (`claude-sonnet-5`) + OCR | Trích xuất có cấu trúc (structured output) |
| Ký số | SDK CA (VNPT-CA / Viettel-CA / FPT-CA), **PAdES** | Theo Luật GDĐT 2023 |
| Auth | **OIDC + JWT**, refresh token | Sẵn sàng SSO khi có AMIS/ERP |

### 2.3. Cấu trúc thư mục backend

```
src/
├── common/
│   ├── guards/          # JwtGuard, PermissionGuard, DataScopeGuard
│   ├── interceptors/    # AuditInterceptor, TransformInterceptor
│   └── decorators/      # @RequirePermission, @Scoped
├── modules/
│   ├── org/             # pháp nhân, phòng ban, chức danh
│   ├── iam/             # user, role, permission, data-scope
│   ├── catalog/         # M1: doc-type, secrecy, urgency, partner
│   ├── book/            # M2: sổ văn bản
│   ├── document/        # M3: văn bản + file + version + link
│   ├── numbering/       # M4: sinh số hiệu
│   ├── extraction/      # M5: AI
│   ├── workflow/        # M6: luồng duyệt
│   ├── signature/       # M8: ký số
│   ├── search/          # M9: index + query
│   └── archive/         # M10: retention, audit, notification
└── jobs/                # consumers của BullMQ
```

---

## 3. Mô hình dữ liệu

### 3.1. Sơ đồ quan hệ (rút gọn)

```
org_unit ──┬─< user_org_role >── user
           │                       │
           ├─< register_book >─────┤
           │        │              │
           └─< document >──────────┘
                 │
   ┌─────────────┼──────────────┬───────────────┬──────────────┐
   │             │              │               │              │
document_    document_      document_      workflow_      signature
 version       file           link         instance
                                               │
                                          workflow_step
```

### 3.2. Bảng tổ chức & người dùng

```sql
-- Pháp nhân + phòng ban gộp thành một cây; phân biệt bằng is_legal_entity
CREATE TABLE org_unit (
  id            UUID PRIMARY KEY,
  parent_id     UUID REFERENCES org_unit(id),
  code          VARCHAR(20)  NOT NULL UNIQUE,  -- DEGO, DEGO-CT1, DEGO-NS...
  name          VARCHAR(255) NOT NULL,
  is_legal_entity BOOLEAN NOT NULL DEFAULT FALSE,
  is_shared_service BOOLEAN NOT NULL DEFAULT FALSE, -- HR/KT/Pháp chế/IT dùng chung
  path          LTREE,                          -- truy vấn cây nhanh
  status        SMALLINT NOT NULL DEFAULT 1,
  deleted_at    TIMESTAMPTZ
);

CREATE TABLE app_user (
  id         UUID PRIMARY KEY,
  full_name  VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  phone      VARCHAR(30),
  username   VARCHAR(100) NOT NULL UNIQUE,
  status     SMALLINT NOT NULL DEFAULT 1,
  deleted_at TIMESTAMPTZ
);

-- MỘT NGƯỜI CÓ THỂ GIỮ NHIỀU VAI Ở NHIỀU PHÁP NHÂN (yêu cầu DEGO)
CREATE TABLE user_org_role (
  id          UUID PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES app_user(id),
  org_unit_id UUID NOT NULL REFERENCES org_unit(id),
  role_id     UUID NOT NULL REFERENCES role(id),
  title       VARCHAR(150),          -- chức danh tại đơn vị đó
  is_primary  BOOLEAN DEFAULT FALSE,
  valid_from  DATE, valid_to DATE,   -- hỗ trợ ủy quyền có thời hạn
  UNIQUE (user_id, org_unit_id, role_id)
);
```

> **Ghi chú thiết kế:** `user_org_role` là bảng gỡ đúng bài toán holding — một người vừa là Trưởng phòng NS của công ty mẹ, vừa là người xem của công ty con. Không dùng cột `department_id` phẳng trên `app_user`.

### 3.3. Bảng danh mục (M1)

```sql
CREATE TABLE doc_type (            -- Loại văn bản
  id UUID PRIMARY KEY,
  org_unit_id UUID REFERENCES org_unit(id),  -- NULL = dùng chung toàn Holding
  name         VARCHAR(150) NOT NULL,        -- "Quyết định"
  abbreviation VARCHAR(20)  NOT NULL,        -- "QĐ"
  description  TEXT,
  tier         SMALLINT,                     -- 1..8 theo tháp hiệu lực
  is_versioned BOOLEAN DEFAULT TRUE,         -- Thông báo = FALSE
  needs_decision BOOLEAN DEFAULT FALSE,      -- Quy chế ban hành kèm QĐ
  status       SMALLINT NOT NULL DEFAULT 1,
  deleted_at   TIMESTAMPTZ,
  UNIQUE (org_unit_id, abbreviation)
);

CREATE TABLE secrecy_level (       -- Mức độ mật
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,      -- Công khai/Nội bộ/Mật/Tuyệt mật
  code VARCHAR(20)  NOT NULL,
  rank SMALLINT NOT NULL,          -- 0..3, dùng so sánh clearance
  description TEXT,
  status SMALLINT DEFAULT 1
);

CREATE TABLE urgency_level (       -- Mức độ khẩn
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,      -- Thường/Khẩn/Thượng khẩn/Hỏa tốc
  code VARCHAR(20) NOT NULL,
  sla_hours INT,                   -- Hỏa tốc = 4h, Khẩn = 24h...
  status SMALLINT DEFAULT 1
);

CREATE TABLE partner (             -- Đối tác (nguồn VB đến / nơi nhận VB đi)
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT, email VARCHAR(255), phone VARCHAR(30),
  status SMALLINT DEFAULT 1,
  deleted_at TIMESTAMPTZ
);
```

> **Quan trọng:** sửa/xóa `partner` phải **cập nhật hiển thị trên các văn bản đã gắn** (theo đúng lưu ý của AMIS). Vì `document.partner_id` là FK, sửa tên là tự động phản ánh. **Không snapshot tên đối tác vào văn bản**, trừ khi văn bản đã ban hành (khi đó snapshot vào `document_version.payload` để giữ nguyên bản gốc).

### 3.4. Bảng sổ văn bản (M2)

```sql
CREATE TABLE register_book (
  id          UUID PRIMARY KEY,
  direction   SMALLINT NOT NULL,   -- 1=đến, 2=đi, 3=nội bộ
  name        VARCHAR(255) NOT NULL,
  org_unit_id UUID NOT NULL REFERENCES org_unit(id),  -- CHỈ 1 đơn vị
  year        SMALLINT,            -- sổ theo năm; số chạy lại từ 01 mỗi năm
  status      SMALLINT NOT NULL DEFAULT 1,
  deleted_at  TIMESTAMPTZ
);

CREATE TABLE register_book_manager (   -- nhiều người quản lý: xem/sửa/xóa sổ
  book_id UUID REFERENCES register_book(id),
  user_id UUID REFERENCES app_user(id),
  PRIMARY KEY (book_id, user_id)
);

CREATE TABLE register_book_viewer (    -- người xem sổ, phải thuộc org_unit
  book_id UUID REFERENCES register_book(id),
  user_id UUID REFERENCES app_user(id),
  PRIMARY KEY (book_id, user_id)
);
```

**Ràng buộc nghiệp vụ (validate ở service, không chỉ ở DB):**
- Chỉ được `status = Ngừng hoạt động` khi **sổ không còn văn bản nào**.
- Chỉ **xóa được sổ chưa có văn bản**, và chỉ **người quản lý sổ** mới được xóa.
- `register_book_viewer.user_id` phải có `user_org_role` thuộc `register_book.org_unit_id`.

### 3.5. Bảng văn bản (M3)

```sql
CREATE TABLE document (
  id             UUID PRIMARY KEY,
  direction      SMALLINT NOT NULL,        -- 1=đến, 2=đi, 3=nội bộ
  book_id        UUID REFERENCES register_book(id),
  org_unit_id    UUID NOT NULL REFERENCES org_unit(id),
  doc_type_id    UUID NOT NULL REFERENCES doc_type(id),

  doc_no         VARCHAR(100),             -- số hiệu đã sinh
  seq_no         INT,                      -- số thứ tự trong sổ (01..n)
  symbol         VARCHAR(50),              -- ký hiệu: TB-NS

  subject        TEXT NOT NULL,            -- trích yếu
  body_summary   TEXT,                     -- tóm tắt (AI)

  issued_date    DATE,                     -- ngày ban hành
  received_date  DATE,                     -- ngày đến (VB đến)
  effective_date DATE,                     -- ngày hiệu lực
  expiry_date    DATE,                     -- ngày hết hiệu lực
  review_date    DATE,                     -- ngày rà soát kế tiếp

  partner_id     UUID REFERENCES partner(id),      -- nơi gửi/nơi nhận ngoài
  signer_id      UUID REFERENCES app_user(id),
  signer_title   VARCHAR(150),             -- "TUQ. Giám đốc"
  owner_id       UUID REFERENCES app_user(id),     -- CHỦ SỞ HỮU (bắt buộc)

  secrecy_id     UUID REFERENCES secrecy_level(id),
  urgency_id     UUID REFERENCES urgency_level(id),

  status         VARCHAR(30) NOT NULL,     -- xem M6
  current_version INT NOT NULL DEFAULT 1,

  custom_fields  JSONB DEFAULT '{}',       -- trường động do admin cấu hình
  created_by     UUID, created_at TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ,
  deleted_at     TIMESTAMPTZ
);

CREATE INDEX ON document (org_unit_id, direction, status);
CREATE INDEX ON document (book_id, seq_no);
CREATE INDEX ON document USING GIN (custom_fields);
CREATE UNIQUE INDEX ON document (doc_no) WHERE deleted_at IS NULL AND doc_no IS NOT NULL;
```

```sql
CREATE TABLE document_version (
  id           UUID PRIMARY KEY,
  document_id  UUID NOT NULL REFERENCES document(id),
  version_no   INT  NOT NULL,
  payload      JSONB NOT NULL,        -- snapshot toàn bộ metadata tại thời điểm ban hành
  change_note  TEXT,
  superseded_by UUID REFERENCES document_version(id),
  effective_date DATE, expiry_date DATE,
  created_by   UUID, created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (document_id, version_no)
);

CREATE TABLE document_file (
  id          UUID PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES document(id),
  version_no  INT,
  storage_key VARCHAR(500) NOT NULL,   -- MinIO key
  file_name   VARCHAR(255) NOT NULL,
  mime_type   VARCHAR(100),
  size_bytes  BIGINT,
  sha256      CHAR(64) NOT NULL,       -- toàn vẹn (ISO 15489)
  is_signed   BOOLEAN DEFAULT FALSE,
  ocr_text    TEXT,                    -- phục vụ full-text
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Liên kết văn bản: căn cứ pháp lý / thay thế / bị thay thế / kèm theo
CREATE TABLE document_link (
  id UUID PRIMARY KEY,
  from_document_id UUID NOT NULL REFERENCES document(id),
  to_document_id   UUID REFERENCES document(id),
  external_ref     VARCHAR(255),   -- vd "Nghị định 30/2020/NĐ-CP" (VB ngoài)
  link_type        VARCHAR(30) NOT NULL,  -- BASIS|REPLACES|REPLACED_BY|ATTACHED
  UNIQUE (from_document_id, to_document_id, link_type)
);
```

### 3.6. Trường thông tin động (field config)

AMIS cho phép "Thiết lập trường thông tin" riêng cho từng loại (đến/đi/nội bộ). Ta mô hình hóa bằng:

```sql
CREATE TABLE field_config (
  id          UUID PRIMARY KEY,
  direction   SMALLINT NOT NULL,          -- áp cho VB đến/đi/nội bộ
  org_unit_id UUID,                       -- NULL = toàn Holding
  field_key   VARCHAR(50) NOT NULL,       -- 'doc_no', 'subject', hoặc 'x_project_code'
  label       VARCHAR(150) NOT NULL,
  data_type   VARCHAR(20) NOT NULL,       -- text|number|date|select|user|money
  is_system   BOOLEAN DEFAULT FALSE,      -- trường mặc định: KHÔNG cho xóa
  is_required BOOLEAN DEFAULT FALSE,
  is_visible  BOOLEAN DEFAULT TRUE,
  options     JSONB,                      -- cho select
  display_order INT,
  UNIQUE (direction, org_unit_id, field_key)
);
```

**Quy tắc (theo lưu ý AMIS):** trường **mặc định (`is_system = TRUE`)** chỉ được đổi `label`/`is_required`/`is_visible`, **không được xóa**; giới hạn của Văn bản nội bộ áp dụng **giống hệt** Văn bản đến/đi.

---

## 4. Mô hình phân quyền

Quyền hiệu lực = **Vai trò** ∩ **Phạm vi dữ liệu** ∩ **Mức mật được phép**.

### 4.1. Vai trò mặc định

| Vai trò | Quyền |
|---|---|
| **Quản trị hệ thống** | Toàn quyền, gồm tạo user, gán ứng dụng |
| **Quản trị ứng dụng** | Toàn quyền trong DMS: danh mục, field config, bật/tắt Văn bản nội bộ, luồng duyệt |
| **Quản lý văn thư** | Tạo/sửa/xử lý/phát hành văn bản **trong phạm vi được phân công**; cấp số; vào sổ |
| **Người xem văn thư** | **Chỉ xem** — không sửa, không xử lý |

```sql
CREATE TABLE role (
  id UUID PRIMARY KEY, code VARCHAR(50) UNIQUE, name VARCHAR(150),
  is_system BOOLEAN DEFAULT FALSE
);
CREATE TABLE role_permission (
  role_id UUID REFERENCES role(id),
  permission VARCHAR(80),        -- 'document.create', 'book.delete', 'catalog.manage'
  PRIMARY KEY (role_id, permission)
);
-- Phạm vi dữ liệu: user được thấy dữ liệu của những org_unit nào
CREATE TABLE user_data_scope (
  user_id     UUID REFERENCES app_user(id),
  org_unit_id UUID REFERENCES org_unit(id),
  include_children BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (user_id, org_unit_id)
);
-- Mức mật tối đa user được xem
CREATE TABLE user_clearance (
  user_id  UUID PRIMARY KEY REFERENCES app_user(id),
  max_rank SMALLINT NOT NULL DEFAULT 1   -- so với secrecy_level.rank
);
```

### 4.2. Thực thi phạm vi — bắt buộc ở tầng repository

```ts
// common/guards/data-scope.ts
export async function scopedOrgIds(userId: string): Promise<string[]> {
  const scopes = await db.userDataScope.findMany({ where: { userId } });
  const ids = new Set<string>();
  for (const s of scopes) {
    ids.add(s.orgUnitId);
    if (s.includeChildren) {
      // dùng LTREE: path <@ (SELECT path FROM org_unit WHERE id = s.orgUnitId)
      (await descendantsOf(s.orgUnitId)).forEach(id => ids.add(id));
    }
  }
  return [...ids];
}

// MỌI truy vấn document đều đi qua hàm này
export function documentScopeFilter(ctx: Ctx) {
  return {
    deletedAt: null,
    orgUnitId: { in: ctx.scopedOrgIds },
    secrecy: { rank: { lte: ctx.maxClearanceRank } },
  };
}
```

> **Ví dụ đúng yêu cầu:** user chỉ được phân quyền phòng A → chỉ xem & thao tác dữ liệu phòng A; **không thấy dữ liệu phòng B, C**.

### 4.3. Quy trình cấp quyền (khớp luồng AMIS)

```
1. Tạo user (họ tên, email, SĐT, tên đăng nhập)   → POST /users
2. Gán user vào ứng dụng DMS                       → POST /apps/dms/users
3. Chọn vai trò (QT ứng dụng / Quản lý VT / Người xem)
4. Chọn phạm vi dữ liệu (org_unit)                 → PUT /users/:id/data-scope
5. Lưu → gửi thông báo → user đăng nhập lại (refresh claim)
```

**Kỹ thuật:** quyền nằm trong JWT claim. Khi đổi quyền, **thu hồi refresh token** để buộc đăng nhập lại — đúng hành vi "cần đăng nhập lại để bắt đầu sử dụng".

---

## 5. Module M1 — Thiết lập danh mục

### 5.1. Phạm vi
Bốn danh mục: **Loại văn bản · Mức độ mật · Mức độ khẩn · Đối tác**. Cộng thêm (DEGO): **Mã đơn vị**, **Quy tắc số hiệu**, **Chính sách lưu trữ**.

### 5.2. Hành vi CRUD chung

| Thao tác | Quy tắc |
|---|---|
| Thêm mới | Tên + Ký hiệu/viết tắt + Mô tả + Trạng thái |
| Sửa | Cho phép; bản ghi đã gắn văn bản **vẫn cập nhật hiển thị theo** |
| Xóa | **Soft delete**; chặn nếu đang được văn bản tham chiếu → gợi ý "Ngừng hoạt động" |
| Ngừng hoạt động | Ẩn khỏi dropdown khi tạo mới, **không ảnh hưởng văn bản cũ** |

```ts
// modules/catalog/doc-type.service.ts
async remove(id: string, ctx: Ctx) {
  const used = await this.db.document.count({ where: { docTypeId: id, deletedAt: null } });
  if (used > 0) {
    throw new ConflictException(
      `Loại văn bản đang được ${used} văn bản sử dụng. Hãy chuyển sang "Ngừng hoạt động".`
    );
  }
  return this.db.docType.update({ where: { id }, data: { deletedAt: new Date() } });
}
```

### 5.3. Bật/tắt Văn bản nội bộ

```ts
// Thiết lập > Tùy chỉnh > Văn bản nội bộ
PATCH /settings/internal-doc  { enabled: boolean }
```

**Quy tắc:**
- Chỉ **Quản trị hệ thống / Quản trị ứng dụng / quyền Thiết lập** được bật–tắt.
- Bật → hiện mục **Thiết lập trường thông tin văn bản nội bộ** (dùng chung engine `field_config` với đến/đi).
- Tắt → **vô hiệu hóa toàn bộ field config của loại này** (`is_visible = false`), **không xóa dữ liệu**; tab "Văn bản nội bộ" ẩn khỏi phân hệ Quản lý văn bản.

```ts
async toggleInternalDoc(enabled: boolean, ctx: Ctx) {
  requirePermission(ctx, 'settings.manage');
  await this.db.$transaction([
    this.db.setting.upsert({ /* internal_doc_enabled */ }),
    // KHÔNG xóa field_config — chỉ vô hiệu hóa
    this.db.fieldConfig.updateMany({
      where: { direction: Direction.INTERNAL },
      data: { isVisible: enabled },
    }),
  ]);
}
```

---

## 6. Module M2 — Sổ văn bản đến/đi

### 6.1. Tạo sổ

Trường: **Tên sổ · Người quản lý (n) · Đơn vị (1) · Người xem sổ (n) · Trạng thái**.

```ts
async createBook(dto: CreateBookDto, ctx: Ctx) {
  // Người xem sổ phải thuộc đúng đơn vị của sổ
  const invalid = await this.findViewersOutsideOrg(dto.viewerIds, dto.orgUnitId);
  if (invalid.length) {
    throw new BadRequestException('Người xem sổ phải thuộc đơn vị đã chọn.');
  }
  return this.db.registerBook.create({
    data: { ...dto, status: BookStatus.ACTIVE, year: dto.year ?? new Date().getFullYear() },
  });
}
```

### 6.2. Ràng buộc vòng đời sổ

```ts
async deactivate(bookId: string) {
  const count = await this.db.document.count({ where: { bookId, deletedAt: null } });
  if (count > 0) throw new ConflictException('Chỉ ngừng hoạt động khi sổ không chứa văn bản.');
  /* ... */
}

async remove(bookId: string, ctx: Ctx) {
  await this.assertIsManager(bookId, ctx.userId);          // chỉ người quản lý sổ
  const count = await this.db.document.count({ where: { bookId, deletedAt: null } });
  if (count > 0) throw new ConflictException('Chỉ xóa được sổ chưa có văn bản.');
  /* ... */
}
```

### 6.3. Tiện ích danh sách sổ
- **Tìm kiếm** theo: tên sổ, tên đơn vị/phòng ban, hoặc user liên quan (quản lý hoặc người xem).
- **Tùy chỉnh cột hiển thị** — lưu vào `user_preference (screen_key, columns JSONB)`, không hard-code.

```sql
-- tìm kiếm sổ theo user liên quan
SELECT b.* FROM register_book b
LEFT JOIN register_book_manager m ON m.book_id = b.id
LEFT JOIN register_book_viewer  v ON v.book_id = b.id
LEFT JOIN org_unit o ON o.id = b.org_unit_id
WHERE b.deleted_at IS NULL
  AND (b.name ILIKE $q OR o.name ILIKE $q OR m.user_id = $userId OR v.user_id = $userId)
GROUP BY b.id;
```

---

## 7. Module M3 — Quản lý văn bản (đến/đi/nội bộ)

### 7.1. Ba tab, một engine

Cả 3 loại dùng chung bảng `document` + `field_config`, khác nhau ở `direction` và bộ trường hiển thị.

| | Văn bản đến | Văn bản đi | Văn bản nội bộ |
|---|---|---|---|
| Nguồn/Đích | `partner_id` (nơi gửi) | `partner_id` (nơi nhận) | `org_unit` nội bộ |
| Ngày chính | `received_date` | `issued_date` | `issued_date` |
| Cấp số | Số đến (theo sổ đến) | Số đi (theo sổ đi) | Số nội bộ |
| Bắt buộc | Dấu "ĐẾN", hạn xử lý | Ký số, nơi nhận | Chủ sở hữu, hiệu lực |

### 7.2. Luồng Văn bản ĐẾN

```
Tiếp nhận (upload/email) → AI trích xuất → Văn thư kiểm tra → Đóng dấu "ĐẾN" (số + ngày)
   → Vào Sổ đến → TRÌNH TRONG NGÀY tới người có thẩm quyền
   → Phân công xử lý (giao việc + hạn theo urgency.sla_hours)
   → Theo dõi → Hoàn thành → Lưu hồ sơ
```

```ts
// Cảnh báo trễ hạn — job chạy mỗi giờ
@Cron('0 * * * *')
async checkOverdue() {
  const overdue = await this.db.document.findMany({
    where: {
      direction: Direction.INCOMING,
      status: { in: ['ASSIGNED', 'PROCESSING'] },
      dueAt: { lt: new Date() },
    },
  });
  for (const d of overdue) await this.notify.overdue(d);
}
```

### 7.3. Luồng Văn bản ĐI

```
Soạn (từ mẫu) → Kiểm thể thức → Duyệt (M6) → Ký số (M8)
   → Cấp số hiệu (M4) → Vào Sổ đi → Phát hành + thông báo nơi nhận → Lưu
```

---

## 8. Module M4 — Sinh số hiệu tự động

> **Đây là điểm phải chốt trước khi code** (báo cáo đã nêu): file thật dùng kiểu NĐ 30 `08/2025/TB-NS`, slide đề xuất kiểu `DEGO–QC–001–v1`. Giải pháp: **engine template**, cấu hình được, hỗ trợ cả hai.

### 8.1. Bảng quy tắc

```sql
CREATE TABLE numbering_rule (
  id UUID PRIMARY KEY,
  org_unit_id UUID REFERENCES org_unit(id),
  direction   SMALLINT,
  doc_type_id UUID REFERENCES doc_type(id),
  template    VARCHAR(200) NOT NULL,
  reset_cycle VARCHAR(10) NOT NULL DEFAULT 'YEAR',  -- YEAR|NONE
  padding     SMALLINT DEFAULT 2,
  priority    INT DEFAULT 0                          -- rule cụ thể thắng rule chung
);

CREATE TABLE numbering_counter (
  scope_key  VARCHAR(200) PRIMARY KEY,   -- vd "book:<uuid>:2026"
  current_no INT NOT NULL DEFAULT 0
);
```

### 8.2. Token hỗ trợ

| Token | Ý nghĩa | Ví dụ |
|---|---|---|
| `{seq}` | Số thứ tự, pad theo `padding` | `08` |
| `{year}` | Năm ban hành | `2025` |
| `{typeAbbr}` | Viết tắt loại văn bản | `TB`, `QC` |
| `{unitCode}` | Mã đơn vị | `NS`, `DEGO` |
| `{version}` | Phiên bản | `v1` |

```
Kiểu Nghị định 30 :  {seq}/{year}/{typeAbbr}-{unitCode}   →  08/2025/TB-NS
Kiểu DEGO        :  {unitCode}-{typeAbbr}-{seq}-{version} →  DEGO-QC-001-v1
```

### 8.3. Cấp số an toàn (chống trùng khi nhiều người bấm cùng lúc)

```ts
async allocate(doc: Document, tx: PrismaTx): Promise<string> {
  const rule = await this.resolveRule(doc);           // theo priority
  const scopeKey = this.scopeKey(rule, doc);          // "book:<id>:2026"

  // Khóa hàng đếm — tuần tự hóa, không bao giờ cấp trùng
  const [{ current_no }] = await tx.$queryRaw<{ current_no: number }[]>`
    INSERT INTO numbering_counter (scope_key, current_no) VALUES (${scopeKey}, 1)
    ON CONFLICT (scope_key) DO UPDATE SET current_no = numbering_counter.current_no + 1
    RETURNING current_no;`;

  return this.render(rule.template, {
    seq: String(current_no).padStart(rule.padding, '0'),
    year: doc.issuedDate.getFullYear(),
    typeAbbr: doc.docType.abbreviation,
    unitCode: doc.orgUnit.code,
    version: `v${doc.currentVersion}`,
  });
}
```

> **Quy tắc NĐ 30:** số lấy **liên tục từ 01 (01/01) đến hết 31/12** → `reset_cycle = 'YEAR'`, `scope_key` chứa năm.
> **Chỉ cấp số ở bước phát hành**, trong cùng transaction với việc chuyển trạng thái — tránh "thủng số" khi hủy nháp.

---

## 9. Module M5 — AI trích xuất văn bản

### 9.1. Luồng

```
Upload tệp → lưu MinIO → enqueue job
   → Nhận dạng loại tệp
       ├── PDF text  → parse trực tiếp
       ├── PDF scan / ảnh → OCR (tiếng Việt)
       └── DOCX → convert → text
   → Gọi LLM với JSON Schema → trả field + độ tin cậy
   → Hiển thị khung bên phải để người dùng đối chiếu
   → "Lưu tệp và thông tin trích xuất" → điền vào form
   → hoặc "Lưu tệp" → chỉ đính kèm, không điền
```

### 9.2. Schema trích xuất

```ts
const EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    doc_no:         { type: ['string','null'], description: 'Số hiệu, vd 08/2025/TB-NS' },
    symbol:         { type: ['string','null'], description: 'Ký hiệu, vd TB-NS' },
    doc_type_name:  { type: ['string','null'], description: 'Tên loại: Thông báo, Quyết định...' },
    issued_date:    { type: ['string','null'], description: 'ISO yyyy-mm-dd' },
    subject:        { type: ['string','null'], description: 'Trích yếu nội dung' },
    issuing_org:    { type: ['string','null'], description: 'Cơ quan/đơn vị ban hành' },
    signer_name:    { type: ['string','null'] },
    signer_title:   { type: ['string','null'], description: 'vd TUQ. Giám đốc' },
    urgency:        { type: ['string','null'], enum: ['Thường','Khẩn','Thượng khẩn','Hỏa tốc', null] },
    secrecy:        { type: ['string','null'], enum: ['Công khai','Nội bộ','Mật','Tuyệt mật', null] },
    recipients:     { type: 'array', items: { type: 'string' } },
    effective_date: { type: ['string','null'] },
    summary:        { type: ['string','null'], description: 'Tóm tắt 2-3 câu' },
    confidence:     { type: 'object', additionalProperties: { type: 'number' } },
  },
  required: ['subject', 'confidence'],
} as const;
```

```ts
// modules/extraction/extract.service.ts
async extract(text: string) {
  const res = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 2000,
    tools: [{ name: 'emit', description: 'Trả thông tin trích xuất', input_schema: EXTRACTION_SCHEMA }],
    tool_choice: { type: 'tool', name: 'emit' },
    messages: [{
      role: 'user',
      content:
        'Trích xuất thông tin từ văn bản hành chính Việt Nam dưới đây. ' +
        'Trường nào không chắc chắn thì để null và cho confidence thấp. ' +
        'TUYỆT ĐỐI không bịa số hiệu hay ngày tháng.\n\n<document>\n' + text.slice(0, 60_000) + '\n</document>',
    }],
  });
  return (res.content.find(c => c.type === 'tool_use') as any)?.input;
}
```

### 9.3. Quy tắc UX bắt buộc

| Yêu cầu | Cách làm |
|---|---|
| Tải **nhiều tệp** một lần | Job song song, gộp kết quả; tệp đầu tiên làm nguồn chính |
| Chỉ đính kèm, không điền | Nút **"Lưu tệp"** (bỏ qua bước áp dụng) |
| Điền tự động | Nút **"Lưu tệp và thông tin trích xuất"** |
| Gỡ tệp | Nút **Xóa** cạnh mỗi tệp trong mục *Tệp văn bản* |
| Không tin AI mù quáng | Field có `confidence < 0.7` → **highlight vàng**, bắt người dùng xác nhận |
| Ánh xạ danh mục | `doc_type_name` → fuzzy match vào `doc_type`; không khớp thì để trống, **không tự tạo danh mục mới** |

---

## 10. Module M6 — Vòng đời & luồng duyệt

### 10.1. Máy trạng thái

```
DRAFT ──► FORMAT_CHECK ──► CONSULTING ──► PENDING_APPROVAL ──► APPROVED
                                                │                  │
                                          (REJECTED)               ▼
                                                │               SIGNING
                                                ▼                  │
                                             DRAFT                 ▼
                                                                ISSUED ──► ACTIVE
                                                                             │
                                        ┌────────────────────────────────────┤
                                        ▼                                    ▼
                                  UNDER_REVISION ──► (v+1) ACTIVE       EXPIRED
                                        │                                    │
                                        ▼                                    ▼
                                   SUPERSEDED ──────────────────────────► ARCHIVED
```

```ts
const TRANSITIONS: Record<Status, Status[]> = {
  DRAFT:            ['FORMAT_CHECK', 'CANCELLED'],
  FORMAT_CHECK:     ['CONSULTING', 'PENDING_APPROVAL', 'DRAFT'],
  CONSULTING:       ['PENDING_APPROVAL', 'DRAFT'],
  PENDING_APPROVAL: ['APPROVED', 'DRAFT'],          // DRAFT = bị từ chối
  APPROVED:         ['SIGNING'],
  SIGNING:          ['ISSUED'],
  ISSUED:           ['ACTIVE'],
  ACTIVE:           ['UNDER_REVISION', 'EXPIRED', 'SUPERSEDED'],
  UNDER_REVISION:   ['ACTIVE', 'SUPERSEDED'],
  EXPIRED:          ['ARCHIVED'],
  SUPERSEDED:       ['ARCHIVED'],
  ARCHIVED:         [],
  CANCELLED:        [],
};

assertTransition(from: Status, to: Status) {
  if (!TRANSITIONS[from]?.includes(to))
    throw new BadRequestException(`Không thể chuyển ${from} → ${to}`);
}
```

### 10.2. Bốn vai (tách trách nhiệm)

```sql
CREATE TABLE workflow_step (
  id UUID PRIMARY KEY,
  instance_id UUID NOT NULL,
  step_order  INT NOT NULL,
  role_kind   VARCHAR(20) NOT NULL,  -- PROPOSER|EXECUTOR|REVIEWER|APPROVER
  assignee_id UUID REFERENCES app_user(id),
  action      VARCHAR(20),           -- APPROVED|REJECTED|RETURNED
  comment     TEXT,
  acted_at    TIMESTAMPTZ,
  due_at      TIMESTAMPTZ
);
```

> **Ràng buộc:** một người **không được giữ đồng thời** `REVIEWER` và `APPROVER` trên cùng một văn bản → validate khi khởi tạo instance.

### 10.3. Định tuyến theo Bảng phân quyền (DoA)

```sql
CREATE TABLE approval_rule (
  id UUID PRIMARY KEY,
  org_unit_id UUID, doc_type_id UUID,
  condition   JSONB,        -- {"field":"amount","op":"<=","value":50000000}
  approver_role_id UUID,    -- hoặc approver_user_id
  step_order  INT,
  priority    INT
);
```

```ts
// Ví dụ đơn nghỉ phép — định tuyến theo ngưỡng
// ≤ 2 ngày → Quản lý trực tiếp | 3–5 ngày → Trưởng bộ phận | > 5 ngày → Giám đốc
async buildChain(doc: Document): Promise<Step[]> {
  const rules = await this.matchRules(doc);          // lọc theo condition
  return rules.sort((a, b) => a.stepOrder - b.stepOrder)
              .map(r => ({ roleKind: 'APPROVER', assigneeId: this.resolve(r, doc) }));
}
```

### 10.4. Ủy quyền / ký thay (TUQ)

```sql
CREATE TABLE delegation (
  id UUID PRIMARY KEY,
  from_user_id UUID NOT NULL, to_user_id UUID NOT NULL,
  org_unit_id  UUID, doc_type_id UUID,
  valid_from DATE NOT NULL, valid_to DATE NOT NULL,
  note VARCHAR(255)              -- "TUQ. Giám đốc"
);
```
Khi resolve người duyệt: nếu người đó có `delegation` còn hiệu lực → chuyển task sang người được ủy quyền, **ghi rõ "TUQ." trên văn bản** và lưu vết cả hai.

---

## 11. Module M7 — Phiên bản, hiệu lực & liên kết

### 11.1. Quy tắc phiên bản

- `doc_type.is_versioned = TRUE` (Quy chế, Quy định, Quy trình) → mỗi lần sửa nội dung sau ban hành ⇒ **tăng version**.
- `is_versioned = FALSE` (Thông báo, Công văn sự vụ) → **không đánh version**, chỉ lưu vết trạng thái.
- Bản cũ **giữ nguyên, gắn nhãn "hết hiệu lực từ …"**, tự động tạo link `REPLACED_BY`.

```ts
async createRevision(docId: string, dto: RevisionDto, ctx: Ctx) {
  return this.db.$transaction(async tx => {
    const cur = await tx.document.findUniqueOrThrow({ where: { id: docId } });
    if (!cur.docType.isVersioned)
      throw new BadRequestException('Loại văn bản này không quản lý phiên bản.');

    // 1) đóng băng bản hiện tại
    await tx.documentVersion.create({
      data: { documentId: docId, versionNo: cur.currentVersion, payload: snapshot(cur) },
    });
    // 2) nâng version
    const next = cur.currentVersion + 1;
    await tx.document.update({
      where: { id: docId },
      data: { currentVersion: next, status: 'UNDER_REVISION', expiryDate: null },
    });
    // 3) liên kết thay thế
    await tx.documentLink.create({
      data: { fromDocumentId: docId, toDocumentId: docId, linkType: 'REPLACES' },
    });
    return next;
  });
}
```

### 11.2. Hiệu lực

| Quy tắc | Cách thực thi |
|---|---|
| Ngày hiệu lực do DN **tự ấn định** | `effective_date` nhập tay; mặc định = ngày ký |
| Hạn chế **hồi tố** | Cảnh báo nếu `effective_date < issued_date` |
| Tự hết hiệu lực | Job hằng đêm: `expiry_date < today` → `status = EXPIRED` |
| Nhắc rà soát | Job: `review_date - 30 ngày` → thông báo `owner_id` |

```ts
@Cron('0 1 * * *')                 // 01:00 mỗi ngày
async dailyLifecycleSweep() {
  await this.db.document.updateMany({
    where: { status: 'ACTIVE', expiryDate: { lt: startOfToday() } },
    data:  { status: 'EXPIRED' },
  });
  const due = await this.db.document.findMany({
    where: { status: 'ACTIVE', reviewDate: { lte: addDays(new Date(), 30) } },
  });
  for (const d of due) await this.notify.reviewDue(d.ownerId, d);
}
```

### 11.3. Liên kết văn bản
Hiển thị ở tab **"Văn bản liên quan"**: Căn cứ pháp lý · Thay thế · Bị thay thế · Kèm theo. Cho phép trỏ tới văn bản ngoài (`external_ref`) như "Nghị định 30/2020/NĐ-CP".

---

## 12. Module M8 — Ký số

Theo **Luật Giao dịch điện tử 2023**: chữ ký số ≈ chữ ký tay; văn bản điện tử ≈ văn bản giấy nếu **bảo đảm toàn vẹn** và **truy cập được**.

```
Văn bản APPROVED → render PDF chuẩn thể thức
   → gửi hash tới CA (VNPT/Viettel/FPT) → nhận chữ ký
   → nhúng PAdES vào PDF → tính sha256 → lưu document_file (is_signed = true)
   → chuyển ISSUED
```

```sql
CREATE TABLE signature (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES document(id),
  file_id     UUID NOT NULL REFERENCES document_file(id),
  signer_id   UUID NOT NULL,
  signer_title VARCHAR(150),
  provider    VARCHAR(50),      -- VNPT-CA | VIETTEL-CA | FPT-CA
  serial      VARCHAR(100),
  signed_at   TIMESTAMPTZ NOT NULL,
  valid       BOOLEAN,
  raw_response JSONB
);
```

> **Bắt buộc:** sau khi ký, **file không được thay đổi**. Mọi tải xuống đều verify `sha256`; lệch hash ⇒ chặn và cảnh báo.

---

## 13. Module M9 — Tra cứu & tìm kiếm

> Đây là **nhu cầu số 1 của end user** — phải nhanh hơn cách cũ (hỏi Zalo).

### 13.1. Index OpenSearch

```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "vi_analyzer": {
          "tokenizer": "icu_tokenizer",
          "filter": ["icu_folding", "lowercase"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "doc_no":     { "type": "keyword" },
      "subject":    { "type": "text", "analyzer": "vi_analyzer" },
      "full_text":  { "type": "text", "analyzer": "vi_analyzer" },
      "doc_type":   { "type": "keyword" },
      "org_unit_id":{ "type": "keyword" },
      "secrecy_rank":{ "type": "integer" },
      "status":     { "type": "keyword" },
      "effective_date": { "type": "date" },
      "is_latest":  { "type": "boolean" }
    }
  }
}
```

### 13.2. Truy vấn có lọc quyền — **không bao giờ bỏ filter này**

```ts
const query = {
  bool: {
    must: [{ multi_match: { query: q, fields: ['subject^3', 'doc_no^5', 'full_text'] } }],
    filter: [
      { terms: { org_unit_id: ctx.scopedOrgIds } },        // phạm vi dữ liệu
      { range: { secrecy_rank: { lte: ctx.maxClearanceRank } } }, // mức mật
      ...(onlyActive ? [{ term: { status: 'ACTIVE' } }] : []),
    ],
  },
};
```

### 13.3. UX bắt buộc
- Nhãn trạng thái rõ trên mọi kết quả: **Còn hiệu lực · Hết hiệu lực · Bản nháp**.
- Mặc định chỉ hiện **bản mới nhất** (`is_latest = true`); có công tắc "Xem lịch sử phiên bản".
- Bộ lọc facet: loại · đơn vị · năm · trạng thái hiệu lực · mức mật.
- Mục tiêu: **tìm ra văn bản < 1 phút** (tiêu chí thành công của dự án).

---

## 14. Module M10 — Lưu trữ, audit & thông báo

### 14.1. Lịch lưu trữ (retention)

```sql
CREATE TABLE retention_policy (
  id UUID PRIMARY KEY,
  doc_type_id UUID REFERENCES doc_type(id),
  retain_years SMALLINT NOT NULL,      -- hồ sơ DN tối thiểu 10 năm
  action_after VARCHAR(20) NOT NULL    -- ARCHIVE | REVIEW | DESTROY
);
```
> **Không bao giờ tự động hủy.** Đến hạn ⇒ chuyển sang hàng chờ **"Chờ duyệt tiêu hủy"** và cần người có thẩm quyền xác nhận.

### 14.2. Audit trail (ISO 15489)

```sql
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_id    UUID,
  action      VARCHAR(50) NOT NULL,   -- VIEW|CREATE|UPDATE|DELETE|DOWNLOAD|APPROVE|SIGN
  entity      VARCHAR(50) NOT NULL,
  entity_id   UUID,
  before      JSONB, after JSONB,
  ip          INET, user_agent TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON audit_log (entity, entity_id, created_at DESC);
```
Ghi **cả hành vi XEM và TẢI** với văn bản có `secrecy.rank >= 2` (Mật/Tuyệt mật). Bảng chỉ **append-only** — thu hồi quyền UPDATE/DELETE ở tầng DB.

### 14.3. Thông báo
Kênh: in-app + email (giai đoạn 2: Zalo OA). Sự kiện: giao xử lý · tới lượt duyệt · sắp trễ hạn · văn bản mới liên quan · tới hạn rà soát · bị từ chối.

---

## 15. Thiết kế API

Chuẩn REST, prefix `/api/v1`. Mọi response bọc `{ data, meta }`.

### 15.1. Danh mục

```http
GET    /catalog/doc-types?status=1&q=
POST   /catalog/doc-types           { name, abbreviation, description, tier, status }
PUT    /catalog/doc-types/:id
DELETE /catalog/doc-types/:id
GET    /catalog/secrecy-levels
GET    /catalog/urgency-levels
GET    /catalog/partners?q=
POST   /catalog/partners            { name, address, email, phone, status }
```

### 15.2. Thiết lập

```http
GET    /settings
PATCH  /settings/internal-doc       { enabled: true }
GET    /settings/fields?direction=3
PUT    /settings/fields/:id         { label, isRequired, isVisible, displayOrder }
GET    /settings/numbering-rules
POST   /settings/numbering-rules    { template, resetCycle, padding, docTypeId }
```

### 15.3. Sổ văn bản

```http
GET    /books?direction=1&q=
POST   /books                       { name, direction, orgUnitId, managerIds[], viewerIds[] }
PUT    /books/:id
DELETE /books/:id                   → 409 nếu sổ đã có văn bản
PATCH  /books/:id/status            { status: 2 }  → 409 nếu còn văn bản
```

### 15.4. Văn bản

```http
GET    /documents?direction=&bookId=&status=&q=&page=&size=
POST   /documents                   { direction, docTypeId, subject, ... , customFields }
GET    /documents/:id
PUT    /documents/:id               → 409 nếu status không cho sửa
POST   /documents/:id/files         (multipart)
DELETE /documents/:id/files/:fileId
POST   /documents/:id/submit        → DRAFT → FORMAT_CHECK
POST   /documents/:id/approve       { comment }
POST   /documents/:id/reject        { comment }
POST   /documents/:id/sign          { provider }
POST   /documents/:id/issue         → cấp số + vào sổ (1 transaction)
POST   /documents/:id/revisions     { changeNote }   → tăng version
GET    /documents/:id/versions
GET    /documents/:id/links
POST   /documents/:id/links         { toDocumentId | externalRef, linkType }
GET    /documents/:id/audit
```

### 15.5. AI trích xuất

```http
POST   /extraction/upload           (multipart, nhiều tệp) → { jobId, files[] }
GET    /extraction/jobs/:jobId      → { status, results[{ fileId, fields, confidence }] }
POST   /extraction/apply            { documentDraftId, fileId, acceptedFields[] }
```

### 15.6. Quy ước mã lỗi

| HTTP | Khi nào |
|---|---|
| `400` | Sai dữ liệu đầu vào, sai chuyển trạng thái |
| `403` | Ngoài phạm vi dữ liệu hoặc vượt mức mật |
| `409` | Vi phạm ràng buộc nghiệp vụ (xóa sổ còn văn bản, trùng số hiệu) |
| `422` | Thiếu trường bắt buộc theo `field_config` |

---

## 16. Thiết kế màn hình

```
├── Trang chủ / Dashboard
│     Việc của tôi · Chờ tôi duyệt · Sắp trễ hạn · Tới hạn rà soát
├── Quản lý văn bản
│     ├── Tab Văn bản đến   (list + filter + bulk)
│     ├── Tab Văn bản đi
│     ├── Tab Văn bản nội bộ        ← chỉ hiện khi bật ở Thiết lập
│     └── Chi tiết văn bản
│           Thông tin · Tệp đính kèm · Luồng duyệt · Phiên bản
│           · Văn bản liên quan · Nhật ký
├── Quản lý sổ văn bản
│     Sổ văn bản đến | Sổ văn bản đi   (sửa/xóa/tìm/tùy chỉnh cột)
├── Tra cứu          ← màn hình cho end user, tối ưu mobile
└── Thiết lập
      ├── Danh mục: Loại VB · Mức độ mật · Mức độ khẩn · Đối tác
      ├── Tùy chỉnh: Văn bản nội bộ · Trường thông tin
      ├── Quy tắc số hiệu
      ├── Luồng duyệt & Bảng phân quyền (DoA)
      └── Lưu trữ & Bảo mật
```

**Màn hình Thêm mới văn bản** (thứ tự đúng luồng AI):
```
┌─ Tệp văn bản ────────────────────────────────┐
│  [ Kéo thả hoặc bấm để tải tệp ]             │  ← upload TRƯỚC
│  → mở panel trích xuất bên phải              │
│  [Lưu tệp]  [Lưu tệp và thông tin trích xuất]│
└──────────────────────────────────────────────┘
┌─ Thông tin văn bản ──────────────────────────┐
│  Sổ * · Loại VB * · Số hiệu · Trích yếu *    │
│  Ngày ban hành · Ngày hiệu lực · Chủ sở hữu *│
│  Mức mật · Mức khẩn · Đối tác                │
│  [các trường động theo field_config]         │
└──────────────────────────────────────────────┘
```

---

## 17. Lộ trình phát triển

> Nguyên tắc: **không code luồng duyệt & phân quyền trước khi có org chart + RACI** (blocker số 1 của dự án).

| Giai đoạn | Thời lượng | Nội dung | Điều kiện bắt đầu |
|---|---|---|---|
| **P0 · Chuẩn bị** | 2 tuần | Chốt org chart, mã đơn vị, **quy ước số hiệu**, RACI + hạn mức | Workshop HR + anh Dững |
| **P1 · Nền tảng** | 3 tuần | Auth/OIDC, org_unit, user, role, data-scope, audit log | Sau P0 |
| **P2 · Danh mục & Sổ** | 2 tuần | M1 + M2 + field_config + bật/tắt VB nội bộ | Sau P1 |
| **P3 · Văn bản lõi** | 4 tuần | M3 (đến/đi/nội bộ), M4 số hiệu, upload file | Sau P2 |
| **P4 · Tra cứu** | 2 tuần | M9 OpenSearch, mobile UI, nhãn hiệu lực | Song song P3 |
| **P5 · Vòng đời** | 4 tuần | M6 workflow, M7 phiên bản/hiệu lực, ủy quyền TUQ | Cần RACI từ P0 |
| **P6 · AI** | 2 tuần | M5 OCR + trích xuất + review UI | Song song P3–P4 |
| **P7 · Ký số** | 3 tuần | M8 tích hợp CA, PAdES | Sau P5 |
| **P8 · Lưu trữ** | 2 tuần | M10 retention, báo cáo, thống kê | Sau P5 |
| **P9 · Thí điểm** | 4 tuần | Chạy thật 1 đơn vị "sạch", đào tạo, chỉnh sửa | Sau P7 |
| **P10 · Nhân rộng** | — | Mở rộng toàn Holding + di trú tài liệu cũ | Sau P9 nghiệm thu |

**MVP tối thiểu để chạy thí điểm = P1 + P2 + P3 + P4** (khoảng 11 tuần): đủ để vào sổ, cấp số, lưu trữ tập trung và tra cứu — giải quyết ngay nỗi đau lớn nhất.

---

## 18. Yêu cầu phi chức năng

| Nhóm | Chỉ tiêu |
|---|---|
| **Hiệu năng** | Tìm kiếm p95 < 800ms với 500k văn bản; mở chi tiết < 1s |
| **Tải** | 300 người dùng đồng thời; 10k văn bản/năm/pháp nhân |
| **Sẵn sàng** | 99.5% giờ hành chính; RPO 24h, RTO 4h |
| **Sao lưu** | DB daily full + WAL liên tục; object storage versioning; **thử phục hồi hằng quý** |
| **Bảo mật** | TLS 1.2+; mã hóa at-rest; mật khẩu Argon2id; khóa tài khoản sau 5 lần sai; session 8h |
| **Toàn vẹn** | sha256 mọi file; verify khi tải; log lệch hash |
| **Khả năng mở rộng** | Thêm pháp nhân **không cần sửa code**; tái cơ cấu = đổi cây `org_unit` |
| **Tương thích** | Chrome/Edge/Safari 2 phiên bản gần nhất; responsive ≥ 360px |
| **Nhật ký** | Giữ audit log **≥ 10 năm** (bằng thời hạn hồ sơ DN) |

---

## 19. Kiểm thử

### 19.1. Ưu tiên theo rủi ro

| Mức | Hạng mục | Vì sao |
|---|---|---|
| 🔴 **Cao nhất** | Phân quyền & phạm vi dữ liệu | Rò rỉ văn bản mật là rủi ro nghiêm trọng nhất |
| 🔴 | Sinh số hiệu đồng thời | Trùng số = sai nghiệp vụ, khó sửa |
| 🟠 | Chuyển trạng thái workflow | Sai luồng ⇒ ban hành thiếu duyệt |
| 🟠 | Phiên bản & hiệu lực | Đúng mục tiêu "0 vụ dùng nhầm bản cũ" |
| 🟡 | AI trích xuất | Sai thì người dùng sửa được |

### 19.2. Ca kiểm thử bắt buộc

```ts
describe('Data scope', () => {
  it('user phòng A KHÔNG thấy văn bản phòng B', async () => {
    const res = await api.get('/documents').as(userPhongA);
    expect(res.data.every(d => d.orgUnitId === phongA.id)).toBe(true);
  });

  it('chặn xem văn bản vượt mức mật', async () => {
    await expect(api.get(`/documents/${tuyetMatDoc.id}`).as(userClearance1))
      .rejects.toMatchObject({ status: 403 });
  });
});

describe('Numbering', () => {
  it('100 request đồng thời KHÔNG sinh số trùng', async () => {
    const nos = await Promise.all(Array.from({ length: 100 }, () => issueDoc()));
    expect(new Set(nos).size).toBe(100);
  });

  it('số reset về 01 khi sang năm mới', async () => { /* ... */ });
});

describe('Book constraints', () => {
  it('không xóa được sổ đã có văn bản', () =>
    expect(api.delete(`/books/${bookWithDocs.id}`)).rejects.toMatchObject({ status: 409 }));
});
```

### 19.3. UAT theo vai
- **Văn thư:** vào sổ 20 văn bản đến trong 1 buổi, đo thời gian/văn bản.
- **End user:** **quan sát họ tìm một văn bản thật** (không chỉ nghe kể) — mục tiêu < 1 phút.
- **Lãnh đạo:** duyệt trên điện thoại.

---

## 20. Rủi ro kỹ thuật

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| Org chart đổi giữa chừng | Sai toàn bộ phân quyền | Cây `org_unit` versioned; đổi cấu trúc không mất lịch sử |
| Chốt sai quy ước số hiệu | Phải đánh số lại hàng loạt | Engine template + chốt ở P0; hỗ trợ song song 2 kiểu |
| OCR tiếng Việt kém với bản scan mờ | AI trích xuất sai | Luôn cho sửa tay; hiện confidence; không auto-apply |
| Phụ thuộc CA ký số | Không phát hành được | Trừu tượng hóa `SignatureProvider`; hỗ trợ ≥ 2 nhà cung cấp |
| Full-text tiếng Việt không chuẩn | Tìm không ra | ICU analyzer + từ điển đồng nghĩa nội bộ; fallback `ILIKE` |
| Người dùng quay về Zalo/Drive | Dự án thất bại | Tra cứu phải nhanh hơn cách cũ; đo tỷ lệ dùng thật hằng tuần |
| Di trú tài liệu cũ kéo dài | Nghẽn go-live | Tách dự án riêng; go-live không phụ thuộc kho cũ |

---

## Phụ lục A — Checklist trước khi code

- [ ] Org chart chính thức + danh sách pháp nhân + **mã đơn vị** đã chốt
- [ ] **Một** quy ước số hiệu đã chốt (NĐ 30 hay DEGO hay cả hai theo loại)
- [ ] Bảng RACI + hạn mức phê duyệt theo loại việc
- [ ] Danh mục loại văn bản (A–F) đã gắn `tier`, `is_versioned`, `needs_decision`
- [ ] 4 mức mật + ai được clearance nào
- [ ] Chính sách lưu trữ theo loại (≥ 10 năm với hồ sơ DN)
- [ ] Chọn nhà cung cấp chữ ký số
- [ ] Chốt chiến lược **mua/thuê vs tự xây** (tài liệu này giả định **tự xây**)

## Phụ lục B — Ánh xạ tính năng tham chiếu → module

| Tính năng tham chiếu (AMIS) | Module | Mục |
|---|---|---|
| Thiết lập & quản lý Văn bản nội bộ | M1 + M3 | §5.3, §7.1 |
| Phân quyền sử dụng trên AMIS Hệ thống | IAM | §4 |
| Thiết lập danh mục (loại/mật/khẩn/đối tác) | M1 | §5 |
| Trích xuất văn bản với AVA | M5 | §9 |
| Tạo sổ văn bản đến – đi | M2 | §6 |
| *(bổ sung DEGO)* Vòng đời & duyệt | M6 | §10 |
| *(bổ sung DEGO)* Phiên bản & hiệu lực | M7 | §11 |
| *(bổ sung DEGO)* Ký số | M8 | §12 |
| *(bổ sung DEGO)* Lưu trữ & audit | M10 | §14 |


> **NOTE:** M?c d� t�i li?u d? xu?t NestJS, project n�y du?c build d?a tr�n FastAPI + SQLAlchemy (k? th?a t? Procurement Tool) d? t�i s? d?ng Permission system.
