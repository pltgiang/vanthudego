import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { toast } from '../components/toast';
import MultiSelect from '../components/MultiSelect';
import { askConfirm } from '../components/confirm';
import './CompanyInfo.css';

export default function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const [orgOptions, setOrgOptions] = useState<any[]>([]);
  const [deptOptions, setDeptOptions] = useState<any[]>([]);
  const [titleOptions, setTitleOptions] = useState<any[]>([]);
  const [companyOptions, setCompanyOptions] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [form, setForm] = useState<any>({
    subject_code: '',
    subject_name: '',
    is_employee: true,
    contact_email: '',
    contact_phone: '',
    account_email: '',
    account_phone: '',
    employee_status: 'WORKING',
    user_status: 'ACTIVE',
    gender: '',
    birth_date: '',
    address: '',
    org_unit_ids: [],
    department_ids: [],
    job_title_ids: [],
    direct_manager_id: ''
  });

  useEffect(() => {
    const initData = async () => {
      try {
        const [deptRes, titleRes, mngRes, compRes] = await Promise.all([
          api.get('/api/departments'),
          api.get('/api/v1/system/job-titles'),
          api.get('/api/v1/system/subjects?is_employee=true'),
          api.get('/api/companies')
        ]);
        setDeptOptions(deptRes.data.data?.items?.map((x: any) => ({ label: x.name, value: x.id })) || []);
        setTitleOptions(titleRes.data.data?.map((x: any) => ({ label: x.title_name, value: x.id })) || []);
        setCompanyOptions(compRes.data.data?.items?.map((x: any) => ({ label: x.name, value: x.id, image: x.logo })) || []);
        setManagers(mngRes.data.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    initData();
  }, []);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/system/subjects/${id}`);
      const data = res.data.data;
      setForm({
        ...data,
        birth_date: data.birth_date ? data.birth_date.split('T')[0] : '',
        probation_date: data.probation_date ? data.probation_date.split('T')[0] : '',
        official_date: data.official_date ? data.official_date.split('T')[0] : '',
        direct_manager_id: data.direct_manager_id || ''
      });

      // Load audit logs
      try {
        const logRes = await api.get(`/api/audit-logs?entity=subject&entity_id=${id}`);
        setAuditLogs(logRes.data.data?.items || logRes.data.data || []);
      } catch (logErr) {
        console.error("Lỗi lấy lịch sử:", logErr);
      }
    } catch (e: any) {
      toast.error('Không thể tải thông tin nhân sự');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      fetchDetail();
    }
  }, [id, isEdit]);

  const handleChange = (f: string, v: any) => setForm((prev: any) => ({ ...prev, [f]: v }));

  const handleSave = async (close: boolean = false) => {
    if (!form.subject_code || !form.subject_name) {
      toast.error('Vui lòng nhập các thông tin bắt buộc (Mã, Tên)');
      return;
    }

    try {
      setSaving(true);
      if (isEdit) {
        await api.put(`/api/v1/system/subjects/${id}`, form);
        toast.success('Cập nhật nhân sự thành công');
      } else {
        await api.post('/api/v1/system/subjects', form);
        toast.success('Thêm nhân sự thành công');
      }
      
      if (close) {
        navigate('/subjects');
      } else if (!isEdit) {
        navigate('/subjects');
      } else {
        fetchDetail();
      }
    } catch (e: any) {
      toast.error('Lỗi lưu nhân sự: ' + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (await askConfirm({
      title: 'Xóa nhân sự',
      message: 'Bạn có chắc chắn muốn xóa nhân sự này không? Dữ liệu không thể khôi phục.',
      confirmText: 'Xóa',
      confirmColor: 'var(--red)',
    })) {
      try {
        await api.delete(`/api/v1/system/subjects/${id}`);
        toast.success('Xóa nhân sự thành công');
        navigate('/subjects');
      } catch (e: any) {
        toast.error('Xóa thất bại: ' + (e.response?.data?.message || e.message));
      }
    }
  };

  const handleChangeStatus = async (user_status: string) => {
    try {
      await api.patch(`/api/v1/system/subjects/${id}/status`, { user_status });
      toast.success('Đã cập nhật trạng thái');
      fetchDetail();
    } catch (e: any) {
      toast.error('Lỗi: ' + (e.response?.data?.message || e.message));
    }
  };

  if (loading) return <div className="p-4">Đang tải...</div>;

  const displayName = form.subject_name || 'HỌ VÀ TÊN';
  const displayEmail = form.account_email || form.contact_email || 'Chưa cập nhật';

  return (
    <div className="company-info-page h-100">
      <div className="topbar dis-flex align-items-center border-bottom">
        <div className="page-title mb-0 flex1 dis-flex align-items-center gap-12">
          <button className="btn ghost icon-btn" onClick={() => navigate('/subjects')}>
            <i className="ti ti-arrow-left"></i>
          </button>
          <span>{isEdit ? `Chỉnh sửa thông tin: ${form.subject_name}` : 'Thêm mới nhân sự'}</span>
        </div>
        <div className="actions dis-flex">
          <button type="button" className="btn ghost" onClick={() => navigate('/subjects')} style={{ background: 'rgb(241, 245, 249)', color: 'rgb(71, 85, 105)', border: 'none', marginRight: '12px' }}>
            Hủy bỏ
          </button>
          <button type="button" className="btn" onClick={() => handleSave(false)} disabled={saving} style={{ marginRight: '12px', background: 'white', border: '1px solid rgb(203, 213, 225)', display: 'flex', alignItems: 'center', gap: '6px', color: 'rgb(14, 165, 233)' }}>
            <i className="ti ti-device-floppy"></i> {saving ? 'Đang lưu...' : 'Lưu lại'}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => handleSave(true)} disabled={saving}>
            Lưu & Đóng
          </button>
        </div>
      </div>

      <div className="content scrollable company-blocks-layout">
        {isEdit && (
          <div className="company-card bg-white mb-24" style={{ padding: 24 }}>
            <div className="dis-flex align-items-center gap-24">
              <div 
                className="logo-preview flex-shrink-0" 
                style={{ borderRadius: 8 }}
                onClick={() => document.getElementById('avatar-upload')?.click()}
                title="Nhấn để thay đổi ảnh đại diện"
              >
                <input 
                  id="avatar-upload" 
                  type="file" 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('entity', 'subject_avatar');
                    formData.append('files', file);
                    try {
                      const res = await api.post('/api/v1/system/attachments/upload-file', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                      });
                      if (res.data.success && res.data.data.length > 0) {
                        handleChange('avatar', res.data.data[0].url);
                        toast.success('Tải lên ảnh đại diện thành công');
                      }
                    } catch (err: any) {
                      toast.error('Lỗi tải lên: ' + (err.response?.data?.message || err.message));
                    }
                  }}
                />
                {form.avatar ? (
                  <img src={form.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : displayName !== 'HỌ VÀ TÊN' ? (
                  <span style={{ fontSize: 32, fontWeight: 'bold', color: '#64748b' }}>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <i className="ti ti-user" style={{ fontSize: 40, color: '#cbd5e1' }} />
                )}
                <div className="logo-overlay" style={{ borderRadius: 8 }}>
                  <i className="ti ti-pencil" style={{ fontSize: 24 }}></i>
                </div>
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
        )}

        <div className="company-blocks-grid">
          
          {/* 1. Thông tin chung */}
          <div className="company-card info-section">
            <div className="section-header blue">
              <i className="ti ti-user"></i>
              <h3>Thông tin Chung</h3>
            </div>
            <div className="section-body grid-2">
              <div className="field col-span-2" style={{ display: 'none' }}>
                <label className="dis-flex align-items-center gap-8 cursor-pointer">
                  <input type="checkbox" className="react-checkbox" checked={form.is_employee} onChange={e => handleChange('is_employee', e.target.checked)} />
                  <span style={{ fontWeight: 500, color: '#0f172a' }}>Là nhân viên công ty</span>
                </label>
              </div>

              <div className="field col-span-2">
                <label>Mã nhân sự <span className="req">*</span></label>
                <input type="text" className="form-control font-weight-bold text-primary" placeholder="Mã tự tạo hoặc nhập" value={form.subject_code || ''} onChange={e => handleChange('subject_code', e.target.value)} style={{ backgroundColor: '#f8fafc' }} />
              </div>
              <div className="field col-span-2">
                <label>Họ và tên <span className="req">*</span></label>
                <input type="text" className="form-control" placeholder="Nhập họ và tên" value={form.subject_name || ''} onChange={e => handleChange('subject_name', e.target.value)} />
              </div>

              <div className="field">
                <label>Giới tính</label>
                <select className="form-control" value={form.gender || ''} onChange={e => handleChange('gender', e.target.value)}>
                  <option value="">- Chọn -</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className="field">
                <label>Ngày sinh</label>
                <input type="date" className="form-control" value={form.birth_date || ''} onChange={e => handleChange('birth_date', e.target.value)} />
              </div>

              <div className="field col-span-2">
                <label>Địa chỉ</label>
                <input type="text" className="form-control" placeholder="Nhập địa chỉ" value={form.address || ''} onChange={e => handleChange('address', e.target.value)} />
              </div>

              <div className="field">
                <label>Điện thoại di động</label>
                <input type="text" className="form-control" placeholder="Nhập số điện thoại" value={form.contact_phone || ''} onChange={e => handleChange('contact_phone', e.target.value)} />
              </div>
              <div className="field">
                <label>Email cá nhân</label>
                <input type="email" className="form-control" placeholder="Nhập email" value={form.contact_email || ''} onChange={e => handleChange('contact_email', e.target.value)} />
              </div>
            </div>
          </div>

          {/* 2. Thông tin Công việc */}
          <div className="company-card info-section">
            <div className="section-header green">
              <i className="ti ti-briefcase"></i>
              <h3>Thông tin Công việc</h3>
            </div>
            <div className="section-body grid-2">
              <div className="field col-span-2">
                <label>Công ty</label>
                <MultiSelect 
                  options={companyOptions}
                  value={form.company_ids || []}
                  onChange={v => handleChange('company_ids', v)}
                  placeholder="Chọn công ty"
                  variant="avatars"
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
                <select className="form-control" value={form.direct_manager_id || ''} onChange={e => handleChange('direct_manager_id', e.target.value ? parseInt(e.target.value) : null)}>
                  <option value="">Chọn quản lý trực tiếp</option>
                  {managers.map(m => <option key={m.id} value={m.id}>{m.subject_name}</option>)}
                </select>
              </div>

              <div className="field col-span-2">
                <label>Trạng thái việc làm</label>
                <select className="form-control" value={form.employee_status || ''} onChange={e => handleChange('employee_status', e.target.value)}>
                  <option value="WORKING">Đang làm việc</option>
                  <option value="RESIGNED">Đã nghỉ việc</option>
                </select>
              </div>

              <div className="field">
                <label>Ngày thử việc</label>
                <input type="date" className="form-control" value={form.probation_date || ''} onChange={e => handleChange('probation_date', e.target.value)} />
              </div>
              <div className="field">
                <label>Ngày chính thức</label>
                <input type="date" className="form-control" value={form.official_date || ''} onChange={e => handleChange('official_date', e.target.value)} />
              </div>
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 3. Thông tin Tài khoản */}
          <div className="company-card info-section">
            <div className="section-header purple">
              <i className="ti ti-shield-lock"></i>
              <h3>Thông tin Tài khoản Hệ thống</h3>
            </div>
            <div className="section-body grid-2">
              <div className="field">
                <label>Tài khoản / Điện thoại cơ</label>
                <input type="text" className="form-control" placeholder="SĐT đăng nhập" value={form.account_phone || ''} onChange={e => handleChange('account_phone', e.target.value)} />
              </div>
              <div className="field">
                <label>Email công ty (Đăng nhập)</label>
                <input type="email" className="form-control" placeholder="Nhập email" value={form.account_email || ''} onChange={e => handleChange('account_email', e.target.value)} />
              </div>
              <div className="field col-span-2">
                <label>Trạng thái Tài khoản</label>
                <select className="form-control" value={form.user_status || 'ACTIVE'} onChange={e => handleChange('user_status', e.target.value)}>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="PENDING">Chờ xác nhận (Chưa kích hoạt)</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                  <option value="LOCKED">Đã khóa</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. Thao tác khác */}
          {isEdit && (
            <div className="company-card info-section">
              <div className="section-header orange">
                <i className="ti ti-settings"></i>
                <h3>Thao tác khác</h3>
              </div>
              <div className="section-body">
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {form.user_status === 'ACTIVE' ? (
                    <button type="button" className="btn outline" onClick={() => handleChangeStatus('LOCKED')} style={{ color: '#d97706', borderColor: '#d97706', background: '#fff' }}>
                      <i className="ti ti-lock"></i> Khóa tài khoản
                    </button>
                  ) : (
                    <button type="button" className="btn outline" onClick={() => handleChangeStatus('ACTIVE')} style={{ color: '#16a34a', borderColor: '#16a34a', background: '#fff' }}>
                      <i className="ti ti-lock-open"></i> Mở khóa tài khoản
                    </button>
                  )}
                  
                  <button type="button" className="btn outline" onClick={handleDelete} style={{ color: 'var(--red)', borderColor: 'var(--red)', background: '#fff' }}>
                    <i className="ti ti-trash"></i> Xóa nhân sự
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. Lịch sử thao tác */}
          {isEdit && (
            <div className="company-card info-section">
              <div className="section-header gray">
                <i className="ti ti-history"></i>
                <h3>Lịch sử thay đổi (Audit Log)</h3>
              </div>
              <div className="section-body">
                <div className="timeline">
                  {auditLogs.length === 0 ? (
                    <div className="tl-item">
                      <span className="tl-dot update"></span>
                      <div>
                        <div style={{ fontSize: '13.5px', color: '#64748b' }}>Chưa có lịch sử thay đổi nào.</div>
                      </div>
                    </div>
                  ) : auditLogs.map((log, idx) => {
                    let parsedMsg: React.ReactNode = null;
                    try {
                      if (log.message && log.message.startsWith('{')) {
                        const data = JSON.parse(log.message);
                        parsedMsg = (
                          <div style={{ marginTop: '4px', fontSize: '13.5px', color: '#334155' }}>
                            {Object.entries(data).map(([k, v]) => <div key={k}>&bull; <b>{k}:</b> {String(v)}</div>)}
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
                        <span className="tl-dot update"></span>
                        <div>
                          <div style={{ fontSize: '14px' }}><b>{log.user_email || 'Hệ thống'}</b> — {log.action}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(log.created_at).toLocaleString('vi-VN')}</div>
                          {parsedMsg}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
