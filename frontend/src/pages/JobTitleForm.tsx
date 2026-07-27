import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { toast } from '../components/toast'
import { askConfirm } from '../components/confirm'
import '../pages/CompanyInfo.css'

export default function JobTitleForm() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [form, setForm] = useState<any>({
    title_code: '',
    title_name: '',
    description: '',
    sort_order: 9999,
    is_inactive: false
  })
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(!isNew)
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  useEffect(() => {
    if (!isNew) {
      Promise.all([
        api.get(`/api/v1/system/job-titles`),
        api.get(`/api/audit-logs?entity=job_title&entity_id=${id}`)
      ]).then(([res, logRes]) => {
        const item = res.data.data?.find((x: any) => String(x.id) === id)
        if (item) setForm(item)
        setAuditLogs(logRes.data.data || [])
        setInitialLoad(false)
      }).catch(e => {
        toast.error(e.message)
        setInitialLoad(false)
      })
    }
  }, [id, isNew])

  const handleChange = (k: string, v: any) => setForm((prev: any) => ({ ...prev, [k]: v }))

  const handleSave = async (closeAfterSave: boolean = false) => {
    if (!form.title_code?.trim()) {
      toast.error('Vui lòng nhập mã chức danh')
      return
    }
    if (!form.title_name?.trim()) {
      toast.error('Vui lòng nhập tên chức danh')
      return
    }
    
    setLoading(true)
    try {
      if (!isNew) {
        await api.put(`/api/v1/system/job-titles/${id}`, form)
        toast.success('Đã lưu')
        if (closeAfterSave) {
          navigate('/job-positions', { state: { tab: 'title' } })
        }
      } else {
        const res = await api.post('/api/v1/system/job-titles', form)
        toast.success('Đã lưu')
        if (closeAfterSave) {
          navigate('/job-positions', { state: { tab: 'title' } })
        } else {
          navigate(`/job-titles/${res.data.data.id}`, { replace: true })
        }
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (await askConfirm({ message: 'Bạn có chắc muốn xóa bản ghi này?' })) {
      try {
        await api.delete(`/api/v1/system/job-titles/${id}`)
        toast.success('Xóa thành công')
        navigate('/job-positions', { state: { tab: 'title' } })
      } catch (e: any) {
        toast.error(e.message)
      }
    }
  }

  if (initialLoad) return <div className="p-24 text-muted">Đang tải...</div>

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column" style={{ background: '#f1f5f9' }}>
      <div className="topbar px-34 py-12 dis-flex align-items-center justify-content-between" style={{ backgroundColor: '#fff', borderRadius: 0, borderBottom: '1px solid #e2e8f0' }}>
        <div className="dis-flex align-items-center">
          <button className="btn ghost icon-btn mr-12" onClick={() => navigate('/job-positions', { state: { tab: 'title' } })}>
            <i className="ti ti-arrow-left" style={{ fontSize: 20 }}></i>
          </button>
          <h2 className="page-title mb-0" style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
            {!isNew ? 'Chỉnh sửa chức danh' : 'Thêm chức danh'}
          </h2>
        </div>
        <div className="actions dis-flex">
          <button type="button" className="btn ghost" style={{ background: '#f1f5f9', color: '#475569', border: 'none', marginRight: 12 }} onClick={() => navigate('/job-positions', { state: { tab: 'title' } })}>Hủy bỏ</button>
          <button type="button" className="btn" style={{ marginRight: 12, background: 'white', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: 6, color: '#0ea5e9' }} onClick={() => handleSave(false)} disabled={loading}>
            <i className="ti ti-device-floppy"></i> Lưu
          </button>
          <button type="button" className="btn btn-primary" onClick={() => handleSave(true)} disabled={loading}>Hoàn tất</button>
        </div>
      </div>

      <div className="content scrollable company-blocks-layout flex1" style={{ overflowY: 'auto' }}>
        <div className="row">
          
          <div className="col company-card info-section">
            <div className="section-header blue">
              <i className="ti ti-file-description"></i>
              <h3>Thông tin chung</h3>
            </div>
            
            <div className="section-body px-24 py-24 grid-2 gap-x-32 gap-y-20">
              <div className="field">
                <label>Mã chức danh <span className="req">*</span></label>
                <input type="text" className="form-control" placeholder="Nhập mã chức danh" required value={form.title_code || ''} onChange={e => handleChange('title_code', e.target.value)} style={{ borderRadius: 6 }} />
              </div>

              <div className="field">
                <label>Tên chức danh <span className="req">*</span></label>
                <input type="text" className="form-control" placeholder="Nhập tên chức danh" required value={form.title_name || ''} onChange={e => handleChange('title_name', e.target.value)} style={{ borderRadius: 6 }} />
              </div>
              
              <div className="field">
                <label>Trạng thái</label>
                <select className="form-control" value={form.is_inactive ? 'true' : 'false'} onChange={e => handleChange('is_inactive', e.target.value === 'true')} style={{ borderRadius: 6 }}>
                  <option value="false">Đang hoạt động</option>
                  <option value="true">Ngưng hoạt động</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="col company-card info-section">
            <div className="section-header green">
              <i className="ti ti-settings"></i>
              <h3>Thông tin khác</h3>
            </div>
            
            <div className="section-body px-24 py-24 gap-y-20">
              <div className="field">
                <label>Mô tả</label>
                <textarea className="form-control" rows={4} placeholder="Nhập mô tả" value={form.description || ''} onChange={e => handleChange('description', e.target.value)} style={{ borderRadius: 6 }} />
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
                <div className="section-body px-24 py-24">
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
                <div className="section-body px-24 py-24">
                  <div className="timeline">
                    {auditLogs.length === 0 ? (
                      <div style={{ fontSize: '13px', color: '#64748b', padding: '8px 0' }}>Chưa có lịch sử thao tác nào.</div>
                    ) : auditLogs.map((log, idx) => {
                      let parsedMsg = null;

                      const getFieldValueLabel = (key: string, val: any) => {
                        if (val === null || val === '') return 'Trống';
                        if (key === 'is_inactive' || key === 'Trạng thái') {
                          return val === true || val === 'true' || val === 1 ? 'Ngưng hoạt động' : 'Đang hoạt động';
                        }
                        return String(val);
                      }

                      const getFieldLabel = (key: string) => {
                        const map: Record<string, string> = {
                          title_code: 'Mã chức danh',
                          title_name: 'Tên chức danh',
                          description: 'Mô tả',
                          is_inactive: 'Trạng thái'
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
                          <div className="tl-content">
                            <div className="tl-title">
                              <strong>{log.user?.full_name || 'Hệ thống'}</strong>
                              <span className="tl-time">{new Date(log.created_at).toLocaleString('vi-VN')}</span>
                            </div>
                            {parsedMsg}
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

