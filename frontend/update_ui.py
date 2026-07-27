import sys

with open('src/pages/SubjectList.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add MultiSelect import if not there
if 'import MultiSelect' not in content:
    content = content.replace(
        'import { api } from \'../api/client\'',
        'import { api } from \'../api/client\'\nimport MultiSelect from \'../components/MultiSelect\'\nimport { toast } from \'../components/toast\''
    )

# Slice out the old SubjectForm
start_idx = content.find('function SubjectForm(')
if start_idx != -1:
    content = content[:start_idx]

# Append new SubjectForm
new_form = '''
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
          api.get('/api/v1/system/departments'),
          api.get('/api/v1/system/job-titles'),
          api.get('/api/v1/system/org-units'),
          api.get('/api/v1/system/subjects?status=ACTIVE')
        ])
        setDepartments(d.data.data || [])
        setJobTitles(t.data.data || [])
        setOrgUnits(o.data.data || [])
        // Filter out self from managers
        setManagers((m.data.data || []).filter((s: any) => !initial || s.id !== initial.id))
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
'''

content += new_form

content = content.replace(
    'const [showForm, setShowForm] = useState(false)',
    'const [showForm, setShowForm] = useState(false)\n  const [editingItem, setEditingItem] = useState<any>(null)'
)

content = content.replace(
    'if (showForm) {\n    return <SubjectForm onClose={() => setShowForm(false)} />\n  }',
    'if (showForm) {\n    return <SubjectForm initial={editingItem} onClose={() => { setShowForm(false); setEditingItem(null) }} onSuccess={fetchSubjects} />\n  }'
)

content = content.replace(
    'onClick={() => setShowForm(true)}',
    'onClick={() => { setEditingItem(null); setShowForm(true) }}'
)

content = content.replace(
    'tr key={item.id} onClick={() => setShowForm(true)}',
    'tr key={item.id} onClick={() => { setEditingItem(item); setShowForm(true) }}'
)


with open('src/pages/SubjectList.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
