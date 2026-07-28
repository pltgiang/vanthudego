import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconImport, IconExport } from '../components/Icons'
import { api } from '../api/client'
import { toast } from '../components/toast'

export default function SubjectList() {
  const navigate = useNavigate()
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

  useEffect(() => {
    fetchSubjects()
  }, [])

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
          <button className="btn btn-primary dis-flex align-items-center gap-8" style={{ borderRadius: 6, background: '#00aeef', borderColor: '#00aeef' }} onClick={() => navigate('/subjects/new')}>
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
                    <button className="btn ghost icon-btn" title="Chỉnh sửa" onClick={() => navigate(`/subjects/${item.id}`)} style={{ color: '#0ea5e9' }}>
                      <i className="ti ti-edit"></i>
                    </button>
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
