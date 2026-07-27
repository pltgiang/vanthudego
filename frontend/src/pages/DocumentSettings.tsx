import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import CrudList from '../components/CrudList'
import { cruds } from '../config/cruds'
import { useAuth } from '../auth/AuthContext'
import { api } from '../api/client'
import { toast } from '../components/toast'
import { IconImport, IconExport } from '../components/Icons'

export default function DocumentSettings() {
  const [activeTab, setActiveTab] = useState<'doc-types' | 'secrecy-levels' | 'urgency-levels' | 'partners'>('doc-types')

  const renderTab = (key: string, label: string) => {
    const isActive = activeTab === key
    return (
      <div 
        className="tab-item"
        style={{ 
          padding: '12px 24px', 
          cursor: 'pointer', 
          backgroundColor: isActive ? '#fff' : '#e2e8f0', 
          color: isActive ? '#00aeef' : '#64748b', 
          fontWeight: isActive ? 600 : 500,
          borderRadius: '8px 8px 0 0',
          border: '1px solid #fff',
          borderBottom: 'none',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap'
        }}
        onClick={() => setActiveTab(key as any)}
      >
        {label}
      </div>
    )
  }

  const navigate = useNavigate()
  const { can } = useAuth()
  const cfg = cruds[activeTab]
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    try {
      const r = await api.get(`${cfg.apiPath}/export/csv`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([r.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${cfg.slug}.csv`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch (e) {
      toast.error('Lỗi khi xuất file')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const r = await api.post(`${cfg.apiPath}/import/csv`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success(r.data.message || 'Nhập file thành công')
      // To reload data, we can just toggle activeTab back and forth or trigger a reload event.
      // Easiest is to force a re-render or let user refresh for now since state is in child.
      window.location.reload()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lỗi khi nhập file')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column" style={{ padding: 0, background: '#f1f5f9' }}>
      {/* TOPBAR */}
      <div className="topbar px-34 py-12 dis-flex align-items-center justify-content-between" 
           style={{ backgroundColor: '#fff', borderRadius: 0, borderBottom: '1px solid #e2e8f0', marginBottom: 24 }}>
        <h2 className="page-title mb-0" style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
          Thiết lập Văn bản
        </h2>
        
        <div className="actions dis-flex align-items-center gap-12">
          {cfg.importExport && can(cfg.entity, 'write') && (
            <>
              <button className="btn ghost icon-btn" title="Nhập dữ liệu" style={{ borderRadius: 6 }} onClick={() => fileInputRef.current?.click()}>
                <IconImport size={18} />
              </button>
              <button className="btn ghost icon-btn" title="Xuất dữ liệu" style={{ borderRadius: 6 }} onClick={handleExport}>
                <IconExport size={18} />
              </button>
              <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImport} />
            </>
          )}
          {can(cfg.entity, 'create') && (
            <button className="btn btn-primary dis-flex align-items-center gap-8" 
                    style={{ borderRadius: 6, background: '#00aeef', borderColor: '#00aeef' }}
                    onClick={() => navigate(`/${cfg.slug}/new`)}>
              <i className="ti ti-plus"></i> Thêm mới
            </button>
          )}
        </div>
      </div>

      <div className="flex1 dis-flex dis-flex-column">
        {/* FOLDER TABS */}
        <div className="dis-flex" style={{ gap: 4, overflowX: 'auto' }}>
          {renderTab('doc-types', 'Loại văn bản')}
          {renderTab('secrecy-levels', 'Mức độ mật')}
          {renderTab('urgency-levels', 'Mức độ khẩn')}
          {renderTab('partners', 'Đối tác')}
        </div>

        {/* CONTENT BLOCK */}
        <div className="company-card flex1 dis-flex dis-flex-column" style={{ padding: 24, borderRadius: '0 8px 8px 8px', borderTopLeftRadius: activeTab === 'doc-types' ? 0 : 8 }}>
          <CrudList entityProp={activeTab} embedded={true} />
        </div>
      </div>
    </div>
  )
}
