import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../api/client'
import { toast } from '../components/toast'
import { askConfirm } from '../components/confirm'
import { useAuth } from '../auth/AuthContext'
import { IconImport, IconExport } from '../components/Icons'
import MultiSelect from '../components/MultiSelect'
import '../pages/CompanyInfo.css'
import React, { memo } from 'react'
import DepartmentMembers from '../components/DepartmentMembers'

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: any) { console.error('ErrorBoundary caught error:', error, errorInfo); }
  render() { if (this.state.hasError) return <div style={{padding: 20, color: 'red'}}><h1>Crash!</h1><pre>{String(this.state.error)}</pre></div>; return this.props.children; }
}

export default function JobPositionList() {
  const { can } = useAuth()
  const location = useLocation()
  const [tab, setTab] = useState<'position' | 'department' | 'title'>(location.state?.tab || 'position')
  const tabRef = useRef<any>(null)
  const navigate = useNavigate()

  const handleAdd = () => {
    if (tab === 'position') {
      navigate('/job-positions/new')
    } else if (tab === 'department') {
      navigate('/departments/new')
    } else if (tab === 'title') {
      navigate('/job-titles/new')
    }
  }

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column" style={{ padding: 0, background: '#f1f5f9' }}>

      <div className="topbar px-34 py-12 dis-flex align-items-center justify-content-between" style={{ backgroundColor: '#fff', borderRadius: 0, borderBottom: '1px solid #e2e8f0' }}>
        <h2 className="page-title mb-0 flex1" style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
          Vị trí công việc
        </h2>
        <div className="actions dis-flex align-items-center gap-12">
          <button className="btn ghost" title="Nhập dữ liệu" onClick={() => toast.info('Tính năng đang phát triển')} style={{ borderRadius: 6, width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconImport size={18} />
          </button>
          <button className="btn ghost" title="Xuất dữ liệu" onClick={() => toast.info('Tính năng đang phát triển')} style={{ borderRadius: 6, width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconExport size={18} />
          </button>
          
          {can('job_position', 'create') && (
            <button className="btn btn-primary dis-flex align-items-center gap-8" style={{ borderRadius: 6, background: '#00aeef', borderColor: '#00aeef' }} onClick={handleAdd}>
              <i className="ti ti-plus" /> Thêm mới
            </button>
          )}
        </div>
      </div>
      
      <div className="content scrollable flex1 dis-flex dis-flex-column">
        <div className="folder-tabs-container">
          <div className="folder-tabs">
            <div className={`folder-tab ${tab === 'position' ? 'active' : ''}`} onClick={() => setTab('position')}>Vị trí công việc</div>
            <div className={`folder-tab ${tab === 'department' ? 'active' : ''}`} onClick={() => setTab('department')}>Phòng ban</div>
                        <div className={`folder-tab ${tab === 'title' ? 'active' : ''}`} onClick={() => setTab('title')}>Chức danh</div>
          </div>
        </div>

        <div className="company-card flex1 dis-flex dis-flex-column" style={{ padding: 24, borderRadius: '0 8px 8px 8px', overflow: 'hidden', zIndex: 1, position: 'relative' }}>
          <ErrorBoundary>
            {tab === 'position' && <TabPositions ref={tabRef} can={can} onEdit={(item: any) => navigate('/job-positions/' + item.id)} />}
            {tab === 'department' && <TabDepartments ref={tabRef} can={can} onEdit={(item: any) => navigate('/departments/' + item.id)} />}
            {tab === 'title' && <TabTitles ref={tabRef} can={can} onEdit={(item: any) => navigate('/job-titles/' + item.id)} />}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

const TabPositions = forwardRef(({ can, onEdit }: any, ref) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortCol, setSortCol] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const [visibleCols, setVisibleCols] = useState<string[]>(['code', 'name', 'department', 'company', 'status', 'actions'])
  const [colMenuOpen, setColMenuOpen] = useState(false)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  // form state moved to parent

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/api/v1/system/job-positions?q=${search}&status=${status}`)
      setData(res.data.data || [])
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [search, status])

  useImperativeHandle(ref, () => ({}));

  const handleDelete = async (id: number, name: string) => {
    if (await askConfirm({ message: `Bạn có chắc muốn xóa vị trí "${name}"?` })) {
      try {
        await api.delete(`/api/v1/system/job-positions/${id}`)
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
              placeholder="Tìm kiếm..." 
              style={{ paddingLeft: 36, borderRadius: 6 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-control" style={{ width: 140, borderRadius: 6 }} value={status} onChange={e => setStatus(e.target.value)}>
            <option value="ALL">Tất cả (Trạng thái)</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Ngưng hoạt động</option>
          </select>
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
                  <input type="checkbox" checked={visibleCols.includes('code')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'code'] : prev.filter(c => c !== 'code'))} /> Mã vị trí
                </label>
                <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 15, color: '#0f172a', fontWeight: 600, lineHeight: '2rem' }}>
                  <input type="checkbox" checked={visibleCols.includes('name')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'name'] : prev.filter(c => c !== 'name'))} /> Tên vị trí
                </label>
                <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 15, color: '#0f172a', fontWeight: 600, lineHeight: '2rem' }}>
                  <input type="checkbox" checked={visibleCols.includes('department')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'department'] : prev.filter(c => c !== 'department'))} /> Phòng ban
                </label>
                <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 15, color: '#0f172a', fontWeight: 600, lineHeight: '2rem' }}>
                  <input type="checkbox" checked={visibleCols.includes('company')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'company'] : prev.filter(c => c !== 'company'))} /> Công ty
                </label>
                <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 15, color: '#0f172a', fontWeight: 600, lineHeight: '2rem' }}>
                  <input type="checkbox" checked={visibleCols.includes('desc')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'desc'] : prev.filter(c => c !== 'desc'))} /> Mô tả
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
              {visibleCols.includes('code') && <th onClick={() => handleSort('position_code')} style={{ cursor: 'pointer', userSelect: 'none' }}><div className="dis-flex align-items-center gap-6">Mã vị trí {renderSortIcon('position_code')}</div></th>}
              {visibleCols.includes('name') && <th onClick={() => handleSort('position_name')} style={{ cursor: 'pointer', userSelect: 'none' }}><div className="dis-flex align-items-center gap-6">Tên vị trí {renderSortIcon('position_name')}</div></th>}
              {visibleCols.includes('department') && <th onClick={() => handleSort('department_name')} style={{ cursor: 'pointer', userSelect: 'none' }}><div className="dis-flex align-items-center gap-6">Phòng ban {renderSortIcon('department_name')}</div></th>}
              {visibleCols.includes('company') && <th><div className="dis-flex align-items-center gap-6">Công ty</div></th>}
              {visibleCols.includes('desc') && <th onClick={() => handleSort('description')} style={{ cursor: 'pointer', userSelect: 'none' }}><div className="dis-flex align-items-center gap-6">Mô tả {renderSortIcon('description')}</div></th>}
              {visibleCols.includes('status') && <th onClick={() => handleSort('is_inactive')} style={{ cursor: 'pointer', userSelect: 'none' }}><div className="dis-flex align-items-center gap-6">Trạng thái {renderSortIcon('is_inactive')}</div></th>}
              {visibleCols.includes('actions') && <th className="text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center text-muted">Đang tải...</td></tr> : 
             filteredData.length === 0 ? <tr><td colSpan={5} className="text-center text-muted">Chưa có dữ liệu</td></tr> :
             filteredData.map(item => (
               <tr key={item.id} className={item.is_inactive ? 'text-muted' : ''}>
                 {visibleCols.includes('code') && <td>{item.position_code}</td>}
                 {visibleCols.includes('name') && <td>{item.position_name}</td>}
                 {visibleCols.includes('department') && <td>{item.department_name}</td>}
                 {visibleCols.includes('company') && <td>{item.company_names ? item.company_names.join(', ') : ''}</td>}
                 {visibleCols.includes('desc') && <td>{item.description}</td>}
                 {visibleCols.includes('status') && <td>
                   {!item.is_inactive ? <span className="badge ok">Đang hoạt động</span> : <span className="badge gray">Ngưng hoạt động</span>}
                 </td>}
                 {visibleCols.includes('actions') && <td className="text-right actions-cell">
                   {can('job_position', 'write') && (
                     <button className="icon-btn" onClick={() => { if (onEdit) onEdit(item) }} title="Sửa"><i className="ti ti-pencil" /></button>
                   )}
                   {can('job_position', 'delete') && (
                     <button className="icon-btn text-danger" onClick={() => handleDelete(item.id, item.position_name)} title="Xóa"><i className="ti ti-trash" /></button>
                   )}
                 </td>}
               </tr>
             ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
})

const TabDepartments = forwardRef(({ can, onEdit }: any, ref) => {
  const [data, setData] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [sortCol, setSortCol] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const [visibleCols, setVisibleCols] = useState<string[]>(['code', 'name', 'manager_id', 'status', 'actions'])
  const [colMenuOpen, setColMenuOpen] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [res, subjRes] = await Promise.all([
        api.get('/api/departments'),
        api.get('/api/v1/system/subjects?is_employee=true')
      ])
      setData(res.data.data?.items || res.data.data || [])
      setSubjects(subjRes.data.data?.items || subjRes.data.data || [])
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  useImperativeHandle(ref, () => ({}));

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
                  <input type="checkbox" checked={visibleCols.includes('manager_id')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'manager_id'] : prev.filter(c => c !== 'manager_id'))} /> Trưởng phòng
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
              {visibleCols.includes('manager_id') && <th onClick={() => handleSort('manager_id')} style={{ cursor: 'pointer', userSelect: 'none' }}><div className="dis-flex align-items-center gap-6">Trưởng phòng {renderSortIcon('manager_id')}</div></th>}
              {visibleCols.includes('status') && <th onClick={() => handleSort('is_active')} style={{ cursor: 'pointer', userSelect: 'none' }}><div className="dis-flex align-items-center gap-6">Trạng thái {renderSortIcon('is_active')}</div></th>}
              {visibleCols.includes('actions') && <th className="text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center text-muted">Đang tải...</td></tr> : 
             filteredData.length === 0 ? <tr><td colSpan={6} className="text-center text-muted">Chưa có dữ liệu</td></tr> :
             filteredData.map(item => (
               <tr key={item.id} className={!item.is_active ? 'text-muted' : ''}>
                 {visibleCols.includes('code') && <td>{item.code}</td>}
                 {visibleCols.includes('name') && <td>{item.name}</td>}
                 {visibleCols.includes('manager_id') && <td>
                   {item.manager_id ? (() => {
                     const s = subjects.find(x => x.id === item.manager_id);
                     return s ? s.subject_name : item.manager_id;
                   })() : ''}
                 </td>}
                 {visibleCols.includes('status') && <td>
                   {item.is_active ? <span className="badge ok">Đang hoạt động</span> : <span className="badge gray">Ngưng hoạt động</span>}
                 </td>}
                 {visibleCols.includes('actions') && <td className="text-right actions-cell">
                   {can('org_unit', 'write') && (
                     <button className="icon-btn" onClick={() => { if (onEdit) onEdit(item) }} title="Sửa"><i className="ti ti-pencil" /></button>
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
    </div>
  )
})

const TabTitles = forwardRef(({ can, onEdit }: any, ref) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')

  const [sortCol, setSortCol] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const [visibleCols, setVisibleCols] = useState<string[]>(['code', 'name', 'desc', 'status', 'actions'])
  const [colMenuOpen, setColMenuOpen] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/api/v1/system/job-titles?q=${search}&status=${status}`)
      setData(res.data.data || [])
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [search, status])

  useImperativeHandle(ref, () => ({}));

  const handleDelete = async (id: number, name: string) => {
    if (await askConfirm({ message: `Bạn có chắc muốn xóa chức danh "${name}"?` })) {
      try {
        await api.delete(`/api/v1/system/job-titles/${id}`)
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
              placeholder="Tìm kiếm theo mã, tên chức danh..." 
              style={{ paddingLeft: 36, borderRadius: 6 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-control" style={{ width: 140, borderRadius: 6 }} value={status} onChange={e => setStatus(e.target.value)}>
            <option value="ALL">Tất cả (Trạng thái)</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Ngưng hoạt động</option>
          </select>
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
                  <input type="checkbox" checked={visibleCols.includes('code')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'code'] : prev.filter(c => c !== 'code'))} /> Mã chức danh
                </label>
                <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 15, color: '#0f172a', fontWeight: 600, lineHeight: '2rem' }}>
                  <input type="checkbox" checked={visibleCols.includes('name')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'name'] : prev.filter(c => c !== 'name'))} /> Tên chức danh
                </label>
                <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 15, color: '#0f172a', fontWeight: 600, lineHeight: '2rem' }}>
                  <input type="checkbox" checked={visibleCols.includes('desc')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'desc'] : prev.filter(c => c !== 'desc'))} /> Mô tả
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
              {visibleCols.includes('code') && <th onClick={() => handleSort('title_code')} style={{ cursor: 'pointer', userSelect: 'none' }}><div className="dis-flex align-items-center gap-6">Mã chức danh {renderSortIcon('title_code')}</div></th>}
              {visibleCols.includes('name') && <th onClick={() => handleSort('title_name')} style={{ cursor: 'pointer', userSelect: 'none' }}><div className="dis-flex align-items-center gap-6">Tên chức danh {renderSortIcon('title_name')}</div></th>}
              {visibleCols.includes('desc') && <th onClick={() => handleSort('description')} style={{ cursor: 'pointer', userSelect: 'none' }}><div className="dis-flex align-items-center gap-6">Mô tả {renderSortIcon('description')}</div></th>}
              {visibleCols.includes('status') && <th onClick={() => handleSort('is_inactive')} style={{ cursor: 'pointer', userSelect: 'none' }}><div className="dis-flex align-items-center gap-6">Trạng thái {renderSortIcon('is_inactive')}</div></th>}
              {visibleCols.includes('actions') && <th className="text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center text-muted">Đang tải...</td></tr> : 
             filteredData.length === 0 ? <tr><td colSpan={5} className="text-center text-muted">Chưa có dữ liệu</td></tr> :
             filteredData.map(item => (
               <tr key={item.id} className={item.is_inactive ? 'text-muted' : ''}>
                 {visibleCols.includes('code') && <td>{item.title_code}</td>}
                 {visibleCols.includes('name') && <td>{item.title_name}</td>}
                 {visibleCols.includes('desc') && <td>{item.description}</td>}
                 {visibleCols.includes('status') && <td>
                   {!item.is_inactive ? <span className="badge ok">Đang hoạt động</span> : <span className="badge gray">Ngưng hoạt động</span>}
                 </td>}
                 {visibleCols.includes('actions') && <td className="text-right actions-cell">
                   {can('job_position', 'write') && (
                     <button className="icon-btn" onClick={() => { if (onEdit) onEdit(item) }} title="Sửa"><i className="ti ti-pencil" /></button>
                   )}
                   {can('job_position', 'delete') && (
                     <button className="icon-btn text-danger" onClick={() => handleDelete(item.id, item.title_name)} title="Xóa"><i className="ti ti-trash" /></button>
                   )}
                 </td>}
               </tr>
             ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
})
