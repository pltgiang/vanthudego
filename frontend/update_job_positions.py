import sys

with open('src/pages/JobPositionList.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Tabs
content = content.replace(
    "const [tab, setTab] = useState<'position' | 'group' | 'title'>('position')",
    "const [tab, setTab] = useState<'position' | 'department' | 'title'>('position')"
)

content = content.replace(
    "<div className={`folder-tab ${tab === 'group' ? 'active' : ''}`} onClick={() => setTab('group')}>Nhóm vị trí</div>",
    "<div className={`folder-tab ${tab === 'department' ? 'active' : ''}`} onClick={() => setTab('department')}>Phòng ban</div>"
)

content = content.replace(
    "{tab === 'group' && <TabGroups ref={tabRef} can={can} />}",
    "{tab === 'department' && <TabDepartments ref={tabRef} can={can} />}"
)

# 2. Slice out TabGroups and GroupFormModal
# Find TabGroups
idx1 = content.find("const TabGroups = forwardRef(")
# Find TabTitles
idx2 = content.find("const TabTitles = forwardRef(")
# Replace TabGroups with empty
if idx1 != -1 and idx2 != -1:
    content = content[:idx1] + content[idx2:]

# Find GroupFormModal
idx3 = content.find("function GroupFormModal(")
# Find TitleFormModal
idx4 = content.find("function TitleFormModal(")
if idx3 != -1 and idx4 != -1:
    content = content[:idx3] + content[idx4:]

# 3. Append TabDepartments and DepartmentFormModal
new_components = """
const TabDepartments = forwardRef(({ can }: any, ref) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [sortCol, setSortCol] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const [visibleCols, setVisibleCols] = useState<string[]>(['code', 'name', 'status', 'actions'])
  const [colMenuOpen, setColMenuOpen] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/departments')
      setData(res.data.data || [])
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  useImperativeHandle(ref, () => ({
    openAddForm: () => {
      setEditing({ id: 0, code: '', name: '', is_active: true })
      setFormOpen(true)
    }
  }));

  const handleDelete = async (id: number, name: string) => {
    if (await askConfirm({ message: `Bạn có chắc muốn xóa phòng ban "${name}"?` })) {
      try {
        await api.delete(`/api/departments/${id}`)
        toast.success('Xóa thành công')
        loadData()
      } catch (e: any) { toast.error(e.message) }
    }
  }

  const handleSort = (col: string) => {
    if (sortCol === col) setSortAsc(!sortAsc)
    else { setSortCol(col); setSortAsc(true) }
  }

  const renderSortIcon = (col: string) => {
    if (sortCol !== col) return <span style={{ opacity: 0.3 }}>↕</span>
    return sortAsc ? <i className="ti ti-arrow-up" /> : <i className="ti ti-arrow-down" />
  }

  let filteredData = data
  if (search) {
    const s = search.toLowerCase()
    filteredData = filteredData.filter((item: any) => 
      Object.values(item).some(v => v && String(v).toLowerCase().includes(s))
    )
  }
  if (sortCol) {
    filteredData = [...filteredData].sort((a, b) => {
      let valA = a[sortCol] || ''
      let valB = b[sortCol] || ''
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()
      if (valA < valB) return sortAsc ? -1 : 1
      if (valA > valB) return sortAsc ? 1 : -1
      return 0
    })
  }

  return (
    <div className="h-100 dis-flex dis-flex-column">
      <div className="toolbar py-16 dis-flex align-items-center justify-content-between mb-16 border-bottom" style={{ gap: '16px', flexWrap: 'nowrap' }}>
        <div className="dis-flex align-items-center" style={{ gap: 16, flex: '1 1 0%', flexWrap: 'wrap' }}>
          <div className="search-box position-relative" style={{ maxWidth: 300, flex: 1, minWidth: 200 }}>
            <i className="ti ti-search position-absolute text-muted" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Tìm kiếm theo mã, tên phòng ban..." 
              style={{ paddingLeft: 36, borderRadius: 6 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="actions dis-flex align-items-center gap-12">
          <button className="btn outline icon-btn" title="Làm mới" onClick={() => loadData()} style={{ borderRadius: 6 }}>
            <i className="ti ti-refresh" />
          </button>
          <div className="position-relative">
            <button className="btn outline icon-btn" title="Cài đặt cột" onClick={() => setColMenuOpen(!colMenuOpen)} style={{ borderRadius: 6 }}>
              <i className="ti ti-columns" />
            </button>
            {colMenuOpen && (
              <div className="position-absolute bg-white border" style={{ top: '100%', right: 0, marginTop: 4, backgroundColor: '#fff', padding: '16px', borderRadius: 8, zIndex: 10, minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                <div style={{ color: '#1e293b', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Hiển thị cột</div>
                <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 15, color: '#0f172a', fontWeight: 600, lineHeight: '2rem' }}>
                  <input type="checkbox" checked={visibleCols.includes('code')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'code'] : prev.filter(c => c !== 'code'))} /> Mã phòng ban
                </label>
                <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 15, color: '#0f172a', fontWeight: 600, lineHeight: '2rem' }}>
                  <input type="checkbox" checked={visibleCols.includes('name')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'name'] : prev.filter(c => c !== 'name'))} /> Tên phòng ban
                </label>
                <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 15, color: '#0f172a', fontWeight: 600, lineHeight: '2rem' }}>
                  <input type="checkbox" checked={visibleCols.includes('status')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'status'] : prev.filter(c => c !== 'status'))} /> Trạng thái
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="table-responsive flex1 border rounded" style={{ borderColor: '#e2e8f0' }}>
        <table className="table table-hover table-px-10 m-0">
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              {visibleCols.includes('code') && <th onClick={() => handleSort('code')} style={{ cursor: 'pointer', userSelect: 'none' }}><div className="dis-flex align-items-center gap-6">Mã phòng ban {renderSortIcon('code')}</div></th>}
              {visibleCols.includes('name') && <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}><div className="dis-flex align-items-center gap-6">Tên phòng ban {renderSortIcon('name')}</div></th>}
              {visibleCols.includes('status') && <th onClick={() => handleSort('is_active')} style={{ cursor: 'pointer', userSelect: 'none' }}><div className="dis-flex align-items-center gap-6">Trạng thái {renderSortIcon('is_active')}</div></th>}
              {visibleCols.includes('actions') && <th className="text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="text-center text-muted">Đang tải...</td></tr> : 
             filteredData.length === 0 ? <tr><td colSpan={4} className="text-center text-muted">Chưa có dữ liệu</td></tr> :
             filteredData.map(item => (
               <tr key={item.id} className={!item.is_active ? 'text-muted' : ''}>
                 {visibleCols.includes('code') && <td>{item.code}</td>}
                 {visibleCols.includes('name') && <td>{item.name}</td>}
                 {visibleCols.includes('status') && <td>
                   {item.is_active ? <span className="badge" style={{backgroundColor: '#eff6ff', color: '#3b82f6'}}>Đang hoạt động</span> : <span className="badge" style={{backgroundColor: '#f1f5f9', color: '#64748b'}}>Ngừng hoạt động</span>}
                 </td>}
                 {visibleCols.includes('actions') && <td className="text-right actions-cell">
                   {can('org_unit', 'write') && (
                     <button className="icon-btn" onClick={() => { if (setEditing) { setEditing(item); setFormOpen(true) } }} title="Sửa"><i className="ti ti-pencil" /></button>
                   )}
                   {can('org_unit', 'delete') && (
                     <button className="icon-btn text-danger" onClick={() => handleDelete(item.id, item.name)} title="Xóa"><i className="ti ti-trash" /></button>
                   )}
                 </td>}
               </tr>
             ))
            }
          </tbody>
        </table>
      </div>
      {formOpen && editing && (
        <DepartmentFormModal initial={editing} onClose={() => setFormOpen(false)} onSuccess={() => { setFormOpen(false); loadData() }} />
      )}
    </div>
  )
})

function DepartmentFormModal({ initial, onClose, onSuccess }: any) {
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)

  const handleChange = (k: string, v: any) => setForm((prev: any) => ({ ...prev, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (form.id) await api.put(`/api/departments/${form.id}`, form)
      else await api.post('/api/departments', form)
      toast.success('Lưu thành công')
      onSuccess()
    } catch (err: any) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    createPortal(<div className="modal-backdrop">
      <div className="modal-content" style={{ width: 500, maxWidth: '95vw' }}>
        <div className="modal-header">
          <h3 className="modal-title">{form.id ? 'Sửa phòng ban' : 'Thêm phòng ban'}</h3>
          <button className="icon-btn" onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div className="modal-body p-16">
          <form id="deptForm" onSubmit={handleSave} className="dis-flex dis-flex-column gap-16">
            <div className="form-group">
              <label className="form-label">Mã phòng ban <span className="text-danger">*</span></label>
              <input type="text" className="form-control" required value={form.code} onChange={e => handleChange('code', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tên phòng ban <span className="text-danger">*</span></label>
              <input type="text" className="form-control" required value={form.name} onChange={e => handleChange('name', e.target.value)} />
            </div>
            <label className="dis-flex align-items-center gap-8 cursor-pointer">
              <input type="checkbox" checked={!form.is_active} onChange={e => handleChange('is_active', !e.target.checked)} />
              <span className="font-medium">Ngừng hoạt động</span>
            </label>
          </form>
        </div>
        <div className="modal-footer actions">
          <button type="button" className="btn btn-default" onClick={onClose} disabled={loading}>Hủy</button>
          <button type="submit" form="deptForm" className="btn btn-primary" disabled={loading}>Lưu thông tin</button>
        </div>
      </div>
    </div>, document.body)
  )
}
"""

content += new_components

with open('src/pages/JobPositionList.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
