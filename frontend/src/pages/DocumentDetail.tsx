import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api as client } from '../api/client'
import { toast } from '../components/toast'
import { useAuth } from '../auth/AuthContext'

export default function DocumentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [doc, setDoc] = useState<any>(null)
  const [approvals, setApprovals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionNote, setActionNote] = useState('')
  const [showNoteModal, setShowNoteModal] = useState<'REJECT' | 'REQUEST_EDIT' | null>(null)
  const [needs2FA, setNeeds2FA] = useState(false)
  const [request2FAStatus, setRequest2FAStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchDoc()
  }, [id])

  const fetchDoc = async () => {
    try {
      // In a real app, we might need a dedicated GET /api/documents/{id} endpoint
      // Assuming it exists and returns doc data + approvals relation
      const res = await client.get(`/api/documents/${id}`)
      setDoc(res.data.data)
      setApprovals(res.data.data.approvals || [])
      setNeeds2FA(false)
    } catch (err: any) {
      console.error(err)
      if (err.response?.status === 403 && err.response?.data?.message === 'ERR_2FA_REQUIRED') {
        setNeeds2FA(true)
      } else {
        toast.error(err.response?.data?.message || 'Không thể tải chi tiết văn bản')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!window.confirm('Xác nhận phê duyệt văn bản này?')) return
    try {
      await client.post(`/api/documents/${id}/approve`)
      toast.success('Phê duyệt thành công')
      fetchDoc()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi phê duyệt')
    }
  }

  const submitNoteAction = async () => {
    try {
      if (showNoteModal === 'REJECT') {
        await client.post(`/api/documents/${id}/reject`, { note: actionNote })
        toast.success('Đã từ chối văn bản')
      } else {
        await client.post(`/api/documents/${id}/request-edit`, { note: actionNote })
        toast.success('Đã gửi yêu cầu chỉnh sửa')
      }
      setShowNoteModal(null)
      setActionNote('')
      fetchDoc()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi xử lý')
    }
  }

  const handleRequest2FA = async () => {
    try {
      await client.post(`/api/documents/${id}/request-access`)
      toast.success('Đã gửi yêu cầu 2FA đến Ban Giám Đốc')
      setRequest2FAStatus('PENDING')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi gửi yêu cầu')
    }
  }

  const toggleHotLock = async () => {
    if (!window.confirm(`Xác nhận ${doc?.is_hot_locked ? 'tắt' : 'bật'} khóa nóng?`)) return
    try {
      const res = await client.post(`/api/documents/${id}/hot-lock`, { is_hot_locked: !doc.is_hot_locked })
      toast.success('Đã cập nhật khóa nóng')
      setDoc({ ...doc, is_hot_locked: res.data.data.is_hot_locked })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật khóa nóng')
    }
  }

  if (loading) return <div className="p-24">Đang tải...</div>
  
  if (needs2FA) return (
    <div className="p-24" style={{ textAlign: 'center', marginTop: 100 }}>
      <i className="ti ti-lock" style={{ fontSize: 64, color: '#ef4444' }}></i>
      <h2 style={{ marginTop: 24, fontSize: 24 }}>Tài liệu Tuyệt Mật</h2>
      <p style={{ color: '#64748b', fontSize: 16, marginBottom: 24 }}>Bạn cần được Ban Giám Đốc phê duyệt (2FA) để xem nội dung.</p>
      {request2FAStatus === 'PENDING' ? (
        <div style={{ color: '#f59e0b', fontWeight: 600 }}>Đang chờ phê duyệt... (F5 lại trang sau khi được duyệt)</div>
      ) : (
        <button className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 16 }} onClick={handleRequest2FA}>Gửi yêu cầu 2FA</button>
      )}
    </div>
  )

  if (!doc) return <div className="p-24">Không tìm thấy văn bản</div>

  // Check if current user is the pending approver
  const pendingApproval = approvals.find(a => a.status === 'PENDING')
  const isCurrentApprover = pendingApproval && pendingApproval.approver_id === user?.subject_id

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column" style={{ padding: 0, background: '#f1f5f9' }}>
      <div className="topbar px-34 py-12 dis-flex align-items-center justify-content-between" 
           style={{ backgroundColor: '#fff', borderRadius: 0, borderBottom: '1px solid #e2e8f0' }}>
        <div className="dis-flex align-items-center gap-12">
          <button className="btn ghost icon-btn" onClick={() => navigate(-1)}>
            <i className="ti ti-arrow-left"></i>
          </button>
          <h2 className="page-title mb-0" style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
            Chi tiết Văn bản: {doc.doc_no}
          </h2>
        </div>
        <div className="dis-flex align-items-center gap-12">
          {/* Nút Khóa Nóng (Demo: hiển thị nếu có quyền, ở đây tạm hiện luôn để test) */}
          <button 
            className={`btn ${doc.is_hot_locked ? 'btn-primary' : 'outline'}`}
            style={{ 
              backgroundColor: doc.is_hot_locked ? '#ef4444' : 'transparent',
              borderColor: '#ef4444',
              color: doc.is_hot_locked ? '#fff' : '#ef4444'
            }}
            onClick={toggleHotLock}
          >
            <i className={`ti ${doc.is_hot_locked ? 'ti-lock' : 'ti-lock-open'}`} style={{ marginRight: 8 }}></i>
            {doc.is_hot_locked ? 'Đang Khóa Nóng' : 'Khóa Nóng'}
          </button>
        </div>
      </div>

      <div className="flex1 scrollable" style={{ padding: 24 }}>
        <div className="grid-12" style={{ gap: 24 }}>
          {/* Main Content */}
          <div className="col-span-8">
            <div className="company-card" style={{ padding: 24, borderRadius: 8, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0, marginBottom: 16 }}>{doc.subject}</h3>
              <div className="grid-2" style={{ gap: 16 }}>
                <div><strong>Số văn bản:</strong> {doc.doc_no}</div>
                <div><strong>Tình trạng:</strong> <span className="badge">{doc.status}</span></div>
                <div><strong>Ngày ban hành:</strong> {doc.issued_date}</div>
                <div><strong>Người tạo:</strong> {doc.created_by}</div>
              </div>
            </div>
          </div>

          {/* Approval Timeline Sidebar */}
          <div className="col-span-4">
            <div className="company-card" style={{ padding: 24, borderRadius: 8, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16 }}>Timeline Phê Duyệt</h3>
              
              {approvals.length === 0 ? (
                <div style={{ color: '#64748b', fontStyle: 'italic' }}>Không có quy trình phê duyệt</div>
              ) : (
                <div style={{ position: 'relative', paddingLeft: 16, borderLeft: '2px solid #e2e8f0', marginLeft: 8 }}>
                  {approvals.map((appr, idx) => (
                    <div key={idx} style={{ marginBottom: 16, position: 'relative' }}>
                      <div style={{ 
                        position: 'absolute', left: -25, top: 4, width: 16, height: 16, 
                        borderRadius: '50%', background: appr.status === 'APPROVED' ? '#10b981' : appr.status === 'REJECTED' ? '#ef4444' : appr.status === 'REQUEST_EDIT' ? '#f59e0b' : '#3b82f6',
                        border: '3px solid #fff', boxShadow: '0 0 0 1px #cbd5e1'
                      }}></div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>
                        Người duyệt ID: {appr.approver_id}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                        Trạng thái: <span style={{ fontWeight: 500 }}>{appr.status}</span>
                      </div>
                      {appr.note && (
                        <div style={{ fontSize: 13, color: '#475569', marginTop: 4, background: '#f8fafc', padding: 8, borderRadius: 4 }}>
                          "{appr.note}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons for Approver */}
              {isCurrentApprover && (
                <div style={{ marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>Hành động phê duyệt:</div>
                  <div className="dis-flex flex-column gap-8" style={{ flexDirection: 'column' }}>
                    <button className="btn btn-primary" style={{ width: '100%', background: '#10b981', borderColor: '#10b981' }} onClick={handleApprove}>
                      Phê duyệt
                    </button>
                    <button className="btn outline" style={{ width: '100%', borderColor: '#f59e0b', color: '#f59e0b' }} onClick={() => setShowNoteModal('REQUEST_EDIT')}>
                      Yêu cầu chỉnh sửa
                    </button>
                    <button className="btn outline" style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => setShowNoteModal('REJECT')}>
                      Từ chối
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 400, maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0 }}>
              {showNoteModal === 'REJECT' ? 'Từ chối văn bản' : 'Yêu cầu chỉnh sửa'}
            </h3>
            <textarea 
              className="form-control" 
              placeholder="Nhập ghi chú / lý do..." 
              style={{ width: '100%', height: 100, marginTop: 12, marginBottom: 16 }}
              value={actionNote}
              onChange={e => setActionNote(e.target.value)}
            />
            <div className="dis-flex gap-8 justify-content-end">
              <button className="btn ghost" onClick={() => setShowNoteModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={submitNoteAction}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
