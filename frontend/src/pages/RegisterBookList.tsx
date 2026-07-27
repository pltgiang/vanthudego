import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api as client } from '../api/client'
import { toast } from '../components/toast'
import RegisterBookModal from '../components/RegisterBookModal'
import { askConfirm } from '../components/confirm'
import { IconImport, IconExport } from "../components/Icons";

export default function RegisterBookList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(1) // 1: Đến, 2: Đi
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBookId, setEditingBookId] = useState<number | null>(null)
  
  const [showColSettings, setShowColSettings] = useState(false)
  const [cols, setCols] = useState({
    name: true,
    year: true,
    org_unit_id: true,
    manager_ids: true,
    status: true
  })
  
  // Sorting state
  const [sortCol, setSortCol] = useState<string>('')
  const [sortAsc, setSortAsc] = useState<boolean>(true)

  // Mapping
  const [orgUnits, setOrgUnits] = useState<Record<number, string>>({})
  const [users, setUsers] = useState<Record<number, any>>({})

  useEffect(() => {
    fetchOptions()
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [activeTab])

  const fetchOptions = async () => {
    try {
      const [orgRes, userRes] = await Promise.all([
        client.get('/api/org-units?limit=1000'),
        client.get('/api/employees?limit=1000')
      ])
      if (orgRes.data.success) {
        const map: any = {}
        orgRes.data.data.items.forEach((o: any) => { map[o.id] = o.name })
        setOrgUnits(map)
      }
      if (userRes.data.success) {
        const map: any = {}
        userRes.data.data.items.forEach((u: any) => { map[u.id] = u })
        setUsers(map)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const res = await client.get(`/api/register_books?direction=${activeTab}&limit=100`)
      if (res.data.success) {
        setBooks(res.data.data.items)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (await askConfirm({ message: 'Bạn có chắc chắn muốn xóa sổ văn bản này không? Thao tác này không thể hoàn tác.', title: 'Xác nhận xóa' })) {
      try {
        await client.delete(`/api/register_books/${id}`)
        toast.success('Xóa thành công')
        fetchBooks()
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xóa')
      }
    }
  }

  const renderUserStack = (userIds: number[]) => {
    if (!userIds || userIds.length === 0) return <span style={{ color: '#999' }}>Chưa thiết lập</span>
    const displayIds = userIds.slice(0, 3)
    const remain = userIds.length - 3
    
    return (
      <div className="dis-flex" style={{ gap: 4, alignItems: 'center' }}>
        {displayIds.map(uid => {
          const user = users[uid]
          if (!user) return null
          const initial = user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'
          return (
            <div 
              key={uid} 
              title={user.full_name}
              style={{
                width: 24, height: 24, borderRadius: '50%', backgroundColor: '#00aeef', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600,
                border: '1px solid #fff', marginLeft: displayIds.indexOf(uid) > 0 ? -8 : 0
              }}
            >
              {initial}
            </div>
          )
        })}
        {remain > 0 && (
          <div style={{
            width: 24, height: 24, borderRadius: '50%', backgroundColor: '#f0f0f0', color: '#666',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500,
            border: '1px solid #fff', marginLeft: -8
          }}>
            +{remain}
          </div>
        )}
      </div>
    )
  }

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc)
    } else {
      setSortCol(col)
      setSortAsc(true)
    }
  }

  const getSortedBooks = () => {
    if (!sortCol) return books
    return [...books].sort((a, b) => {
      let valA = a[sortCol]
      let valB = b[sortCol]

      // Custom formatting for specific columns
      if (sortCol === 'org_unit_id') {
        valA = orgUnits[valA] || ''
        valB = orgUnits[valB] || ''
      }
      
      if (valA < valB) return sortAsc ? -1 : 1
      if (valA > valB) return sortAsc ? 1 : -1
      return 0
    })
  }

  const renderSortIcon = (col: string) => {
    if (sortCol !== col) return <i className="ti ti-arrows-sort" style={{ color: '#cbd5e1', marginLeft: 4 }}></i>
    return <i className={`ti ${sortAsc ? 'ti-sort-ascending' : 'ti-sort-descending'}`} style={{ color: '#00aeef', marginLeft: 4 }}></i>
  }

  const sortedBooks = getSortedBooks()

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column" style={{ padding: 0, background: '#f1f5f9' }}>
      {/* TOPBAR */}
      <div className="topbar px-34 py-12 dis-flex align-items-center justify-content-between" 
           style={{ backgroundColor: '#fff', borderRadius: 0, borderBottom: '1px solid #e2e8f0', marginBottom: 24 }}>
        
        <h2 className="page-title mb-0" style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
          Quản lý Sổ văn bản
        </h2>
        
        <div className="actions dis-flex align-items-center gap-12">
          <button
            className="btn ghost icon-btn"
            title="Nhập dữ liệu"
          >
            <IconImport size={18} />
          </button>
          <button
            className="btn ghost icon-btn"
            title="Xuất dữ liệu"
          >
            <IconExport size={18} />
          </button>
          <button className="btn btn-primary dis-flex align-items-center gap-8" 
                  style={{ borderRadius: 6, background: '#00aeef', borderColor: '#00aeef' }} 
                  onClick={() => navigate('/books/new')}>
            <i className="ti ti-plus"></i> Thêm mới
          </button>
        </div>
      </div>

      <div className="flex1 dis-flex dis-flex-column">
        {/* FOLDER TABS */}
        <div className="dis-flex" style={{ gap: 4 }}>
          <div 
            className="tab-item"
            style={{ 
              padding: '12px 24px', 
              cursor: 'pointer', 
              backgroundColor: activeTab === 1 ? '#fff' : '#e2e8f0', 
              color: activeTab === 1 ? '#00aeef' : '#64748b', 
              fontWeight: activeTab === 1 ? 600 : 500,
              borderRadius: '8px 8px 0 0',
              border: '1px solid #fff',
              borderBottom: 'none',
              transition: 'all 0.2s'
            }}
            onClick={() => setActiveTab(1)}
          >
            Sổ văn bản đến
          </div>
          <div 
            className="tab-item"
            style={{ 
              padding: '12px 24px', 
              cursor: 'pointer', 
              backgroundColor: activeTab === 2 ? '#fff' : '#e2e8f0', 
              color: activeTab === 2 ? '#00aeef' : '#64748b', 
              fontWeight: activeTab === 2 ? 600 : 500,
              borderRadius: '8px 8px 0 0',
              border: '1px solid #fff',
              borderBottom: 'none',
              transition: 'all 0.2s'
            }}
            onClick={() => setActiveTab(2)}
          >
            Sổ văn bản đi
          </div>
        </div>

        {/* TABLE DATA BLOCK (Merged with Tabs) */}
        <div className="company-card flex1 dis-flex dis-flex-column" style={{ padding: 24, borderRadius: '0 8px 8px 8px', borderTopLeftRadius: activeTab === 1 ? 0 : 8 }}>
          
          {/* FILTER TOOLBAR */}
          <div className="toolbar px-10 py-16 dis-flex align-items-center justify-content-between border-bottom mb-16" style={{ gap: 16, flexWrap: 'nowrap' }}>
            <div className="dis-flex align-items-center" style={{ gap: 16, flex: '1 1 0%', flexWrap: 'wrap' }}>
              <div className="search-box position-relative" style={{ maxWidth: 300, flex: 1, minWidth: 200 }}>
                <i className="ti ti-search position-absolute text-muted" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}></i>
                <input type="text" className="form-control" placeholder="Tìm kiếm theo Tên sổ..." style={{ paddingLeft: 36, borderRadius: 6 }} />
              </div>
              <select className="form-control" style={{ width: 160, borderRadius: 6 }}>
                <option>Tất cả Đơn vị</option>
              </select>
              <select className="form-control" style={{ width: 140, borderRadius: 6 }}>
                <option>Năm 2023</option>
                <option>Năm 2024</option>
              </select>
            </div>
            
            <div className="actions dis-flex align-items-center gap-12">
              <button className="btn outline icon-btn" title="Làm mới" style={{ borderRadius: 6 }} onClick={fetchBooks}>
                <i className="ti ti-refresh"></i>
              </button>
              <div className="position-relative">
                <button className="btn outline icon-btn" title="Cài đặt cột hiển thị" style={{ borderRadius: 6 }} onClick={() => setShowColSettings(!showColSettings)}><i className="ti ti-columns"></i></button>
                {showColSettings && (
                  <div className="position-absolute" style={{ top: 40, right: 0, backgroundColor: '#fff', minWidth: 200, padding: 16, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 10 }}>
                    <div style={{ textTransform: 'uppercase', color: '#1e293b', fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Tùy chỉnh cột</div>
                    <label className="dis-flex align-items-center gap-8 mb-8" style={{ fontSize: 15, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" className="react-checkbox" checked={cols.name} onChange={e => setCols({...cols, name: e.target.checked})} /> Tên sổ</label>
                    <label className="dis-flex align-items-center gap-8 mb-8" style={{ fontSize: 15, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" className="react-checkbox" checked={cols.year} onChange={e => setCols({...cols, year: e.target.checked})} /> Năm</label>
                    <label className="dis-flex align-items-center gap-8 mb-8" style={{ fontSize: 15, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" className="react-checkbox" checked={cols.org_unit_id} onChange={e => setCols({...cols, org_unit_id: e.target.checked})} /> Đơn vị</label>
                    <label className="dis-flex align-items-center gap-8 mb-8" style={{ fontSize: 15, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" className="react-checkbox" checked={cols.manager_ids} onChange={e => setCols({...cols, manager_ids: e.target.checked})} /> Người quản lý</label>
                    <label className="dis-flex align-items-center gap-8" style={{ fontSize: 15, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" className="react-checkbox" checked={cols.status} onChange={e => setCols({...cols, status: e.target.checked})} /> Trạng thái</label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="dis-flex align-items-center justify-content-center flex1 text-muted">Đang tải dữ liệu...</div>
          ) : (
            <div className="table-responsive flex1">
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e0e0e0' }}>
                    {cols.name && (
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1e293b', fontSize: 13, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('name')}>
                      Tên sổ {renderSortIcon('name')}
                    </th>
                    )}
                    {cols.year && (
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1e293b', fontSize: 13, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('year')}>
                      Năm {renderSortIcon('year')}
                    </th>
                    )}
                    {cols.org_unit_id && (
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1e293b', fontSize: 13, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('org_unit_id')}>
                      Đơn vị {renderSortIcon('org_unit_id')}
                    </th>
                    )}
                    {cols.manager_ids && (
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1e293b', fontSize: 13, textTransform: 'uppercase' }}>
                      Người quản lý
                    </th>
                    )}
                    {cols.status && (
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#1e293b', fontSize: 13, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('status')}>
                      Trạng thái {renderSortIcon('status')}
                    </th>
                    )}
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#1e293b', fontSize: 13, textTransform: 'uppercase', width: 100 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBooks.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#999' }}>Chưa có dữ liệu</td>
                    </tr>
                  ) : sortedBooks.map(book => (
                    <tr key={book.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      {cols.name && <td style={{ padding: '12px 16px', fontWeight: 500 }}>{book.name}</td>}
                      {cols.year && <td style={{ padding: '12px 16px' }}>{book.year}</td>}
                      {cols.org_unit_id && <td style={{ padding: '12px 16px' }}>{orgUnits[book.org_unit_id] || book.org_unit_id}</td>}
                      {cols.manager_ids && <td style={{ padding: '12px 16px' }}>
                        {renderUserStack(book.manager_ids)}
                      </td>}
                      {cols.status && <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span className={`badge ${book.status === 1 ? 'green' : 'orange'}`}>
                          {book.status === 1 ? 'Hoạt động' : 'Đóng sổ'}
                        </span>
                      </td>}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div className="dis-flex gap-8" style={{ justifyContent: 'center' }}>
                          <button className="btn outline icon-btn" onClick={() => navigate(`/books/${book.id}`)} title="Sửa" style={{ width: 32, height: 32 }}>
                            <i className="ti ti-pencil" style={{ color: '#00aeef' }}></i>
                          </button>
                          <button className="btn outline icon-btn" onClick={() => handleDelete(book.id)} title="Xóa" style={{ width: 32, height: 32 }}>
                            <i className="ti ti-trash" style={{ color: '#ff4d4f' }}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <RegisterBookModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBooks}
        bookId={editingBookId}
        direction={activeTab}
      />
    </div>
  )
}
