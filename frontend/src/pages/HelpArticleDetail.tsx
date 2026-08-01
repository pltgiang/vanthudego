import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useNavigate, useOutletContext, Link } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { toast } from '../components/toast'
import { api } from '../api/client'

// Helper to find breadcrumb path recursively
function findPath(tree: any[], targetId: number, currentPath: any[] = []): any[] | null {
  for (const node of tree) {
    const path = [...currentPath, { id: node.id, title: node.title }]
    if (node.id === targetId) return path
    if (node.children && node.children.length > 0) {
      const found = findPath(node.children, targetId, path)
      if (found) return found
    }
  }
  return null
}

export default function HelpArticleDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { loadTree, canEdit, tree } = useOutletContext<{ loadTree: () => void, canEdit: boolean, tree: any[] }>()

  const [article, setArticle] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [toc, setToc] = useState<{ id: string, text: string, level: number }[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/api/audit-logs?entity=help_article&entity_id=${id}`)
      setAuditLogs(res.data.data)
    } catch (e) {
      console.error("Không thể tải lịch sử chỉnh sửa", e)
    }
  }

  const quillRef = useRef<ReactQuill>(null)

  useEffect(() => {
    if (!isEditing && article?.content) {
      setTimeout(() => {
        const contentEl = document.querySelector('.help-content-view')
        if (contentEl) {
          const headings = Array.from(contentEl.querySelectorAll('h1, h2, h3'))
          const tocData = headings.map((heading, index) => {
            const id = heading.id || `heading-${index}`
            heading.id = id
            return {
              id,
              text: heading.textContent || '',
              level: parseInt(heading.tagName.substring(1))
            }
          })
          setToc(tocData)
        }
      }, 100)
    }
  }, [article, isEditing])

  const fetchArticle = async () => {
    try {
      const res = await api.get(`/api/v1/help-center/${id}`)
      setArticle(res.data.data)
      setEditTitle(res.data.data.title)
      setEditContent(res.data.data.content || '')
    } catch (e: any) {
      console.error(e)
      setArticle({
        id: 0,
        title: 'Không tìm thấy bài viết',
        content: 'Bài viết này không tồn tại hoặc đã bị xóa.',
        parent_id: null,
        sort_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 0
      })
    }
  }

  useEffect(() => {
    setIsEditing(false)
    if (id) {
      fetchArticle()
      fetchLogs()
    }
  }, [id])

  const handleSave = async () => {
    try {
      await api.put(`/api/v1/help-center/${id}`, {
        title: editTitle,
        content: editContent
      })
      toast.success("Đã lưu bài viết")
      setIsEditing(false)
      fetchArticle()
      fetchLogs()
      loadTree() // In case title changed
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return
    try {
      await api.delete(`/api/v1/help-center/${id}`)
      toast.success("Đã xóa bài viết")
      loadTree()
      nav('/hdsd')
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Lỗi khi xóa bài viết")
    }
  }


  // --- Image Upload Handler for Quill ---
  const imageHandler = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await api.post('/api/v1/help-center/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        const url = res.data.data.url

        // Insert URL into editor
        const quill = quillRef.current?.getEditor()
        if (quill) {
          const range = quill.getSelection(true)
          quill.insertEmbed(range.index, 'image', url)
          quill.setSelection(range.index + 1, 0)
        }
      } catch (e: any) {
        toast.error(e.response?.data?.message || "Lỗi tải ảnh lên")
      }
    }
  }

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [])

  if (!article) return <div className="p-4 text-muted">Đang tải...</div>

  const breadcrumbs = id ? findPath(tree, parseInt(id)) : []
  const textContent = article.content?.replace(/<[^>]*>?/gm, '') || ''
  const wordCount = textContent.split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="help-article-container">
      {isEditing && (
        <div className="help-article-toolbar">
          <div className="d-flex w-100 align-items-center">
            <input
              className="form-control"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder="Tiêu đề bài viết..."
            />
            <button className="btn btn-sm btn-primary text-nowrap ms-2" onClick={handleSave}>
              <i className="ti ti-device-floppy me-1" /> Lưu lại
            </button>
            <button className="btn btn-sm btn-light text-nowrap ms-2" onClick={() => {
              setIsEditing(false)
              setEditTitle(article.title)
              setEditContent(article.content || '')
            }}>
              <i className="ti ti-x me-1" /> Hủy
            </button>
          </div>
        </div>
      )}

      <div className="help-article-body">
        <div className="help-article-main" style={{ flex: 1, minWidth: 0 }}>
          {!isEditing && (
            <div className="help-article-header">
              <h1 className="help-article-title">{article.title}</h1>
              <div className="help-article-meta">
                <i className="ti ti-clock" /> {readingTime} min read
              </div>
            </div>
          )}

          {isEditing ? (
            <div className="help-editor-wrapper">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={editContent}
                onChange={setEditContent}
                modules={modules}
                style={{ height: '500px' }}
              />

              <div className="mt-4 pt-4 border-top">
                <h3 className="mb-3">Quản lý Slide Hướng Dẫn</h3>
                <div className="d-flex flex-column gap-3">
                  {article.slides?.map((slide: any, index: number) => (
                    <div key={slide.id} className="card p-3 d-flex flex-row gap-3 align-items-center">
                      <img src={slide.image_url} alt="" style={{ width: 150, height: 100, objectFit: 'cover', borderRadius: 4 }} />
                      <div className="flex-grow-1">
                        <input
                          className="form-control mb-2"
                          defaultValue={slide.caption}
                          placeholder="Nhập ghi chú cho ảnh này..."
                          onBlur={async (e) => {
                            if (e.target.value !== slide.caption) {
                              await api.put(`/api/v1/help-center/slides/${slide.id}`, { caption: e.target.value })
                              fetchArticle()
                              fetchLogs()
                            }
                          }}
                        />
                        <small className="text-muted">Slide #{index + 1}</small>
                      </div>
                      <button className="btn btn-outline-danger btn-sm" onClick={async () => {
                        if (confirm('Xóa slide này?')) {
                          await api.delete(`/api/v1/help-center/slides/${slide.id}`)
                          fetchArticle()
                          fetchLogs()
                        }
                      }}>
                        <i className="ti ti-trash" />
                      </button>
                    </div>
                  ))}

                  <div className="card p-4 border-dashed text-center cursor-pointer bg-light" onClick={() => {
                    const input = document.createElement('input')
                    input.setAttribute('type', 'file')
                    input.setAttribute('accept', 'image/*')
                    input.click()
                    input.onchange = async () => {
                      const file = input.files ? input.files[0] : null
                      if (!file) return
                      const formData = new FormData()
                      formData.append('file', file)
                      try {
                        const res1 = await api.post('/api/v1/help-center/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                        const url = res1.data.data.url
                        await api.post(`/api/v1/help-center/${id}/slides`, { image_url: url, caption: '', step_order: (article.slides?.length || 0) + 1 })
                        fetchArticle()
                        fetchLogs()
                        toast.success('Đã thêm slide')
                      } catch (e: any) {
                        toast.error("Lỗi upload slide")
                      }
                    }
                  }}>
                    <i className="ti ti-upload fs-2 mb-2 text-muted" />
                    <p className="mb-0 text-muted">Nhấn để Upload ảnh Slide mới</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="help-content-view" dangerouslySetInnerHTML={{ __html: (article.content || '').replace(/<p>(\s*|<br\s*\/?>|&nbsp;)*<\/p>/gi, '') }} />

              {article.slides && article.slides.length > 0 && (
                <div className="help-slide-gallery mt-5 pt-4 border-top">
                  <h2 className="mb-4 text-center">Hướng dẫn từng bước</h2>
                  <div className="slide-scroller">
                    {article.slides.map((slide: any, index: number) => (
                      <div key={slide.id} className="slide-item">
                        <div className="slide-image-wrapper">
                          <img src={slide.image_url} alt={`Step ${index + 1}`} loading="lazy" />
                          <span className="slide-badge">Bước {index + 1}</span>
                        </div>
                        {slide.caption && <div className="slide-caption">{slide.caption}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Thao tác khác & Lịch sử */}
              <div className="p-4 rounded d-flex flex-column gap-4" style={{ marginTop: '80px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                {canEdit && (
                  <div className="company-card info-section shadow-sm">
                    <div className="section-header orange">
                      <i className="ti ti-settings"></i>
                      <h3>Thao tác khác</h3>
                    </div>
                    <div className="section-body pt-3 pb-3">
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button type="button" className="btn outline" onClick={() => setIsEditing(true)} style={{ color: '#0ea5e9', borderColor: '#0ea5e9', background: '#fff' }}>
                          <i className="ti ti-edit me-1"></i> Sửa bài viết
                        </button>
                        <button type="button" className="btn outline" onClick={handleDelete} style={{ color: 'var(--red)', borderColor: 'var(--red)', background: '#fff' }}>
                          <i className="ti ti-trash me-1"></i> Xóa bài viết
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="company-card info-section shadow-sm mb-4">
                  <div className="section-header gray">
                    <i className="ti ti-history"></i>
                    <h3>Lịch sử chỉnh sửa (Audit Log)</h3>
                  </div>
                  <div className="section-body pt-3 pb-3">
                    {auditLogs.length === 0 ? (
                      <div className="text-muted text-center py-4">Chưa có lịch sử chỉnh sửa nào.</div>
                    ) : (
                      <div className="timeline" style={{ paddingLeft: '8px' }}>
                        {auditLogs.map((log, idx) => {
                          let parsedMsg = null;
                          try {
                            if (log.message && log.message.startsWith('{')) {
                              const data = JSON.parse(log.message);
                              parsedMsg = (
                                <div style={{ marginTop: '4px', fontSize: '13.5px', color: '#334155' }}>
                                  {Object.entries(data).map(([k, v]) => (
                                    <div key={k} style={{ marginBottom: '2px' }}>
                                      &bull; Đổi <b>{k}</b> thành <b>{String(v) || 'Trống'}</b>
                                    </div>
                                  ))}
                                </div>
                              );
                            } else if (log.message) {
                              parsedMsg = <div>{log.message}</div>;
                            }
                          } catch (e) {
                            parsedMsg = <div>{log.message}</div>;
                          }
                          return (
                            <div key={idx} className="timeline-item d-flex" style={{ marginBottom: '20px' }}>
                              <div className="timeline-icon" style={{ 
                                width: '32px', height: '32px', flexShrink: 0, borderRadius: '50%', 
                                background: '#e0e7ff', color: '#4f46e5', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginRight: '16px', fontWeight: 600, fontSize: '14px'
                              }}>
                                {log.by?.[0]?.toUpperCase() || 'S'}
                              </div>
                              <div className="timeline-content">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <strong style={{ color: '#1f2329' }}>{log.by}</strong>
                                  <span className="badge bg-light text-dark border">{log.action_label}</span>
                                  <span className="text-muted" style={{ fontSize: '13px' }}>
                                    {new Date(log.at).toLocaleString('vi-VN')}
                                  </span>
                                </div>
                                <div className="text-muted" style={{ fontSize: '14px' }}>
                                  {parsedMsg}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {!isEditing && toc.length > 0 && (
          <div className="help-article-toc" style={{ width: '260px', flexShrink: 0, marginLeft: 'auto' }}>
            <div style={{ position: 'sticky' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#1f2329', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trong bài viết này</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderLeft: '2px solid #f1f3f5' }}>
                {toc.map(item => (
                  <li key={item.id} style={{ marginBottom: '8px' }}>
                    <a href={`#${item.id}`} style={{
                      display: 'block',
                      color: '#646a73',
                      textDecoration: 'none',
                      fontSize: '14px',
                      paddingLeft: `${(item.level - 1) * 12 + 12}px`,
                      lineHeight: 1.5,
                      transition: 'all 0.2s',
                      marginLeft: '-2px',
                      borderLeft: '2px solid transparent'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#3370ff'; e.currentTarget.style.borderLeftColor = '#3370ff'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#646a73'; e.currentTarget.style.borderLeftColor = 'transparent'; }}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(item.id);
                        if (el) {
                          const y = el.getBoundingClientRect().top + window.scrollY - 80;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .help-article-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #fff;
        }
        .help-article-toolbar {
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          background: #fff;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .help-article-body {
          flex: 1;
          padding: 1rem 2rem 4rem 4rem;
          width: 100%;
          display: flex;
          gap: 32px;
        }
        .help-breadcrumbs {
          font-size: 14px;
          color: #646a73;
          margin-bottom: 24px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
        }
        .breadcrumb-link {
          color: #646a73;
          text-decoration: none;
        }
        .breadcrumb-link:hover {
          color: #3370ff;
        }
        .breadcrumb-separator {
          margin: 0 8px;
          color: #8f959e;
        }
        .breadcrumb-current {
          color: #1f2329;
          font-weight: 500;
        }
        .help-article-title {
          font-size: 32px;
          font-weight: 700;
          line-height: 1.4;
          color: #1f2329;
          text-align: left;
          margin: 0 !important;
          padding: 0 !important;
          display: none;
        }
        .help-article-meta {
          display: none !important;
        }
        .help-content-view {
          font-size: 15px;
          line-height: 1.6;
          color: #1f2329;
        }
        .help-content-view img {
          max-width: 100%;
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .help-content-view h1, .help-content-view h2, .help-content-view h3 {
          margin-top: 24px;
          margin-bottom: 8px;
          color: #1f2329;
          font-weight: 700;
        }
        .help-content-view h1:first-child {
          margin-top: 0;
        }
        .help-content-view h1 {
          font-size: 28px;
          border-bottom: 1px solid #dee0e3;
          padding-bottom: 8px;
        }
        .help-content-view h2 {
          font-size: 20px;
        }
        .help-content-view h3 {
          font-size: 16px;
          font-weight: 600;
        }
        .help-content-view p {
          margin: 0 0 10px 0;
          padding: 0;
        }
        .help-content-view p:empty,
        .help-content-view p:has(br:only-child) {
          display: none;
        }
        .help-content-view ul, .help-content-view ol {
          margin: 0 0 12px 0;
          padding-left: 24px;
        }
        .help-content-view li {
          margin-bottom: 6px;
        }
        .readTimeAndTag {
          margin-bottom: 24px;
        }
        .help-content-view li::marker {
          color: #0F766E;
          font-weight: bold;
        }
        .help-content-view strong {
          color: #1A4D6B;
          font-weight: 700;
        }
        .help-content-view table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        .help-content-view th, .help-content-view td {
          border: 1px solid #dee0e3;
          padding: 12px;
        }
        .help-content-view th {
          background: #0F766E;
          color: #ffffff;
          font-weight: 600;
          text-align: left;
        }
        .help-content-view tr:nth-child(even) {
          background: #f8f9fa;
        }
        .help-editor-wrapper {
          margin: 0;
          max-width: none;
        }
        .help-editor-wrapper .ql-toolbar {
          border-left: none;
          border-right: none;
          border-top: none;
          position: sticky;
          top: 65px;
          background: #fff;
          z-index: 9;
        }
        .help-editor-wrapper .ql-container {
          border: none;
          font-size: 16px;
        }
        .help-slide-gallery {
          margin-top: 40px;
        }
        .slide-scroller {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          gap: 20px;
          padding-bottom: 20px;
        }
        .slide-scroller::-webkit-scrollbar {
          height: 8px;
        }
        .slide-scroller::-webkit-scrollbar-track {
          background: #f1f3f5;
          border-radius: 4px;
        }
        .slide-scroller::-webkit-scrollbar-thumb {
          background: #c1c7d0;
          border-radius: 4px;
        }
        .slide-item {
          flex: 0 0 85%;
          scroll-snap-align: center;
          display: flex;
          flex-direction: column;
          background: #fff;
          border: 1px solid #dee0e3;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        @media (min-width: 768px) {
          .slide-item {
            flex: 0 0 70%;
          }
        }
        .slide-image-wrapper {
          position: relative;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 250px;
        }
        .slide-image-wrapper img {
          max-width: 100%;
          max-height: 500px;
          object-fit: contain;
          display: block;
        }
        .slide-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: #1A4D6B;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .slide-caption {
          padding: 16px 20px;
          font-size: 16px;
          color: #1f2329;
          border-top: 1px solid #dee0e3;
          background: #fafbfc;
        }
        .border-dashed {
          border: 2px dashed #dee0e3;
        }
      `}</style>
    </div>
  )
}
