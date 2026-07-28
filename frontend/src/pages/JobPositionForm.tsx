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
    id: 0, position_code: '', position_name: '', department_id: null, title_id: null, description: '', is_inactive: false, company_ids: []
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [departments, setDepartments] = useState<any[]>([])
  const [titles, setTitles] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rd, rt, rc] = await Promise.all([
          api.get('/api/departments?page_size=1000'),
          api.get('/api/v1/system/job-titles'),
          api.get('/api/companies?page_size=1000')
        ])
        setDepartments(rd.data.data?.items || rd.data.data || [])
        setTitles(rt.data.data?.items || rt.data.data || [])
        setCompanies(rc.data.data?.items || rc.data.data || [])
        
        if (!isNew) {
          const res = await api.get(`/api/v1/system/job-positions/${id}`)
          if (res.data.data) {
            setForm(res.data.data)
          } else {
            // handle error
            toast.error('Không tìm thấy vị trí')
            navigate('/job-positions')
          }
        } else {
          const nextCodeRes = await api.get('/api/v1/system/job-positions/next-code')
          if (nextCodeRes.data.data?.next_code) {
            setForm((prev: any) => ({ ...prev, position_code: nextCodeRes.data.data.next_code }))
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

  useEffect(() => {
    if (initialLoading) return;
    const title = titles.find((t: any) => t.id === form.title_id)?.title_name || ''
    const dept = departments.find((d: any) => d.id === form.department_id)?.name || ''
    const compShortNames = (form.company_ids || []).map((cid: any) => {
      const comp = companies.find((c: any) => c.id === cid)
      return comp ? (comp.short_name || comp.code || comp.name) : ''
    }).filter(Boolean).join(' + ')

    const parts = [title, dept, compShortNames].filter(Boolean)
    if (parts.length > 0) {
      setForm((prev: any) => ({ ...prev, position_name: parts.join(' - ') }))
    }
  }, [form.title_id, form.department_id, form.company_ids])

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

  const companyOptions = companies.map((c: any) => ({ value: c.id, label: c.name, image: c.logo }))

  if (initialLoading) return <div className="p-24 text-muted">Đang tải...</div>

  return (
    <div className="company-info-page h-100 flex1">
      <div className="topbar dis-flex align-items-center gap-16">
        <button type="button" className="btn ghost icon-btn" onClick={() => navigate('/job-positions')} style={{ background: '#f1f5f9' }}>
          <i className="ti ti-arrow-left"></i>
        </button>
        <h2 className="page-title mb-0 flex1" style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
          {!isNew ? 'Sửa vị trí công việc' : 'Thêm mới Vị trí công việc'}
        </h2>
        <div className="actions dis-flex gap-8">
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
            </div>
          </div>

          <div className="company-card info-section">
            <div className="section-header green">
              <i className="ti ti-sitemap"></i>
              <h3>Phân công & Tổ chức</h3>
            </div>
            <div className="section-body grid-2">
              <div className="field col-span-2">
                <label>Chức danh</label>
                <select className="form-control" value={form.title_id || ''} onChange={e => handleChange('title_id', e.target.value ? parseInt(e.target.value) : null)}>
                  <option value="">- Chọn chức danh -</option>
                  {titles.map((t: any) => <option key={t.id} value={t.id}>{t.title_name}</option>)}
                </select>
              </div>
              <div className="field col-span-2">
                <label>Phòng ban</label>
                <select className="form-control" value={form.department_id || ''} onChange={e => handleChange('department_id', e.target.value ? parseInt(e.target.value) : null)}>
                  <option value="">- Chọn phòng ban -</option>
                  {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="field col-span-2">
                <label>Công ty</label>
                <MultiSelect 
                  options={companyOptions}
                  value={form.company_ids || []}
                  onChange={v => handleChange('company_ids', v)}
                  placeholder="Chọn công ty (có thể chọn nhiều)"
                  variant="avatars"
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
