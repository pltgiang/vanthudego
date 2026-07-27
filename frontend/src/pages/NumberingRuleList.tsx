import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api as client } from '../api/client'
import { toast } from '../components/toast'
import { askConfirm } from '../components/confirm'
import { IconImport, IconExport } from "../components/Icons";

export default function NumberingRuleList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(1) // 1: Đến, 2: Đi, 3: Nội bộ
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const [showColSettings, setShowColSettings] = useState(false)
  const [cols, setCols] = useState({
    template: true,
    start_number: true,
    reset_cycle: true,
    is_editable: true,
    target: true,
  })
  
  useEffect(() => {
    fetchRules()
  }, [activeTab])

  const fetchRules = async () => {
    setLoading(true)
    try {
      const res = await client.get(`/api/numbering_rules?direction=${activeTab}&limit=100`)
      if (res.data.success) {
        setRules(res.data.data.items)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    const ok = await askConfirm('Bạn có chắc chắn muốn xóa quy tắc này không?')
    if (!ok) return
    try {
      const res = await client.delete(`/api/numbering_rules/${id}`)
      if (res.data.success) {
        toast.success('Xóa quy tắc thành công')
        fetchRules()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleColToggle = (key: keyof typeof cols) => {
    setCols(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column" style={{ padding: 0, background: '#f1f5f9' }}>
      {/* TOPBAR */}
      <div className="topbar px-34 py-12 dis-flex align-items-center justify-content-between" 
           style={{ backgroundColor: '#fff', borderRadius: 0, borderBottom: '1px solid #e2e8f0' }}>
        <h2 className="page-title mb-0" style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
          Quy tắc đánh số
        </h2>
        <div className="actions dis-flex align-items-center gap-12">
          <button className="btn ghost" title="Nhập dữ liệu" style={{ borderRadius: 6 }}>
            <IconImport />
          </button>
          <button className="btn ghost" title="Xuất dữ liệu" style={{ borderRadius: 6 }}>
            <IconExport />
          </button>
          <Link to="/numbering-rules/add" className="btn btn-primary dis-flex align-items-center gap-8" 
                  style={{ borderRadius: 6, background: '#00aeef', borderColor: '#00aeef' }}>
            <i className="ti ti-plus"></i> Thêm mới
          </Link>
        </div>
      </div>

      <div className="content scrollable flex1 dis-flex dis-flex-column">
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
          <div 
            className="tab-item"
            style={{ 
              padding: '12px 24px', 
              cursor: 'pointer', 
              backgroundColor: activeTab === 3 ? '#fff' : '#e2e8f0', 
              color: activeTab === 3 ? '#00aeef' : '#64748b', 
              fontWeight: activeTab === 3 ? 600 : 500,
              borderRadius: '8px 8px 0 0',
              border: '1px solid #fff',
              borderBottom: 'none',
              transition: 'all 0.2s'
            }}
            onClick={() => setActiveTab(3)}
          >
            Văn bản nội bộ
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="company-card flex1 dis-flex dis-flex-column" style={{ padding: 24, borderRadius: '0 8px 8px 8px', borderTopLeftRadius: activeTab === 1 ? 0 : 8 }}>
          
          <div className="toolbar px-10 py-16 dis-flex align-items-center justify-content-between border-bottom mb-16" 
               style={{ gap: 16, flexWrap: 'nowrap' }}>
            <div className="dis-flex align-items-center" style={{ gap: 16, flex: '1 1 0%' }}>
              <div className="search-box position-relative" style={{ maxWidth: 300, width: '100%' }}>
                <i className="ti ti-search position-absolute text-muted" style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}></i>
                <input type="text" className="form-control" placeholder="Tìm kiếm theo quy tắc..." style={{ paddingLeft: 36, borderRadius: 6 }} />
              </div>
            </div>
            
            <div className="actions dis-flex align-items-center gap-12">
              <button className="btn outline icon-btn" title="Làm mới" onClick={fetchRules}><i className="ti ti-refresh"></i></button>
              <div className="position-relative">
                <button className="btn outline icon-btn" title="Cài đặt cột" style={{ borderRadius: 6 }} onClick={() => setShowColSettings(!showColSettings)}>
                  <i className="ti ti-columns"></i>
                </button>
                {showColSettings && (
                  <div className="dropdown-menu show" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 100, minWidth: 200, marginTop: 4 }}>
                    <div className="px-3 py-2 text-muted border-bottom" style={{fontSize: 13, fontWeight: 600}}>Hiển thị cột</div>
                    <label className="dropdown-item dis-flex align-items-center gap-8 mb-0" style={{cursor: 'pointer'}}>
                      <input type="checkbox" checked={cols.template} onChange={() => handleColToggle('template')} /> Quy tắc đánh số
                    </label>
                    <label className="dropdown-item dis-flex align-items-center gap-8 mb-0" style={{cursor: 'pointer'}}>
                      <input type="checkbox" checked={cols.start_number} onChange={() => handleColToggle('start_number')} /> Bắt đầu từ số
                    </label>
                    <label className="dropdown-item dis-flex align-items-center gap-8 mb-0" style={{cursor: 'pointer'}}>
                      <input type="checkbox" checked={cols.reset_cycle} onChange={() => handleColToggle('reset_cycle')} /> Đánh số
                    </label>
                    <label className="dropdown-item dis-flex align-items-center gap-8 mb-0" style={{cursor: 'pointer'}}>
                      <input type="checkbox" checked={cols.is_editable} onChange={() => handleColToggle('is_editable')} /> Sửa số
                    </label>
                    <label className="dropdown-item dis-flex align-items-center gap-8 mb-0" style={{cursor: 'pointer'}}>
                      <input type="checkbox" checked={cols.target} onChange={() => handleColToggle('target')} /> Đối tượng áp dụng
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="table-responsive flex1">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  {cols.template && <th>Quy tắc đánh số</th>}
                  {cols.target && <th>Đối tượng áp dụng</th>}
                  {cols.start_number && <th>Bắt đầu từ số</th>}
                  {cols.reset_cycle && <th>Đánh số</th>}
                  {cols.is_editable && <th>Sửa số</th>}
                  <th style={{width: 80, textAlign: 'center'}}>#</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="text-center py-4">Đang tải...</td></tr>
                ) : rules.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-4 text-muted">Chưa có quy tắc nào</td></tr>
                ) : rules.map(rule => (
                  <tr key={rule.id}>
                    {cols.template && (
                      <td>
                        <Link to={`/numbering-rules/${rule.id}`} style={{ fontWeight: 500, color: '#00aeef', textDecoration: 'none' }}>
                          {rule.template}
                        </Link>
                      </td>
                    )}
                    {cols.target && (
                      <td>
                        <div style={{fontSize: 13}}>
                          <div><b>Loại VB:</b> {rule.is_all_doc_types ? "Tất cả" : `${rule.doc_type_ids.length} loại`}</div>
                          <div><b>Sổ VB:</b> {rule.is_all_books ? "Tất cả" : (rule.is_no_book ? "Văn bản không sổ" : `${rule.book_ids.length} sổ`)}</div>
                        </div>
                      </td>
                    )}
                    {cols.start_number && <td>{rule.start_number}</td>}
                    {cols.reset_cycle && <td>{rule.reset_cycle === "YEAR" ? "Theo năm" : "Liên tiếp"}</td>}
                    {cols.is_editable && (
                      <td>
                        {rule.is_editable ? <span className="badge badge-success">Có</span> : <span className="badge badge-secondary">Không</span>}
                      </td>
                    )}
                    <td style={{textAlign: 'center'}}>
                      <div className="actions dis-flex justify-content-center gap-8">
                        <Link to={`/numbering-rules/${rule.id}`} className="btn outline icon-btn" title="Sửa"><i className="ti ti-pencil"></i></Link>
                        <button className="btn outline icon-btn text-danger" title="Xóa" onClick={() => handleDelete(rule.id)}><i className="ti ti-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
