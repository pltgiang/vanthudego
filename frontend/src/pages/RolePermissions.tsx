import { useState } from 'react'

import { IconImport } from "../components/Icons";

export default function RolePermissions() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'apps' | 'groups'>('users')

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column">
      {/* TOPBAR */}
      <div className="topbar px-34 py-12 dis-flex align-items-center justify-content-between">
        <h2 className="page-title mb-0">Vai trò & Phân quyền</h2>
        <div className="actions dis-flex gap-8">
          <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'ghost'}`} onClick={() => setActiveTab('users')}>Người dùng</button>
          <button className={`btn ${activeTab === 'roles' ? 'btn-primary' : 'ghost'}`} onClick={() => setActiveTab('roles')}>Vai trò</button>
          <button className={`btn ${activeTab === 'apps' ? 'btn-primary' : 'ghost'}`} onClick={() => setActiveTab('apps')}>Ứng dụng</button>
          <button className={`btn ${activeTab === 'groups' ? 'btn-primary' : 'ghost'}`} onClick={() => setActiveTab('groups')}>Nhóm</button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content scrollable company-blocks-layout flex1">
        {activeTab === 'users' && (
          <div className="company-card h-100 dis-flex dis-flex-column" style={{ padding: 24 }}>
            <div className="toolbar px-10 py-16 dis-flex align-items-center justify-content-between border-bottom" style={{ gap: '16px', flexWrap: 'nowrap' }}>
              <div className="dis-flex align-items-center" style={{ gap: 16, flex: '1 1 0%', flexWrap: 'wrap' }}>
                <div className="search-box position-relative" style={{ maxWidth: 300, flex: 1, minWidth: 200 }}>
                  <i className="ti ti-search position-absolute text-muted" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" className="form-control" placeholder="Tìm kiếm quản trị hệ thống" style={{ paddingLeft: 36, borderRadius: 6 }} />
                </div>
                <select className="form-control" style={{ width: 180, borderRadius: 6 }}>
                  <option value="ALL">Tất cả (Vai trò)</option>
                  <option value="SYS">Quản trị hệ thống</option>
                  <option value="SEC">Quản trị bảo mật</option>
                </select>
              </div>
              <div className="actions dis-flex gap-8">
                <button className="btn outline icon-btn"><IconImport size={18} /></button>
                <button className="btn outline primary dis-flex align-items-center gap-8"><i className="ti ti-plus" /> Thêm mới</button>
                <button className="btn outline icon-btn"><i className="ti ti-columns" /></button>
              </div>
            </div>
            
            <div className="table-responsive flex1 mt-16 table-px-10">
              <table className="table table-hover table-px-10 mb-0">
                <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
                  <tr>
                    <th>Mã NV</th>
                    <th>Họ và tên</th>
                    <th>SĐT TK</th>
                    <th>Email tài khoản</th>
                    <th>Đơn vị công tác</th>
                    <th>Vị trí CV</th>
                    <th>Vai trò</th>
                    <th>Trạng thái TK</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>NV000001</td>
                    <td>
                      <div className="dis-flex align-items-center gap-12">
                        <div className="avatar" style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#E0E7FF', color: '#3730A3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 12 }}>JL</div>
                        <span className="font-weight-bold">Jean Luc</span>
                      </div>
                    </td>
                    <td>-</td>
                    <td>pjeanluc211@gmail.com</td>
                    <td>CÔNG TY TNHH NÉT VIỆT</td>
                    <td>-</td>
                    <td><a href="#" className="text-primary font-weight-bold" style={{ textDecoration: 'none' }}>Quản trị hệ thống</a></td>
                    <td><span className="badge" style={{ backgroundColor: '#eff6ff', color: '#3b82f6', border: 'none', padding: '4px 8px', borderRadius: 4 }}>Đang hoạt động</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pagination-footer px-10 py-16 dis-flex align-items-center justify-content-between border-top bg-white">
              <div className="text-muted" style={{ fontSize: 13 }}>
                Tổng số bản ghi: <span style={{ fontWeight: 600, color: 'rgb(15, 23, 42)' }}>1</span>
              </div>
              <div className="dis-flex align-items-center gap-16">
                <div className="dis-flex align-items-center gap-8 text-muted" style={{ fontSize: 13 }}>
                  Số dòng/trang
                  <select className="form-control" style={{ width: 70, height: 32, padding: '0 8px', borderRadius: 6 }}>
                    <option>20</option>
                  </select>
                </div>
                <div className="text-muted" style={{ fontSize: 13 }}>1 - 1</div>
                <div className="pagination-actions dis-flex gap-4">
                  <button className="btn btn-outline icon-btn" disabled style={{ width: 32, height: 32, padding: 0 }}><i className="ti ti-chevrons-left" /></button>
                  <button className="btn btn-outline icon-btn" disabled style={{ width: 32, height: 32, padding: 0 }}><i className="ti ti-chevron-left" /></button>
                  <button className="btn btn-outline icon-btn" disabled style={{ width: 32, height: 32, padding: 0 }}><i className="ti ti-chevron-right" /></button>
                  <button className="btn btn-outline icon-btn" disabled style={{ width: 32, height: 32, padding: 0 }}><i className="ti ti-chevrons-right" /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="company-card h-100 dis-flex dis-flex-column" style={{ padding: 24 }}>
            <div className="toolbar px-10 py-16 dis-flex align-items-center justify-content-between border-bottom" style={{ gap: '16px', flexWrap: 'nowrap' }}>
              <div className="dis-flex align-items-center" style={{ gap: 16, flex: '1 1 0%', flexWrap: 'wrap' }}>
                <div className="search-box position-relative" style={{ maxWidth: 300, flex: 1, minWidth: 200 }}>
                  <i className="ti ti-search position-absolute text-muted" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" className="form-control" placeholder="Tìm kiếm vai trò" style={{ paddingLeft: 36, borderRadius: 6 }} />
                </div>
              </div>
              <div className="actions dis-flex gap-8">
                <button className="btn outline icon-btn"><IconImport size={18} /></button>
                <button className="btn outline primary dis-flex align-items-center gap-8" onClick={() => window.location.href = '/roles/new'}>
                  <i className="ti ti-plus" /> Thêm vai trò
                </button>
                <button className="btn outline icon-btn"><i className="ti ti-columns" /></button>
              </div>
            </div>
            
            <div className="table-responsive flex1 mt-16 table-px-10">
              <table className="table table-hover table-px-10 mb-0">
                <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
                  <tr>
                    <th style={{ cursor: 'pointer', userSelect: 'none', width: '20%' }}><div className="dis-flex align-items-center gap-6">Mã vai trò</div></th>
                    <th style={{ cursor: 'pointer', userSelect: 'none', width: '25%' }}><div className="dis-flex align-items-center gap-6">Tên vai trò</div></th>
                    <th style={{ cursor: 'pointer', userSelect: 'none', width: '35%' }}><div className="dis-flex align-items-center gap-6">Mô tả</div></th>
                    <th style={{ cursor: 'pointer', userSelect: 'none', width: '15%' }}><div className="dis-flex align-items-center gap-6">Trạng thái</div></th>
                    <th className="text-right" style={{ width: '5%' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ROLE_SEC</td>
                    <td className="font-weight-bold"><a href="/roles/1" className="text-dark" style={{ textDecoration: 'none' }}>Quản trị bảo mật</a></td>
                    <td className="text-muted" style={{ whiteSpace: 'normal', lineHeight: 1.5 }}>
                      Có quyền thực hiện các tính năng trên AMIS Hệ thống, nhưng không thể tự phân quyền truy cập ứng dụng cho mình...
                    </td>
                    <td><span className="badge" style={{backgroundColor: '#eff6ff', color: '#3b82f6'}}>Đang hoạt động</span></td>
                    <td className="text-right actions-cell">
                      <button className="icon-btn" title="Sửa"><i className="ti ti-pencil" /></button>
                      <button className="icon-btn text-danger" title="Xóa"><i className="ti ti-trash" /></button>
                    </td>
                  </tr>
                  <tr>
                    <td>ROLE_CAT</td>
                    <td className="font-weight-bold">Quản lý danh mục</td>
                    <td className="text-muted" style={{ whiteSpace: 'normal', lineHeight: 1.5 }}>
                      Được thêm, sửa, xóa danh mục (Cơ cấu tổ chức, nhân viên…) nhưng không được thực hiện tính năng khác...
                    </td>
                    <td><span className="badge" style={{backgroundColor: '#f1f5f9', color: '#64748b'}}>Ngừng hoạt động</span></td>
                    <td className="text-right actions-cell">
                      <button className="icon-btn" title="Sửa"><i className="ti ti-pencil" /></button>
                      <button className="icon-btn text-danger" title="Xóa"><i className="ti ti-trash" /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pagination-footer px-10 py-16 dis-flex align-items-center justify-content-between border-top bg-white">
              <div className="text-muted" style={{ fontSize: 13 }}>
                Tổng số bản ghi: <span style={{ fontWeight: 600, color: 'rgb(15, 23, 42)' }}>2</span>
              </div>
              <div className="dis-flex align-items-center gap-16">
                <div className="dis-flex align-items-center gap-8 text-muted" style={{ fontSize: 13 }}>
                  Số dòng/trang
                  <select className="form-control" style={{ width: 70, height: 32, padding: '0 8px', borderRadius: 6 }}>
                    <option>20</option>
                  </select>
                </div>
                <div className="text-muted" style={{ fontSize: 13 }}>
                  1 - 2
                </div>
                <div className="pagination-actions dis-flex gap-4">
                  <button className="btn btn-outline icon-btn" disabled style={{ width: 32, height: 32, padding: 0 }}><i className="ti ti-chevrons-left" /></button>
                  <button className="btn btn-outline icon-btn" disabled style={{ width: 32, height: 32, padding: 0 }}><i className="ti ti-chevron-left" /></button>
                  <button className="btn btn-outline icon-btn" disabled style={{ width: 32, height: 32, padding: 0 }}><i className="ti ti-chevron-right" /></button>
                  <button className="btn btn-outline icon-btn" disabled style={{ width: 32, height: 32, padding: 0 }}><i className="ti ti-chevrons-right" /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'apps' && (
          <div className="company-card h-100 dis-flex dis-flex-column" style={{ padding: 24 }}>
            <div className="toolbar px-10 py-16 dis-flex align-items-center justify-content-between border-bottom" style={{ gap: '16px', flexWrap: 'nowrap' }}>
              <div className="dis-flex align-items-center" style={{ gap: 16, flex: '1 1 0%', flexWrap: 'wrap' }}>
                <div className="search-box position-relative" style={{ maxWidth: 300, flex: 1, minWidth: 200 }}>
                  <i className="ti ti-search position-absolute text-muted" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" className="form-control" placeholder="Tìm kiếm ứng dụng" style={{ paddingLeft: 36, borderRadius: 6 }} />
                </div>
              </div>
              <div className="actions dis-flex gap-8">
                <button className="btn outline icon-btn"><IconImport size={18} /></button>
                <button className="btn outline primary dis-flex align-items-center gap-8"><i className="ti ti-plus" /> Thêm ứng dụng</button>
                <button className="btn outline icon-btn"><i className="ti ti-columns" /></button>
              </div>
            </div>
            
            <div className="table-responsive flex1 mt-16 table-px-10">
              <table className="table table-hover table-px-10 mb-0">
                <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
                  <tr>
                    <th>Tên ứng dụng</th>
                    <th>Đối tượng sử dụng</th>
                    <th>Trạng thái sử dụng</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="cursor-pointer">
                    <td>
                      <div className="dis-flex align-items-center gap-2">
                        <div className="app-icon" style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#FEF08A' }}></div>
                        <span className="font-weight-bold">Kiến thức</span>
                      </div>
                    </td>
                    <td>Tất cả người dùng</td>
                    <td><span className="badge" style={{ backgroundColor: '#EAF7EF', color: '#16A34A', border: 'none', padding: '4px 8px', borderRadius: 4 }}>Đang sử dụng</span></td>
                  </tr>
                  <tr className="cursor-pointer">
                    <td>
                      <div className="dis-flex align-items-center gap-2">
                        <div className="app-icon" style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#E9D5FF' }}></div>
                        <span className="font-weight-bold">Phòng họp</span>
                      </div>
                    </td>
                    <td>Người dùng được phân quyền</td>
                    <td><span className="badge" style={{ backgroundColor: '#EAF7EF', color: '#16A34A', border: 'none', padding: '4px 8px', borderRadius: 4 }}>Đang sử dụng</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pagination-footer px-10 py-16 dis-flex align-items-center justify-content-between border-top bg-white">
              <div className="text-muted" style={{ fontSize: 13 }}>
                Tổng số bản ghi: <span style={{ fontWeight: 600, color: 'rgb(15, 23, 42)' }}>2</span>
              </div>
              <div className="dis-flex align-items-center gap-16">
                <div className="dis-flex align-items-center gap-8 text-muted" style={{ fontSize: 13 }}>
                  Số dòng/trang
                  <select className="form-control" style={{ width: 70, height: 32, padding: '0 8px', borderRadius: 6 }}>
                    <option>20</option>
                  </select>
                </div>
                <div className="text-muted" style={{ fontSize: 13 }}>
                  1 - 2
                </div>
                <div className="pagination-actions dis-flex gap-4">
                  <button className="btn btn-outline icon-btn" disabled style={{ width: 32, height: 32, padding: 0 }}><i className="ti ti-chevrons-left" /></button>
                  <button className="btn btn-outline icon-btn" disabled style={{ width: 32, height: 32, padding: 0 }}><i className="ti ti-chevron-left" /></button>
                  <button className="btn btn-outline icon-btn" disabled style={{ width: 32, height: 32, padding: 0 }}><i className="ti ti-chevron-right" /></button>
                  <button className="btn btn-outline icon-btn" disabled style={{ width: 32, height: 32, padding: 0 }}><i className="ti ti-chevrons-right" /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="company-card h-100 dis-flex dis-flex-column" style={{ padding: 24 }}>
            <div className="toolbar px-10 py-16 dis-flex align-items-center justify-content-between border-bottom" style={{ gap: '16px', flexWrap: 'nowrap' }}>
              <div className="dis-flex align-items-center" style={{ gap: 16, flex: '1 1 0%', flexWrap: 'wrap' }}>
                <div className="search-box position-relative" style={{ maxWidth: 300, flex: 1, minWidth: 200 }}>
                  <i className="ti ti-search position-absolute text-muted" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" className="form-control" placeholder="Tìm kiếm nhóm" style={{ paddingLeft: 36, borderRadius: 6 }} />
                </div>
              </div>
              <div className="actions dis-flex gap-8">
                <button className="btn outline icon-btn"><IconImport size={18} /></button>
                <button className="btn outline primary dis-flex align-items-center gap-8"><i className="ti ti-plus" /> Thêm nhóm</button>
                <button className="btn outline icon-btn"><i className="ti ti-columns" /></button>
              </div>
            </div>
            
            <div className="table-responsive flex1 mt-16 table-px-10">
              <table className="table table-hover table-px-10 mb-0">
                <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
                  <tr>
                    <th>Tên nhóm</th>
                    <th className="text-right">Số lượng người dùng</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="cursor-pointer">
                    <td>
                      <div className="font-weight-bold" style={{ fontSize: 13 }}>Người dùng app Tuyển dụng</div>
                      <div className="text-muted mt-1" style={{ fontSize: 12 }}>Những người dùng được nhân sự mời vào Hội đồng tuyển dụng</div>
                    </td>
                    <td className="text-right">0</td>
                  </tr>
                  <tr className="cursor-pointer">
                    <td>
                      <div className="font-weight-bold" style={{ fontSize: 13 }}>Tất cả người dùng</div>
                    </td>
                    <td className="text-right">1</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pagination-footer px-10 py-16 dis-flex align-items-center justify-content-between border-top bg-white">
              <div className="text-muted" style={{ fontSize: 13 }}>
                Tổng số bản ghi: <span style={{ fontWeight: 600, color: 'rgb(15, 23, 42)' }}>2</span>
              </div>
              <div className="dis-flex align-items-center gap-16">
                <div className="dis-flex align-items-center gap-8 text-muted" style={{ fontSize: 13 }}>
                  Số dòng/trang
                  <select className="form-control" style={{ width: 70, height: 32, padding: '0 8px', borderRadius: 6 }}>
                    <option>20</option>
                  </select>
                </div>
                <div className="text-muted" style={{ fontSize: 13 }}>
                  1 - 2
                </div>
                <div className="pagination-actions dis-flex gap-4">
                  <button className="btn btn-outline icon-btn" disabled style={{ width: 32, height: 32, padding: 0 }}><i className="ti ti-chevrons-left" /></button>
                  <button className="btn btn-outline icon-btn" disabled style={{ width: 32, height: 32, padding: 0 }}><i className="ti ti-chevron-left" /></button>
                  <button className="btn btn-outline icon-btn" disabled style={{ width: 32, height: 32, padding: 0 }}><i className="ti ti-chevron-right" /></button>
                  <button className="btn btn-outline icon-btn" disabled style={{ width: 32, height: 32, padding: 0 }}><i className="ti ti-chevrons-right" /></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
