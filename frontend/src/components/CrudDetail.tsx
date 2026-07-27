import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { askConfirm } from './confirm'
import { fmtDateTime } from '../utils/datetime'
import { useAuth } from '../auth/AuthContext'
import { cruds } from '../config/cruds'
import SearchSelect from './SearchSelect'
import NotFound from './NotFound'

export default function CrudDetail() {
  const { entity, id } = useParams()
  const cfg = cruds[entity || '']
  const { can } = useAuth()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [form, setForm] = useState<any>({})
  const [logs, setLogs] = useState<any[]>([])
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [dynOpts, setDynOpts] = useState<Record<string, { value: string; label: string }[]>>({})
  const [pwOpen, setPwOpen] = useState(false)
  const [pw1, setPw1] = useState(''); const [pw2, setPw2] = useState('')

  async function loadLogs() {
    if (isNew || !cfg) return
    const r = await api.get('/api/audit-logs', { params: { entity: cfg.entity, entity_id: id } })
    setLogs(r.data.data)
  }

  useEffect(() => {
    if (!cfg) return
    cfg.fields.filter(f => f.source).forEach(f => {
      api.get(f.source!.url, { params: { page_size: 1000 } }).then(r => {
        const vk = f.source!.value || 'code'
        const lk = f.source!.label || 'name'
        const data = r.data.data
        const items = Array.isArray(data) ? data : (data.items || [])
        const opts = items.map((it: any) => ({
          value: String(it[vk] ?? ''), label: String(it[lk] ?? it[vk] ?? ''),
        })).filter((o: any) => o.value)
        setDynOpts(s => ({ ...s, [f.key]: opts }))
      }).catch(() => {})
    })
  }, [cfg?.slug])

  useEffect(() => {
    if (!cfg) return
    setErr(''); setMsg(''); setNotFound(false)
    if (isNew) {
      const init: any = {}
      cfg.fields.forEach((f) => {
        if (f.type === 'boolean-group') {
          (f.options || []).forEach((o: any) => {
            init[o.value] = o.default !== undefined ? o.default : false
          })
        } else if ((f as any).default !== undefined) {
          init[f.key] = (f as any).default
        } else if (f.key === 'is_active') {
          init[f.key] = f.type === 'checkbox' ? true : 'true'
        } else {
          init[f.key] = f.type === 'checkbox' ? true : f.type === 'number' ? 0 : ''
        }
      })
      setForm(init); setLogs([])
    } else {
      api.get(`${cfg.apiPath}/${id}`).then((r) => setForm(r.data.data))
        .catch((ex) => { if ([403, 404].includes(ex?.response?.status)) setNotFound(true) })
      loadLogs()
    }
  }, [cfg?.slug, id])

  if (!cfg) return <div>Không tìm thấy trang.</div>
  if (notFound) return <NotFound backTo={`/${cfg.slug}`} message={`Không tìm thấy ${cfg.title.toLowerCase()} này hoặc bạn không có quyền truy cập.`} />

  // Danh mục chỉ dành cho người QUẢN LÝ (write/create/delete); read chỉ để đổ dropdown.
  const canManage = can(cfg.entity, 'write') || can(cfg.entity, 'create') || can(cfg.entity, 'delete')
  if (!canManage) return (
    <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
      <i className="ti ti-lock" style={{ fontSize: 34, color: '#cbd5e1' }} />
      <div style={{ marginTop: 12, fontSize: 15, color: 'var(--navy)', fontWeight: 600 }}>Không có quyền quản lý danh mục này</div>
      <button className="btn" style={{ marginTop: 16 }} onClick={() => navigate('/')}><i className="ti ti-home" />Về Trang chủ</button>
    </div>
  )

  const set = (k: string, v: any) => setForm((s: any) => ({ ...s, [k]: v }))
  const canSave = isNew ? can(cfg.entity, 'create') : can(cfg.entity, 'write')

  async function save() {
    setErr(''); setMsg('')
    try {
      if (isNew) {
        const r = await api.post(cfg.apiPath, form)
        navigate(`/${cfg.slug}/${r.data.data.id}`)
      } else {
        await api.patch(`${cfg.apiPath}/${id}`, form)
        setMsg('Đã lưu'); loadLogs()
      }
    } catch (ex: any) { setErr(ex?.response?.data?.error?.message || 'Lỗi khi lưu') }
  }

  async function remove() {
    if (!(await askConfirm({ message: 'Xóa bản ghi này?' }))) return
    try { await api.delete(`${cfg.apiPath}/${id}`); navigate(`/${cfg.slug}`) }
    catch (ex: any) { setErr(ex?.response?.data?.error?.message || 'Lỗi khi xóa') }
  }

  const isSettingsEntity = ['doc-types', 'secrecy-levels', 'urgency-levels', 'partners'].includes(cfg.slug)
  const handleBack = () => {
    if (isSettingsEntity) {
      navigate('/document-settings')
    } else {
      navigate(`/${cfg.slug}`)
    }
  }

  return (
    <div className="company-info-page h-100 dis-flex dis-flex-column" style={{ background: '#f1f5f9' }}>
      {/* TOPBAR */}
      <div className="topbar dis-flex align-items-center" style={{ padding: '16px 34px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="page-title mb-0 flex1 dis-flex align-items-center gap-12">
          <button className="btn ghost icon-btn" onClick={handleBack} style={{ padding: '0 8px' }}>
            <i className="ti ti-arrow-left"></i>
          </button>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
            {isNew ? `Thêm mới ${cfg.title.toLowerCase()}` : `Cập nhật ${cfg.title.toLowerCase()}`}
          </span>
        </div>
        <div className="actions dis-flex gap-10">
          <button className="btn ghost" onClick={handleBack}>Hủy bỏ</button>
          {canSave && (
            <button className="btn btn-primary" style={{ background: '#00aeef', borderColor: '#00aeef' }} onClick={save}>
              {isNew ? 'Lưu' : 'Cập nhật'}
            </button>
          )}
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
            {cfg.fields.map((f) => {
              const ro = (!isNew && f.readonlyOnEdit) || !canSave   // không có quyền lưu → khóa field
              return (
                <div key={f.key} className={`field ${f.type === 'textarea' ? 'col-span-2' : ''}`}>
                  <label>{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea className="form-control" value={form[f.key] ?? ''} disabled={ro} onChange={(e) => set(f.key, e.target.value)} />
                  ) : (f.type === 'select' || (f.source && f.type !== 'select-multiple')) ? (
                    <SearchSelect value={form[f.key] ?? ''} disabled={ro} placeholder="Chọn…"
                      colorMap={f.colorMap}
                      options={(f.options || dynOpts[f.key] || [])}
                      onChange={(v) => {
                        set(f.key, v);
                        if (f.onValueChange) f.onValueChange(v, form, (k: string, val: any) => setForm((s: any) => ({ ...s, [k]: val })));
                      }} />
                  ) : f.type === 'select-multiple' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                      {(f.options || dynOpts[f.key] || []).map((o) => {
                        const checked = Array.isArray(form[f.key]) && form[f.key].includes(Number(o.value))
                        return (
                          <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'normal' }}>
                            <input type="checkbox" className="react-checkbox" checked={checked} disabled={ro} onChange={(e) => {
                              const curr = Array.isArray(form[f.key]) ? [...form[f.key]] : []
                              if (e.target.checked) curr.push(Number(o.value))
                              else {
                                const idx = curr.indexOf(Number(o.value))
                                if (idx > -1) curr.splice(idx, 1)
                              }
                              set(f.key, curr)
                            }} /> {o.label}
                          </label>
                        )
                      })}
                    </div>
                  ) : f.type === 'checkbox' ? (
                    <div style={{ marginTop: 8 }}>
                      <input type="checkbox" className="react-checkbox" checked={!!form[f.key]} disabled={ro} onChange={(e) => set(f.key, e.target.checked)} />
                    </div>
                  ) : f.type === 'boolean-group' ? (
                    <div className="dis-flex gap-12">
                      {(f.options || []).map((o: any) => {
                         const checked = !!form[o.value]
                         return (
                           <button type="button" key={o.value}
                             className="btn" 
                             style={{ 
                               border: checked ? '1px solid #00aeef' : '1px solid rgb(203, 213, 225)', 
                               color: checked ? '#00aeef' : 'rgb(100, 116, 139)', 
                               backgroundColor: checked ? '#f0f9ff' : 'transparent', 
                               borderRadius: 6, fontWeight: 500, height: 40, padding: '0px 16px' 
                             }}
                             onClick={() => !ro && set(o.value, !checked)}
                           >
                             {o.label}
                           </button>
                         )
                      })}
                    </div>
                  ) : (
                    <input className="form-control" type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                           value={f.zeroAsBlank && form[f.key] === 0 ? '' : (form[f.key] ?? '')} disabled={ro}
                           onChange={(e) => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)} />
                  )}
                </div>
              )
            })}
          </div>
          {err && <div className="err" style={{ marginTop: 12 }}>{err}</div>}
          {msg && <div style={{ color: 'var(--green)', marginTop: 12, fontSize: 13, fontWeight: 500 }}>{msg}</div>}
        </div>

        {/* NÚT THAO TÁC KHÁC */}
        {!isNew && (cfg.slug === 'employees' || can(cfg.entity, 'delete')) && (
          <div className="company-card info-section">
            <div className="section-header orange">
              <i className="ti ti-settings"></i>
              <h3>Thao tác khác</h3>
            </div>
            <div className="section-body">
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {!isNew && cfg.slug === 'employees' && can(cfg.entity, 'write') && (
                  <button className="btn outline" style={{ color: 'var(--teal)', borderColor: 'var(--teal)', background: '#fff' }}
                    onClick={() => { setPwOpen((o) => !o); setErr(''); setMsg('') }}>
                    <i className="ti ti-key" /> Đặt lại mật khẩu
                  </button>
                )}
                {!isNew && cfg.slug === 'employees' && can('user', 'read') && (
                  <button className="btn outline" style={{ color: 'var(--blue)', borderColor: 'var(--blue)', background: '#fff' }} onClick={async () => {
                    setErr('')
                    try {
                      const r = await api.get('/api/users', { params: { employee_id: id, page_size: 1 } })
                      const u = (r.data.data.items || [])[0]
                      if (u) navigate(`/users/${u.id}`); else setErr('Nhân sự này chưa có tài khoản — bấm "Đặt lại mật khẩu" để tạo tài khoản đăng nhập trước.')
                    } catch { setErr('Không mở được phân quyền') }
                  }}>
                    <i className="ti ti-shield" /> Phân quyền tài khoản
                  </button>
                )}

                {!isNew && can(cfg.entity, 'delete') && (
                  <button className="btn outline" style={{ color: 'var(--red)', borderColor: 'var(--red)', background: '#fff' }} onClick={remove}>
                    <i className="ti ti-trash" /> Xóa bản ghi
                  </button>
                )}
              </div>

              {/* Ô đặt lại mật khẩu trực tiếp (pass1/pass2) */}
              {pwOpen && !isNew && cfg.slug === 'employees' && (
                <div style={{ marginTop: 16, padding: 16, border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>Đặt lại mật khẩu tài khoản</div>
                  <div className="grid-2" style={{ gap: 16 }}>
                    <div className="field"><label>Mật khẩu mới</label><input type="password" placeholder="Nhập mật khẩu..." className="form-control" autoComplete="new-password" value={pw1} onChange={(e) => setPw1(e.target.value)} /></div>
                    <div className="field"><label>Nhập lại mật khẩu</label><input type="password" placeholder="Nhập lại mật khẩu..." className="form-control" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button className="btn btn-primary" onClick={async () => {
                      setErr(''); setMsg('')
                      if (pw1.length < 4) { setErr('Mật khẩu tối thiểu 4 ký tự'); return }
                      if (pw1 !== pw2) { setErr('Hai mật khẩu không khớp'); return }
                      try { await api.post(`/api/employees/${id}/set-password`, { password: pw1 }); setMsg('Đã đặt lại mật khẩu'); setPw1(''); setPw2(''); setPwOpen(false) }
                      catch (ex: any) { setErr(ex?.response?.data?.error?.message || 'Lỗi đặt lại mật khẩu') }
                    }}><i className="ti ti-check" />Xác nhận</button>
                    <button className="btn ghost" onClick={() => { setPwOpen(false); setPw1(''); setPw2('') }}>Hủy</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!isNew && (
         <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {cfg.detailExtra && (
            <div className="company-card info-section">
              <div className="section-header purple">
                <i className="ti ti-users"></i>
                <h3>Thông tin bổ sung</h3>
              </div>
              <div className="section-body">
                {cfg.detailExtra(form)}
              </div>
            </div>
          )}
          <div className="company-card info-section">
            <div className="section-header green">
              <i className="ti ti-history"></i>
              <h3>Lịch sử thao tác</h3>
            </div>
            <div className="section-body">
              {logs.length === 0 && <div style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>Chưa có lịch sử thao tác nào.</div>}
              <div className="timeline">
                {logs.map((l, i) => (
                  <div key={i} className="tl-item">
                    <span className={'tl-dot ' + l.action} />
                    <div>
                      <div style={{ fontSize: 14 }}><b>{l.by}</b> — {l.action_label}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{fmtDateTime(l.at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
         </div>
        )}
      </div>
    </div>
  )
}
