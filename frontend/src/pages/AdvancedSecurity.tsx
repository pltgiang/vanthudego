import { useState } from 'react'

export default function AdvancedSecurity() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [autoLogout, setAutoLogout] = useState(false)
  const [ipRestrict, setIpRestrict] = useState(false)
  const [timeRestrict, setTimeRestrict] = useState(false)
  const [emailRestrict, setEmailRestrict] = useState(false)
  const [restrictScope, setRestrictScope] = useState('ALL_APPS')
  
  return (
    <div className="company-info-page h-100">
      {/* TOPBAR */}
      <div className="topbar dis-flex align-items-center">
        <div className="page-title mb-0 flex1">Bảo mật nâng cao</div>
        <div className="actions dis-flex">
          {!isEditMode ? (
            <button className="btn btn-primary" onClick={() => setIsEditMode(true)}>
              <i className="ti ti-pencil" /> Chỉnh sửa
            </button>
          ) : (
            <>
              <button className="btn ghost" onClick={() => setIsEditMode(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={() => setIsEditMode(false)}>Lưu</button>
            </>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="content scrollable company-blocks-layout">
        <div className="company-blocks-grid" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* BLOCK 1: TỰ ĐỘNG ĐĂNG XUẤT */}
          <div className="company-card info-section">
            <div className="section-header blue">
              <i className="ti ti-logout"></i>
              <h3 style={{ textTransform: 'uppercase' }}>Tự động đăng xuất</h3>
            </div>
            
            <div className="section-body">
              <div className="dis-flex align-items-start mb-20" style={{ gap: '16px' }}>
                <div className={`switch-toggle ${autoLogout ? 'active' : ''}`} style={{ opacity: isEditMode ? 1 : 0.6, cursor: isEditMode ? 'pointer' : 'not-allowed', flexShrink: 0, marginTop: 2 }} onClick={() => isEditMode && setAutoLogout(!autoLogout)}>
                  <div className="switch-knob"></div>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>Tự động đăng xuất</div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>Tính từ thời điểm người dùng đăng nhập, cứ sau khoảng thời gian đã thiết lập hệ thống sẽ tự động đăng xuất.</div>
                </div>
              </div>
              
              {autoLogout && (
                <div className="dis-flex align-items-center" style={{ gap: '12px', marginLeft: '56px' }}>
                  <input type="number" className="form-control" style={{ width: '100px' }} placeholder="Số" disabled={!isEditMode} defaultValue={30} />
                  <select className="form-control" style={{ width: '120px' }} disabled={!isEditMode}>
                    <option value="phút">phút</option>
                    <option value="giờ">giờ</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* BLOCK 2: GIỚI HẠN TRUY CẬP */}
          <div className="company-card info-section">
            <div className="section-header green">
              <i className="ti ti-shield-lock"></i>
              <h3 style={{ textTransform: 'uppercase' }}>Giới hạn truy cập</h3>
            </div>
            
            <div className="section-body">
              <div className="dis-flex align-items-start mb-20" style={{ gap: '16px' }}>
                <div className={`switch-toggle ${ipRestrict ? 'active' : ''}`} style={{ opacity: isEditMode ? 1 : 0.6, cursor: isEditMode ? 'pointer' : 'not-allowed', flexShrink: 0, marginTop: 2 }} onClick={() => isEditMode && setIpRestrict(!ipRestrict)}>
                  <div className="switch-knob"></div>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)' }}>Giới hạn truy cập theo địa chỉ IP</div>
                </div>
              </div>

              {ipRestrict && (
                <div className="mb-24" style={{ marginLeft: '56px' }}>
                  <div className="dis-flex align-items-center mb-2" style={{ gap: '8px' }}>
                    <div className="chips-input border rounded p-2 flex1 dis-flex align-items-center flex-wrap" style={{ minHeight: '40px', gap: '4px', backgroundColor: !isEditMode ? '#f9fafb' : '#fff' }}>
                      <span className="chip" style={{ backgroundColor: '#F1F3F6', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        192.168.1.1 <i className="ti ti-x" style={{ cursor: 'pointer' }} />
                      </span>
                      {isEditMode && <input type="text" placeholder="Thêm IP..." style={{ border: 'none', outline: 'none', flex: 1, minWidth: '100px', backgroundColor: 'transparent' }} />}
                    </div>
                    {isEditMode && <button className="btn ghost">Dùng IP hiện tại</button>}
                  </div>
                </div>
              )}

              <div className="dis-flex align-items-start mb-20" style={{ gap: '16px' }}>
                <div className={`switch-toggle ${timeRestrict ? 'active' : ''}`} style={{ opacity: isEditMode ? 1 : 0.6, cursor: isEditMode ? 'pointer' : 'not-allowed', flexShrink: 0, marginTop: 2 }} onClick={() => isEditMode && setTimeRestrict(!timeRestrict)}>
                  <div className="switch-knob"></div>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)' }}>Giới hạn truy cập theo thời gian</div>
                </div>
              </div>

              {timeRestrict && (
                <div className="mb-24" style={{ marginLeft: '56px' }}>
                  <div className="border rounded p-3 mb-2">
                    <div className="dis-flex align-items-center mb-3" style={{ gap: '16px' }}>
                      <div className="dis-flex align-items-center" style={{ gap: '8px' }}>
                        <input type="checkbox" id="t2" disabled={!isEditMode} /><label htmlFor="t2">Thứ 2</label>
                      </div>
                      <div className="dis-flex align-items-center" style={{ gap: '8px' }}>
                        <input type="checkbox" id="t3" disabled={!isEditMode} /><label htmlFor="t3">Thứ 3</label>
                      </div>
                      <div className="dis-flex align-items-center" style={{ gap: '8px' }}>
                        <input type="checkbox" id="t4" disabled={!isEditMode} /><label htmlFor="t4">Thứ 4</label>
                      </div>
                      <div className="dis-flex align-items-center" style={{ gap: '8px' }}>
                        <input type="checkbox" id="t5" disabled={!isEditMode} /><label htmlFor="t5">Thứ 5</label>
                      </div>
                      <div className="dis-flex align-items-center" style={{ gap: '8px' }}>
                        <input type="checkbox" id="t6" disabled={!isEditMode} /><label htmlFor="t6">Thứ 6</label>
                      </div>
                    </div>
                    <div className="dis-flex align-items-center" style={{ gap: '12px' }}>
                      <input type="time" className="form-control" style={{ width: '120px' }} disabled={!isEditMode} defaultValue="08:00" />
                      <span>-</span>
                      <input type="time" className="form-control" style={{ width: '120px' }} disabled={!isEditMode} defaultValue="17:30" />
                      {isEditMode && <button className="btn ghost btn-sm"><i className="ti ti-trash text-danger" /></button>}
                    </div>
                  </div>
                  {isEditMode && <button className="btn ghost btn-sm">+ Thêm khung giờ</button>}
                </div>
              )}

              <div className="mt-24 pt-24 border-top">
                <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', marginBottom: '12px' }}>Áp dụng giới hạn truy cập cho</div>
                <div className="dis-flex flex-column gap-2 mb-3">
                  <label className="dis-flex align-items-center" style={{ gap: '8px', cursor: isEditMode ? 'pointer' : 'not-allowed' }}>
                    <input type="radio" name="scope" value="ALL_APPS" checked={restrictScope === 'ALL_APPS'} disabled={!isEditMode} onChange={(e) => setRestrictScope(e.target.value)} />
                    Tất cả ứng dụng
                  </label>
                  <label className="dis-flex align-items-center" style={{ gap: '8px', cursor: isEditMode ? 'pointer' : 'not-allowed' }}>
                    <input type="radio" name="scope" value="SELECTED_APPS" checked={restrictScope === 'SELECTED_APPS'} disabled={!isEditMode} onChange={(e) => setRestrictScope(e.target.value)} />
                    Chỉ ứng dụng được chọn
                  </label>
                </div>
                {restrictScope === 'SELECTED_APPS' && (
                  <div className="chips-input border rounded p-2 mb-4 dis-flex align-items-center flex-wrap" style={{ minHeight: '40px', gap: '4px', backgroundColor: !isEditMode ? '#f9fafb' : '#fff' }}>
                    <span className="chip" style={{ backgroundColor: '#F1F3F6', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      DMS - Công cụ văn thư <i className="ti ti-x" style={{ cursor: 'pointer' }} />
                    </span>
                    {isEditMode && <input type="text" placeholder="Chọn ứng dụng..." style={{ border: 'none', outline: 'none', flex: 1, minWidth: '100px', backgroundColor: 'transparent' }} />}
                  </div>
                )}
              </div>

              <div className="mt-32">
                <div className="dis-flex align-items-center justify-content-between mb-16">
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)' }}>Danh sách người dùng không bị giới hạn truy cập</div>
                  {isEditMode && (
                    <div className="dis-flex gap-2">
                      <button className="btn ghost">+ Thêm danh sách quản trị</button>
                      <button className="btn ghost">+ Thêm người dùng</button>
                    </div>
                  )}
                </div>
                <div className="border rounded overflow-hidden">
                  <table className="table table-px-10 mb-0" style={{ width: '100%' }}>
                    <thead style={{ backgroundColor: '#f4f7fe' }}>
                      <tr>
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Họ và tên</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Email tài khoản</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Đơn vị công tác</th>
                        {isEditMode && <th style={{ width: '50px' }}></th>}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={isEditMode ? 4 : 3} className="text-center py-4 text-muted">
                          Không có dữ liệu
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK 3: GIỚI HẠN TÊN MIỀN EMAIL TÀI KHOẢN */}
          <div className="company-card info-section">
            <div className="section-header purple">
              <i className="ti ti-mail"></i>
              <h3 style={{ textTransform: 'uppercase' }}>Giới hạn tên miền email tài khoản</h3>
            </div>
            
            <div className="section-body">
              <div className="dis-flex align-items-start mb-20" style={{ gap: '16px' }}>
                <div className={`switch-toggle ${emailRestrict ? 'active' : ''}`} style={{ opacity: isEditMode ? 1 : 0.6, cursor: isEditMode ? 'pointer' : 'not-allowed', flexShrink: 0, marginTop: 2 }} onClick={() => isEditMode && setEmailRestrict(!emailRestrict)}>
                  <div className="switch-knob"></div>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>Giới hạn tên miền email tài khoản</div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>
                    Tên miền email là những ký tự sau dấu @, ví dụ: gmail.com; outlook.com;<br/>
                    Chỉ những email chứa tên miền cho phép mới có thể dùng làm email TK.
                  </div>
                </div>
              </div>
              
              {emailRestrict && (
                <div className="chips-input border rounded p-2" style={{ marginLeft: '56px', minHeight: '40px', backgroundColor: !isEditMode ? '#f9fafb' : '#fff' }}>
                  {isEditMode && <input type="text" placeholder="Thêm tên miền..." style={{ border: 'none', outline: 'none', width: '100%', backgroundColor: 'transparent' }} />}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
