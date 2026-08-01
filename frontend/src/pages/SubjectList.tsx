import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconImport, IconExport } from '../components/Icons'
import { api } from '../api/client'
import { toast } from '../components/toast'

const COLUMNS_CONFIG = [
  { id: 'name', label: 'Họ và tên', defaultWidth: 240 },
  { id: 'phone', label: 'ĐT di động', defaultWidth: 140 },
  { id: 'email', label: 'Email cá nhân', defaultWidth: 200 },
  { id: 'department', label: 'Phòng ban', defaultWidth: 200 },
  { id: 'job_title', label: 'Chức danh', defaultWidth: 180 },
  { id: 'account_email', label: 'Email tài khoản', defaultWidth: 200 },
  { id: 'account_phone', label: 'SĐT TK', defaultWidth: 140 },
  { id: 'account_status', label: 'Trạng thái TK', defaultWidth: 160 },
  { id: 'dob', label: 'Ngày sinh', defaultWidth: 130 },
  { id: 'gender', label: 'Giới tính', defaultWidth: 100 },
  { id: 'address', label: 'Địa chỉ', defaultWidth: 240 }
]

export default function SubjectList() {
  const navigate = useNavigate()
  const [visibleCols, setVisibleCols] = useState<string[]>(['name', 'phone', 'email', 'department', 'job_title', 'account_status'])
  const [colMenuOpen, setColMenuOpen] = useState(false)
  const [subjects, setSubjects] = useState<any[]>([])
  
  const [colOrder, setColOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('subject_list_col_order')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return COLUMNS_CONFIG.map(c => c.id)
  })

  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('subject_list_col_widths')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return {}
  })

  const [draggingColId, setDraggingColId] = useState<string | null>(null)

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/api/v1/system/subjects')
      if (res.data.success) {
        setSubjects(res.data.data || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const saveColOrder = (newOrder: string[]) => {
    setColOrder(newOrder)
    localStorage.setItem('subject_list_col_order', JSON.stringify(newOrder))
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingColId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.classList.add('dragging')
    }, 0)
  }

  const handleDrop = (e: React.DragEvent, dropId: string) => {
    e.preventDefault()
    if (!draggingColId || draggingColId === dropId) return
    const newOrder = [...colOrder]
    const dragIdx = newOrder.indexOf(draggingColId)
    const dropIdx = newOrder.indexOf(dropId)
    if (dragIdx > -1 && dropIdx > -1) {
      newOrder.splice(dragIdx, 1)
      newOrder.splice(dropIdx, 0, draggingColId)
      saveColOrder(newOrder)
    }
    setDraggingColId(null)
  }

  const startResize = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.pageX
    const initialWidth = colWidths[id] || COLUMNS_CONFIG.find(c => c.id === id)?.defaultWidth || 200
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.pageX - startX
      let newWidth = Math.max(50, initialWidth + delta)
      setColWidths(prev => {
        const container = document.querySelector('.table-responsive') as HTMLElement;
        if (container) {
          const containerWidth = container.clientWidth - 2;
          let otherColsWidth = 44 + 50;
          activeCols.forEach(c => {
            if (c !== id) otherColsWidth += prev[c] || COLUMNS_CONFIG.find(conf => conf.id === c)?.defaultWidth || 200;
          });
          if (otherColsWidth + newWidth < containerWidth) {
            newWidth = containerWidth - otherColsWidth;
          }
        }
        const next = { ...prev, [id]: newWidth }
        localStorage.setItem('subject_list_col_widths', JSON.stringify(next))
        return next
      })
    }
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const autoFitCol = (id: string) => {
    const cells = document.querySelectorAll(`td[data-col="${id}"], th[data-col="${id}"] span.col-label`)
    let maxWidth = 80
    cells.forEach(cell => {
      const el = cell as HTMLElement
      const originalWhiteSpace = el.style.whiteSpace
      el.style.whiteSpace = 'nowrap'
      const width = el.scrollWidth
      if (width > maxWidth) maxWidth = width
      el.style.whiteSpace = originalWhiteSpace
    })
    
    const calculatedWidth = maxWidth + 32;
    
    setColWidths(prev => {
      let targetWidth = calculatedWidth;
      const container = document.querySelector('.table-responsive') as HTMLElement;
      if (container) {
        const containerWidth = container.clientWidth - 2;
        let otherColsWidth = 44 + 50;
        activeCols.forEach(c => {
          if (c !== id) otherColsWidth += prev[c] || COLUMNS_CONFIG.find(conf => conf.id === c)?.defaultWidth || 200;
        });
        if (otherColsWidth + targetWidth < containerWidth) {
          targetWidth = containerWidth - otherColsWidth;
        }
      }
      const next = { ...prev, [id]: targetWidth }
      localStorage.setItem('subject_list_col_widths', JSON.stringify(next))
      return next
    })
  }

  const renderCell = (colId: string, item: any) => {
    switch (colId) {
      case 'name':
        return (
          <div className="dis-flex align-items-center gap-12">
            <div className="avatar" style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#E0E7FF', color: '#3730A3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 11 }}>
              {(item.subject_name || 'NV').substring(0, 2).toUpperCase()}
            </div>
            <span className="font-weight-bold" style={{ fontSize: 13 }}>{item.subject_name}</span>
          </div>
        )
      case 'phone': return <>{item.contact_phone || '- -'}</>
      case 'email': return <div className="text-truncate" title={item.contact_email} style={{ width: '100%' }}>{item.contact_email || '- -'}</div>
      case 'department': return <>{item.department_names?.length > 0 ? item.department_names.join(', ') : '- -'}</>
      case 'job_title': return <>{item.job_title_names?.length > 0 ? item.job_title_names.join(', ') : '- -'}</>
      case 'account_email': return <div className="text-truncate" title={item.account_email} style={{ width: '100%' }}>{item.account_email || '- -'}</div>
      case 'account_phone': return <>{item.account_phone || '- -'}</>
      case 'account_status':
        return <span className="badge" style={{ backgroundColor: item.user_status === 'ACTIVE' ? '#EAF7EF' : '#F3F4F6', color: item.user_status === 'ACTIVE' ? '#16A34A' : '#6B7280', border: 'none', padding: '4px 8px', borderRadius: 4 }}>{item.user_status === 'ACTIVE' ? 'Đang hoạt động' : item.user_status}</span>
      case 'dob': return <>{item.birth_date ? new Date(item.birth_date).toLocaleDateString('vi-VN') : '- -'}</>
      case 'gender': return <>{item.gender || '- -'}</>
      case 'address': return <div className="text-truncate" title={item.address} style={{ width: '100%' }}>{item.address || '- -'}</div>
      default: return null
    }
  }

  const activeCols = colOrder.filter(id => visibleCols.includes(id))

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column">
      <div className="topbar px-34 py-12 dis-flex align-items-center justify-content-between">
        <h2 className="page-title mb-0">Nhân sự</h2>
        <div className="actions dis-flex align-items-center gap-12">
          <button className="btn ghost icon-btn" title="Nhập dữ liệu" style={{ borderRadius: 6, width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconImport size={18} />
          </button>
          <button className="btn ghost icon-btn" title="Xuất dữ liệu" style={{ borderRadius: 6, width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconExport size={18} />
          </button>
          <button className="btn btn-primary dis-flex align-items-center gap-8" style={{ borderRadius: 6, background: '#00aeef', borderColor: '#00aeef' }} onClick={() => navigate('/subjects/new')}>
            <i className="ti ti-plus" /> Thêm mới
          </button>
        </div>
      </div>

      <div className="content scrollable company-blocks-layout flex1">
        <div className="company-card h-100 dis-flex dis-flex-column" style={{ padding: 24 }}>
          <div className="toolbar px-10 py-16 dis-flex align-items-center justify-content-between border-bottom" style={{ gap: '16px', flexWrap: 'nowrap' }}>
            <div className="dis-flex align-items-center" style={{ gap: 16, flex: '1 1 0%', flexWrap: 'wrap' }}>
              <div className="search-box position-relative" style={{ maxWidth: 300, flex: 1, minWidth: 200 }}>
                <i className="ti ti-search position-absolute text-muted" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" className="form-control" placeholder="Tìm kiếm theo tên, email, số điện thoại..." style={{ paddingLeft: 36, borderRadius: 6 }} />
              </div>
              <select className="form-control" style={{ width: 190, borderRadius: 6 }}>
                <option value="ALL">Tất cả (Trạng thái)</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Ngừng hoạt động</option>
                <option value="PENDING">Chờ xác nhận</option>
              </select>
            </div>
            <div className="actions dis-flex align-items-center gap-12">
              <button className="btn outline icon-btn" title="Làm mới" onClick={fetchSubjects} style={{ borderRadius: 6 }}>
                <i className="ti ti-refresh" />
              </button>
              <div className="position-relative">
                <button className="btn outline icon-btn" title="Cài đặt cột" onClick={() => setColMenuOpen(!colMenuOpen)} style={{ borderRadius: 6 }}>
                  <i className="ti ti-columns" />
                </button>
                {colMenuOpen && (
                  <div className="position-absolute bg-white border" style={{ top: '100%', right: 0, marginTop: 4, backgroundColor: '#fff', padding: '16px', borderRadius: 8, zIndex: 10, minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    <div style={{ color: '#1e293b', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Hiển thị cột</div>
                    {COLUMNS_CONFIG.map(col => (
                      <label key={col.id} className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}>
                        <input type="checkbox" checked={visibleCols.includes(col.id)} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, col.id] : prev.filter(c => c !== col.id))} /> 
                        {col.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="table-responsive flex1 mt-16 table-px-10" style={{ overflowX: 'auto' }}>
            <table className="table table-hover table-px-10 mb-0" style={{ minWidth: 1000, width: 'max-content', tableLayout: 'fixed' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
                <tr>
                  <th style={{ width: 44, textAlign: 'center' }}><input type="checkbox" style={{ width: 16, height: 16 }} /></th>
                  {activeCols.map(colId => {
                    const col = COLUMNS_CONFIG.find(c => c.id === colId)
                    if (!col) return null
                    const width = colWidths[colId] || col.defaultWidth
                    return (
                      <th 
                        key={colId} 
                        data-col={colId}
                        style={{ width, position: 'relative', cursor: 'grab', userSelect: 'none', opacity: draggingColId === colId ? 0.3 : 1 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, colId)}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                        onDrop={(e) => handleDrop(e, colId)}
                        onDragEnd={(e) => { setDraggingColId(null); if (e.target instanceof HTMLElement) e.target.classList.remove('dragging') }}
                      >
                        <span className="col-label text-truncate" style={{ display: 'block', maxWidth: 'calc(100% - 10px)' }}>{col.label}</span>
                        <div 
                          className="col-resizer"
                          onMouseDown={(e) => startResize(e, colId)}
                          onDoubleClick={() => autoFitCol(colId)}
                          style={{
                            position: 'absolute', right: 0, top: 0, bottom: 0, width: 8, cursor: 'col-resize', zIndex: 2, backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#cbd5e1'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        />
                      </th>
                    )
                  })}
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(item => (
                  <tr key={item.id} onClick={() => navigate(`/subjects/${item.id}`)} style={{ cursor: 'pointer' }} className="table-row-clickable">
                    <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}><input type="checkbox" style={{ width: 16, height: 16 }} /></td>
                    {activeCols.map(colId => (
                      <td key={colId} data-col={colId}>{renderCell(colId, item)}</td>
                    ))}
                    <td className="text-right">
                      <button className="btn ghost icon-btn" title="Chỉnh sửa" onClick={(e) => { e.stopPropagation(); navigate(`/subjects/${item.id}`) }} style={{ color: '#0ea5e9' }}>
                        <i className="ti ti-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {subjects.length === 0 && (
                  <tr>
                    <td colSpan={activeCols.length + 2} className="text-center py-20 text-muted">Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-footer px-10 py-16 border-top bg-white dis-flex align-items-center justify-content-between">
            <div className="text-muted" style={{ fontSize: 13 }}>
              Tổng số bản ghi: <span style={{ fontWeight: 600, color: 'rgb(15, 23, 42)' }}>{subjects.length}</span>
            </div>
            <div className="dis-flex align-items-center gap-12">
              <div className="dis-flex align-items-center gap-6">
                <span className="text-muted" style={{ fontSize: 13 }}>Số dòng/trang</span>
                <select className="form-control" style={{ width: 64, height: 32, padding: '0 8px' }}>
                  <option>20</option>
                </select>
              </div>
              <div className="text-muted" style={{ fontSize: 13 }}>1 - 1</div>
              <div className="dis-flex align-items-center gap-4">
                <button className="btn outline icon-btn" style={{ height: 32, width: 32, padding: 0 }}><i className="ti ti-chevrons-left" /></button>
                <button className="btn outline icon-btn" style={{ height: 32, width: 32, padding: 0 }}><i className="ti ti-chevron-left" /></button>
                <button className="btn outline icon-btn" style={{ height: 32, width: 32, padding: 0 }}><i className="ti ti-chevron-right" /></button>
                <button className="btn outline icon-btn" style={{ height: 32, width: 32, padding: 0 }}><i className="ti ti-chevrons-right" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
