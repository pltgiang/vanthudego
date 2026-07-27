import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function UserPermissionDetail() {
  const navigate = useNavigate()
  
  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column">
      {/* TOPBAR */}
      <div className="topbar dis-flex align-items-center">
        <button className="btn ghost btn-icon mr-3" onClick={() => navigate('/roles')}>
          <i className="ti ti-arrow-left" />
        </button>
        <div className="page-title mb-0 flex1">Thêm vai trò</div>
      </div>

      {/* CONTENT */}
      <div className="content scrollable company-blocks-layout flex1 pb-5">
        <div className="company-blocks-grid">
          
          {/* BLOCK 1: THÔNG TIN CHUNG */}
          <div className="company-card info-section col-span-2">
            <div className="section-header blue">
              <i className="ti ti-info-circle"></i>
              <h3 style={{ textTransform: 'uppercase' }}>Thông tin chung</h3>
            </div>
            
            <div className="section-body grid-2">
              <div className="field">
                <label>Tên vai trò <span className="req">*</span></label>
                <input type="text" className="form-control" placeholder="Nhập tên vai trò" />
              </div>
              <div className="field">
                <label>Mô tả</label>
                <textarea className="form-control" placeholder="Nhập mô tả" style={{ minHeight: '88px', resize: 'vertical' }}></textarea>
              </div>
            </div>
          </div>

          {/* BLOCK 2: PHÂN QUYỀN PHÂN HỆ */}
          <div className="company-card info-section col-span-2">
            <div className="section-header green">
              <i className="ti ti-shield-check"></i>
              <h3 style={{ textTransform: 'uppercase' }}>Phân quyền phân hệ</h3>
            </div>
            
            <div className="section-body">
              <div className="perm-tree">
                
                {/* Node 1 */}
                <div className="dis-flex align-items-center justify-content-between py-2 border-bottom">
                  <div className="dis-flex align-items-center gap-2">
                    <i className="ti ti-chevron-right text-transparent" style={{ visibility: 'hidden' }} />
                    <span className="font-weight-bold">Thông tin công ty</span>
                  </div>
                  <div className="dis-flex align-items-center gap-2">
                    <input type="checkbox" checked={true} readOnly style={{ width: 16, height: 16 }} />
                    <select className="form-control input-sm" style={{ width: 140 }}>
                      <option>Xem, Sửa</option>
                    </select>
                  </div>
                </div>

                {/* Node 2 */}
                <div className="dis-flex align-items-center justify-content-between py-2 border-bottom">
                  <div className="dis-flex align-items-center gap-2">
                    <i className="ti ti-chevron-down cursor-pointer" />
                    <span className="font-weight-bold">Quản lý danh mục</span>
                  </div>
                  <div className="dis-flex align-items-center gap-2">
                    <input type="checkbox" checked={true} readOnly style={{ width: 16, height: 16 }} />
                    <select className="form-control input-sm" style={{ width: 140 }}>
                      <option>Toàn quyền</option>
                    </select>
                  </div>
                </div>

                {/* Node 2.1 */}
                <div className="dis-flex align-items-center justify-content-between py-2 border-bottom bg-light" style={{ paddingLeft: 32 }}>
                  <div className="dis-flex align-items-center gap-2">
                    <span>Cơ cấu tổ chức</span>
                  </div>
                  <div className="dis-flex align-items-center gap-2">
                    <input type="checkbox" checked={true} readOnly style={{ width: 16, height: 16 }} />
                    <select className="form-control input-sm" style={{ width: 140 }}>
                      <option>Toàn quyền</option>
                    </select>
                  </div>
                </div>

                {/* Node 2.2 */}
                <div className="dis-flex align-items-center justify-content-between py-2 border-bottom bg-light" style={{ paddingLeft: 32 }}>
                  <div className="dis-flex align-items-center gap-2">
                    <span>Người dùng</span>
                  </div>
                  <div className="dis-flex align-items-center gap-2">
                    <input type="checkbox" checked={true} readOnly style={{ width: 16, height: 16 }} />
                    <select className="form-control input-sm" style={{ width: 140 }}>
                      <option>Toàn quyền</option>
                    </select>
                  </div>
                </div>

                {/* Node 3 */}
                <div className="dis-flex align-items-center justify-content-between py-2 border-bottom">
                  <div className="dis-flex align-items-center gap-2">
                    <i className="ti ti-chevron-down cursor-pointer" />
                    <span className="font-weight-bold">Phân quyền</span>
                    <span className="perm-warn" style={{ color: '#E8A317', fontSize: 12 }}>(Người có quyền này chỉ được phân quyền truy cập cho người khác, không được thêm, sửa quyền của chính mình)</span>
                  </div>
                  <div className="dis-flex align-items-center gap-2">
                    <input type="checkbox" checked={false} readOnly style={{ width: 16, height: 16 }} />
                    <select className="form-control input-sm" disabled style={{ width: 140 }}>
                      <option>Chọn quyền</option>
                    </select>
                  </div>
                </div>

                {/* Node 3.1 */}
                <div className="dis-flex align-items-center justify-content-between py-2 border-bottom bg-light" style={{ paddingLeft: 32 }}>
                  <div className="dis-flex align-items-center gap-2">
                    <span>Ứng dụng, nhóm</span>
                  </div>
                  <div className="dis-flex align-items-center gap-2">
                    <input type="checkbox" checked={false} readOnly style={{ width: 16, height: 16 }} />
                    <select className="form-control input-sm" disabled style={{ width: 140 }}>
                      <option>Chọn quyền</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* STICKY FOOTER */}
      <div className="border-top bg-white p-3 dis-flex justify-content-end" style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
        <div className="actions dis-flex gap-2">
          <button className="btn ghost" onClick={() => navigate('/roles')}>Hủy</button>
          <button className="btn btn-primary">Lưu</button>
        </div>
      </div>
    </div>
  )
}
