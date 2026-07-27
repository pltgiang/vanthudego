import { FilterField } from '../components/FilterBar'
import DepartmentMembers from '../components/DepartmentMembers'
import { fmtDateTime } from '../utils/datetime'

export type FieldDef = {
  key: string
  label: string
  type?: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'select-multiple'
  options?: { value: string; label: string }[]
  readonlyOnEdit?: boolean
  source?: { url: string; value?: string; label?: string }
  onValueChange?: (val: any, form: any, setForm: (k: string, v: any) => void) => void
  colorMap?: Record<string, string>
  zeroAsBlank?: boolean
  default?: any
}

export type Column = { key: string; label: string; render?: (row: any) => any; link?: (row: any) => string }

export type CrudConfig = {
  slug: string
  entity: string
  title: string
  apiPath: string
  columns: Column[]
  fields: FieldDef[]
  filters: FilterField[]
  importExport?: boolean
  rowStyle?: (row: any) => any
  txn?: boolean
  cloneable?: boolean
  detailExtra?: (row: any) => any
}

const badge = (v: any, on = 'Hoạt động', off = 'Ngừng') =>
  <span className={'badge ' + (v ? 'ok' : 'err')}>{v ? on : off}</span>

const ACTIVE_OPTIONS = [
  { value: 'true', label: 'Hoạt động / Hiện' },
  { value: 'false', label: 'Ngừng / Ẩn' },
]

export const cruds: Record<string, CrudConfig> = {
  companies: {
    slug: 'companies', entity: 'company', title: 'Công ty', apiPath: '/api/companies', importExport: true,
    columns: [
      { key: 'code', label: 'Mã' }, { key: 'name', label: 'Tên' }, { key: 'tax_code', label: 'MST' },
      { key: 'legal_rep_name', label: 'Người đại diện' },
      { key: 'is_active', label: 'Trạng thái', render: (r) => badge(r.is_active) },
    ],
    filters: [
      { key: 'code', label: 'Mã' }, { key: 'name', label: 'Tên' }, { key: 'tax_code', label: 'MST' },
      { key: 'is_active', label: 'Trạng thái', type: 'select', options: ACTIVE_OPTIONS },
    ],
    fields: [
      { key: 'code', label: 'Mã', readonlyOnEdit: true }, { key: 'name', label: 'Tên pháp nhân' },
      { key: 'tax_code', label: 'MST' }, { key: 'address', label: 'Địa chỉ', type: 'textarea' },
      { key: 'invoice_email', label: 'Email nhận hóa đơn' },
      { key: 'parent', label: 'Thuộc công ty (ID cha, để trống = gốc)', type: 'number', zeroAsBlank: true },
      { key: 'legal_representative_id', label: 'Người đại diện pháp lý', type: 'select', source: { url: '/api/employees', value: 'id', label: 'full_name' } },
      { key: 'legal_rep_title', label: 'Chức danh' },
      { key: 'is_active', label: 'Trạng thái', type: 'select', options: ACTIVE_OPTIONS },
    ],
  },



  'field_config': {
    slug: 'field-configs', entity: 'field_config', title: 'Thiết lập trường động', apiPath: '/api/field_configs',
    columns: [], fields: [], filters: [],
  },
  'company-info': {
    slug: 'company-info', entity: 'company', title: 'Thông tin công ty', apiPath: '/api/companies', importExport: true,
    columns: [
      { key: 'avatar', label: 'Logo công ty', render: (r) => (
        r.logo ? (
          <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
            <img src={r.logo} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#00aeef', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {r.name ? r.name.charAt(0).toUpperCase() : '?'}
          </div>
        )
      )},
      { key: 'name', label: 'Tên pháp nhân' },
      { key: 'tax_code', label: 'MST' },
      { key: 'address', label: 'Địa chỉ' },
      { key: 'legal_rep_name', label: 'Người đại diện' },
      { key: 'status', label: 'Trạng thái', render: (r) => badge(r.is_active, 'Hoạt động', 'Ngừng') },
    ],
    filters: [
      { key: 'name', label: 'Tên' },
      { key: 'code', label: 'Mã' },
      { key: 'is_active', label: 'Trạng thái', type: 'select', options: [{value: '1', label: 'Hoạt động'}, {value: '0', label: 'Ngừng'}] }
    ],
    fields: []
  },

  roles: {
    slug: 'roles', entity: 'role', title: 'Vai trò', apiPath: '/api/roles',
    columns: [
      { key: 'code', label: 'Mã Vai trò' },
      { key: 'name', label: 'Tên Vai trò' },
      { key: 'description', label: 'Mô tả' }
    ],
    filters: [
      { key: 'code', label: 'Mã' },
      { key: 'name', label: 'Tên' }
    ],
    fields: [
      { key: 'code', label: 'Mã Vai trò', readonlyOnEdit: true },
      { key: 'name', label: 'Tên Vai trò' },
      { key: 'description', label: 'Mô tả', type: 'textarea' }
    ],
  },
  'doc-types': {
    slug: 'doc-types', entity: 'doc_type', title: 'Loại văn bản', apiPath: '/api/doc-types', importExport: true,
    columns: [
      { key: 'name', label: 'Tên loại văn bản' },
      { key: 'abbreviation', label: 'Ký hiệu' },
      { key: 'tier', label: 'Cấp hiệu lực' },
      { key: 'status', label: 'Trạng thái', render: (r) => badge(r.status === 1) },
    ],
    filters: [
      { key: 'name', label: 'Tên' },
      { key: 'abbreviation', label: 'Ký hiệu' },
      { key: 'status', label: 'Trạng thái', type: 'select', options: [{value: '1', label: 'Hoạt động'}, {value: '0', label: 'Ngừng'}] },
    ],
    fields: [
      { key: 'name', label: 'Tên loại văn bản' },
      { key: 'abbreviation', label: 'Ký hiệu' },
      { key: 'tier', label: 'Cấp hiệu lực', type: 'number', default: 1 },
      { key: 'doc_options', label: 'Tùy chọn khác', type: 'boolean-group', options: [{ value: 'is_versioned', label: 'Có phiên bản', default: true }, { value: 'needs_decision', label: 'Cần QĐ ban hành', default: false }] },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
      { key: 'status', label: 'Trạng thái', type: 'select', default: 1, options: [{value: '1', label: 'Hoạt động'}, {value: '0', label: 'Ngừng'}] },
    ],
  },
  'secrecy-levels': {
    slug: 'secrecy-levels', entity: 'secrecy', title: 'Mức độ mật', apiPath: '/api/secrecy-levels',
    columns: [
      { key: 'name', label: 'Mức độ mật' },
      { key: 'code', label: 'Mã' },
      { key: 'rank', label: 'Cấp bậc (0-3)' },
      { key: 'status', label: 'Trạng thái', render: (r) => badge(r.status === 1) },
    ],
    filters: [
      { key: 'name', label: 'Tên' },
      { key: 'status', label: 'Trạng thái', type: 'select', options: [{value: '1', label: 'Hoạt động'}, {value: '0', label: 'Ngừng'}] }
    ],
    fields: [
      { key: 'name', label: 'Tên mức độ' },
      { key: 'code', label: 'Mã' },
      { key: 'rank', label: 'Cấp bậc', type: 'number', default: 0 },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
      { key: 'status', label: 'Trạng thái', type: 'select', default: 1, options: [{value: '1', label: 'Hoạt động'}, {value: '0', label: 'Ngừng'}] },
    ],
  },
  'urgency-levels': {
    slug: 'urgency-levels', entity: 'urgency', title: 'Mức độ khẩn', apiPath: '/api/urgency-levels',
    columns: [
      { key: 'name', label: 'Mức độ khẩn' },
      { key: 'code', label: 'Mã' },
      { key: 'sla_hours', label: 'SLA (giờ)', render: (r: any) => {
          if (r.sla_hours && r.sla_hours < 1 && r.sla_hours > 0) return `${r.sla_hours * 60} phút`;
          return `${r.sla_hours} giờ`;
      }},
      { key: 'status', label: 'Trạng thái', render: (r: any) => badge(r.status === 1) },
    ],
    filters: [
      { key: 'name', label: 'Tên' },
      { key: 'status', label: 'Trạng thái', type: 'select', options: [{value: '1', label: 'Hoạt động'}, {value: '0', label: 'Ngừng'}] }
    ],
    fields: [
      { key: 'name', label: 'Tên mức độ' },
      { key: 'code', label: 'Mã' },
      { key: 'sla_hours', label: 'Cam kết SLA (Giờ xử lý)', type: 'number', default: 24 },
      { key: 'description', label: 'Mô tả', type: 'textarea' },
      { key: 'status', label: 'Trạng thái', type: 'select', default: 1, options: [{value: '1', label: 'Hoạt động'}, {value: '0', label: 'Ngừng'}] },
    ],
  },
  'partners': {
    slug: 'partners', entity: 'partner', title: 'Đối tác (Nơi nhận/gửi)', apiPath: '/api/partners', importExport: true,
    columns: [
      { key: 'name', label: 'Tên đối tác' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'SĐT' },
      { key: 'status', label: 'Trạng thái', render: (r) => badge(r.status === 1) },
    ],
    filters: [
      { key: 'name', label: 'Tên đối tác' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Trạng thái', type: 'select', options: [{value: '1', label: 'Hoạt động'}, {value: '0', label: 'Ngừng'}] }
    ],
    fields: [
      { key: 'name', label: 'Tên đối tác' },
      { key: 'address', label: 'Địa chỉ', type: 'textarea' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Số điện thoại' },
      { key: 'status', label: 'Trạng thái', type: 'select', default: 1, options: [{value: '1', label: 'Hoạt động'}, {value: '0', label: 'Ngừng'}] },
    ],
  },

  'numbering-rules': {
    slug: 'numbering-rules', entity: 'numbering_rule', title: 'Quy tắc số hiệu', apiPath: '/api/numbering_rules',
    columns: [
      { key: 'template', label: 'Ký hiệu' },
      { key: 'direction', label: 'Áp dụng cho', render: (r) => r.direction === 1 ? 'Văn bản đến' : 'Văn bản đi' },
      { key: 'reset_cycle', label: 'Chu kỳ lặp' },
      { key: 'priority', label: 'Độ ưu tiên' },
    ],
    filters: [
      { key: 'template', label: 'Ký hiệu' },
    ],
    fields: [
      { key: 'template', label: 'Ký hiệu mẫu (VD: {seq}/{year}/QĐ)', type: 'textarea' },
      { key: 'direction', label: 'Áp dụng cho', type: 'select', options: [{value: '1', label: 'Văn bản đến'}, {value: '2', label: 'Văn bản đi'}] },
      { key: 'reset_cycle', label: 'Chu kỳ lặp', type: 'select', default: 'YEAR', options: [{value: 'YEAR', label: 'Năm'}, {value: 'MONTH', label: 'Tháng'}, {value: 'NONE', label: 'Không lặp'}] },
      { key: 'padding', label: 'Độ dài số', type: 'number', default: 2 },
      { key: 'priority', label: 'Độ ưu tiên (Số càng lớn càng ưu tiên)', type: 'number', default: 0 },
      { key: 'org_unit_id', label: 'Áp dụng cho đơn vị', type: 'select', source: { url: '/api/org-units', value: 'id', label: 'name' } },
      { key: 'doc_type_id', label: 'Áp dụng cho loại văn bản', type: 'select', source: { url: '/api/doc-types', value: 'id', label: 'name' } },
    ],
  },
}
