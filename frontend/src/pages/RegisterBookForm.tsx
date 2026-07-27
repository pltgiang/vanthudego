import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { toast } from '../components/toast'

// Mock data cho danh sách người liên quan
const MOCK_USERS = [
  { id: 1, name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 4, name: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: 5, name: 'Hoàng Văn E', avatar: 'https://i.pravatar.cc/150?u=5' },
]

export default function RegisterBookForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    manager_ids: [] as number[],
    org_unit_id: 1,
    viewer_ids: [] as number[],
    status: 'Đang hoạt động'
  })

  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const managerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (managerRef.current && !managerRef.current.contains(event.target as Node)) &&
        (viewerRef.current && !viewerRef.current.contains(event.target as Node))
      ) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleUser = (field: 'manager_ids' | 'viewer_ids', userId: number) => {
    setFormData(prev => {
      const currentList = prev[field]
      if (currentList.includes(userId)) {
        return { ...prev, [field]: currentList.filter(id => id !== userId) }
      } else {
        return { ...prev, [field]: [...currentList, userId] }
      }
    })
  }

  const handleSave = async () => {
    if (!formData.name || formData.manager_ids.length === 0) {
      toast.error('Vui lòng nhập đầy đủ các trường bắt buộc (*)')
      return
    }
    try {
      setSaving(true)
      // Call API save here
      // await api.post('/api/register_books', formData)
      toast.success((!id || id === 'new') ? 'Đã thêm mới sổ văn bản thành công' : 'Đã cập nhật sổ văn bản')
      navigate('/books')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu')
    } finally {
      setSaving(false)
    }
  }

  const renderUserStack = (field: 'manager_ids' | 'viewer_ids', label: string, isRequired: boolean = false) => {
    const selectedUsers = MOCK_USERS.filter(u => formData[field].includes(u.id))
    const displayUsers = selectedUsers.slice(0, 5)
    const remainingCount = selectedUsers.length - 5

    return (
      <>
        <label>{label} {isRequired && <span className="req">*</span>}</label>
        <div className="position-relative" ref={field === 'manager_ids' ? managerRef : viewerRef}>
          <div 
            className="form-control dis-flex align-items-center" 
            style={{ minHeight: 40, cursor: 'pointer', padding: '4px 12px' }}
            onClick={() => setActiveDropdown(activeDropdown === field ? null : field)}
          >
            {selectedUsers.length === 0 ? (
              <span style={{ color: '#94a3b8' }}>Chọn {label.toLowerCase()}</span>
            ) : (
              <div className="dis-flex align-items-center" style={{ marginLeft: 8 }}>
                {displayUsers.map((u, i) => (
                  <img 
                    key={u.id}
                    src={u.avatar} 
                    alt={u.name}
                    style={{ 
                      width: 28, height: 28, borderRadius: '50%', 
                      border: '2px solid #fff', 
                      marginLeft: i === 0 ? 0 : -10,
                      zIndex: 10 - i,
                      objectFit: 'cover'
                    }}
                    title={u.name}
                  />
                ))}
                {remainingCount > 0 && (
                  <div 
                    style={{ 
                      width: 28, height: 28, borderRadius: '50%', 
                      border: '2px solid #fff', 
                      marginLeft: -10,
                      zIndex: 0,
                      backgroundColor: '#e2e8f0',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    +{remainingCount}
                  </div>
                )}
              </div>
            )}
            <i className="ti ti-chevron-down" style={{ marginLeft: 'auto', color: '#94a3b8' }}></i>
          </div>

          {activeDropdown === field && (
            <div 
              className="position-absolute" 
              style={{ 
                top: '100%', left: 0, right: 0, 
                backgroundColor: '#fff', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                borderRadius: 6, 
                marginTop: 4, 
                zIndex: 50,
                maxHeight: 240,
                overflowY: 'auto',
                border: '1px solid #e2e8f0'
              }}
            >
              {MOCK_USERS.map(u => {
                const isSelected = formData[field].includes(u.id)
                return (
                  <div 
                    key={u.id} 
                    className="dis-flex align-items-center gap-12"
                    style={{ 
                      padding: '8px 12px', 
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#f0f9ff' : '#fff'
                    }}
                    onClick={() => toggleUser(field, u.id)}
                  >
                    <input type="checkbox" checked={isSelected} readOnly className="react-checkbox" />
                    <img src={u.avatar} style={{ width: 32, height: 32, borderRadius: '50%' }} alt="" />
                    <span style={{ fontWeight: 500, color: '#1e293b' }}>{u.name}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column">
      {/* TOPBAR */}
      <div className="topbar dis-flex align-items-center" style={{ padding: '16px 34px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="page-title mb-0 flex1 dis-flex align-items-center gap-12">
          <button className="btn ghost icon-btn" onClick={() => navigate('/books')} style={{ padding: '0 8px' }}>
            <i className="ti ti-arrow-left"></i>
          </button>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
            {(!id || id === 'new') ? 'Thêm mới sổ văn bản' : 'Cập nhật sổ văn bản'}
          </span>
        </div>
        <div className="actions dis-flex gap-10">
          <button className="btn ghost" onClick={() => navigate('/books')}>Hủy bỏ</button>
          <button className="btn btn-primary" style={{ background: '#00aeef', borderColor: '#00aeef' }} onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content scrollable company-blocks-layout flex1">
        <div className="company-card info-section">
          <div className="section-header blue">
            <i className="ti ti-info-circle"></i>
            <h3>Thông tin chính</h3>
          </div>
          <div className="section-body grid-2">
            <div className="field col-span-2">
              <label>Tên sổ <span className="req">*</span></label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Nhập tên sổ..." 
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
              />
              {!formData.name && <small className="text-muted dis-block mt-4">Không được để trống.</small>}
            </div>

            <div className="field">
              {renderUserStack('manager_ids', 'Người quản lý', true)}
            </div>

            <div className="field">
              <label>Đơn vị <span className="req">*</span></label>
              <select 
                className="form-control" 
                value={formData.org_unit_id}
                onChange={e => handleChange('org_unit_id', Number(e.target.value))}
              >
                <option value={1}>CÔNG TY TNHH NÉT VIỆT</option>
                <option value={2}>CN HÀ NỘI</option>
              </select>
            </div>

            <div className="field">
              {renderUserStack('viewer_ids', 'Người xem sổ', false)}
            </div>

            <div className="field">
              <label>Trạng thái <span className="req">*</span></label>
              <select 
                className="form-control"
                value={formData.status}
                onChange={e => handleChange('status', e.target.value)}
              >
                <option value="Đang hoạt động">Đang hoạt động</option>
                <option value="Ngừng hoạt động">Ngừng hoạt động</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
