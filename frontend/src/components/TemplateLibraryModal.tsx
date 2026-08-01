import React, { useState } from 'react'
import { TemplateFormModal } from './TemplateFormModal'

const TEMPLATES = [
  { id: 'leave_request', name: 'Đơn xin nghỉ phép', file: '/templates/Don_Xin_Nghi_Phep.docx', icon: 'ti-file-text' },
  { id: 'handover', name: 'Biên bản bàn giao', file: '/templates/Bien_Ban_Ban_Giao.docx', icon: 'ti-file-description' }
]

export function TemplateLibraryModal({ onClose, onFileGenerated }: { onClose: () => void, onFileGenerated: (file: File, meta?: any) => void }) {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  if (selectedTemplate) {
    return <TemplateFormModal 
             template={selectedTemplate} 
             onClose={() => setSelectedTemplate(null)} 
             onFileGenerated={(file) => { onFileGenerated(file); onClose(); }} 
           />
  }

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ width: 600, padding: 24, borderRadius: 8, background: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <div className="dis-flex justify-content-between align-items-center mb-16">
          <h3 style={{ margin: 0, color: '#0f172a' }}>Thư viện văn bản mẫu</h3>
          <i className="ti ti-x cursor-pointer" style={{ fontSize: 20, color: '#64748b' }} onClick={onClose}></i>
        </div>
        
        <div className="template-list dis-flex gap-12" style={{ flexDirection: 'column' }}>
          {TEMPLATES.map(tpl => (
            <div key={tpl.id} className="template-item dis-flex align-items-center justify-content-between" style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: 8, width: '100%' }}>
              <div className="dis-flex align-items-center gap-12">
                <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ti ${tpl.icon}`} style={{ fontSize: 24, color: '#0ea5e9' }}></i>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16, color: '#1e293b' }}>{tpl.name}</h4>
                  <span style={{ fontSize: 13, color: '#64748b' }}>.docx</span>
                </div>
              </div>
              <div className="dis-flex gap-8" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                <a href={tpl.file} download className="btn outline btn-sm dis-flex align-items-center gap-4" style={{ height: 36, padding: '0 16px', whiteSpace: 'nowrap' }}>
                  <i className="ti ti-download"></i> Tải mẫu trống
                </a>
                <button className="btn btn-primary btn-sm dis-flex align-items-center gap-4" style={{ height: 36, padding: '0 16px', whiteSpace: 'nowrap' }} onClick={() => setSelectedTemplate(tpl)}>
                  <i className="ti ti-pencil"></i> Sử dụng mẫu
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
