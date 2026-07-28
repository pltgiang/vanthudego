import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { toast } from '../components/toast';
import { askConfirm } from '../components/confirm';
import './CompanyInfo.css';

export default function VpnPermissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subject, setSubject] = useState<any>(null);
  const [servers, setServers] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/system/subjects/${id}`);
      const data = res.data.data;
      setSubject(data);
      const access = data.vpn_access || '';
      setServers(access ? access.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
      
      const logRes = await api.get(`/api/audit-logs?entity=subject&entity_id=${id}`);
      // Filter for vpn access updates
      const allLogs = logRes.data.data?.items || logRes.data.data || [];
      const vpnLogs = allLogs.filter((log: any) => log.message?.includes('Quyền truy cập VPN'));
      setAuditLogs(vpnLogs);
    } catch (e: any) {
      toast.error('Không thể tải thông tin nhân sự');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const toggleServer = (server: string) => {
    setServers(prev => {
      if (prev.includes(server)) {
        return prev.filter(s => s !== server);
      } else {
        return [...prev, server];
      }
    });
  };

  const handleSave = async (close: boolean = false) => {
    try {
      setSaving(true);
      const newAccessString = servers.join(',');
      
      await api.patch(`/api/v1/system/subjects/${id}/vpn`, { vpn_access: newAccessString });
      toast.success('Đã lưu phân quyền VPN');
      
      if (close) {
        navigate('/vpn');
      } else {
        fetchDetail();
      }
    } catch (e: any) {
      toast.error('Lưu thất bại: ' + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleClearVpn = async () => {
    if (await askConfirm({
      title: 'Xóa quyền VPN',
      message: `Bạn có chắc chắn muốn xóa toàn bộ quyền truy cập VPN của nhân sự này?`,
      confirmText: 'Xóa quyền',
      confirmColor: 'var(--red)',
    })) {
      try {
        await api.patch(`/api/v1/system/subjects/${id}/vpn`, { vpn_access: '' });
        toast.success('Đã xóa quyền VPN');
        fetchDetail();
      } catch (e: any) {
        toast.error('Xóa quyền thất bại: ' + (e.response?.data?.message || e.message));
      }
    }
  };

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (!subject) return <div className="p-4">Không tìm thấy dữ liệu nhân sự</div>;

  return (
    <div className="company-info-page h-100">
      <div className="topbar dis-flex align-items-center border-bottom">
        <div className="page-title mb-0 flex1 dis-flex align-items-center gap-12">
          <button className="btn ghost icon-btn" onClick={() => navigate('/vpn')}>
            <i className="ti ti-arrow-left"></i>
          </button>
          <span>Chỉnh sửa quyền VPN</span>
        </div>
        <div className="actions dis-flex">
          <button type="button" className="btn ghost" onClick={() => navigate('/vpn')} style={{ background: 'rgb(241, 245, 249)', color: 'rgb(71, 85, 105)', border: 'none', marginRight: '12px' }}>
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

      <div className="content scrollable company-blocks-layout" style={{ padding: '24px' }}>
        <div className="company-blocks-grid">
          {/* 1. Thông tin chung */}
          <div className="company-card info-section">
            <div className="section-header blue">
              <i className="ti ti-user"></i>
              <h3>Thông tin Nhân sự</h3>
            </div>
            <div className="section-body grid-2">
              <div className="field">
                <label>Mã Nhân sự</label>
                <input type="text" value={subject.subject_code || ''} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
              </div>
              <div className="field">
                <label>Họ tên</label>
                <input type="text" value={subject.subject_name || ''} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
              </div>
              <div className="field col-span-2">
                <label>Công ty</label>
                <input type="text" value={subject.org_unit_names?.join(', ') || ''} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
              </div>
              <div className="field col-span-2">
                <label>Phòng ban</label>
                <input type="text" value={subject.department_names?.join(', ') || ''} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
              </div>
            </div>
          </div>

          {/* 2. Phân quyền VPN */}
          <div className="company-card info-section">
            <div className="section-header purple">
              <i className="ti ti-server"></i>
              <h3>Cấp quyền kết nối Máy chủ</h3>
            </div>
            <div className="section-body">
              <div className="dis-flex dis-flex-column gap-16">
                <div className="dis-flex align-items-center justify-content-between p-12 border" style={{ borderRadius: 8, backgroundColor: servers.includes('Dego') ? '#f0fdf4' : 'transparent', borderColor: servers.includes('Dego') ? '#bbf7d0' : '#e2e8f0', transition: 'all 0.2s' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Máy chủ Dego</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Cấp quyền kết nối VPN tới mạng nội bộ của Dego</div>
                  </div>
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={() => toggleServer('Dego')}
                    style={servers.includes('Dego') 
                      ? { border: '1px solid #10b981', color: '#fff', backgroundColor: '#10b981', borderRadius: '6px', fontWeight: 500, height: '40px', padding: '0px 16px', transition: 'all 0.2s' }
                      : { border: '1px solid rgb(203, 213, 225)', color: 'rgb(100, 116, 139)', backgroundColor: 'transparent', borderRadius: '6px', fontWeight: 500, height: '40px', padding: '0px 16px', transition: 'all 0.2s' }
                    }
                  >
                    {servers.includes('Dego') ? 'Đã cấp quyền' : 'Cấp quyền'}
                  </button>
                </div>
                
                <div className="dis-flex align-items-center justify-content-between p-12 border" style={{ borderRadius: 8, backgroundColor: servers.includes('IDA') ? '#f0fdf4' : 'transparent', borderColor: servers.includes('IDA') ? '#bbf7d0' : '#e2e8f0', transition: 'all 0.2s' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Máy chủ IDA</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Cấp quyền kết nối VPN tới mạng hệ thống IDA</div>
                  </div>
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={() => toggleServer('IDA')}
                    style={servers.includes('IDA') 
                      ? { border: '1px solid #10b981', color: '#fff', backgroundColor: '#10b981', borderRadius: '6px', fontWeight: 500, height: '40px', padding: '0px 16px', transition: 'all 0.2s' }
                      : { border: '1px solid rgb(203, 213, 225)', color: 'rgb(100, 116, 139)', backgroundColor: 'transparent', borderRadius: '6px', fontWeight: 500, height: '40px', padding: '0px 16px', transition: 'all 0.2s' }
                    }
                  >
                    {servers.includes('IDA') ? 'Đã cấp quyền' : 'Cấp quyền'}
                  </button>
                </div>
                
                <div className="dis-flex align-items-center justify-content-between p-12 border" style={{ borderRadius: 8, backgroundColor: servers.includes('IDA,1433') ? '#f0fdf4' : 'transparent', borderColor: servers.includes('IDA,1433') ? '#bbf7d0' : '#e2e8f0', transition: 'all 0.2s' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Cổng IDA,1433</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Cấp quyền truy cập cổng 1433 trên máy chủ IDA</div>
                  </div>
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={() => toggleServer('IDA,1433')}
                    style={servers.includes('IDA,1433') 
                      ? { border: '1px solid #10b981', color: '#fff', backgroundColor: '#10b981', borderRadius: '6px', fontWeight: 500, height: '40px', padding: '0px 16px', transition: 'all 0.2s' }
                      : { border: '1px solid rgb(203, 213, 225)', color: 'rgb(100, 116, 139)', backgroundColor: 'transparent', borderRadius: '6px', fontWeight: 500, height: '40px', padding: '0px 16px', transition: 'all 0.2s' }
                    }
                  >
                    {servers.includes('IDA,1433') ? 'Đã cấp quyền' : 'Cấp quyền'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 3. Thao tác khác */}
          <div className="company-card info-section">
            <div className="section-header orange">
              <i className="ti ti-settings"></i>
              <h3>Thao tác khác</h3>
            </div>
            <div className="section-body">
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button type="button" className="btn outline" onClick={handleClearVpn} style={{ color: 'var(--red)', borderColor: 'var(--red)', background: '#fff' }}>
                  <i className="ti ti-trash"></i> Xóa toàn bộ quyền VPN
                </button>
              </div>
            </div>
          </div>

          {/* 4. Lịch sử thao tác */}
          <div className="company-card info-section">
            <div className="section-header green">
              <i className="ti ti-history"></i>
              <h3>Lịch sử thay đổi quyền VPN</h3>
            </div>
            <div className="section-body">
              <div className="timeline">
                {auditLogs.length === 0 ? (
                  <div className="tl-item">
                    <span className="tl-dot update"></span>
                    <div>
                      <div style={{ fontSize: '13.5px', color: '#64748b' }}>Chưa có lịch sử thay đổi quyền VPN nào.</div>
                    </div>
                  </div>
                ) : auditLogs.map((log, idx) => {
                  let parsedMsg: React.ReactNode = null;
                  try {
                    if (log.message && log.message.startsWith('{')) {
                      const data = JSON.parse(log.message);
                      parsedMsg = (
                        <div style={{ marginTop: '4px', fontSize: '13.5px', color: '#334155' }}>
                          &bull; Cập nhật quyền thành: <b>{data['Quyền truy cập VPN'] || 'Trống'}</b>
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
                        <div style={{ fontSize: '14px' }}><b>{log.user_email || 'Hệ thống'}</b> — Cập nhật quyền VPN</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(log.created_at).toLocaleString('vi-VN')}</div>
                        {parsedMsg}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
