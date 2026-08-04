import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

interface HelpNode {
  id: number
  parent_id: number | null
  title: string
  sort_order: number
}

export default function HelpPortal() {
  const [roots, setRoots] = useState<HelpNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    const fetchRoots = async () => {
      try {
        const res = await api.get('/api/v1/help-center/tree')
        // Lọc ra các node gốc (parent_id === null)
        const allNodes: HelpNode[] = res.data.data
        const rootNodes = allNodes.filter(n => n.parent_id === null)
        setRoots(rootNodes)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRoots()
  }, [])

  const getIconForTitle = (title: string) => {
    const t = title.toLowerCase()
    if (t.includes('thu mua')) return 'ti-shopping-cart'
    if (t.includes('văn thư')) return 'ti-folder'
    return 'ti-book'
  }

  const getColorForTitle = (title: string) => {
    const t = title.toLowerCase()
    if (t.includes('thu mua')) return '#f59f00' // orange
    if (t.includes('văn thư')) return '#3370ff' // blue
    return '#0ea5e9'
  }

  return (
    <div className="help-portal" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', height: '60px', alignItems: 'center', padding: '0 24px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#1f2329' }}>
          <img src="/logo.svg" alt="DEGO" style={{ height: '32px', marginRight: '12px' }} />
          <span style={{ fontSize: '18px', fontWeight: 600 }}>Trung tâm Hỗ trợ</span>
        </Link>
      </header>

      <main style={{ flex: 1, padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#1f2329', marginBottom: '16px' }}>Xin chào, chúng tôi có thể giúp gì cho bạn?</h1>
          <p style={{ fontSize: '16px', color: '#646a73', maxWidth: '600px', margin: '0 auto' }}>
            Vui lòng chọn ứng dụng bạn đang sử dụng để xem các tài liệu hướng dẫn và quy trình tương ứng.
          </p>
        </div>

        {isLoading ? (
          <div className="text-muted">Đang tải dữ liệu...</div>
        ) : (
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1000px' }}>
            {roots.map(root => (
              <div 
                key={root.id}
                onClick={() => nav(`/hdsd/app/${root.id}`)}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '32px',
                  width: '320px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: `${getColorForTitle(root.title)}15`,
                  color: getColorForTitle(root.title),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  marginBottom: '20px'
                }}>
                  <i className={`ti ${getIconForTitle(root.title)}`} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2329', marginBottom: '12px' }}>
                  {root.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#646a73', margin: 0 }}>
                  Xem hướng dẫn chi tiết, quy trình thao tác và giải đáp thắc mắc liên quan đến {root.title}.
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <style>{`
        .help-portal, .help-portal * {
          font-family: "DM Sans", Inter, system-ui, Arial, sans-serif;
        }
      `}</style>
    </div>
  )
}
