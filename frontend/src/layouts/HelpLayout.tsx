import { useEffect, useState, useMemo } from 'react'
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { api } from '../api/client'

// --- Types ---
interface HelpNode {
  id: number
  parent_id: number | null
  title: string
  sort_order: number
  children?: HelpNode[]
}

// --- Helper: Build tree ---
function buildTree(nodes: HelpNode[]): HelpNode[] {
  const nodeMap = new Map<number, HelpNode>()
  nodes.forEach(n => nodeMap.set(n.id, { ...n, children: [] }))
  
  const tree: HelpNode[] = []
  nodeMap.forEach(n => {
    if (n.parent_id === null) {
      tree.push(n)
    } else {
      const parent = nodeMap.get(n.parent_id)
      if (parent) {
        parent.children!.push(n)
      } else {
        tree.push(n)
      }
    }
  })
  return tree
}

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

function TreeNode({ node, activeId, expanded, toggleExpand, level = 0, appId }: any) {
  const isFolder = node.children && node.children.length > 0
  const isExpanded = expanded.has(node.id)
  const isActive = activeId === node.id
  
  const marginLeft = level * 16

  if (isFolder) {
    return (
      <div className="hc_subMenu">
        <div className="hc_subMenu_title">
          <Link 
            to={`/hdsd/app/${appId}/${node.id}`} 
            className="hc_subMenu_titleContent" 
            style={{ marginLeft: `${marginLeft}px` }}
            onClick={(e) => {
              // Nếu click vào folder, vừa chuyển trang vừa expand
              if (!isExpanded) toggleExpand(node.id)
            }}
          >
            <div 
              className={`hc_subMenu_icon ${isExpanded ? 'hc_openSubMenu_icon' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleExpand(node.id)
              }}
            >
              <svg viewBox="0 0 1024 1024" fill="currentColor" width="12" height="12" className={isExpanded ? 'rotated' : ''} style={{ transition: 'transform 0.2s ease', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                <path d="M312.888889 142.222222l455.111111 369.777778-455.111111 369.777778V142.222222z"></path>
              </svg>
            </div>
            <div className="hc_subMenu_titleText">{node.title}</div>
          </Link>
        </div>
        {isExpanded && (
          <ul className="hc_subMenu_children">
            {node.children.map((child: any) => (
              <TreeNode key={child.id} node={child} activeId={activeId} expanded={expanded} toggleExpand={toggleExpand} level={level + 1} appId={appId} />
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <li className={`hc_menuitem ${isActive ? 'hc_active_menuitem' : ''}`}>
      <Link 
        to={`/hdsd/app/${appId}/${node.id}`} 
        className="hc_menuitem_title"
        style={{ marginLeft: `${marginLeft}px` }}
      >
        {/* Không dùng icon doc như trong ảnh để text thẳng hàng, hoặc spacer */}
        <div className="hc_menuitem_spacer" style={{ width: 24, flexShrink: 0 }}></div>
        <div className="hc_menuitem_content">{node.title}</div>
      </Link>
    </li>
  )
}

// --- Main Layout ---
export default function HelpLayout() {
  const { can } = useAuth()
  const loc = useLocation()
  const nav = useNavigate()
  const { appId, id } = useParams()
  const canEdit = can('setting', 'write')
  
  const [tree, setTree] = useState<HelpNode[]>([])
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  
  const activeId = id ? parseInt(id) : null

  const loadTree = async () => {
    try {
      const res = await api.get('/api/v1/help-center/tree')
      setTree(buildTree(res.data.data))
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadTree()
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true)
        try {
          const res = await api.get(`/api/v1/help-center/search?q=${encodeURIComponent(searchQuery.trim())}`)
          setSearchResults(res.data.data)
          setShowDropdown(true)
        } catch(e) {
          console.error(e)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowDropdown(false)
      }
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCreateRoot = async () => {
    const title = prompt("Nhập tiêu đề thư mục/bài viết mới:")
    if (!title) return
    try {
      const res = await api.post('/api/v1/help-center', {
        title,
        parent_id: appId ? parseInt(appId) : null,
        sort_order: tree.length
      })
      await loadTree()
      nav(`/hdsd/app/${appId}/${res.data.data.id}`)
    } catch (e) {
      console.error(e)
    }
  }

  const breadcrumbs = activeId ? findPath(tree, activeId) : (appId ? findPath(tree, parseInt(appId)) : [])
  const rootNode = appId ? tree.find(n => n.id === parseInt(appId)) : null
  const displayNodes = rootNode ? (rootNode.children || []) : []

  return (
    <div className="app">
      {isSidebarOpen && (
        <aside className="sidebar" style={{ flex: '0 0 320px', width: 320, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0' }}>
          <div className="brand" style={{ padding: '16px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', borderBottom: '1px solid #e2e8f0', position: 'relative' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/logo.svg" alt="DEGO" style={{ height: '32px', width: 'auto' }} />
            </Link>
            {canEdit && (
              <div style={{ position: 'absolute', right: '16px', display: 'flex', gap: '4px' }}>
                {activeId && (
                  <button className="btn-icon" onClick={async () => {
                    const title = prompt("Nhập tiêu đề thư mục/bài viết con mới:")
                    if (!title) return
                    try {
                      const res = await api.post('/api/v1/help-center', {
                        title,
                        parent_id: activeId,
                        sort_order: 0
                      })
                      await loadTree()
                      nav(`/hdsd/app/${appId}/${res.data.data.id}`)
                    } catch (e) {
                      console.error(e)
                    }
                  }} title="Thêm bài con" style={{ padding: 4 }}>
                    <i className="ti ti-file-plus" style={{ fontSize: 16 }} />
                  </button>
                )}
                <button className="btn-icon" onClick={handleCreateRoot} title="Thêm mục gốc" style={{ padding: 4 }}>
                  <i className="ti ti-folder-plus" style={{ fontSize: 16 }} />
                </button>
              </div>
            )}
          </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '8px' }}>
          <ul className="hc_menu_root" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {displayNodes.map(node => (
              <TreeNode 
                key={node.id} 
                node={node} 
                activeId={activeId} 
                expanded={expanded} 
                toggleExpand={toggleExpand} 
                appId={appId}
              />
            ))}
          </ul>
          {displayNodes.length === 0 && (
            <div style={{ padding: '1rem', color: '#868e96', fontSize: '0.9rem', textAlign: 'center' }}>
              Chưa có nội dung
            </div>
          )}
        </div>
      </aside>
      )}
      <main style={{ flex: 1, overflowY: 'auto', background: '#fff', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', height: '56px', flexShrink: 0, alignItems: 'center', padding: '0 16px', borderBottom: '1px solid #e2e8f0', background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="btn-icon" style={{ width: '28px', height: '28px' }} title="Toggle Sidebar">
            <i className="ti ti-layout-sidebar" style={{ fontSize: '20px' }} />
          </button>
          <div style={{ width: '1px', height: '16px', backgroundColor: '#e2e8f0', margin: '0 12px' }}></div>
          <nav aria-label="breadcrumb">
            <ol style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#64748b', listStyle: 'none', padding: 0, margin: 0 }}>
              <li><Link to="/hdsd" style={{ color: 'inherit', textDecoration: 'none' }}>Trung tâm hỗ trợ</Link></li>
              {breadcrumbs && breadcrumbs.map((b, i) => (
                <span key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <li><i className="ti ti-chevron-right" style={{ fontSize: '12px' }} /></li>
                  <li>
                    {i === breadcrumbs.length - 1 ? (
                      <span style={{ color: '#0f172a' }}>{b.title}</span>
                    ) : (
                      <Link to={`/hdsd/app/${appId}/${b.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{b.title}</Link>
                    )}
                  </li>
                </span>
              ))}
            </ol>
          </nav>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '6px', padding: '4px 12px', width: '240px' }}>
                <i className="ti ti-search" style={{ color: '#64748b', fontSize: '14px', marginRight: '8px' }}></i>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm tài liệu..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if(searchQuery.trim()) setShowDropdown(true) }}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%' }}
                />
              </div>
              {showDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: '#fff', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 50, maxHeight: '300px', overflowY: 'auto' }}>
                  {isSearching ? (
                    <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Đang tìm...</div>
                  ) : searchResults.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {searchResults.map(item => (
                        <li key={item.id}>
                          <Link 
                            to={`/hdsd/app/${appId}/${item.id}`} 
                            style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: '#0f172a', fontSize: '13px', borderBottom: '1px solid #f1f5f9' }}
                            onClick={() => { setShowDropdown(false); setSearchQuery(''); }}
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Không tìm thấy tài liệu</div>
                  )}
                </div>
              )}
            </div>

            <div className="topbar-right" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <button className="btn-icon" aria-label="Thông báo" style={{ position: 'relative', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
                  <i className="ti ti-bell" style={{ fontSize: '18px', color: '#64748b' }}></i>
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '12px' }}>
                <span className="avatar" style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#0ea5e9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: '600' }}>A</span>
                <span className="user-name" style={{ fontSize: '13px', whiteSpace: 'nowrap', fontWeight: 500, color: '#334155' }}>admin@example.com</span>
                <i className="ti ti-chevron-down" style={{ fontSize: '12px', color: 'rgb(102, 102, 102)', flexShrink: 0 }}></i>
              </div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!id ? (
          <div style={{ padding: '2rem 4rem 4rem 4rem', maxWidth: 900, margin: '0 auto', width: '100%', color: '#1f2329' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 700, lineHeight: 1.4, marginBottom: '24px', borderBottom: '1px solid #eaecef', paddingBottom: '16px', marginTop: '24px' }}>
              {rootNode ? rootNode.title : 'Trung tâm Hướng dẫn Sử dụng'}
            </h1>
            <div style={{ fontSize: '16px', lineHeight: 1.7 }}>
              <p style={{ marginBottom: '16px' }}>
                Chào mừng bạn đến với hệ thống Hướng dẫn sử dụng. Tại đây cung cấp toàn bộ tài liệu, quy trình và giải đáp thắc mắc để bạn có thể thao tác dễ dàng trên nền tảng.
              </p>
              
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px' }}>Cách tra cứu tài liệu</h3>
              <ul style={{ paddingLeft: '24px', marginBottom: '24px' }}>
                <li style={{ marginBottom: '8px' }}><strong>Duyệt theo Vai trò:</strong> Ở thanh menu bên trái, các tài liệu đã được phân nhóm chuẩn theo từng vai trò nghiệp vụ (Nhân viên mua hàng, Trưởng phòng, v.v.). Hãy chọn đúng vai trò của bạn để xem nội dung liên quan nhất.</li>
                <li style={{ marginBottom: '8px' }}><strong>Mở rộng thư mục:</strong> Nhấp vào biểu tượng thư mục để xem các bài viết chi tiết bên trong từng chức năng.</li>
                <li style={{ marginBottom: '8px' }}><strong>Theo dõi cập nhật:</strong> Các quy trình mới hoặc tính năng mới sẽ được cập nhật liên tục vào hệ thống này.</li>
              </ul>

              <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '20px', border: '1px solid #dee0e3', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <i className="ti ti-bulb text-warning" style={{ fontSize: '24px' }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px', fontSize: '16px' }}>Bắt đầu ngay</strong>
                  <span style={{ color: '#646a73' }}>Hãy chọn một bài viết bất kỳ ở cột bên trái để bắt đầu khám phá hệ thống.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Outlet context={{ loadTree, canEdit, tree }} />
        )}
        </div>
      </main>
      <style>{`
        .app, .help-article-container, .help-content-view, h1, h2, h3, h4, p, span, div, a, li, ul, ol, button, input {
          font-family: "DM Sans", Inter, system-ui, Arial, sans-serif;
        }
        .btn-icon {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #adb5bd;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .btn-icon:hover {
          background: #f1f3f5;
          color: #495057;
        }
        .btn-icon:hover {
          background: #f1f3f5;
          color: #495057;
        }

        /* --- Lark Wiki Left Menu Styles --- */
        .hc_menu_root, .hc_subMenu_children {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .hc_subMenu_title {
          margin-bottom: 2px;
        }
        
        .hc_subMenu_titleContent, .hc_menuitem_title {
          display: flex;
          align-items: center;
          padding: 6px 8px;
          border-radius: 6px;
          color: #1f2329;
          text-decoration: none;
          font-size: 14px;
          line-height: 1.5;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .hc_subMenu_titleContent:hover, .hc_menuitem_title:hover {
          background-color: rgba(31, 35, 41, 0.08);
        }
        
        .hc_subMenu_icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          color: #8f959e;
          flex-shrink: 0;
          cursor: pointer;
          border-radius: 4px;
        }
        
        .hc_subMenu_icon:hover {
          background-color: rgba(31, 35, 41, 0.1);
        }
        
        .hc_subMenu_titleText, .hc_menuitem_content {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .hc_menuitem {
          margin-bottom: 2px;
        }
        
        .hc_active_menuitem .hc_menuitem_title {
          background-color: #e8f3ff;
          color: #3370ff;
          font-weight: 500;
        }
        
        .hc_active_menuitem .hc_menuitem_title:hover {
          background-color: #e8f3ff;
        }
      `}</style>
    </div>
  )
}
