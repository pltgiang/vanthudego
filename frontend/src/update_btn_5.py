import sys

# 1. Update App.tsx
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

if 'import JobPositionForm' not in app_content:
    app_content = app_content.replace(
        'import JobPositionList from \'./pages/JobPositionList\'',
        'import JobPositionList from \'./pages/JobPositionList\'\nimport JobPositionForm from \'./pages/JobPositionForm\''
    )

if 'path="job-positions/new"' not in app_content:
    app_content = app_content.replace(
        '<Route path="job-positions" element={<JobPositionList />} />',
        '<Route path="job-positions" element={<JobPositionList />} />\n            <Route path="job-positions/new" element={<JobPositionForm />} />\n            <Route path="job-positions/:id" element={<JobPositionForm />} />'
    )

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_content)

# 2. Update JobPositionList.tsx
with open('src/pages/JobPositionList.tsx', 'r', encoding='utf-8') as f:
    list_content = f.read()

# Add useNavigate
if 'import { useNavigate } from \'react-router-dom\'' not in list_content:
    list_content = list_content.replace(
        'import { createPortal } from \'react-dom\'',
        'import { createPortal } from \'react-dom\'\nimport { useNavigate } from \'react-router-dom\''
    )

# Remove view state and change handleAdd
list_content = list_content.replace(
    '  const [view, setView] = useState<\'list\' | \'add_position\' | \'edit_position\'>(\'list\')\n  const [editingPosition, setEditingPosition] = useState<any>(null)\n  const tabRef = useRef<any>(null)',
    '  const tabRef = useRef<any>(null)\n  const navigate = useNavigate()'
)

list_content = list_content.replace(
    '''  const handleAdd = () => {
    if (tab === 'position') {
      setEditingPosition({ id: 0, position_code: '', position_name: '', group_id: null, title_id: null, report_to_position_id: null, description: '', is_inactive: false, org_unit_ids: [] })
      setView('add_position')
    } else if (tabRef.current && tabRef.current.openAddForm) {
      tabRef.current.openAddForm()
    }
  }''',
    '''  const handleAdd = () => {
    if (tab === 'position') {
      navigate('/job-positions/new')
    } else if (tabRef.current && tabRef.current.openAddForm) {
      tabRef.current.openAddForm()
    }
  }'''
)

# Remove view render wrapper
list_content = list_content.replace(
    '''      {view !== 'list' && editingPosition && (
        <PositionFormPage 
          initial={editingPosition} 
          onClose={() => setView('list')} 
          onSuccess={() => { setView('list'); setTab('position'); /* Will trigger reload if we pass down state but we can just use key or rely on TabPositions */ }} 
        />
      )}
      {view === 'list' && (
      <>''',
    ''
)

list_content = list_content.replace(
    '      </>\n      )}\n    </div>\n  )\n}',
    '    </div>\n  )\n}'
)

list_content = list_content.replace(
    'onEdit={(item: any) => { setEditingPosition(item); setView(\'edit_position\') }}',
    'onEdit={(item: any) => navigate(\'/job-positions/\' + item.id)}'
)

# Remove PositionFormPage function
start_idx = list_content.find('function PositionFormPage')
if start_idx != -1:
    end_idx = list_content.find('function GroupFormModal', start_idx)
    list_content = list_content[:start_idx] + list_content[end_idx:]

with open('src/pages/JobPositionList.tsx', 'w', encoding='utf-8') as f:
    f.write(list_content)
