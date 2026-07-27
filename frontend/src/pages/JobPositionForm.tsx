import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { toast } from '../components/toast'
import MultiSelect from '../components/MultiSelect'
import '../pages/CompanyInfo.css'

export default function JobPositionForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const isNew = !id || id === 'new'
  
  const [form, setForm] = useState<any>({
    id: 0, position_code: '', position_name: '', group_id: null, title_id: null, report_to_position_id: null, description: '', is_inactive: false, org_unit_ids: []
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [groups, setGroups] = useState<any[]>([])
  const [titles, setTitles] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])
  const [orgUnits, setOrgUnits] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rg, rt, rp, ro] = await Promise.all([
          api.get('/api/v1/system/position-groups'),
          api.get('/api/v1/system/job-titles'),
          api.get('/api/v1/system/job-positions'),
          api.get('/api/v1/system/org-units')
        ])
        setGroups(rg.data.data || [])
        setTitles(rt.data.data || [])
        setPositions((rp.data.data || []).filter((p: any) => p.id !== (isNew ? 0 : parseInt(id || '0'))))
        setOrgUnits(ro.data.data || [])
        
        if (!isNew) {
          const res = await api.get(`/api/v1/system/job-positions/${id}`)
          if (res.data.data) {
            setForm(res.data.data)
          } else {
            // handle error
            toast.error('Không tìm thấy vị trí')
            navigate('/job-positions')
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

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!form.position_code || !form.position_name) {
      toast.error('Vui lòng nhập đầy đủ mã và tên vị trí')
      return
    }
    setLoading(true)
    try {
      if (!isNew) await api.put(`/api/v1/system/job-positions/${form.id}`, form)
      else await api.post('/api/v1/system/job-positions', form)
      toast.success('Lưu thành công')
      navigate('/job-positions')
    } catch (err: any) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const orgOptions = orgUnits.map((u: any) => ({ value: u.id, label: u.unit_code + ' - ' + u.unit_name }))

  if (initialLoading) return <div className="p-24 text-muted">Đang tải...</div>

  return (
    <div className="company-info-page h-100 flex1">
      <div className="topbar dis-flex align-items-center">
        <button type="button" className="btn ghost icon-btn mr-12" onClick={() => navigate('/job-positions')} style={{ background: '#f1f5f9' }}>
          <i className="ti ti-arrow-left"></i>
        </button>
        <h2 className="page-title mb-0 flex1" style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
          {!isNew ? 'Sửa vị trí công việc' : 'Thêm mới Vị trí công việc'}
        </h2>
        <div className="actions dis-flex">
          <button type="button" className="btn ghost" onClick={() => navigate('/job-positions')} disabled={loading} style={{ background: '#f1f5f9', color: '#475569', border: 'none' }}>Hủy</button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={loading}>Lưu / Thực hiện</button>
        </div>
      </div>

      <div className="content scrollable company-blocks-layout">
        <div className="company-blocks-grid">
          
          <div className="company-card info-section">
            <div className="section-header blue">
              <i className="ti ti-file-description"></i>
              <h3>Thông tin chung</h3>
            </div>
            <div className="section-body grid-2">
              <div className="field col-span-2">
                <label>Mã vị trí <span className="req">*</span></label>
                <input type="text" className="form-control" required value={form.position_code || ''} onChange={e => handleChange('position_code', e.target.value)} />
              </div>
              <div className="field col-span-2">
                <label>Tên vị trí <span className="req">*</span></label>
                <input type="text" className="form-control" required value={form.position_name || ''} onChange={e => handleChange('position_name', e.target.value)} />
              </div>
              <div className="field col-span-2">
                <label>Nhóm vị trí</label>
                <select className="form-control" value={form.group_id || ''} onChange={e => handleChange('group_id', e.target.value ? parseInt(e.target.value) : null)}>
                  <option value="">- Chọn nhóm -</option>
                  {groups.map((g: any) => <option key={g.id} value={g.id}>{g.group_name}</option>)}
                </select>
              </div>
              <div className="field col-span-2">
                <label>Chức danh</label>
                <select className="form-control" value={form.title_id || ''} onChange={e => handleChange('title_id', e.target.value ? parseInt(e.target.value) : null)}>
                  <option value="">- Chọn chức danh -</option>
                  {titles.map((t: any) => <option key={t.id} value={t.id}>{t.title_name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="company-card info-section">
            <div className="section-header green">
              <i className="ti ti-sitemap"></i>
              <h3>Phân công & Tổ chức</h3>
            </div>
            <div className="section-body grid-2">
              <div className="field col-span-2">
                <label>Báo cáo cho (Vị trí quản lý)</label>
                <select className="form-control" value={form.report_to_position_id || ''} onChange={e => handleChange('report_to_position_id', e.target.value ? parseInt(e.target.value) : null)}>
                  <option value="">- Không có -</option>
                  {positions.map((p: any) => <option key={p.id} value={p.id}>{p.position_code} - {p.position_name}</option>)}
                </select>
              </div>
              <div className="field col-span-2">
                <label>Đơn vị công tác</label>
                <MultiSelect 
                  options={orgOptions}
                  value={form.org_unit_ids || []}
                  onChange={v => handleChange('org_unit_ids', v)}
                  placeholder="Chọn đơn vị (có thể chọn nhiều)"
                />
              </div>
            </div>
          </div>

          <div className="company-card info-section" style={{ gridColumn: '1 / -1' }}>
            <div className="section-header orange">
              <i className="ti ti-settings"></i>
              <h3>Thông tin khác</h3>
            </div>
            <div className="section-body grid-2">
              <div className="field col-span-2">
                <label>Mô tả</label>
                <textarea className="form-control" rows={3} value={form.description || ''} onChange={e => handleChange('description', e.target.value)} />
              </div>
              <div className="field col-span-2">
                <label className="dis-flex align-items-center gap-8 cursor-pointer mt-8">
                  <input type="checkbox" checked={form.is_inactive} onChange={e => handleChange('is_inactive', e.target.checked)} style={{ width: 'auto' }} />
                  <span className="font-medium" style={{ fontSize: 14, color: '#475569', fontWeight: 600 }}>Ngừng theo dõi</span>
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
