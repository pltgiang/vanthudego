import React, { useState, useEffect, useRef } from 'react'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { renderAsync } from 'docx-preview'
import { useAuth } from '../auth/AuthContext'

export function TemplateFormModal({ template, onClose, onFileGenerated }: { template: any, onClose: () => void, onFileGenerated: (file: File, meta: any) => void }) {
  const { user } = useAuth()
  
  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    fullname: user?.full_name || '',
    phone: user?.phone || '',
    department: user?.department_name || '',
    position: user?.position || '',
    a_name: user?.full_name || '',
    a_position: user?.position || '',
    a_phone: user?.phone || ''
  })

  // Đảm bảo đồng bộ thông tin user nếu state bị trễ hoặc user được tải bất đồng bộ
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullname: prev.fullname || user.full_name || '',
        phone: prev.phone || user.phone || '',
        department: prev.department || user.department_name || '',
        position: prev.position || user.position || '',
        a_name: prev.a_name || user.full_name || '',
        a_position: prev.a_position || user.position || '',
        a_phone: prev.a_phone || user.phone || ''
      }))
    }
  }, [user])
  
  const [loading, setLoading] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      generatePreview()
    }, 500)
    
    return () => clearTimeout(handler)
  }, [formData, template])
  
  const prepareRenderData = () => {
      if (template.id === 'leave_request') {
         return {
           fullname: formData.fullname || '.........................',
           phone: formData.phone || '................',
           position: formData.position || '................',
           department: formData.department || '.........................',
           leave_date: formData.leave_date || '.........................',
           reason: formData.reason || '...........................................................................',
           backup_person: formData.backup_person || '......................................................',
           c_kl: formData.leave_type === 'Không lương' ? '☒' : '☐',
           c_pn: formData.leave_type === 'Phép năm' ? '☒' : '☐',
           c_no: formData.leave_type === 'Nghỉ ốm' ? '☒' : '☐',
           c_cd: formData.leave_type === 'Nghỉ chế độ' ? '☒' : '☐',
           day: formData.date ? formData.date.split('-')[2] : '...',
           month: formData.date ? formData.date.split('-')[1] : '...',
           year: formData.date ? formData.date.split('-')[0] : '...',
           hcns_name: '',
           manager_name: '',
         }
      } else if (template.id === 'handover') {
         return {
           doc_no: formData.doc_no || '...',
           day: formData.date ? formData.date.split('-')[2] : '...',
           month: formData.date ? formData.date.split('-')[1] : '...',
           year: formData.date ? formData.date.split('-')[0] : '...',
           a_name: formData.a_name || '.........................',
           a_position: formData.a_position || '................',
           a_phone: formData.a_phone || '................',
           b_name: formData.b_name || '.........................',
           b_position: formData.b_position || '................',
           b_phone: formData.b_phone || '................',
         }
      }
      return {}
  }

  const generatePreview = async () => {
    try {
      const response = await fetch(template.file)
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      
      const zip = new PizZip(arrayBuffer)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      })
      
      doc.render(prepareRenderData())
      
      const out = doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
      
      if (previewRef.current) {
        // Clear previous
        previewRef.current.innerHTML = ''
        await renderAsync(out, previewRef.current, undefined, {
           className: 'docx-preview-content',
           inWrapper: true,
           ignoreWidth: false,
           ignoreHeight: false
        })
      }
    } catch (err) {
      console.error("Preview generation failed", err)
    }
  }

  const generateDocument = async () => {
    try {
      setLoading(true)
      const response = await fetch(template.file)
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      
      const zip = new PizZip(arrayBuffer)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      })
      
      doc.render(prepareRenderData())
      
      const out = doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
      
      const file = new File([out], `${template.name}_${new Date().getTime()}.docx`, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      
      const meta = {
        subject: template.id === 'leave_request' ? `Đơn xin nghỉ phép - ${formData.fullname}` : `Biên bản bàn giao ${formData.doc_no || ''}`.trim(),
        doc_no: formData.doc_no || '',
        issued_date: formData.date || '',
        summary: template.id === 'leave_request' ? `<p>Nghỉ phép vào ngày ${formData.leave_date || ''}. Lý do: ${formData.reason || ''}</p>` : `<p>Bàn giao công việc giữa ${formData.a_name || ''} và ${formData.b_name || ''}</p>`
      }
      
      onFileGenerated(file, meta)
    } catch (err) {
      console.error(err)
      alert("Lỗi khi tạo file Word. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ width: '90vw', height: '90vh', background: '#fff', borderRadius: 12, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        {/* Header */}
        <div className="dis-flex justify-content-between align-items-center" style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', flexShrink: 0, background: '#f8fafc' }}>
          <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>Biên soạn: {template.name}</h3>
          <div className="dis-flex align-items-center gap-16">
            <button className="btn btn-primary dis-flex align-items-center gap-8" onClick={generateDocument} disabled={loading}>
              <i className="ti ti-check"></i> {loading ? 'Đang tạo...' : 'Tạo & Đính kèm'}
            </button>
            <i className="ti ti-x cursor-pointer" style={{ fontSize: 24, color: '#64748b' }} onClick={onClose}></i>
          </div>
        </div>
        
        {/* Body Split View */}
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', flex: 1, minHeight: 0 }}>
           
           {/* Left Pane - Form */}
           <div className="form-pane scrollable" style={{ padding: 24, borderRight: '1px solid #e2e8f0', overflowY: 'auto', background: '#ffffff' }}>
              <div style={{ marginBottom: 20, color: '#64748b', fontSize: 13 }}>
                <i className="ti ti-info-circle"></i> Điền thông tin vào form dưới đây, bản xem trước sẽ được tự động cập nhật bên tay phải.
              </div>
              
              {template.id === 'leave_request' && (
                <div className="grid-2 gap-16">
                  <div className="field col-span-2">
                    <label>Họ và tên</label>
                    <input type="text" className="form-control" value={formData.fullname || ''} onChange={e => setFormData({...formData, fullname: e.target.value})} />
                  </div>
                  <div className="field col-span-2">
                    <label>Số điện thoại</label>
                    <input type="text" className="form-control" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="field col-span-2">
                    <label>Chức vụ</label>
                    <input type="text" className="form-control" value={formData.position || ''} onChange={e => setFormData({...formData, position: e.target.value})} />
                  </div>
                  <div className="field col-span-2">
                    <label>Phòng ban</label>
                    <input type="text" className="form-control" value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} />
                  </div>
                  <div className="field col-span-2">
                    <label>Nghỉ phép vào ngày</label>
                    <input type="text" className="form-control" placeholder="VD: Sáng ngày 03/08/2026" value={formData.leave_date || ''} onChange={e => setFormData({...formData, leave_date: e.target.value})} />
                  </div>
                  <div className="field col-span-2">
                    <label>Lý do nghỉ</label>
                    <textarea className="form-control" style={{ height: 80, padding: 12 }} value={formData.reason || ''} onChange={e => setFormData({...formData, reason: e.target.value})} />
                  </div>
                  <div className="field col-span-2">
                    <label>Diện nghỉ</label>
                    <select className="form-control" value={formData.leave_type || ''} onChange={e => setFormData({...formData, leave_type: e.target.value})}>
                      <option value="">-- Chọn diện nghỉ --</option>
                      <option value="Không lương">Không lương</option>
                      <option value="Phép năm">Phép năm</option>
                      <option value="Nghỉ ốm">Nghỉ ốm</option>
                      <option value="Nghỉ chế độ">Nghỉ chế độ</option>
                    </select>
                  </div>
                  <div className="field col-span-2">
                    <label>Người thay thế</label>
                    <input type="text" className="form-control" value={formData.backup_person || ''} onChange={e => setFormData({...formData, backup_person: e.target.value})} />
                  </div>
                  <div className="field col-span-2">
                    <label>Ngày làm đơn</label>
                    <input type="date" className="form-control" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                </div>
              )}
              
              {template.id === 'handover' && (
                <div className="grid-2 gap-16">
                  <div className="field col-span-2">
                    <label>Số văn bản</label>
                    <input type="text" className="form-control" value={formData.doc_no || ''} onChange={e => setFormData({...formData, doc_no: e.target.value})} />
                  </div>
                  <div className="field col-span-2">
                    <label>Ngày làm biên bản</label>
                    <input type="date" className="form-control" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  
                  <div className="col-span-2" style={{ fontWeight: 'bold', marginTop: 16, color: '#00aeef', borderBottom: '1px solid #e9edf7', paddingBottom: 8 }}>BÊN BÀN GIAO (BÊN A)</div>
                  <div className="field col-span-2">
                    <label>Người đại diện</label>
                    <input type="text" className="form-control" value={formData.a_name || ''} onChange={e => setFormData({...formData, a_name: e.target.value})} />
                  </div>
                  <div className="field col-span-2">
                    <label>Chức vụ</label>
                    <input type="text" className="form-control" value={formData.a_position || ''} onChange={e => setFormData({...formData, a_position: e.target.value})} />
                  </div>
                  <div className="field col-span-2">
                    <label>Số điện thoại</label>
                    <input type="text" className="form-control" value={formData.a_phone || ''} onChange={e => setFormData({...formData, a_phone: e.target.value})} />
                  </div>

                  <div className="col-span-2" style={{ fontWeight: 'bold', marginTop: 16, color: '#00aeef', borderBottom: '1px solid #e9edf7', paddingBottom: 8 }}>BÊN NHẬN BÀN GIAO (BÊN B)</div>
                  <div className="field col-span-2">
                    <label>Người đại diện</label>
                    <input type="text" className="form-control" value={formData.b_name || ''} onChange={e => setFormData({...formData, b_name: e.target.value})} />
                  </div>
                  <div className="field col-span-2">
                    <label>Chức vụ</label>
                    <input type="text" className="form-control" value={formData.b_position || ''} onChange={e => setFormData({...formData, b_position: e.target.value})} />
                  </div>
                  <div className="field col-span-2">
                    <label>Số điện thoại</label>
                    <input type="text" className="form-control" value={formData.b_phone || ''} onChange={e => setFormData({...formData, b_phone: e.target.value})} />
                  </div>
                </div>
              )}
           </div>

           {/* Right Pane - Preview */}
           <div className="preview-pane scrollable" style={{ background: '#f1f5f9', padding: 32, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
               <div ref={previewRef} style={{ background: '#fff', width: '100%', maxWidth: 850, minHeight: 1100, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', padding: 0, borderRadius: 2 }}>
                   {/* Preview will be rendered here by docx-preview */}
                   <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', marginTop: 100 }}>
                      <i className="ti ti-loader-2" style={{ fontSize: 32 }}></i>
                      <p>Đang tải bản xem trước...</p>
                   </div>
               </div>
           </div>

        </div>
      </div>
    </div>
  )
}
