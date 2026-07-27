import { useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import SearchSelect from './SearchSelect'

export type FilterField = {
  key: string
  label: string
  type?: 'text' | 'select' | 'daterange'   // daterange -> gửi 2 param <key>_from / <key>_to
  options?: { value: string; label: string }[]
  // Nguồn option động từ API (vd suppliers, companies, item-groups...)
  source?: { url: string; value?: string; label?: string }
}

/** Số trường luôn hiển thị; phần còn lại ẩn sau nút toggle */
const VISIBLE_COUNT = 2

export default function FilterBar({
  fields, onApply, extra, initial, noCard,
}: {
  fields: FilterField[]
  onApply: (params: Record<string, string>) => void
  extra?: React.ReactNode
  noCard?: boolean
  initial?: Record<string, string>   // giá trị lọc khởi tạo (vd điền sẵn từ URL query)
}) {
  const [vals, setVals] = useState<Record<string, string>>(initial || {})
  const [dyn, setDyn] = useState<Record<string, { value: string; label: string }[]>>({})
  const onApplyRef = useRef(onApply)
  onApplyRef.current = onApply
  const first = useRef(true)

  // Tất cả các trường luôn được hiển thị
  const visibleFields = fields

  useEffect(() => {
    fields.filter((f) => f.source).forEach((f) => {
      api.get(f.source!.url, { params: { page_size: 1000 } }).then((r) => {
        const vk = f.source!.value || 'code'
        const lk = f.source!.label || 'name'
        const opts = (r.data.data.items || []).map((it: any) => ({
          value: String(it[vk] ?? ''), label: String(it[lk] ?? it[vk] ?? ''),
        })).filter((o: any) => o.value)
        setDyn((s) => ({ ...s, [f.key]: opts }))
      }).catch(() => {})
    })
  }, [fields])

  // Tự lọc khi ngừng gõ / đổi lựa chọn (debounce 400ms) — không cần bấm nút
  useEffect(() => {
    if (first.current) { first.current = false; return }
    const t = setTimeout(() => {
      const params: Record<string, string> = {}
      Object.entries(vals).forEach(([k, v]) => { if (v) params[k] = v })
      onApplyRef.current(params)
    }, 400)
    return () => clearTimeout(t)
  }, [vals])

  function set(k: string, v: string) { setVals((s) => ({ ...s, [k]: v })) }
  function clear() { setVals({}) }

  function renderField(f: FilterField) {
    const opts = f.options || dyn[f.key]
    if (f.type === 'select' || f.source) {
      return (
        <div key={f.key} style={{ minWidth: 160 }}>
          <SearchSelect value={vals[f.key] || ''} options={opts || []} placeholder={`Tất cả ${f.label}`} onChange={(v) => set(f.key, v)} />
        </div>
      )
    }
    
    if (f.type === 'daterange') {
      return (
        <div key={f.key} className="dis-flex align-items-center gap-8">
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="date" className="form-control" title={`Từ ${f.label}`} value={vals[f.key + '_from'] || ''} onChange={(e) => set(f.key + '_from', e.target.value)} style={{ borderRadius: 6 }} />
            <span style={{ color: 'var(--muted)' }}>–</span>
            <input type="date" className="form-control" title={`Đến ${f.label}`} value={vals[f.key + '_to'] || ''} onChange={(e) => set(f.key + '_to', e.target.value)} style={{ borderRadius: 6 }} />
          </div>
        </div>
      )
    }

    // Default: text input (Search box)
    return (
      <div key={f.key} className="search-box position-relative" style={{ maxWidth: 300, flex: 1, minWidth: 200 }}>
        <i className="ti ti-search position-absolute text-muted" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}></i>
        <input type="text" className="form-control" placeholder={`Tìm kiếm theo ${f.label}...`} value={vals[f.key] || ''}
               onChange={(e) => set(f.key, e.target.value)} style={{ paddingLeft: 36, borderRadius: 6 }} />
      </div>
    )
  }

  const inner = (
      <div className="dis-flex align-items-center" style={{ gap: 16, flex: '1 1 0%', flexWrap: 'wrap' }}>
        {visibleFields.map(renderField)}
        {Object.values(vals).some((v) => v) && (
          <button className="btn ghost" onClick={clear} style={{ height: 40, borderRadius: 6, padding: '0 16px' }}>
            Xóa lọc
          </button>
        )}
      </div>
  )
  
  if (noCard) return inner;
  return (
    <div className="card" style={{ padding: 18, marginBottom: 14 }}>
      {inner}
    </div>
  )
}
