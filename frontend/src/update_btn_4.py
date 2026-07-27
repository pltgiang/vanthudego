import sys

def rewrite():
    file_path = r"d:\01.Soft\pltgiang\Công cụ văn thư\dms-tool\frontend\src\pages\JobPositionList.tsx"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Add createPortal import
    content = content.replace(
        "import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'",
        "import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'\nimport { createPortal } from 'react-dom'"
    )

    # 2. Modify JobPositionList component to handle full page view
    content = content.replace(
        "  const [tab, setTab] = useState<'position' | 'group' | 'title'>('position')",
        "  const [tab, setTab] = useState<'position' | 'group' | 'title'>('position')\n  const [view, setView] = useState<'list' | 'add_position' | 'edit_position'>('list')\n  const [editingPosition, setEditingPosition] = useState<any>(null)"
    )

    content = content.replace(
        """  const handleAdd = () => {
    if (tabRef.current && tabRef.current.openAddForm) {
      tabRef.current.openAddForm()
    }
  }""",
        """  const handleAdd = () => {
    if (tab === 'position') {
      setEditingPosition({ id: 0, position_code: '', position_name: '', group_id: null, title_id: null, report_to_position_id: null, description: '', is_inactive: false, org_unit_ids: [] })
      setView('add_position')
    } else if (tabRef.current && tabRef.current.openAddForm) {
      tabRef.current.openAddForm()
    }
  }"""
    )

    content = content.replace(
        """    <div className="company-info-page h-100 dis-flex dis-flex-column" style={{ padding: 0, background: '#f1f5f9' }}>
      <div className="topbar px-34 py-12 dis-flex align-items-center justify-content-between" style={{ backgroundColor: '#fff', borderRadius: 0, borderBottom: '1px solid #e2e8f0' }}>""",
        """    <div className="company-info-page h-100 dis-flex dis-flex-column" style={{ padding: 0, background: '#f1f5f9' }}>
      {view !== 'list' && editingPosition && (
        <PositionFormPage 
          initial={editingPosition} 
          onClose={() => setView('list')} 
          onSuccess={() => { setView('list'); setTab('position'); /* Will trigger reload if we pass down state but we can just use key or rely on TabPositions */ }} 
        />
      )}
      {view === 'list' && (
      <>
      <div className="topbar px-34 py-12 dis-flex align-items-center justify-content-between" style={{ backgroundColor: '#fff', borderRadius: 0, borderBottom: '1px solid #e2e8f0' }}>"""
    )

    # close the {view === 'list' && (<> ... </>)}
    content = content.replace(
        "      </div>\n    </div>\n  )\n}\n\nconst TabPositions",
        "      </div>\n      </>\n      )}\n    </div>\n  )\n}\n\nconst TabPositions"
    )

    # 3. Inside TabPositions, remove formOpen state logic for positions (we do it in parent)
    content = content.replace(
        "const [formOpen, setFormOpen] = useState(false)\n  const [editing, setEditing] = useState<any>(null)",
        "// form state moved to parent"
    )
    
    # Wait, TabPositions has useImperativeHandle which we don't need for 'position' anymore, but keeping it empty is fine, or we just pass it to parent.
    # We need to change the edit button in TabPositions to call a prop `onEdit`.
    content = content.replace(
        "const TabPositions = forwardRef(({ can }: any, ref) => {",
        "const TabPositions = forwardRef(({ can, onEdit }: any, ref) => {"
    )
    content = content.replace(
        "<TabPositions ref={tabRef} can={can} />",
        "<TabPositions ref={tabRef} can={can} onEdit={(item: any) => { setEditingPosition(item); setView('edit_position') }} />"
    )
    content = content.replace(
        "setEditing(item); setFormOpen(true)",
        "if (onEdit) onEdit(item)"
    )

    # 4. Remove PositionFormModal invocation from TabPositions
    content = content.replace(
        """      {formOpen && editing && (
        <PositionFormModal 
          initial={editing}
          onClose={() => setFormOpen(false)}
          onSuccess={() => { setFormOpen(false); loadData() }}
        />
      )}""",
        ""
    )

    # 5. Replace PositionFormModal with PositionFormPage
    old_position_form = content[content.find("function PositionFormModal("):content.find("function GroupFormModal(")]
    new_position_form = """function PositionFormPage({ initial, onClose, onSuccess }: any) {
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [groups, setGroups] = useState<any[]>([])
  const [titles, setTitles] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])
  const [orgUnits, setOrgUnits] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/system/position-groups'),
      api.get('/api/v1/system/job-titles'),
      api.get('/api/v1/system/job-positions'),
      api.get('/api/v1/system/org-units')
    ]).then(([rg, rt, rp, ro]) => {
      setGroups(rg.data.data || [])
      setTitles(rt.data.data || [])
      setPositions((rp.data.data || []).filter((p: any) => p.id !== form.id))
      setOrgUnits(ro.data.data || [])
    })
  }, [form.id])

  const handleChange = (k: string, v: any) => setForm((prev: any) => ({ ...prev, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!form.position_code || !form.position_name) {
      toast.error('Vui lòng nhập đầy đủ mã và tên vị trí')
      return
    }
    setLoading(true)
    try {
      if (form.id) await api.put(`/api/v1/system/job-positions/${form.id}`, form)
      else await api.post('/api/v1/system/job-positions', form)
      toast.success('Lưu thành công')
      onSuccess()
    } catch (err: any) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const orgOptions = orgUnits.map((u: any) => ({ value: u.id, label: u.unit_code + ' - ' + u.unit_name }))

  return (
    <div className="company-info-page h-100 flex1">
      <div className="topbar dis-flex align-items-center" style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
        <h2 className="page-title mb-0 flex1" style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
          {form.id ? 'Sửa vị trí công việc' : 'Thêm mới Vị trí công việc'}
        </h2>
        <div className="actions dis-flex">
          <button type="button" className="btn ghost" onClick={onClose} disabled={loading} style={{ background: '#f1f5f9', color: '#475569', border: 'none' }}>Hủy</button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={loading}>Lưu / Thực hiện</button>
        </div>
      </div>

      <div className="content scrollable company-blocks-layout" style={{ backgroundColor: '#f1f5f9', padding: '24px 34px' }}>
        <div className="company-blocks-grid">
          
          <div className="company-card info-section">
            <div className="section-header blue">
              <i className="ti ti-file-description"></i>
              <h3>Thông tin chung</h3>
            </div>
            <div className="section-body grid-2">
              <div className="field col-span-2">
                <label>Mã vị trí <span className="req">*</span></label>
                <input type="text" className="form-control" required value={form.position_code} onChange={e => handleChange('position_code', e.target.value)} />
              </div>
              <div className="field col-span-2">
                <label>Tên vị trí <span className="req">*</span></label>
                <input type="text" className="form-control" required value={form.position_name} onChange={e => handleChange('position_name', e.target.value)} />
              </div>
              <div className="field col-span-2">
                <label>Nhóm vị trí</label>
                <select className="form-control" value={form.group_id || ''} onChange={e => handleChange('group_id', e.target.value ? parseInt(e.target.value) : null)}>
                  <option value="">- Chọn nhóm -</option>
                  {groups.map((g: any) => <option key={g.id} value={g.id}>{g.group_name}</option>)}
                </select>
              </div>
              <div className="field col-span-2">
                <label>Chức danh</label>
                <select className="form-control" value={form.title_id || ''} onChange={e => handleChange('title_id', e.target.value ? parseInt(e.target.value) : null)}>
                  <option value="">- Chọn chức danh -</option>
                  {titles.map((t: any) => <option key={t.id} value={t.id}>{t.title_name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="company-card info-section">
            <div className="section-header green">
              <i className="ti ti-sitemap"></i>
              <h3>Phân công & Tổ chức</h3>
            </div>
            <div className="section-body grid-2">
              <div className="field col-span-2">
                <label>Báo cáo cho (Vị trí quản lý)</label>
                <select className="form-control" value={form.report_to_position_id || ''} onChange={e => handleChange('report_to_position_id', e.target.value ? parseInt(e.target.value) : null)}>
                  <option value="">- Không có -</option>
                  {positions.map((p: any) => <option key={p.id} value={p.id}>{p.position_code} - {p.position_name}</option>)}
                </select>
              </div>
              <div className="field col-span-2">
                <label>Đơn vị công tác</label>
                <MultiSelect 
                  options={orgOptions}
                  value={form.org_unit_ids || []}
                  onChange={v => handleChange('org_unit_ids', v)}
                  placeholder="Chọn đơn vị (có thể chọn nhiều)"
                />
              </div>
            </div>
          </div>

          <div className="company-card info-section" style={{ gridColumn: '1 / -1' }}>
            <div className="section-header orange">
              <i className="ti ti-settings"></i>
              <h3>Thông tin khác</h3>
            </div>
            <div className="section-body grid-2">
              <div className="field col-span-2">
                <label>Mô tả</label>
                <textarea className="form-control" rows={3} value={form.description || ''} onChange={e => handleChange('description', e.target.value)} />
              </div>
              <div className="field col-span-2">
                <label className="dis-flex align-items-center gap-8 cursor-pointer mt-8">
                  <input type="checkbox" checked={form.is_inactive} onChange={e => handleChange('is_inactive', e.target.checked)} style={{ width: 'auto' }} />
                  <span className="font-medium" style={{ fontSize: 14, color: '#475569', fontWeight: 600 }}>Ngừng theo dõi</span>
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

"""
    content = content.replace(old_position_form, new_position_form)

    # 6. Wrap GroupFormModal in createPortal
    content = content.replace(
        "    <div className=\"modal-backdrop\">",
        "    createPortal(<div className=\"modal-backdrop\">"
    )
    # The first two replacements for modal-backdrop are in GroupFormModal and TitleFormModal
    # But wait, createPortal needs `document.body`
    # GroupFormModal replacement
    content = content.replace(
        """      </div>
    </div>
  )
}

function TitleFormModal""",
        """      </div>
    </div>, document.body)
  )
}

function TitleFormModal"""
    )

    # TitleFormModal replacement
    content = content.replace(
        """      </div>
    </div>
  )
}""",
        """      </div>
    </div>, document.body)
  )
}"""
    )
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

rewrite()
