import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api as client } from '../api/client'
import { IconImport, IconExport } from '../components/Icons'

export default function DocumentList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(1) // 1: Đến, 2: Đi
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showColSettings, setShowColSettings] = useState(false)
  const [cols, setCols] = useState({
    doc_no: true,
    subject: true,
    issued_date: true,
    status: true
  })

  // Sorting state
  const [sortCol, setSortCol] = useState<string>('')
  const [sortAsc, setSortAsc] = useState<boolean>(true)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await client.get(`/api/documents?direction=${activeTab}&limit=100`)
      setData(res.data.data.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const exportCsv = () => {
    window.open(client.defaults.baseURL + `/api/documents/export/csv?direction=${activeTab}`, '_blank')
  }

  const handleAddNew = () => {
    if (activeTab === 1) {
      navigate('/incoming-documents/new')
    } else {
      navigate('/outgoing-documents/new')
    }
  }

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc)
    } else {
      setSortCol(col)
      setSortAsc(true)
    }
  }

  const getSortedData = () => {
    if (!sortCol) return data
    return [...data].sort((a, b) => {
      let valA = a[sortCol]
      let valB = b[sortCol]
      if (valA < valB) return sortAsc ? -1 : 1
      if (valA > valB) return sortAsc ? 1 : -1
      return 0
    })
  }

  const renderSortIcon = (col: string) => {
    if (sortCol !== col) return <i className="ti ti-arrows-sort" style={{ color: '#cbd5e1', marginLeft: 4 }}></i>
    return <i className={`ti ${sortAsc ? 'ti-sort-ascending' : 'ti-sort-descending'}`} style={{ color: '#00aeef', marginLeft: 4 }}></i>
  }

  const sortedData = getSortedData()

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column" style={{ padding: 0, background: '#f1f5f9' }}>
      
      {/* TOPBAR */}
      <div className="topbar px-34 py-12 dis-flex align-items-center justify-content-between" 
           style={{ backgroundColor: '#fff', borderRadius: 0, borderBottom: '1px solid #e2e8f0', marginBottom: 24 }}>
        <h2 className="page-title mb-0" style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
          Quản lý Văn bản
        </h2>
        <div className="actions dis-flex align-items-center gap-12">
          <button className="btn ghost icon-btn" title="Nhập dữ liệu (Đang phát triển)" style={{ borderRadius: 6 }}>
            <IconImport size={18} />
          </button>
          <button className="btn ghost icon-btn" title="Xuất dữ liệu" style={{ borderRadius: 6 }} onClick={exportCsv}>
            <IconExport size={18} />
          </button>
          <button className="btn btn-primary dis-flex align-items-center gap-8" 
                  style={{ borderRadius: 6, background: '#00aeef', borderColor: '#00aeef' }} 
                  onClick={handleAddNew}>
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
            Văn bản đến
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
            Văn bản đi
          </div>
        </div>

        {/* TABLE DATA BLOCK (Merged with Tabs) */}
        <div className="company-card flex1 dis-flex dis-flex-column" style={{ padding: 24, borderRadius: '0 8px 8px 8px', borderTopLeftRadius: activeTab === 1 ? 0 : 8 }}>
          
          {/* FILTER TOOLBAR */}
          <div className="toolbar px-10 py-16 dis-flex align-items-center justify-content-between border-bottom mb-16" style={{ gap: 16, flexWrap: 'nowrap' }}>
            <div className="dis-flex align-items-center" style={{ gap: 16, flex: '1 1 0%', flexWrap: 'wrap' }}>
              <div className="search-box position-relative" style={{ maxWidth: 300, flex: 1, minWidth: 200 }}>
                <i className="ti ti-search position-absolute text-muted" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}></i>
                <input type="text" className="form-control" placeholder="Tìm kiếm theo Tên / Số văn bản" style={{ paddingLeft: 36, borderRadius: 6 }} />
              </div>
              <select className="form-control" style={{ width: 140, borderRadius: 6 }}><option>Tất cả (Đơn vị)</option></select>
              <select className="form-control" style={{ width: 140, borderRadius: 6 }}><option>Tất cả (Loại VB)</option></select>
              <select className="form-control" style={{ width: 140, borderRadius: 6 }}>
                <option value="ALL">Tất cả (Trạng thái)</option>
                <option value="DONE">Đã xử lý</option>
                <option value="PENDING">Đang chờ</option>
              </select>
            </div>
            
            <div className="actions dis-flex align-items-center gap-12">
              <button className="btn outline icon-btn" title="Làm mới" style={{ borderRadius: 6 }} onClick={fetchData}><i className="ti ti-refresh"></i></button>
              <div className="position-relative">
                <button className="btn outline icon-btn" title="Cài đặt cột hiển thị" style={{ borderRadius: 6 }} onClick={() => setShowColSettings(!showColSettings)}><i className="ti ti-columns"></i></button>
                {showColSettings && (
                  <div className="position-absolute" style={{ top: 40, right: 0, backgroundColor: '#fff', minWidth: 200, padding: 16, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 10 }}>
                    <div style={{ textTransform: 'uppercase', color: '#1e293b', fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Tùy chỉnh cột</div>
                    <label className="dis-flex align-items-center gap-8 mb-8" style={{ fontSize: 15, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" className="react-checkbox" checked={cols.doc_no} onChange={e => setCols({...cols, doc_no: e.target.checked})} /> Số văn bản</label>
                    <label className="dis-flex align-items-center gap-8 mb-8" style={{ fontSize: 15, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" className="react-checkbox" checked={cols.subject} onChange={e => setCols({...cols, subject: e.target.checked})} /> Tên văn bản</label>
                    <label className="dis-flex align-items-center gap-8 mb-8" style={{ fontSize: 15, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" className="react-checkbox" checked={cols.issued_date} onChange={e => setCols({...cols, issued_date: e.target.checked})} /> Ngày ban hành</label>
                    <label className="dis-flex align-items-center gap-8" style={{ fontSize: 15, color: '#0f172a', fontWeight: 500 }}><input type="checkbox" className="react-checkbox" checked={cols.status} onChange={e => setCols({...cols, status: e.target.checked})} /> Tình trạng</label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="dis-flex align-items-center justify-content-center flex1">Đang tải dữ liệu...</div>
          ) : data.length > 0 ? (
            <div className="table-responsive flex1">
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e0e0e0' }}>
                    {cols.doc_no && <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1e293b', fontSize: 13, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('doc_no')}>Số văn bản {renderSortIcon('doc_no')}</th>}
                    {cols.subject && <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1e293b', fontSize: 13, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('subject')}>Tên văn bản {renderSortIcon('subject')}</th>}
                    {cols.issued_date && <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1e293b', fontSize: 13, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('issued_date')}>Ngày ban hành {renderSortIcon('issued_date')}</th>}
                    {cols.status && <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1e293b', fontSize: 13, textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('status')}>Tình trạng {renderSortIcon('status')}</th>}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }} onClick={() => navigate(`/documents/${item.id}`)} className="table-row-hover">
                      {cols.doc_no && <td style={{ padding: '12px 16px', fontWeight: 500 }}>{item.doc_no}</td>}
                      {cols.subject && <td style={{ padding: '12px 16px' }}>{item.subject}</td>}
                      {cols.issued_date && <td style={{ padding: '12px 16px' }}>{item.issued_date}</td>}
                      {cols.status && <td style={{ padding: '12px 16px' }}><span className={`badge ${item.status === 'Đã xử lý' ? 'green' : item.status === 'Chờ phê duyệt' ? 'orange' : 'gray'}`}>{item.status}</span></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dis-flex dis-flex-column align-items-center justify-content-center flex1 text-center" style={{ color: '#64748b' }}>
              <div className="dis-flex dis-flex-column align-items-center justify-content-center" style={{ width: 300, height: 200, background: '#f8fafc', borderRadius: 12, gap: 16 }}>
                <i className="ti ti-folder-open" style={{ fontSize: 64, color: '#cbd5e1' }}></i>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}>Chưa có văn bản nào được thêm</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
