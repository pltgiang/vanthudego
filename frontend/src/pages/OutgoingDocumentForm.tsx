import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { toast } from '../components/toast'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { TemplateLibraryModal } from '../components/TemplateLibraryModal'

// Mock data cho danh sách người liên quan
const MOCK_USERS = [
  { id: 1, name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 4, name: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: 5, name: 'Hoàng Văn E', avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: 6, name: 'Vũ Thị F', avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: 7, name: 'Đặng Văn G', avatar: 'https://i.pravatar.cc/150?u=7' },
  { id: 8, name: 'Bùi Thị H', avatar: 'https://i.pravatar.cc/150?u=8' },
]

export default function OutgoingDocumentForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    subject: '',
    doc_no: '',
    is_important: false,
    is_urgent: false,
    issued_date: '',
    doc_type: '',
    due_date: '', // Thêm cho giống form Đến
    register_book: '',
    drafting_unit: '',
    recipients: [] as string[],
    doc_form: '',
    sent_date: new Date().toISOString().split('T')[0], // Default today
    security_level: '',
    signer: '',
    storage_location: '',
    
    // Tình trạng xử lý
    status: 'Chưa xử lý',
    processing_deadline: '',
    related_users: [] as number[],
    processors: [] as number[],
    report_receivers: [] as number[],
    processing_result: '',
    approver_id: '', // Added for Approval Workflow

    related_incoming_docs: [] as string[],
    summary: ''
  })
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [showLibrary, setShowLibrary] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  
  const relatedUsersRef = useRef<HTMLDivElement>(null)
  const reportReceiversRef = useRef<HTMLDivElement>(null)
  const processorsRef = useRef<HTMLDivElement>(null)

  // Memoize quill modules to prevent toolbar duplication in Strict Mode
  const quillModules = React.useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  }), [])

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (relatedUsersRef.current && !relatedUsersRef.current.contains(event.target as Node)) &&
        (reportReceiversRef.current && !reportReceiversRef.current.contains(event.target as Node)) &&
        (processorsRef.current && !processorsRef.current.contains(event.target as Node))
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

  const toggleUser = (field: 'related_users' | 'report_receivers' | 'processors', userId: number) => {
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
    if (!formData.subject || !formData.doc_no || !formData.issued_date) {
      toast.error('Vui lòng nhập đầy đủ các trường bắt buộc (*)')
      return
    }
    try {
      // API call (giả lập)
      toast.success('Đã lưu văn bản đi thành công')
      navigate('/outgoing-documents')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu')
    }
  }

  const renderUserStack = (field: 'related_users' | 'report_receivers' | 'processors', label: string) => {
    const selectedUsers = MOCK_USERS.filter(u => formData[field].includes(u.id))
    const displayUsers = selectedUsers.slice(0, 5)
    const remainingCount = selectedUsers.length - 5

    return (
      <div className="field">
        <label>{label}</label>
        <div className="position-relative" ref={field === 'related_users' ? relatedUsersRef : field === 'report_receivers' ? reportReceiversRef : processorsRef}>
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
                overflowY: 'auto'
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
      </div>
    )
  }

  return (
    <div className="company-info-page h-100">
      {/* TOPBAR */}
      <div className="topbar dis-flex align-items-center">
        <button className="btn ghost icon-btn" onClick={() => navigate(-1)}>
          <i className="ti ti-arrow-left"></i>
        </button>
        <div className="page-title mb-0 flex1" style={{ marginLeft: 8 }}>Thêm mới văn bản đi</div>
        <div className="actions dis-flex">
          <button className="btn ghost" onClick={() => navigate(-1)}>Hủy bỏ</button>
          <button className="btn btn-primary" onClick={handleSave}>Lưu</button>
        </div>
      </div>

      <div className="content scrollable company-blocks-layout" style={{ padding: '24px 0' }}>
        
        {/* BLOCK 1: TỆP VĂN BẢN */}
        <div className="company-card company-summary-container">
          <div className="company-logo-section">
            <div className="logo-preview" style={{ width: 120, height: 120, background: '#f8fafc', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              {attachedFile ? (
                <>
                  <i className="ti ti-file-text" style={{ fontSize: 40, color: '#0ea5e9' }}></i>
                  <span style={{ fontSize: 12, color: '#1e293b', textAlign: 'center', wordBreak: 'break-all', padding: '0 8px' }}>{attachedFile.name}</span>
                </>
              ) : (
                <i className="ti ti-cloud-upload" style={{ fontSize: 48, color: '#94a3b8' }}></i>
              )}
            </div>
          </div>
          <div className="company-summary-info">
            <h2 style={{ fontSize: 20, marginBottom: 8, color: '#1e293b' }}>Tệp văn bản</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
              {attachedFile ? `Đã đính kèm: ${attachedFile.name}` : 'Kéo thả tệp vào đây hoặc tải lên từ máy tính'}
            </p>
            <div className="dis-flex gap-12">
              <button className="btn btn-primary dis-flex align-items-center gap-8" style={{ background: '#00aeef', borderColor: '#00aeef' }}>
                <i className="ti ti-upload"></i> Tải tệp từ máy tính
              </button>
              <button className="btn outline dis-flex align-items-center gap-8" onClick={() => setShowLibrary(true)}>
                <i className="ti ti-book"></i> Chọn từ thư viện
              </button>
              {attachedFile && (
                <button className="btn outline dis-flex align-items-center gap-8" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => setAttachedFile(null)}>
                  <i className="ti ti-trash"></i> Xóa file
                </button>
              )}
            </div>
          </div>
        </div>

        {showLibrary && (
          <TemplateLibraryModal 
            onClose={() => setShowLibrary(false)} 
            onFileGenerated={(file, meta) => {
              console.log("File generated with meta:", meta)
              setAttachedFile(file)
              if (meta) {
                 setFormData(prev => ({
                    ...prev,
                    subject: meta.subject || prev.subject,
                    doc_no: meta.doc_no || prev.doc_no,
                    issued_date: meta.issued_date || prev.issued_date,
                    doc_type: 'CongVan', // Mặc định là Công văn khi sinh từ mẫu
                    summary: meta.summary || prev.summary
                 }))
              }
              setShowLibrary(false)
              toast.success('Đã đính kèm văn bản tự động')
            }} 
          />
        )}

        {/* BLOCK 2: THÔNG TIN CHÍNH */}
        <div className="company-card info-section">
          <div className="section-header blue">
            <i className="ti ti-info-circle"></i>
            <h3>Thông tin chính</h3>
          </div>
          
          <div className="section-body grid-2">
            <div className="field col-span-2">
              <label>Tên văn bản <span className="req">*</span></label>
              <input type="text" className="form-control" placeholder="Nhập tên văn bản" value={formData.subject} onChange={e => handleChange('subject', e.target.value)} />
            </div>
            
            <div className="field">
              <label>Số văn bản <span className="req">*</span></label>
              <input type="text" className="form-control" placeholder="Nhập số văn bản" value={formData.doc_no} onChange={e => handleChange('doc_no', e.target.value)} />
            </div>

            <div className="field">
              <label>Mức độ quan trọng, khẩn cấp</label>
              <div className="dis-flex gap-12">
                <button 
                  type="button"
                  className="btn"
                  onClick={() => handleChange('is_important', !formData.is_important)}
                  style={{ 
                    border: `1px solid ${formData.is_important ? '#00aeef' : '#cbd5e1'}`, 
                    color: formData.is_important ? '#00aeef' : '#64748b',
                    backgroundColor: 'transparent',
                    borderRadius: 6,
                    fontWeight: 500,
                    height: 40,
                    padding: '0 16px'
                  }}
                >
                  Quan trọng
                </button>
                <button 
                  type="button"
                  className="btn"
                  onClick={() => handleChange('is_urgent', !formData.is_urgent)}
                  style={{ 
                    border: `1px solid ${formData.is_urgent ? '#00aeef' : '#cbd5e1'}`, 
                    color: formData.is_urgent ? '#00aeef' : '#64748b',
                    backgroundColor: 'transparent',
                    borderRadius: 6,
                    fontWeight: 500,
                    height: 40,
                    padding: '0 16px'
                  }}
                >
                  Khẩn cấp
                </button>
              </div>
            </div>

            <div className="field">
              <label>Ngày ban hành <span className="req">*</span></label>
              <input type="date" className="form-control" value={formData.issued_date} onChange={e => handleChange('issued_date', e.target.value)} />
            </div>

            <div className="field">
              <label>Loại văn bản</label>
              <select className="form-control" value={formData.doc_type} onChange={e => handleChange('doc_type', e.target.value)}>
                <option value="">Chọn loại văn bản</option>
                <option value="QuyetDinh">Quyết định</option>
                <option value="ThongBao">Thông báo</option>
                <option value="CongVan">Công văn</option>
              </select>
            </div>

            <div className="field">
              <label>Người phê duyệt (Trưởng phòng)</label>
              <select className="form-control" value={formData.approver_id} onChange={e => handleChange('approver_id', e.target.value)}>
                <option value="">-- Mặc định --</option>
                {MOCK_USERS.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Thời hạn văn bản yêu cầu</label>
              <input type="date" className="form-control" value={formData.due_date} onChange={e => handleChange('due_date', e.target.value)} />
            </div>

            <div className="field col-span-2">
              <label>Đơn vị soạn thảo</label>
              <select className="form-control" value={formData.drafting_unit} onChange={e => handleChange('drafting_unit', e.target.value)}>
                <option value="">Chọn đơn vị soạn thảo</option>
                <option value="PhongHanhChinh">Phòng Hành chính</option>
              </select>
            </div>

            <div className="field col-span-2">
              <label>Nơi nhận</label>
              <div className="dis-flex gap-8">
                <button className="btn outline dis-flex align-items-center gap-8"><i className="ti ti-plus"></i> Thêm nơi nhận</button>
                <button className="btn outline dis-flex align-items-center gap-8"><i className="ti ti-address-book"></i> Nhập từ danh bạ</button>
              </div>
            </div>
          </div>
        </div>

        {/* BLOCK 3: TÌNH TRẠNG XỬ LÝ */}
        <div className="company-card info-section">
          <div className="section-header purple">
            <i className="ti ti-activity"></i>
            <h3>Tình trạng xử lý</h3>
          </div>
          <div className="section-body grid-2">
            <div className="field col-span-2">
              <label>Tình trạng <span className="req">*</span></label>
              <div className="dis-flex gap-24" style={{ height: 40, alignItems: 'center' }}>
                <label className="dis-flex align-items-center gap-8" style={{ fontWeight: 400 }}>
                  <input type="radio" name="status" value="Chưa xử lý" checked={formData.status === 'Chưa xử lý'} onChange={e => handleChange('status', e.target.value)} /> Chưa xử lý
                </label>
                <label className="dis-flex align-items-center gap-8" style={{ fontWeight: 400 }}>
                  <input type="radio" name="status" value="Đang xử lý" checked={formData.status === 'Đang xử lý'} onChange={e => handleChange('status', e.target.value)} /> Đang xử lý
                </label>
                <label className="dis-flex align-items-center gap-8" style={{ fontWeight: 400 }}>
                  <input type="radio" name="status" value="Đã xử lý" checked={formData.status === 'Đã xử lý'} onChange={e => handleChange('status', e.target.value)} /> Đã xử lý
                </label>
              </div>
            </div>
            
            <div className="field">
              <label>Hạn xử lý</label>
              <input type="date" className="form-control" value={formData.processing_deadline} onChange={e => handleChange('processing_deadline', e.target.value)} />
            </div>
            
            {renderUserStack('related_users', 'Người liên quan')}

            {renderUserStack('processors', 'Người xử lý')}
            
            {renderUserStack('report_receivers', 'Người nhận báo cáo văn bản')}

            <div className="field">
              <label>Kết quả xử lý</label>
              <input type="text" className="form-control" placeholder="Nhập kết quả xử lý" value={formData.processing_result} onChange={e => handleChange('processing_result', e.target.value)} />
            </div>
          </div>
        </div>

        {/* BLOCK 4: THÔNG TIN BỔ SUNG */}
        <div className="company-card info-section">
          <div className="section-header green">
            <i className="ti ti-layers-linked"></i>
            <h3>Thông tin bổ sung</h3>
          </div>
          
          <div className="section-body grid-2">
            <div className="field">
              <label>Hình thức văn bản</label>
              <select className="form-control" value={formData.doc_form} onChange={e => handleChange('doc_form', e.target.value)}>
                <option value="">Chọn hình thức</option>
                <option value="BanGiay">Bản giấy</option>
                <option value="BanDienTu">Bản điện tử</option>
              </select>
            </div>
            
            <div className="field">
              <label>Vào sổ</label>
              <select className="form-control" value={formData.register_book} onChange={e => handleChange('register_book', e.target.value)}>
                <option value="">Chọn vào sổ</option>
                <option value="SoDi2023">Sổ đi 2023</option>
              </select>
            </div>

            <div className="field">
              <label>Mức độ mật</label>
              <select className="form-control" value={formData.security_level} onChange={e => handleChange('security_level', e.target.value)}>
                <option value="">Chọn mức độ mật</option>
                <option value="BinhThuong">Bình thường</option>
                <option value="Mat">Mật</option>
              </select>
            </div>

            <div className="field">
              <label>Người ký</label>
              <input type="text" className="form-control" placeholder="Nhập người ký" value={formData.signer} onChange={e => handleChange('signer', e.target.value)} />
            </div>
            
            <div className="field">
              <label>Ngày đi</label>
              <input type="date" className="form-control" value={formData.sent_date} onChange={e => handleChange('sent_date', e.target.value)} />
            </div>

            <div className="field">
              <label>Vị trí lưu trữ</label>
              <input type="text" className="form-control" placeholder="Nhập vị trí lưu trữ" value={formData.storage_location} onChange={e => handleChange('storage_location', e.target.value)} />
            </div>
            
            <div className="field col-span-2">
              <label>Trích yếu nội dung</label>
              <div style={{ backgroundColor: '#fff', borderRadius: 8 }}>
                <ReactQuill 
                  theme="snow" 
                  value={formData.summary} 
                  onChange={(val) => handleChange('summary', val)} 
                  style={{ height: 200, marginBottom: 40 }}
                  modules={quillModules}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
