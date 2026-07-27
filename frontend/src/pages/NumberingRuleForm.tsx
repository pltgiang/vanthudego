import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api as client } from '../api/client'
import { toast } from '../components/toast'
import Select from 'react-select'

export default function NumberingRuleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [docTypes, setDocTypes] = useState<any[]>([])
  const [books, setBooks] = useState<any[]>([])
  
  const [form, setForm] = useState({
    direction: 1,
    template: "",
    start_number: 1,
    reset_cycle: "YEAR",
    is_editable: false,
    is_all_doc_types: true,
    doc_type_ids: [] as number[],
    is_all_books: true,
    is_no_book: false,
    book_ids: [] as number[]
  })
  
  const templateInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchOptions()
    if (id) {
      fetchRule()
    }
  }, [id])

  const fetchOptions = async () => {
    try {
      const [dtRes, bkRes] = await Promise.all([
        client.get('/api/doc-types?limit=1000'),
        client.get('/api/register_books?limit=1000')
      ])
      if (dtRes.data.success) {
        setDocTypes(dtRes.data.data.items)
      }
      if (bkRes.data.success) {
        setBooks(bkRes.data.data.items)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchRule = async () => {
    try {
      const res = await client.get(`/api/numbering_rules/${id}`)
      if (res.data.success) {
        setForm(res.data.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  const handleInsertTag = (tag: str) => {
    if (!templateInputRef.current) return;
    const input = templateInputRef.current;
    const startPos = input.selectionStart || 0;
    const endPos = input.selectionEnd || 0;
    const textBefore = form.template.substring(0, startPos);
    const textAfter = form.template.substring(endPos, form.template.length);
    
    const newTemplate = textBefore + tag + textAfter;
    setForm(prev => ({ ...prev, template: newTemplate }));
    
    // Set focus back and adjust cursor position after state updates
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(startPos + tag.length, startPos + tag.length);
    }, 0);
  }

  const handleSave = async () => {
    if (!form.template) {
      toast.error('Vui lòng nhập quy tắc đánh số')
      return
    }
    
    setLoading(true)
    try {
      if (id) {
        const res = await client.patch(`/api/numbering_rules/${id}`, form)
        if (res.data.success) {
          toast.success('Cập nhật thành công')
          navigate('/numbering-rules')
        }
      } else {
        const res = await client.post('/api/numbering_rules', form)
        if (res.data.success) {
          toast.success('Thêm mới thành công')
          navigate('/numbering-rules')
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  const docTypeOptions = docTypes.map(d => ({ value: d.id, label: d.name }))
  const bookOptions = books.filter(b => b.direction === form.direction).map(b => ({ value: b.id, label: b.name }))

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column" style={{ padding: 0, background: '#f1f5f9' }}>
      
      {/* TOPBAR */}
      <div className="topbar px-34 py-12 dis-flex align-items-center justify-content-between" 
           style={{ backgroundColor: '#fff', borderRadius: 0, borderBottom: '1px solid #e2e8f0' }}>
        <div className="page-title mb-0 flex1 dis-flex align-items-center gap-12">
          <button className="btn ghost icon-btn" onClick={() => navigate(-1)}>
            <i className="ti ti-arrow-left"></i>
          </button>
          <span>{id ? 'Cập nhật quy tắc đánh số' : 'Thêm mới quy tắc đánh số'}</span>
        </div>
        <div className="actions dis-flex align-items-center gap-12">
          <button className="btn ghost" onClick={() => navigate(-1)} style={{ borderRadius: 6 }}>Hủy bỏ</button>
          <button className="btn btn-primary dis-flex align-items-center gap-8" onClick={handleSave} disabled={loading}
                  style={{ borderRadius: 6, background: '#00aeef', borderColor: '#00aeef' }}>
            <i className="ti ti-device-floppy"></i> Lưu lại
          </button>
        </div>
      </div>

      <div className="content scrollable company-blocks-layout flex1">
          
          {/* BLOCK 1: FORM */}
          <div className="company-card info-section mb-24">
            <div className="section-header blue">
              <i className="ti ti-settings"></i>
              <h3>Thiết lập quy tắc</h3>
            </div>
            
            <div className="section-body grid-2">
              <div className="field col-span-2">
                <label>Chiều văn bản <span className="req">*</span></label>
                <div className="dis-flex gap-16">
                  <label className="dis-flex align-items-center gap-8" style={{cursor: 'pointer'}}>
                    <input type="radio" name="direction" checked={form.direction === 1} onChange={() => setForm(p => ({...p, direction: 1}))} />
                    Văn bản đến
                  </label>
                  <label className="dis-flex align-items-center gap-8" style={{cursor: 'pointer'}}>
                    <input type="radio" name="direction" checked={form.direction === 2} onChange={() => setForm(p => ({...p, direction: 2}))} />
                    Văn bản đi
                  </label>
                  <label className="dis-flex align-items-center gap-8" style={{cursor: 'pointer'}}>
                    <input type="radio" name="direction" checked={form.direction === 3} onChange={() => setForm(p => ({...p, direction: 3}))} />
                    Văn bản nội bộ
                  </label>
                </div>
              </div>
            
              <div className="field col-span-2">
                <label>Quy tắc đánh số <span className="req">*</span></label>
                <div className="dis-flex gap-8 flex-wrap mb-8">
                  <button type="button" className="btn outline" style={{padding: '4px 8px', fontSize: 12}} onClick={() => handleInsertTag('{STT}')}>Số thứ tự</button>
                  <button type="button" className="btn outline" style={{padding: '4px 8px', fontSize: 12}} onClick={() => handleInsertTag('{Ngay}')}>Ngày phát hành</button>
                  <button type="button" className="btn outline" style={{padding: '4px 8px', fontSize: 12}} onClick={() => handleInsertTag('{Thang}')}>Tháng phát hành</button>
                  <button type="button" className="btn outline" style={{padding: '4px 8px', fontSize: 12}} onClick={() => handleInsertTag('{Nam}')}>Năm phát hành</button>
                  <button type="button" className="btn outline" style={{padding: '4px 8px', fontSize: 12}} onClick={() => handleInsertTag('{LoaiVB}')}>Tên viết tắt loại văn bản</button>
                </div>
                <input ref={templateInputRef} type="text" className="form-control" name="template" value={form.template} onChange={handleChange} placeholder="VD: {STT}/{Nam}/{LoaiVB}" />
              </div>
              
              <div className="field">
                <label>Bắt đầu từ số <span className="req">*</span></label>
                <input type="number" className="form-control" name="start_number" value={form.start_number} onChange={handleChange} min={1} />
              </div>
              
              <div className="field">
                <label>Cho phép chỉnh sửa số</label>
                <div className="dis-flex gap-12 mt-4">
                  <button type="button" className="btn" 
                     onClick={() => setForm(p => ({...p, is_editable: !p.is_editable}))}
                     style={{
                       border: form.is_editable ? '1px solid #00aeef' : '1px solid #cbd5e1', 
                       color: form.is_editable ? '#00aeef' : '#64748b', 
                       backgroundColor: form.is_editable ? '#f0f9ff' : 'transparent', 
                       borderRadius: 6, fontWeight: 500, height: 40, padding: '0 16px'
                     }}>
                     Cho phép văn thư sửa số
                  </button>
                </div>
              </div>
              
              <div className="field col-span-2">
                <label>Đánh số</label>
                <div className="dis-flex gap-12 mt-4">
                  <button type="button" className="btn" 
                     onClick={() => setForm(p => ({...p, reset_cycle: "YEAR"}))}
                     style={{
                       border: form.reset_cycle === "YEAR" ? '1px solid #00aeef' : '1px solid #cbd5e1', 
                       color: form.reset_cycle === "YEAR" ? '#00aeef' : '#64748b', 
                       backgroundColor: form.reset_cycle === "YEAR" ? '#f0f9ff' : 'transparent', 
                       borderRadius: 6, fontWeight: 500, height: 40, padding: '0 16px'
                     }}>
                     Theo từng năm
                  </button>
                  <button type="button" className="btn" 
                     onClick={() => setForm(p => ({...p, reset_cycle: "CONTINUOUS"}))}
                     style={{
                       border: form.reset_cycle === "CONTINUOUS" ? '1px solid #00aeef' : '1px solid #cbd5e1', 
                       color: form.reset_cycle === "CONTINUOUS" ? '#00aeef' : '#64748b', 
                       backgroundColor: form.reset_cycle === "CONTINUOUS" ? '#f0f9ff' : 'transparent', 
                       borderRadius: 6, fontWeight: 500, height: 40, padding: '0 16px'
                     }}>
                     Liên tiếp các năm
                  </button>
                </div>
              </div>
              
              <div className="field col-span-2 mt-16 pt-16 border-top">
                <h4 style={{fontSize: 16, fontWeight: 600, color: '#334155', marginBottom: 16}}>Áp dụng quy tắc đánh số này cho</h4>
                
                <label style={{fontWeight: 600}}>Loại văn bản <span className="req">*</span></label>
                <div className="dis-flex gap-24 mt-4 mb-12">
                  <label className="dis-flex align-items-center gap-8" style={{cursor: 'pointer'}}>
                    <input type="radio" checked={form.is_all_doc_types} onChange={() => setForm(p => ({...p, is_all_doc_types: true}))} />
                    Tất cả loại văn bản
                  </label>
                  <label className="dis-flex align-items-center gap-8" style={{cursor: 'pointer'}}>
                    <input type="radio" checked={!form.is_all_doc_types} onChange={() => setForm(p => ({...p, is_all_doc_types: false}))} />
                    Chọn loại văn bản
                  </label>
                </div>
                {!form.is_all_doc_types && (
                  <Select 
                    isMulti 
                    options={docTypeOptions}
                    value={docTypeOptions.filter(o => form.doc_type_ids.includes(o.value))}
                    onChange={(vals: any) => setForm(p => ({...p, doc_type_ids: vals.map((v: any) => v.value)}))}
                    placeholder="Chọn các loại văn bản áp dụng..."
                  />
                )}
                
                <label style={{fontWeight: 600, marginTop: 24}}>Sổ văn bản <span className="req">*</span></label>
                <div className="dis-flex gap-24 mt-4 mb-12 flex-wrap">
                  <label className="dis-flex align-items-center gap-8" style={{cursor: 'pointer'}}>
                    <input type="radio" checked={form.is_all_books} onChange={() => setForm(p => ({...p, is_all_books: true, is_no_book: false}))} />
                    Tất cả sổ văn bản
                  </label>
                  <label className="dis-flex align-items-center gap-8" style={{cursor: 'pointer'}}>
                    <input type="radio" checked={!form.is_all_books && !form.is_no_book} onChange={() => setForm(p => ({...p, is_all_books: false, is_no_book: false}))} />
                    Chọn sổ văn bản
                  </label>
                  <label className="dis-flex align-items-center gap-8" style={{cursor: 'pointer'}}>
                    <input type="radio" checked={form.is_no_book} onChange={() => setForm(p => ({...p, is_all_books: false, is_no_book: true}))} />
                    Văn bản không có sổ
                  </label>
                </div>
                {!form.is_all_books && !form.is_no_book && (
                  <Select 
                    isMulti 
                    options={bookOptions}
                    value={bookOptions.filter(o => form.book_ids.includes(o.value))}
                    onChange={(vals: any) => setForm(p => ({...p, book_ids: vals.map((v: any) => v.value)}))}
                    placeholder="Chọn các sổ văn bản áp dụng..."
                  />
                )}
                
              </div>
            </div>
          </div>
          
          {/* BLOCK 2: HDSD */}
          <div className="company-card info-section" style={{background: '#f8fafc'}}>
             <div className="section-header green">
              <i className="ti ti-book"></i>
              <h3>HDSD Thiết lập bộ đánh số tự động</h3>
            </div>
            <div className="section-body p-24" style={{fontSize: 14, lineHeight: 1.6, color: '#334155'}}>
              <h4 style={{fontSize: 16, fontWeight: 600, color: '#0f172a'}}>1. Tổng quan</h4>
              <p>Bài viết hướng dẫn tính năng thiết lập quy tắc tự động đánh số văn bản trên hệ thống, giúp đảm bảo tính nhất quán trong quản lý số văn bản, hạn chế sai sót và hỗ trợ tra cứu, lưu trữ dễ dàng hơn.</p>
              
              <h4 style={{fontSize: 16, fontWeight: 600, color: '#0f172a', marginTop: 24}}>2. Hướng dẫn thực hiện</h4>
              
              <p><b>Bước 1:</b> Tại form thiết lập, chọn các thẻ tag (Ví dụ: Số thứ tự, Ngày phát hành...) để thêm vào quy tắc đánh số.</p>
              
              <p><b>Bước 2:</b> Thiết lập số bắt đầu và chu kỳ.</p>
              <ul style={{paddingLeft: 20, marginBottom: 16}}>
                <li style={{marginBottom: 8}}><b>Bắt đầu từ số:</b> là số bắt đầu đánh cho văn bản khi áp dụng bộ đánh số này. Ví dụ: trước khi áp dụng bộ đánh số này, đơn vị đã có 4 văn bản thì thiết lập cho bộ đánh số này bắt đầu từ số 5.</li>
                <li style={{marginBottom: 8}}><b>Theo các năm:</b> bắt đầu đếm lại từ đầu khi sang năm mới.</li>
                <li style={{marginBottom: 8}}><b>Liên tiếp các năm:</b> tiếp nối số đếm từ năm trước.</li>
                <li><b>Cho phép chỉnh sửa số văn bản:</b> nếu tích chọn, nhân viên văn thư có thể chỉnh sửa số sinh tự động khi thêm mới văn bản.</li>
              </ul>
              
              <p><b>Bước 3:</b> Áp dụng quy tắc đánh số này cho:</p>
              <ul style={{paddingLeft: 20, marginBottom: 16}}>
                <li style={{marginBottom: 8}}><b>Loại văn bản:</b> Tích chọn <i>Tất cả các loại văn bản</i>, hoặc chọn các loại cụ thể trong danh sách.</li>
                <li style={{marginBottom: 8}}><b>Sổ văn bản:</b> Tích chọn <i>Tất cả sổ</i>, hoặc chọn một/nhiều sổ văn bản nhất định.</li>
                <li><b>Văn bản không có sổ:</b> Nếu quy tắc chỉ áp dụng cho văn bản nội bộ không cần vào sổ, chọn tùy chọn này.</li>
              </ul>
              
              <div className="p-16 mt-24" style={{background: '#fff', borderRadius: 8, borderLeft: '4px solid #00aeef'}}>
                <i>Khi thêm văn bản mới, chương trình sẽ tự động nhận diện loại văn bản, sổ văn bản và sinh số theo quy tắc phù hợp nhất.</i>
              </div>
            </div>
          </div>
          
      </div>
    </div>
  )
}
