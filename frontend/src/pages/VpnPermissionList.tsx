import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { toast } from '../components/toast'
import { IconImport, IconExport } from '../components/Icons'

export default function VpnPermissionList() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCompany, setFilterCompany] = useState('ALL')
  const [filterDept, setFilterDept] = useState('ALL')
  const [filterVpn, setFilterVpn] = useState('ALL')
  const [showColSettings, setShowColSettings] = useState(false)
  const [cols, setCols] = useState({
    code: true,
    name: true,
    company: true,
    dept: true,
    dego: true,
    ida: true,
    ida_1433: true
  })

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/v1/system/subjects?status=ACTIVE')
      if (res.data.success) {
        setSubjects(res.data.data?.items || res.data.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const handleToggleVpn = async (id: number, server: string, isChecked: boolean, currentAccess: string) => {
    const servers = currentAccess ? currentAccess.split(',').map(s => s.trim()).filter(s => s) : []
    let newServers = [...servers]
    if (isChecked && !newServers.includes(server)) {
      newServers.push(server)
    } else if (!isChecked && newServers.includes(server)) {
      newServers = newServers.filter(s => s !== server)
    }
    
    const newAccessString = newServers.join(',')
    
    // Optimistic update
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, vpn_access: newAccessString } : s))
    
    try {
      await api.patch(`/api/v1/system/subjects/${id}/vpn`, { vpn_access: newAccessString })
      toast.success('Đã cập nhật phân quyền VPN')
    } catch (e: any) {
      toast.error('Cập nhật thất bại: ' + (e.response?.data?.message || e.message))
      fetchSubjects() // Revert on failure
    }
  }

  const companies = Array.from(new Set(subjects.flatMap(s => Array.isArray(s.company_names) ? s.company_names : (typeof s.company_names === 'string' ? [s.company_names] : [])))).filter(Boolean) as string[]
  const departments = Array.from(new Set(subjects.flatMap(s => Array.isArray(s.department_names) ? s.department_names : (typeof s.department_names === 'string' ? [s.department_names] : [])))).filter(Boolean) as string[]

  const filteredSubjects = subjects.filter(s => {
    const term = search.toLowerCase()
    const matchSearch = (s.subject_name || '').toLowerCase().includes(term) ||
                        (s.subject_code || '').toLowerCase().includes(term)
    
    const sCompanies = Array.isArray(s.company_names) ? s.company_names : (typeof s.company_names === 'string' ? [s.company_names] : [])
    const matchCompany = filterCompany === 'ALL' || sCompanies.includes(filterCompany)
    const sDepartments = Array.isArray(s.department_names) ? s.department_names : (typeof s.department_names === 'string' ? [s.department_names] : [])
    const matchDept = filterDept === 'ALL' || sDepartments.includes(filterDept)
    
    const servers = s.vpn_access ? s.vpn_access.split(',').map((s: string) => s.trim()) : []
    const matchVpn = filterVpn === 'ALL' || servers.includes(filterVpn)
    
    return matchSearch && matchCompany && matchDept && matchVpn
  })

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column">
      <div className="topbar px-34 py-12 dis-flex align-items-center justify-content-between border-bottom">
        <h2 className="page-title mb-0">Phân quyền Truy cập máy chủ (VPN)</h2>
        <div className="actions dis-flex align-items-center gap-12">
          <button className="btn ghost icon-btn" title="Nhập dữ liệu" style={{ borderRadius: 6, width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconImport size={18} />
          </button>
          <button className="btn ghost icon-btn" title="Xuất dữ liệu" style={{ borderRadius: 6, width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconExport size={18} />
          </button>
        </div>
      </div>

      <div className="content scrollable company-blocks-layout flex1">
        <div className="company-card h-100 dis-flex dis-flex-column" style={{ padding: 24 }}>
          <div className="toolbar px-10 py-16 dis-flex align-items-center justify-content-between border-bottom" style={{ gap: '16px', flexWrap: 'nowrap' }}>
            <div className="dis-flex align-items-center" style={{ gap: 16, flex: '1 1 0%', flexWrap: 'wrap' }}>
              <div className="search-box position-relative" style={{ maxWidth: 300, flex: 1, minWidth: 200 }}>
                <i className="ti ti-search position-absolute text-muted" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Tìm kiếm theo mã NV, họ tên..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 36, borderRadius: 6 }} 
                />
              </div>
              <select className="form-control" value={filterCompany} onChange={e => setFilterCompany(e.target.value)} style={{ width: 180, borderRadius: 6 }}>
                <option value="ALL">Tất cả Công ty</option>
                {companies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="form-control" value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: 180, borderRadius: 6 }}>
                <option value="ALL">Tất cả Phòng Ban</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="form-control" value={filterVpn} onChange={e => setFilterVpn(e.target.value)} style={{ width: 180, borderRadius: 6 }}>
                <option value="ALL">Tất cả Quyền VPN</option>
                <option value="Dego">Dego</option>
                <option value="IDA">IDA</option>
                <option value="IDA_1433">IDA,1433</option>
              </select>
            </div>
            <div className="actions dis-flex align-items-center gap-12">
              <button className="btn outline icon-btn" title="Làm mới" onClick={fetchSubjects} style={{ borderRadius: 6 }} disabled={loading}>
                <i className="ti ti-refresh" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              </button>
              <div className="position-relative">
                <button className="btn outline icon-btn" title="Cài đặt cột" onClick={() => setShowColSettings(!showColSettings)} style={{ borderRadius: 6 }}>
                  <i className="ti ti-columns" />
                </button>
                {showColSettings && (
                  <>
                    <div className="position-fixed" style={{ inset: 0, zIndex: 9 }} onClick={() => setShowColSettings(false)} />
                    <div className="position-absolute bg-white border" style={{ top: '100%', right: 0, marginTop: 4, borderRadius: 6, zIndex: 10, width: 200, padding: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <div className="font-weight-bold mb-12 pb-8 border-bottom" style={{ fontSize: 13 }}>Hiển thị cột</div>
                      <label className="dis-flex align-items-center gap-8 mb-8 cursor-pointer" style={{ fontSize: 13 }}><input type="checkbox" checked={cols.code} onChange={e => setCols(c => ({...c, code: e.target.checked}))} /> Mã NV</label>
                      <label className="dis-flex align-items-center gap-8 mb-8 cursor-pointer" style={{ fontSize: 13 }}><input type="checkbox" checked={cols.name} onChange={e => setCols(c => ({...c, name: e.target.checked}))} /> Họ tên</label>
                      <label className="dis-flex align-items-center gap-8 mb-8 cursor-pointer" style={{ fontSize: 13 }}><input type="checkbox" checked={cols.company} onChange={e => setCols(c => ({...c, company: e.target.checked}))} /> Công ty</label>
                      <label className="dis-flex align-items-center gap-8 mb-8 cursor-pointer" style={{ fontSize: 13 }}><input type="checkbox" checked={cols.dept} onChange={e => setCols(c => ({...c, dept: e.target.checked}))} /> Phòng ban</label>
                      <label className="dis-flex align-items-center gap-8 mb-8 cursor-pointer" style={{ fontSize: 13 }}><input type="checkbox" checked={cols.dego} onChange={e => setCols(c => ({...c, dego: e.target.checked}))} /> Dego</label>
                      <label className="dis-flex align-items-center gap-8 mb-8 cursor-pointer" style={{ fontSize: 13 }}><input type="checkbox" checked={cols.ida} onChange={e => setCols(c => ({...c, ida: e.target.checked}))} /> IDA</label>
                      <label className="dis-flex align-items-center gap-8 mb-0 cursor-pointer" style={{ fontSize: 13 }}><input type="checkbox" checked={cols.ida_1433} onChange={e => setCols(c => ({...c, ida_1433: e.target.checked}))} /> IDA,1433</label>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="table-responsive flex1 mt-16 table-px-10">
            <table className="table table-hover table-px-10 mb-0">
              <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
                <tr>
                  {cols.code && <th style={{ width: 120 }}>Mã NV</th>}
                  {cols.name && <th style={{ width: 240 }}>Họ tên</th>}
                  {cols.company && <th style={{ width: 200 }}>Công ty</th>}
                  {cols.dept && <th style={{ width: 200 }}>Phòng Ban</th>}
                  {cols.dego && <th style={{ width: 100, textAlign: 'center' }}>Dego</th>}
                  {cols.ida && <th style={{ width: 100, textAlign: 'center' }}>IDA</th>}
                  {cols.ida_1433 && <th style={{ width: 100, textAlign: 'center' }}>IDA,1433</th>}
                  <th style={{ width: 60, textAlign: 'center' }}>Sửa</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map(item => {
                  const access = item.vpn_access || ''
                  const servers = access.split(',').map((s: string) => s.trim())
                  
                  return (
                    <tr key={item.id}>
                      {cols.code && <td className="font-weight-bold">{item.subject_code || '- -'}</td>}
                      {cols.name && <td>
                        <div className="dis-flex align-items-center gap-12">
                          <div className="avatar" style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#E0E7FF', color: '#3730A3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 11 }}>
                            {(item.subject_name || 'NV').substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-weight-bold" style={{ fontSize: 13 }}>{item.subject_name}</span>
                        </div>
                      </td>}
                      {cols.company && <td>{Array.isArray(item.company_names) && item.company_names.length > 0 ? item.company_names.join(', ') : (typeof item.company_names === 'string' ? item.company_names : '- -')}</td>}
                      {cols.dept && <td>{Array.isArray(item.department_names) && item.department_names.length > 0 ? item.department_names.join(', ') : (typeof item.department_names === 'string' ? item.department_names : '- -')}</td>}
                      {cols.dego && <td style={{ textAlign: 'center' }}>
                        <div className="dis-flex justify-content-center">
                          <label className="cursor-pointer" style={{ margin: 0 }}>
                            <div className={`switch-toggle ${servers.includes('Dego') ? 'active' : ''}`} onClick={() => handleToggleVpn(item.id, 'Dego', !servers.includes('Dego'), access)}>
                              <div className="switch-knob"></div>
                            </div>
                          </label>
                        </div>
                      </td>}
                      {cols.ida && <td style={{ textAlign: 'center' }}>
                        <div className="dis-flex justify-content-center">
                          <label className="cursor-pointer" style={{ margin: 0 }}>
                            <div className={`switch-toggle ${servers.includes('IDA') ? 'active' : ''}`} onClick={() => handleToggleVpn(item.id, 'IDA', !servers.includes('IDA'), access)}>
                              <div className="switch-knob"></div>
                            </div>
                          </label>
                        </div>
                      </td>}
                      {cols.ida_1433 && <td style={{ textAlign: 'center' }}>
                        <div className="dis-flex justify-content-center">
                          <label className="cursor-pointer" style={{ margin: 0 }}>
                            <div className={`switch-toggle ${servers.includes('IDA_1433') ? 'active' : ''}`} onClick={() => handleToggleVpn(item.id, 'IDA_1433', !servers.includes('IDA_1433'), access)}>
                              <div className="switch-knob"></div>
                            </div>
                          </label>
                        </div>
                      </td>}
                      <td style={{ textAlign: 'center' }}>
                        <button className="btn ghost icon-btn" title="Chỉnh sửa" onClick={() => navigate(`/vpn/${item.id}`)} style={{ color: '#0ea5e9' }}>
                          <i className="ti ti-edit"></i>
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filteredSubjects.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-20 text-muted">Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="pagination-footer px-10 py-16 border-top bg-white dis-flex align-items-center justify-content-between">
            <div className="text-muted" style={{ fontSize: 13 }}>
              Tổng số bản ghi: <span style={{ fontWeight: 600, color: 'rgb(15, 23, 42)' }}>{filteredSubjects.length}</span>
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
