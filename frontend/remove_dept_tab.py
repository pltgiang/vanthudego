import sys

with open('src/pages/JobPositionList.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Tabs State
content = content.replace(
    "const [tab, setTab] = useState<'position' | 'department' | 'title'>('position')",
    "const [tab, setTab] = useState<'position' | 'title'>('position')"
)

# 2. Remove Tab UI
content = content.replace(
    "<div className={`folder-tab ${tab === 'department' ? 'active' : ''}`} onClick={() => setTab('department')}>Phòng ban</div>\n",
    ""
)

# 3. Remove conditional render
content = content.replace(
    "{tab === 'department' && <TabDepartments ref={tabRef} can={can} />}\n",
    ""
)

# 4. Remove TabDepartments and DepartmentFormModal
idx1 = content.find("const TabDepartments = forwardRef(")
idx2 = content.find("function DepartmentFormModal(")
if idx1 != -1:
    content = content[:idx1]

with open('src/pages/JobPositionList.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
