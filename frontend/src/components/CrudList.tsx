import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { toast } from './toast'
import { useAuth } from '../auth/AuthContext'
import { cruds } from '../config/cruds'
import ConfirmModal from './ConfirmModal'
import FilterBar from './FilterBar'
import Pagination from './Pagination'
import { IconImport, IconExport } from "./Icons";

export default function CrudList({ entityProp, embedded = false }: { entityProp?: string, embedded?: boolean }) {
  const { entity: paramEntity } = useParams()
  const entity = entityProp || paramEntity
  const cfg = cruds[entity || '']
  const { can, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Filter khởi tạo từ URL query (chỉ nhận key khớp cfg.filters) — vd /purchase-orders?pr_code=PYC-001
  const urlFilters = useMemo(() => {
    const o: Record<string, string> = {}
    cfg?.filters?.forEach((f: any) => { const v = searchParams.get(f.key); if (v) o[f.key] = v })
    return o
  }, [cfg?.slug, searchParams])

  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [filters, setFilters] = useState<Record<string, string>>(urlFilters)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [cloneMode, setCloneMode] = useState(false)
  const [colMenuOpen, setColMenuOpen] = useState(false)
  const [visibleCols, setVisibleCols] = useState<string[]>(cfg?.columns.map((c: any) => c.key) || [])   // bật/tắt cột "Thao tác" (nhân bản)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const storageKey = `crud_widths_${cfg?.slug}_${user?.id || 'guest'}`
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}') } catch { return {} }
  })

  useEffect(() => {
    if (Object.keys(colWidths).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(colWidths))
    }
  }, [colWidths, storageKey])

  const handleColResize = (e: React.MouseEvent, key: string) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = colWidths[key] || 150
    const onMouseMove = (moveEvent: MouseEvent) => {
      setColWidths(prev => ({ ...prev, [key]: Math.max(50, startWidth + (moveEvent.clientX - startX)) }))
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  function handleSort(field: string) {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  async function handleExport() {
    try {
      const params: any = { ...filters };
      if (selectedIds.length > 0) params.ids = selectedIds.join(',');
      const r = await api.get(`${cfg.apiPath}/export/csv`, { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${cfg.slug}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      toast.error('Lỗi khi xuất file');
    }
  }

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean; title: string; message: string;
    confirmText?: string; cancelText?: string; hideCancel?: boolean; variant?: 'danger' | 'warn' | 'info';
    onConfirm: () => void;
  }>({
    open: false, title: '', message: '', onConfirm: () => {},
  })

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) return;

    // Nếu là purchase-requests, kiểm tra chỉ cho xóa phiếu Nháp
    if (cfg.slug === 'purchase-requests') {
      const nonDraftItems = items.filter(
        (item) => selectedIds.includes(item.id) && item.status !== 'draft'
      );
      if (nonDraftItems.length > 0) {
        setConfirmModal({
          open: true,
          title: 'Không thể xóa',
          message: `Không thể xóa item này do trạng thái không phải là Nháp.`,
          confirmText: 'Đã hiểu',
          hideCancel: true,
          variant: 'warn',
          onConfirm: () => setConfirmModal((prev) => ({ ...prev, open: false })),
        });
        return;
      }
    }

    setConfirmModal({
      open: true,
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa ${selectedIds.length} bản ghi đã chọn?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, open: false }));
        try {
          await api.delete(cfg.apiPath, { params: { ids: selectedIds.join(',') } });
          setSelectedIds([]);
          load(page, pageSize, filters);
        } catch (e: any) {
          toast.error(e.response?.data?.message || 'Lỗi khi xóa dữ liệu');
        }
      },
    });
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const r = await api.post(`${cfg.apiPath}/import/csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(r.data.message || 'Nhập file thành công');
      load(page, pageSize, filters);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lỗi khi nhập file');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function load(p = 1, s = 20, f: Record<string, string> = {}) {
    const r = await api.get(cfg.apiPath, { params: { ...f, page: p, page_size: s } })
    const data = r.data.data
    if (Array.isArray(data)) {
      setItems(data)
      setTotal(data.length)
    } else {
      setItems(data.items || [])
      setTotal(data.total || 0)
    }
    setSelectedIds([])
  }
  useEffect(() => {
    if (!cfg) return
    setPage(1); setPageSize(20); setFilters(urlFilters); setSortField(null); setSortDir('asc'); setVisibleCols(cfg?.columns.map((c: any) => c.key) || [])
    load(1, 20, urlFilters)
  }, [cfg?.slug])

  if (!cfg) return <div>Không tìm thấy trang.</div>

  // Chứng từ giao dịch (txn: PYC/PO/khảo sát/YCTT): ai có 'read' là xem danh sách được
  // (trưởng phòng duyệt, quản lý theo dõi...). Nút Thêm/Sửa/Xóa vẫn ẩn theo quyền cụ thể bên dưới.
  // Danh mục (company/product/...): chỉ QUẢN LÝ (write/create/delete) mới xem; người chỉ có 'read'
  // dùng cho dropdown, không xem danh sách.
  const canManage = can(cfg.entity, 'write') || can(cfg.entity, 'create') || can(cfg.entity, 'delete')
  const canView = cfg.txn ? can(cfg.entity, 'read') : canManage
  if (!canView) return (
    <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
      <i className="ti ti-lock" style={{ fontSize: 34, color: '#cbd5e1' }} />
      <div style={{ marginTop: 12, fontSize: 15, color: 'var(--navy)', fontWeight: 600 }}>
        {cfg.txn ? 'Không có quyền xem danh sách này' : 'Không có quyền quản lý danh mục này'}
      </div>
      <div style={{ marginTop: 6, fontSize: 13 }}>
        {cfg.txn ? 'Bạn không có quyền xem chứng từ này.' : 'Bạn chỉ có quyền dùng dữ liệu này trong biểu mẫu (dropdown), không xem/quản lý danh sách.'}
      </div>
      <button className="btn" style={{ marginTop: 16 }} onClick={() => navigate('/')}><i className="ti ti-home" />Về Trang chủ</button>
    </div>
  )

  function applyFilters(f: Record<string, string>) { setFilters(f); setPage(1); load(1, pageSize, f) }
  function changePage(p: number, s: number) { setPage(p); setPageSize(s); load(p, s, filters) }

  const cloneEnabled = !!cfg.cloneable && can(cfg.entity, 'create')
  const showClone = cloneEnabled && cloneMode   // cột "Thao tác" chỉ hiện khi bật chế độ nhân bản
  async function doClone(id: number) {
    try {
      const r = await api.post(`${cfg.apiPath}/${id}/clone`)
      const created = r.data.data
      toast.success(r.data.message || 'Đã nhân bản')
      if (created?.id) navigate(`/${cfg.slug}/${created.id}`)   // nhảy thẳng vào chi tiết phiếu mới
      else load(page, pageSize, filters)
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message || e.response?.data?.message || 'Lỗi khi nhân bản')
    }
  }
  function cloneRow(id: number, code?: string) {
    setConfirmModal({
      open: true,
      title: 'Nhân bản phiếu',
      message: `Bạn chắc chắn muốn nhân bản ${code ? `phiếu "${code}"` : 'phiếu này'}?\n\n`
        + 'Hệ thống sẽ tạo một phiếu MỚI ở trạng thái Nháp. Phiếu mới độc lập, '
        + 'KHÔNG giữ liên kết khảo sát / đơn mua hàng / phê duyệt của phiếu gốc.',
      confirmText: 'Nhân bản',
      cancelText: 'Hủy',
      variant: 'info',
      onConfirm: () => { setConfirmModal((prev) => ({ ...prev, open: false })); doClone(id) },
    })
  }

  return (
    <div className={embedded ? "h-100 dis-flex dis-flex-column" : "company-info-page h-100 dis-flex dis-flex-column"}>
      {!embedded && (
        <div className="topbar dis-flex align-items-center justify-content-between">
          <div className="page-title mb-0 flex1">{cfg.title}</div>
          <div className="actions dis-flex align-items-center gap-12">
            {cfg.importExport && can(cfg.entity, 'write') && (
              <>
                <button className="btn ghost" onClick={() => fileInputRef.current?.click()} title="Nhập dữ liệu"><IconImport size={18} /></button>
                <button className="btn ghost" onClick={handleExport} title="Xuất dữ liệu"><IconExport size={18} /></button>
                <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImport} />
              </>
            )}
            {can(cfg.entity, 'create') && (
              <button className="btn btn-primary dis-flex align-items-center gap-8" style={{ borderRadius: 6, background: '#00aeef', borderColor: '#00aeef' }} onClick={() => navigate(`/${cfg.slug}/new`)}>
                <i className="ti ti-plus" /> Thêm mới
              </button>
            )}
          </div>
        </div>
      )}

      <div className={embedded ? "flex1 dis-flex dis-flex-column" : "content scrollable company-blocks-layout flex1"}>
        <div className={embedded ? "h-100 dis-flex dis-flex-column" : "company-card h-100 dis-flex dis-flex-column"} style={embedded ? {} : { padding: 24 }}>
          
          <div className="toolbar px-10 py-16 dis-flex align-items-center justify-content-between border-bottom" style={{ gap: '16px', flexWrap: 'nowrap' }}>
            <FilterBar key={cfg.slug} fields={cfg.filters} initial={urlFilters} onApply={applyFilters} noCard />
            
            <div className="actions dis-flex align-items-center gap-12">
              {selectedIds.length > 0 && can(cfg.entity, 'delete') && (
                <button className="btn err" onClick={handleDeleteSelected}>
                  <i className="ti ti-trash" />Xóa ({selectedIds.length})
                </button>
              )}
              {cloneEnabled && (
                <button className={cloneMode ? 'btn outline primary' : 'btn outline icon-btn'} onClick={() => setCloneMode((v) => !v)}
                  title="Bật chế độ nhân bản">
                  <i className="ti ti-copy" />
                </button>
              )}
              <button className="btn outline icon-btn" onClick={() => load(1, pageSize, filters)} title="Làm mới" style={{ borderRadius: 6 }}><i className="ti ti-refresh" /></button>
              <div className="position-relative">
                <button className="btn outline icon-btn" title="Cài đặt cột" onClick={() => setColMenuOpen(!colMenuOpen)} style={{ borderRadius: 6 }}><i className="ti ti-columns" /></button>
                {colMenuOpen && (
                  <div className="position-absolute border" style={{ backgroundColor: '#fff', top: '100%', right: 0, marginTop: 4, padding: '16px', borderRadius: 8, zIndex: 10, minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    <div style={{ color: '#1e293b', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Hiển thị cột</div>
                    {cfg.columns.map((c: any) => (
                      <label key={c.key} className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 15, color: '#0f172a', fontWeight: 600, lineHeight: '2rem' }}>
                        <input type="checkbox" checked={visibleCols.includes(c.key)} className="react-checkbox" onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, c.key] : prev.filter(k => k !== c.key))} /> {c.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="table-responsive flex1 mt-16 table-px-10">
            <table className="table table-hover table-px-10" style={{ tableLayout: 'fixed', width: 'auto', minWidth: '100%' }}>
          <thead>
            <tr>
              <th style={{ cursor: 'pointer', userSelect: 'none', position: 'relative', width: colWidths['id'] || 80 }} onClick={() => handleSort('id')}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  ID {sortField === 'id' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                </div>
                <div 
                  onMouseDown={(e) => handleColResize(e, 'id')}
                  onClick={(e) => e.stopPropagation()}
                  style={{ position: 'absolute', top: 0, right: 0, width: 8, height: '100%', cursor: 'col-resize', zIndex: 2, background: 'transparent' }}
                />
              </th>
              {cfg.columns.filter((c: any) => visibleCols.includes(c.key)).map((c: any) => (
                <th key={c.key} style={{ cursor: 'pointer', userSelect: 'none', position: 'relative', width: colWidths[c.key] || 'auto' }} onClick={() => handleSort(c.key)}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {c.label} {sortField === c.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                  </div>
                  <div 
                    onMouseDown={(e) => handleColResize(e, c.key)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ position: 'absolute', top: 0, right: 0, width: 8, height: '100%', cursor: 'col-resize', zIndex: 2, background: 'transparent' }}
                  />
                </th>
              ))}
              {showClone && <th style={{ width: 110, textAlign: 'center' }}>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {(() => {
              const sortedItems = [...items].sort((a, b) => {
                if (!sortField) return 0;
                let valA = a[sortField];
                let valB = b[sortField];

                if (valA == null) return 1;
                if (valB == null) return -1;

                if (typeof valA === 'string' && typeof valB === 'string') {
                  return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                } else {
                  const numA = Number(valA);
                  const numB = Number(valB);
                  if (!isNaN(numA) && !isNaN(numB)) {
                    return sortDir === 'asc' ? numA - numB : numB - numA;
                  }
                  return sortDir === 'asc'
                    ? String(valA).localeCompare(String(valB))
                    : String(valB).localeCompare(String(valA));
                }
              });

              return sortedItems.map((row) => (
                <tr key={row.id} className="clickable" onClick={() => navigate(`/${cfg.slug}/${row.id}`)}>
                  <td>{row.id}</td>
                  {cfg.columns.filter((c: any) => visibleCols.includes(c.key)).map((c: any) => {
                    const content = c.render ? c.render(row) : (row[c.key] ?? '')
                    const href = c.link?.(row)
                    return (
                      <td key={c.key}>
                        {href ? (
                          <span className="clickable" style={{ color: 'var(--teal)', fontWeight: 500 }}
                            onClick={(e) => { e.stopPropagation(); navigate(href) }}>{content}</span>
                        ) : content}
                      </td>
                    )
                  })}
                  {showClone && (
                    <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button className="btn ghost" style={{ height: 30, padding: '0 10px' }}
                        title="Nhân bản thành phiếu nháp mới" onClick={() => cloneRow(row.id, row.code)}>
                        <i className="ti ti-copy" />Nhân bản
                      </button>
                    </td>
                  )}
                </tr>
              ));
            })()}
            {items.length === 0 && (
              <tr><td colSpan={cfg.columns.filter((c: any) => visibleCols.includes(c.key)).length + 1 + (showClone ? 1 : 0)} style={{ textAlign: 'center', color: '#999', padding: 20 }}>Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>

          <Pagination page={page} pageSize={pageSize} total={total} onChange={changePage} />
        </div>
      </div>

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText || 'Xác nhận'}
        cancelText={confirmModal.cancelText || 'Hủy'}
        hideCancel={confirmModal.hideCancel}
        variant={confirmModal.variant || 'danger'}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  )
}
