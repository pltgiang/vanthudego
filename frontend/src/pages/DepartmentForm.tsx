import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { toast } from '../components/toast'
import { askConfirm } from '../components/confirm'
import '../pages/CompanyInfo.css'

export default function DepartmentForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const isNew = !id || id === 'new'
  
  const [form, setForm] = useState<any>({
    id: 0, code: '', name: '', company_id: 0, parent_id: 0, manager_id: null, is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [subjects, setSubjects] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rs, rd] = await Promise.all([
          api.get('/api/v1/system/subjects?is_employee=true'),
          api.get('/api/departments')
        ])
        setSubjects(rs.data.data?.items || rs.data.data || [])
        setDepartments((rd.data.data?.items || rd.data.data || []).filter((d: any) => d.id !== (isNew ? 0 : parseInt(id || '0'))))
        
        if (!isNew) {
          const [res, logRes] = await Promise.all([
            api.get(`/api/departments/${id}`),
            api.get(`/api/audit-logs?entity=org_unit&entity_id=${id}`)
          ])
          if (res.data.data) {
            setForm(res.data.data)
            setAuditLogs(logRes.data.data || [])
          } else {
            toast.error('Không tìm thấy phòng ban')
            navigate('/job-positions', { state: { tab: 'department' } }) // Go back to job-positions which contains the department tab
          }
        }
      } catch (err: any) {
        toast.error(err.message)
      } finally {
        setInitialLoading(false)
      }
    }
    fetchData()
  }, [id, isNew, navigate])

  const handleChange = (k: string, v: any) => setForm((prev: any) => ({ ...prev, [k]: v }))

  const handleSave = async (closeAfterSave: boolean) => {
    setLoading(true)
    try {
      let res;
      if (form.id) {
        res = await api.patch(`/api/departments/${form.id}`, form)
      } else {
        res = await api.post('/api/departments', form)
      }
      toast.success('Đã lưu')
      if (closeAfterSave) {
        navigate('/job-positions', { state: { tab: 'department' } })
      } else {
        if (!form.id && res.data?.data?.id) {
          navigate(`/departments/${res.data.data.id}`, { replace: true })
        } else if (form.id) {
          const logRes = await api.get(`/api/audit-logs?entity=org_unit&entity_id=${form.id}`)
          setAuditLogs(logRes.data.data || [])
        }
      }
    } catch (err: any) { 
      toast.error(err.message) 
    } finally { 
      setLoading(false) 
    }
  }

  const handleDelete = async () => {
    if (await askConfirm({ message: `Bạn có chắc muốn xóa phòng ban "${form.name}"?` })) {
      try {
        await api.delete(`/api/departments/${form.id}`)
        toast.success('Xóa thành công')
        navigate('/job-positions', { state: { tab: 'department' } })
      } catch (e: any) { toast.error(e.message) }
    }
  }

  if (initialLoading) return <div className="p-24 text-muted">Đang tải...</div>

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column bg-slate-50">
      <div className="topbar px-24 py-12 dis-flex align-items-center bg-white border-bottom">
        <button type="button" className="btn ghost icon-btn" onClick={() => navigate('/job-positions', { state: { tab: 'department' } })} style={{ background: '#f1f5f9', marginRight: 16 }}>
          <i className="ti ti-arrow-left"></i>
        </button>
        <h2 className="page-title mb-0 flex1" style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
          {!isNew ? 'Chỉnh sửa phòng ban' : 'Thêm mới phòng ban'}
        </h2>
        <div className="actions dis-flex">
          <button type="button" className="btn ghost" onClick={() => navigate('/job-positions', { state: { tab: 'department' } })} disabled={loading} style={{ background: '#f1f5f9', color: '#475569', border: 'none', marginRight: 12 }}>Hủy bỏ</button>
          <button type="button" className="btn" onClick={() => handleSave(false)} disabled={loading} style={{ marginRight: 12, background: 'white', border: '1px solid #cbd5e1', color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="ti ti-device-floppy"></i> Lưu
          </button>
          <button type="button" className="btn btn-primary" onClick={() => handleSave(true)} disabled={loading}>Hoàn tất</button>
        </div>
      </div>

      <div className="content scrollable company-blocks-layout">
        <div className="row">
          
          <div className="col company-card info-section bg-white border-radius-8 border">
            <div className="section-header px-24 py-16 blue" style={{ borderBottom: '1px dashed #e2e8f0' }}>
              <div className="dis-flex align-items-center gap-8">
                <i className="ti ti-file-description" style={{ fontSize: 20 }}></i>
                <h3 style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Thông tin chung</h3>
              </div>
            </div>
            
            <div className="section-body px-24 py-24 grid-2 gap-x-32 gap-y-20">
              <div className="field">
                <label>Mã phòng ban <span className="req">*</span></label>
                <input type="text" className="form-control" placeholder="Nhập mã phòng ban" required value={form.code || ''} onChange={e => handleChange('code', e.target.value)} style={{ borderRadius: 6 }} />
              </div>

              <div className="field">
                <label>Tên phòng ban <span className="req">*</span></label>
                <input type="text" className="form-control" placeholder="Nhập tên phòng ban" required value={form.name || ''} onChange={e => handleChange('name', e.target.value)} style={{ borderRadius: 6 }} />
              </div>

              <div className="field">
                <label>Phòng ban cha</label>
                <select className="form-control" value={form.parent_id || ''} onChange={e => handleChange('parent_id', e.target.value ? Number(e.target.value) : 0)} style={{ borderRadius: 6 }}>
                  <option value={0}>-- Chọn phòng ban cha --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="col company-card info-section bg-white border-radius-8 border">
            <div className="section-header px-24 py-16 green" style={{ borderBottom: '1px dashed #e2e8f0' }}>
              <div className="dis-flex align-items-center gap-8">
                <i className="ti ti-settings" style={{ fontSize: 20 }}></i>
                <h3 style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Quản lý & Cấu hình</h3>
              </div>
            </div>
            <div className="section-body px-24 py-24 grid-2 gap-x-32 gap-y-20">
              <div className="field">
                <label>Trưởng bộ phận</label>
                <select className="form-control" value={form.manager_id || ''} onChange={e => handleChange('manager_id', e.target.value ? Number(e.target.value) : null)} style={{ borderRadius: 6 }}>
                  <option value="">-- Chọn trưởng bộ phận --</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>)}
                </select>
              </div>

              <div className="field">
                <label>Trạng thái hoạt động</label>
                <select className="form-control" value={form.is_active ? 'true' : 'false'} onChange={e => handleChange('is_active', e.target.value === 'true')} style={{ borderRadius: 6, marginTop: '8px' }}>
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Ngưng hoạt động</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {!isNew && (
          <div className="row">
              <div className="col company-card info-section">
                <div className="section-header orange">
                  <i className="ti ti-settings"></i>
                  <h3>Thao tác khác</h3>
                </div>
                <div className="section-body">
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button type="button" className="btn outline" onClick={handleDelete} style={{ color: 'var(--red)', borderColor: 'var(--red)', background: '#fff' }}>
                      <i className="ti ti-trash"></i> Xóa bản ghi
                    </button>
                  </div>
                </div>
              </div>

              <div className="col company-card info-section">
                <div className="section-header green">
                  <i className="ti ti-history"></i>
                  <h3>Lịch sử thao tác</h3>
                </div>
                <div className="section-body">
                  <div className="timeline">
                    {auditLogs.length === 0 ? (
                      <div style={{ fontSize: '13px', color: '#64748b', padding: '8px 0' }}>Chưa có lịch sử thao tác nào.</div>
                    ) : auditLogs.map((log, idx) => {
                      let parsedMsg = null;
                      
                      const getFieldValueLabel = (key: string, val: any) => {
                        if (val === null || val === '') return 'Trống';
                        if (key === 'manager_id' || key === 'Trưởng bộ phận') {
                          const s = subjects.find(x => x.id === Number(val));
                          return s ? `${s.subject_code}` : val;
                        }
                        if (key === 'parent_id' || key === 'Mã PB cha') {
                          const d = departments.find(x => x.id === Number(val));
                          return d ? d.name : val;
                        }
                        if (key === 'is_active' || key === 'Trạng thái') {
                          return val === true || val === 'true' || val === 1 ? 'Đang hoạt động' : 'Ngưng hoạt động';
                        }
                        return String(val);
                      }

                      const getFieldLabel = (key: string) => {
                        const map: Record<string, string> = {
                          code: 'Mã phòng ban',
                          name: 'Tên phòng ban',
                          company_id: 'Mã công ty',
                          parent_id: 'Phòng ban cha',
                          manager_id: 'Trưởng bộ phận',
                          is_active: 'Trạng thái'
                        };
                        return map[key] || key;
                      }

                      try {
                        if (log.message && log.message.startsWith('{')) {
                          const data = JSON.parse(log.message);
                          parsedMsg = (
                            <div style={{ marginTop: '4px', fontSize: '13.5px', color: '#334155' }}>
                              {Object.entries(data).map(([k, v]) => (
                                <div key={k} style={{ marginBottom: '2px' }}>&bull; Đổi <b>{getFieldLabel(k)}</b> thành <b>{getFieldValueLabel(k, v)}</b></div>
                              ))}
                            </div>
                          );
                        } else if (log.message) {
                          parsedMsg = <div style={{ marginTop: '4px', fontSize: '13.5px', color: '#334155' }}>{log.message}</div>;
                        }
                      } catch (e) {
                        parsedMsg = <div style={{ marginTop: '4px', fontSize: '13.5px', color: '#334155' }}>{log.message}</div>;
                      }

                      return (
                        <div className="tl-item" key={idx}>
                          <span className={`tl-dot ${log.action === 'create' ? 'create' : log.action === 'delete' ? 'cancel' : 'update'}`}></span>
                          <div>
                            <div style={{ fontSize: '14px' }}><b>{log.by}</b> — {log.action_label}</div>
                            {parsedMsg}
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                              {new Date(log.at).toLocaleString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  )
}
