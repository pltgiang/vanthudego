import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { toast } from '../components/toast';
import { askConfirm } from '../components/confirm';
import './CompanyInfo.css';

export default function CompanyInfo() {
  const { can } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCompany = async () => {
    if (!id) return;
    if (id === 'new') {
      setCompany({});
      setFormData({});
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/api/companies/${id}`);
      const c = res.data.data;
      setCompany(c);
      setFormData(c);
    } catch (e: any) {
      toast.error('Không thể tải thông tin công ty');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        short_name: formData.short_name,
        business_type: formData.business_type,
        tax_code: formData.tax_code,
        foundation_date: formData.foundation_date,
        business_registration_code: formData.business_registration_code,
        issue_date: formData.issue_date,
        issue_place: formData.issue_place,
        legal_rep_name: formData.legal_rep_name,
        address: formData.address,
        province: formData.province,
        district: formData.district,
        ward: formData.ward,
        phone: formData.phone,
        fax: formData.fax,
        invoice_email: formData.invoice_email,
        website: formData.website,
        is_group_model: formData.is_group_model,
        is_active: formData.is_active,
      };
      
      if (id === 'new') {
        await api.post(`/api/companies`, payload);
        toast.success('Đã thêm mới công ty');
        navigate('/companies');
      } else {
        if (!company) return;
        await api.patch(`/api/companies/${company.id}`, payload);
        toast.success('Đã lưu thông tin công ty');
        fetchCompany();
      }
    } catch (e: any) {
      toast.error('Lưu thất bại: ' + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (id === 'new') {
      toast.error('Vui lòng lưu thông tin công ty trước khi cập nhật logo');
      return;
    }
    const file = e.target.files?.[0];
    if (!file || !company) return;
    
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post(`/api/companies/${company.id}/logo`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData((prev: any) => ({ ...prev, logo: res.data.data.logo }));
      toast.success('Đã cập nhật logo');
    } catch (e: any) {
      toast.error('Cập nhật logo thất bại');
    }
  };

  const triggerLogoUpload = () => {
    fileInputRef.current?.click();
  };

  const toggleGroupModel = async () => {
    if (!company) return;
    const isCurrentlyGroup = formData.is_group_model;
    const action = isCurrentlyGroup ? 'Tắt' : 'Bật';
    if (await askConfirm({
      title: 'Xác nhận',
      message: `Bạn có chắc chắn muốn ${action} mô hình tập đoàn?`,
      confirmText: 'Xác nhận',
    })) {
      handleChange('is_group_model', !isCurrentlyGroup);
    }
  };

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (!company) return <div className="p-4">Không tìm thấy dữ liệu công ty</div>;

  return (
    <div className="company-info-page h-100">
      <div className="topbar dis-flex align-items-center">
        <div className="page-title mb-0 flex1 dis-flex align-items-center gap-12">
          <button className="btn ghost icon-btn" onClick={() => navigate('/company-info')}>
            <i className="ti ti-arrow-left"></i>
          </button>
          <span>{id === 'new' ? 'Thêm mới công ty' : 'Thông tin công ty'}</span>
        </div>
        <div className="actions dis-flex">
          <button type="button" className="btn ghost" onClick={() => navigate('/company-info')} style={{ background: 'rgb(241, 245, 249)', color: 'rgb(71, 85, 105)', border: 'none', marginRight: '12px' }}>
            Hủy bỏ
          </button>
          <button type="button" className="btn" onClick={handleSave} disabled={saving} style={{ marginRight: '12px', background: 'white', border: '1px solid rgb(203, 213, 225)', display: 'flex', alignItems: 'center', gap: '6px', color: 'rgb(14, 165, 233)' }}>
            <i className="ti ti-device-floppy"></i> {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            Hoàn tất
          </button>
        </div>
      </div>

      <div className="content scrollable company-blocks-layout">
        {/* Logo & Summary */}
        <div className="company-card company-summary-container">
          <div className="company-logo-section">
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleLogoUpload} />
            <div className="logo-preview" onClick={triggerLogoUpload}>
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" />
              ) : (
                <div className="logo-placeholder">
                  <i className="ti ti-camera"></i>
                </div>
              )}
              <div className="logo-overlay">
                <i className="ti ti-upload"></i> Tải ảnh lên
              </div>
            </div>
          </div>
          <div className="company-summary-info">
            <h2 style={{ margin: '0 0 8px 0' }}>{formData.name || 'Tên công ty'}</h2>
            <div className="dis-flex align-items-center gap-12">
              <span className="badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: 11, padding: '4px 12px', borderRadius: 100, fontWeight: 600 }}>
                MST: {formData.tax_code || 'Chưa cập nhật'}
              </span>
              <span className={`badge ${formData.is_active ? 'ok' : 'err'}`} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 100, fontWeight: 600 }}>
                {formData.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}
              </span>
            </div>
          </div>
        </div>

        <div className="company-blocks-grid">
          {/* 1. Thông tin chi tiết */}
          <div className="company-card info-section">
            <div className="section-header blue">
              <i className="ti ti-building-skyscraper"></i>
              <h3>Thông tin chi tiết</h3>
            </div>
            <div className="section-body grid-2">
              <div className="field col-span-2">
                <label>Tên đầy đủ <span className="req">*</span></label>
                <input type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
              </div>
              <div className="field">
                <label>Tên viết tắt</label>
                <input type="text" value={formData.short_name || ''} onChange={e => handleChange('short_name', e.target.value)} />
              </div>
              <div className="field">
                <label>Loại hình kinh doanh</label>
                <select value={formData.business_type || ''} onChange={e => handleChange('business_type', e.target.value)}>
                  <option value="Doanh nghiệp">Doanh nghiệp</option>
                  <option value="Hộ kinh doanh">Hộ kinh doanh</option>
                  <option value="Công ty TNHH MTV">Công ty TNHH MTV</option>
                  <option value="Công ty TNHH 2TV">Công ty TNHH 2TV</option>
                  <option value="Công ty Cổ phần">Công ty Cổ phần</option>
                  <option value="Tập đoàn">Tập đoàn</option>
                </select>
              </div>
              <div className="field">
                <label>Trạng thái</label>
                <select value={formData.is_active ? "true" : "false"} onChange={e => handleChange('is_active', e.target.value === "true")}>
                  <option value="true">Hoạt động</option>
                  <option value="false">Ngừng hoạt động</option>
                </select>
              </div>
              <div className="field">
                <label>Mã số thuế</label>
                <input type="text" value={formData.tax_code || ''} onChange={e => handleChange('tax_code', e.target.value)} />
              </div>
              <div className="field">
                <label>Mã công ty</label>
                <input type="text" value={formData.code || ''} disabled />
              </div>
              <div className="field">
                <label>Ngày thành lập</label>
                <input type="date" value={formData.foundation_date || ''} onChange={e => handleChange('foundation_date', e.target.value)} />
              </div>
            </div>
          </div>

          {/* 2. Đăng ký kinh doanh */}
          <div className="company-card info-section">
            <div className="section-header green">
              <i className="ti ti-file-certificate"></i>
              <h3>Đăng ký kinh doanh</h3>
            </div>
            <div className="section-body grid-2">
              <div className="field">
                <label>Mã số ĐKKD</label>
                <input type="text" value={formData.business_registration_code || ''} onChange={e => handleChange('business_registration_code', e.target.value)} />
              </div>
              <div className="field">
                <label>Ngày cấp</label>
                <input type="date" value={formData.issue_date || ''} onChange={e => handleChange('issue_date', e.target.value)} />
              </div>
              <div className="field col-span-2">
                <label>Nơi cấp</label>
                <input type="text" value={formData.issue_place || ''} onChange={e => handleChange('issue_place', e.target.value)} />
              </div>
              <div className="field">
                <label>Người đại diện pháp luật</label>
                <input type="text" value={formData.legal_rep_name || ''} onChange={e => handleChange('legal_rep_name', e.target.value)} />
              </div>
              <div className="field">
                <label>Chức danh</label>
                <input type="text" value={formData.legal_rep_title || ''} onChange={e => handleChange('legal_rep_title', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="company-blocks-grid">
          {/* 3. Thông tin liên hệ */}
          <div className="company-card info-section">
            <div className="section-header purple">
              <i className="ti ti-phone-call"></i>
              <h3>Thông tin liên hệ</h3>
            </div>
            <div className="section-body grid-2">
              <div className="field col-span-2">
                <label>Địa chỉ</label>
                <input type="text" value={formData.address || ''} onChange={e => handleChange('address', e.target.value)} />
              </div>
              <div className="field">
                <label>Tỉnh/Thành phố</label>
                <input type="text" value={formData.province || ''} onChange={e => handleChange('province', e.target.value)} placeholder="Nhập tỉnh/thành phố" />
              </div>
              <div className="field">
                <label>Quận/Huyện</label>
                <input type="text" value={formData.district || ''} onChange={e => handleChange('district', e.target.value)} placeholder="Nhập quận/huyện" />
              </div>
              <div className="field col-span-2">
                <label>Xã/Phường</label>
                <input type="text" value={formData.ward || ''} onChange={e => handleChange('ward', e.target.value)} placeholder="Nhập xã/phường" />
              </div>
              <div className="field">
                <label>Điện thoại</label>
                <input type="text" value={formData.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
              </div>
              <div className="field">
                <label>Fax</label>
                <input type="text" value={formData.fax || ''} onChange={e => handleChange('fax', e.target.value)} />
              </div>
              <div className="field">
                <label>Email liên hệ / Hóa đơn</label>
                <input type="text" value={formData.invoice_email || ''} onChange={e => handleChange('invoice_email', e.target.value)} />
              </div>
              <div className="field">
                <label>Website</label>
                <input type="text" value={formData.website || ''} onChange={e => handleChange('website', e.target.value)} />
              </div>
            </div>
          </div>

          {/* 4. Mô hình hoạt động */}
          <div className="company-card info-section">
            <div className="section-header orange">
              <i className="ti ti-settings"></i>
              <h3>Mô hình hoạt động</h3>
            </div>
            <div className="section-body">
              <div className="group-model-banner">
                <div className="icon">
                  <i className="ti ti-building-community"></i>
                </div>
                <div className="text flex1">
                  <h4>Chuyển thành mô hình tập đoàn</h4>
                  <p>Kích hoạt để quản lý nhiều công ty con và chi nhánh trong hệ thống</p>
                </div>
                <div className="action">
                  <button type="button" className={`btn ${formData.is_group_model ? 'err' : 'btn-primary'}`} onClick={toggleGroupModel}>
                    {formData.is_group_model ? 'Hủy mô hình tập đoàn' : 'Kích hoạt'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {id !== 'new' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
            {/* 5. Thao tác khác */}
            <div className="company-card info-section">
              <div className="section-header orange">
                <i className="ti ti-settings"></i>
                <h3>Thao tác khác</h3>
              </div>
              <div className="section-body">
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button type="button" className="btn outline" style={{ color: 'var(--red)', borderColor: 'var(--red)', background: '#fff' }}>
                    <i className="ti ti-trash"></i> Xóa bản ghi
                  </button>
                  <button type="button" className="btn outline">
                    <i className="ti ti-printer"></i> In thông tin
                  </button>
                  <button type="button" className="btn outline">
                    <i className="ti ti-file-export"></i> Xuất dữ liệu
                  </button>
                </div>
              </div>
            </div>

            {/* 6. Lịch sử thao tác */}
            <div className="company-card info-section">
              <div className="section-header green">
                <i className="ti ti-history"></i>
                <h3>Lịch sử thao tác</h3>
              </div>
              <div className="section-body">
                <div className="timeline">
                  {formData.updated_at && (
                    <div className="tl-item">
                      <span className="tl-dot update"></span>
                      <div>
                        <div style={{ fontSize: '14px' }}><b>{formData.updated_by || 'Người dùng'}</b> — Cập nhật thông tin</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(formData.updated_at).toLocaleString('vi-VN')}</div>
                      </div>
                    </div>
                  )}
                  <div className="tl-item">
                    <span className="tl-dot create"></span>
                    <div>
                      <div style={{ fontSize: '14px' }}><b>{formData.created_by || 'Hệ thống'}</b> — Tạo mới công ty</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{formData.created_at ? new Date(formData.created_at).toLocaleString('vi-VN') : ''}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
