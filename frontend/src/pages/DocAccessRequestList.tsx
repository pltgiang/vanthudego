import React, { useEffect, useState } from 'react'
import { api as client } from '../api/client'
import { toast } from '../components/toast'
import { Link } from 'react-router-dom'

export default function DocAccessRequestList() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await client.get('/api/documents/requests/pending') // I need to implement this backend API!
      setRequests(res.data.data.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await client.post(`/api/documents/requests/${id}/approve`)
      toast.success('Đã duyệt yêu cầu truy cập')
      fetchRequests()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi duyệt')
    }
  }

  if (loading) return <div className="p-24">Đang tải...</div>

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column" style={{ padding: 24, background: '#f1f5f9' }}>
      <h2 style={{ marginBottom: 24 }}>Quản lý Yêu cầu Truy cập (2FA)</h2>
      
      <div className="company-card" style={{ background: '#fff', borderRadius: 8, padding: 0, overflow: 'hidden' }}>
        <table className="table table-hover mb-0">
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th>ID Yêu cầu</th>
              <th>Văn bản ID</th>
              <th>Người yêu cầu</th>
              <th>Thời gian xin</th>
              <th>Trạng thái</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-24 text-muted">Không có yêu cầu nào đang chờ</td>
              </tr>
            ) : (
              requests.map(req => (
                <tr key={req.id}>
                  <td>#{req.id}</td>
                  <td>
                    <Link to={`/documents/${req.document_id}`} style={{ fontWeight: 600, color: '#2563eb' }}>
                      Doc #{req.document_id}
                    </Link>
                  </td>
                  <td>User ID: {req.requester_id}</td>
                  <td>{req.created_at}</td>
                  <td><span className="badge warning">{req.status}</span></td>
                  <td className="text-right">
                    <button className="btn btn-primary" onClick={() => handleApprove(req.id)}>
                      Duyệt (30 phút)
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
