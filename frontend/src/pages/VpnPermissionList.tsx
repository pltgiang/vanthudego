import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { toast } from '../components/toast'

export default function VpnPermissionList() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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

  const handleToggleVpn = async (id: int, server: string, isChecked: boolean, currentAccess: string) => {
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

  const filteredSubjects = subjects.filter(s => {
    const term = search.toLowerCase()
    return (s.subject_name || '').toLowerCase().includes(term) ||
           (s.subject_code || '').toLowerCase().includes(term)
  })

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column">
      <div className="topbar px-34 py-12 dis-flex align-items-center justify-content-between border-bottom">
        <h2 className="page-title mb-0">Phân quyền Truy cập máy chủ (VPN)</h2>
        <div className="actions dis-flex align-items-center gap-12">
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
            </div>
            <div className="actions dis-flex align-items-center gap-12">
              <button className="btn outline icon-btn" title="Làm mới" onClick={fetchSubjects} style={{ borderRadius: 6 }}>
                <i className="ti ti-refresh" />
              </button>
            </div>
          </div>
          
          <div className="table-responsive flex1 mt-16 table-px-10">
            <table className="table table-hover table-px-10 mb-0">
              <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
                <tr>
                  <th style={{ width: 120 }}>Mã NV</th>
                  <th style={{ width: 240 }}>Họ tên</th>
                  <th style={{ width: 200 }}>Công ty</th>
                  <th style={{ width: 200 }}>Phòng Ban</th>
                  <th style={{ width: 300 }}>Thao tác (Quyền truy cập VPN)</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map(item => {
                  const access = item.vpn_access || ''
                  const servers = access.split(',').map((s: string) => s.trim())
                  
                  return (
                    <tr key={item.id}>
                      <td className="font-weight-bold">{item.subject_code || '- -'}</td>
                      <td>
                        <div className="dis-flex align-items-center gap-12">
                          <div className="avatar" style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#E0E7FF', color: '#3730A3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 11 }}>
                            {(item.subject_name || 'NV').substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-weight-bold" style={{ fontSize: 13 }}>{item.subject_name}</span>
                        </div>
                      </td>
                      <td>{item.org_unit_names?.length > 0 ? item.org_unit_names.join(', ') : '- -'}</td>
                      <td>{item.department_names?.length > 0 ? item.department_names.join(', ') : '- -'}</td>
                      <td>
                        <div className="dis-flex align-items-center gap-16">
                          <label className="dis-flex align-items-center gap-8 cursor-pointer" style={{ margin: 0 }}>
                            <div className={`switch-toggle ${servers.includes('Dego') ? 'active' : ''}`} onClick={() => handleToggleVpn(item.id, 'Dego', !servers.includes('Dego'), access)}>
                              <div className="switch-knob"></div>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: servers.includes('Dego') ? '#0f172a' : '#64748b' }}>Dego</span>
                          </label>
                          <label className="dis-flex align-items-center gap-8 cursor-pointer" style={{ margin: 0 }}>
                            <div className={`switch-toggle ${servers.includes('IDA') ? 'active' : ''}`} onClick={() => handleToggleVpn(item.id, 'IDA', !servers.includes('IDA'), access)}>
                              <div className="switch-knob"></div>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: servers.includes('IDA') ? '#0f172a' : '#64748b' }}>IDA</span>
                          </label>
                          <label className="dis-flex align-items-center gap-8 cursor-pointer" style={{ margin: 0 }}>
                            <div className={`switch-toggle ${servers.includes('IDA,1433') ? 'active' : ''}`} onClick={() => handleToggleVpn(item.id, 'IDA,1433', !servers.includes('IDA,1433'), access)}>
                              <div className="switch-knob"></div>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: servers.includes('IDA,1433') ? '#0f172a' : '#64748b' }}>IDA,1433</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredSubjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-20 text-muted">Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
