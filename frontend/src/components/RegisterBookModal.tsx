import { useState, useEffect } from 'react'
import { toast } from './toast'
import { api as client } from '../api/client'
import SearchSelect from './SearchSelect'
import MultiSelect from './MultiSelect'

type RegisterBookModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  bookId?: number | null
  direction: number // 1: Đến, 2: Đi
}

export default function RegisterBookModal({ isOpen, onClose, onSuccess, bookId, direction }: RegisterBookModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    name: '',
    org_unit_id: '',
    manager_ids: [],
    viewer_ids: [],
    status: 1
  })
  const [orgUnits, setOrgUnits] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchOptions()
      if (bookId) {
        fetchBookDetails(bookId)
      } else {
        setForm({
          name: '',
          org_unit_id: '',
          manager_ids: [],
          viewer_ids: [],
          status: 1
        })
      }
    }
  }, [isOpen, bookId])

  const fetchOptions = async () => {
    try {
      const [orgRes, userRes] = await Promise.all([
        client.get('/api/org-units?limit=1000'),
        client.get('/api/employees?limit=1000')
      ])
      if (orgRes.data.success) {
        setOrgUnits(orgRes.data.data.items.map((o: any) => ({ value: o.id, label: o.name })))
      }
      if (userRes.data.success) {
        setUsers(userRes.data.data.items.map((u: any) => ({ value: u.id, label: u.full_name })))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchBookDetails = async (id: number) => {
    try {
      setLoading(true)
      const res = await client.get(`/api/register_books/${id}`)
      if (res.data.success) {
        setForm(res.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.name || !form.org_unit_id || form.manager_ids.length === 0) {
      toast.error('Vui lòng nhập đầy đủ Tên sổ, Đơn vị và Người quản lý')
      return
    }

    try {
      setLoading(true)
      const payload = { ...form, direction }
      if (bookId) {
        await client.patch(`/api/register_books/${bookId}`, payload)
        toast.success('Cập nhật sổ văn bản thành công')
      } else {
        await client.post('/api/register_books', payload)
        toast.success('Thêm sổ văn bản thành công')
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay dis-flex" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ backgroundColor: '#fff', borderRadius: 8, width: 600, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        {/* Header */}
        <div className="modal-header dis-flex gap-8" style={{ padding: '16px 24px', borderBottom: '1px solid #e0e0e0', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#333' }}>
            {bookId ? 'Sửa sổ văn bản' : `Thêm sổ văn bản ${direction === 1 ? 'đến' : 'đi'}`}
          </h3>
          <button className="btn-icon" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>&times;</button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '24px', overflowY: 'visible' }}>
          
          <div className="field mb-16">
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#333' }}>Tên sổ <span style={{ color: 'red' }}>*</span></label>
            <input 
              type="text" 
              className="input-base" 
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4 }}
              placeholder="Nhập tên sổ"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="field mb-16">
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#333' }}>Người quản lý <span style={{ color: 'red' }}>*</span></label>
            <MultiSelect
              options={users}
              value={form.manager_ids}
              onChange={(val) => setForm({ ...form, manager_ids: val })}
              placeholder="Chọn người quản lý"
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Người quản lý có quyền Xem, Chỉnh sửa, Đóng sổ, Xoá sổ.</div>
          </div>

          <div className="field mb-16">
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#333' }}>Đơn vị quản lý <span style={{ color: 'red' }}>*</span></label>
            <SearchSelect
              options={orgUnits}
              value={form.org_unit_id}
              onChange={(val) => setForm({ ...form, org_unit_id: val })}
              placeholder="Chọn đơn vị"
            />
          </div>

          <div className="field mb-16">
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#333' }}>Người xem sổ</label>
            <MultiSelect
              options={users}
              value={form.viewer_ids}
              onChange={(val) => setForm({ ...form, viewer_ids: val })}
              placeholder="Chọn người xem sổ"
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Người xem có quyền Xem sổ.</div>
          </div>

          <div className="field mb-16 dis-flex" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 500, color: '#333' }}>Trạng thái</label>
              <div style={{ fontSize: 12, color: '#666' }}>Trạng thái hoạt động của sổ.</div>
            </div>
            <div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={form.status === 1}
                  onChange={(e) => setForm({ ...form, status: e.target.checked ? 1 : 0 })}
                />
                <span className="slider round"></span>
              </label>
              <span style={{ marginLeft: 8, fontSize: 14, color: form.status === 1 ? '#00aeef' : '#999' }}>
                {form.status === 1 ? 'Đang hoạt động' : 'Ngừng hoạt động'}
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer dis-flex" style={{ padding: '16px 24px', borderTop: '1px solid #e0e0e0', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn btn-outline" onClick={onClose} disabled={loading} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>
            Hủy bỏ
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ padding: '8px 16px', background: '#00aeef', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {loading ? 'Đang lưu...' : 'Lưu lại'}
          </button>
        </div>

      </div>
    </div>
  )
}
