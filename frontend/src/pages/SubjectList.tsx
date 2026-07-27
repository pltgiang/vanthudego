import { useState, useEffect } from 'react'
import { IconImport, IconExport } from '../components/Icons'
import { api } from '../api/client'
import MultiSelect from '../components/MultiSelect'
import { toast } from '../components/toast'

export default function SubjectList() {
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [visibleCols, setVisibleCols] = useState<string[]>(['name', 'phone', 'email', 'department', 'job_title', 'account_status'])
  const [colMenuOpen, setColMenuOpen] = useState(false)
  const [subjects, setSubjects] = useState<any[]>([])
  
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

  if (showForm) {
    return <SubjectForm initial={editingItem} onClose={() => { setShowForm(false); setEditingItem(null) }} onSuccess={fetchSubjects} />
  }

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
          <button className="btn btn-primary dis-flex align-items-center gap-8" style={{ borderRadius: 6, background: '#00aeef', borderColor: '#00aeef' }} onClick={() => { setEditingItem(null); setShowForm(true) }}>
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
                  <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" checked={visibleCols.includes('name')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'name'] : prev.filter(c => c !== 'name'))} /> Họ và tên</label>
                  <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" checked={visibleCols.includes('phone')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'phone'] : prev.filter(c => c !== 'phone'))} /> ĐT di động</label>
                  <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" checked={visibleCols.includes('email')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'email'] : prev.filter(c => c !== 'email'))} /> Email cá nhân</label>
                  <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" checked={visibleCols.includes('account_email')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'account_email'] : prev.filter(c => c !== 'account_email'))} /> Email tài khoản</label>
                  <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" checked={visibleCols.includes('account_phone')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'account_phone'] : prev.filter(c => c !== 'account_phone'))} /> SĐT TK</label>
                  <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" checked={visibleCols.includes('account_status')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'account_status'] : prev.filter(c => c !== 'account_status'))} /> Trạng thái TK</label>
                  <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" checked={visibleCols.includes('dob')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'dob'] : prev.filter(c => c !== 'dob'))} /> Ngày sinh</label>
                  <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" checked={visibleCols.includes('gender')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'gender'] : prev.filter(c => c !== 'gender'))} /> Giới tính</label>
                  <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" checked={visibleCols.includes('department')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'department'] : prev.filter(c => c !== 'department'))} /> Phòng ban</label>
                  <label className="dis-flex align-items-center gap-12 mb-12 cursor-pointer" style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" checked={visibleCols.includes('job_title')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'job_title'] : prev.filter(c => c !== 'job_title'))} /> Chức danh</label>
                  <label className="dis-flex align-items-center gap-12 mb-0 cursor-pointer" style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" checked={visibleCols.includes('address')} onChange={e => setVisibleCols(prev => e.target.checked ? [...prev, 'address'] : prev.filter(c => c !== 'address'))} /> Địa chỉ</label>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="table-responsive flex1 mt-16 table-px-10">
          <table className="table table-hover table-px-10 mb-0" style={{ minWidth: 1600 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
              <tr>
                <th style={{ width: 44, textAlign: 'center' }}><input type="checkbox" style={{ width: 16, height: 16 }} /></th>
                {visibleCols.includes('name') && <th style={{ width: 240 }}>Họ và tên</th>}
                {visibleCols.includes('phone') && <th style={{ width: 200 }}>ĐT di động</th>}
                {visibleCols.includes('email') && <th style={{ width: 200 }}>Email cá nhân</th>}
                {visibleCols.includes('department') && <th style={{ width: 200 }}>Phòng ban</th>}
                {visibleCols.includes('job_title') && <th style={{ width: 200 }}>Chức danh</th>}
                {visibleCols.includes('account_email') && <th style={{ width: 200 }}>Email tài khoản</th>}
                {visibleCols.includes('account_phone') && <th style={{ width: 190 }}>SĐT TK</th>}
                {visibleCols.includes('account_status') && <th style={{ width: 190 }}>Trạng thái TK</th>}
                {visibleCols.includes('dob') && <th style={{ width: 130 }}>Ngày sinh</th>}
                {visibleCols.includes('gender') && <th style={{ width: 100 }} title="Giới tính">Giới tí...</th>}
                {visibleCols.includes('address') && <th style={{ width: 200 }}>Địa chỉ</th>}
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(item => (
                <tr key={item.id} onClick={() => { setEditingItem(item); setShowForm(true) }} style={{ cursor: 'pointer' }} className="table-row-clickable">
                  <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}><input type="checkbox" style={{ width: 16, height: 16 }} /></td>
                  {visibleCols.includes('name') && <td>
                    <div className="dis-flex align-items-center gap-12">
                      <div className="avatar" style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#E0E7FF', color: '#3730A3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 11 }}>
                        {(item.subject_name || 'NV').substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-weight-bold" style={{ fontSize: 13 }}>{item.subject_name}</span>
                    </div>
                  </td>}
                  {visibleCols.includes('phone') && <td>{item.contact_phone || '- -'}</td>}
                  {visibleCols.includes('email') && <td className="text-truncate" title={item.contact_email} style={{ maxWidth: 200 }}>{item.contact_email || '- -'}</td>}
                  {visibleCols.includes('department') && <td>{item.department_names?.length > 0 ? item.department_names.join(', ') : '- -'}</td>}
                  {visibleCols.includes('job_title') && <td>{item.job_title_names?.length > 0 ? item.job_title_names.join(', ') : '- -'}</td>}
                  {visibleCols.includes('account_email') && <td className="text-truncate" title={item.account_email} style={{ maxWidth: 200 }}>{item.account_email || '- -'}</td>}
                  {visibleCols.includes('account_phone') && <td>{item.account_phone || '- -'}</td>}
                  {visibleCols.includes('account_status') && <td><span className="badge" style={{ backgroundColor: item.user_status === 'ACTIVE' ? '#EAF7EF' : '#F3F4F6', color: item.user_status === 'ACTIVE' ? '#16A34A' : '#6B7280', border: 'none', padding: '4px 8px', borderRadius: 4 }}>{item.user_status === 'ACTIVE' ? 'Đang hoạt động' : item.user_status}</span></td>}
                  {visibleCols.includes('dob') && <td>{item.birth_date ? new Date(item.birth_date).toLocaleDateString('vi-VN') : '- -'}</td>}
                  {visibleCols.includes('gender') && <td>{item.gender || '- -'}</td>}
                  {visibleCols.includes('address') && <td className="text-truncate" title={item.address} style={{ maxWidth: 200 }}>{item.address || '- -'}</td>}
                  <td className="text-right">
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-20 text-muted">Không có dữ liệu</td>
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


function SubjectForm({ initial, onClose, onSuccess }: { initial?: any, onClose: () => void, onSuccess?: () => void }) {
  const [form, setForm] = useState<any>({
    subject_code: '',
    subject_name: '',
    is_employee: true,
    contact_email: '',
    contact_phone: '',
    account_email: '',
    account_phone: '',
    user_status: 'ACTIVE',
    employee_status: 'WORKING',
    department_ids: [],
    job_title_ids: [],
    org_unit_ids: [],
    direct_manager_id: null,
    join_date: '',
    probation_date: '',
    official_date: '',
    resign_date: '',
    ...initial
  })
  
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [jobTitles, setJobTitles] = useState<any[]>([])
  const [orgUnits, setOrgUnits] = useState<any[]>([])
  const [managers, setManagers] = useState<any[]>([])
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [d, t, o, m] = await Promise.all([
          api.get('/api/departments'),
          api.get('/api/v1/system/job-titles'),
          api.get('/api/v1/system/org-units'),
          api.get('/api/v1/system/subjects?status=ACTIVE')
        ])
        setDepartments(d.data.data?.items || d.data.data || [])
        setJobTitles(t.data.data?.items || t.data.data || [])
        setOrgUnits(o.data.data?.items || o.data.data || [])
        // Filter out self from managers
        const mData = m.data.data?.items || m.data.data || []
        setManagers(mData.filter((s: any) => !initial || s.id !== initial.id))
      } catch (err: any) {
        console.error(err)
      }
    }
    fetchData()
  }, [initial])
  
  const handleChange = (k: string, v: any) => setForm((prev: any) => ({ ...prev, [k]: v }))
  
  const handleSave = async () => {
    if (!form.subject_code || !form.subject_name) {
      toast.error('Vui lòng nhập đầy đủ mã và tên nhân sự')
      return
    }
    setLoading(true)
    try {
      if (initial && initial.id) {
        await api.put(`/api/v1/system/subjects/${initial.id}`, form)
      } else {
        await api.post('/api/v1/system/subjects', form)
      }
      toast.success('Lưu thành công')
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deptOptions = departments.map(d => ({ value: d.id, label: d.name }))
  const titleOptions = jobTitles.map(t => ({ value: t.id, label: t.title_name }))
  const orgOptions = orgUnits.map(o => ({ value: o.id, label: o.unit_name }))

  const displayName = form.subject_name.trim() || 'HỌ VÀ TÊN'
  const displayEmail = form.account_email.trim() || 'chuaco@example.com'

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column bg-slate-50">
      <div className="topbar dis-flex align-items-center px-24 py-12 bg-white border-bottom">
        <button className="btn btn-primary btn-icon" onClick={onClose} style={{ width: 36, height: 36, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 24, padding: 0 }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 20 }} />
        </button>
        <div className="page-title mb-0 flex1" style={{ fontSize: 18, fontWeight: 600 }}>{initial ? 'Chỉnh sửa nhân sự' : 'Thêm mới nhân sự'}</div>
        <div className="actions dis-flex gap-8">
          <button className="btn ghost" onClick={onClose} disabled={loading}>Hủy bỏ</button>
          <button className="btn btn-primary" style={{ borderRadius: 6, background: '#00aeef', borderColor: '#00aeef' }} onClick={handleSave} disabled={loading}>Lưu</button>
        </div>
      </div>

      <div className="content scrollable company-blocks-layout flex1">
        <div className="company-blocks-grid">
          
          <div className="company-card bg-white border-radius-8 border mb-24" style={{ padding: 24, gridColumn: 'span 2' }}>
            <div className="dis-flex align-items-center gap-24">
              <div className="avatar-placeholder flex-shrink-0" style={{ width: 100, height: 100, borderRadius: 8, backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                {displayName !== 'HỌ VÀ TÊN' ? (
                  <span style={{ fontSize: 32, fontWeight: 'bold', color: '#64748b' }}>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <i className="ti ti-user" style={{ fontSize: 40, color: '#cbd5e1' }} />
                )}
              </div>
              <div>
                <h3 className="mb-12" style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', margin: '0 0 12px 0' }}>{displayName}</h3>
                <div className="dis-flex align-items-center gap-12">
                  <span className="badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: 11, padding: '4px 12px', borderRadius: 100, fontWeight: 600, textTransform: 'uppercase' }}>
                    Email: {displayEmail}
                  </span>
                  <span className="badge" style={{ backgroundColor: form.user_status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9', color: form.user_status === 'ACTIVE' ? '#15803d' : '#475569', fontSize: 11, padding: '4px 12px', borderRadius: 100, fontWeight: 600, textTransform: 'uppercase' }}>
                    {form.user_status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="company-card info-section bg-white border-radius-8 border">
            <div className="section-header px-24 py-16" style={{ borderBottom: '1px dashed #e2e8f0' }}>
              <div className="dis-flex align-items-center gap-8">
                <i className="ti ti-info-circle" style={{ fontSize: 20, color: '#0056D2' }}></i>
                <h3 style={{ margin: 0, fontWeight: 600, fontSize: 15, color: '#1e293b' }}>Thông tin chung</h3>
              </div>
            </div>
            
            <div className="section-body px-24 py-24">
              <div className="grid-2 gap-x-32 gap-y-20">
                <div className="field col-span-2 mb-0">
                  <label className="dis-flex align-items-center gap-8 cursor-pointer">
                    <input type="checkbox" className="react-checkbox" checked={form.is_employee} onChange={e => handleChange('is_employee', e.target.checked)} />
                    <span style={{ fontWeight: 500, color: '#0f172a' }}>Là nhân viên công ty</span>
                  </label>
                </div>

                <div className="field col-span-2">
                  <label>Mã nhân viên <span className="req">*</span></label>
                  <input type="text" className="form-control font-weight-bold text-primary" value={form.subject_code} onChange={e => handleChange('subject_code', e.target.value)} style={{ backgroundColor: '#f8fafc', borderRadius: 6 }} />
                </div>
                <div className="field col-span-2">
                  <label>Họ và tên <span className="req">*</span></label>
                  <input type="text" className="form-control" placeholder="Nhập họ và tên" value={form.subject_name} onChange={e => handleChange('subject_name', e.target.value)} style={{ borderRadius: 6 }} />
                </div>

                <div className="field">
                  <label>Giới tính</label>
                  <select className="form-control" value={form.gender || ''} onChange={e => handleChange('gender', e.target.value)} style={{ borderRadius: 6 }}>
                    <option value="">- Chọn -</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="field">
                  <label>Ngày sinh</label>
                  <div className="position-relative">
                    <input type="date" className="form-control" value={form.birth_date || ''} onChange={e => handleChange('birth_date', e.target.value)} style={{ borderRadius: 6 }} />
                  </div>
                </div>

                <div className="field col-span-2">
                  <label>Địa chỉ</label>
                  <input type="text" className="form-control" placeholder="Nhập địa chỉ" value={form.address || ''} onChange={e => handleChange('address', e.target.value)} style={{ borderRadius: 6 }} />
                </div>

                <div className="field">
                  <label>Điện thoại di động</label>
                  <input type="text" className="form-control" placeholder="Nhập số điện thoại" value={form.contact_phone || ''} onChange={e => handleChange('contact_phone', e.target.value)} style={{ borderRadius: 6 }} />
                </div>
                <div className="field">
                  <label>Email cá nhân</label>
                  <input type="email" className="form-control" placeholder="Nhập email" value={form.contact_email || ''} onChange={e => handleChange('contact_email', e.target.value)} style={{ borderRadius: 6 }} />
                </div>
                
                <div className="field col-span-2">
                  <label>Trạng thái</label>
                  <select className="form-control" value={form.employee_status || ''} onChange={e => handleChange('employee_status', e.target.value)} style={{ borderRadius: 6 }}>
                    <option value="WORKING">Đang làm việc</option>
                    <option value="RESIGNED">Đã nghỉ việc</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="company-card info-section bg-white border-radius-8 border">
            <div className="section-header px-24 py-16" style={{ borderBottom: '1px dashed #e2e8f0' }}>
              <div className="dis-flex align-items-center gap-8">
                <i className="ti ti-briefcase" style={{ fontSize: 20, color: '#059669' }}></i>
                <h3 style={{ margin: 0, fontWeight: 600, fontSize: 15, color: '#1e293b' }}>Thông tin công việc</h3>
              </div>
            </div>
            
            <div className="section-body px-24 py-24">
              <div className="grid-2 gap-x-32 gap-y-20">
                <div className="field col-span-2">
                  <label>Đơn vị công tác <span className="req">*</span></label>
                  <MultiSelect 
                    options={orgOptions}
                    value={form.org_unit_ids || []}
                    onChange={v => handleChange('org_unit_ids', v)}
                    placeholder="Chọn đơn vị"
                  />
                </div>
                <div className="field">
                  <label>Phòng ban</label>
                  <MultiSelect 
                    options={deptOptions}
                    value={form.department_ids || []}
                    onChange={v => handleChange('department_ids', v)}
                    placeholder="Chọn phòng ban"
                  />
                </div>
                <div className="field">
                  <label>Chức danh</label>
                  <MultiSelect 
                    options={titleOptions}
                    value={form.job_title_ids || []}
                    onChange={v => handleChange('job_title_ids', v)}
                    placeholder="Chọn chức danh"
                  />
                </div>

                <div className="field col-span-2">
                  <label>Quản lý trực tiếp</label>
                  <select className="form-control" value={form.direct_manager_id || ''} onChange={e => handleChange('direct_manager_id', e.target.value ? parseInt(e.target.value) : null)} style={{ borderRadius: 6 }}>
                    <option value="">Chọn quản lý trực tiếp</option>
                    {managers.map(m => <option key={m.id} value={m.id}>{m.subject_name}</option>)}
                  </select>
                </div>

                <div className="field">
                  <label>Ngày thử việc</label>
                  <div className="position-relative">
                    <input type="date" className="form-control" value={form.probation_date || ''} onChange={e => handleChange('probation_date', e.target.value)} style={{ borderRadius: 6 }} />
                  </div>
                </div>
                <div className="field">
                  <label>Ngày chính thức</label>
                  <div className="position-relative">
                    <input type="date" className="form-control" value={form.official_date || ''} onChange={e => handleChange('official_date', e.target.value)} style={{ borderRadius: 6 }} />
                  </div>
                </div>

                <div className="field">
                  <label>Tài khoản / Điện thoại cơ</label>
                  <input type="text" className="form-control" placeholder="SĐT đăng nhập" value={form.account_phone || ''} onChange={e => handleChange('account_phone', e.target.value)} style={{ borderRadius: 6 }} />
                </div>
                <div className="field">
                  <label>Email công ty</label>
                  <input type="email" className="form-control" placeholder="Nhập email" value={form.account_email || ''} onChange={e => handleChange('account_email', e.target.value)} style={{ borderRadius: 6 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
